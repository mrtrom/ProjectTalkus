//Export module
var fs = require('fs');
exports.post = function (req, res) {
    //TO SAVE IT AS BLOB
    fs.writeFile("lib/data/images/test.blob", req.body.profile, function(err) {
        res.send({imagefull: req.body.profile});
    });

    //ENABLE TO SAVE IT AS JPG
    /*var data = req.body.profile;

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