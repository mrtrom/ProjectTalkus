//Export module
var upload = module.exports;

upload.post = function (req, res) {
    console.log(req.files);
    console.log(req.file);
    console.log(req.body);
    console.log(req.photo);
};