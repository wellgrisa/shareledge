
exports.render = function(req, res) {
  console.log('----------------------------' + req.user);
    res.render('process', {
      title: "title",
      user: req.user
    });
};

exports.process = function(req, res) {
     res.render('process', {
      action: req.params.action,
      wonder: req.params.wonder
    });
};