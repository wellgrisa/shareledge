/*
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Question = mongoose.model('Question'),
    config = require('../../config/config');

/**
 * Get Question
 */
exports.all = function(req, res) {
  console.log('message');
  Question.find().exec(function(err, question){
    console.log(question);
    if (!err) {
        res.json({data: question});
    } else {
      return res.status(500).send(err);
    }
  });

};

exports.search = function(req, res) {

  var regex = new RegExp('^.*'+ req.params.search +'.*$', "i");

  Question.find({content: regex }).exec(function(err, question){

    if (!err) {
        res.json({data: question});
    } else {
      return res.status(500).send(err);
    }
  });
};

exports.create = function (req, res) {
  console.log('create');
  var question = new Question(req.body);
  question.user = req.user;

  question.save(function(err) {
    if (err) {
      return res.send(400, {
        message: 'getErrorMessage(err)'
      });
    } else {
      res.jsonp(question);
    }
  });
};

exports.getById = function(req, res){
  return Question.findById(req.params.id).populate('solutions.user').exec(function (err, question){
    console.log(question);
    if (!err) {
      return res.send(question);
    } else {
      return console.log(err);
    }
  });
};

exports.getByUser = function(req, res){
  return Question.find({'user' : new mongoose.Types.ObjectId(req.user._id)}).populate('user solutions.user').exec(function (err, questions){
    console.log(questions);
    if (!err) {
      return res.send(questions);
    } else {
      return console.log(err);
    }
  });
};

exports.getOutstandingQuestions = function(req, res){
return Question.find({$or : [{"solutions.useful": 0}, {"solutions": {$size: 0}}]}).populate('user solutions.user').exec(function (err, questions){
    if (!err) {
      return res.send(questions);
    } else {
      return console.log(err);
    }
  });
};

exports.getOutstandingQuestionsByUser = function(req, res){
return Question.count({'user' : new mongoose.Types.ObjectId(req.user._id), 'read' : false}).populate('user solutions.user').exec(function (err, questions){
    console.log(questions);
    if (!err) {
      return res.send(questions);
    } else {
      return console.log(err);
    }
  });
};

exports.update = function(req, res){
  Question.findById(req.params.id).populate('solutions.user').exec(function (err, question){

    question.solutions = req.body.solutions;

    question.read = false;

    for (var i =0; i < question.solutions.length; i++) {
      question.solutions[i].user = req.user;
    }

    return question.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.json(question);
    });
  });
};

exports.updateRead = function(req, res){
  Question.findById(req.params.id).populate('user').exec(function (err, question){
    if(question.user._id.toString() == new mongoose.Types.ObjectId(req.user._id)){
      question.read = true;

      return question.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.json(question);
      });
    }else{
      console.log('-----------não o mesmo-------', req.user._id, question.user._id);
    }
  });
};

exports.updateAnswer = function(req, res){
  Question.findById(req.params.id, function (err, question){

    for (var i = 0; i < question.solutions.length; i++) {
      if(question.solutions[i]._id == req.body.answer){
        if(req.body.rate == 'up'){
          question.solutions[i].useful = question.solutions[i].useful  + 1;
        }else{
          question.solutions[i].useful = question.solutions[i].useful  - 1;
        }

        console.log(question.solutions[i].useful);
      }
    }
    return question.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.json(question);
    });
  });
};

exports.destroy = function(req, res){
  Job.findById(req.params.id, function (err, job){
    job.remove(function(err){
      req.flash('info', 'Deleted successfully');
      res.redirect('/bs-admin/jobs');
    });
  });
};