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
        wonder: req.params.wonder,
        language: req.i18n.lng(),
        showTour: req.user.showTour
      });

    } else {
      return console.log(err);
    }
  });
};

exports.index = function(req, res) {

    set_lang(req, res, function(){
      res.render('questions', {
        title: "title",
        user: req.user,
        action: req.params.action,
        wonder: req.params.wonder,
        language: req.i18n.lng(),
        showTour: req.user.showTour				
      });
			//res.render('questions');
    });
};

var set_lang = function(req, res, callback) {
  // Nothing to change, just run the callback
  if(!req.query.lang) {
    callback();
    return;
  }

  // Force to reload the page to change the language
  return res.redirect('/');
};