
exports.Test = {
    'Default binder exists': function (test) {
        test.expect(1);

        test.equal(typeof $data.JayService.ArgumentBinder.defaultBinder, 'function', 'defaulBinder is undefined');

        test.done();
    },
    'string binder': function (test) {
        test.expect(3);

        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.String }, { query: { a: "'string Value'" } });
        test.equal(result, 'string Value', 'string resolve failed1');

        result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.String }, { query: { a: "string Value" } });
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

        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Integer }, { query: { a: "42" } });
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

        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Number }, { query: { a: "42.5" } });
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
        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Object }, { query: { a: JSON.stringify(obj) } });
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
        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Array, elementType: $data.String }, { query: { a: JSON.stringify(array) } });
        test.deepEqual(result, array, 'array resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncArrParam(array, function (res) {
                test.deepEqual(res, array, 'array call resolve failed');

                test.done();
            });
        });
    },
    'array binder - int': function (test) {
        test.expect(2);
        var array = [42, 12, 32, 69];
        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Array, elementType: $data.Int }, { query: { a: JSON.stringify(array) } });
        test.deepEqual(result, array, 'array resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncArrParam(array, function (res) {
                test.deepEqual(res, array, 'array call resolve failed');

                test.done();
            });
        });
    },
    'bool true binder': function (test) {
        test.expect(2);

        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Boolean }, { query: { a: true } });
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

        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Boolean }, { query: { a: false } });
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

        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: '/Date(1345672800000)/' } });
        test.equal(result.valueOf(), new Date('2012-08-23 00:00').valueOf(), 'date resolve failed1');

        result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: "datetime'2012-08-22T22:00:00.000Z'" } });
        test.equal(result.valueOf(), new Date('2012-08-23 00:00').valueOf(), 'date resolve failed2');

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

        var geography = new $data.Geography(-123.156, - 46.364);
        var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Geography }, { query: { a: 'POINT(-123.156 -46.364)' } });
        test.equal(result.longitude, geography.longitude, 'Geography longitude resolve failed1');
        test.equal(result.latitude, geography.latitude, 'Geography latitude resolve failed1');

        var context = $example.Context.getContext();
        context.onReady(function () {
            context.FuncGeographyParam(geography, function (res) {
                test.equal(res instanceof $data.Geography, true, 'Geography call resolve failed');
                test.equal(res.longitude, geography.longitude, 'Geography longitude call resolve failed1');
                test.equal(res.latitude, geography.latitude, 'Geography latitude call resolve failed1');
                test.done();
            });
        });
    },
    //'entity binder': function (test) {
    //    test.expect(2);

    //    var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: '/Date(1345672800000)/' } });
    //    test.equal(result.valueOf(), new Date('2012-08-23 00:00').valueOf(), 'date resolve failed1');

    //    result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: "datetime'2012-08-22T22:00:00.000Z'" } });
    //    test.equal(result.valueOf(), new Date('2012-08-23 00:00').valueOf(), 'date resolve failed2');

    //    var context = $example.Context.getContext();
    //    context.onReady(function () {
    //        context.FuncDateParam(new Date("2012/08/23"), function (res) {
    //            //test.equal(res.valueOf(), new Date("2012/08/23").valueOf(), 'date call resolve failed');

    //            test.done();
    //        });
    //    });
    //},
    //'entity array binder': function (test) {
    //    test.expect(2);

    //    var result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: '/Date(1345672800000)/' } });
    //    test.equal(result.valueOf(), new Date('2012-08-23 00:00').valueOf(), 'date resolve failed1');

    //    result = $data.JayService.ArgumentBinder.defaultBinder('a', { type: $data.Date }, { query: { a: "datetime'2012-08-22T22:00:00.000Z'" } });
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