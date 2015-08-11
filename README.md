# gulp-couchapp
Gulp extension for installing couchapps.
## Install
    npm install gulp-couchapp --save
## Usage
```
var couchapp = require('gulp-couchapp');

gulp.task('push', function () {
  return gulp.src('couchapp.js')
    .pipe(couchapp.push('test', options));
});
```
## Options
`options.attachments` If you want to push not only the design document, but the _attachments of the App, specify the directory.

`options.auth` If your CouchDB database requires authentication, specify the `auth.username` and `auth.password`.
## Basic ddoc
You should write your ddoc in the couchapp.js file.
```
var ddoc = {
  _id: '_design/myapp',
  rewrites: [
    { from: '_db',     to: '../..' },
    { from: '_db/*',   to: '../../*' },
    { from: '_ddoc',   to: '' },
    { from: '_ddoc/*', to: '*' },
    { from: '/',       to: 'index.html' },
    { from: '/*',      to: '*' }
  ],
  views: {},
  shows: {},
  lists: {},
  validate_doc_update: function(newDoc, oldDoc, userCtx) {
    if (newDoc._deleted === true && userCtx.roles.indexOf('_admin') === -1) {
      throw 'Only admin can delete documents on this database.';
    }
  }
};
module.exports = ddoc;
```
