
exports.Test = {
    'Default binder exists': function (test) {
        test.expect(1);

        test.equal(typeof $data.ArgumentBinder.defaultBinder, 'function', 'defaulBinder is undefined');

        test.done();
    },
    'string binder': function (test) {
        test.expect(3);

        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.String }, { query: { a: "'string Value'" } });
        test.equal(result, 'string Value', 'string resolve failed1');

        result = $data.ArgumentBinder.defaultBinder('a', { type: $data.String }, { query: { a: "string Value" } });
        test.equal(result, 'string Value', 'string resolve failed2');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncStrParam("string Value", function (res) {
                test.equal(res, 'string Value', 'string call resolve failed2');

                test.done();
            });
        });
    },
    'int binder': function (test) {
        test.expect(2);

        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Integer }, { query: { a: "42" } });
        test.equal(result, 42, 'int resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncIntParam(42, function (res) {
                test.equal(res, 42, 'int call resolve failed');

                test.done();
            });
        });
    },
    /*'num binder': function (test) {
        test.expect(2);

        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Number }, { query: { a: "42.5" } });
        test.equal(result, 42.5, 'number resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncNumParam(42.5, function (res) {
                test.equal(res, 42.5, 'number call resolve failed');

                test.done();
            });
        });
    },*/
    'obj binder': function (test) {
        test.expect(2);
        var obj = { a: 12, b: 'asd', c: { d: 'hello', e: 'jay' } };
        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Object }, { query: { a: JSON.stringify(obj) } });
        test.deepEqual(result, obj, 'obj resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncObjParam(obj, function (res) {
                test.deepEqual(res, obj, 'obj call resolve failed');

                test.done();
            });
        });
    },
    'array binder - string': function (test) {
        test.expect(2);
        var array = ['hello', 'world', 'unti', 'test'];
        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Array, elementType: $data.String }, { query: { a: JSON.stringify(array) } });
        test.deepEqual(result, array, 'array resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncArrParam(array, function (res) {
                delete res.prev;
                delete res.next;
                test.deepEqual(res, array, 'array call resolve failed');

                test.done();
            });
        });
    },
    'array binder - int': function (test) {
        test.expect(2);
        var array = [42, 12, 32, 69];
        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Array, elementType: $data.Int }, { query: { a: JSON.stringify(array) } });
        test.deepEqual(result, array, 'array resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncArrParam(array, function (res) {
                delete res.prev;
                delete res.next;
                test.deepEqual(res, array, 'array call resolve failed');

                test.done();
            });
        });
    },
    'bool true binder': function (test) {
        test.expect(2);

        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Boolean }, { query: { a: true } });
        test.equal(result, true, 'bool resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncBoolParam(true, function (res) {
                test.equal(res, true, 'bool call resolve failed');

                test.done();
            });
        });
    },
    'bool false binder': function (test) {
        test.expect(2);

        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Boolean }, { query: { a: false } });
        test.equal(result, false, 'bool resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncBoolParam(false, function (res) {
                test.equal(res, false, 'bool call resolve failed');

                test.done();
            });
        });
    },
    'date binder': function (test) {
        test.expect(3);

        var datetime = new Date();
        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: '/Date(' + datetime.valueOf() + ')/' } });
        test.equal(result.valueOf(), datetime.valueOf(), 'date resolve failed1');

        result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: "datetime'" + datetime.toISOString() + "'" } });
        test.equal(result.valueOf(), datetime.valueOf(), 'date resolve failed2');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncDateParam(new Date("2012/08/23"), function (res) {
                test.equal(res.valueOf(), new Date("2012/08/23").valueOf(), 'date call resolve failed');

                test.done();
            });
        });
    },
    'geography binder': function (test) {
        test.expect(5);

        var geography = new $data.GeographyPoint(-123.156, -46.364);
        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.GeographyPoint }, { query: { a: "geography'POINT(-123.156 -46.364)'" } });
        test.equal(result.longitude, geography.longitude, 'Geography longitude resolve failed1');
        test.equal(result.latitude, geography.latitude, 'Geography latitude resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncGeographyParam(geography, function (res) {
                test.equal(res instanceof $data.GeographyPoint, true, 'Geography call resolve failed');
                test.equal(res.longitude, geography.longitude, 'Geography longitude call resolve failed1');
                test.equal(res.latitude, geography.latitude, 'Geography latitude call resolve failed1');
                test.done();
            });
        });
    },
    'geometry binder': function (test) {
        test.expect(5);

        var geometry = new $data.GeometryPoint(-123.156, -46.364);
        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.GeometryPoint }, { query: { a: "geometry'POINT(-123.156 -46.364)'" } });
        test.equal(result.longitude, geometry.longitude, 'Geometry longitude resolve failed1');
        test.equal(result.latitude, geometry.latitude, 'Geometry latitude resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncGeometryParam(geometry, function (res) {
                test.equal(res instanceof $data.GeometryPoint, true, 'Geometry call resolve failed');
                test.equal(res.longitude, geometry.longitude, 'Geometry longitude call resolve failed1');
                test.equal(res.latitude, geometry.latitude, 'Geometry latitude call resolve failed1');
                test.done();
            });
        });
    },
    'guid binder': function (test) {
        test.expect(4);

        var guid = $data.parseGuid('12345678-1234-1234-1234-123412341234');
        var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Guid }, { query: { a: "guid'12345678-1234-1234-1234-123412341234'" } });
        test.equal(result.valueOf(), guid.valueOf(), 'Guid resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncGuidParam(guid, function (res) {
                test.equal(typeof res, 'string', 'Guid call resolve failed');
                test.equal($data.parseGuid(res) instanceof $data.Guid, true, 'Guid call resolve failed');
                test.equal(res.valueOf(), guid.valueOf(), 'Guid resolve failed');
                test.done();
            });
        });
    },
    'entity binder': function (test) {
        test.expect(2);

        var person = new $example.Person({ Id: 'aa', Name: 'test', Description: 'desc', Age: 42 });
        var result = $data.ArgumentBinder.defaultBinder('a', { type: $example.Person }, { query: { a: "{\"Id\":\"aa\",\"Name\":\"test\",\"Description\":\"desc\",\"Age\":42}" } });
        test.deepEqual(result.initData, person.initData, 'person resolve failed');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncEntityParam(person, function (res) {
                test.deepEqual(res.initData, person.initData, 'person resolve failed1');
                test.done();
            });
        });
    }
    //'entity array binder': function (test) {
    //    test.expect(2);

    //    var result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: '/Date(1345672800000)/' } });
    //    test.equal(result.valueOf(), new Date('2012-08-23 00:00').valueOf(), 'date resolve failed1');

    //    result = $data.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: "datetime'2012-08-22T22:00:00.000Z'" } });
    //    test.equal(result.valueOf(), new Date('2012-08-23 00:00').valueOf(), 'date resolve failed2');

    //    var context = $example.Context.getContext();
    //    context.onReady(function () {
    //        context.FuncDateParam(new Date("2012/08/23"), function (res) {
    //            //test.equal(res.valueOf(), new Date("2012/08/23").valueOf(), 'date call resolve failed');

    //            test.done();
    //        });
    //    });
    //}
}
