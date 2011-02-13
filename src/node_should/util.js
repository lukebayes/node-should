var fs = require("fs");

/**
 * Call callback for each file found in path with a name that matches the
 * provided expression, and provides an options error, the file name and
 * the file contents.
 *
 * Call to this method will usually look something like the following:
 *
 *     readEachFileMatching(/_test.js/, 'test/', function(err, file, content) {
 *       if (err) throw err;
 *       console.log('>> Found file: ' + file + ' with: ' + content);
 *     });
 *
 * @param expr RegExp of the file names to look for.
 * @param path Directory to scan (recursively) for files.
 * @param callback Function that will be called with each matched file.
 */
var readEachFileMatching = function(expr, path, callback) {
  eachFileMatching(expr, path, function(err, file) {
    fs.readFile(file, function(err, content) {
      if (err) throw err;
      callback(null, file, content);
    });
  });
}

/**
 * Calls callback for each file found in path with a name that matches the
 * provided expression and provides an optional error and the file name.
 *
 * Calls to this method will usually look something like the following:
 *
 *     eachFileMatching(/_test.js/, 'test/', function(err, file) {
 *       if (err) throw err;
 *       console.log('>> Found file with: ' + file);
 *     });
 *
 * If you're going to immediately read the contents of the file, go ahead
 * and use readEachFileMatching.
 *
 * @param expr RegExp of the file names to look for.
 * @param path Directory to scan (recursively) for files.
 * @param callback Function that will be called with each matched file.
 */
var eachFileMatching = function(expr, path, callback) {
  var prependPathToFiles = function(dir, files) {
    return files.map(function(file) { 
      return dir + '/' + file;
    });
  };

  var handleFileStat = function(stat, file) {
    if (stat.isDirectory()) {
      eachFileMatching(expr, file, callback);
    }
    else if (file.match(expr)) {
      callback(null, file);
    }
  };

  var handleFilesInDirectory = function(dir, files) {
    files = prependPathToFiles(dir, files);
    files.forEach(function(file) {
      fs.stat(file, function(err, stat) {
        if (err) { callback(err); return; }
        handleFileStat(stat, file);
      })
    });
  };

  fs.readdir(path, function(err, files) {
    if (err) { callback(err); return; }
    handleFilesInDirectory(path, files);
  });
}

exports.eachFileMatching = eachFileMatching;
exports.readEachFileMatching = readEachFileMatching;

