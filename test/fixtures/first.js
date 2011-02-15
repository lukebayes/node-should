
context('SomeClass', function() {

  should('do something', function() {
    setTimeout(this.async(function() {
    }), 0);
  });
});
