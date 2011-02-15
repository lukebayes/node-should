
require('../common');
var assert = require('assert');
var Printer = require('node_should').Printer;
var Context = require('node_should').Context;
var FakePrinter = require('fake_printer').FakePrinter;

// Construction

(function printerIsInstantiable() {
  assert.ok(new Printer() != null);
})();

// Start

(function printerStartDisplaysExpectedText() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  p.start();
  assert.equal("'Node Should' by Luke Bayes\n\n", p.out.message);
})();

(function printerStartThrowsAfterFirstCall() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  p.start();
  assert.throws(function() {
    p.start();
  }, /start already/);
})();

// Success

(function printerTestSucceededOnlyWorksAfterStart() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  assert.throws(function() {
    p._testSuccessHandler();
  }, /must be preceeded by start/);
})();

(function printerSuccessWorksAfterStart() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  p.start();
  p._testSuccessHandler();
  p.finish();

  assert.match(/^\./gm, p.out.message);
  assert.equal(1, p.length);
})();

(function printerSuccessWorksWithMultipleCalls() {
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
})();

// Failure

(function printerTestFailureOnlyWorksAfterStart() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  assert.throws(function() {
    p._testFailureHandler();
  }, /must be preceeded by start/);
})();

(function printerFailureWorksAfterStart() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  p.start();
  try {
    assert.fail(null, 'fake actual value', 'fake expected value', '!=', 'foo');
  } catch (failure) { 
    p._testFailureHandler(failure);
  }
  p.finish();

  var message = p.out.message;

  assert.equal(1, p.length);
  assert.match(/^F/gm, message);
  assert.match(/Test Count: 1, OK: 0, Failures: 1, Errors: 0, Ignored: 0/, message);
  assert.match(/printer_test.js/, message);
})();

(function printerFailureWorksWithMultipleCalls() {
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
})();

// Error

(function printerTestErrorOnlyWorksAfterStart() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  assert.throws(function() {
    p._testErrorHandler();
  }, /must be preceeded by start/);
})();

(function printerErrorWorksAfterStart() {
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
})();

(function printerErrorWorksWithMultipleCalls() {
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
})();

// Ignore

(function printerTestIgnoreOnlyWorksAfterStart() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  assert.throws(function() {
    p.testIgnoreHandler();
  }, /must be preceeded by start/);
})();

(function printerIgnoreWorksAfterStart() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  p.start();
  p.testIgnoreHandler();
  p.finish();

  var message = p.out.message;
  assert.match(/^I/gm, message);
  assert.equal(1, p.length);
})();

(function printerIgnoreWorksWithMultipleCalls() {
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
})();

// Finish

(function printerFinishOnlyWorksIfStarted() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  assert.throws(function() {
    p.finish();
  });
})();

(function printerFinishOnlyWorksIfStartedAndAtLeastOneResult() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  p.start();
  assert.throws(function() {
    p.finish();
  });
})();

(function printerFinishWorksAfterTests() {
  var p = new FakePrinter();
  //p.out = process.stdout;
  p.start();
  p._testSuccessHandler();
  p.finish();
  assert.equal(1, p.length);

  var message = p.out.message;
  assert.match(/Total Time: \d ms/, message);
  assert.match(/Test Count: 1, OK: 1, Failures: 0, Errors: 0, Ignored: 0/, message);
})();

// Durations

(function printerDisplaysTestDurations() {
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
})();

// addContext

(function printerAcceptsFailingContext() {
  var c = new Context('SomeClass');
  c.addTestHandler('should do something', function() {
    assert.ok(false, 'expected failure!');
  });

  var p = new FakePrinter();
  p.start();
  p.addContext(c);
  c.execute();
  p.finish();
  var message = p.out.message;
  assert.match(/Test Count: 1, OK: 0, Failures: 1, Errors: 0, Ignored: 0/, message);
})();

(function printerAcceptsPassingContext() {
  var c = new Context('SomeClass');
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
})();
