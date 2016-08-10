'use strict'

module.exports.push = pushCouchapp

var couchapp = require('couchapp')
var through = require('through2')
var gutil = require('gulp-util')
var path = require('path')
var PluginError = gutil.PluginError

const PLUGIN_NAME = 'gulp-couchapp'

/**
 * Determine whether an object has the specified property as a direct property.
 *
 * @param  {Object}  object
 * @param  {String}  key
 * @return {Boolean}
 */
function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key)
}

/**
 * Build the URL to push CouchApp.
 *
 * @param  {String} dbName
 * @param  {Object} opts
 * @return {String}
 */
function buildURL(dbName, opts) {
  var authentication
  opts.scheme = opts.scheme || 'http'
  opts.host   = opts.host   || '127.0.0.1'
  opts.port   = opts.port   || '5984'

  if (has(opts, 'auth')) {
    if (typeof opts.auth === 'object') {
      authentication = opts.auth.username + ':' + opts.auth.password + '@'
    }
  }

  return opts.scheme + '://' + authentication + opts.host + ':' + opts.port + '/' + dbName
}

/**
 * Push a CouchApp to a CouchDB database.
 *
 * @param  {String} db
 * @param  {Object} opts
 * @return {Stream}
 */
function pushCouchapp(dbName, opts) {
  opts = opts || {}

  if (!dbName && typeof dbName !== 'string') {
    throw new PluginError(PLUGIN_NAME, 'Missing database name.');
  }

  return through.obj(function (file, enc, cb) {
    var ddocObj = require(file.path)
    var url = /^https?:\/\//.test(dbName) ? dbName : buildURL(dbName, opts);

    if (file.isNull()) {
      return cb(null, file)
    }

    if (file.isStream()) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming not supported.'))
      return cb(null, file)
    }

    if (path.extname(file.path) !== '.js') {
      this.emit('error', new PluginError(PLUGIN_NAME, 'File extension not supported.'))
      return cb(null, file)
    }

    if (has(opts, 'attachments')) {
      var attachmentsPath = path.join(process.cwd(), path.normalize(opts.attachments))
      couchapp.loadAttachments(ddocObj, attachmentsPath)
    }

    couchapp.createApp(ddocObj, url, function (app) {
      app.push(function () {
        gutil.log(PLUGIN_NAME, 'Couchapp pushed!')
        return cb(null, file)
      })
    })
  })
}
