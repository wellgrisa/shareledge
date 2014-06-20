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

exports.positions = function(req, res) {
  Job.findById(req.query.id, function (err, job){
    if (!err) {
      return res.json(job.positions);
    } else {
      return res.status(500).send(err);
    }
  });
};

exports.index = function(req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 30;
  var options = {
    perPage: perPage,
    page: page
  };

  Job.list(options, function(err, jobs) {
    if (err) return res.render('500');
    Job.count().exec(function (err, count) {
      res.render('jobs/index', {
        jobs: jobs,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};

exports.new = function(req, res){
  res.render('jobs/form', {
    title: 'New Job',
    job: new Job({})
  });
};

var parsePositions = function(positionsStr){
  var positions = [];
  positionsStr.split('%%').forEach(function(_position){
    var position = _position.split('^');
    if (position[0]) {
      positions.push({ position : position[0], translate : position[1] === 'true' });
    }
  });
  return positions;
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
  return Question.findById(req.params.id).populate('solutions.user').exec(function (err, job){
    console.log(job);
    if (!err) {
      return res.send(job);
    } else {
      return console.log(err);
    }
  });
};

exports.edit = function (req, res) {
  Job.findById(req.params.id, function (err, job){
    res.render('jobs/form', {
      title: 'Edit Job',
      job: job,
      action: '/' + job._id
    });
  });
};

exports.update = function(req, res){
  Question.findById(req.params.id).populate('solutions.user').exec(function (err, question){

    question.solutions = req.body.solutions;

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

exports.updateAnswer = function(req, res){
  Question.findById(req.params.id, function (err, question){
console.log('------------------------------');
console.log(req.body);
console.log('------------------------------');
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
console.log('------------------------------');
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