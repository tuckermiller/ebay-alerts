const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true,
});

pool.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
})

app.get('/register', function(req, res) {
    res.sendFile(__dirname + '/register.html')
})

app.get('/dashboard', function(req, res) {
    res.sendFile(__dirname + '/dashboard.html')
})

app.post('/createuser', function(req, res) {
    let hashedPassword = bcrypt.hashSync(req.body.pw, 10);
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
            if (bcrypt.compareSync(req.query.pw, psqlRes.rows[0].password.trim())) {
                // Login
            } else {
                // 401
            }
        }
    });
})

let port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('Example app listening on ' + port);
});