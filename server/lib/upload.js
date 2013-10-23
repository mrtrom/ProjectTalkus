//Export module
var upload = module.exports;

upload.post = function (req, res) {
    if (req.files.file){
        if (req.files.length === 0 || req.files.file.size === 0){
            res.statusCode = 500;
            return res.end();
        }else {
            var file = req.files.file;
            res.statusCode = 200;
            return res.end(JSON.stringify(file));
        }
    }
};