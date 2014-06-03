/**
 * Module dependencies.
 */
 
var mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      config = require('../../config/config'),
      path = require('path'),
      fs = require('fs'),
      employeesPicturePath = '/img/equipe/',
      employeesPictureFullPath = path.join(config.root, config.static_public, employeesPicturePath);
 
/**
 * Employee Schema
 */
var EmployeeSchema = new Schema({
  name: String,
  message: String,
  picture: String
});

/**
 * Methods
 */
EmployeeSchema.methods = {
  uploadAndSave: function (file, callback) {
    var employee = this,
          picturePath = file.path;

    if (ignoreSavePicture(file, employee)) { 
      return employee.save(callback); 
    }

    // read uploaded file
    fs.readFile(picturePath, function (err, data) {
      if (err){ callback(err);}

      // genearete new picture name
      generatePictureName(employee, 1, file, function(pathSave){

        // save file
        fs.writeFile(pathSave, data, function (err) {
          if (err){ callback(err);}

          // save item on db
          employee.save(callback);
        });
      });
    });  
  }
};

/**
 * Statics
 */
EmployeeSchema.statics = {
  list: function (options, cb) {
    var criteria = options.criteria || {};

    this.find(criteria)
      // .populate('user', 'name')
      .sort('name') // sort by date
      // .limit(options.perPage)
      // .skip(options.perPage * options.page)
      .exec(cb);
  }
};
 

/**
 * Privates
 */
var generatePictureName = function(employee, empNumber, file, callback){
  if (employee._id && employee.picture) { return callback(path.join(config.root, config.static_public, employee.picture)); }

  var firstName = employee.name.split(' ')[0].toLowerCase(),
        originalPicturePath = file.path,
        pathSave = employeesPictureFullPath + firstName + empNumber + path.extname(originalPicturePath);

  if (ignoreSavePicture(file, employee)) {
    return callback(pathSave);
  }

  fs.exists(pathSave, function(exists) {
      if (exists) {
        empNumber += 1;
        generatePictureName(employee, empNumber, file, callback);
      } else {
        employee.picture = employeesPicturePath + firstName + empNumber + path.extname(originalPicturePath);
        callback(pathSave);
      }
  });
},
ignoreSavePicture = function(file, employee) {
  return file.size === 0 && employee._id;
};

mongoose.model('Employee', EmployeeSchema);