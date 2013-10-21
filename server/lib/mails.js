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
        url: null,
        pass: null
    },
    subject: null
};

//sets variables like email and username, also the SEND function is called
//the user id is also being send on email so the account can be validated
mails.setmail = function(req, res){
    locals.name.first = req.body.user.username;
    locals.name.id = utils.encrypt(req.body.user._id);
    locals.email = req.body.user.email;
    locals.name.url = req.headers.origin + "/#/?id_valid=";
    locals.subject = 'Welcome to talkus!';
    mails.send(req, res, 'test');
};

//forgot password
mails.forgot = function(req, res) {
    locals.name.first = req.username;
    locals.email = req.email;
    locals.name.pass = utils.decrypt(req.password);
    locals.subject = 'User and password';
    mails.send(req, res, 'forgot');
};

//checks to see what users have not confirmed their account and sends an email to each and one of them, 
//if 15 days have passed and not valid, then deletion
mails.usermailcheck = function(req, res){
    
    function deleteUser(id){
        users.delete({username : id},
            function(response){
                res.statusCode = 200;
                return res.end();
            },
            function(error){
                res.statusCode = 500;
                return res.end(utils.parseError(error));
            }
        );
    }
    
    User.find({ confirmed: 'false' }, 
        function(err, users) {
            if (err){
                res.statusCode = 500;
                return res.end(utils.parseError(err));
            }
            else{
                if(users.length > 0){
                    for (var i = 0; i < users.length; i++) {
                        
                        var createdDate = new Date(users[i].created), //Account created date
                            realRest = Math.floor((new Date() - createdDate) / 86400000); //days diff between dates
                        
                        if(realRest >= 15){
                            deleteUser(users[i]._id);
                        }
                        else{
                            if(realRest == 7 || realRest == 14){
                                locals.email = users[i].email;
                                locals.name.first = users[i].username;
                                locals.name.id = utils.encrypt(generalParcer.format(users[i]._id));
                                locals.name.url = res.headers.origin + "/#/?id_valid=";
                                mails.send(req, res, 'test');
                            }
                        }
                    }
                    res.statusCode = 200;
                    return res.end(JSON.stringify({message:'all messages sent'}));
                }else{
                    console.log('All users confirmed their email');
                    res.statusCode = 204;
                    return res.end(JSON.stringify({message:'no users without confirm'}));
                }   
            }
        }
    );
};

//Send email to 1 user
mails.send = function(req, res, templateName) {
    return emailTemplates(templatesDir, function(err, template) {
        if (err) {
            res.statusCode = 500;
            return res.end(utils.parseError(err));
        } else {
            return template(templateName, locals, function(err, html, text) {
                if (err) {
                    res.statusCode = 404;
                    return res.end(JSON.stringify({
                        err: utils.parseError(err),
                        message: 'template not found'
                    }));
                } else {
                    return mails.smtpTransport.sendMail({
                        from: "Talkus Team <proyecttalkus@gmail.com>",
                        to: locals.email,
                        subject: locals.subject,
                        html: html,
                        text: text
                    }, function(err, responseStatus) {
                        if (err) {
                            res.statusCode = 500;
                            return res.end(utils.parseError(err));
                        } else {
                           res.statusCode = 200;
                           return res.end(JSON.stringify({message: 'mail send'}));
                        }
                    });
                }
            });
        }
    });
};