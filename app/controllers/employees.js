/*
 * Module dependencies.
 */
var _ = require('underscore'),
    mongoose = require('mongoose'),
    Employee = mongoose.model('Employee'),
    config = require('../../config/config');

/**
 * Get Employees
 */
exports.all = function(req, res) {
  Employee.find().select('-_id name message picture').sort('name').exec(function(err, employees){
    if (!err) {
      return res.json(employees);
    } else {
      return res.status(500).send(err);
    }
  });
};

exports.index = function(req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 30;
  var options = {
    perPage: perPage,
    page: page
  };

  Employee.list(options, function(err, employees) {
    if (err) return res.render('500');
    Employee.count().exec(function (err, count) {
      res.render('employees/index', {
        employees: employees,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};

exports.new = function(req, res){
  res.render('employees/form', {
    title: 'New Employee',
    employee: new Employee({})
  });
};

exports.create = function (req, res) {
  var employee = new Employee(req.body);

  employee.uploadAndSave(req.files.picture, function (err) {
    if (!err) {
      req.flash('success', 'Successfully created employee!');
      return res.redirect('/bs-admin/employees/'+employee._id);
    }

    console.log(err);
    res.render('employees/form', {
      title: 'New employee',
      employee: employee,
      errors: config.errors(err.errors || err)
    });
  });
};

exports.show = function(req, res){
  Employee.findById(req.params.id, function (err, employee){
    res.render('employees/show', {
      title: 'Show Employee',
      employee: employee
    });
  });
};

exports.edit = function (req, res) {
  Employee.findById(req.params.id, function (err, employee){
    res.render('employees/form', {
      title: 'Edit Employee',
      employee: employee,
      action: '/' + employee._id
    });
  });
};

exports.update = function(req, res){
  Employee.findById(req.params.id, function (err, employee){
    // copy values
    employee.name = req.body.name;
    employee.message = req.body.message;
    if (req.body.picture) {
      employee.picture = req.body.picture;
    }
    
    employee.uploadAndSave(req.files.picture, function (err) {
      if (!err) {
        req.flash('success', 'Successfully updated employee!');
        return res.redirect('/bs-admin/employees/'+employee._id);
      }

      console.log(err);
      res.render('employees/form', {
        title: 'Edit employee',
        employee: employee,
        errors: config.errors(err.errors || err),
        action: '/' + employee._id
      });
    });
  });
};

exports.destroy = function(req, res){
  Employee.findById(req.params.id, function (err, employee){
    employee.remove(function(err){
      req.flash('info', 'Deleted successfully');
      res.redirect('/bs-admin/employees');
    });
  });
};