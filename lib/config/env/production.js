'use strict';

module.exports = {
  env: 'production',
  cockieLocale: "lange",
  mongo: {
    uri: 'mongodb://mrtrom:alocse12@dharma.mongohq.com:10014/projecttalkus'
  },
  app:{
    hostname: "localhost",
    cookie_secret: "talkusproyect123",
    secret: "talkusproyect123"
  },
  opentok:{
    key: "44705712",
    secret: "bb8d17daed7147c29a101e3c9fb0ed9caa9e0816"
  },
  opentokStates:{
    online: "online",
    waiting: "waiting",
    busy: "busy"
  }
};