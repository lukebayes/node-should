
var SomeClass = require('some_class').SomeClass;

context('SomeClass', function() {

  setup(function() {
    this.instance = new SomeClass();
  });

  should('be instantiable', function() {
    assert.ok(this.instance instanceof SomeClass);
  });

  should('do some long task', function() {
    var self = this;
    this.instance.doSomeLongAsyncTask(10, this.async(function() {
      assert.ok(self.instance.isDone, 'long async task completed');
    }));
  });

  context('with a custom name', function() {

    setup(function() {
      assert.ok(this.instance);
      this.instance.name = 'foo';
    });

    should('accept parent setter', function() {
      assert.equal('foo', this.instance.name);
    });
  });
});
