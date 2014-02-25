'use strict';

module.exports = {
  env: 'development',
  mongo: {
    uri: 'mongodb://mrtrom:alocse12@dharma.mongohq.com:10014/projecttalkus'
  },
  app:{
    hostname: "localhost",
    cookie_secret: "talkusproyect123",
    secret: "talkusproyect123"
  },
  opentok:{
    key: "44655492",
    secret: "3ddad7f251094379982745c9bf2b8eb6a77c9d8f"
  }
};