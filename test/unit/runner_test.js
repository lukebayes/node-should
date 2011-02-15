
require('../common');

var assert = require('assert');
var Runner = require('node_should/runner').Runner;
var FakePrinter = require('fake_printer').FakePrinter;

(function runnerCanBeInstantiated() {
  var r = new Runner();
})();

(function runnerCanLoadFiles() {
  var r = new Runner();
  r.run(/first.js/, 'test/fixtures', [new FakePrinter()]);
  //r.run(/first.js/, 'test/fixtures');
})();

