'use strict';

module.exports = {
	env: 'development',
	cockieLocale: "lang",
	mongo: {
		uri: 'mongodb://localhost/projecttalkus'
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