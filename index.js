const express = require('express');
const path = require('path');
const dotenv = require("dotenv");
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');

const connectDB = require("./config/db");

dotenv.config();
connectDB();


const app = express();
const port = process.env.PORT || 8080;

/* ----- session ----- */
app.use(cookieSession({
    name: 'session',
    keys: [crypto.randomBytes(32).toString('hex')],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(cookieParser())

app.use(express.static(__dirname + '/static'));

// sendFile will go here
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port);
console.log('Server started at http://localhost:' + port);