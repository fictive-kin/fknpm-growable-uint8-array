"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = GrowableUint8Array;

/**
     Create a new GrowableUint8Array
     * @param {Uint8Array} buf: Initial view
     * @param {number} expansionRate: How much to grow buffer
 */
function GrowableUint8Array() {
  var buf = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var expansionRate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;

  if (buf) {
    if (!(buf instanceof Uint8Array)) {
      throw new Error('Can only wrap Uint8Array instances');
    }

    this.buf = buf;
    this.bytesUsed = this.buf.length;
  } else {
    this.buf = new Uint8Array(parseInt(2 * Math.pow(expansionRate, 4)));
    this.bytesUsed = 0;
  }

  this.expansionRate = expansionRate;
}
/**
    Creates a new GrowableUint8Array from an array-like or iterable object.
    See also Array.from().
*/


GrowableUint8Array.from = function from() {
  return new GrowableUint8Array(Uint8Array.from.apply(Uint8Array, arguments));
};
/**
    Creates a new GrowableUint8Array with a variable number of arguments.
    See also Array.of().
*/


GrowableUint8Array.of = function of() {
  return new GrowableUint8Array(Uint8Array.of.apply(Uint8Array, arguments));
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
    this.set(oldBuf);
  }

  this.set(buf, this.length);
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
  set: function set(_val) {}
});
Object.defineProperty(GrowableUint8Array.prototype, 'expansionRate', {
  get: function get() {
    return this._expansionRate;
  },
  set: function set(val) {
    if (val <= 1) {
      throw new RangeError('expansionRate must be greater than 1');
    }

    this._expansionRate = val;
  }
});
/*
    Returns the underlying Uint8Array buffer.
    * @param {boolean} copy Pass `true` to return a copy of the buffer.
    * @return {Uint8Array}
*/

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
  var fName = _PASSTHROUGH_FNS2[_i];

  GrowableUint8Array.prototype[fName] = function () {
    var _this$unwrap2;

    return (_this$unwrap2 = this.unwrap())[fName].apply(_this$unwrap2, arguments);
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
  var fName = _WRAP_FNS2[_i2];

  GrowableUint8Array.prototype[fName] = function () {
    var _this$unwrap3;

    return new GrowableUint8Array((_this$unwrap3 = this.unwrap())[fName].apply(_this$unwrap3, arguments), this.expansionRate);
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

GrowableUint8Array.prototype.set = function set(array) {
  var _this$buf;

  if (array instanceof GrowableUint8Array) {
    array = array.unwrap();
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return (_this$buf = this.buf).set.apply(_this$buf, [array].concat(args));
};

var inspect = Symbol["for"]('nodejs.util.inspect.custom');

GrowableUint8Array.prototype[inspect] = function inspect() {
  var _util;

  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return (_util = util).inspect.apply(_util, [this.unwrap()].concat(args)) // eslint-disable-line no-undef
  .replace('Uint8Array', 'GrowableUint8Array');
};