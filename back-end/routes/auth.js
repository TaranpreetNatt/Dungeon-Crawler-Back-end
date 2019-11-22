const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const config = require('config');
const _ = require('lodash');
const session = require('express-session');
// const auth = require('../middleware/auth');
const { User, validateUser, validateUserLogin } = require('../models/user');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { error } = validateUserLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ "local.email": req.body.email });
  if (!user) return res.status(400).send('Invalid email or password');

  const validPassword = await bcrypt.compare(req.body.password, user.local.password);
  if (!validPassword) return res.status(400).send('Invalid password');

  req.session.loggedin = true;
  req.session.secret = config.get('sessionSecret');
  req.session.email = req.body.email;
  res.redirect('http://localhost:3000/demo');
});

// local registration
router.post('/register', async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ "local.email": req.body.email });
  if (user) return res.status(400).send('Email exists');

  user = await User.findOne({ "google.email": req.body.email });
  if (user) return res.status(400).send('Email exists');


  user = new User({
    method: 'local',
    local: {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    },
  });

  const salt = await bcrypt.genSalt(10);
  user.local.password = await bcrypt.hash(user.local.password, salt);

  const result = await user.save()
    .catch((err) => {
      res.status(500).send('Could not register user');
      console.log('err');
  });

  req.session.loggedin = true;
  req.session.secret = config.get('sessionSecret');
  req.session.name = req.body.name;
  req.session.email = req.body.email;
  res.redirect('http://localhost:3000/demo');
});

// If user wants to login with google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// this is handeled on the backend
router.get('/google/redirect', passport.authenticate('google', { session: false }), (req, res) => {
  const { name, email } = req.user.google;
  // console.log(name, email);
  // const token = user.generateAuthToken();
  req.session.loggedin = true;
  req.session.secret = config.get('sessionSecret');
  req.session.name = name;
  req.session.email = email;
  res.redirect('http://localhost:3000/demo');
});

module.exports = router;