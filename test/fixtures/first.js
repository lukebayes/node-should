
context('AnotherClass', function() {

  setup(function() {
    this.name = 'abcd';
  });

  should('do something', function() {
    assert.equal('abcd', this.name);
  });

  should('throw exception', function() {
    assert.throws(function() {
      throw new Error('hello world');
    });
  });
});

