
exports.render = function(req, res) {
    res.render('process', {
      title: "title"
    });
};

exports.process = function(req, res) {
     res.render('process', {
      action: req.params.action,
      wonder: req.params.wonder
    });
};