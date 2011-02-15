
var SomeClass = function() {
  this.isDone = false;
  this.name = 'default';
}

SomeClass.prototype.doSomeLongAsyncTask = function(duration, callback) {
  var self = this;
  setTimeout(function() {
    self.isDone = true;
    callback();
  }, duration);
}

exports.SomeClass = SomeClass;
