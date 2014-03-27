//User account gets validated.
//Export module
var valid = module.exports;

//Require modules
var utils = require('./utilities'),
    mongoose = require('mongoose'),
    User = mongoose.model('User');

//update mail sets confirmed to true in DB
valid.validate = function(req, res) {
  var user = new User();
  user._id = utils.UIdecrypt(req.body.idValid);

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