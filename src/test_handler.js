var EventEmitter = require('events').EventEmitter;
var util = require('util');

var TestHandler = function() {
  EventEmitter.call(this);
  this.asyncHandlers = [];
  this.context = null;
  this.error = null;
  this.failure = null;
  this.handler = null;
  this.label = '';
}

util.inherits(TestHandler, EventEmitter);

TestHandler.create = function(context, label, handler) {
  var instance = new TestHandler();
  instance.context = context;
  instance.handler = handler;
  instance.label = label;
  return instance;
}

TestHandler.prototype.execute = function() {
}

TestHandler.prototype.onComplete = function() {
  this.emit('complete', this);
}

TestHandler.prototype.addAsyncHandler = function(callback, timeout) {
}

TestHandler.prototype.asyncHandlerCount = function() {
  return this.asyncHandlers.length;
}

module.exports = TestHandler;
