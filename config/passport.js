var LocalStrategy = require('passport-local').Strategy,
mongoose = require('mongoose'),
User = mongoose.model('User'),passport = require('passport'),
url = require('url'),
config = require('../config/config'),
GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
authService = require('../app/services/authentication'),
GOOGLE_CONFIG = {
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    };


module.exports = function (passport) {
  // serialize sessions
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
      console.log('serializin');
      done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
      console.log('deserializin');
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });


    passport.use(new LocalStrategy({
      usernameField: 'username',
      passwordField: 'password'
    },
      function(username, password, done) {
        console.log(username);
        User.findOne({
          username: username
        }, function(err, user) {
          console.log(user);
          if (err) {
            return done(err);
          }
          if (!user) {
            return done(null, false, {
              message: 'Unknown user'
            });
          }
          if (!user.authenticate(password)) {
            return done(null, false, {
              message: 'Invalid password'
            });
          }

          return done(null, user);
        });
      }
    ));

// Use google strategy
  // Use google strategy
  passport.use(new GoogleStrategy(GOOGLE_CONFIG,
    function(accessToken, refreshToken, profile, done) {
      var googleProfile = profile._json;
			
			if(!googleProfile.hd !== "bravi.com.br"){					
					done(new Error("Invalid host domain"));
			}
		
      User.findOne({ 'google.id': profile.id }, function (err, user) {
        if (user) return done(err, user);


        User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: profile.emails[0].value,
          provider: 'google',
          google: profile._json
        }, done);
      });

  }));

  }