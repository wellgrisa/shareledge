/*
 * Module dependencies.
 */
var curriculum_mailer = require('../mailers/curriculum-mailer'),
    optional_job_position = '';

/**
 * Home Page
 */
exports.render = function(req, res) {
  var config = require('../../config/config');
  optional_job_position = req.i18n.t('Apply.optional_job_position');
  set_lang(req, res, function(){
    res.render('index', {
      // message: req.flash('info'),
      language: req.i18n.lng(),
      title: config.app.name, 
      //jobs: ['C# Developer', 'Uniface Developer', 'Mobile Developer', optional_job_position],
      optional_job_position: optional_job_position
    });
  });
};

/**
 * Send Curriculum
 */
exports.send_curriculum = function(req, res) {
  var position_applied = req.body['application-positions'];  
  // send email
  curriculum_mailer.send({
      name: req.body.nome_para,
      email: req.body.email,
      job_position: position_applied === optional_job_position ? req.body['application-custom-position'] : position_applied,
      linkedin: req.body.linkedin,
      about_me: req.body.apresentacao,
      attachment_path: req.files.arquivo.path
    }, function(error, response){
     if(error){
         console.log(error);
     }else{
         console.log("Message sent: " + response.message);
         req.flash('info', req.i18n.t('send_curriculum.success'));
         return res.redirect('/');
     }
  });
};

/**
 * Change current language
 */
var set_lang = function(req, res, callback) {
  // Nothing to change, just run the callback
  if(!req.query.lang) {
    callback();
    return;
  }

  // Force to reload the page to change the language
  return res.redirect('/');
};