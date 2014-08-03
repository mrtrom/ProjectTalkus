'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

//Useful functions for data cleaning before save
var trim = function(value) {
  return value.trim();
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  username: {type: String, required: true, index: true, unique: true, set: trim},
  email: {type: String,required: true,unique: true,set: trim},
  password: {type: String,required: true},
  confirmed:{type: String , required: true},
  created: {type: Date},
  name: {type: String},
  gender: {type: String},
  birth: {type: Date},
  location: {type: String},
  description: {type: String},
  bip:{type: Number}
});

/**
 * Validations
 */
UserSchema.path('username').validate(function(v) {
  return ((v !== null) && (typeof v === 'string') && (v.length));
}, 'invalid username');

UserSchema.path('email').validate(function(v) {
  return ((/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/).test(v));
}, 'invalid email format');

mongoose.model('User', UserSchema);
