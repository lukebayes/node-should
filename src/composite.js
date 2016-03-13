var ArrayIterator = require('./array_iterator').ArrayIterator;
var CompositeIterator = require('./composite_iterator').CompositeIterator;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
 * Composite is an abstract base class that provides support for building
 * arbitrarily large and deep part-whole hiearchies.
 */
var Composite = function() {
  EventEmitter.call(this);
  this.parent = null;
  this.children = [];
  this.numChildren = 0;
}

util.inherits(Composite, EventEmitter);

Composite.prototype.addChild = function(child) {
  if (!child) throw 'Composite.addChild requires a child, like: addChild(child).';
  this.numChildren++;
  this.children.push(child);
  child.parent = this;
  return child;
}

Composite.prototype.getChildAt = function(index) {
  if (index == null || isNaN(index)) throw 'Provided index must be a number.';
  if (index < 0) throw 'Provided index must be greater than zero.';
  if (index >= this.numChildren) throw 'Provided index must be less than numChildren.';
  return this.children[index];
}

Composite.prototype.removeChildAt = function(index) {
  var child = this.getChildAt(index);
  this.children.splice(index, 1);
  return child;
}

Composite.prototype.getChildren = function() {
  return this.children;
}

Composite.prototype.iterator = function() {
  return new CompositeIterator(this);
}

Composite.prototype.childrenIterator = function() {
  return new ArrayIterator(this.getChildren());
}

Composite.prototype.toString = function() {
  return '[Composite]';
}

module.exports = Composite;


