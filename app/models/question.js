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
  helpedUsers: [Schema.Types.ObjectId],
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
  type: { type: String, enum: ['hours', 'ebs', 'peopleCare', 'sits', 'administrative', 'solutions', 'test', 'translation'] },
  updated: {
    type: Date,
    default: Date.now
  },
  read: { type : Boolean, default : true },
  created: {
    type: Date,
    default: Date.now
  },
  views:{ type: Number, default : 0 },
  tags: [String],
  useful:{ type: Number, default : 0 }
});

mongoose.model('Question', QuestionSchema);

QuestionSchema.virtual('test').get(function () {
  console.log('-----------|||||||||||||||||||||');
  return this.updated ?  this.updated : this.created;
});