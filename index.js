const express = require('express')
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path')
const axios = require('axios')
const config = require('config');
const passportSetup = require('./back-end/oauthStrategy/passport-google-strategy');
const authRoute = require('./back-end/routes/auth');
const { auth, loggedInAlert } = require('./back-end/middleware/auth');

const PORT = process.env.PORT || 3000
const app = express();

if (!config.get('sessionSecret')) {
  console.log('FATAL sessionSecret IS MISSING');
  process.exit(1);
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: config.get('sessionSecret'),
    resave: true,
    saveUninitialized: true,
    name: "dungeonCrawler",
}));

// db connection
const db = config.get('db');
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => {
    console.log(`Connected to ${db}...`);
  })
  .catch(err => {
    console.log('Could not connect to mongodb', err);
  });

app.listen(PORT, () => console.log(`Listening on ${ PORT }...`));

/*** Authentication & Authorization Middleware ***/
// const auth = function(req, res, next) {
//     if (req.session && req.session.loggedin && req.session.email) return next();
//     else return res.status(401).send("Unauthorized. Please log in and try again.");;
// };

// const loggedInAlert = function(req, res, next) {
//     // console.log(req.session);
//     if (req.session.loggedin) return res.send("Already logged-in. Please logout first or return back home.");
//     else return next();
// };
/*******/

/*** Views Rendering ***/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    if (req.session.loggedin) res.redirect('demo');
    else res.redirect('/signin')
});
app.get('/signin', loggedInAlert, (req, res) => res.render('pages/signIn'));
app.get('/signup', loggedInAlert, (req,res) => res.render('pages/register'));
app.get('/logout', function (req, res) {
    req.session.loggedin = false;
    req.session.destroy();
    res.redirect('/signin');
});
app.get('/demo', auth, (req, res) => res.render("pages/demo"));

app.use('/auth', authRoute);