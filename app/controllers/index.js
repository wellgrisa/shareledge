
exports.render = function(req, res) {
    res.render('process', {
      title: "title",
      user: req.user,
      action: req.params.action,
      wonder: req.params.wonder
    });
};

exports.index = function(req, res) {
    res.render('index', {
      title: "title"
    });
};