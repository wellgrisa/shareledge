var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Question = mongoose.model('Question');

exports.login = function(req, res) {
  res.render('login', { message: req.flash('loginMessage') });
};

exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

exports.signup = function(req, res) {

  var user = new User(req.body);

  var message = null;

  user.provider = 'local';

  // Then save the user
  user.save(function(err) {
    if (err) {
      return res.send(404, {
        message: err
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function(err) {
        if (err) {
          res.send(400, err);
        } else {
          res.redirect('/');
        }
      });
    }
  });
};

exports.finishTour = function(req, res){

  User.findById(req.user._id).exec(function (err, user){
      console.log(user);
      user.showTour = false;

      return user.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.json(user);
      });

  });
};

exports.score = function(req, res){
  User.findById(req.user._id).exec(function (err, user){
      return res.json( { points : req.user.points} );
  });
};

exports.updateFilter = function(req, res){

  User.findById(req.user._id).exec(function (err, user){

      user.filter = req.body.filter;

      return user.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.json(user);
      });

  });
};

exports.addSearchCount = function(req, res){

  User.findById(req.user._id).exec(function (err, user){

      user.searches ++;

      return user.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.json(user);
      });

  });
};

exports.signin = function(passport) {
  return passport.authenticate('local', {
      successRedirect : '/', // redirect to the secure profile section
      failureRedirect : '/login', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    });
};

var Trello = require("node-trello");
var t = new Trello("89cd2f7fe3a8d349f8a628fe84345dcb", "0ec10867c2a4bd3c2dfbad8041e95a9553ccb8456a665824bb2e5837da6b7ca8");

exports.feedback = function(req, res) {

  var card =  {
   name: req.body.name + ' - by - ' + req.body.feedbacksection,
   desc : req.body.desc + ' - by - ' + req.user.username
 };

  t.post('/1/lists/542ee0965cec27df9455e5b2/cards', card, function(err,data){
    if (err) {
      console.log("err " + err);
    } else {
     console.log(data);
   }
 });

 res.redirect('/');

};

exports.dashboard = function(req, res) {

  var dash = { 
    outstandingQuestions : 0,
    answeredQuestions : 5,
    helpedPeople : 0,
    totalTags : 0,
    tags : []
  };
  
  // Outstanding questions
  Question.find({solutions : {$size : 0}}).count().exec(function (err, data){
    dash.outstandingQuestions = data; 

    // How many answered questions and marked as useful
    Question.find({$and : [
        {'solutions.0' : {$exists : true}},
        {'useful' : {$gt : 0}}
      ]}).count()
    .exec(function (err, data){
      dash.answeredQuestions = data;

      // How many people were helped (Just questions marked as useful)
      Question.distinct(
        'user',
          {$and : [
              {'solutions.0' : {$exists : true}},
              {'useful' : {$gt : 0}}
          ]}
        )
      .exec(function (err, data){
        dash.helpedPeople = data.length;

        // Counting the most used tags
        Question.aggregate([        
            { $unwind : "$tags" },
            { $project: { tags: { $toLower: "$tags" } } },
            { $group: { _id: "$tags", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit : 6 } 
          ])
        .exec(function (err, data){        
          dash.tags = data;  

          //Total of tags
          Question.distinct('tags').exec(function (err, data){    
            dash.totalTags = data.length;

            return res.render('admin/dashboard', { 'data' : dash });
          });        
        });
      });
    });   		
  });
};

