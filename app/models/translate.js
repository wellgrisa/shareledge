var fs = require('fs'),
      localesPath = __dirname + '/../../locales/',
      devFile = localesPath + 'dev/translation.json',
      enFile = localesPath + 'en/translation.json',
      ptFile = localesPath + 'pt/translation.json';

 
 exports.updateTranslations = function(pathObj, value, callback) {
  async.parallel([
    function(callback){
      updateTranslation(devFile, pathObj, value, callback);
    },
    function(callback){
      updateTranslation(enFile, pathObj, value, callback);
    },
    function(callback){
      updateTranslation(ptFile, pathObj, value, callback);
    }
  ],
  function(err, results){
    if(err) { return callback(err); }
    callback(null, results);
  });
 };

 var updateTranslation = function(file, pathObj, value, callback) {
  fs.readFile(file, 'utf8', function (err, data) {
    if (err) { return callback(err); }
    if (process.env.NODE_ENV === 'development' && file !== devFile) { return callback(null); }

    var translation = JSON.parse(data);
    setToValue(translation, value, pathObj);

    fs.writeFile(file, JSON.stringify(translation), function(err) {
      if (err) { return callback(err); }
      callback(null, data);
    }); 
  });
 };

// path like: name.name.item[0].name
// where arrary reference is: item[0]
var setToValue = function(obj, value, path) {
  var a = path.split('.');
  var context = obj;
  var selector;
  var myregexp = /([a-zA-Z]+)(\[(\d)\])+/; // matches:  item[0]
  var match = null;

  for (var i = 0; i < a.length - 1; i += 1) {
    match = myregexp.exec(a[i]);
    if (match !== null) { 
      context = context[match[1]][match[3]]; 
    } else { 
      context = context[a[i]]; 
    }
  }

  // check for ending item[xx] syntax
  match = myregexp.exec([a[a.length - 1]]);

  if (match !== null) context[match[1]][match[3]] = value;
  else context[a[a.length - 1]] = value;
};