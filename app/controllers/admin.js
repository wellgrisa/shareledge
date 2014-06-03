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