import GrowableUint8Array from '../src/index.js';

describe('GrowableUint8Array', () => {
	test('extend', () => {
	    const arr1 = new Uint8Array([1, 2]);
	    const arr2 = new Uint8Array([3, 4]);
	    const buffer = new GrowableUint8Array().extend(arr1).extend(arr2);

	    expect(buffer.length).toBe(4);

	    expect(buffer.unwrap()).toEqual(
	        new Uint8Array([1, 2, 3, 4]));
	});

	test('expansion', () => {
	    const buffer = new GrowableUint8Array();
	    buffer.extend(new Uint8Array([
	        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
	    ]));

	    buffer.extend(new Uint8Array([
	        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
	    ]));

	    buffer.extend(new Uint8Array([
	        1,
	    ]));

	    buffer.extend(new Uint8Array([
	        2,
	    ]));

	    expect(buffer.length).toBe(16 + 17 + 1 + 1);
	});

	test('convert to typedArray', () => {
	    const arr = new Uint8Array([1, 2, 3, 4]);
	    const buffer = GrowableUint8Array.from(arr);
	    expect(buffer.unwrap()).toEqual(arr);
	});

	test('length', () => {
	    const data = [1, 2, 3, 4];
	    const arr = new Uint8Array(data);
	    const buffer = GrowableUint8Array.from(arr);
	    expect(buffer.length).toEqual(data.length);

	    buffer.length = 20;
	    expect(buffer.length).toBe(data.length);
	});

	test('slice', () => {
	    const data = [1, 2, 3, 4];
	    const arr = new Uint8Array(data);
	    const buffer = new GrowableUint8Array().extend(arr);
	    expect(buffer.slice()).toEqual(buffer);
	    const slice = buffer.slice(0, 1);
	    expect(slice.length).toEqual(1);
	    expect(slice).toEqual(GrowableUint8Array.from(data.slice(0, 1)));
	});

	test('dataView', () => {
	    const data = [
	        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
	    ];
	    const typedArray = new Uint8Array(data);
	    const buffer = GrowableUint8Array.from(typedArray);

	    const dataView = buffer.dataView();
	    expect(dataView.getUint8(0)).toEqual(data[0]);
	    expect(dataView.getUint8(data.length - 1)).toEqual(data[data.length - 1]);

	    const dataView2 = buffer.dataView(4);
	    expect(dataView2.getUint8(0)).toEqual(data[4]);
	    expect(() =>
	        dataView2.getUint8(data.length - 1)
	    ).toThrow(RangeError);
	});

	test('iteration', () => {
	    const data = [1, 2, 3, 4, 5];
	    const typedArray = new Uint8Array(data);
	    const buffer = GrowableUint8Array.from(typedArray);
	    let i = 0;

	    for (let b of buffer) {
	        expect(b).toBe(data[i]);
	        i++;
	    }
	    expect(i).toBe(data.length);
	});

	test('values', () => {
	    const data = [1, 2, 3];
	    const buffer = GrowableUint8Array.from(data);
	    const values = buffer.values();
	    expect(values.next()).toEqual({value: data[0], done: false});
	    expect(values.next()).toEqual({value: data[1], done: false});
	    expect(values.next()).toEqual({value: data[2], done: false});
	    expect(values.next()).toEqual({value: undefined, done: true});
	});

	test('entries', () => {
	    const data = [1, 2, 3];
	    const buffer = new GrowableUint8Array().extend(data);

	    const entries = buffer.entries();
	    expect(entries.next()).toEqual({value: [0, data[0]], done: false});
	    expect(entries.next()).toEqual({value: [1, data[1]], done: false});
	    expect(entries.next()).toEqual({value: [2, data[2]], done: false});
	    expect(entries.next()).toEqual({value: undefined, done: true});

	    let i = 0;
	    for (const [index, value] of buffer.entries()) {
	        expect(index).toBe(i);
	        expect(value).toBe(data[i]);
	        i++;
	    }
	});

	test('fill', () => {
	    const buffer = GrowableUint8Array.from([0, 0, 0, 0]).fill(2);
	    expect(buffer).toEqual(GrowableUint8Array.from([2, 2, 2, 2]));
	});

	test('sort', () => {
	    const buffer = GrowableUint8Array.from([4, 3, 2, 1]).sort();
	    expect(buffer).toEqual(GrowableUint8Array.from([1, 2, 3, 4]));
	});

	test('map', () => {
	    const buffer = GrowableUint8Array.from([1, 2, 3, 4]).map((x) => x * 2);
	    expect(buffer).toEqual(GrowableUint8Array.from([2, 4, 6, 8]));
	});

	test('every', () => {
	    const buffer = GrowableUint8Array.from([42, 42, 42]);
	    expect(buffer.every((x) => x === 42)).toBe(true);
	});

	test('indexOf', () => {
	    const buffer = GrowableUint8Array.from([1, 2, 3]);
	    expect(buffer.indexOf(2)).toBe(1);
	});

	test('keys', () => {
	    const buffer = GrowableUint8Array.from([1, 2, 3]);
	    expect(Array.from(buffer.keys())).toEqual([0, 1, 2]);
	});

	test('set', () => {
	    const dest = GrowableUint8Array.from([1, 2, 3, 4]);
	    const source = new Uint8Array([4, 5, 6]);
	    dest.set(source);
	    expect(dest.unwrap()).toEqual(new Uint8Array([4, 5, 6, 4]));
	});
});