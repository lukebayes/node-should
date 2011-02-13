
var Composite = require('node_should/composite').Composite;
var ArrayIterator = require('node_should/array_iterator').ArrayIterator;
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
  
  var testsToComplete = testHandlerList.length;
  var testsCompleted = 0;
  var perTestCompleteHandler = function() {
    console.log(">> checking " + testsCompleted + " and : " + testsToComplete);
    if (testsCompleted++ >= testsToComplete) {
      completeHandler.call(this);
    }
  }

  var self = this;
  // Initiate all tests immediately:
  var testIterator = new ArrayIterator(testHandlerList);
  while (testIterator.hasNext()) {
    var scope = {
      pendingAsyncs: 0,
      async: function(callback) {
        scope.pendingAsyncs++;
        
        return function() {
          scope.pendingAsyncs--;
          callback.apply(scope, arguments);
          if (scope.pendingAsyncs == 0) {
            self._executeNextSetupTestOrTeardown(testIterator.next(), scope, perTestCompleteHandler);
          }
        }
      }
    }
    this._executeNextSetupTestOrTeardown(testIterator.next(), scope, perTestCompleteHandler);
  }
}

Context.prototype._executeNextSetupTestOrTeardown = function(iterator, scope, completeHandler) {
  if (iterator.hasNext()) {
    var handler = iterator.next();
    handler.call(scope);
    if (scope.pendingAsyncs == 0) {
      this._executeNextSetupTestOrTeardown(iterator, scope);
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
