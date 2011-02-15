
var Context = require('node_should/context').Context;
var assert = require('assert');
require('../common');

// Configuration

(function contextIsInstantiable() {
  var c = new Context();
})();

(function contextIsComposite() {
  var c = new Context();
  c.addChild(new Context());
  assert.equal(1, c.numChildren);
})();

(function contextAddSetupHandlerFailsWithNullHandler() {
  var c = new Context();
  assert.throws(function() {
    c.addSetupHandler();
  }, /must not be null/);
})();

(function contextAcceptsSetupHandler() {
  var c = new Context();
  c.addSetupHandler(function() {});
})();

(function contextAddTeardownHandlerFailsWithNullHandler() {
  var c = new Context();
  assert.throws(function() {
    c.addTeardownHandler();
  }, /must not be null/);
})();

(function contextAcceptsTeardownHandlers() {
  var c = new Context();
  c.addTeardownHandler(function() {});
})();

(function contextUsesEmptyStringAsDefaultLabel() {
  var c = new Context();
  assert.equal('', c.getLabel());
})();

(function contextFailsWithNullTestHandler() {
  var c = new Context();
  assert.throws(function() {
    c.addTestHandler();
  }, /must not be null/);
})();

(function contextAcceptsTestHandler() {
  var c = new Context();
  c.addTestHandler(function() {});
})();

(function contextAcceptsLabel() {
  var c = new Context('root');
  assert.equal('root', c.getLabel());
})();

(function contextBuildsLabelFromComposite() {
  var root = new Context('SomeClass');
  var child1 = new Context('with child');
  root.addChild(child1);

  assert.equal('SomeClass with child', child1.getLabel());
})();

(function contextBuildsLabelFromComposite() {
  var root = new Context('SomeClass');
  var child1 = new Context();
  root.addChild(child1);

  assert.equal('SomeClass', child1.getLabel());
})();

(function contextBuildsLabelFromComposite() {
  var root = new Context();
  var child1 = new Context('SomeClass');
  root.addChild(child1);

  assert.equal('SomeClass', child1.getLabel());
})();

// Execution

(function contextFailsToExecuteIfNoTests() {
  var c = new Context();
  assert.throws(function() {
    c.execute();
  }, /no tests/);

})();

(function contextRunsSetupsThenTestsThenTeardowns() {
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
})();

(function contextRunsHandlersInSharedScope() {
  var c = new Context('SomeClass');
  c.addSetupHandler(function() {
    this.foo = 'bar';
  });
  c.addTestHandler(function() {
    assert.equal(this.foo, 'bar');
  });
  c.execute();
})();

(function setupsCalledForEachTestMethod() {
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
})();

(function testMethodsCalledWithDifferentScope() {
  var firstScope = null;
  var secondScope = null;
  var c = new Context();
  c.addTestHandler(function() { firstScope = this });
  c.addTestHandler(function() { secondScope = this });
  c.execute();
  assert.notStrictEqual(firstScope, secondScope);
})();

(function contextRunsSetupAsynchronouslyIfRequested() {
  var executed = [];
  var c = new Context();
  c.addSetupHandler(function() {
    var asyncHandler = this.async(function() {
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
})();

(function contextRunsTestAsynchronously() {
  var executed = [];
  var c = new Context();
  c.addSetupHandler(function() {
    setTimeout(this.async(function() {
      executed.push('asyncsetup');
    }), 0);
  });
  c.addTestHandler(function() {
    setTimeout(this.async(function() {
      executed.push('asynctest1');
    }), 0);
  });
  c.addTestHandler(function() {
    setTimeout(this.async(function() {
      executed.push('asynctest2');
    }), 0);
  });
  c.addTeardownHandler(function() {
    setTimeout(this.async(function() {
      executed.push('asyncteardown');
    }), 0);
  });

  c.execute(function() {
    assert.equal(6, executed.length);
  });
})();

(function contextCapturesAssertionExceptions() {
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
})();

(function contextCapturesAssertionErrors() {
  var failure = null;
  var c = new Context();
  c.addListener('failure', function(f) {
    failure = f;
  });
  c.addTestHandler(function() {
    setTimeout(this.async(function() {
      assert.ok(false, 'should be false');
    }), 0);
  });
  c.execute(function() {
    assert.ok(failure);
  });
})();

(function contextHandlesMultipleAsyncsInSameCall() {
  var executed = [];
  var c = new Context();
  c.addTestHandler(function() {
    setTimeout(this.async(function() {
      executed.push('one');
    }), 0);
    setTimeout(this.async(function() {
      executed.push('two');
    }), 0);
    setTimeout(this.async(function() {
      executed.push('three');
    }), 0);
  });
  
  c.execute(function() {
    assert.equal(3, executed.length);
    assert.equal(executed[0], 'one');
    assert.equal(executed[1], 'two');
    assert.equal(executed[2], 'three');
  });
})();

// Failure Messages

(function contextDisplaysHelpfulTestMessages() {
  var c = new Context('SomeClass');
  c.addTestHandler('accept argument', function() {
    assert.ok(false);
  });
  c.addListener('failure', function(e) {
    assert.match(/SomeClass should accept argument/, e.message);
  });
  c.execute();
})();

(function contextLabelShowsEvenIfNoTestLable() {
  var c = new Context('SomeClass');
  c.addTestHandler(function() {
    assert.ok(false);
  });
  c.addListener('failure', function(e) {
    assert.match(/SomeClass/, e.stack);
  });
  c.execute();
})();

