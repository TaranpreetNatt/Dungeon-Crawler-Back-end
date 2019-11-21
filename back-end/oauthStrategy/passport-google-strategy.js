const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const config = require('config');
const { User } = require('../models/user');

if(!config.get('clientID')) {
  console.log('FATAL CLIENTID IS MISSINg');
  process.exit(1);
}

if(!config.get('clientSecret')) {
  console.log('FATAL CLIENTSECRET IS MISSING');
  process.exit(1);
}


passport.use(new GoogleStrategy({
  // callbackURL: 'https://dungeon-crawler-back-end.herokuapp.com/auth/google/redirect',
  callbackURL: 'http://localhost:3000/auth/google/redirect',
  clientID: config.get('clientID'),
  clientSecret: config.get('clientSecret'),
}, async (accessToken, refreshToken, profile, done) => {
    let user = await User.findOne({ "google.googleId": profile.id });
    const localUser = await User.findOne({ "local.email": profile.emails[0].value});
    
    if (user || localUser) {
      return done(null, user); 
    }
    else {
      user = new User({
        method: 'google',
        google: {
          name: profile._json.name,
          email: profile.emails[0].value,
          googleId: profile.id,
        },
      });

      const result = await user.save()
        .catch((err) => {
          console.log(err);
        });
      done(null, result);
    }

}));