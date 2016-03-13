var Printer = require('../').Printer;
var Context = require('../').Context;
var FakePrinter = require('./fakes/fake_printer');
var assert = require('../').assert;

context('printer', function() {

  should('be instantiable', function() {
    assert.ok(new Printer() != null);
  });

  should('display start text', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    assert.equal("'Node Should' by Luke Bayes\n\n", p.out.message);
  });

  should('not allow start to be called > once', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    assert.throws(function() {
      p.start();
    }, /start already/);
  });

  should('not allow tests without first calling start', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    assert.throws(function() {
      p._testSuccessHandler();
    }, /must be preceeded by start/);
  });

  should('allow success after start', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    p._testSuccessHandler();
    p.finish();

    assert.match(/^\./gm, p.out.message);
    assert.equal(1, p.length);
  });

  should('allow success multiple times', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    p._testSuccessHandler();
    p._testSuccessHandler();
    p._testSuccessHandler();
    p._testSuccessHandler();
    p.finish();

    var message = p.out.message;
    assert.match(/^\.\.\.\./gm, message);
    assert.match(/Test Count: 4, OK: 4, Failures: 0, Errors: 0, Ignored: 0/, message);
    assert.equal(4, p.length);
  });

  should('only allow failure after start', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    assert.throws(function() {
      p._testFailureHandler();
    }, /must be preceeded by start/);
  });

  should('allow failure after start', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    try {
      assert.fail(null, 'fake actual value', 'fake expected value', '!=', 'foo');
    } catch (failure) {
      p._testFailureHandler({failure: failure});
    }
    p.finish();

    var message = p.out.message;

    assert.equal(1, p.length);
    assert.match(/^F/gm, message);
    assert.match(/Test Count: 1, OK: 0, Failures: 1, Errors: 0, Ignored: 0/, message);
    assert.match(/printer_test.js/, message);
  });

  should('work with multiple calls', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    p._testSuccessHandler();
    p._testSuccessHandler();
    p._testFailureHandler();
    p._testSuccessHandler();
    p._testFailureHandler();
    p._testFailureHandler();
    p._testSuccessHandler();
    p.finish();

    var message = p.out.message;
    assert.equal(7, p.length);
    assert.match(/^\.\.F\.FF\./gm, message);
    assert.match(/Test Count: 7, OK: 4, Failures: 3, Errors: 0, Ignored: 0/, message);
  });

  should('only allow errors after start', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    assert.throws(function() {
      p._testErrorHandler();
    }, /must be preceeded by start/);
  });

  should('allow errors after start', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    try {
      throw new Error('fake error');
    } catch (err) {
      p._testErrorHandler({error: err});
    }
    p.finish();

    var message = p.out.message;
    assert.match(/^E/gm, message);
    assert.match(/Test Count: 1, OK: 0, Failures: 0, Errors: 1, Ignored: 0/, message);
    assert.match(/fake error/, message);
    assert.equal(1, p.length);
  });

  should('allow errors with multiple calls', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    p._testSuccessHandler();
    p._testSuccessHandler();
    p._testFailureHandler();
    p._testSuccessHandler();

    p._testErrorHandler();

    p._testFailureHandler();
    p._testFailureHandler();

    p._testErrorHandler();
    p._testSuccessHandler();
    p.finish();

    var message = p.out.message;
    assert.match(/^\.\.F\.EFFE\./gm, message);
    assert.equal(9, p.length);
  });

  should('only allow ignore after start', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    assert.throws(function() {
      p.testIgnoreHandler();
    }, /must be preceeded by start/);
  });

  should('allow ignore after start', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    p.testIgnoreHandler();
    p.finish();

    var message = p.out.message;
    assert.match(/^I/gm, message);
    assert.equal(1, p.length);
  });

  should('allow ignore with multiple calls', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    p._testSuccessHandler();
    p._testSuccessHandler();
    p._testFailureHandler();
    p._testSuccessHandler();

    p.testIgnoreHandler({message: 'ignore message a'});

    p._testFailureHandler();
    p._testFailureHandler();

    p.testIgnoreHandler({message: 'ignore message b'});
    p._testSuccessHandler();
    p.finish();

    var message = p.out.message;
    assert.match(/^\.\.F\.IFFI\./gm, message);
    assert.match(/Test Count: 9, OK: 4, Failures: 3, Errors: 0, Ignored: 2/, message);
    assert.match(/ignore message a/, message);
    assert.equal(9, p.length);
  });

  should('only allow finish if started', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    assert.throws(function() {
      p.finish();
    });
  });

  should('only allow finish if at least one result', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    assert.throws(function() {
      p.finish();
    });
  });

  should('allow finish after start and a test', function() {
    var p = new FakePrinter();
    //p.out = process.stdout;
    p.start();
    p._testSuccessHandler();
    p.finish();
    assert.equal(1, p.length);

    var message = p.out.message;
    assert.match(/Total Time: \d ms/, message);
    assert.match(/Test Count: 1, OK: 1, Failures: 0, Errors: 0, Ignored: 0/, message);
  });

  should('display durations', function() {
    var p = new FakePrinter();
    p.start();
    p._testSuccessHandler({label: 'abcd', duration: 1});
    p._testSuccessHandler({label: 'efgh', duration: 87});
    p._testSuccessHandler({label: 'mnop', duration: 34});
    p._testSuccessHandler({label: 'ijkl', duration: 34});
    p._testSuccessHandler({label: 'qrst', duration: 242});
    p._testSuccessHandler();
    p._testSuccessHandler();
    p.finish();

    var message = p.out.message;
    //console.log(message);

    // Ensure that the list is present, AND sorted:
    assert.match(/ 242 ms : qrst.*\n.*efgh/gm, message);
    assert.match(/  87 ms : efgh.*\n.*mnop/gm, message);
    assert.match(/  34 ms : mnop.*\n.*ijkl/gm, message);
    assert.match(/  34 ms : ijkl.*\n.*abcd/gm, message);
    assert.match(/   1 ms : abcd/gm, message);
  });

  /*
  should('accept failing context', function() {
    var c = new Context('SomeClass 1');
    c.addTestHandler('should do something', function() {
      assert.ok(false, 'expected failure!');
    });

    var p = new FakePrinter();
    p.start();
    p.addContext(c);
    c.execute(async(function() {
      var message = p.out.message;
      assert.match(/Test Count: 1, OK: 0, Failures: 1, Errors: 0, Ignored: 0/, message);
    }));
  });
  */

  should('accept passing context', function() {
    var c = new Context('SomeClass 2');
    c.addTestHandler('should do something', function() {
      assert.ok(true);
    });

    var p = new FakePrinter();
    p.start();
    p.addContext(c);
    c.execute();
    p.finish();
    var message = p.out.message;
    assert.match(/Test Count: 1, OK: 1, Failures: 0, Errors: 0, Ignored: 0/, message);
  });
});

