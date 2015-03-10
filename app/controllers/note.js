var mongoose = require('mongoose'),
		Note = mongoose.model('Note'),		
		config = require('../../config/config'),
		helper = require('./helper.js');

exports.all = function(req, res) {
	Note.find().sort('-created').exec(function(err, notes){
		if (!err) {
			res.json(notes);
		} else {
			return res.status(500).send(err);
		}
	});
};
exports.create = function (req, res) {

	var note = new Note(req.body);

	note.user = req.user; 

	note.save(function(err) {
		if (err) {
			return res.send(400, {
				message: 'getErrorMessage(err)'
			});
		} else {
			res.jsonp(note);
		}
	});
};

exports.getById = function(req, res){
	return Note.findById(req.params.id).populate('user').exec(function (err, note){
		if (!err) {
			return res.send(note);
		} else {
			return console.log(err);
		}
	});
};

exports.update = function(req, res){
	Note.findById(req.params.id).exec(function (err, note){
		
		note.title = req.body.title;
		
		note.text = req.body.text;
		
		note.updated = new Date();

		return note.save(function (err) {			
			return res.json( { note : note, updatedBy : req.user } );
		});
	});
};

exports.delete = function(req, res){
	Note.findById(req.params.id).remove().exec(function(err){
		if (!err) {
			console.log("removed");
			return res.send('');
		} else {
			console.log(err);
		}
	});
};