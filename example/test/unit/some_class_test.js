
var SomeClass = require('some_class').SomeClass;

// This is an example context for 'SomeClass'.
// This is the outermost context in the file, but
// there is no reason a single file can't contain
// multiple contexts.
context('SomeClass', function() {

  // This is an example setup method. Any number of
  // setup methods can be declared and will be called
  // in the order they are declared. Setup methods
  // in parent contexts will be called first and 
  // provided a shared 'this' scope.
  // 
  // The 'this' scope will be unique for each test
  // method, but shared across it's setup and teardown
  // methods.
  setup(function() {
    this.instance = new SomeClass();
  });

  // This method is superfluous, but exists
  // here as an example. Any number of teardown
  // handlers can be created and will be called.
  // Parent context teardowns will be called before
  // current context teardowns and provided a shared
  // 'this' scope.
  teardown(function() {
    this.instance = null;
  });

  // This is a simple test method that
  // relies on the execution of a setup method:
  should('be instantiable', function() {
    assert.ok(this.instance instanceof SomeClass);
  });

  // This is an asynchronous test method:
  // Node how we send our custom handler to
  // async, and send it's response to
  // whatever would normally trigger our custom
  // handler.
  should('do some long task', function() {
    var self = this;
    this.instance.doSomeLongAsyncTask(10, async(function() {
      assert.ok(self.instance.isDone, 'long async task completed');
    }));
  });

  // This is a child context, all parent context
  // setups will be called first.
  context('with a custom name', function() {

    // This is a child setup method. Setups from the
    // parent context will be called first, but 'this'
    // is shared.
    setup(function() {
      assert.ok(this.instance);
      this.instance.name = 'foo';
    });

    // This is a child test method that relies on the
    // fact that the parent context setup was called,
    // then the child context setup, then this method.
    should('accept parent setter', function() {
      assert.equal('foo', this.instance.name);
    });
  });
});
