//User account gets validated.
//Export module
var valid = module.exports;

//Require modules
var schemas = require('./schemas'),
    utils = require('./utilities'),
    User = schemas.User;
    
//update mail
valid.validate = function(getinfo) {
    var user = new User();
    user._id = utils.UIdecrypt(getinfo.query.id_valid);
    return User.findByIdAndUpdate({
        _id: user._id
    }, {$set: {valid: 'true'}}, function(error) {
    });
};