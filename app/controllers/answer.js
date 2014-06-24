/*
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Answer = mongoose.model('Answer');


exports.update = function(req, res){
console.log(req.body);

  Answer.findById(req.params.id, function (err, answer){
    console.log('---------------------------------------------');
    console.log(req.params.id);
    console.log('---------------------------------------------');
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
