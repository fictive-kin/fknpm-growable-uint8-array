"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = GrowableUint8Array;

/**
     Create a new GrowableUint8Array
     * @param {Uint8Array} buf: Initial view
     * @param {number} bytesUsed: bytes of buf that are in use
     * @param {number} expansionRate: How much to grow buffer
 */
function GrowableUint8Array() {
  var buf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var bytesUsed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var expansionRate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

  if (buf) {
    this.buf = Uint8Array.from(buf);
  } else {
    this.buf = new Uint8Array(parseInt(2 * Math.pow(expansionRate, 4)));
  }

  this.bytesUsed = bytesUsed;
  this.expansionRate = expansionRate;
}

;

GrowableUint8Array.from = function from(source) {
  return new GrowableUint8Array(source, source.length);
};

GrowableUint8Array.wrap = function wrap(source) {
  if (!(source instanceof Uint8Array)) {
    throw new Error('Can only wrap Uint8Array instances');
  }

  var arr = new GrowableUint8Array();
  arr.buf = source;
  arr.bytesUsed = source.length;
  return arr;
};
/**
    Extend a GrowableUint8Array with new data
     * @param {Uint8Array} buf: new data to add
     * @return {GrowableUint8Array} new GrowableUint8Array
 */


GrowableUint8Array.prototype.extend = function extend(buf) {
  if (buf.length + this.length > this.buf.byteLength) {
    var oldBuf = this.buf;
    var newSize = Math.max(parseInt(this.buf.buffer.byteLength * this.expansionRate), buf.length + this.length + 1);
    this.buf = new Uint8Array(newSize);
    this.buf.set(oldBuf);
  }

  this.buf.set(buf, this.length);
  this.bytesUsed += buf.length;
  return this;
};
/*
    Return a DataView of the underlying buffer, starting at the specified offset
    * @return {DataView}
*/


GrowableUint8Array.prototype.dataView = function dataView() {
  var offset = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  return new DataView(this.buf.buffer, offset, this.length - offset);
};

Object.defineProperty(GrowableUint8Array.prototype, 'length', {
  get: function get() {
    return this.bytesUsed;
  },
  set: function set(val) {}
});

GrowableUint8Array.prototype.unwrap = function unwrap() {
  var copy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
  var unwrapped = this.buf.subarray(0, this.length);

  if (copy) {
    return unwrapped.slice();
  }

  return unwrapped;
};
/*
    Functions which simply pass their argument through to the underlying
    Uint8Array.
*/


var _PASSTHROUGH_FNS = [Symbol.iterator, 'entries', 'every', 'find', 'findIndex', 'forEach', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'reduce', 'reduceRight', 'set', 'some', 'values'];

var _loop = function _loop() {
  var name = _PASSTHROUGH_FNS2[_i];

  GrowableUint8Array.prototype[name] = function () {
    var _this$unwrap2;

    return (_this$unwrap2 = this.unwrap())[name].apply(_this$unwrap2, arguments);
  };
};

for (var _i = 0, _PASSTHROUGH_FNS2 = _PASSTHROUGH_FNS; _i < _PASSTHROUGH_FNS2.length; _i++) {
  _loop();
}
/*
    Functions which use the underlying Uint8Array function, but return an
    instance of GrowableUint8Array
*/


var _WRAP_FNS = ['copyWithin', 'filter', 'map', 'reverse', 'slice', 'sort'];

var _loop2 = function _loop2() {
  var name = _WRAP_FNS2[_i2];

  GrowableUint8Array.prototype[name] = function () {
    var _this$unwrap3;

    return GrowableUint8Array.wrap((_this$unwrap3 = this.unwrap())[name].apply(_this$unwrap3, arguments));
  };
};

for (var _i2 = 0, _WRAP_FNS2 = _WRAP_FNS; _i2 < _WRAP_FNS2.length; _i2++) {
  _loop2();
}

GrowableUint8Array.prototype.fill = function fill() {
  var _this$unwrap;

  (_this$unwrap = this.unwrap()).fill.apply(_this$unwrap, arguments);

  return this;
};