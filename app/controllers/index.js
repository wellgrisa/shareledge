var mongoose = require('mongoose'),
    Question = mongoose.model('Question');

exports.render = function(req, res) {

  var outstandingQuestions = 0;
  Question.count({'user' : new mongoose.Types.ObjectId(req.user._id), 'read' : false}).populate('user solutions.user').exec(function (err, questions){
    if (!err) {
      outstandingQuestions = questions;

      res.render('process', {
        title: "title",
        user: req.user,
        outstandingQuestionsByUser : outstandingQuestions,
        action: req.params.action,
        wonder: req.params.wonder
      });

    } else {
      return console.log(err);
    }
  });
};

exports.index = function(req, res) {
    res.render('index', {
      title: "title"
    });
};