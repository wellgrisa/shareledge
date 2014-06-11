module.exports = function(app, passport) {
  // Home route
  var index = require('../app/controllers/index');
  app.get('/', index.render);
  app.get('/process', index.process);

  var admin = require('../app/controllers/admin');
  app.post('/signup', admin.signup);
  app.post('/signin', admin.signin(passport));
  app.get('/signout', admin.signout);

app.get('/login', function(req, res) {
      res.render('login', { message: req.flash('loginMessage') });
    });
};