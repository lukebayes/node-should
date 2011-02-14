
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
  this._setupHandlers.push(handler);
}

Context.prototype.addTeardownHandler = function(handler) {
  if (handler == null) throw 'The handler provided to Context.addTeardownHandler must not be null';
  this._teardownHandlers.push(handler);
}

Context.prototype.addTestHandler = function(handler) {
  if (handler == null) throw 'The handler provided to Context.addTestHandler must not be null';
  this._testHandlers.push(handler);
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
          if (options.asyncHandlers == 0) {
            self._callHandler(callback, options.scope);
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
  //throw 'this fails silently whent the complete handler throws an assertion exception!';
  handlers.push(function() {
    if (completeHandler) {
      completeHandler();
    }
  });

  return new ArrayIterator(testHandlerList);
}
  
Context.prototype._onFailure = function(error) {
  this.emit('failure', error);
}

Context.prototype._callHandler = function(handler, scope) {
  try {
    handler.call(scope);
  } catch (e) {
    if (e instanceof AssertionError) {
      this._onFailure(e);
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
