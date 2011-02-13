
var INTRO_COPY = '\'Node Should\' by Luke Bayes\n\n';

var Printer = function() {
  this.out = process.stdout;
  this.started = false;
  this.startedAt = null;
  this.succeeded = [];
  this.failed = [];
  this.errored = [];
  this.ignored = [];
  this.length = 0;
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
}

Printer.prototype.testSuccessHandler = function(test) {
  this._addSuccess(test);
}

Printer.prototype.testFailureHandler = function(assertionError) {
  this._addFailure(assertionError);
}

Printer.prototype.testErrorHandler = function(error) {
  this._addError(error);
}

Printer.prototype.testIgnoreHandler = function(test, message) {
  this._addIgnore(test, message);
}

Printer.prototype._printInfo = function(message) {
  this.out.write(message);
}

Printer.prototype._printSuccess = function(message) {
  //TODO(lukebayes) Decorate this message with ascii chars
  //to turn it green in a terminal.
  this.out.write(message);
}

Printer.prototype._printFailure = function(message) {
  //TODO(lukebayes) Decorate this message with ascii chars
  //to turn it red in a terminal.
  this.out.write(message);
}

Printer.prototype._printError = function(message) {
  //TODO(lukebayes) Decorate this message with ascii chars
  //to turn it red in a terminal.
  this.out.write(message);
}

Printer.prototype._printIgnore = function(message) {
  //TODO(lukebayes) Decorate this message with ascii chars
  //to turn it yellow in a terminal.
  this.out.write(message);
}

Printer.prototype._addSuccess = function(test) {
  if (!this.started) throw 'Printer.testSuccessHandler() must be preceeded by start().';
  this._printSuccess('.');
  this.succeeded.push(test);
  this._incrementLength();
}

Printer.prototype._addFailure = function(assertionFailure) {
  if (!this.started) throw 'Printer.testFailureHandler() must be preceeded by start().';
  this._printFailure('F');
  this.failed.push(assertionFailure);
  this._incrementLength();
}

Printer.prototype._addError = function(error) {
  if (!this.started) throw 'Printer.testErrorHandler() must be preceeded by start().';
  this._printError('E');
  this.errored.push(error);
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
  this._printInfo(INTRO_COPY);
}

Printer.prototype._printFinish = function() {
  this._printInfo('\n');
  this._printInfo('\n');
  this._printErrorDetails();
  this._printFailureDetails();
  this._printIgnoreDetails();
  this._printDuration();
  this._printSummary();
}

Printer.prototype._printSummary = function() {
  this._printInfo('Test Count: ' + this.length + ', ');
  this._printSuccess('OK: ' + this.succeeded.length + ', ');
  this._printFailure('Failures: ' + this.failed.length + ', ');
  this._printError('Errors: ' + this.errored.length + ', ');
  this._printIgnore('Ignored: ' + this.ignored.length);
  this._printInfo('\n');
}

Printer.prototype._printDuration = function() {
  this._printInfo('Total Time: ' + this._getDuration() + ' ms\n');
  this._printInfo('\n');
}

Printer.prototype._printFailureDetails = function() {
  var self = this;
  this.failed.forEach(function(failure) {
    if (failure) {
      self._printFailure(failure.stack);
      self._printFailure('\n');
      self._printFailure('\n');
    }
  });
}

Printer.prototype._printErrorDetails = function() {
  var self = this;
  this.errored.forEach(function(error) {
    if (error) {
      self._printError(error.stack);
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
  if(this.ignored.length > 0) {
    self._printIgnore('\n');
  }
}

exports.Printer = Printer;
