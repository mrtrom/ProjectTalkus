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
    locals.name.url = getinfo.headers.origin + "/#/welcome/?id_valid=";
    mails.send();
}
mails.delete = function(getinfo){
    locals.name.first = getinfo.session.user.username;
    locals.name.id = utils.encrypt(getinfo.session.user._id);
    locals.email = getinfo.session.user.email;
    locals.name.url = getinfo.headers.origin + "/#/welcome/?id_valid=";
    mails.send();
}
//checks to see what users have not confirmed their account and sends an email to each and one of them, 
//if 15 days have passed and not valid, then deletion
mails.usermailcheck = function(){
    try{
        function deleteUser(id){
            User.remove(
            { _id: id },
                function(error){
                    if (error !== null){
                      return error;  
                    }
            });
        }
        User.find({ confirmed: 'false' }, function(err, userleft) {
          if (err) return console.error(err);
          if(userleft.length > 0){
              Date.prototype.DaysBetween = function(){  
                    var intMilDay = 24 * 60 * 60 * 1000;  
                    var intMilDif = arguments[0] - this;  
                    var intDays = Math.floor(intMilDif/intMilDay);  
                    return intDays;  
                };
              for (var i = 0; i < userleft.length; i++) {
                var d1 = new Date(userleft[i].created);
                var today = new Date();
                var rest = new Date(today.setDate(d1.getDate()+15));
                var realRest = new Date().DaysBetween(rest);
                if(realRest <= 0){
                    deleteUser(userleft[i]._id);
                }else if(realRest == 7 || realRest == 1){
                    locals.email = userleft[i].email;
                    locals.name.first = userleft[i].username;
                    var stringID = generalParcer.format(userleft[i]._id);
                    locals.name.id = utils.encrypt(stringID);
                    locals.name.url = 'http://sergio.srobledo.c9.io/#/welcome/?id_valid=';
                    mails.send();
                }
            }
          }else{
              console.log('All users confirmed their email');
          }
          
        });
    }
    catch(e){
        console.log("Error " + e);
    }
}
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
                       // res.statusCode = 200;
                       // return res.end();
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
                       // res.statusCode = 200;
                       // return res.end();
                    }
                });
            }
        });
    }
    });
};