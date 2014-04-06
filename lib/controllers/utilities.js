//Export module
var utils = module.exports;

//Import modules
var config = require('./../config/config'),
    logger = require('../config/winston'),
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
  logger.error('error:' + parsedError);
  return JSON.stringify(parsedError);
};


//User ID encrypt
utils.encrypt = function(text){
  if (text !== undefined){
    var cipher = crypto.createCipher('aes-256-cbc', config.app.secret),
        crypted = cipher.update(text,'utf8','hex');

    crypted += cipher.final('hex');

    return crypted;
  }
};

//User ID decript
utils.UIdecrypt = function(text){
  if (text !== undefined){
    var decipher = crypto.createDecipher('aes-256-cbc', config.app.secret),
        dec = decipher.update(String(text),'hex','utf8');

    dec += decipher.final('utf8');

    return dec;
  }
};


//Encrypt
utils.crypt = function(str) {
  var cipher = crypto.createCipher('aes-256-cbc', config.app.secret),
      crypted = cipher.update(str, 'utf8', 'base64');

  return crypted += cipher.final('base64');
};

//Decrypt
utils.decrypt = function(str) {
  var decipher = crypto.createDecipher('aes-256-cbc', config.app.secret),
      dec = decipher.update(str, 'base64', 'utf8');

  return dec += decipher.final('utf8');
};

//Remove object from array
utils.removeObjectArray = function(arr){
  var what,
      a = arguments,
      L= a.length,
      ax;

  while((L > 1) && (arr.length)){
    what = a[--L];
    while((ax= arr.indexOf(what))!== -1){
      arr.splice(ax, 1);
    }
  }
  return arr;
};

//Days between 2 dates
utils.daysBetween = function(mayDate, menDate){
  Date.prototype.DaysBetween = function(mayDate, menDate){
    var intMilDay = 24 * 60 * 60 * 1000,
        intMilDif = mayDate - menDate,
        intDays = Math.floor(intMilDif/intMilDay);

    return intDays;
  };
};