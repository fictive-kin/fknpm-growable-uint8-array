# growable-uint8-array

![](https://img.shields.io/circleci/build/gh/fictivekin/fknpm-growable-uint8-array?logo=circleci&style=for-the-badge)

GrowableUint8Array is simple wrapper around Uint8Array that manages resizing the buffer when appending new data.

Adds a new method `extend` which can be used to append data to an array. `GrowableUint8Array` will manage the
underlying buffer, automatically allocating a larger `Uint8Array` when necessary using a simple exponential
growth algorithm.

All `TypedArray` methods are delegated to the underlying `Uint8Array`. If the method returns an instance of
`Uint8Array` it will be wrapped in a `GrowableUint8Array`.

Use `growableUint8Array.unwrap()` to return a `Uint8Array` view of the underlying data, with proper bounds. By default this will not copy the data, for performance reasons. Pass `true` as the first argument to unwrap to return a copy of the data.


## Usage
```js
import GrowableUint8Array from '@fictivekin/growable-uint-array';

const arr = new GrowableUint8Array(new Uint8Array([1, 2, 3]));
console.log(arr.length); // 3
arr.extend([4, 5, 6]);   // GrowableUint8Array [ 1, 2, 3, 4, 5, 6 ]
console.log(arr.length); // 6
arr.map((x) => x * 2);   // GrowableUint8Array [ 2, 4, 6, 8, 10, 12 ]
console.log(arr);        // GrowableUint8Array [ 1, 2, 3, 4, 5, 6 ]
arr.unwrap()             // Uint8Array [ 1, 2, 3, 4, 5, 6 ]
```

## Array-like access
If your environment supports ES6 proxies, you can use `arr.accessProxy()` to get a proxy object which allows for Array-like attribute access.

```js
import GrowableUint8Array from '@fictivekin/growable-uint-array';

const proxy = new GrowableUint8Array(new Uint8Array([1, 2, 42])).accessProxy();
proxy[2];          // 42
proxy[0] = 7;      // 7
proxy.extend([3, 2, 1]);

proxy.unwrap()    // Uint8Array [ 7, 2, 42, 3, 2, 1 ]

```

## Install
`npm install @fictivekin/growable-uint-array`

## Contribute
Clone repo, then install dev dependencies:
`npm install --only=dev`

## Run tests
`npm run test`

## Build
`npm run build`
