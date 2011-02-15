
var Context = require('node_should/context').Context;
var Printer = require('node_should/printer').Printer;
var vm = require('vm');
var readEachFileMatching = require('node_should/util').readEachFileMatching;

var DEFAULT_EXPRESSION = /_test.js$/;
var DEFAULT_PATH       = './test';
var DEFAULT_PRINTERS   = [new Printer()];

var Runner = function() {
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
    self._runFileContent(file, content, printers);
  });
}

Runner.prototype._runFileContent = function(file, content, printers, completeHandler) {
  var scope = this._createScope(file, printers);
  vm.runInNewContext(content, scope, file);
}

Runner.prototype._createScope = function(file, printers) {
  var context = null;

  var addPrintersToContext = function(c) {
    printers.forEach(function(printer) {
      printer.addContext(c);
    });
  }

  var createContext = function() {
    var c = new Context();
    addPrintersToContext(c);
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

  return {
    require: require,
    console: console,
    setInterval: setInterval,
    setTimeout: setTimeout,
    context: function() {
      createContext.apply(this, arguments);
    },
    should: function() {
      context.addTestHandler.apply(context, arguments);
    },
    setup: function() {
      context.addSetupHandler.apply(context, arguments);
    },
    teardown: function() {
      context.addTeardownHandler.apply(context, arguments);
    },
    ignore: function() {
      console.log('Ignore not yet supported...');
    },
  }
}

exports.Runner = Runner;

