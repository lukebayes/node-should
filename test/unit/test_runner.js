
require('../common');

var assert = require('assert');
var Runner = require('node_should/runner').Runner;
var FakePrinter = require('fake_printer').FakePrinter;

(function runnerCanBeInstantiated() {
  var r = new Runner();
})();

(function runnerCanLoadFiles() {
  var printer = new FakePrinter();
  var r = new Runner();
  r.run(/first.js/, 'test/fixtures', [printer], function() {
    //console.log(printer.out.message);
    assert.match(/OK: 2/, printer.out.message);
  });
})();

