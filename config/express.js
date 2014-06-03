/*
 * Module dependencies.
 */
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    swig = require('swig'),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    config = require('./config'),
    i18n = require("i18next"),
    passport = require("passport");

module.exports = function(app){
  app.set('showStackError', true);

  //Should be placed before express.static
  app.use(express.compress({
      filter: function(req, res) {
          return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
      },
      level: 9
  }));

  //Setting the fav icon and static folder
  app.use(express.favicon(config.root + '/' + config.static_public +  '/favicon.ico'));

  // nginx will provide static files in prod environment
  if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(config.root + '/' + config.static_public));
  }

  app.use('/locales',express.static(config.root + '/locales'));

  // translation config
  i18n.init({
    ignoreRoutes: ['images/', config.static_public, 'css/', 'js/'],
    saveMissing: true,
    detectLngQS: 'lang',
    supportedLngs: ['en', 'pt'],
    // debug: true
  });
  i18n.registerAppHelper(app);

  // global views variables
  app.use(function (req, res, next) {
    res.locals.getUserName = function() { 
      return req.user ? req.user.name : ''; 
    };
    next();
  });

  // Set views path and template engine
  app.set('views', config.root + '/app/views');
  app.engine('html', swig.renderFile);
  app.set('view engine', 'html');

  // define if is using build - assets
  app.set('build_enabled', config.build_enabled);


  app.configure(function() {
      //cookieParser should be above session
      app.use(express.cookieParser());

      //bodyParser should be above methodOverride
      app.use(express.limit('3mb'));
      app.use(express.bodyParser());
      app.use(express.methodOverride());


      // register translation middleware
      app.use(i18n.handle);
      
      //express/mongo session storage
      app.use(express.session({
          secret: 'BRAVIWEBSITE',
          store: new mongoStore({
              url: config.db,
              collection: 'sessions'
          })
      }));
      
      //passport configuration
      app.use(passport.initialize());
      app.use(passport.session());

      //connect flash for flash messages
      app.use(flash());
      app.use(helpers('BRAVIWEBSITE'));

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
