
var Context = require('node_should/context').Context;
require('common');

context('A new Context', function() {

  should('be instantiable', function() {
    var c = new Context();
  });

  should('inherit from Composite', function() {
    var c = new Context();
    c.addChild(new Context());
    assert.equal(1, c.numChildren);
  });

  context('label', function() {

    should('accept empty string', function() {
      var c = new Context();
      assert.equal('', c.getLabel());
    });

    should('accept any string', function() {
      var c = new Context('root');
      assert.equal('root', c.getLabel());
    });

    should('build from composite', function() {
      var root = new Context('SomeClass');
      var child1 = new Context('with child');
      root.addChild(child1);

      assert.equal('SomeClass with child', child1.getLabel());
    });
    
    should('build from composite, ignoring null child labels', function() {
      var root = new Context('SomeClass');
      var child1 = new Context();
      root.addChild(child1);

      assert.equal('SomeClass', child1.getLabel());
    });

    should('build from composite, ignoring null root label', function() {
      var root = new Context();
      var child1 = new Context('SomeClass');
      root.addChild(child1);

      assert.equal('SomeClass', child1.getLabel());
    });
  });

  context('setup handler', function() {

    should('fail with null handler', function() {
      var c = new Context();
      assert.throws(function() {
        c.addSetupHandler();
      }, /must not be null/);
    });

    should('accept function', function() {
      var c = new Context();
      c.addSetupHandler(function() {});
    });

    should('grab parent setups', function() {
      var executed = [];
      var parent = new Context('SomeParent');
      parent.addSetupHandler(function() {
        executed.push('parentsetup');
        this.param = {};
      });
      parent.addTeardownHandler(function() {
        executed.push('parentteardwon');
      });
      var child = new Context('with a child');
      child.addSetupHandler(function() {
        executed.push('childsetup');
        this.param.name = 'childvalue';
      });
      child.addTeardownHandler(function() {
        executed.push('childteardown');
      });
      child.addTestHandler('do something', function() {
        executed.push('testmethod1');
        assert.equal(this.param.name, 'childvalue');
      });
      child.addTestHandler('do something else', function() {
        executed.push('testmethod2');
      });

      parent.addChild(child);
      child.execute();
      assert.equal(10, executed.length);
      assert.equal('parentsetup', executed[0]);
    });
  });

  context('teardown handler', function() {

    should('fail with null handler', function() {
      var c = new Context();
      assert.throws(function() {
        c.addTeardownHandler();
      }, /must not be null/);
    });

    should('accept function', function() {
      var c = new Context();
      c.addTeardownHandler(function() {});
    });
  });

  context('test handler', function() {

    should('fail with null handler', function() {
      var c = new Context();
      assert.throws(function() {
        c.addTestHandler();
      }, /must not be null/);
    });

    should('accept function', function() {
      var c = new Context();
      c.addTestHandler(function() {});
    });
  });

  context('execution', function() {

    should('fail if no tests', function() {
      var c = new Context();
      assert.throws(function() {
        c.execute();
      }, /no tests/);
    });

    should('run setup, then tests, then teardowns', function() {
      var executed = [];
      var c = new Context('SomeClass');
      c.addSetupHandler(function() {
        executed.push('setup');
      });
      c.addTestHandler(function() {
        executed.push('test');
      });
      c.addTeardownHandler(function() {
        executed.push('teardown');
      });
      c.execute();

      var expected = ['setup', 'test', 'teardown']; 
      assert.equal(expected.length, executed.length);
      assert.equal(expected[0], executed[0]);
      assert.equal(expected[1], executed[1]);
      assert.equal(expected[2], executed[2]);
    });

    should('run handlers in shared scope', function() {
      var c = new Context('SomeClass');
      c.addSetupHandler(function() {
        this.foo = 'bar';
      });
      c.addTestHandler(function() {
        assert.equal(this.foo, 'bar');
      });
      c.execute();
    });

    should('call setups for each test method', function() {
      var executed = [];
      var c = new Context('SomeClass');
      c.addSetupHandler(function() { executed.push('setup1'); });
      c.addSetupHandler(function() { executed.push('setup2'); });
      c.addTestHandler(function() { executed.push('test1') });
      c.addTestHandler(function() { executed.push('test2') });
      c.addTestHandler(function() { executed.push('test3') });
      c.addTestHandler(function() { executed.push('test4') });
      c.addTeardownHandler(function() { executed.push('teardown1'); });
      c.addTeardownHandler(function() { executed.push('teardown2'); });
      c.execute();

      assert.equal(20, executed.length);
    });

    should('use different scope for different test methods', function() {
      var firstScope = null;
      var secondScope = null;
      var c = new Context();
      c.addTestHandler(function() { firstScope = this });
      c.addTestHandler(function() { secondScope = this });
      c.execute();
      assert.notStrictEqual(firstScope, secondScope);
    });

    /*
    should('run setup asynchronously, if requested', function() {
      var executed = [];
      var c = new Context();
      c.addSetupHandler(function() {
        var asyncHandler = async(function() {
          executed.push('asyncsetup');
        });
        setTimeout(asyncHandler, 0);
      });
      c.addTestHandler(function() {
        executed.push('test');
      });
      c.execute(function() {
        assert.equal(2, executed.length);
        assert.equal('asyncsetup', executed[0]);
        assert.equal('test', executed[1]);
      });
    });

    should('run tests asynchronously, if requested', function() {
      var executed = [];
      var c = new Context();
      c.addSetupHandler(function() {
        setTimeout(async(function() {
          executed.push('asyncsetup');
        }), 0);
      });
      c.addTestHandler(function() {
        setTimeout(async(function() {
          executed.push('asynctest1');
        }), 0);
        // TODO(lukebayes) Problem with async tests:
        // Make the previous line:
        //}), 500);
        // This fails!!!!!
      });
      c.addTestHandler(function() {
        setTimeout(async(function() {
          executed.push('asynctest2');
        }), 0);
      });
      c.addTeardownHandler(function() {
        setTimeout(async(function() {
          executed.push('asyncteardown');
        }), 0);
      });

      c.execute(function() {
        assert.equal(6, executed.length);
      });
    });
    */

    should('capture runtime errors', function() {
      var error = null;
      var c = new Context('SomeClass');
      c.addListener('error', function(test) {
        error = test.error;
      });
      c.addTestHandler('do something', function() {
        throw 'unknown application error';
      });
      c.execute();
      assert.match(/SomeClass should do something/, error.toString());
      assert.match(/unknown application error/, error.toString());
    });

    should('capture assertion exceptions', function() {
      var failure = null;
      var c = new Context();
      c.addListener('failure', function(f) {
        failure = f;
      });

      c.addTestHandler(function() {
        assert.ok(false, 'should be false');
      });

      c.execute();
      assert.ok(failure);
    });

    /*
    should('capture async errors', function() {
      var failure = null;
      var c = new Context();
      c.addListener('failure', function(f) {
        failure = f;
      });
      c.addTestHandler(function() {
        setTimeout(c.addAsyncHandler(function() {
          assert.ok(false, 'should be false');
        }), 0);
      });
      c.execute(function() {
        assert.ok(failure);
      });
    });
    */

    should('include helpful label on setup error', function() {
      var error = null;
      var c = new Context('OtherClass');
      c.addListener('error', function(test) {
        error = test.error;
      });
      c.addSetupHandler(function() {
        throw 'unknown setup error';
      });
      c.addTestHandler('do something', function() {});
      c.execute();
      assert.match(/OtherClass should do something \(setup\)/, error.toString());
    });

    /*
    should('handle multiple asyncs in same call', function() {
      var executed = [];
      var c = new Context();
      c.addTestHandler(function() {
        setTimeout(async(function() {
          c.addAsyncHandler(function() {
            executed.push('one');
          });
        }));
        setTimeout(async(function() {
          c.addAsyncHandler(function() {
            executed.push('two');
          });
        }));
        setTimeout(async(function() {
          c.addAsyncHandler(function() {
            executed.push('three');
          });
        }));
      });

      c.execute(function() {
        assert.equal(3, executed.length);
        assert.equal(executed[0], 'one');
        assert.equal(executed[1], 'two');
        assert.equal(executed[2], 'three');
      });
    });
    */
  });

  context('failure', function() {

    should('display helpful message', function() {
      var c = new Context('SomeClass');
      c.addTestHandler('accept argument', function() {
        assert.ok(false);
      });
      c.addListener('failure', function(test) {
        assert.match(/SomeClass should accept argument/, test.failure.message);
      });
      c.execute();
    });

    should('create default label', function() {
      var c = new Context('SomeClass');
      c.addTestHandler(function() {
        assert.ok(false);
      });
      c.addListener('failure', function(test) {
        assert.match(/SomeClass/, test.failure.stack);
      });
      c.execute();
    });

    should('work with throws assertion failures', function() {
      var composite = new Context('SomeClass');
      composite.addTestHandler(function() {
        assert.throws(function() {
          throw 'hello world';
        }, /hello world/);
      });
      composite.execute();
    });
  });
});

