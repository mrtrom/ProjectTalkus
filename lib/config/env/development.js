'use strict';

module.exports = {
  env: 'development',
  mongo: {
    uri: 'mongodb://mrtrom:alocse12@dharma.mongohq.com:10014/projecttalkus'
  },
  app:{
    pub_dir: "public",
    cookie_secret: "talkusproyect123",
    secret: "talkusproyect123"
  }
};