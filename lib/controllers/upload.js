//Export module
var fs = require('fs');
exports.post = function (req, res) {
    //TO SAVE IT AS BLOB
    if(req.body.photo === false){
        fs.unlink("lib/data/images/"+req.body.username+".blob", function (err) {
            res.send({imagefull: 'images/uploads/images/avatars/default.jpg'});
        });
    }
    else{
        fs.writeFile("lib/data/images/"+req.body.username+".blob", req.body.photo, function(err) {
            if (err) throw err;
            res.send({imagefull: req.body.photo});
        });
    }



    //ENABLE TO SAVE IT AS JPG
    /*var data = req.body.photo;

    function decodeBase64Image(dataString) {
        var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }

        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');

        return response;
    }

    var imageBuffer = decodeBase64Image(data);
    console.log(imageBuffer);
    fs.writeFile('lib/data/images/test.jpg', imageBuffer.data, function(err) {
    });*/
};
exports.get = function(req , res){
    fs.readFile("lib/data/images/"+req.body.username+".blob",'binary', function(error, data) {
        res.send({image: data});
    });
};