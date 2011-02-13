
var Stack = function() {
  this._items = [];
}

Stack.prototype.push = function(item) {
  this._items.push(item);
}

Stack.prototype.next = function() {
  if (this.isEmpty()) throw 'Stack.next() called when empty';
  this._items.pop();
}

Stack.prototype.isEmpty = function() {
  return (this._items.length == 0);
}

Stack.prototype.peek = function() {
  return this._items[this._items.length - 1];
}

exports.Stack = Stack;
