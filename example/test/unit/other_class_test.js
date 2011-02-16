
var OtherClass = require('other_class').OtherClass;

context('OtherClass', function() {

  setup(function() {
    this.instance = new OtherClass();
  });

  should('be instantiable', function() {
    assert.ok(this.instance);
  });
});
