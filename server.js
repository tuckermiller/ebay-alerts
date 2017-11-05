const bcrypt = require('bcrypt');
const express = require('express');
const session = require('express-session');
const redisStore = require('connect-redis')(session);
const bodyParser = require('body-parser');
const app = express();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

pool.connect();

var path = require('path')

process.env.PWD = process.cwd();
app.use(express.static(path.join(process.env.PWD, 'public')));

var client = require('redis').createClient(process.env.REDIS_URL);
app.use(session({
    secret: process.env.SESSION_SECRET,
    store: new redisStore({
        client: client
    }),
    saveUninitialized: false,
    resave: false
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function(req, res) {
    if (req.session.key) {
        res.redirect('/dashboard');
    } else {
        res.sendFile(__dirname + '/public/index.html')
    }
})

app.get('/register', function(req, res) {
    res.sendFile(__dirname + '/public/register.html')
})

app.get('/dashboard', function(req, res) {
    console.log(req.session.userId);
    res.sendFile(__dirname + '/public/dashboard.html')
})

app.post('/create_user', function(req, res) {
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const values = [req.body.email, hashedPassword]
    pool.query('INSERT INTO users (email, password) VALUES($1, $2) RETURNING *', values, (err, psqlRes) => {
        if (err) {
            console.log(err);
            res.sendFile(__dirname + '/error.html')
        } else {
            res.sendFile(__dirname + '/success.html');
        }
    });
})

app.post('/login', function(req, res) {
    const values = [req.body.email];
    pool.query('SELECT * FROM users WHERE email = ($1)', values, (err, psqlRes) => {
        if (err) {
            res.sendFile(__dirname + '/error.html')
        } else {
            console.log(psqlRes.rows[0]);
            if (bcrypt.compareSync(req.query.pw, psqlRes.rows[0].password.trim())) {
                // req.session.userId = psqlRes.rows[0].user_id;
            } else {
                res.send(401);
            }
        }
        pool.end();
    });
})

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

let port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Listening on ' + port);
});