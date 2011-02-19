require.paths.unshift('src');
require.paths.unshift('test');

require('unit/test_runner')
require('unit/test_printer')
require('unit/test_array_iterator')
require('unit/test_composite')
require('unit/test_context')

process.on('exit', function() {
  console.log('\n');
  console.log('>> Tests Complete');
});

