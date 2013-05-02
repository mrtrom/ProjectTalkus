//Export module
var users = module.exports;

//Require modules
var schemas = require('./schemas'),
    utils = require('./utilities'),
    User = schemas.User;
    
    
//Model validators

User.schema.path('username').validate(function(v) {
    return ((v !== null) && (typeof v === 'string') && (v.length));
}, 'invalid username');

User.schema.path('email').validate(function(v) {
    return ((/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/).test(v));
}, 'invalid email format');

User.schema.path('password').validate(function(v) {
    return ((v !== null) && (typeof v === 'string') && (v.length >= 6));
}, 'invalid password length');


//Create new user
users.create = function(req, res) {
    var user = new User(req.body.user);
        
    user.password = utils.crypt(user.password);
    
    return user.save(function(error) {
        if (error !== null) {
            res.statusCode = 400;
            return res.end(utils.parseError(error));
        } else {
            res.statusCode = 200;
            return res.end(JSON.stringify(user));
        }
    });
};