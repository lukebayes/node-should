
/**
 * Run this file with:
 *
 *     nodeshould -s sources \
 *                -s lib/foo \
 *                -s lib/bar \
 *                -t '/test-*.js/' \
 *                -n '/should make happy/'
 *
 * @param s Directories that contain code that can be required. If a directory
 * is found at ./src or ./test, those directories will be automatically added
 * to the load path.
 * @param t Regular Expression that matches the test file or files that you
 * want to load.
 * @param n Regular Expression that matches the test label(s) that you want
 * to execute.
 */

var Runner = require('node_should').Runner;
var runner = new Runner();
runner.runFromTerminal(process.argv);

