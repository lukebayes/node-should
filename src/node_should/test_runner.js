var Context = require('node_unit/context').Context;
var TerminalPrinter = require('node_unit/terminal_printer').TerminalPrinter;
var readEachFileMatching = require('node_unit/utils').readEachFileMatching;

DEFAULT_EXPRESSION = /_test.js$/;
DEFAULT_PATH       = './test';
DEFAULT_PRINTERS   = [new TerminalPrinter()];

var TestRunner = function() {
  this.contexts = [];
}

TestRunner.prototype.start = function(expr, path, printers) {
  printers = (printers) ? printers : DEFAULT_PRINTERS;
  expr = (expr) ? expr : DEFAULT_EXPRESSION;
  path = (path) ? path : DEFAULT_PATH;
  var self = this;
  readEachFileMatching(expr, path, function(err, file, content) {
    if (err) throw err;
    self.addContext(file, content, printers);
  });
  var intervalId = setInterval(function() {
    if (printers[0].finished) {
      clearInterval(intervalId);
    }
  }, 10);
}

TestRunner.prototype.addContext = function(file, content, printers) {
  var context = new Context();
  context.printers = printers;
  this.contexts.push(context);
  context.execute(file, content);
  return context;
}

exports.TestRunner = TestRunner;

