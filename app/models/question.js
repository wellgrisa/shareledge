var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Knowledge Schema
 */
var QuestionSchema = new Schema({
  content: {
    type: String,
    trim: true,
    required: 'Please fill in a question',
    default: ''
  },
  solutions: [{ answer : String }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Question', QuestionSchema);