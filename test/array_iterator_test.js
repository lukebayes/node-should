
var ArrayIterator = require('../').ArrayIterator;

context('ArrayIterator', function() {

  should('loop over one child', function() {
    var itr = new ArrayIterator(['a']);
    assert.ok(itr.hasNext());
    assert.equal('a', itr.next());

    assert.ok(!itr.hasNext());
    assert.throws(function() {
      itr.next();
    }, /no more items/);
  });

  should('loop over three children', function() {
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
  });

  should('return next item from peek', function() {
    var itr = new ArrayIterator(['a', 'b']);
    assert.equal('a', itr.peek());
    itr.next();
    assert.equal('b', itr.peek());
    itr.next();

    assert.ok(!itr.hasNext());

    assert.throws(function() {
      itr.peek();
    }, /no more items/);
  });
});

