var path = require('path'),
    rootPath = path.normalize(__dirname + '/../..');

var buildBanner = function(){
	return	'   __                 _              __       _ __     \n' +
			'  / /  _______ __  __(_) _    _____ / /  ___ (_) /____ \n' +
			' / _ \\/ __/ _ `/ |/ / / | |/|/ / -_) _ \\(_-</ / __/ -_)\n' +
			'/_.__/_/  \\_,_/|___/_/  |__,__/\\__/_.__/___/_/\\__/\\__/ ';
};

var getPort = function(){
  return 8000;
};

var errors = function (errors) {
  var keys = Object.keys(errors);
  var errs = [];

  // if there is no validation error, just display a generic error
  if (!keys) {
    return ['Oops! There was an error'];
  }

  keys.forEach(function (key) {
    errs.push(errors[key].message);
  });

  return errs;
};

var isBuildEnabled = (process.env.BUILD_ENABLED === 'true');

module.exports = {
  root: rootPath,
  uploadPath: path.join(rootPath, 'public/upload/'),
  port: getPort(),
  db: process.env.MONGOHQ_URL,
  banner: buildBanner(),
  build_enabled: isBuildEnabled,
  static_public: isBuildEnabled ? 'public_build' : 'public',
  errors: errors
};