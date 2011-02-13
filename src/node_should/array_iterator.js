
/**
 * ArrayIterator provides simple external iteration for flat Arrays.
 */
var ArrayIterator = function(items) {
  this.items = items;
  this.index = 0;
  this._current = null;
}

ArrayIterator.prototype.next = function() {
  this._ensureNext();
  return this._current = this.items[this.index++];
}

ArrayIterator.prototype.hasNext = function() {
  return this.index < this.items.length;
}

ArrayIterator.prototype.peek = function() {
  this._ensureNext();
  return this.items[this.index];
}

ArrayIterator.prototype.current = function() {
  return this._current;
}

ArrayIterator.prototype._ensureNext = function() {
  if (!this.hasNext()) throw 'Iterator.next called but no more items are available.'
}

exports.ArrayIterator = ArrayIterator;

