//Export module
var remember = module.exports;

//Require modules
var path = require('path'),
    utils = require('./utilities'),
    mails = require('./mails'),
    schemas = require('./schemas'),
    User = schemas.User;


remember.inirem = function(getinfo , res){
    User.find({ email: getinfo.query.email }, function(err, userleft) {
        if (typeof userleft[0] !== 'undefined' && userleft[0] !== null) {
            mails.forgot(userleft);
            return "true";
        }
        else{
            return "false";
        }
        
    });
}