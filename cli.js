#!/usr/bin/env node

require.paths.unshift('./src');

var Runner = require('node_should').Runner;
var runner = new Runner();
runner.runFromTerminal(process.argv.slice(2));

