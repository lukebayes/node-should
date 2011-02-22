
var assert = require('node_should/assert');
var Context = require('node_should/context').Context;
var Printer = require('node_should/printer').Printer;
var vm = require('vm');
var readEachFileMatching = require('node_should/util').readEachFileMatching;

var DEFAULT_EXPRESSION = /_test.js$/;
var DEFAULT_PATH       = './test';
var DEFAULT_PRINTERS   = [new Printer()];

var Runner = function() {
}

Runner.prototype.runFromTerminal = function(argv, printers, completeHandler) {
  console.log("Running from term with: " + argv);
  argv.forEach(function(val, index, array) {
    console.log("val: " + val + " index: " + index);
    if (val == '-s' || val == '--source-path') {
      console.log("source path with: " + array[index+1]);
    } else if (val == '-t' || val == '--test-expression') {
      console.log("testl expression with: " + array[index+1]);
    } else if (val == '-n' || val == '--name') {
      console.log("test name with: " + array[index+1]);
    }
  });
}

Runner.prototype.run = function(expr, path, printers, completeHandler) {
  printers = (printers) ? printers : DEFAULT_PRINTERS;
  // start provided printers:
  printers.forEach(function(p) { p.start(); });

  expr = (expr) ? expr : DEFAULT_EXPRESSION;
  path = (path) ? path : DEFAULT_PATH;
  var self = this;
  readEachFileMatching(expr, path, function(err, file, content) {
    if (err) throw err;
    self._runFileContent(file, content, printers, completeHandler);
  });
}

Runner.prototype._runFileContent = function(file, content, printers, completeHandler) {
  var scope = this._createScope(file, printers, completeHandler);
  vm.runInNewContext(content, scope, file);
}

/**
 * This method creates a new scope object that will be handed to 
 * vm.runInNewScope.
 *
 * The named entities that are available on the returned scope wiil be
 * available to tests in lexical scope.
 *
 * The body of this method is necessarily long as each scope should
 * have it's own execution context in order to avoid asynchronous
 * interactions across shared state.
 */
Runner.prototype._createScope = function(file, printers, completeHandler) {
  var context = null;
  var self = this;

  var createContext = function() {
    var c = new Context();
    self._addContextToPrinters(printers, c);

    if (context == null) {
      context = c;
    } else {
      context.addChild(c);
      context = c;
    }
    c.addExecutionHandler.apply(c, arguments);
    c.execute(function() {
      self._removeContextFromPrinters(printers, c, completeHandler);
    });
    if (c.parent) {
      context = c.parent;
    }
  }

  var scope = {};
  for (var k in global) {
    scope[k] = global[k];
  }

  scope.assert = assert;
  scope.console = console;
  scope.global = scope;
  scope.require =  require;
  scope.root = root;

  scope.async = function() {
    return context.addAsyncHandler.apply(context, arguments);
  };
  scope.context =  function() {
    return createContext.apply(this, arguments);
  };
  scope.should = function() {
    return context.addTestHandler.apply(context, arguments);
  };
  scope.setup = function() {
    return context.addSetupHandler.apply(context, arguments);
  };
  scope.teardown = function() {
    return context.addTeardownHandler.apply(context, arguments);
  };
  scope.ignore = function() {
    console.log('Ignore not yet supported...');
  };

  return scope;
}

Runner.prototype._addContextToPrinters = function(printers, context) {
  printers.forEach(function(printer) {
    printer.addContext(context);
  });
}

Runner.prototype._removeContextFromPrinters = function(printers, context, completeHandler) {
  printers.forEach(function(printer) {
    printer.removeContext(context);
    if (completeHandler && printer.finished) {
      completeHandler.call(this);
    }
  });
}

exports.Runner = Runner;

