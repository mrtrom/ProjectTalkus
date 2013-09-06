//Export module
var remember = module.exports;

//Require modules
var path = require('path'),
    utils = require('./utilities'),
    mails = require('./mails'),
    schemas = require('./schemas'),
    User = schemas.User;


remember.inirem = function(req , res){
    User.find({ email: req.body.forgotemail }, function(err, userleft) {
        if (typeof userleft[0] !== 'undefined' && userleft[0] !== null) {
            mails.forgot(userleft);
        }
        else{
            
        }
        
    });
}