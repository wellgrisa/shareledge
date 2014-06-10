
var fs = require('fs'),
    express = require('express'),
    mongoose = require('mongoose'),
    passport = require('passport'),
    path = require('path'),
    config = require('./config/config');

  var connect = function () {
    var options = { server: { socketOptions: { keepAlive: 1 } } }
    mongoose.connect(config.db, options);
  }

console.log(config.db);

connect();

var models_path = path.normalize(__dirname + '/app/models')

/*fs.readdirSync(models_path).forEach(function (file) {
  console.log(models_path + '/' + file);
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});*/

require(models_path + '/' + 'user.js')

var http = require('http');

var path = require('path');

// var mongo = require('mongodb');
// var mongoose = require('mongoose');

var app = express();

require('./config/express')(app, passport);

require('./config/routes')(app);

// mongoose.connect('mongodb://localhost:27017/blogmanager');

// all environments
app.set('port', process.env.PORT || 3000);





http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
