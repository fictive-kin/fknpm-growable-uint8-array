import GrowableUint8Array from '../src/index.js';

describe('GrowableUint8Array', () => {

    test('constructor', () => {
        expect(() =>
            new GrowableUint8Array(new Uint8Array(), 0, 1)
        ).toThrow(RangeError);
    })

    test('extend with Uint8Array', () => {
        const arr1 = new Uint8Array([1, 2]);
        const arr2 = new Uint8Array([3, 4]);
        const buffer = new GrowableUint8Array().extend(arr1).extend(arr2);

        expect(buffer.length).toBe(4);

        expect(buffer.unwrap()).toEqual(
            new Uint8Array([1, 2, 3, 4]));
    });

    test('extend with GrowableUint8Array', () => {
        const arr1 = new Uint8Array([1, 2]);
        const arr2 = new Uint8Array([3, 4]);
        const buffer1 = new GrowableUint8Array(arr1);
        const buffer2 = new GrowableUint8Array(arr2);

        buffer1.extend(buffer2);

        expect(buffer1.length).toBe(4);

        expect(buffer1.unwrap()).toEqual(
            new Uint8Array([1, 2, 3, 4]));
    });

    describe('unwrap', () => {
        test('without copy', () => {
            const arr = new Uint8Array([1, 2, 3, 4]);
            const buf = new GrowableUint8Array().extend(arr);

            const unwrapped = buf.unwrap();
            unwrapped[0] = 42;
            expect(buf.unwrap()).toEqual(unwrapped);
        });

        test('with copy', () => {
            const arr = new Uint8Array([1, 2, 3, 4]);
            const buf = new GrowableUint8Array().extend(arr);

            const unwrappedCopy = buf.unwrap(true);
            unwrappedCopy[0] = 42;
            expect(buf.unwrap()).not.toEqual(unwrappedCopy);
        });
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
        const src = GrowableUint8Array.from([0, 0, 0, 0]);
        const filled = src.fill(2);
        expect(filled).toEqual(GrowableUint8Array.from([2, 2, 2, 2]));
        expect(src).toBe(filled);
    });

    test('sort', () => {
        const buffer = GrowableUint8Array.from([4, 3, 2, 1]).sort();
        expect(buffer).toEqual(GrowableUint8Array.from([1, 2, 3, 4]));

        buffer.sort((a, b) => a < b);
        expect(buffer).toEqual(GrowableUint8Array.from([4, 3, 2, 1]));
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
        const buffer = GrowableUint8Array.from([1, 2, 3]).extend([4]);
        expect(buffer.indexOf(2)).toBe(1);
        expect(buffer.indexOf(0)).toBe(-1);
    });

    test('keys', () => {
        const buffer = GrowableUint8Array.from([1, 2, 3]).extend([4]);
        expect(Array.from(buffer.keys())).toEqual([0, 1, 2, 3]);
    });

    test('set', () => {
        const dest = GrowableUint8Array.from([1, 2, 3, 4]).extend([5]);
        const source = new Uint8Array([4, 5, 6]);
        dest.set(source);
        expect(dest.unwrap()).toEqual(new Uint8Array([4, 5, 6, 4, 5]));
    });

    test('find', () => {
        const arr = GrowableUint8Array.from([1, 2, 3, 4]).extend([5]);
        expect(arr.find((x) => x === 2)).toBe(2);
        expect(arr.find((x) => x === 0)).toBe(undefined);
    });

    test('findIndex', () => {
        const arr = GrowableUint8Array.from([1, 2, 3, 4]).extend([5]);
        expect(arr.findIndex((x) => x === 2)).toBe(1);
        expect(arr.findIndex((x) => x === 0)).toBe(-1);
    });

    test('some', () => {
        const buffer = GrowableUint8Array.from([1, 2, 3]).extend([4]);
        expect(buffer.some((x) => x === 4)).toBe(true);
        expect(buffer.some((x) => x === 0)).toBe(false);
    });

    test('of', () => {
        const buffer = GrowableUint8Array.of(1, 2, 3);
        expect(buffer).toEqual(GrowableUint8Array.from([1, 2, 3]));
    });

    test('indexing', () => {
        const buffer = new GrowableUint8Array().extend([1, 2, 3]);
        expect(buffer[0]).toBe(1);
        expect(buffer[1]).toBe(2);
        expect(buffer[2]).toBe(3);
        expect(buffer[3]).toBe(undefined);
    });

    test('in', () => {
        const buffer = new GrowableUint8Array().extend([1, 2, 3]);
        expect('buf' in buffer).toBe(true);
        expect(1 in buffer).toBe(true);
        expect(4 in buffer).toBe(false);
    });

    test('set', () => {
        const buffer = new GrowableUint8Array().extend([1, 2, 3]);
        buffer[0] = 42;
        expect(buffer[0]).toBe(42);
        buffer[4] = 42;
        expect(buffer[4]).toBe(undefined);
        expect(4 in buffer).toBe(false);

        buffer.foo = 'bar';
        expect(buffer.foo).toBe('bar');
        expect('foo' in buffer).toBe(true);
    });

    test('Preserve expansionRate when new object returned from delegated functions', () => {
        const buffer = new GrowableUint8Array(new Uint8Array([1, 2, 3]), 4);
        expect(buffer.expansionRate).toBe(4);

        const buffer2 = buffer.map((x) => x + 1);
        expect(buffer2.expansionRate).toBe(4);
    });

    test('Create a copy of a GrowableUint8Array', () => {
        const buffer = new GrowableUint8Array().extend([1, 2, 3]);
        const buffer2 = new GrowableUint8Array(buffer);
        expect(buffer).not.toBe(buffer2);
        expect(buffer).toEqual(buffer2);
    });

    test('console.log', () => {
        const buffer = new GrowableUint8Array().extend([1, 2, 3]);
        expect(require('util').inspect(buffer)).toBe(
            'GrowableUint8Array [ 1, 2, 3 ]'
        );
    });
});
