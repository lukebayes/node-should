
var ArrayIterator = require('node_should/array_iterator').ArrayIterator;
var Composite = require('node_should/composite').Composite;

var AssertionError = require('assert').AssertionError;
var util = require('util');

var Context = function(label) {
  Composite.call(this);
  this._label = label || '';
  this._setupHandlers = [];
  this._teardownHandlers = [];
  this._testHandlers = [];
}

util.inherits(Context, Composite);

Context.prototype.addSetupHandler = function(handler) {
  if (handler == null) throw 'The handler provided to Context.addSetupHandler must not be null';
  this._setupHandlers.push({ handler: handler });
}

Context.prototype.addTeardownHandler = function(handler) {
  if (handler == null) throw 'The handler provided to Context.addTeardownHandler must not be null';
  this._teardownHandlers.push({ handler: handler });
}

/**
 * Could be called with no label, but because of how the DSL feels, the optional
 * argument belongs on the left.
 */
Context.prototype.addTestHandler = function(label, handler) {
  this._cleanHandlerArguments(arguments);
  this._testHandlers.push({ handler: handler, label: label });
  // TODO(lukebayes) Probably shouldn't set label here, it's doing work that
  // isn't necessary, and will only be used in cases of failure?
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
  var label = this.getLabel();
  var handler = null;
  if (args.length == 0) throw 'The handler provided to Context.addTestHandler (or addSetupHandler, addTeardownHandler) must not be null';

  if (args.length == 1) {
    if (typeof(args[0]) != 'function') throw 'A handler must be sent to the add___ method'
    args[1] = args[0];
    args[0] = label;
  } else if (args.length == 2) {
    args[0] = [label, 'should', args[0]].join(' ');
    return;
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

Context.prototype._getTestExecutionOptions = function(iterator) {
  var self = this;
  var options = {
    asyncHandlers : 0,
    iterator : iterator,
    scope : { 
      async : function(callback) {
        options.asyncHandlers++;
        return function() {
          options.asyncHandlers--;
          self._callHandler(callback, options.scope);
          if (options.asyncHandlers == 0) {
            self._executeNextSetupOrTestOrTeardown(options);
          }
        }
      }
    }
  }
  return options;
}

Context.prototype._createTestHandlerIterator = function(completeHandler) {
  var setupHandlers = this._getSetupHandlers();
  var testHandlers = this._testHandlers;
  var teardownHandlers = this._teardownHandlers;

  var testHandlerList = [];
  var handlers = null;
  // Build an array of arrays, each item is an array of all
  // setup methods, a single test method, and all teardowns.
  // Each of these collections of methods will be executed in
  // a unique scope that is only shared by them.
  testHandlers.forEach(function(handler) {
    handlers = setupHandlers.slice(0);
    handlers = handlers.concat([handler]);
    handlers = handlers.concat(teardownHandlers.slice(0));
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
      }, 0);
    }
  });

  return new ArrayIterator(testHandlerList);
}
  
Context.prototype._onFailure = function(failure) {
  this.emit('failure', failure);
}

Context.prototype._callHandler = function(handlerData, scope) {
  var handler = null;
  var failureLabel = null;
  if (typeof(handlerData) == 'function') {
    handler = handlerData;
  } else {
    handler = handlerData.handler;
    failureLabel = handlerData.label;
  }
  try {
    handler.call(scope);
  } catch (e) {
    if (e instanceof AssertionError) {
      if (failureLabel) {
        e.message = failureLabel + '\n' + e.message;
      }
      this._onFailure(e);
    } else {
      throw e
    }
  }
}

Context.prototype._executeNextSetupOrTestOrTeardown = function(options) {
  var itr = options.iterator;

  if (itr.hasNext()) {
    this._callHandler(itr.next(), options.scope);
    if(options.asyncHandlers == 0) {
      this._executeNextSetupOrTestOrTeardown(options);
    }
  }
}

Context.prototype._getSetupHandlers = function() {
  return this._setupHandlers;
}

Context.prototype._getTeardownHandlers = function() {
  return this._teardownHandlers;
}

Context.prototype.getLabel = function() {
  var labelParts = [];
  if (this.parent) {
    var parentLabel = this.parent.getLabel();
    if (parentLabel != '') {
      labelParts.push(parentLabel);
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
