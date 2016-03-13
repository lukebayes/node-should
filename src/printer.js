var sys = require('sys');
var style = require('./colored');

var Printer = function() {
  this._canFinish = false;
  this.finishTimeoutId = null;
  this.colorized = true;
  this.contexts = [];
  this.errored = [];
  this.failed = [];
  this.finished = false;
  this.ignored = [];
  this.length = 0;
  this.out = process.stdout;
  this.started = false;
  this.startedAt = null;
  this.succeeded = [];
  this.tests = []

  // This value can be turned off for a more
  // terse test summary:
  this.showDurationDetails = true;
}

Printer.prototype.addContext = function(context) {
  this.contexts.push(context);
  var self = this;

  var successHandler = function(test) {
    self._testSuccessHandler(test);
  };

  var failureHandler = function(test) {
    self._testFailureHandler(test);
  };

  var errorHandler = function(test) {
    self._testErrorHandler(test);
  };

  var completeHandler = function(context) {
    context.removeListener('success', successHandler);
    context.removeListener('failure', failureHandler);
    context.removeListener('error', errorHandler);
    context.removeListener('complete', completeHandler);
    self._contextCompleteHandler(context);
  };

  context.addListener('success', successHandler);
  context.addListener('failure', failureHandler);
  context.addListener('error', errorHandler);
  context.addListener('complete', completeHandler);
}

Printer.prototype.start = function() {
  if (this.started) throw 'Printer.start already called';
  this._printStart();
  this.started = true;
  this.startedAt = new Date();
}

Printer.prototype.finish = function() {
  if (!this.started) throw 'Printer.finish() must be preceeded by start().';
  if (this.length == 0) throw 'Printer.finish() must be preceeded by at least one test result.';
  this._printFinish();
  this.finished = true;
}

Printer.prototype.canFinish = function() {
  this._canFinish = true;
}

Printer.prototype._testSuccessHandler = function(test) {
  this._addSuccess(test);
}

Printer.prototype._testFailureHandler = function(assertionError) {
  this._addFailure(assertionError);
}

Printer.prototype._testErrorHandler = function(error) {
  this._addError(error);
}

Printer.prototype._contextCompleteHandler = function(context) {
  //console.log('Printer.contextCompleteHandler with: ' + this.contexts.length + ' contexts');
  var index = this.contexts.indexOf(context);
  this.contexts.splice(index, 1);

  if (this._canFinish && this.contexts.length == 0) {
    var self = this;
    // Give the application one execution frame to add another
    // context before fully finishing.
    // 10ms works for me. If this isn't working properly, you'll
    // see the result summary more than once.
    clearTimeout(this.finishTimeoutId);
    this.finishTimeoutId = setTimeout(function() {
      self.finish();
    }, 10);
  }
}

Printer.prototype.testIgnoreHandler = function(test, message) {
  this._addIgnore(test, message);
}

Printer.prototype._printInfo = function(message) {
  this.out.write(message);
}

Printer.prototype._printSuccess = function(message) {
  if (this.colorized) {
    this._printInfo(style.green(message));
  } else {
    this._printInfo(message);
  }
}

Printer.prototype._printFailure = function(message) {
  if (this.colorized) {
    this.out.write(style.red(message));
  } else {
    this._printInfo(message);
  }
}

Printer.prototype._printError = function(message) {
  if (this.colorized) {
    this.out.write(style.red(message));
  } else {
    this._printInfo(message);
  }
}

Printer.prototype._printIgnore = function(message) {
  if (this.colorized) {
    this.out.write(style.yellow(message));
  } else {
    this._printInfo(message);
  }
}

Printer.prototype._addSuccess = function(test) {
  if (!this.started) throw 'Printer.testSuccessHandler() must be preceeded by start().';
  this._printSuccess('.');
  this.succeeded.push(test);
  this.tests.push(test);
  this._incrementLength();
}

Printer.prototype._addFailure = function(test) {
  if (!this.started) throw 'Printer.testFailureHandler() must be preceeded by start().';
  this._printFailure('F');
  this.failed.push(test);
  this.tests.push(test);
  this._incrementLength();
}

Printer.prototype._addError = function(test) {
  if (!this.started) throw 'Printer.testErrorHandler() must be preceeded by start().';
  this._printError('E');
  this.errored.push(test);
  this.tests.push(test);
  this._incrementLength();
}

Printer.prototype._addIgnore = function(test) {
  if (!this.started) throw 'Printer.testIgnoreHandler() must be preceeded by start().';
  this._printError('I');
  this.ignored.push(test);
  this._incrementLength();
}

Printer.prototype._incrementLength = function() {
  this.length++;
}

Printer.prototype._getDuration = function() {
  var now = new Date();
  return now.getTime() - this.startedAt.getTime();
}

Printer.prototype._printStart = function() {
  this._printInfo('\'Node Should\' by Luke Bayes\n\n');
}

Printer.prototype._printFinish = function() {
  this._printInfo('\n');
  this._printInfo('\n');
  this._printErrorDetails();
  this._printFailureDetails();
  this._printIgnoreDetails();
  this._printDuration();
  this._printSummary();
  this._printDurationDetails();
  this._printInfo('\n');
}

Printer.prototype._printSummary = function() {
  this._printInfo('Test Count: ' + this.length + ', ');
  this._printInfo('OK: ' + this.succeeded.length + ', ');
  this._printFailureSummary();
  this._printErrorSummary();
  this._printIgnoredSummary();
  this._printInfo('\n');
  this._printInfo('\n');
}

Printer.prototype._printErrorSummary = function() {
  var message = 'Errors: ' + this.errored.length + ', ';
  if (this.errored.length > 0) {
    this._printError(message);
  } else {
    this._printInfo(message);
  }
}

Printer.prototype._printFailureSummary = function() {
  var message = 'Failures: ' + this.failed.length + ', ';
  if (this.failed.length > 0) {
    this._printFailure(message);
  } else {
    this._printInfo(message);
  }
}

Printer.prototype._printIgnoredSummary = function() {
  var message = 'Ignored: ' + this.ignored.length;
  if (this.ignored.length > 0) {
    this._printIgnore(message);
  } else {
    this._printInfo(message);
  }
}

Printer.prototype._printDuration = function() {
  this._printInfo('Total Time: ' + this._getDuration() + ' ms\n');
  this._printInfo('\n');
}

Printer.prototype._printFailureDetails = function() {
  var self = this;
  this.failed.forEach(function(test) {
    if (test && test.failure) {
      self._printFailure(test.failure.stack);
      self._printFailure('\n');
      self._printFailure('\n');
    }
  });
}

Printer.prototype._printErrorDetails = function() {
  var self = this;
  this.errored.forEach(function(test) {
    if (test && test.error) {
      self._printError(test.error.stack);
      self._printError('\n');
      self._printError('\n');
    }
  });
}

Printer.prototype._printIgnoreDetails = function() {
  var self = this;
  this.ignored.forEach(function(ignore) {
    if (ignore) {
      self._printIgnore('[IGNORED] ' + ignore.message);
      self._printIgnore('\n');
    }
  });
  if (this.ignored.length > 0) {
    self._printIgnore('\n');
  }
}

Printer.prototype._insertLeadingSpaces = function(num, charCount) {
  var str = num.toString();
  var len = str.length;
  if(len < charCount) {
    for (var i = len; i < charCount; i++) {
      str = ' ' + str;
    }
  }
  return str;
}

Printer.prototype._printDurationDetails = function() {
  if (this.showDurationDetails) {
    var self = this;
    var items = this.tests.filter(function(test) {
      if(test && test.duration != null && test.label) {
        return test;
      }
      return null;
    }).sort(function(a, b) {
      if(a.duration > b.duration) {
        return -1;
      } else if(a.duration < b.duration) {
          return 1;
      } else {
        return 0;
      }
    });

    var count = 10;
    self._printInfo('Printing 10 slowest test methods:\n\n');
    items.forEach(function(test) {
      if (count-- > 0) {
        var durationLabel = self._insertLeadingSpaces(test.duration, 6);
        self._printInfo(durationLabel + ' ms : ' + test.label + '\n');
      }
    });
  }
}

module.exports = Printer;
