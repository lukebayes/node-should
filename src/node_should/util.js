var fs = require("fs");

var readEachFileMatching = function(expr, path, callback) {
  eachFileMatching(expr, path, function(err, file) {
    fs.readFile(file, function(err, content) {
      if (err) throw err;
      callback(null, file, content);
    });
  });
}

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

