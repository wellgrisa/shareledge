var mongoose = require('mongoose'),
  User = mongoose.model('User');

exports.login = function(req, res) {
   console.log('---------------teste----------------------------', req.user);
    res.render('login', { message: req.flash('loginMessage') });
};

exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.signup = function(req, res) {

  var user = new User(req.body);

  var message = null;

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

exports.finishTour = function(req, res){

  User.findById(req.user._id).exec(function (err, user){
      console.log(user);
      user.showTour = false;

      return user.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.json(user);
      });

  });
};

exports.signin = function(passport) {
  console.log('---------------teste----------------------------');

  return passport.authenticate('local', {
      successRedirect : '/', // redirect to the secure profile section
      failureRedirect : '/login', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    });
};

