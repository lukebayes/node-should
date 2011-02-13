
var assert = require('assert');

assert.match = function(regexp, string) {
  if(!string.match(regexp)) {
    assert.fail('Unable to match ' + regexp + ' in: ' + string);
  }
}

