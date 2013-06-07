try{ require('jaydata'); }catch(e){}

function convertTo(type, tests){
    if (typeof module == 'function') module('converterTest to type ' + (type.fullName || type.name));
    var r = {};
    for (var i in tests){
        if (tests[i]){
            var fn = tests[i](type);
            if (typeof test == 'function') test(i, fn);
            else r[i] = fn;
        }
    }
    return r;
}

function convertTest(v, e){
    return function(type){
        return function(test){
            if (typeof stop == 'function') stop();
            if (!test.expect) test.expect = expect;
            if (!test.done) test.done = start;
            test.expect(2);
            test.equal(typeof e, typeof $data.Container.convertTo(v, type), 'Bad type of converted value ' + e + ' != ' + $data.Container.convertTo(v, type));
            test[typeof e == 'object' ? 'deepEqual' : 'equal'](e, $data.Container.convertTo(v, type), 'Bad conversion of "' + v + '" to type ' + (type.fullName || type.name) + ', expected value is "' + JSON.stringify(e) + '"');
            test.done();
        };
    };
}

function convertTestFail(value){
    return function(type){
        return function(test){
            if (typeof stop == 'function') stop();
            if (!test.expect) test.expect = expect;
            if (!test.done) test.done = start;
            test.expect(1);
            try{
                $data.Container.convertTo(value, type);
                test.ok(false, 'Test not failed from type ' + (type.fullName || type.name));
            }catch(e){
                test.ok(true);
            }
            
            test.done();
        };
    };
}

if (typeof module == 'function') module('converterTests');
if (typeof exports == 'undefined') exports = {};

exports.Converters = {
    '$data.Boolean': convertTo($data.Boolean, {
        'from valid string "true"': convertTest('true', true),
        'from valid string "True"': convertTest('True', true),
        'from valid string "TrUe"': convertTest('TrUe', true),
        'from valid string "TRUE"': convertTest('TRUE', true),
        'from valid string "false"': convertTest('false', false),
        'from valid string "False"': convertTest('False', false),
        'from valid string "FaLse"': convertTest('FaLse', false),
        'from valid string "FALSE"': convertTest('FALSE', false),
        'from invalid string "no"': convertTest('no', true),
        'from int 0': convertTest(0, false),
        'from int 1': convertTest(1, true),
        'from float 3.14': convertTest(3.14, true),
        'from Array': convertTest([1,2,3], true),
        'from Object': convertTest({a:1}, true),
        'from Date': convertTest(new Date(), true),
        'from Function': convertTest(function(){}, true),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Integer': convertTo($data.Integer, {
        'from Boolean true': convertTest(true, 1),
        'from Boolean false': convertTest(false, 0),
        'from integer number': convertTest(42, 42),
        'from float number': convertTest(3.14, 3),
        'from bigint': convertTest(0xffffffff, 4294967295),
        'from Int32 max value': convertTest(0x7fffffff, 2147483647),
        'from Int32 max value + 1': convertTest(0x80000000, 2147483648),
        'from valid string': convertTest('123', 123),
        'from valid decimal string': convertTest('123123123123.123123123123', 123123123123),
        'from valid bigint string': convertTest('123123123123', 123123123123),
        'from valid float string': convertTest('3.14', 3),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTestFail([1, 2, 3]),
        'from Object': convertTestFail({ a: 1 }),
        'from Date': convertTest(new Date(1000), 1000),
        'from Function': convertTestFail(function () { }),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Int32': convertTo($data.Int32, {
        'from Boolean true': convertTest(true, 1),
        'from Boolean false': convertTest(false, 0),
        'from integer number': convertTest(42, 42),
        'from float number': convertTest(3.14, 3),
        'from bigint': convertTest(0xffffffff, -1),
        'from Int32 max value': convertTest(0x7fffffff, 2147483647),
        'from Int32 max value + 1': convertTest(0x80000000, -2147483648),
        'from valid string': convertTest('123', 123),
        'from valid decimal string': convertTest('123123123123.123123123123', -1430928461),
        'from valid bigint string': convertTest('123123123123', -1430928461),
        'from valid float string': convertTest('3.14', 3),
        'from invalid string': convertTest('javascript', 0),
        'from Array': convertTest([1, 2, 3], 0),
        'from Object': convertTest({ a: 1 }, 0),
        'from Date': convertTest(new Date(1000), 1000),
        'from Function': convertTest(function () { }, 0),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Number': convertTo($data.Number, {
        'from Boolean true': convertTest(true, 1),
        'from Boolean false': convertTest(false, 0),
        'from integer number': convertTest(42, 42),
        'from float number': convertTest(3.14, 3.14),
        'from bigint': convertTest(0xffffffff, 4294967295),
        'from Int32 max value': convertTest(0x7fffffff, 2147483647),
        'from Int32 max value + 1': convertTest(0x80000000, 2147483648),
        'from valid string': convertTest('123', 123),
        'from valid decimal string': convertTest('123123123123.123123123123', 123123123123.12312),
        'from valid bigint string': convertTest('123123123123', 123123123123),
        'from valid float string': convertTest('3.14', 3.14),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTestFail([1,2,3]),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTestFail(new Date('alma')),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Byte': convertTo($data.Byte, {
        'from Boolean true': convertTest(true, 1),
        'from Boolean false': convertTest(false, 0),
        'from integer number': convertTest(42, 42),
        'from float number': convertTest(3.14, 3),
        'from bigint': convertTest(0xffffffff, 0xff),
        'from Int32 max value': convertTest(0x7fffffff, 0xff),
        'from Int32 max value + 1': convertTest(0x80000000, 0),
        'from valid string': convertTest('123', 123),
        'from valid decimal string': convertTest('123123123123.123123123123', 179),
        'from valid bigint string': convertTest('123123123123', 179),
        'from valid float string': convertTest('3.14', 3),
        'from invalid string': convertTest('javascript', 0),
        'from Array': convertTest([1,2,3], 0),
        'from Object': convertTest({a:1}, 0),
        'from Date': convertTest(new Date(1000), 232),
        'from Function': convertTest(function(){}, 0),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.SByte': convertTo($data.SByte, {
        'from Boolean true': convertTest(true, 1),
        'from Boolean false': convertTest(false, 0),
        'from integer number': convertTest(42, 42),
        'from float number': convertTest(3.14, 3),
        'from bigint': convertTest(0xffffffff, -1),
        'from Int32 max value': convertTest(0x7fffffff, -1),
        'from Int32 max value + 1': convertTest(0x80000000, 0),
        'from valid string': convertTest('123', 123),
        'from valid decimal string': convertTest('123123123123.123123123123', -77),
        'from valid bigint string': convertTest('123123123123', -77),
        'from valid float string': convertTest('3.14', 3),
        'from invalid string': convertTest('javascript', 0),
        'from Array': convertTest([1,2,3], 0),
        'from Object': convertTest({a:1}, 0),
        'from Date': convertTest(new Date(1000), -24),
        'from Function': convertTest(function(){}, 0),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Int16': convertTo($data.Int16, {
        'from Boolean true': convertTest(true, 1),
        'from Boolean false': convertTest(false, 0),
        'from integer number': convertTest(42, 42),
        'from float number': convertTest(3.14, 3),
        'from bigint': convertTest(0xffffffff, -1),
        'from Int32 max value': convertTest(0x7fffffff, -1),
        'from Int32 max value + 1': convertTest(0x80000000, 0),
        'from valid string': convertTest('123', 123),
        'from valid decimal string': convertTest('123123123123.123123123123', -15437),
        'from valid bigint string': convertTest('123123123123', -15437),
        'from valid float string': convertTest('3.14', 3),
        'from invalid string': convertTest('javascript', 0),
        'from Array': convertTest([1,2,3], 0),
        'from Object': convertTest({a:1}, 0),
        'from Date': convertTest(new Date(1000), 1000),
        'from Function': convertTest(function(){}, 0),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Float': convertTo($data.Float, {
        'from Boolean true': convertTest(true, 1),
        'from Boolean false': convertTest(false, 0),
        'from integer number': convertTest(42, 42),
        'from float number': convertTest(3.14, 3.140000104904175),
        'from bigint': convertTest(0xffffffff, 2147483648),
        'from Int32 max value': convertTest(0x7fffffff, 1073741824),
        'from Int32 max value + 1': convertTest(0x80000000, 2147483648),
        'from valid string': convertTest('123', 123),
        'from valid decimal string': convertTest('123123123123.123123123123', 123123122176),
        'from valid bigint string': convertTest('123123123123', 123123122176),
        'from valid float string': convertTest('3.14', 3.140000104904175),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTestFail([1,2,3]),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTest(new Date(1000), 1000),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Int64': convertTo($data.Int64, {
        'from Boolean true': convertTest(true, '1'),
        'from Boolean false': convertTest(false, '0'),
        'from integer number': convertTest(42, '42'),
        'from float number': convertTest(3.14, '3'),
        'from bigint': convertTest(0xffffffff, '4294967295'),
        'from Int32 max value': convertTest(0x7fffffff, '2147483647'),
        'from Int32 max value + 1': convertTest(0x80000000, '2147483648'),
        'from valid string': convertTest('123', '123'),
        'from valid decimal string': convertTest('123123123123.123123123123', '123123123123'),
        'from valid bigint string': convertTest('123123123123', '123123123123'),
        'from valid float string': convertTest('3.14', '3'),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTestFail([1,2,3]),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTest(new Date(1000), '1000'),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Decimal': convertTo($data.Decimal, {
        'from Boolean true': convertTest(true, '1'),
        'from Boolean false': convertTest(false, '0'),
        'from integer number': convertTest(42, '42'),
        'from float number': convertTest(3.14, '3.14'),
        'from bigint': convertTest(0xffffffff, '4294967295'),
        'from Int32 max value': convertTest(0x7fffffff, '2147483647'),
        'from Int32 max value + 1': convertTest(0x80000000, '2147483648'),
        'from valid string': convertTest('123', '123'),
        'from valid decimal string': convertTest('123123123123.123123123123', '123123123123.123123123123'),
        'from valid bigint string': convertTest('123123123123', '123123123123'),
        'from valid float string': convertTest('3.14', '3.14'),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTestFail([1,2,3]),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTest(new Date(1000), '1000'),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Object': convertTo($data.Object, {
        'from Boolean true': convertTestFail(true),
        'from Boolean false': convertTestFail(false),
        'from integer number': convertTestFail(42),
        'from float number': convertTestFail(3.14),
        'from bigint': convertTestFail(0xffffffff),
        'from Int32 max value': convertTestFail(0x7fffffff),
        'from Int32 max value + 1': convertTestFail(0x80000000),
        'from valid string': convertTest('{"a":1}', {a:1}),
        'from valid decimal string': convertTest('123123123123.123123123123', 123123123123.123123123123),
        'from valid bigint string': convertTest('123123123123', 123123123123),
        'from valid float string': convertTest('3.14', 3.14),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTest([1,2,3], [1,2,3]),
        'from Object': convertTest({a:1}, {a:1}),
        'from Date': convertTest(new Date(1000), new Date(1000)),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Array': convertTo($data.Array, {
        'from Boolean true': convertTestFail(true),
        'from Boolean false': convertTestFail(false),
        'from integer number': convertTestFail(42),
        'from float number': convertTestFail(3.14),
        'from bigint': convertTestFail(0xffffffff),
        'from Int32 max value': convertTestFail(0x7fffffff),
        'from Int32 max value + 1': convertTestFail(0x80000000),
        'from valid string': convertTest('[1,2,3]', [1,2,3]),
        'from valid decimal string': convertTestFail('123123123123.123123123123'),
        'from valid bigint string': convertTestFail('123123123123'),
        'from valid float string': convertTestFail('3.14'),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTest([1,2,3], [1,2,3]),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTestFail(new Date(1000)),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.String': convertTo($data.String, {
        'from Boolean true': convertTest(true, 'true'),
        'from Boolean false': convertTest(false, 'false'),
        'from integer number': convertTest(42, '42'),
        'from float number': convertTest(3.14, '3.14'),
        'from bigint': convertTest(0xffffffff, (0xffffffff).toString()),
        'from Int32 max value': convertTest(0x7fffffff, (0x7fffffff).toString()),
        'from Int32 max value + 1': convertTest(0x80000000, (0x80000000).toString()),
        'from valid string': convertTest('123', '123'),
        'from valid decimal string': convertTest('123123123123.123123123123', '123123123123.123123123123'),
        'from valid bigint string': convertTest('123123123123', '123123123123'),
        'from valid float string': convertTest('3.14', '3.14'),
        'from valid string': convertTest('javascript', 'javascript'),
        'from Array': convertTest([1,2,3], '[1,2,3]'),
        'from Object': convertTest({a:1}, '{"a":1}'),
        'from Date': convertTest(new Date(1000), new Date(1000).toISOString()),
        'from Function': convertTest(function(){}, (function(){}).toString()),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Date': convertTo($data.Date, {
        'from Boolean true': convertTest(true, new Date(1)),
        'from Boolean false': convertTest(false, new Date(0)),
        'from integer number': convertTest(42, new Date(42)),
        'from float number': convertTest(3.14, new Date(3)),
        'from bigint': convertTest(0xffffffff, new Date(0xffffffff)),
        'from Int32 max value': convertTest(0x7fffffff, new Date(0x7fffffff)),
        'from Int32 max value + 1': convertTest(0x80000000, new Date(0x80000000)),
        'from valid string': convertTest('123', new Date('123')),
        'from invalid decimal string': convertTestFail('123123123123.123123123123'),
        'from invalid bigint string': convertTestFail('123123123123'),
        'from valid float string': convertTest('3.14', new Date('3.14')),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTest([1,2,3], new Date([1,2,3])),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTest(new Date(1000), new Date(1000)),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.DateTimeOffset': convertTo($data.DateTimeOffset, {
        'from Boolean true': convertTest(true, new Date(1)),
        'from Boolean false': convertTest(false, new Date(0)),
        'from integer number': convertTest(42, new Date(42)),
        'from float number': convertTest(3.14, new Date(3)),
        'from bigint': convertTest(0xffffffff, new Date(0xffffffff)),
        'from Int32 max value': convertTest(0x7fffffff, new Date(0x7fffffff)),
        'from Int32 max value + 1': convertTest(0x80000000, new Date(0x80000000)),
        'from valid string': convertTest('123', new Date('123')),
        'from invalid decimal string': convertTestFail('123123123123.123123123123'),
        'from invalid bigint string': convertTestFail('123123123123'),
        'from valid float string': convertTest('3.14', new Date('3.14')),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTest([1,2,3], new Date([1,2,3])),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTest(new Date(1000), new Date(1000)),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    }),
    '$data.Time': convertTo($data.Time, {
        'from Boolean true': convertTestFail(true),
        'from Boolean false': convertTestFail(false),
        'from integer number': convertTest(42, new Date('-000001-12-31T' + new Date(42 + (new Date().getTimezoneOffset() * 60 * 1000)).toTimeString().split(' ')[0] + '.042Z')),
        'from float number': convertTest(3.14, new Date('-000001-12-31T' + new Date(3.14 + (new Date().getTimezoneOffset() * 60 * 1000)).toTimeString().split(' ')[0] + '.003Z')),
        'from bigint': convertTest(0xffffff, new Date('0000-01-01T' + new Date(0xffffff + (new Date().getTimezoneOffset() * 60 * 1000)).toTimeString().split(' ')[0] + '.215Z')),
        'from Int32 max value': convertTest(0x7fffff, new Date('0000-01-01T' + new Date(0x7fffff + (new Date().getTimezoneOffset() * 60 * 1000)).toTimeString().split(' ')[0] + '.607Z')),
        'from Int32 max value + 1': convertTest(0x800000, new Date('0000-01-01T' + new Date(0x800000 + (new Date().getTimezoneOffset() * 60 * 1000)).toTimeString().split(' ')[0] + '.608Z')),
        'from valid string': convertTestFail('123'),
        'from invalid decimal string': convertTestFail('123123123123.123123123123'),
        'from invalid bigint string': convertTestFail('123123123123'),
        'from valid float string': convertTestFail('3.14'),
        'from invalid string': convertTestFail('javascript'),
        'from Array': convertTestFail([1, 2, 3]),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTest(new Date(1000), new Date('0000-01-01T00:00:01.000Z')),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined),
        'from valid time string': convertTestFail('0:00:00'),
        'from valid time string with tick': convertTestFail('1:23:45.678'),
        'from invalid time string': convertTestFail('0:0:0')
    }),
    '$data.Blob': convertTo($data.Blob, {
        'from Boolean true': convertTest(true, new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([1])),
        'from Boolean false': convertTest(false, new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0])),
        'from integer number': convertTest(42, new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0,0,0,0,0,0,0x45,0x40])),
        'from float number': convertTest(3.14, new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0x1f,0x85,0xeb,0x51,0xb8,0x1e,0x09,0x40])),
        'from bigint': convertTest(0xffffffff, new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0x00,0x00,0xe0,0xff,0xff,0xff,0xef,0x41])),
        'from Int32 max value': convertTest(0x7fffffff, new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0x00,0x00,0xc0,0xff,0xff,0xff,0xdf,0x41])),
        'from Int32 max value + 1': convertTest(0x80000000, new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0x00,0x00,0x00,0x00,0x00,0x00,0xe0,0x41])),
        'from valid string': convertTest('ABC', new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([65,66,67])),
        'from valid decimal string': convertTest('123123123123.123123123123', new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([49,50,51,49,50,51,49,50,51,49,50,51,46,49,50,51,49,50,51,49,50,51,49,50,51])),
        'from valid bigint string': convertTest('123123123123', new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([49,50,51,49,50,51,49,50,51,49,50,51])),
        'from valid float string': convertTest('3.14', new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([51,46,49,52])),
        'from invalid string': convertTest('javascript', new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0x6a,0x61,0x76,0x61,0x73,0x63,0x72,0x69,0x70,0x74])),
        'from Array': convertTest([1,2,3], new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([1,2,3])),
        'from Object': convertTestFail({a:1}),
        'from Date': convertTestFail(new Date(1000)),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined),
        'from Uint8Array': convertTest(new Uint8Array([1,2,3]), new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0x01,0x02,0x03])),
        'from Buffer': typeof Buffer !== 'undefined' ? convertTest(new Buffer([1,2,3]), new Buffer([1,2,3])) : convertTestFail({a:1}),
        'from Blob': (function(){ try{ return convertTest(new Blob(['javascript']), new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0x6a,0x61,0x76,0x61,0x73,0x63,0x72,0x69,0x70,0x74])) }catch(e){} })(),
        'from ArrayBuffer': (function(){ try{ return convertTest(new ArrayBuffer(3), new (typeof Buffer !== 'undefined' ? Buffer : Uint8Array)([0,0,0])) }catch(e){} })()
    })
};
