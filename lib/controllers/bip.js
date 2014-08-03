//Export module
var mongoose = require('mongoose'),
    User = mongoose.model('User');

exports.post = function (req, res) {
    //console.log(req.body.user);
    User.findById(req.body.user._id, function (err, doc) {
        if(err){
            res.statusCode = 500;
            return res.end(JSON.stringify({
                message: 'User not found'
            }));
        }
        if(doc.bip){
            User.findByIdAndUpdate(req.body.user._id, { $set: { bip: doc.bip + 1 }}, function(err){
                if(err){
                    res.statusCode = 500;
                    return res.end(JSON.stringify({
                        message: 'Something went wrong while updating'
                    }));
                }
                res.statusCode = 200;
                return res.end(JSON.stringify({
                    message: 'User liked'
                }));
            })
        }
        else{
            User.findByIdAndUpdate(req.body.user._id, { $set: { bip: 1 }}, function(err){
                if(err){
                    res.statusCode = 500;
                    return res.end(JSON.stringify({
                        message: 'Something went wrong while updating'
                    }));
                }
                res.statusCode = 200;
                return res.end(JSON.stringify({
                    message: 'User liked'
                }));
            })
        }

    });
};
exports.get = function (req, res) {
    User.findById(req.params.id, function (err, doc) {
        if(err){
            res.statusCode = 500;
            return res.end(JSON.stringify({
                message: 'User not found'
            }));
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({
            likes: doc.bip
        }));
    });
};