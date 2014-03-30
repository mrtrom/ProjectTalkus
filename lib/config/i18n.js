var config = require('./config'),
		i18n = require('i18n');

i18n.configure({
	// setup some locales - other locales default to en silently
	locales:['es', 'en'],

	// where to store json files - defaults to './locales' relative to modules directory
	directory: './locales',

	// you may alter a site wide default locale
	defaultLocale: 'en',

	// sets a custom cookie name to parse locale settings from  - defaults to NULL
	cookie: config.cockieLocale
});

module.exports = function(req, res, next) {

	i18n.init(req, res);
	res.locals('__', res.__);

	i18n.setLocale(req, 'en');

	//var current_locale = i18n.getLocale();

	return next();
};