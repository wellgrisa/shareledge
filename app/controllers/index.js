
exports.render = function(req, res) {
    res.render('index', {
      title: "title"
    });
};

exports.process = function(req, res) {
    res.render('process');
};

exports.questions  = function(req, res) {
    res.render('questions');
};