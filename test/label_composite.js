
var Composite = require('node_should/composite').Composite;
var util = require('util');

var LabelComposite = function(label) {
  Composite.call(this);
  this._label = label;
}

util.inherits(LabelComposite, Composite);

LabelComposite.prototype.getLabel = function() {
  var str = '';
  if (this.parent) {
    str = this.parent.getLabel() + ':';
  }
  return str + this._label;
}

LabelComposite.prototype.toString = function() {
  return '[LabelComposite label="' + this.getLabel() + '"]';
}

exports.LabelComposite = LabelComposite;

