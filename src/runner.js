
var assert = require('./assert');
var Context = require('./context');
var Printer = require('./printer');
var eachFile = require('@lukebayes/each-file');
var vm = require('vm');

var DEFAULT_EXPRESSION = /_test.js$/;
var DEFAULT_PATHS      = ['./test'];
var DEFAULT_PRINTERS   = [new Printer()];

var Runner = function() {
}

Runner.prototype.runFromTerminal = function(argv, printers, completeHandler) {
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
  // TODO(lbayes): Forward terminal params into the run command:
  this.run();
}

Runner.prototype.run = function(expr, paths, printers, completeHandler) {
  printers = (printers) ? printers : DEFAULT_PRINTERS;
  // start provided printers:
  printers.forEach(function(p) { p.start(); });

  expr = (expr) ? expr : DEFAULT_EXPRESSION;
  paths = (paths) ? paths : DEFAULT_PATHS;

  this._addToLoadPath(paths);

  var pathCount = paths.length;
  var pathSearchCount = 0;
  var self = this;
  paths.forEach(function(path) {
    eachFile.matchingRead(expr, path, function(err, file, stat, content) {
      if (err) throw err;
      self._runFileContent(file, content, printers, completeHandler);
    }, function(err) {
      if (err) throw err;
      // Only 'finish' if all paths have been searched:
      if (++pathSearchCount >= pathCount) {
        self._finish(printers);
      }
    });
  });
}

Runner.prototype._finish = function(printers) {
  printers.forEach(function(printer) {
    printer.canFinish();
  });
}

Runner.prototype._addToLoadPath = function(paths) {
  paths.forEach(function(path) {
    console.log('path:', path);
  });
}

Runner.prototype._runFileContent = function(file, content, printers, completeHandler) {
  var scope = this._createScope(file, printers, completeHandler);
  console.log('FILE:', file);
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
    c.execute();
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
  scope.require =  function(path) {
    console.log('CWD:', process.cwd());
    console.log('REQUIRE:', path);
    return require(path);

    // return require(process.cwd() + '/test/' + path);
  };
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

module.exports = Runner;

