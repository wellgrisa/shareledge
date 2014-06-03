/**
 * Module dependencies.
 */
 
var mongoose = require('mongoose'),
      Schema = mongoose.Schema;
 
/**
 * User Schema
 */
 
var UserSchema = new Schema({
  name: String,
  email: String,
  username: String,
  password: String
});
 
/**
 * Methods
 */
 
UserSchema.methods.validPassword = function (password) {
  return this.password === password;
};
 
 /**
 * Statics
 */
 
UserSchema.statics.authenticate = function (username, password, done) {
  this.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { message: 'Incorrect username.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Incorrect password.' });
    }
    return done(null, user);
  });
};
 
mongoose.model('User', UserSchema);