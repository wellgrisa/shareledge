
var express = require('express');
// Bootstrap routes


var http = require('http');


var path = require('path');

// var mongo = require('mongodb');
// var mongoose = require('mongoose');

var app = express();

require('./config/express')(app);

require('./config/routes')(app);

// mongoose.connect('mongodb://localhost:27017/blogmanager');

// all environments
app.set('port', process.env.PORT || 3000);





http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
