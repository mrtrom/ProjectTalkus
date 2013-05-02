//Models
var mongoose = require('mongoose'),
    Schema = mongoose.Schema, 
    ObjectId = Schema.ObjectId;

//Useful functions for data cleaning before save
var trim = function(value) {
  return value.trim();
};


//Users module's Schemas
var UserSchema = new Schema({
  username: {type: String, required: true, index: true, unique: true, set: trim},
  email: {type: String,required: true,unique: true,set: trim},
  password: {type: String,required: true},
  name: {type: String},
  gender: {type: String},
  avatar: {type: String},
  birth: {type: Date},
  location: [ObjectId],
  description: {type: String}
});

//Location module's Schemas
var LocationSchema = new Schema({
    latitude: {type: String, required: true},
    longitude: {type: String, required: true}
});


//=======Registering and exporting schemas========
module.exports.User = mongoose.model('User', UserSchema);
module.exports.Location = mongoose.model('Location', LocationSchema);