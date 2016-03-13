var Runner = require('../').Runner;
var FakePrinter = require('./fakes/fake_printer');

context('A new Runner', function() {

  setup(function() {
    this.printer = new FakePrinter();
    this.runner = new Runner();
  });

  should('be instantiable', function() {
    assert.ok(this.runner);
  });

  /*
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
  */
});
