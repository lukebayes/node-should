
require('../common');
var assert = require('assert');
var runFilesMatching = require('node_should/runner').runFilesMatching;
var FakePrinter = require('fake_printer').FakePrinter;

assert.ok(runFilesMatching instanceof Function);

//var printer = new FakePrinter();
