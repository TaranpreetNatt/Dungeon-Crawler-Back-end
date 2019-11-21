const express = require('express')
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path')
const axios = require('axios')
const config = require('config');
const passportSetup = require('./back-end/oauthStrategy/passport-google-strategy');
const authRoute = require('./back-end/routes/auth');

const PORT = process.env.PORT || 3000
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true },
}));
/*******/

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
const auth = function(req, res, next) {
    console.log(req.session);
    if (req.session && req.session.loggedin && req.session.email) return next();
    else return res.status(401).send("Unauthorized. Please log in and try again.");;
};
const loggedInAlert = function(req, res, next) {
    // console.log(req.session);
    if (req.session.loggedin) return res.send("Already logged-in. Please logout first or return back home.");
    else return next();
};
/*******/

/*** Views Rendering ***/
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    if (req.session.loggedin) res.redirect('demo');
    else res.redirect('signin')
});
app.get('/signin', loggedInAlert, (req, res) => res.render('pages/signIn'));
app.get('/signup', loggedInAlert, (req,res) => res.render('pages/register'));
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.send("Logout Successful!");
});
app.get('/demo', auth, (req, res) => res.render("pages/demo"));

app.use('/auth', authRoute);
/*******/

/*** POST Requests ***/
// Login
app.post('/login', async (req, res) => {
    // const login_uri = "https://dungeon-crawler-back-end.herokuapp.com/auth/login";
    const login_uri = "http://localhost:3000/auth/login";
    // const name = req.body.username;
    const email = req.body.email;
    const pw = req.body.password;
    const data = {
        // "name": name,
        "email": email,
        "password": pw,
    }
    // console.log("DATA is " + JSON.stringify(data));

    await axios.post(login_uri, data)
        .then(axiosResp => {
            // console.log(axiosResp);
            // console.log(`statusCode: ${axiosResp.status}, ${axiosResp.statusText}`);
            req.session.loggedin = true;
            req.session.secret = axiosResp.data;
            req.session.email = email;
            // console.log(req.session);
            res.redirect("/demo");
        })
            .catch(error => {
            console.error("ERROR:", error.response);
            // alert(error.response.data);         
            res.status(401).send(error.response.data + ". Please return to the previous page and try again.");
            // res.redirect('/#error');
        });
});

// Registration
app.post('/register', async (req, res) => {
    // const register_uri = "https://dungeon-crawler-back-end.herokuapp.com/auth/register";
    const register_uri = "http://localhost:3000/auth/register";
    const name = req.body.username;
    const email = req.body.email;
    const pw = req.body.password;
    const data = {
        "name": name,
        "email": email,
        "password": pw,
    }
    // console.log("DATA is " + JSON.stringify(data));

    await axios.post(register_uri, data)
        .then(axiosResp => {
            // console.log(axiosResp);
            // console.log(`statusCode: ${axiosResp.status}, ${axiosResp.statusText}`);
            req.session.loggedin = true;
            req.session.secret = axiosResp.data;
            req.session.name = name;
            req.session.email = email;
            // console.log(req.session);
            res.redirect("/demo");
        })
        .catch(error => {
            console.error("ERROR:", error.response);
            // alert("ERROR:", error.response.data);
            res.status(401).end(error.response.data + ". Please return to the previous page and try again.");
            // res.redirect('/signup/#error');
        });
});
/*******/

