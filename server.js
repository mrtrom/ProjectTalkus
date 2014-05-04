'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    util = require('util'),
    cluster = require('cluster'),
    cronJob = require('cron').CronJob,
    _ = require('underscore');

//Var's
var app = express(),
    numCPUs = require('os').cpus().length,
    timeouts = {};

//cron config for user account validation
new cronJob('00 00 12 * * 1-7', function(){
  var mail = require('./lib/controllers/mails');
  mail.usermailcheck();
}, null, true);

/**
 * Main application file
 */


// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Application Config
var config = require('./lib/config/config');

// Connect to database
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

var app = express();

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

if ((cluster.isMaster) && (process.env.NODE_CLUSTERED === 1)) {

  util.log("Starting app in clustered mode");
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('fork', function(worker) {
    util.log('Forking worker #', worker.id);
    timeouts[worker.id] = setTimeout(function() {
      util.error(['Worker taking too long to start']);
    }, 2000);
  });
  cluster.on('listening', function(worker, address) {
    util.log('Worker #'+worker.id+' listening on port: ' + address.port);
    clearTimeout(timeouts[worker.id]);
  });
  cluster.on('online', function(worker) {
    util.log('Worker #'+worker.id+' is online');
  });
  cluster.on('exit', function(worker, code, signal) {
    util.error(['The worker #'+worker.id+' has exited with exitCode ' + worker.process.exitCode]);
    clearTimeout(timeouts[worker.id]);
    // Don't try to restart the workers when disconnect or destroy has been called
    if(worker.suicide !== true) {
      util.debug('Worker #' + worker.id + ' did not commit suicide, restarting');
      cluster.fork();
    }
  });
  cluster.on('disconnect', function(worker) {
    util.debug('The worker #' + worker.id + ' has disconnected');
  });

  // Trick suggested by Ian Young (https://github.com/isaacs/node-supervisor/issues/40#issuecomment-4330946)
  // to make cluster and supervisor play nicely together:
  if (process.env.NODE_HOT_RELOAD === 1) {
    var signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
    _.each(signals, function(signal){
      process.on(signal, function(){
        _.each(cluster.workers, function(worker){
          worker.destroy();
        });
      });
    });
  }

} else {
  require('./lib/config/chatConfig')(app);
}

// Expose app
exports = module.exports = app;