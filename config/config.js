var _ = require('underscore');

// Load app configuration

module.exports = _.extend(
    require(__dirname + '/../config/env/all.js'),
    require('./env/' + 'staging') || {}
);
