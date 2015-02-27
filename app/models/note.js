var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var NoteSchema = new Schema({
  title: {
    type: String,
    trim: true
  },
	text: {
    type: String    
  },
	due: {
    type: Date
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  },
	user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

mongoose.model('Note', NoteSchema);