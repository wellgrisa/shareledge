var mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User');

exports.render = function(req, res) {
  res.render('admin/index');
};


exports.login = function (req, res) {
  res.render('login');
};

exports.authenticate = function (passport) {
  return passport.authenticate('local', {
      successRedirect: '/bs-admin',
      failureRedirect: '/login',
      failureFlash: true
    });
};

exports.logout = function (req, res) {
  req.logout();
  res.redirect('/login');
};

exports.signup = function(req, res) {
  // For security measurement we remove the roles from the req.body object


  // Init Variables
  var user = new User(req.body);

  console.log(user);
  var message = null;

  // Add missing user fields
  user.provider = 'local';


  // Then save the user
  user.save(function(err) {
    if (err) {
      return res.send(404, {
        message: err
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function(err) {
        if (err) {
          res.send(400, err);
        } else {
          res.jsonp(user);
        }
      });
    }
  });
};