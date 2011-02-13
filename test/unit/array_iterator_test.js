
var assert = require('assert');
require('../common');
var ArrayIterator = require('node_should/array_iterator').ArrayIterator;

(function iteratorLoopsOverOneChild() {
  var itr = new ArrayIterator(['a']);
  assert.ok(itr.hasNext());
  assert.equal('a', itr.next());

  assert.ok(!itr.hasNext());
  assert.throws(function() {
    itr.next();
  }, /no more items/);
})();

(function iteratorLoopsOverThreeChildren() {
  var itr = new ArrayIterator(['a', 'b', 'c']);
  assert.ok(itr.hasNext());
  assert.equal('a', itr.next());
  assert.ok(itr.hasNext());
  assert.equal('b', itr.next());
  assert.ok(itr.hasNext());
  assert.equal('c', itr.next());

  assert.ok(!itr.hasNext());
  assert.throws(function() {
    itr.next();
  }, /no more items/);
})();

(function peekReturnsNextItem() {
  var itr = new ArrayIterator(['a', 'b']);
  assert.equal('a', itr.peek());
  itr.next();
  assert.equal('b', itr.peek());
  itr.next();

  assert.ok(!itr.hasNext());

  assert.throws(function() {
    itr.peek();
  }, /no more items/);
})();

