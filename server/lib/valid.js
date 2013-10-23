//User account gets validated.
//Export module
var valid = module.exports;

//Require modules
var schemas = require('./schemas'),
    utils = require('./utilities'),
    User = schemas.User;
    
//update mail sets confirmed to true in DB
valid.validate = function(req, res) {
    var user = new User();
    user._id = utils.UIdecrypt(req.body.id_valid);
    
    return User.findByIdAndUpdate({_id: user._id}, {$set: {confirmed: 'true'}}, 
    function(error) {
         if (error !== null) {
            res.statusCode = 500;
            return res.end(utils.parseError(error));
        } else {
            res.statusCode = 200;
            return res.end(JSON.stringify(user));
        }
    });
};