var middlewares = require('./middlewares')
config = require('../config/config');

module.exports = function(app, passport) {
  // Home route
  var index = require('../app/controllers/index');
  app.get('/', middlewares.ensureAuthenticated, index.index);	

  var admin = require('../app/controllers/admin');
  app.post('/signup', admin.signup);
  app.put('/finishTour/:id', admin.finishTour);
  app.get('/score/:id', admin.score);
  app.put('/updateFilter', admin.updateFilter);
  app.put('/addSearchCount', admin.addSearchCount);
  app.post('/signin', admin.signin(passport));
  app.get('/signout', admin.signout);
  app.get('/login', admin.login);
  app.post('/feedback', admin.feedback);
  app.get('/dashboard', middlewares.ensureAuthenticated, admin.dashboard);	

  var question = require('../app/controllers/question');
  app.get('/question', question.all);
  app.get('/download', question.download);
  app.get('/tags', question.tags);
  app.get('/counts', question.counts);
  app.get('/question/search', question.search);
  app.post('/question', middlewares.ensureAuthenticated, question.create);
  app.get('/question/:id', question.getById);
  app.put('/question/updateRead/:id', middlewares.ensureAuthenticated, question.updateRead);
  app.get('/questionByUser', question.getByUser);
  app.get('/questions/outstanding', question.getOutstandingQuestions);
  app.get('/questions/outstandingByUser', question.getOutstandingQuestionsByUser);
  app.get('/questions/outstandingFilter', question.getOutstandingByFilter);
  app.put('/question/:id', middlewares.ensureAuthenticated, question.update);
  app.delete('/question/:id', middlewares.ensureAuthenticated, question.delete);
  app.put('/answer/:id', middlewares.ensureAuthenticated, question.updateAnswer);
  app.delete('/answer/:id', middlewares.ensureAuthenticated, question.deleteAnswer);

  app.io.route('question-created', function(req){
    req.io.broadcast('update-counts');
    req.io.broadcast('question-created', req.data);
  });

  app.io.route('question-answered', function(req){
    req.io.broadcast('update-counts');
    req.io.broadcast('question-answered', req.data);
  });

  app.io.route('answer-rated', function(req){
    req.io.broadcast('answer-rated', req.data);
  });

  app.io.route('update-counts', function(req){
    req.io.broadcast('update-counts');
  });

  app.post('/upload', question.upload);

  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

  // the callback after google has authenticated the user
  app.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect : '/',
      failureRedirect : '/login'
    }));

};