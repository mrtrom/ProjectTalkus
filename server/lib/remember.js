//Export module
var remember = module.exports;

//Require modules
var utils = require('./utilities'),
    mails = require('./mails'),
    schemas = require('./schemas'),
    User = schemas.User;


remember.inirem = function(req , res){
    return User.find({ email: req.body.forgotemail }, function(err, userleft) {
        if (typeof userleft[0] !== 'undefined' && userleft[0] !== null) {
            mails.forgot(userleft);
            return res.end('t');
        }
        else{
            return res.end('f');
        }
        
    });
};