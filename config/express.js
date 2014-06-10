/*
 * Module dependencies.
 */
var express = require('express'),
  path = require('path'),
  swig = require('swig'),
  passport = require("passport");

module.exports = function(app){


  // Set views path and template engine
  app.set('views', path.normalize(__dirname + '../..') + '/app/views');
  app.engine('html', swig.renderFile);
  app.set('view engine', 'html');

  app.use(express.static(path.normalize(__dirname + '../../public')));


  app.configure(function() {
      //cookieParser should be above session
      app.use(express.cookieParser());

      //bodyParser should be above methodOverride
      app.use(express.limit('3mb'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());

 //passport configuration
      app.use(passport.initialize());
      app.use(passport.session());

      //routes should be at the last
      app.use(app.router);

      //Assume "not found" in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
      app.use(function(err, req, res, next) {
          //Treat as 404
          if (~err.message.indexOf('not found')) return next();

          //Log it
          console.error(err.stack);

          //Error page
          res.status(500).render('500', {
              error: err.stack
          });
      });

      //Assume 404 since no middleware responded
      app.use(function(req, res, next) {
          res.status(404).render('404', {
              url: req.originalUrl,
              error: 'Not found'
          });
      });

  });
};
