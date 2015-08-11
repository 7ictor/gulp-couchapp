'use strict';

var couchapp = require('couchapp');
var through = require('through2');
var gutil = require('gulp-util');
var path = require('path');

var PLUGIN_NAME = 'gulp-couchapp';
var PluginError = gutil.PluginError;

function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function buildURL(db, opts) {
  var url = 'http://';

  // Set defaults.
  if (!has(opts, 'host')) opts.host = '127.0.0.1';
  if (!has(opts, 'port')) opts.port = '5984';

  if (has(opts, 'auth')) {
    if (typeof opts.auth === 'object') {
      url += opts.auth.username + ':' + opts.auth.password + '@';
    }
  }

  url += opts.host + ':' + opts.port + '/' + db;

  return url;
}

function couchappPlugin(db, opts) {
  if (!db && typeof db !== 'string') {
    throw new PluginError(PLUGIN_NAME, 'Missing database name.');
  }

  opts = opts || {};
  var ddocObj,
      url;

  var stream =  through.obj(function(file, enc, cb) {
    var error;

    if (file.isNull()) {
      return cb(error, file);
    }

    if (file.isStream()) {
      error = new PluginError(PLUGIN_NAME, 'Streaming not supported.');
      return cb(error, file);
    }

    if (path.extname(file.path) !== '.js') {
      error = new PluginError(PLUGIN_NAME, 'File extension not supported.');
      return cb(error, file);
    }

    ddocObj = require(file.path);
    if (has(opts, 'attachments')) {
      // Load attachments to ddoc.
      couchapp.loadAttachments(
        ddocObj,
        path.join(process.cwd(), path.normalize(opts.attachments))
      );
    }

    url = buildURL(db, opts);

    couchapp.createApp(ddocObj, url, function (app) {
      app.push(function () {
        gutil.log(PLUGIN_NAME, 'Couchapp pushed!');
        return cb(null, file);
      });
    });

  });

  return stream;
}

module.exports = { push : couchappPlugin };
