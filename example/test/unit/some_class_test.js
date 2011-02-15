
var SomeClass = require('some_class').SomeClass;

context('SomeClass', function() {

  setup(function() {
    this.instance1 = new SomeClass();
  });

  should('be instantiable', function() {
    assert.ok(this.instance1 instanceof SomeClass);
  });

  should('do some long task', function() {
    var self = this;
    this.instance1.doSomeLongAsyncTask(10, this.async(function() {
      assert.ok(self.instance1.isDone, 'long async task completed');
    }));
  });

  context('with a custom name', function() {

    setup(function() {
      this.instance = new SomeClass();
      this.instance.name = 'foo';
    });

    should('accept setter', function() {
      assert.equal('foo', this.instance.name);
    });
  });
});
