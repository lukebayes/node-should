
var util = require('util');
var Printer = require('node_should/printer').Printer;
var FakeStream = require('fake_stream').FakeStream;

/**
 * FakePrinter is used to prevent tests from broadcasting their results to std
 * output, and instead just store test result strings in a FakeStream.
 */
var FakePrinter = function() {
  Printer.call(this);
  this.out = new FakeStream();
}

util.inherits(FakePrinter, Printer);

// Override colorized methods so that our tests can be a little simpler.
FakePrinter.prototype._printSuccess = function(message) {
  this.out.write(message);
}

FakePrinter.prototype._printFailure = function(message) {
  this.out.write(message);
}

FakePrinter.prototype._printError = function(message) {
  this.out.write(message);
}

FakePrinter.prototype._printIgnore = function(message) {
  this.out.write(message);
}

exports.FakePrinter = FakePrinter;

