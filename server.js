
/**
 * Forces use a default environment if it is not defined
 */
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

var fs = require('fs'),
    express = require('express.io'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    path = require('path'),
    config = require('./config/config');

  var connect = function () {
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    mongoose.connect(config.db, options);
  };

connect();

var models_path = path.normalize(__dirname + '/app/models');

/*fs.readdirSync(models_path).forEach(function (file) {
  console.log(models_path + '/' + file);
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});*/

require(models_path + '/' + 'user.js');
require(models_path + '/' + 'question.js');
require(models_path + '/' + 'tags.js');
require(models_path + '/' + 'note.js');

var http = require('http');

var path = require('path');

var app = express();

app.http().io();

require('./config/passport')(passport);

require('./config/express')(app, passport);

require('./config/routes')(app, passport);

// mongoose.connect('mongodb://localhost:27017/blogmanager');

// all environments
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
