
require('common');
var Runner = require('node_should/runner').Runner;
var FakePrinter = require('fake_printer').FakePrinter;

context('A new Runner', function() {

  should('be instantiable', function() {
    var r = new Runner();
  });

  should('load specified files', function() {
    var printer = new FakePrinter();
    var r = new Runner();
    r.run(/first.js/, 'test/fixtures', [printer], function() {
      //console.log(printer.out.message);
      assert.match(/OK: 2/, printer.out.message);
    });
  });
});

