
var Composite = require('node_should/composite').Composite;
var LabelComposite = require('label_composite').LabelComposite;
var assert = require('assert');

require('../common');

(function isInstantiable() {
  var root = new Composite();
})();

(function canAddChild() {
  var child = new Composite();
  var root = new Composite();
  root.addChild(child);
})();

(function addChildFailsWithNullChild() {
  var root = new Composite();
  assert.throws(function() {
    root.addChild(null);
  }, /requires a child/);
})();

(function addChildUpdatesNumChildren() {
  var child = new Composite();
  var root = new Composite();
  root.addChild(child);
  assert.equal(1, root.numChildren);
})();

(function getChildAtRequiresANumber() {
  var root = new Composite();
  assert.throws(function() {
    root.getChildAt(null);
  }, /must be a number/);
})();

(function getChildAtRequiresANumberGreaterThanZero() {
  var root = new Composite();
  assert.throws(function() {
    root.getChildAt(-1);
  }, /greater than zero/);
})();

(function getChildAtRequiresANumberLessThanNumChildren() {
  var root = new Composite();
  root.addChild(new Composite());
  assert.throws(function() {
    root.getChildAt(1);
  }, /less than numChildren/);
})();

(function getChildAtReturnsAddedChild() {
  var child1 = new Composite();
  var child2 = new Composite();
  var root = new Composite();
  root.addChild(child1);
  root.addChild(child2);
  assert.equal(2, root.numChildren);
  assert.same(child1, root.getChildAt(0));
  assert.same(child2, root.getChildAt(1));
})();

(function getChildrenReturnsChildren() {
  var child1 = new Composite();
  var child2 = new Composite();
  var root = new Composite();
  root.addChild(child1);
  root.addChild(child2);
  var children = root.getChildren();
  assert.equal(2, children.length);
  assert.same(child1, children[0]);
  assert.same(child2, children[1]);
})();

(function removeChildAtDecrementsNumChildren() {
  var child1 = new Composite();
  var child2 = new Composite();
  var root = new Composite();
  root.addChild(child1);
  root.addChild(child2);
  var result = root.removeChildAt(0);
  assert.same(child1, result);
  assert.same(child2, root.getChildAt(0));
})();

(function addingChildUpdatesParent() {
  var child = new Composite();
  var root = new Composite();
  root.addChild(child);
  assert.same(root, child.parent);
})();

(function iteratorLoopsOverOneChild() {
  var root = new Composite();
  var child = new Composite();
  root.addChild(child);

  var itr = root.iterator();
  assert.ok(itr.hasNext());

  assert.same(child, itr.next());
  assert.ok(!itr.hasNext());

  assert.throws(function() {
    itr.next();
  }, /no more items/);
})();

(function iteratorLoopsOverThreeChildren() {
  var root = new Composite();
  var child1 = new Composite();
  var child2 = new Composite();
  var child3 = new Composite();
  root.addChild(child1);
  root.addChild(child2);
  root.addChild(child3);

  var itr = root.iterator();
  assert.ok(itr.hasNext());
  assert.same(child1, itr.next());
  assert.ok(itr.hasNext());
  assert.same(child2, itr.next());
  assert.ok(itr.hasNext());
  assert.same(child3, itr.next());

  assert.ok(!itr.hasNext());
  assert.throws(function() {
    itr.next();
  }, /no more items/);
})();

(function iteratorLoopsOverDepth() {
  var root = new Composite();
  var child1 = new Composite();
  var child2 = new Composite();
  var child3 = new Composite();

  root.addChild(child1);
  child1.addChild(child2);
  root.addChild(child3);

  var itr = root.iterator();

  assert.ok(itr.hasNext());
  assert.strictEqual(child1, itr.next());
  assert.ok(itr.hasNext());
  assert.strictEqual(child2, itr.next());
  assert.ok(itr.hasNext());
  assert.strictEqual(child3, itr.next());
})();

(function iteratorLoopsOverNestedTree() {
  var root = new LabelComposite('root');
  var child1 = new LabelComposite('child1');
  var child2 = new LabelComposite('child2');
  var child3 = new LabelComposite('child3');
  var child4 = new LabelComposite('child4');
  var child5 = new LabelComposite('child5');
  var child6 = new LabelComposite('child6');

  root.addChild(child1);
  root.addChild(child2);
  root.addChild(child3);
  child2.addChild(child4);
  child4.addChild(child5);

  var actualItem = null;
  var itr = root.iterator();
  [child1, child2, child4, child5, child3].forEach(function(expectedItem) {
    assert.ok(itr.hasNext(), 'Failed to haveNext on: ' + expectedItem);
    actualItem = itr.next();
    assert.strictEqual(expectedItem, actualItem);
  });
})();

