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
    console.log(req.session);
    if (req.session.userId) {
        res.sendFile(__dirname + '/public/dashboard.html');
    } else {
        res.sendFile(__dirname + '/public/index.html')
    }
})

app.get('/dashboard', function(req, res) {
    res.sendFile(__dirname + '/public/dashboard.html')
})

app.get('/alerts', function(req, res) {
    const values = [req.session.userId];
    pool.query('SELECT * FROM alerts WHERE user_id = ($1)', values, (err, psqlRes) => {
        if (err) {
            // To do: replace with error message under form
            res.sendFile(__dirname + '/error.html')
        } else {
            if (!psqlRes.rows) {
                res.send('User not found')
            } else {
                res.send(psqlRes.rows);
            }
        }
    });
});

app.post('/create_user', function(req, res) {
    let hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const values = [req.body.email, hashedPassword];
    // To do: validate email

    pool.query('INSERT INTO users (email, password) VALUES($1, $2) RETURNING *', values, (err, psqlRes) => {
        if (err) {
            console.log(err);
            res.send(500)
        } else {
            res.send(200);
        }
    });
})

app.post('/create_alert', function(req, res) {
    const values = [req.session.userId, req.body.keywords, req.body.frequency]
    pool.query('INSERT INTO alerts (user_id, keywords, frequency) VALUES($1, $2, $3) RETURNING *', values, (err, psqlRes) => {
        if (err) {
            console.log(err);
            res.send(500)
        } else {
            res.send(200);
        }
    });
})


app.post('/login', function(req, res) {
    const values = [req.body.email];
    pool.query('SELECT * FROM users WHERE email = ($1)', values, (err, psqlRes) => {
        if (err) {
            // To do: replace with error message under form
            res.sendFile(__dirname + '/error.html')
        } else {
            if (!psqlRes.rows) {
                res.send('User not found')
            } else {
                if (bcrypt.compareSync(req.body.password, psqlRes.rows[0].password.trim())) {
                    req.session.userId = psqlRes.rows[0].user_id;
                    res.send(200);
                } else {
                    res.send(401);
                }
            }
        }
    });
})

app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.send(200);
        }
    });
});

let port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Listening on ' + port);
});