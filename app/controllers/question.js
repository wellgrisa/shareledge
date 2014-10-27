var Default = {
  Points : {
    NewQuestion : 1,
    NewAnswer : 2,
    AnswerMarkedAsRight : 5
  }
};

/*
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Question = mongoose.model('Question'),
    Tag = mongoose.model('Tag'),
    User = mongoose.model('User'),
    fs = require('fs'),
    _ = require('underscore'),
    config = require('../../config/config')
    uuid = require('node-uuid'),
    mime = require('mime'),
    slack = require('slack-notify')("https://bravi.slack.com/services/hooks/incoming-webhook?token=MCpfwNh6FtmKPVrgKx8p81Zs");

    mongoose.Model.paginate = function(opts, callback) {

     var criteria = opts.criteria || {};
     var populate = opts.populate || {};
     var order = opts.orderby || { updated: -1 }; // Order by CreatedDate DESC
     var limit = opts.limit || 10;
     var page = opts.page || 1;
     var Model = this;
console.log(opts);
     Model.count(criteria, function (err, totalRecords) {
      var query = Model.find(criteria)
        .populate(populate)
        .sort(order)
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

        callback(null, result);
      });
    });
   }

/**
 * Get Question
 */
exports.all = function(req, res) {
  Question.find({ type : req.user.filter }).sort('-created').populate('user solutions.user').exec(function(err, question){
    if (!err) {
        res.json({data: question});
    } else {
      return res.status(500).send(err);
    }
  });
};

exports.tags = function(req, res) {
  Tag.find({}, 'title', function (err, tags) {
    if (!err) {
      return res.send(tags);
    } else {
      return console.log(err);
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
    orderby : req.query.filter.orderby
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

  var page = (req.query.filter.page > 0 ? req.query.filter.page : 1);
  var perPage = 1;
  var options = {
    perPage: perPage,
    page: page,
    criteria : criteria,
    populate : 'user solutions.user',
    orderby : req.query.filter.orderby
  };

return Question.paginate(options, function (err, questions){
        return res.json(questions);
  });
};

exports.create = function (req, res) {

  var question = new Question(req.body);

  for (var i = 0; i < question.tags.length; i++) {


    Tag.update({title : question.tags[i]}, {$set: { title : question.tags[i] }}, {upsert : true}, function(err){
      console.log('\n---->', require('util').inspect(err, { depth: null, colors: true }));
    });
  }

  question.user = req.user;

  // slack.send({
  //   channel: '#' + question.type,
  //   text: 'New question created in the section [' + question.type + '] by ' + req.user.username,
  //   username: 'Shareledge'
  // });

  req.user.points += Default.Points.NewQuestion;
  req.user.save();

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
    if (!err) {
      return res.send(question);
    } else {
      return console.log(err);
    }
  });
};

exports.getByUser = function(req, res){
  return Question.find({'user' : new mongoose.Types.ObjectId(req.user._id), 'type' : req.user.filter}).populate('user solutions.user').exec(function (err, questions){
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
    if (!err) {
      return res.send(questions);
    } else {
      return console.log(err);
    }
  });
};

exports.update = function(req, res){
  Question.findById(req.params.id).populate('user solutions.user').exec(function (err, question){

    if(req.body.solutions){
      question.solutions = req.body.solutions;

      req.user.points += Default.Points.NewAnswer;
      req.user.save();
    }

    if(req.body.content){
      question.content = req.body.content;
    }

    if(req.body.tags){
      question.tags = req.body.tags;
    }

    question.read = req.body.read;

    question.updated = new Date();

    console.log(question);

    for (var i =0; i < question.solutions.length; i++) {
      if(!question.solutions[i].user){
        question.solutions[i].user = req.user;
      }
    }

    // slack.send({
    //   channel: '#' + question.type,
    //   text: 'Question made by ' + question.user.username + ' answered in the section [' + question.type + '] by ' + req.user.username,
    //   username: 'Shareledge'
    // });

    return question.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.json( { question : question, updatedBy : req.user } );
    });
  });
};

exports.updateRead = function(req, res){
  Question.findById(req.params.id).populate('user').exec(function (err, question){
    question.views ++;
    if(question.user._id.toString() == new mongoose.Types.ObjectId(req.user._id)){
      question.read = true;
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

exports.delete = function(req, res){
  Question.findById(req.params.id).remove().exec(function(err){
    if (!err) {
      console.log("removed");
      return res.send('');
    } else {
      console.log(err);
    }
  });
};

exports.deleteAnswer = function(req, res){
  Question.findById(req.params.id).exec(function (err, question){
    for (var i = 0; i < question.solutions.length; i++) {

      if(question.solutions[i]._id.toString() === new mongoose.Types.ObjectId(req.body.answer).toString()){
        console.log('eeee');
        question.solutions.splice(question.solutions.indexOf(question.solutions[i]));
      }
    }

    return question.save(function (err) {
      if (!err) {
        console.log("updated");
      } else {
        console.log(err);
      }
      return res.json( { question : question, updatedBy : req.user } );
    });
  });
};

exports.updateAnswer = function(req, res){
  Question.findById(req.params.id).populate('user solutions.user').exec(function (err, question){
    var answerUpdated;
    for (var i = 0; i < question.solutions.length; i++) {
      if(question.solutions[i]._id == req.body.answer){

        if(!question.solutions[i].helpedUsers.length){
          question.solutions[i].helpedUsers.push(req.user);
        }else{
          for (var j = 0; j < question.solutions[i].helpedUsers.length; j++) {
            if (!question.solutions[i].helpedUsers[j] == req.user._id) {
              question.solutions[i].helpedUsers.push(req.user);
            }
          }
        }

        if(req.body.rate == 'up'){

          question.solutions[i].useful = question.solutions[i].useful  + 1;
          question.useful ++;

          question.solutions[i].user.points += Default.Points.AnswerMarkedAsRight;
          question.solutions[i].user.save();

        }else{
          question.solutions[i].useful = question.solutions[i].useful  - 1;
          question.useful --;
        }
        answerUpdated = question.solutions[i];
      }
    }
    return question.save(function (err, savedQuestion) {
      if (!err) {
        console.log("updated");
        question.user.save();
      } else {
        console.log(err);
      }

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

exports.upload = function(req, res){

  console.log(  require('util').inspect(req.body, { depth: null, colors: true }));

  var file = req.body.img.split(';');

  var buff = new Buffer(file[1].split(',')[1], 'base64');

  var extension =  mime.extension(file[0].split(':')[1]);

  var fileName = uuid.v4() + '.' + extension;

  var folder = file[0].indexOf('image') > -1 ? 'img/questions/' : 'attachments/questions/';

  var filePath = folder + fileName;

  fs.writeFile('public/' + filePath, buff, 'binary', function (err) {
    return res.json({ src : filePath, ext : extension, fileName : fileName });
  });
}

exports.download = function(req, res){

  var path = require('path');
  var file = require('path').normalize(__dirname + '../../..') +  '\\public\\attachments\\questions\\' + req.query.src;

  console.log(  require('util').inspect(req, { depth: 3, colors: true }));

  var filename = path.basename(file);
  var mimetype = mime.lookup(file);

  res.setHeader('Content-disposition', 'attachment; filename=' + req.query.filename);
  res.setHeader('Content-type', mimetype);

  var filestream = fs.createReadStream(file);
  filestream.pipe(res);

}