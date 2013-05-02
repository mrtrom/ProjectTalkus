//Export module
var utils = module.exports;

//Import modules
var CONF = require('config'),
    crypto = require('crypto');

//Error types
utils.parseError = function(error) {
    var e, parsedError, type;

    parsedError = {
        errors: []
    };
    switch (error.name) {
        case 'ValidationError':
        for (e in error.errors) {
            parsedError.errors.push({
            path: error.errors[e].path,
            type: error.errors[e].type
            });
        }
        break;
        case 'MongoError':
        switch (error.code) {
            case 11000:
            type = 'duplicate';
        }
        parsedError.errors.push({
            path: error.err.substring(error.err.indexOf('$') + 1, error.err.indexOf('_')),
            type: type
        });
    }
    return JSON.stringify(parsedError);
};


//Encrypt
utils.crypt = function(str) {
    var cipher = crypto.createCipher('aes-256-cbc', CONF.app.secret),
    crypted = cipher.update(str, 'utf8', 'base64');
    return crypted += cipher.final('base64');
};

//Decrypt
utils.decrypt = function(str) {
    var decipher = crypto.createDecipher('aes-256-cbc', CONF.app.secret),
    dec = decipher.update(str, 'base64', 'utf8');
    return dec += decipher.final('utf8');
};