ar LocalStrategy = require('passport-local').Strategy,
      mongoose = require('mongoose')
      User = mongoose.model('User');

module.exports = function (passport) {
  // serialize sessions
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function (err, user) {
      done(err, user);
    });
  });

  // use local strategy
  passport.use(new LocalStrategy(function authenticateUser(username, password, done) {
    return User.authenticate(username, password, done);
  }));
}