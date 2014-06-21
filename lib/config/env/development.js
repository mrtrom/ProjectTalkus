'use strict';

module.exports = {
	env: 'development',
	cockieLocale: "lang",
	mongo: {
    uri: 'mongodb://mrtrom:12345@dharma.mongohq.com:10014/projecttalkus'
	},
	app:{
		hostname: "localhost",
		cookie_secret: "talkusproyect123",
		secret: "talkusproyect123"
	},
	opentokStates:{
		online: "online",
		waiting: "waiting",
		busy: "busy"
	}
};