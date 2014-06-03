/**
 * Module dependencies.
 */
 
var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      config = require('../../config/config'),
      path = require('path'),
      fs = require('fs'),
      _ = require('underscore'),
      i18n = require("i18next"),
      jobsPicturePath = '/img/job/',
      jobsPictureFullPath = path.join(config.root, config.static_public, jobsPicturePath);
 
/**
 * Job Schema
 */
var JobSchema = new Schema({
  topTitle: String,
  title: String,
  icon: String,
  positions: [{ position : String, translate : Boolean }]
});

/**
 * Methods
 */
JobSchema.methods = {
  uploadAndSave: function (file, callback) {
    var job = this,
          picturePath = file.path;

    if (ignoreSavePicture(file, job)) { 
      return job.save(callback); 
    }

    // read uploaded file
    fs.readFile(picturePath, function (err, data) {
      if (err){ callback(err);}

      // genearete new icon name
      generateIconName(job, 1, file, function(pathSave){

        // save file
        fs.writeFile(pathSave, data, function (err) {
          if (err){ callback(err);}

          // save item on db
          job.save(callback);
        });
      });
    });  
  }
};

/**
 * Statics
 */
JobSchema.statics = {
  list: function (options, cb) {
    var criteria = options.criteria || {};

    this.find(criteria)
      .populate('user', 'name')
      // .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  },
  extendTranslationTexts: function(jobs, callback) {
    for (var i = 0; i < jobs.length; i++) {
      var transFilds = {             
        topTitle : i18n.t('Opportunities.vacancy' + (i + 1) + '.topTitle'),
        title: i18n.t('Opportunities.vacancy' + (i + 1) + '.title'),      
        area: i18n.t('Opportunities.vacancy' + (i + 1) + '.area')
      };

      _.extend(jobs[i], transFilds);
    }
    callback(jobs);
  }
};
 

/**
 * Privates
 */
var generateIconName = function(job, imgNumber, file, callback){
  if (job._id && job.icon) { return callback(path.join(config.root, config.static_public, job.icon)); }

  var firstName = job.topTitle.split(' ')[0].toLowerCase(),
        originalPicturePath = file.path,
        pathSave = jobsPictureFullPath + firstName + imgNumber + path.extname(originalPicturePath);

  if (ignoreSavePicture(file, job)) {
    return callback(pathSave);
  }

  fs.exists(pathSave, function(exists) {
      if (exists) {
        imgNumber += 1;
        generateIconName(job, imgNumber, file, callback);
      } else {
        job.icon = jobsPicturePath + firstName + imgNumber + path.extname(originalPicturePath);
        callback(pathSave);
      }
  });
},
ignoreSavePicture = function(file, job) {
  return file.size === 0 && job._id;
};

mongoose.model('Job', JobSchema);