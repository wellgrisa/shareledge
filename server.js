/*
 * Module dependencies
 */
var fs = require('fs'), 
    express = require('express'),
    passport = require('passport'),
    clc = require('cli-color');
    mongoose = require('mongoose');

// Load Configuraitons
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development',
      config = require('./config/config');

// Bootstrap db connection
// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } }
  mongoose.connect(config.db, options);
}
connect();

// Error handler
mongoose.connection.on('error', function (err) {
  console.log(err);
})

// Reconnect when closed
mongoose.connection.on('disconnected', function () {
  connect();
});

// Bootstrap models
var models_path = __dirname + '/app/models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file);
});

//bootstrap passport config
require('./config/passport')(passport);

var app = express();

// Express settings
require('./config/express')(app, passport);

// Bootstrap routes
require('./config/routes')(app, passport);

// Logs
console.log('DB:' + config.db);
console.log('ENV:' + env);
console.log('PORT:' + config.port);
console.log('BUILD ENABLED:' + config.build_enabled);
console.log('STATIC PUBLIC:' + config.static_public);

// Start the app by listening on <port>
app.listen(config.port);


// banner
console.log(clc.cyan(config.banner));
// output message to notify the server is running
console.log(clc.green('The server is running bro.') + clc.greenBright(' Go for it: http://localhost:' + config.port));

// Expose app
exports = module.exports = app;