'use strict';

module.exports = {
  env: 'development',
  mongo: {
    uri: 'mongodb://localhost/fullstack'
  },
  app:{
    hostname: "localhost",
    cookie_secret: "talkusproyect123",
    secret: "talkusproyect123"
  },
  opentok:{
    key: "44705712",
    secret: "bb8d17daed7147c29a101e3c9fb0ed9caa9e0816"
  }
};