
var assert = require('assert');

assert.same = function(expected, actual) {
  if(expected !== actual) {
    assert.fail('Expected (' + expected + ') does not reference the same object as (' + actual +')');
  }
}
