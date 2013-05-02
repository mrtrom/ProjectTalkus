//Home Page
exports.index = function(req, res){
  res.render('index');
};

//Partials Page's
exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};