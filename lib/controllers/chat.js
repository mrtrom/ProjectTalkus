//Export module
var chat = module.exports;

//Require modules
var users = require('./users'),
    utils = require('./utilities');


chat.getUser = function(req, res) {
  var username = "";
  var userId;

  if (req.params.username){
    for (var user in GLOBAL.globalChatUsers){
      if (GLOBAL.globalChatUsers[user].partner && GLOBAL.globalChatUsers[user].partner.socketId) {
        if (GLOBAL.globalChatUsers[user].id === req.params.username) {
          userId = GLOBAL.globalChatUsers[user].partner.socketId;
        }
      }
    }

    if (userId && GLOBAL.globalChatUsers[userId] && GLOBAL.globalChatUsers[userId].userData &&
        GLOBAL.globalChatUsers[userId].userData.username) {

      username = GLOBAL.globalChatUsers[userId].userData.username;

    }
  }

  if (username && username !== 'Anonym') {

    var fields = {
      username: 1,
      name: 1,
      email: 1,
      gender: 1,
      birth: 1,
      description: 1
    };

    return users.getByUsername(username, fields, function (error, user) {
      var _user;
      if (error !== null) {
        res.statusCode = 500;
        res.end(utils.parseError(error));
      } else if (user !== null) {
        _user = user.toObject();
        res.statusCode = 200;
        return res.end(JSON.stringify(_user));
      } else {
        res.statusCode = 404;
        return res.end();
      }
    });
  }
  else{
    res.statusCode = 204;
    return res.end();
  }
};

chat.getUsername = function(req, res){
  var userIdObject = {
    count: 1
  };

  if (GLOBAL.cantidadUsuarios === null || GLOBAL.cantidadUsuarios === undefined){
    GLOBAL.cantidadUsuarios = {};
    GLOBAL.cantidadUsuarios.cantidad = 0;
  }
  else{
    GLOBAL.cantidadUsuarios.cantidad++;
  }

  userIdObject.count = GLOBAL.cantidadUsuarios.cantidad++;
  res.end(JSON.stringify(userIdObject));
};