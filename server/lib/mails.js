//Export module
var mails = module.exports;

//Require modules
var emailTemplates = require('email-templates'), 
    nodemailer = require('nodemailer'), 
    path = require('path'), 
    templatesDir = path.resolve(__dirname, '..', 'templates'),
    utils = require('./utilities'),
    mailsall,
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
    email: null,
    name: {
        first: null,
        id: null,
        url: null
    }
};
//sets variables like email and username, also the SEND function is called
mails.setmail = function(getinfo){
    locals.name.first = getinfo.query.username;
    locals.name.id = getinfo.query._id;
    locals.email = getinfo.query.email;
    locals.name.url = getinfo.headers.origin + "/#/welcome/?id_valid=";
    console.log(locals.name.url);
    mails.send();
}

//Send email to 1 user
mails.send = function(req, res) {
    return emailTemplates(templatesDir, function(err, template) {
        console.log(mailsall);
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
                    subject: 'Welcome to talkus!',
                    html: html,
                    text: text
                }, function(err, responseStatus) {
                    if (err) {
                        res.statusCode = 400;
                        console.log('error 3');
                        return res.end(utils.parseError(err));
                    } else {
                       // res.statusCode = 200;
                       // return res.end();
                    }
                });
            }
        });
    }
    });
};