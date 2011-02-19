
/**
 * Run this file with:
 *
 *     node runner.js
 */

require.paths.unshift('src');
require.paths.unshift('test');

require('assert');

var Runner = require('node_should').Runner;

var runner = new Runner();
runner.run();


