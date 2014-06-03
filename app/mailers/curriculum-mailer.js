/*
 * Module dependencies.
 */
 var mailer = require('./base-mailer'),
      config = require('../../config/config'),
      path = require('path'),
      fs = require('fs');

/**
 * Send Curriculum
 */
 exports.send = function(request, callback) {
    save_attachment(request, function(fields){
      // email content
      var htmlBody = "<p><b>Nome:</b> " + fields.name +" ("+ fields.email +")<br>"; 
      htmlBody += "<b>Linkedin:</b> " + fields.linkedin + "<br>"; 
      htmlBody += "<b>Apresentação:</b> " + fields.about_me + "</p>"; 

      // send email
      mailer.smtpTransport.sendMail({
        from: fields.name + " <" + fields.email +  ">",
        replyTo: fields.email,
        to: process.env.APPLICATION_MAIL_TO || config.mail.to,
        subject: fields.job_position,
        html: htmlBody,
        attachments:[ { filePath: fields.attachment_path } ]
        }, callback);
    });
  };

  /**
   * Save Attachment
   */
  var save_attachment = function(fields, callback){

    // read uploaded file
    fs.readFile(fields.attachment_path, function (err, data) {
      var newPath = config.uploadPath + path.basename(fields.attachment_path);

      // save tmp file
      fs.writeFile(newPath, data, function (err) {
        if (!err){
          fields.attachment_path = newPath;
          callback(fields);
        }
      });
    });
  };