/*
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Question = mongoose.model('Question'),
    fs = require('fs'),
    config = require('../../config/config')
    uuid = require('node-uuid');

    mongoose.Model.paginate = function(opts, callback) {

     var criteria = opts.criteria || {};
     var populate = opts.populate || {};
     var limit = opts.limit || 10;
     var page = opts.page || 1;
     var Model = this;
     console.log('criteriaaa da booosta', criteria);
     Model.count(criteria, function (err, totalRecords) {
      var query = Model.find(criteria)
        .populate(populate)
        .skip((page - 1) * limit)
        .limit(limit);
      query.exec(function(error, records) {
        if (err) return callback(err);
        var result = {
          records: records,
          pagination : {
            totalRecords : totalRecords,
            currentPage : page,
            totalPages : Math.ceil(totalRecords / limit)
          }
        };

        console.log('paaaaaaages', result);

        callback(null, result);
      });
    });
   }

/**
 * Get Question
 */
exports.all = function(req, res) {
  console.log('message');
  Question.find({ type : req.user.filter }).sort('-created').populate('user solutions.user').exec(function(err, question){
    console.log(question);
    if (!err) {
        res.json({data: question});
    } else {
      return res.status(500).send(err);
    }
  });
};

exports.getOutstandingByFilter = function(req, res){

var criteria = req.query.filter.criteria;

if(criteria.user){
  criteria.user = new mongoose.Types.ObjectId(req.user._id);
}

var page = (req.query.filter.page > 0 ? req.query.filter.page : 1);
  var perPage = 1;
  var options = {
    perPage: perPage,
    page: page,
    criteria : criteria,
    populate : 'user solutions.user',
  };

return Question.paginate(options, function (err, questions){
        return res.json(questions);
  });
};

exports.counts = function(req, res) {
  Question.find({ type : req.user.filter }).sort('-created').populate('user solutions.user').exec(function(err, questions){
    var result = {
      myQuestions : 0,
      myAnsweredQuestions : 0,
      myOutstandingQuestions : 0,
      outstandingQuestions : 0,
      answeredOutstandingQuestions : 0,
      allQuestions : 0
    };
    for (var i = 0; i < questions.length; i++) {
      if(questions[i].user._id.toString() == new mongoose.Types.ObjectId(req.user._id)){
        result.myQuestions ++;
      }

      if(questions[i].user._id.toString() == new mongoose.Types.ObjectId(req.user._id) && questions[i].read == false && questions[i].useful == 0){
        result.myOutstandingQuestions ++;
      }

      if(questions[i].solutions.length == 0){
        result.outstandingQuestions ++;
      }
      if(questions[i].solutions.length > 0){
        var useful = false;
        for (var j = 0; j < questions[i].solutions.length; j++) {
          if(questions[i].solutions[j].useful > 0){
            useful = true;
            break;
          }
        }
        if(!useful){
          result.outstandingQuestions ++;
        }
        if(useful){
          result.answeredOutstandingQuestions ++;
          if(questions[i].user._id.toString() == new mongoose.Types.ObjectId(req.user._id)){
            result.myAnsweredQuestions ++;
          }
        }
      }
      result.allQuestions ++;
    }

    res.json({data: result});;
  });
};

exports.search = function(req, res) {

  var criteria = req.query.filter.criteria;

  var regex = new RegExp('^.*'+ 'o' +'.*$', "i");

  var page = (req.query.filter.page > 0 ? req.query.filter.page : 1);
  var perPage = 1;
  var options = {
    perPage: perPage,
    page: page,
    criteria : criteria,
    populate : 'user solutions.user',
  };

return Question.paginate(options, function (err, questions){
        return res.json(questions);
  });

  // Question.find({content: regex, type : req.user.filter }).sort('-views').exec(function(err, question){

  //   if (!err) {
  //       res.json({data: question});
  //   } else {
  //     return res.status(500).send(err);
  //   }
  // });
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
  return Question.findById(req.params.id).populate('user solutions.user').exec(function (err, question){
    console.log(question);
    if (!err) {
      return res.send(question);
    } else {
      return console.log(err);
    }
  });
};

exports.getByUser = function(req, res){
  return Question.find({'user' : new mongoose.Types.ObjectId(req.user._id), 'type' : req.user.filter}).populate('user solutions.user').exec(function (err, questions){
    console.log(questions);
    if (!err) {
      return res.send(questions);
    } else {
      return console.log(err);
    }
  });
};

exports.getOutstandingQuestions = function(req, res){
return Question.find({$or : [{"solutions.useful": 0}, {"solutions": {$size : 0}}], type : req.user.filter}).populate('user solutions.user').exec(function (err, questions){
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
    question.views ++;
    if(question.user._id.toString() == new mongoose.Types.ObjectId(req.user._id)){
      question.read = true;
    }else{
      console.log('-----------não o mesmo-------', req.user._id, question.user._id);
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
    var answerUpdated;
    for (var i = 0; i < question.solutions.length; i++) {
      if(question.solutions[i]._id == req.body.answer){
        if(req.body.rate == 'up'){
          question.solutions[i].useful = question.solutions[i].useful  + 1;
          question.useful ++;
        }else{
          question.solutions[i].useful = question.solutions[i].useful  - 1;
          question.useful --;
        }
        answerUpdated = question.solutions[i];
        console.log(question.solutions[i].useful);
      }
    }
    return question.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      console.log('answerupdated --- ', answerUpdated);
      return res.json(answerUpdated);
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

exports.uploadImage = function(req, res){

  var buff = new Buffer(req.body.img.replace(/^data:image\/(png|gif|jpeg);base64,/,''), 'base64');

  var filePath = 'img/questions/' + uuid.v4() + '.jpeg';

  fs.writeFile('public/' + filePath, buff, function (err) {
    console.log('uploaded with success');
    return res.json({ imgSrc : filePath});
  });
}
