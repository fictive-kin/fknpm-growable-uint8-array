const MAX_SIGNED_INT_VALUE = 2**32 - 1;

function toUint32(x) {
    return x >>> 0;
}

function isArrayIndex(propName) {
    if (typeof propName === 'symbol') {
        return false;
    }
    const uint32Prop = toUint32(propName);
    return String(uint32Prop) === propName &&
        uint32Prop !== MAX_SIGNED_INT_VALUE;
}

const proxyHandler = {
    has(target, key) {
        if (isArrayIndex(key)) {
            const uint32Prop = toUint32(key);
            return uint32Prop < target.length;
        }
        return Reflect.has(target, key);
    },
    get(target, property, receiver) {
        if (isArrayIndex(property)) {
            if (property in receiver) {
                return target.buf[property];
            }
            return undefined;
        }
        return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
        if (isArrayIndex(property)) {
            if (property in receiver) {
                target.buf[property] = value;
            }
            return true;
        }
        return Reflect.set(target, property, value, receiver);
    },
    ownKeys(target) {
        const keys = new Set(Reflect.ownKeys(target.unwrap()).concat(
            Reflect.ownKeys(target)));
        keys.delete('buf');
        keys.delete('bytesUsed');
        keys.delete('_expansionRate');
        return Array.from(keys);
    },
    getOwnPropertyDescriptor(target, prop) {
        if (isArrayIndex(prop)) {
            const uint32Prop = toUint32(prop);
            if (uint32Prop < target.length) {
                const descriptor = Reflect.getOwnPropertyDescriptor(
                    target.buf, uint32Prop);
                /*
                    This descriptor is not really configurable, but Proxy
                    invariants require that it be marked as such since `target`
                    does not have the corresponding property.

                    This has implications for deleteProperty
                */
                descriptor.configurable = true;
                return descriptor;
            }
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
    },
    defineProperty(target, key, descriptor) {
        if (isArrayIndex(key)) {
            const uint32Prop = toUint32(key);
            if (uint32Prop < target.length) {
                return Reflect.defineProperty(target.buf, key, descriptor);
            }
            throw new TypeError('Invalid typed array index');
        }
        return Reflect.defineProperty(target, key, descriptor);
    },
    deleteProperty(target, prop) {
        if (isArrayIndex(prop)) {
            return true;
        }
        return Reflect.deleteProperty(target, prop);
    },
};

/**
     Create a new GrowableUint8Array
     * @param {Uint8Array} buf: Initial view
     * @param {number} expansionRate: How much to grow buffer
 */
export default function GrowableUint8Array(buf=null, expansionRate=2) {
    if (buf) {
        if (buf instanceof GrowableUint8Array) {
            return new GrowableUint8Array(
                buf.unwrap(true),
                expansionRate || buf.expansionRate,
            );
        }
        if (!(buf instanceof Uint8Array)) {
            throw new Error('Can only wrap Uint8Array instances');
        }
        this.buf = buf;
        this.bytesUsed = this.buf.length;
    } else {
        this.buf = new Uint8Array(parseInt(2 * (expansionRate ** 4)));
        this.bytesUsed = 0;
    }
    this.expansionRate = expansionRate;

}

/**
    Creates a new GrowableUint8Array from an array-like or iterable object.
    See also Array.from().
*/
GrowableUint8Array.from = function from(...args) {
    return new GrowableUint8Array(Uint8Array.from(...args));
};

/**
    Creates a new GrowableUint8Array with a variable number of arguments.
    See also Array.of().
*/
GrowableUint8Array.of = function of(...args) {
    return new GrowableUint8Array(Uint8Array.of(...args));
};


GrowableUint8Array.prototype.accessProxy = function accessProxy() {
    return new Proxy(this, proxyHandler);
}


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
GrowableUint8Array.prototype.dataView = function dataView(offset=0) {
    return new DataView(this.buf.buffer, offset, this.length - offset);
};


Object.defineProperty(GrowableUint8Array.prototype, 'length', {
    get: function() {
        return this.bytesUsed;
    },
    set: function(_val) {
    },
});

Object.defineProperty(GrowableUint8Array.prototype, 'expansionRate', {
    get: function() {
        return this._expansionRate;
    },
    set: function(val) {
        if (val <= 1) {
            throw new RangeError('expansionRate must be greater than 1');
        }
        this._expansionRate = val;
    },
});

/*
    Returns the underlying Uint8Array buffer.
    * @param {boolean} copy Pass `true` to return a copy of the buffer.
    * @return {Uint8Array}
*/
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
    'some',
    'values',
];

for (const fName of _PASSTHROUGH_FNS) {
    GrowableUint8Array.prototype[fName] = function(...args) {
        return this.unwrap()[fName](...args);
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

for (const fName of _WRAP_FNS) {
    GrowableUint8Array.prototype[fName] = function(...args) {
        return new GrowableUint8Array(
            this.unwrap()[fName](...args),
            this.expansionRate,
        );
    };
}

GrowableUint8Array.prototype.fill = function fill(...args) {
    this.unwrap().fill(...args);
    return this;
}

GrowableUint8Array.prototype.set = function set(array, ...args) {
    if (array instanceof GrowableUint8Array) {
        array = array.unwrap();
    }
    return this.buf.set(array, ...args);
}

/*
    Get the element at a specific index
    * @param {number} index index of element.
    * @return {number}
*/
GrowableUint8Array.prototype.getElement = function getElement(index) {
    if (index < this.length) {
        return this.buf[index];
    }
    return undefined;
}

/*
    Set the element at a specific index to a value
    * @param {number} index index of element.
    * @param {number} value value to set
    * @return {number}
*/
GrowableUint8Array.prototype.setElement = function setElement(index, value) {
    if (index < this.length) {
        return this.buf[index] = value;
    }
    return value;
}

const inspect = Symbol.for('nodejs.util.inspect.custom');
GrowableUint8Array.prototype[inspect] = function inspect(...args) {
    return require('util').inspect(this.unwrap(), ...args)
        .replace('Uint8Array', 'GrowableUint8Array');
};
