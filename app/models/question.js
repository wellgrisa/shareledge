var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var AnswerSchema = new Schema({
  content: {
    type: String,
    trim: true,
    required: 'Please fill in a question',
    default: ''
  },
  useful:{ type: Number, default : 0 },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  }
});

mongoose.model('Answer', AnswerSchema);

var QuestionSchema = new Schema({
  content: {
    type: String,
    trim: true,
    required: 'Please fill in a question',
    default: ''
  },
  solutions: [AnswerSchema],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  type: { type: String, enum: ['hours', 'ebs'] },
  updated: {
    type: Date
  },
  read: { type : Boolean, default : true },
  created: {
    type: Date,
    default: Date.now
  },
  views:{ type: Number, default : 0 },
});

mongoose.model('Question', QuestionSchema);