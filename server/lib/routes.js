//Export module
var app = module.parent.exports.app

//Require modules
var users = require('./users'),
    mails = require('./mails'),
    sessions = require('./sessions'),
    clientRoutes = require('../../client/routes/index');

//Define resources and routes for server 

/*--------sessions----------*/
/*
POST
params
  username: String - user-name or e-mail
  password: String
responds
  200
    user: Object - if logged-in successfully
  403 
    message: String - 'Invalid username/email or password' if invalid credentials was provided
  500 
    error: Object - internal server error if any
*/

app.post('/API/sessions', sessions.login);

/*
DELETE
responds
  200 - if logged-out successfully
  403
    message: String - 'Please login in order to continue' if no user is attached to session
*/
app.delete('/API/sessions', sessions.check, sessions.logout);
/*--------------------------*/

/*--------users-------------*/
/*
POST
params
  user: Object
    username: String
    email: String
    password: String - Minimun length: 6 chars
responds
  200 
    - if created successfully
  400 
    error: Object - validation error if any
*/
app.post('/API/users', users.create);

/*--------mails-------------*/
/*
POST
params
 
responds
  200 
    - if created successfully
  400 
    error: Object - validation error if any
*/
app.post('/API/mails', mails.send);


//Define resources and routes for client

app.get('/', clientRoutes.index);
app.get('/partials/:name', clientRoutes.partials);
