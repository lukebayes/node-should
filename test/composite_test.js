var Composite = require('../').Composite;
var LabelComposite = require('./fakes/label_composite');

context('A new Composite', function() {

  should('be instantiable', function() {
    var root = new Composite();
  });

  context('with addChild', function() {

    should('accept children', function() {
      var child = new Composite();
      var root = new Composite();
      root.addChild(child);
    });

    should('fail with null', function() {
      var root = new Composite();
      assert.throws(function() {
        root.addChild(null);
      }, /requires a child/);
    });

    should('update numChildren', function() {
      var child = new Composite();
      var root = new Composite();
      root.addChild(child);
      assert.equal(1, root.numChildren);
    });

    should('update child.parent reference', function() {
      var child = new Composite();
      var root = new Composite();
      assert.ok(child.parent == null);
      root.addChild(child);
      assert.same(root, child.parent);
    });
  });

  context('with getChildAt', function() {

    should('require a number', function() {
      var root = new Composite();
      assert.throws(function() {
        root.getChildAt(null);
      }, /must be a number/);
    });

    should('require a number greater than zero', function() {
      var root = new Composite();
      assert.throws(function() {
        root.getChildAt(-1);
      }, /greater than zero/);
    });

    should('require a number less than num children', function() {
      var root = new Composite();
      root.addChild(new Composite());
      assert.throws(function() {
        root.getChildAt(1);
      }, /less than numChildren/);
    });

    should('return requested child', function() {
      var child1 = new Composite();
      var child2 = new Composite();
      var root = new Composite();
      root.addChild(child1);
      root.addChild(child2);
      assert.equal(2, root.numChildren);
      assert.same(child1, root.getChildAt(0));
      assert.same(child2, root.getChildAt(1));
    });
  });

  context('getChildren', function() {
    should('return children', function() {
      var child1 = new Composite();
      var child2 = new Composite();
      var root = new Composite();
      root.addChild(child1);
      root.addChild(child2);
      var children = root.getChildren();
      assert.equal(2, children.length);
      assert.same(child1, children[0]);
      assert.same(child2, children[1]);
    });
  });

  context('removeChildAt', function() {

    should('decrement numChildren', function() {
      var child1 = new Composite();
      var child2 = new Composite();
      var root = new Composite();
      root.addChild(child1);
      root.addChild(child2);
      var result = root.removeChildAt(0);
      assert.same(child1, result);
      assert.same(child2, root.getChildAt(0));
    });
  });

  context('with iterator', function() {

    should('enumerate children', function() {
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
    });

    should('enumerate three children', function() {
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
    });

    should('enumerate composite', function() {
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
    });

    should('enumerate deep composite', function() {
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
    });
  });
});

