
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
  this.colorized = false;
}

util.inherits(FakePrinter, Printer);

exports.FakePrinter = FakePrinter;

