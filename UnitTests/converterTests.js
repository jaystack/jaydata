require('jaydata');

function convertTo(type, tests){
    var r = {};
    for (var i in tests){
        var fn = tests[i](type);
        r[i] = fn;
    }
    return r;
}

function convertTest(value, expect){
    return function(type){
        return function(test){
            //console.log(arguments, test, type.name, value, expect);
            test.expect(2);
            test.equal(typeof expect, typeof $data.Container.convertTo(value, type), 'Bad type of converted value ' + expect + ' != ' + $data.Container.convertTo(value, type));
            test[typeof expect == 'object' ? 'deepEqual' : 'equal'](expect, $data.Container.convertTo(value, type), 'Bad conversion of "' + value + '" to type ' + type.fullName || type.name + ', expected value is "' + expect + '"');
            test.done();
        };
    };
}

function convertTestFail(value){
    return function(type){
        return function(test){
            test.expect(1);
            try{
                $data.Container.convertTo(value, type);
                test.ok(false, 'Test not failed');
            }catch(e){
                test.ok(true);
            }
            
            test.done();
        };
    };
}

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
        'from bigint': convertTest(0xffffffff, -1),
        'from Int32 max value': convertTest(0x7fffffff, 2147483647),
        'from Int32 max value + 1': convertTest(0x80000000, -2147483648),
        'from valid string': convertTest('123', 123),
        'from valid decimal string': convertTest('123123123123.123123123123', -1430928461),
        'from valid bigint string': convertTest('123123123123', -1430928461),
        'from valid float string': convertTest('3.14', 3),
        'from invalid string': convertTest('javascript', 0),
        'from Array': convertTest([1,2,3], 0),
        'from Object': convertTest({a:1}, 0),
        'from Date': convertTest(new Date(1000), 1000),
        'from Function': convertTest(function(){}, 0),
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
        'from bigint': convertTest(0xffffffff, 4294967296),
        'from Int32 max value': convertTest(0x7fffffff, 2147483648),
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
        'from Date': convertTestFail(new Date(1000)),
        'from Function': convertTestFail(function(){}),
        'from null': convertTest(null, null),
        'from undefined': convertTest(undefined, undefined)
    })
};
