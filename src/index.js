/**
     Create a new GrowableUint8Array
     * @param {Uint8Array} buf: Initial view
     * @param {number} bytesUsed: bytes of buf that are in use
     * @param {number} expansionRate: How much to grow buffer
 */
export default function GrowableUint8Array(buf=null, bytesUsed=0, expansionRate=2) {
    if (buf) {
        this.buf = Uint8Array.from(buf);
    } else {
        this.buf = new Uint8Array(parseInt(2 * (expansionRate ** 4)));
    }
    this.bytesUsed = bytesUsed;
    this.expansionRate = expansionRate;
};

GrowableUint8Array.from = function from(source) {
    return new GrowableUint8Array(source, source.length);
};

GrowableUint8Array.wrap = function wrap(source) {
    if (!(source instanceof Uint8Array)) {
        throw new Error('Can only wrap Uint8Array instances');
    }
    const arr = new GrowableUint8Array();
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
        const oldBuf = this.buf;
        const newSize = Math.max(
            parseInt(this.buf.buffer.byteLength * this.expansionRate),
            buf.length + this.length + 1,
        );

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
GrowableUint8Array.prototype.dataView = function dataView(offset=0) {
    return new DataView(this.buf.buffer, offset, this.length - offset);
};


Object.defineProperty(GrowableUint8Array.prototype, 'length', {
    get: function() {
        return this.bytesUsed;
    },
    set: function(val) {
    },
});

GrowableUint8Array.prototype.unwrap = function unwrap(copy=false) {
    const unwrapped = this.buf.subarray(0, this.length);
    if (copy) {
        return unwrapped.slice();
    }
    return unwrapped;
};

/*
    Functions which simply pass their argument through to the underlying
    Uint8Array.
*/
const _PASSTHROUGH_FNS = [
    Symbol.iterator,
    'entries',
    'every',
    'find',
    'findIndex',
    'forEach',
    'includes',
    'indexOf',
    'join',
    'keys',
    'lastIndexOf',
    'reduce',
    'reduceRight',
    'set',
    'some',
    'values',
];

for (const name of _PASSTHROUGH_FNS) {
    GrowableUint8Array.prototype[name] = function(...args) {
        return this.unwrap()[name](...args);
    };
}

/*
    Functions which use the underlying Uint8Array function, but return an
    instance of GrowableUint8Array
*/
const _WRAP_FNS = [
    'copyWithin',
    'filter',
    'map',
    'reverse',
    'slice',
    'sort',
];

for (const name of _WRAP_FNS) {
    GrowableUint8Array.prototype[name] = function(...args) {
        return GrowableUint8Array.wrap(
            this.unwrap()[name](...args),
        );
    };
}

GrowableUint8Array.prototype.fill = function fill(...args) {
    this.unwrap().fill(...args);
    return this;
}