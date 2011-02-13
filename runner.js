require.paths.unshift('src');
require.paths.unshift('test');

require('unit/runner_test')
require('unit/printer_test')

console.log('\n');
console.log('Tests Complete');

