var middlewares = require('./middlewares')
config = require('../config/config');

module.exports = function(app, passport) {
  // Home route
  var index = require('../app/controllers/index');
  app.get('/', middlewares.ensureAuthenticated, index.render);

  var admin = require('../app/controllers/admin');
  app.post('/signup', admin.signup);
  app.post('/signin', admin.signin(passport));
  app.get('/signout', admin.signout);
  app.get('/login', admin.login);

  var question = require('../app/controllers/question');
  app.get('/question', question.all);
  app.get('/question/search/:search', question.search);
  app.post('/question', question.create);
  app.get('/question/:id', question.getById);
  app.put('/question/updateRead/:id', question.updateRead);
  app.get('/questionByUser', question.getByUser);
  app.get('/questions/outstanding', question.getOutstandingQuestions);
  app.get('/questions/outstandingByUser', question.getOutstandingQuestionsByUser);
  app.put('/question/:id', question.update);
  app.put('/answer/:id', question.updateAnswer);

  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect : '/',
      failureRedirect : '/login'
    }));

};