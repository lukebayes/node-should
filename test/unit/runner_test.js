
require('../common');
var assert = require('assert');
var printer = require('fake_printer');
var runFilesMatching = require('node_should/runner').runFilesMatching;

assert.ok(runFilesMatching instanceof Function);

