var LocalStrategy = require('passport-local').Strategy,
mongoose = require('mongoose'),
User = mongoose.model('User');


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

  }