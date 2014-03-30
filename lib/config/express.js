'use strict';

var express = require('express'),
    path = require('path'),
    config = require('./config'),
		i18n = require('./i18n'),
    mongoStore = require('connect-mongo')(express);

/**
 * Express configuration
 */
module.exports = function(app) {
  app.configure('development', function(){
    app.use(require('connect-livereload')());

    // Disable caching of scripts for easier testing
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.use(express.errorHandler());
    app.set('views', config.root + '/app/views');
  });

  app.configure('production', function(){
    app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
  });

  app.configure(function(){
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    //app.set('view engine', 'jade');
		app.use(i18n);
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.app.cookie_secret));

    // Persist sessions with mongoStore
    app.use(express.session({
      secret: config.app.cookie_secret,
			cookie: {maxAge: 24 * 60 * 60 * 1000},
      store: new mongoStore({
        url: config.mongo.uri,
        collection: 'sessions'
      }, function () {
          console.log("db connection open");
      })
    }));

    //Since all API responses will be in json format, this is used to avoid unnecesary setting the content-type in all of them.
    app.use('/API', function(req, res, next) {
      res.contentType('application/json');
      next();
    });
    
    // Router needs to be last
    app.use(app.router);
  });
};