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
    key: "44738532",
    secret: "aab8554fbf3f4421add308ef9c0fdfa28dcdff39"
  },
  opentokStates:{
    online: "online",
    waiting: "waiting",
    busy: "busy"
  }
};