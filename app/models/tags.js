var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var TagSchema = new Schema({
  title: {
    type: String,
    trim: true,
    unique: true,
  }
});

mongoose.model('Tag', TagSchema);