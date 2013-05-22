//Require modules
var util = require('util'),
    express = require('express'),
    cluster = require('cluster'),
    CONF = require('config'),
    mongoose = require('mongoose'),
    path = require('path'), 
    viewsDir = path.resolve(__dirname, '..', 'client/views'),
    publicDir = path.resolve(__dirname, '..', 'client/public'),
    MongoStore = require('connect-mongo')(express),
    clientRoutes = require('../client/routes/index'),
    io = require('socket.io');

//Var's
var app = express(),
    numCPUs = require('os').cpus().length,
    timeouts = {},
    pub_dir = CONF.app.pub_dir,
    staticServer;
    
//pub_dir config
if (pub_dir[0] != '/') { 
    pub_dir = '/' + pub_dir; 
} // humans are forgetful

pub_dir = __dirname + pub_dir;

//App config
app.configure(function() {
  app.set('views', viewsDir);
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
    
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(publicDir));
  app.use(express.query());
  app.use(express.cookieParser(CONF.app.cookie_secret));
  
  //Session-storage
  app.use(express.session({
    secret: CONF.app.cookie_secret,
    cookie: {maxAge: 24 * 60 * 60 * 1000},
    store: new MongoStore(CONF.db)
  }));
  

  //Since all API responses will be in json format, this is used to avoid unnecesary setting the content-type in all of them.
  app.use('/API', function(req, res, next) {
    res.contentType('application/json');
    next();
  });

  app.use(app.router);

});

//Connect database
mongoose.connect(CONF.db.url);

//Routes configuration is externalized in a different module (can be multiple) for cleaner code.
module.exports.app = app;
require('./lib/routes');


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
        })
      })
    })
  }

} else {
  io = io.listen(app.listen(process.env.PORT, process.env.IP));
  util.log("Express server instance listening on port " + process.env.PORT + " and host " + process.env.IP);
}

//require('./lib/chat');

// usernames which are currently connected to the chat
var usernames = {};

io.sockets.on('connection', function (socket) {

    // when the client emits 'sendchat', this listens and executes
    socket.on('sendchat', function (data) {
        // we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.emit('updatechat', socket.username, data);
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(username){
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
		// echo to client they've connected
		socket.emit('updatechat', 'SERVER', 'you have connected');
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('updatechat', 'SERVER', username + ' has connected');
		// update the list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
	});
});
