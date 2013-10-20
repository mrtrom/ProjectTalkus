//Export module
var mails = module.exports;

//Require modules
var emailTemplates = require('email-templates'), 
    nodemailer = require('nodemailer'), 
    path = require('path'),
    generalParcer = require('util'),
    templatesDir = path.resolve(__dirname, '..', 'templates'),
    utils = require('./utilities'),
    schemas = require('./schemas'),
    users = require("./users"),
    url = require('url'),
    User = schemas.User,
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
var dataforgot = {
    email: null,
    name: {
        first: null,
        pass: null
    }
};

//sets variables like email and username, also the SEND function is called
//the user id is also being send on email so the account can be validated
mails.setmail = function(getinfo){
    locals.name.first = getinfo.query.username;
    locals.name.id = utils.encrypt(getinfo.query._id);
    locals.email = getinfo.query.email;
    locals.name.url = getinfo.headers.origin + "/#/?id_valid=";
    mails.send();
};
//checks to see what users have not confirmed their account and sends an email to each and one of them, 
//if 15 days have passed and not valid, then deletion
mails.usermailcheck = function(res){
    function deleteUser(id){
        users.delete({username : id},
            function(response){
                res.statusCode = 200;
                return res.end();
            },
            function(error){
                res.statusCode = 400;
                return res.end(utils.parseError(error));
            }
        );
    }
    User.find({ confirmed: 'false' }, 
        function(err, userleft) {
            if (err){
                res.statusCode = 400;
                return res.end(utils.parseError(err));
            }
            
            if(userleft.length > 0){
                for (var i = 0; i < userleft.length; i++) {
                    
                    var createdDate = new Date(userleft[i]), //Account created date
                        realRest = Math.floor((new Date() - createdDate) / 86400000); //days diff between dates
                    
                    if(realRest >= 15){
                        deleteUser(userleft[i]._id);
                    }
                    else 
                        if(realRest == 7 || realRest == 14){
                            locals.email = userleft[i].email;
                            locals.name.first = userleft[i].username;
                            var stringID = generalParcer.format(userleft[i]._id);
                            locals.name.id = utils.encrypt(stringID);
                            locals.name.url = res.headers.origin + "/#/?id_valid=";
                            mails.send();
                    }
                }
                res.statusCode = 200;
                return res.end();
            }else{
                console.log('All users confirmed their email');
                res.statusCode = 200;
                return res.end();
            }
        }
    );
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
                    subject: 'Welcome to talkus!',
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

//forgot password
mails.forgot = function(getall, res) {
    dataforgot.email = generalParcer.format(getall[0].email);
    dataforgot.name.first = generalParcer.format(getall[0].username);
    dataforgot.name.pass = utils.decrypt(getall[0].password);
    return emailTemplates(templatesDir, function(err, template) {
    if (err) {
        res.statusCode = 400;
        return res.end(utils.parseError(err));
    } else {
        return template('forgot', dataforgot, function(err, html, text) {
            if (err) {
            res.statusCode = 400;
            return res.end(utils.parseError(err));
            } else {
                return mails.smtpTransport.sendMail({
                    from: "Talkus Team <proyecttalkus@gmail.com>",
                    to: dataforgot.email,
                    subject: 'Talkus User and Password',
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