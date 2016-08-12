# gulp-couchapp
Gulp extension for installing CouchApps.
## Install
    npm install gulp-couchapp --save
## Usage
```
var couchapp = require('gulp-couchapp');

gulp.task('push', function () {
  return gulp.src('app.js')
    .pipe(couchapp.push([dbname], [options]));
});
```
This installs `app.js` in the specified `dbname`, or you can use a URL like `'http://domain.com/dbname'`.
### Options
- `scheme`: Defaults to `http`
- `host`: Defaults to `127.0.0.1`
- `port`: Defaults to `5984`
- `auth.username + auth.password`: You can specify HTTP auth parameters either by using options or a URL like `'http://user:pass@host/dbname'`.
- `attachments`: If you want to push not only the design document, but the _attachments of the App, specify the path to directory.

### Basic ddoc
You should write your ddoc in the app.js file.
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
