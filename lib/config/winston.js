var winston = require('winston');

module.exports = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ json: false, timestamp: true }),
		new winston.transports.File({ filename: 'logs/debug.log', json: false })
	],
	exceptionHandlers: [
		new (winston.transports.Console)({ json: false, timestamp: true }),
		new winston.transports.File({ filename: 'logs/exceptions.log', json: false })
	],
	exitOnError: false
});