module.exports = function(app) {
  // Home route
  var index = require('../app/controllers/index');
  app.get('/', index.render);
  app.get('/process', index.process);
  app.get('/questions', index.questions);
};