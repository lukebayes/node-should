var ArrayIterator = require('node_should/array_iterator').ArrayIterator;
var Stack = require('node_should/stack').Stack;

/**
 * Composite Iterator enables synchronous or asynchronous, depth-first 
 * traversal of a tree structure of any size or depth.
 */
var CompositeIterator = function(composite) {
  this.root = composite;
  this.iteratorStack = new Stack();
  this.iteratorStack.push(composite.childrenIterator());
}

CompositeIterator.prototype.next = function() {
  if (!this.hasNext()) throw 'Iterator.next called but no more items are available.'

  var childrenIterator = this.iteratorStack.peek();
  var returnComposite = childrenIterator.next();

  if (!childrenIterator.hasNext()) {
    this.iteratorStack.next();
  }

  var iterator2 = returnComposite.childrenIterator();
  if (iterator2.hasNext()) {
    this.iteratorStack.push(iterator2);
  }

  return returnComposite;
}

CompositeIterator.prototype.hasNext = function() {
  return !this.iteratorStack.isEmpty();
}

exports.CompositeIterator = CompositeIterator;
