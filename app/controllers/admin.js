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
var t = new Trello("89cd2f7fe3a8d349f8a628fe84345dcb", "602f8a72333e7a394966f486d0f1906a853390b403f0f161f5426840c3159150");

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

  var param = {
    max_leaders : isNaN(parseInt(req.query.max_leaders)) ? 10 : req.query.max_leaders,
    type: req.query.type == undefined ? 'ebs' : req.query.type,
    max_tags : isNaN(parseInt(req.query.max_tags)) ? 10 : req.query.max_tags
  };
  var dash = { 
    sinceFirstRelease : 0,
    lastMonthQuestions : 5,
    helpedPeople : 0,
    totalTags : 0,
    tags : [],
    users : []
  };
  var knowhowReleaseDate = new Date(2014, 9, 3); // "03/10/2014"
  var lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  
  // Questions since Knowhow has released
  Question.find({
    $and : [
      {created : {$gte : knowhowReleaseDate}},
      {type : 'ebs'}
    ]
  }).count().exec(function (err, data){

    dash.sinceFirstRelease = data; 

    // Questions from Last Month
    Question.find({
      $and : [
        {created : {$gte : lastMonthDate}},
        {type : 'ebs'}
      ]}).count()
    .exec(function (err, data){
      dash.lastMonthQuestions = data;

      // How many people were helped (Just questions marked as useful)
      Question.distinct(
        'user',
          {$and : [
            {'solutions.0' : {$exists : true}},
            {'useful' : {$gt : 0}},
            {'type' : param.type}
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
            { $limit : param.max_tags } 
          ])
        .exec(function (err, data){        
          dash.tags = data;  

          //Total of tags
          Question.distinct('tags', {'type' : param.type}).exec(function (err, data){    
            dash.totalTags = data.length;

            // Users and their points
            User.find(
              { points : { $exists : true }, google : { $exists : true }}, // has to be connected through a Bravi Google's account
              { points : 1, filter : 1, "google.name" : 1, "google.picture" : 1}
            ).sort ( { points : -1} )
             .limit(param.max_leaders) // URL Parameter
             .exec(function (err, data) {

                for (var i = 0; i < data.length; i++) {
                  var user = data[i];                  
                  var spaceIndex = user.google.name.indexOf(" ");

                  var userToBeAdded = {
                    name : spaceIndex > 0 ? user.google.name.substring(0, spaceIndex + 2) + '.' : user.google.name,
                    points : user.points,
                    photo : user.google.picture ,
                    id : user._id,
                    position : i + 1
                  }
                  dash.users.push(userToBeAdded);
                }
                return res.json(dash);
            });   // Users and their points
          });     //Total of tags       
        });       // Counting the most used tags
      });         // How many people were helped (Just questions marked as useful)
    });           // Questions from Last Month
  });             // Questions since Knowhow has released
};