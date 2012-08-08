require('./testservice.js');

$data.Class.define('$example.Person', $data.Entity, null, {
    Id: { type: 'string', key: true, computed: true },
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int' }
});

$data.Class.define('$example.Order', $data.Entity, null, {
    Id: { type: 'string', key: true, computed: true },
    Value: { type: 'int' },
    Date: { type: 'date' },
    Completed: { type: 'bool' }
});

$data.Class.define('$example.Context', $data.EntityContext, null, {
    People: { type: $data.EntitySet, elementType: $example.Person },
    Orders: { type: $data.EntitySet, elementType: $example.Order }
});

$example.Context.deleteData = function (ctx, callback) {
    ctx.onReady(function () {
        ctx.People.toArray(function (p) {
            ctx.Orders.toArray(function (o) {
                for (var i = 0; i < p.length; i++) {
                    ctx.People.remove(p[i]);
                }
                for (var i = 0; i < o.length; i++) {
                    ctx.Orders.remove(o[i]);
                }
                ctx.saveChanges(callback);
            });
        });
    });
};
$example.Context.generateTestData = function (ctx, callback) {
    $example.Context.deleteData(ctx, function () {
        for (var i = 0; i < 10; i++) {
            ctx.People.add({ Name: 'Person' + i, Description: 'desc' + i, Age: 10 + i });
            ctx.Order.add({ Value: i * 1000, Date: new Date((2000 + i) + '/01/01'), Completed: i % 2 });
        }

        ctx.saveChanges(callback);
    });
};
$example.Context.getContext = function () {
    return new $example.Context({ name: 'oData', oDataServiceHost: "http://127.0.0.1:3000/testservice" });
};

exports.Tests = {
    'insert full entity': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {
            var p = new $example.Person({ Name: 'John', Description: 'Desc', Age: 42 });
            context.People.add(p);
            context.saveChanges({
                success: function () {
                    context.People.toArray(function (res) {
                        test.equal(res.length, 1, 'result count failed');
                        test.deepEqual(res[0].initData, p.initData, 'full entity save failed');
                        test.done();
                    });
                },
                error: function (e) {
                    test.ok(false, 'error on save full entity: ' + e);

                    test.done();
                }
            });
        });

    },
    'insert partial entity': function (test) {
        test.expect(4);

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {
            var p = new $example.Person({ Name: 'John' });
            context.People.add(p);
            context.saveChanges({
                success: function () {
                    context.People.toArray(function (res) {
                        test.equal(res.length, 1, 'result count failed');
                        test.equal(res[0].Id, p.Id, 'result Id failed');
                        test.equal(res[0].Name, p.Name, 'result Name failed');
                        test.equal(p.Age, undefined, 'result Age failed');

                        test.done();
                    });
                },
                error: function (e) {
                    test.ok(false, 'error on save partial entity: ' + e);

                    test.done();
                }
            });
        });

    }

};