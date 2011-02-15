require.paths.unshift('src');
require.paths.unshift('test');

require('unit/runner_test')
require('unit/printer_test')
require('unit/array_iterator_test')
require('unit/composite_test')
require('unit/context_test')

process.on('exit', function() {
  console.log('\n');
  console.log('>> Tests Complete');
});

