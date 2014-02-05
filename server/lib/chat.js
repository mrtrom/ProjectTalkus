//Export module
var chat = module.exports;

//Require modules
var users = require('./users'),
    utils = require('./utilities');
    

chat.getUser = function(req, res) {
    var username = "";
    
    var room = "";
    for (var user1 in GLOBAL.globalChatUsers){
        if (GLOBAL.globalChatUsers[user1].username == req.params.username){
            room = GLOBAL.globalChatUsers[user1].room;
        }
    }
    for (var user2 in GLOBAL.globalChatUsers){
        if (GLOBAL.globalChatUsers[user2].room == room && GLOBAL.globalChatUsers[user2].username != req.params.username){
            username = GLOBAL.globalChatUsers[user2].username;
        }
    }
    
    console.log('username: ' + username);
    
    var fields = {
        username: 1,
        name: 1,
        avatar: 1,
        email: 1,
        gender: 1,
        birth: 1,
        description: 1
    };
    
    return users.getByUsername(username, fields, function(error, user) {
        var _user;
        if (error !== null) {
            res.statusCode = 500;
            res.end(utils.parseError(error));
        } else if (user !== null) {
            _user = user.toObject();
            res.statusCode = 200;
            console.log('usernameExito: ' + username);
            return res.end(JSON.stringify(_user));
        } else {
            console.log('usernameNoExito: ' + username);
            _user = {username: username};
            res.statusCode = 204;
            return res.end(_user);
        }
    });
};

chat.getUsername = function(req, res){
    var userIdObject = {
            count: 1
        };
    if (GLOBAL.globalChatUsers !== null && Object.keys(GLOBAL.globalChatUsers).length > 0){
        userIdObject.count = Object.keys(GLOBAL.globalChatUsers).length +1;
    }
    res.end(JSON.stringify(userIdObject));
};