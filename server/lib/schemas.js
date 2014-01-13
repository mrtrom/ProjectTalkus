//Models
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

//Useful functions for data cleaning before save
var trim = function(value) {
  return value.trim();
};


//Users module's Schemas
var UserSchema = new Schema({
  username: {type: String, required: true, index: true, unique: true, set: trim},
  email: {type: String,required: true,unique: true,set: trim},
  password: {type: String,required: true},
  confirmed:{type: String , required: true},
  created: {type: Date},
  name: {type: String},
  gender: {type: String},
  avatar: {type: String},
  birth: {type: Date},
  location: {type: String},
  description: {type: String}
});



//=======Registering and exporting schemas========
module.exports.User = mongoose.model('User', UserSchema);