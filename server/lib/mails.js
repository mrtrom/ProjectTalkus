//Export module
var mails = module.exports;

//Require modules
var emailTemplates = require('email-templates'), 
    nodemailer = require('nodemailer'), 
    path = require('path'), 
    templatesDir = path.resolve(__dirname, '..', 'templates'),
    utils = require('./utilities'),
    locals;

//Mail service configuration
mails.smtpTransport = nodemailer.createTransport('SMTP', {
    service: "Gmail",
    auth: {
        user: "proyecttalkus@gmail.com",
        pass: "projecttalkus2013"
    }
});

//JSON object list of mails
locals = {
    email: 'sergiorobledo2k5@gmail.com',
    name: {
        first: 'Sergio',
        last: 'Robledo'
    }
};


//Send email to 1 user
mails.send = function(req, res) {
    return emailTemplates(templatesDir, function(err, template) {
    if (err) {
        res.statusCode = 400;
        return res.end(utils.parseError(err));
    } else {
        return template('test', locals, function(err, html, text) {
            if (err) {
            res.statusCode = 400;
            return res.end(utils.parseError(err));
            } else {
                return mails.smtpTransport.sendMail({
                    from: "Talkus Team <proyecttalkus@gmail.com>",
                    to: locals.email,
                    subject: 'Test template mail',
                    html: html,
                    text: text
                }, function(err, responseStatus) {
                    if (err) {
                        res.statusCode = 400;
                        console.log('error 3');
                        return res.end(utils.parseError(err));
                    } else {
                        res.statusCode = 200;
                        return res.end();
                    }
                });
            }
        });
    }
    });
};