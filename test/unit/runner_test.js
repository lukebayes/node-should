/*
require('common');
var Runner = require('node_should/runner').Runner;
var FakePrinter = require('fake_printer').FakePrinter;

context('A new Runner', function() {

  setup(function() {
    this.printer = new FakePrinter();
    this.runner = new Runner();
  });

  should('load specified files', function() {
    this.runner.run(/first.js/, 'test/fixtures', [this.printer], async(function() {
      //console.log(printer.out.message);
      assert.match(/OK: 2/, this.printer.out.message);
    }, 500));
  });

  context('run from the terminal', function() {

    should('accept source path argument', function() {
      var argv = [];
      this.runner.runFromTerminal(argv, [this.printer], async(function() {
        console.log("async handler called!");
      }, 20));
    });
  });
});
*/
