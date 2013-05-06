//Export module
var sessions = module.exports;

//Require modules
var schemas = require('./schemas'),
    utils = require('./utilities'),
    User = schemas.User;
    
//Checks if the request has a valid session user
sessions.check = function(req, res, next) {
    var _ref;

    if (((_ref = req.session) !== null ? _ref.user : void 0) !== null) {
        return next();
    } else {
        res.statusCode = 403;
        return res.end(JSON.stringify({
        message: 'Please login in order to continue'
        }));
    }
};

//Login
sessions.login = function(req, res) {
    
    //Entries validations
    if (req.body.username === undefined){req.body.username = "";}
    if (req.body.password === undefined){req.body.password = "";}
    
    //Credentials
    var credentials = req.body, 
        criteria = {
            $or: [
            {
                username: credentials.username.trim()
            }, {
                email: credentials.username.trim()
            }
            ],
            password: utils.crypt(credentials.password)
        }; 
  
    return User.findOne(criteria, {
        password: 0
    }, function(error, user) {
        if (error !== null) {
            res.statusCode = 500;
            return res.end(JSON.stringify(error));
        } else if (user !== null) {
            req.session.user = user;
            res.statusCode = 200;
            return res.end(JSON.stringify(user));
        } else {
            res.statusCode = 403;
            return res.end(JSON.stringify({
                message: 'Invalid username/email or password'
            }));
        }
    });
};

//Logout
sessions.logout = function(req, res) {
  req.session.user = null;
  res.statusCode = 200;
  return res.end();
};