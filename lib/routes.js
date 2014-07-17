'use strict';

var index = require('./controllers'),
    users = require('./controllers/users'),
    mails = require('./controllers/mails'),
    chat = require('./controllers/chat'),
    sessions = require('./controllers/sessions'),
    upload = require('./controllers/upload'),
    valid = require('./controllers/valid');

/**
 * Application routes
 */
module.exports = function(app) {


  //Access origin CORS
  app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:8004");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
    next();
  });

  /*
   +: required
   -: optional
   */

  /*--------sessions----------*/
  /*
   POST
   params
   +username: String - user-name or e-mail
   +password: String
   responds
   200
   user: Object - if logged-in successfully,
   message: 'user successfully logged'
   403
   message: String - 'Invalid username/email or password' if invalid credentials was provided
   500
   error: Object - internal server error if any
   */
  app.post('/API/sessions', sessions.login);

  /*
   GET
   responds
   200
   {user - session's user object}
   404 - if no user attached to session
   */
  app.get('/API/sessions', sessions.getSessionUser);

  /*
   DELETE
   responds
   200 - if logged-out successfully
   */
  app.delete('/API/sessions', sessions.check, sessions.logout);

  /*
   UPDATE
   responds
   200 - if updated successfully
   */
  app.put('/API/sessions', sessions.update);
  /*--------------------------*/

  /*--------users-------------*/
  /*
   POST
   params
   user: Object
   +username: String
   +email: String
   +password: String - Minimun length: 6 chars
   responds
   201
   user: user
   message: 'user successfully created'
   500
   error: Object - validation error if any
   */
  app.post('/API/users', users.create);

  /*
   DELETE
   params
   +_id: ObjectID
   responds
   200
   message: 'user successfully deleted'
   500
   error: Object - validation error if any
   */
  app.delete('/API/users/:id', users.delete);

  /*
   PUT
   params
   user: Object
   +_id: ObjectID
   -email: String
   -username: String
   -birth: Date
   -name: String
   -gender: String
   -location: String
   -description: String
   responds
   200
   user: user,
   message: 'user successfully updated'
   500
   error: Object - validation error if any
   */
  app.put('/API/users/:username', users.update);

  /*
   GET
   params
   +username: String
   responds
   200
   user: UserObject
   404
   error: Object - user doesn't exist
   */
  app.get('/API/users/:username', users.get);

  /*
   POST
   params
   +files: file
   responds
   200
   file: Object
   500
   error: Object - user doesn't exist
   */
  app.post('/API/upload/photo', upload.post);
  app.post('/API/upload/get', upload.get);
  /*--------------------------*/

  /*--------mails-------------*/
  /*
   POST
   params
   user: Object
   +_id: ObjectID
   +username: String
   +email: String
   responds
   200
   - if sen successfully
   500
   error: Object - validation error if any
   404
   err: Object - validation error if any,
   message: 'template not found'
   */
  app.post('/API/mails', mails.setmail);

  app.delete('/API/mails/:id', mails.delete);

  app.put('/API/mails', mails.resend);

  /*
   POST
   params
   user: Object
   +forgotemail: String
   responds
   200
   - if sent successfully
   500
   error: Object - validation error if any
   404
   err: Object - validation error if any,
   message: 'template not found'
   */
  app.post('/API/remember', users.rememberAcces);

  /*
   POST
   params
   user: Object
   +forgotemail: String
   responds
   200
   - if sent successfully
   500
   error: Object - validation error if any
   404
   err: Object - validation error if any,
   message: 'template not found'
   */
  app.post('/API/valid', valid.validate);
  /*--------------------------*/

  /*--------chat-------------*/

  /*
   GET
   params
   user: Object
   +username: String
   responds
   200
   user: Object
   500
   error: Object - validation error if any
   404
   username: String
   cant find user

   */
  app.get('/API/chat/:username', chat.getUser);

  /*
   GET
   params
   username: String
   responds
   200
   user: Object
   500
   error: Object - validation error if any
   204
   username
   user not found (anonym user)
   */
  app.get('/API/chat/chatUsername/:username/get', chat.getUsername);

  // All undefined api routes should return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });
  
  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};