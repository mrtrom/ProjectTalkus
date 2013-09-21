//Export module
var users = module.exports;

//Require modules
var schemas = require('./schemas'),
    utils = require('./utilities'),
    mongoose = require('mongoose'),
    User = schemas.User;
    
    
//Model validators

User.schema.path('username').validate(function(v) {
    return ((v !== null) && (typeof v === 'string') && (v.length));
}, 'invalid username');

User.schema.path('email').validate(function(v) {
    return ((/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/).test(v));
}, 'invalid email format');

//Create new user
users.create = function(req, res) {
    var user = new User(req.body.user);
    
    //Entries validations
    if (user.username === undefined){user.username = "";}
    if (user.password === undefined){user.password = "";}
    
    user.password = utils.crypt(user.password);
    user.confirmed = 'false';
    user.created = new Date();
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

//Delete user by id
users.delete = function (req, res) {
    User.findByIdAndRemove({_id: mongoose.Types.ObjectId(req.params.id)},
        function(error, userDoc){
            if (error !== null) {
                res.statusCode = 400;
                return res.end(utils.parseError(error));
            } else {
                res.statusCode = 200;
                return res.end();
            }
        });
};

//Update users info
users.update = function(req, res) {
    var user = new User(req.body);
    
    //Entries validations
    if (user.email === undefined || user.email === ''){user.email = "";}
    if (user.username === undefined || user.username === ''){user.username = "";}
    if (user.avatar === undefined || user.avatar === ''){user.avatar = "";}
    if (user.birth === undefined || user.birth === ''){user.birth = "";}
    if (user.name === undefined || user.name === ''){user.name = "";}
    if (user.gender === undefined || user.gender === ''){user.gender = "";}
    if (user.location === undefined || user.location === ''){user.location = "";}
    if (user.description === undefined || user.description === ''){user.description = "";}
    return User.findByIdAndUpdate({
        _id: user._id
    }, {$set: {email: user.email, name: user.name,birth: user.birth, avatar: user.avatar, gender: user.gender,location: user.location, description: user.description}}, function(error) {
        
        if (error !== null) {
            res.statusCode = 400;
            return res.end(utils.parseError(error));
        } else {
            res.statusCode = 200;
            return res.end(JSON.stringify(user));
        }
    });
};
//Get user info by username
users.getByUsername = function(username, fields, callback) {
    return User.findOne({
        username: username
    }, fields, function(error, user) {
        if (error !== null) {
            return typeof callback === "function" ? callback(error, null) : void 0;
        } else if (user !== null) {
            return typeof callback === "function" ? callback(null, user) : void 0;
        } else {
            return typeof callback === "function" ? callback(null, null) : void 0;
        }
    });
};

//Get user info
users.get = function(req, res) {
    
    var username = req.params.username,
        fields = {
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
            //return errors.handle(error, res);
            console.log(JSON.stringify(error));
        } else if (user !== null) {
            _user = user.toObject();
            res.statusCode = 200;
            return res.end(JSON.stringify(_user));
        } else {
            res.statusCode = 404;
            return res.end();
        }
    });
};