
function runFilesMatching(expr, path, printers, completeHandler) {
  console.log(">> run called!");
}

function runFile(file, printers, completeHandler) {
}

exports.runFilesMatching = runFilesMatching;

/*
//var Context = require('node_unit/context').Context;
//var TerminalPrinter = require('node_unit/terminal_printer').TerminalPrinter;
var readEachFileMatching = require('node_should/utils').readEachFileMatching;

DEFAULT_EXPRESSION = /_test.js$/;
DEFAULT_PATH       = './test';
//DEFAULT_PRINTERS   = [new TerminalPrinter()];
var Runner = function() {
  this.contexts = [];
}

Runner.prototype.start = function(expr, path, printers) {
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

Runner.prototype.addContext = function(file, content, printers) {
  var context = new Context();
  context.printers = printers;
  this.contexts.push(context);
  context.execute(file, content);
  return context;
}

exports.Runner = Runner;
*/

