
require('../common');
var assert = require('assert');
var runFilesMatching = require('node_should/runner').runFilesMatching;

assert.ok(runFilesMatching instanceof Function);

