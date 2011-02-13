
/**
 * FakeStream is used to silence printers
 * and prevent tests from cluttering stdout.
 *
 * It also provides a simple means of asserting
 * against what was emitted.
 */
var FakeStream = function() {
  this.message = '';
}

FakeStream.prototype.write = function(message) {
  this.message += message;
}

exports.FakeStream = FakeStream;
