require.paths.unshift('src');
require.paths.unshift('test');

require('unit/array_iterator_test')
require('unit/composite_test')
require('unit/context_test')
require('unit/runner_test')
require('unit/printer_test')

console.log('\n');
console.log('Tests Complete');

