
var ArrayIterator = require('node_should/array_iterator').ArrayIterator;
var Composite = require('node_should/composite').Composite;
var TestHandler = require('node_should/test_handler').TestHandler;
var util = require('util');

var Context = function(label) {
  Composite.call(this);
  this._label = label || '';
  this._setupHandlers = [];
  this._teardownHandlers = [];
  this._testHandlers = [];
}

util.inherits(Context, Composite);

Context.DEFAULT_ASYNC_TIMEOUT = 50;

Context.prototype.addExecutionHandler = function(label, handler) {
  this._cleanHandlerArguments(arguments);
  this._label = label;
  handler.call(this);
}

Context.prototype.addSetupHandler = function(handler) {
  if (handler == null) throw 'The handler provided to Context.addSetupHandler must not be null';
  this._setupHandlers.push(TestHandler.create(this, this.getLabel(), handler));
}

Context.prototype.addTeardownHandler = function(handler) {
  if (handler == null) throw 'The handler provided to Context.addTeardownHandler must not be null';
  this._teardownHandlers.push(TestHandler.create(this, this.getLabel(), handler));
}

/**
 * Could be called with no label, but because of how the DSL feels, the optional
 * argument belongs on the left.
 */
Context.prototype.addTestHandler = function(label, handler) {
  this._cleanHandlerArguments(arguments);
  if (this.getLabel() != '') {
    label = [this.getLabel(), 'should', label].join(' ');
  }
  //this._testHandlers.push({ handler: handler, label: label });
  this._testHandlers.push(TestHandler.create(this, label, handler));
  // TODO(lukebayes) Probably shouldn't set label here, it's doing work that
  // isn't necessary, and will only be used in cases of failure?
}

/**
 * Called during test execution and should prevent the call of the next test
 * setup, test or teardown until the async handler either times out, or
 * completes.
 */
Context.prototype.addAsyncHandler = function(callback, timeout) {
  timeout = (timeout == null) ? Context.DEFAULT_ASYNC_TIMEOUT : timeout;
  var timeoutError = new Error('Async timeout (' + timeout + 'ms) exceeded.');
  var self = this;
  var options = this.currentOptions;
  var timeoutId = null;
  var timeoutExecuted = false;

  options.asyncHandlers++;

  timeoutId = setTimeout(function() {
    timeoutExecuted = true;
    self._executeAsyncTimeout(options, timeoutError);
  }, timeout);

  return function() {
    if (!timeoutExecuted) {
      clearTimeout(timeoutId);
      options.asyncHandlers--;
      self._callHandler(callback, options);
    }
  }
}

Context.prototype._executeAsyncTimeout = function(options, timeoutError) {
  console.log("async timeout exceeded with!: " + timeoutError.stack);
  options.asyncHandlers--;

  this._onError({
    error : timeoutError
  });

  this._executeNextSetupOrTestOrTeardown(options);
}

/**
 * Will modify the provided arguments hash that may have a single handler argument,
 * or a label, followed by a handler function. Regardless of how the args come in,
 * they should be modified so that the zeroth element is a label and the first is
 * a handler.
 *
 *    labelOrHandler:(String|Function), handler=null
 *
 * Should be transformed into:
 *
 *    label:String, handler:Function
 *
 * Note that by swapping the values in the indexes found on arguments,
 * references to the args by name will also be swapped.
 *
 *   // Swaps a and b vars by swapping the values in arguments
 *   // by index.
 *   function foo(a, b) {
 *     var bar = arguments[1];
 *     arguments[1] = arguments[0];
 *     arguments[0] = bar;
 *     console.log("a: " + a);
 *     console.log("b: " + b);
 *   }
 *
 *   foo("A", "B");
 *
 *   # Outputs:
 *   # a: B
 *   # b: A
 */
Context.prototype._cleanHandlerArguments = function(args) {
  var handler = null;
  if (args.length == 0) throw 'The handler provided to Context.addTestHandler (or addSetupHandler, addTeardownHandler) must not be null';

  if (args.length == 1) {
    if (typeof(args[0]) != 'function') throw 'A handler must be sent to the add___ method'
    args[1] = args[0];
    args[0] = '';
  }
}

Context.prototype.execute = function(completeHandler) {
  if (this._testHandlers.length == 0) throw 'Context.execute called with no tests.';
  var testIterator = this._createTestHandlerIterator(completeHandler);
  this._executeAllTests(testIterator);
}

Context.prototype._executeAllTests = function(testIterator) {
  // Initiate all tests immediately:
  while (testIterator.hasNext()) {
    var options = this._getTestExecutionOptions(testIterator.next());
    this._executeNextSetupOrTestOrTeardown(options);
  }
}

Context.prototype._createTestHandlerIterator = function(completeHandler) {
  var testHandlers = this._testHandlers;

  var self = this;
  var testHandlerList = [];
  var handlers = null;
  // Build an array of arrays, each item is an array of all
  // setup methods, a single test method, and all teardowns.
  // Each of these collections of methods will be executed in
  // a unique scope that is only shared by them.
  testHandlers.forEach(function(handlerData) {
    handlers = [self._getTestStartedHandler(handlerData)];
    handlers = handlers.concat(self._getSetupHandlersForTest(handlerData.label));
    handlers = handlers.concat([handlerData]);
    handlers = handlers.concat(self._getTeardownHandlersForTest(handlerData.label));
    handlers.push(self._getTestCompletedHandler(handlerData));
    testHandlerList.push(new ArrayIterator(handlers));
  });

  // Add a custom handler to trigger complete handler
  // after all tests have finished:
  handlers.push(function() {
    if (completeHandler) {
      // break out of the try..catch
      // that wraps test methods:
      setTimeout(function() {
        completeHandler();
      });
    }
  });

  return new ArrayIterator(testHandlerList);
}

Context.prototype._getTestExecutionOptions = function(iterator) {
  var self = this;
  var options = {};

  options.asyncHandlers = 0;
  options.iterator = iterator;
  options.scope = {};
  return options;
}

Context.prototype._getTestStartedHandler = function(testHandlerData) {
  return function() {
    testHandlerData.startedAt = new Date();
  }
}

Context.prototype._getTestCompletedHandler = function(testHandlerData) {
  var self = this;
  return function() {
    var now = new Date();
    var duration = now.getTime() - testHandlerData.startedAt.getTime();
    testHandlerData.duration = duration;
    if (!testHandlerData.failure && !testHandlerData.error) {
      self._onSuccess(testHandlerData);
    }
  }
}

Context.prototype._onSuccess = function(testHandlerData) {
  this.emit('success', testHandlerData);
}

Context.prototype._onFailure = function(testHandlerData) {
  if (this.listeners('failure').length == 0) {
    throw testHandlerData.failure;
  }
  this.emit('failure', testHandlerData);
}

Context.prototype._onError = function(testHandlerData) {
  console.log(testHandlerData.error.message);
  if (this.listeners('error').length == 0) {
    throw testHandlerData.error;
  }
  this.emit('error', testHandlerData);
}

Context.prototype._callHandler = function(handlerData, options) {
  var handler = null;
  var failureLabel = null;
  if (typeof(handlerData) == 'function') {
    handler = handlerData;
  } else {
    handler = handlerData.handler;
    failureLabel = handlerData.label;
  }

  try {
    this.currentOptions = options;
    handler.call(options.scope);
  } catch (e) {
    //console.log("-----------------");
    //console.log(e);

    if (e.name == 'AssertionError') {
      if (failureLabel) {
        e.message = failureLabel + '\n' + e.toString();
      }
      handlerData.failure = e;
      this._onFailure(handlerData);
    } else if (e) {
      if (failureLabel) {
        if (typeof(e) == "string") {
          e = new Error(failureLabel + '\n' + e);
        } else {
          //e = new e.constructor(failureLabel + '\n' + e);
        }
      }
      
      handlerData.error = e
      this._onError(handlerData);
    } else {
      throw 'Caught handler exception with no exception? (' + e +')';
    }
  }

  this._executeNextSetupOrTestOrTeardown(options);
}

Context.prototype._executeNextSetupOrTestOrTeardown = function(options) {
  var itr = options.iterator;
  if (options.asyncHandlers == 0 && itr.hasNext()) {
    this._callHandler(itr.next(), options);
  }
}

Context.prototype.getAllSetupHandlers = function() {
  var handlers = []
  if (this.parent) {
    handlers = handlers.concat(this.parent.getAllSetupHandlers());
  }
  handlers = handlers.concat(this._setupHandlers.slice(0));

  return handlers;
}

Context.prototype.getAllTeardownHandlers = function() {
  var handlers = this._teardownHandlers.slice(0);
  if (this.parent) {
    handlers = handlers.concat(this.parent.getAllTeardownHandlers());
  }
  return handlers;
}

Context.prototype._getSetupHandlersForTest = function(label) {
  label = label + ' (setup)';
  return this.getAllSetupHandlers()
    .slice(0)
    .map(function(handlerData) {
      // NOTE: This add .label to shared handlerData
      // by reference - (slice is shallow clone).
      handlerData.label = label;
      return handlerData;
    });
}

Context.prototype._getTeardownHandlersForTest = function(label) {
  label = label + ' (teardown)';
  return this.getAllTeardownHandlers()
    .slice(0)
    .map(function(handlerData) {
      handlerData.label = label;
      return handlerData;
    });
}

Context.prototype.getLabel = function() {
  var labelParts = [];
  if (this.parent) {
    var parentLabel = this.parent.getLabel();
    if (parentLabel != '') {
      labelParts.unshift(parentLabel);
    }
  }
  if (this._label != '') {
    labelParts.push(this._label);
  }
  return labelParts.join(' ');
}

Context.prototype.toString = function() {
  return '[Context label=' + this.getLabel() + ']';
}

exports.Context = Context;
