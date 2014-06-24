var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    VALID_HOST_DOMAINS = [ 'bravisoftware.com', 'bravi.com.br' ],
    ERROR_NOT_VALID_USER = { status: 401, message: 'You have to use a Bravi Software account.' };

exports.getUserId = function (user, cb) {
  cb(null, user.id);
};

exports.findUserById = function (id, cb) {
  User.findOne({ _id: id }, '-salt -hashed_password', cb);
};

var findUserByGoogleProfile = function (profile, cb) {
  User.findOne({ 'google.id': profile.id }, cb);
};

var buildToken = function (accessToken, refreshToken, params) {
  var expiresIn = parseInt(params.expires_in);
  var accessTokenExpiration = new Date().getTime() + (expiresIn * 1000);

  return {
    access: accessToken,
    refresh: refreshToken,
    expiration: accessTokenExpiration
  };
};

var updateTokens = function (user, token, cb) {
  user.token.access = token.access;
  user.token.expiration = token.expiration;
  user.save(cb);
};

var isUserFromBravi = function (profile) {
  var userHostDomain = profile._json.hd;
  return VALID_HOST_DOMAINS.indexOf(userHostDomain) !== -1;
};

var createUser = function (profile, token, cb) {
  User.create({
    name: profile.displayName,
    email: profile.emails[0].value,
    username: profile.emails[0].value,
    provider: 'google',
    token: token,
    google: profile._json
  }, cb);
};

exports.saveUser = function(accessToken, refreshToken, params, profile, cb) {
  var token = buildToken(accessToken, refreshToken, params);

  findUserByGoogleProfile(profile, function(err, user) {
    if (err) cb(err);

    if (user) return updateTokens(user, token, cb);

    createUser(profile, token, cb);
  });
};

exports.updateToken = function (auth, cb) {
  User.findOne({ 'token.refresh': auth.credentials.refresh_token }, function onUpdate (err, user) {
    if (err) return cb(err);
    if (user.token.access === auth.credentials.access_token && auth.access_token) return cb();

    user.token.access = auth.credentials.access_token;
    user.save(cb);
  });
};