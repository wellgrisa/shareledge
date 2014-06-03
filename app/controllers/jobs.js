/*
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Job = mongoose.model('Job'),
    config = require('../../config/config'),
    i18n = require("i18next");

/**
 * Get Jobs
 */
exports.all = function(req, res) {
  Job.find().select('topTitle title icon positions').exec(function(err, jobs){
    if (!err) {
      Job.extendTranslationTexts(jobs, function(){
        res.json({data: jobs, applyNowText: i18n.t('Opportunities.apply')});
      });
    } else {
      return res.status(500).send(err);
    }
  });
};

exports.positions = function(req, res) {
  Job.findById(req.query.id, function (err, job){
    if (!err) {
      return res.json(job.positions);
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

  Job.list(options, function(err, jobs) {
    if (err) return res.render('500');
    Job.count().exec(function (err, count) {
      res.render('jobs/index', {
        jobs: jobs,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};

exports.new = function(req, res){
  res.render('jobs/form', {
    title: 'New Job',
    job: new Job({})
  });
};

var parsePositions = function(positionsStr){
  var positions = [];
  positionsStr.split('%%').forEach(function(_position){
    var position = _position.split('^');
    if (position[0]) {
      positions.push({ position : position[0], translate : position[1] === 'true' });
    }
  });
  return positions;
};

exports.create = function (req, res) {
  var job = new Job(req.body);
  job.positions = parsePositions(req.body.positionsStr);

  job.uploadAndSave(req.files.icon, function (err) {
    if (!err) {
      req.flash('success', 'Successfully created job!');
      return res.redirect('/bs-admin/jobs/'+job._id);
    }

    console.log(err);
    res.render('jobs/form', {
      title: 'New Job',
      job: job,
      errors: config.errors(err.errors || err)
    });
  });
};

exports.show = function(req, res){
  Job.findById(req.params.id, function (err, job){
    res.render('jobs/show', {
      title: 'Show Job',
      job: job
    });
  });
};

exports.edit = function (req, res) {
  Job.findById(req.params.id, function (err, job){
    res.render('jobs/form', {
      title: 'Edit Job',
      job: job,
      action: '/' + job._id
    });
  });
};

exports.update = function(req, res){
  Job.findById(req.params.id, function (err, job){
    // copy values
    job.topTitle = req.body.topTitle;
    job.title = req.body.title;
    if (req.body.icon) {
      job.icon = req.body.icon;
    }
    job.positions = parsePositions(req.body.positionsStr);
    
    job.uploadAndSave(req.files.icon, function (err) {
      if (!err) {
        req.flash('success', 'Successfully updated job!');
        return res.redirect('/bs-admin/jobs/'+job._id);
      }

      console.log(err);
      res.render('jobs/form', {
        title: 'Edit job',
        job: job,
        errors: config.errors(err.errors || err),
        action: '/' + job._id
      });
    });
  });
};

exports.destroy = function(req, res){
  Job.findById(req.params.id, function (err, job){
    job.remove(function(err){
      req.flash('info', 'Deleted successfully');
      res.redirect('/bs-admin/jobs');
    });
  });
};