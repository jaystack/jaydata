
//not runing in nodejs.....

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
    Completed: { type: 'bool' },
    Data: { type: 'object' }
});

$data.Class.define('$example.Place', $data.Entity, null, {
    Id: { type: 'string', key: true, computed: true },
    Name: { type: 'string' },
    Location: { type: 'GeographyPoint' }
});

$data.Class.define('$example.TestItem', $data.Entity, null, {
    Id: { type: 'string', key: true, required: true },
    Name: { type: 'string' },
    Index: { type: 'int' }
});

$data.Class.define('$example.TestItemGuid', $data.Entity, null, {
    Id: { type: 'guid', key: true, required: true },
    Name: { type: 'string' },
    Index: { type: 'int' },
    GuidField: { type: 'guid' }
});

$data.Class.define('$example.TestItemComputed', $data.Entity, null, {
    Id: { type: 'guid', key: true, required: true },
    Name: { type: 'string' },
    Index: { type: 'int' },
    GuidField: { type: 'guid' },
    DateField: { type: 'date' },
    BoolField: { type: 'bool' },
    ObjectField: { type: 'object' }
});

$data.Class.define('$example.GeoTestEntity', $data.Entity, null, {
    Id: { type: 'string', key: true, computed: true },
    Name: { type: 'string' },
    GeographyPoint: { type: 'GeographyPoint' },
    GeographyLineString: { type: 'GeographyLineString' },
    GeographyPolygon: { type: 'GeographyPolygon' },
    GeographyMultiPoint: { type: 'GeographyMultiPoint' },
    GeographyMultiLineString: { type: 'GeographyMultiLineString' },
    GeographyMultiPolygon: { type: 'GeographyMultiPolygon' },
    GeographyCollection: { type: 'GeographyCollection' },
});

$data.Class.define('$example.GeometryTestEntity', $data.Entity, null, {
    Id: { type: 'string', key: true, computed: true },
    Name: { type: 'string' },
    GeometryPoint: { type: 'GeometryPoint' },
    GeometryLineString: { type: 'GeometryLineString' },
    GeometryPolygon: { type: 'GeometryPolygon' },
    GeometryMultiPoint: { type: 'GeometryMultiPoint' },
    GeometryMultiLineString: { type: 'GeometryMultiLineString' },
    GeometryMultiPolygon: { type: 'GeometryMultiPolygon' },
    GeometryCollection: { type: 'GeometryCollection' },
});

$data.Class.define('$example.Context', $data.EntityContext, null, {
    People: { type: $data.EntitySet, elementType: $example.Person },
    Orders: { type: $data.EntitySet, elementType: $example.Order },
    Places: { type: $data.EntitySet, elementType: $example.Place },
    TestItems: { type: $data.EntitySet, elementType: $example.TestItem },
    TestItemGuids: { type: $data.EntitySet, elementType: $example.TestItemGuid },
    TestItemComputeds: { type: $data.EntitySet, elementType: $example.TestItemComputed },
    GeoTestEntities: { type: $data.EntitySet, elementType: $example.GeoTestEntity },
    GeometryTestEntities: { type: $data.EntitySet, elementType: $example.GeometryTestEntity },
    FuncStrParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncStrParam', returnType: $data.String, params: [{ a: $data.String }] }),
    FuncGuidParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncGuidParam', returnType: $data.Guid, params: [{ a: $data.Guid }] }),
    FuncIntParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncIntParam', returnType: $data.Integer, params: [{ a: $data.Integer }] }),
    FuncNumParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncNumParam', returnType: $data.Number, params: [{ a: $data.Number }] }),
    FuncObjParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncObjParam', returnType: $data.Object, params: [{ a: $data.Object }] }),
    FuncArrParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncArrParam', returnType: $data.Object, params: [{ a: $data.Array }] }),
    FuncEntityParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncEntityParam', returnType: $example.Person, params: [{ a: $example.Person }] }),
    FuncBoolParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncBoolParam', returnType: $data.Boolean, params: [{ a: $data.Boolean }] }),
    FuncDateParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncDateParam', returnType: $data.Date, params: [{ a: $data.Date }] }),
    FuncGeographyParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncGeographyParam', returnType: $data.GeographyPoint, params: [{ a: $data.GeographyPoint }] }),
    FuncGeometryParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncGeometryParam', returnType: $data.GeometryPoint, params: [{ a: $data.GeometryPoint }] }),

    ATables: {
        type: $data.EntitySet,
        elementType: $data.Entity.extend('$example.ATable', {
            Id: { type: 'string', key: true, computed: true },
            ComplexData: {
                type: $data.Entity.extend('$example.Complex1', {
                    Field1: { type: 'int' },
                    Field2: { type: 'string' }
                })
            },
            ComplexArray: {
                type: 'Array',
                elementType: $data.Entity.extend('$example.Complex2', {
                    Field3: { type: 'int' },
                    Field4: { type: 'string' }
                })
            },
            ComplexArrayPrim: { type: 'Array', elementType: 'string' },
            ComplexEntity: { type: $example.Order },
            ComplexEntityArray: { type: 'Array', elementType: $example.Order }
        })
    }
});

$example.Context.deleteData = function (ctx, callback) {
    callback = $data.typeSystem.createCallbackSetting(callback);

    ctx.onReady(function () {
        ctx.People.toArray(function (p) {
            ctx.Orders.toArray(function (o) {
                ctx.Places.toArray(function (pl) {
                    ctx.TestItems.toArray(function (t) {
                        ctx.TestItemGuids.toArray(function (tg) {
                            for (var i = 0; i < p.length; i++) {
                                ctx.People.remove(p[i]);
                            }
                            for (var i = 0; i < o.length; i++) {
                                ctx.Orders.remove(o[i]);
                            }
                            for (var i = 0; i < pl.length; i++) {
                                ctx.Places.remove(pl[i]);
                            }
                            for (var i = 0; i < t.length; i++) {
                                ctx.TestItems.remove(t[i]);
                            }
                            for (var i = 0; i < tg.length; i++) {
                                ctx.TestItemGuids.remove(tg[i]);
                            }
                            ctx.saveChanges(function () {
                                if (o.length >= $example.Context.generateTestData.itemsInTables || p.length >= $example.Context.generateTestData.itemsInTables ||
                                    pl.length >= $example.Context.generateTestData.itemsInTables || t.length >= $example.Context.generateTestData.itemsInTables) {
                                    $example.Context.deleteData(ctx, callback);
                                } else {
                                    callback.success();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
};
$example.Context.generateTestData = function (ctx, callback) {
    $example.Context.deleteData(ctx, function () {
        for (var i = 0; i < $example.Context.generateTestData.itemsInTables; i++) {
            ctx.People.add({ Name: 'Person' + i, Description: 'desc' + i, Age: 10 + i });
            ctx.Orders.add({ Value: i * 1000, Date: new Date((2000 + i) + '/01/01'), Completed: i % 2, Data: { a: 5, b: i } });
            ctx.Places.add({ Name: 'Places' + i, Location: new $data.GeographyPoint(123.15697, i) });
            ctx.TestItemGuids.add({ Id: $data.Guid.NewGuid(), Name: 'name' + i, Index: i, GuidField: $data.Guid.NewGuid() });
        }

        ctx.saveChanges(callback);
    });
};

$example.Context.generateTestData.serviceurl = '/testservice';
$example.Context.generateTestData.itemsInTables = 10;
$example.Context.getContext = function (cfg) {
    var config = $data.typeSystem.extend({
        name: 'oData',
        oDataServiceHost: $example.Context.generateTestData.serviceurl,
        serviceUrl: $example.Context.generateTestData.serviceurl,
        user: 'asd',
        password: 'asd',
        maxDataServiceVersion: '3.0'
    }, cfg || {});

    var ctx = new $example.Context(config);
    return ctx;
};

test("REST - GET inlineCount", function () {
    stop();
    expect(2);

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Orders.withInlineCount().take(2).toArray(function (orders) {
            equal(orders.length, 2, 'length invalid');
            equal(orders.totalCount, 10, 'totalCount invalid');
            start();
        });
    });
});
test("REST - GET inlineCount with filter", function () {
    stop();
    expect(2);

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Orders.filter(function(it){ return it.Completed == true; }).withInlineCount().take(2).toArray(function (orders) {
            equal(orders.length, 2, 'length invalid');
            equal(orders.totalCount, 5, 'totalCount invalid');
            start();
        });
    });
});
test("REST - GET inlineCount no result", function () {
    stop();
    expect(2);

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Orders.filter(function(it){ return it.Date > this.d; }, { d: new Date() }).withInlineCount().toArray(function (orders) {
            equal(orders.length, 0, 'length invalid');
            equal(orders.totalCount, 0, 'totalCount invalid');
            start();
        });
    });
});
test("REST - GET types", 9, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Orders.toArray(function (orders) {
            var order = orders[0];

            equal(order.Date instanceof Date, true, 'date result failed');
            ok(order.Date > new Date(1980), true, 'date result value failed');
            equal(typeof order.Completed, 'boolean', 'bool result failed');
            equal(typeof order.Value, 'number', 'int result failed');
            equal(typeof order.Id, 'string', 'id result failed');
            notEqual(order.Id.indexOf("'"), 0, 'id result failed');

            equal(typeof order.Data, 'object', 'Data result failed');
            equal(typeof order.Data.a, 'number', 'Data.a result failed');
            equal(typeof order.Data.b, 'number', 'Data.b result failed');

            start();
        });
    });
});
test("REST - GET responseLimit", 3, function () {
    stop();

    var context = $example.Context.getContext();
    var testNum = $example.Context.generateTestData.itemsInTables;
    $example.Context.generateTestData.itemsInTables = 50;

    //$example.Context.deleteData(context, function () {
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (items) {
            context.People.length(function (count) {
                equal(items.length, 30, 'items result count failed');

                equal(count, 50, 'count result failed');
                equal(typeof count, 'number', 'count result type failed');


                $example.Context.generateTestData.itemsInTables = testNum;
                start();
            });
        });
    });
    //});

});
test("REST - GET $Count", 2, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.length(function (count) {
            equal(count, 10, 'count result failed');
            equal(typeof count, 'number', 'count result type failed');
            start();
        });
    });
});
test("REST - GET ById", 4, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {
            var person = p[0];

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/People('" + person.Id + "')",
                method: 'GET',
                data: undefined,
                user: 'asd',
                password: 'asd'
            }, function (data) {

                equal(data.Id, person.Id, 'Id field failed');
                equal(data.Name, person.Name, 'Name field failed');
                equal(data.Description, person.Description, 'Description field failed');
                equal(data.Age, person.Age, 'Age field failed');

                start();
            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});
test("REST - GET ById guid", 3, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.TestItemGuids.toArray(function (p) {
            var item = p[0];

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/TestItemGuids(guid'" + item.Id + "')",
                method: 'GET',
                data: undefined,
                user: 'asd',
                password: 'asd'
            }, function (data) {

                equal(data.Id, item.Id.toString(), 'Id field failed');
                equal(data.Name, item.Name, 'Name field failed');
                equal(data.Index, item.Index, 'Index field failed');

                start();
            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});
test("REST - GET ById / Property", 4, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {
            var person = p[0];

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/People('" + person.Id + "')/Name",
                method: 'GET',
                data: undefined
            }, function (data) {

                equal(data.Id, undefined, 'Id field failed');
                equal(data.Name, person.Name, 'Name field failed');
                equal(data.Description, undefined, 'Description field failed');
                equal(data.Age, undefined, 'Age field failed');

                start();
            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});

test("REST - POST", 8, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.deleteData(context, function () {
        OData.request({
            requestUri: $example.Context.generateTestData.serviceurl + "/People",
            method: 'POST',
            data: {
                Name: 'JayData',
                Description: 'Desc',
                Age: 27
            }
        }, function (data) {

            notEqual(data.Id, undefined, 'Id field failed');
            equal(data.Name, 'JayData', 'Name field failed');
            equal(data.Description, 'Desc', 'Description field failed');
            equal(data.Age, 27, 'Age field failed');

            context.People.toArray(function (p) {
                var person = p[0];

                notEqual(person.Id, undefined, 'Id field failed');
                equal(person.Name, 'JayData', 'Name field failed');
                equal(person.Description, 'Desc', 'Description field failed');
                equal(person.Age, 27, 'Age field failed');

                start();
            });
        }, function () {
            console.log(JSON.stringify(arguments));
            stop();
        });

    });
});

test("REST - MERGE", 5, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {
            var person = p[0];

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/People('" + person.Id + "')",
                method: 'MERGE',
                data: {
                    Id: person.Id,
                    Name: 'UpdatedName',
                    Age: 300,
                }
            }, function (data) {

                equal(data, undefined, 'data failed');

                context.People.filter(function (p) { p.Name == 'UpdatedName' }).toArray(function (p2) {
                    var person2 = p2[0];

                    equal(person2.Id, person.Id, 'Id field failed');
                    equal(person2.Name, 'UpdatedName', 'Name field failed');
                    equal(person2.Description, person.Description, 'Description field failed');
                    equal(person2.Age, 300, 'Age field failed');

                    start();
                });

            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});

test("REST - DELETE", 2, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {
            var person = p[0];

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/People('" + person.Id + "')",
                method: 'DELETE',
                data: {
                    Id: person.Id,
                }
            }, function (data) {

                equal(data, undefined, 'data failed');

                context.People.filter(function (p) { p.Id == this.Id }, { Id: person.Id }).toArray(function (p2) {
                    equal(p2.length, 0, 'result failed');

                    start();
                });

            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});
test("REST - DELETE batch", 3, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.length(function (count) {
            equal(count, 10, 'result failed');
            context.People.removeAll(function (cnt) {
                equal(cnt, 10, 'result failed');
                context.People.length(function (count2) {
                    equal(count2, 0, 'result failed');
                    start();
                });
            });
        });
    });
});
test("REST - DELETE batch filter", 3, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.length(function (count) {
            equal(count, 10, 'result failed');
            context.People.filter(function (p) { return p.Age < 15 }).removeAll(function (cnt) {
                equal(cnt, 5, 'result failed');
                context.People.length(function (count2) {
                    equal(count2, 5, 'result failed');
                    start();
                });
            });
        });
    });
});

test("OData - Object type save", 3, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {

        var objForSave = { test: 'value', example: 'object', d: { complex: 'deepObject' } };
        var order = new $example.Order({ Value: 226, Data: objForSave });
        context.Orders.add(order);
        context.saveChanges(function () {
            context.Orders.filter('it.Value == 226').toArray(function (orders) {
                var o = orders[0];
                equal(typeof o.Id, 'string', 'Id exists');
                equal(o.Value, 226, 'Value field failed');
                deepEqual(o.Data, objForSave, 'Value field failed');
                start();
            });
        });
    });
});
test("OData - Object type modify", 3, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Orders.toArray(function (orders) {
            var order = orders[0];
            context.Orders.attach(order);

            var objForSave = { test: 'value', example: 'object', d: { complex: 'deepObject' } };
            order.Data = objForSave;
            order.Value = 226;

            context.saveChanges(function () {
                context.Orders.filter('it.Value == 226').toArray(function (orders) {
                    var o = orders[0];
                    equal(typeof o.Id, 'string', 'Id exists');
                    equal(o.Value, 226, 'Value field failed');
                    deepEqual(o.Data, objForSave, 'Value field failed');
                    start();
                });
            });
        });
    });
});
test("OData - Object type modify to null", 3, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Orders.toArray(function (orders) {
            var order = orders[0];
            context.Orders.attach(order);

            order.Data = null;
            order.Value = 226;

            context.saveChanges(function () {
                context.Orders.filter('it.Value == 226').toArray(function (orders) {
                    var o = orders[0];
                    equal(typeof o.Id, 'string', 'Id exists');
                    equal(o.Value, 226, 'Value field failed');
                    deepEqual(o.Data, null, 'Value field failed');
                    start();
                });
            });
        });
    });
});

test("REST - Batch GET JSON", 8, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/$batch",
                method: 'POST',
                data: {
                    __batchRequests: [{
                        method: 'GET',
                        requestUri: 'People?$orderby=Age',
                        headers: {
                        }
                    }]
                }
            }, function (data) {
                //console.log(data);
                notEqual(data, undefined, 'data failed');

                var batch = data.__batchResponses[0];
                equal(batch.statusCode, 200, 'statusCode failed');
                equal(batch.statusText, 'Ok', 'statusText failed');


                equal(batch.headers['Content-Type'], "application/json;odata=verbose;charset=utf-8", 'result content type failed');
                equal(batch.data.results.length, 10, 'result length failed');

                equal(typeof batch.data.results[0].__metadata, 'object', 'metadata is object');
                delete batch.data.results[0].__metadata;

                equal(typeof batch.data.results[0].Id, 'string', 'Id is string');
                delete batch.data.results[0].Id;

                deepEqual(batch.data.results[0], {
                    Age: 10,
                    Description: "desc0",
                    Name: "Person0"
                }, 'item data failed');

                start();

            }, function () {
                console.log(JSON.stringify(arguments));
            },
            OData.batchHandler);

        });
    });
});
test("REST - Batch GET multiple JSON", 15, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/$batch",
                method: 'POST',
                data: {
                    __batchRequests: [{
                        method: 'GET',
                        requestUri: 'People?$orderby=Age',
                    },
                    {
                        method: 'GET',
                        requestUri: 'Orders?$orderby=Value',
                    }]
                }
            }, function (data) {
                //console.log(data);
                notEqual(typeof data, 'undefined', 'data failed');

                //People
                var batch = data.__batchResponses[0];
                equal(batch.statusCode, 200, 'statusCode failed');
                equal(batch.statusText, 'Ok', 'statusText failed');


                equal(batch.headers['Content-Type'], "application/json;odata=verbose;charset=utf-8", 'result content type failed');
                equal(batch.data.results.length, 10, 'result length failed');

                equal(typeof batch.data.results[0].__metadata, 'object', 'metadata is object');
                delete batch.data.results[0].__metadata;

                equal(typeof batch.data.results[0].Id, 'string', 'Id is string');
                delete batch.data.results[0].Id;

                deepEqual(batch.data.results[0], {
                    Age: 10,
                    Description: "desc0",
                    Name: "Person0"
                }, 'item data failed');


                //Orders
                var batch = data.__batchResponses[1];
                equal(batch.statusCode, 200, 'statusCode failed');
                equal(batch.statusText, 'Ok', 'statusText failed');


                equal(batch.headers['Content-Type'], "application/json;odata=verbose;charset=utf-8", 'result content type failed');
                equal(batch.data.results.length, 10, 'result length failed');

                equal(typeof batch.data.results[0].__metadata, 'object', 'metadata is object');
                delete batch.data.results[0].__metadata;

                equal(typeof batch.data.results[0].Id, 'string', 'Id is string');
                delete batch.data.results[0].Id;

                deepEqual(batch.data.results[0], {
                    Completed: false,
                    Data: {
                        a: 5,
                        b: 0
                    },
                    Date: "/Date(946681200000)/",
                    Value: 0,
                }, 'item data failed');

                start();

            }, function () {
                console.log(JSON.stringify(arguments));
            },
            OData.batchHandler);

        });
    });
});

test("REST - XML - GET", 6, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + '/People?$orderby=Age',
                method: 'GET',
                headers: {
                    'Accept': 'application/atom+xml'
                }
            }, function (data) {
                //console.log(data);
                notEqual(data, undefined, 'data failed');
                equal(typeof data.__metadata, 'object', 'data failed, __metadata is exists on xml result');

                equal(data.results.length, 10, 'result length failed');

                equal(typeof data.results[0].__metadata, 'object', 'metadata is object');
                delete data.results[0].__metadata;

                equal(typeof data.results[0].Id, 'string', 'Id is string');
                delete data.results[0].Id;

                deepEqual(data.results[0], {
                    Age: 10,
                    Description: "desc0",
                    Name: "Person0"
                }, 'item data failed');

                start();

            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});
test("REST - XML - GET ById", 5, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {
            var person = p[0];

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/People('" + person.Id + "')",
                method: 'GET',
                headers: {
                    'Accept': 'application/atom+xml'
                },
                data: undefined
            }, function (data) {
                equal(typeof data.__metadata, 'object', 'data failed, __metadata is exists on xml result');

                equal(data.Id, person.Id, 'Id field failed');
                equal(data.Name, person.Name, 'Name field failed');
                equal(data.Description, person.Description, 'Description field failed');
                equal(data.Age, person.Age, 'Age field failed');

                start();
            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});
test("REST - XML - GET ById / Property", 4, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {
            var person = p[0];

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/People('" + person.Id + "')/Name",
                method: 'GET',
                headers: {
                    'Accept': 'application/atom+xml'
                },
                data: undefined
            }, function (data) {

                equal(data.Id, undefined, 'Id field failed');
                equal(data.Name, person.Name, 'Name field failed');
                equal(data.Description, undefined, 'Description field failed');
                equal(data.Age, undefined, 'Age field failed');

                start();
            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});

test("REST - XML - POST", 8, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.deleteData(context, function () {
        OData.request({
            requestUri: $example.Context.generateTestData.serviceurl + "/People",
            method: 'POST',
            headers: {
                'Content-Type': 'application/atom+xml'
            },
            data: {
                Name: 'JayData',
                Description: 'Desc',
                Age: 27
            }
        }, function (data) {

            notEqual(data.Id, undefined, 'Id field failed');
            equal(data.Name, 'JayData', 'Name field failed');
            equal(data.Description, 'Desc', 'Description field failed');
            equal(data.Age, 27, 'Age field failed');

            context.People.toArray(function (p) {
                var person = p[0];

                notEqual(person.Id, undefined, 'Id field failed');
                equal(person.Name, 'JayData', 'Name field failed');
                equal(person.Description, 'Desc', 'Description field failed');
                equal(person.Age, 27, 'Age field failed');

                start();
            });
        }, function () {
            console.log(JSON.stringify(arguments));
            stop();
        });

    });
});

test("REST - XML - MERGE", 5, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {
            var person = p[0];

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/People('" + person.Id + "')",
                method: 'MERGE',
                headers: {
                    'Content-Type': 'application/atom+xml'
                },
                data: {
                    Id: person.Id,
                    Name: 'UpdatedName',
                    Age: 300,
                }
            }, function (data) {
                equal(data, undefined, 'data failed');

                context.People.filter(function (p) { p.Name == 'UpdatedName' }).toArray(function (p2) {
                    var person2 = p2[0];

                    equal(person2.Id, person.Id, 'Id field failed');
                    equal(person2.Name, 'UpdatedName', 'Name field failed');
                    equal(person2.Description, person.Description, 'Description field failed');
                    equal(person2.Age, 300, 'Age field failed');

                    start();
                });

            }, function () {
                console.log(JSON.stringify(arguments));
            });

        });
    });
});

test("REST - XML - Batch GET", 8, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/$batch",
                method: 'POST',
                data: {
                    __batchRequests: [{
                        method: 'GET',
                        requestUri: 'People?$orderby=Age',
                        headers: {
                            'Accept': 'application/atom+xml'
                        }
                    }]
                }
            }, function (data) {
                //console.log(data);
                notEqual(data, undefined, 'data failed');

                var batch = data.__batchResponses[0];
                equal(batch.statusCode, 200, 'statusCode failed');
                equal(batch.statusText, 'Ok', 'statusText failed');


                equal(batch.headers['Content-Type'], "application/atom+xml", 'result content type failed');
                equal(batch.data.results.length, 10, 'result length failed');

                equal(typeof batch.data.results[0].__metadata, 'object', 'metadata is object');
                delete batch.data.results[0].__metadata;

                equal(typeof batch.data.results[0].Id, 'string', 'Id is string');
                delete batch.data.results[0].Id;

                deepEqual(batch.data.results[0], {
                    Age: 10,
                    Description: "desc0",
                    Name: "Person0"
                }, 'item data failed');

                start();

            }, function () {
                console.log(JSON.stringify(arguments));
            },
            OData.batchHandler);

        });
    });
});

test("REST - Batch GET / $count", 5, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/$batch",
                method: 'POST',
                data: {
                    __batchRequests: [{
                        method: 'GET',
                        requestUri: 'People/$count',
                        headers: {
                            'Accept': 'text/plain'
                        }
                    }]
                }
            }, function (data) {
                //console.log(data);
                notEqual(data, undefined, 'data failed');

                var batch = data.__batchResponses[0];
                equal(batch.statusCode, 200, 'statusCode failed');
                equal(batch.statusText, 'Ok', 'statusText failed');

                equal(batch.headers['Content-Type'], "text/plain", 'result content type failed');
                equal(batch.data, "10", 'result data failed');

                start();

            }, function () {
                console.log(JSON.stringify(arguments));
            },
            OData.batchHandler);

        });
    });
});

test("REST - Batch GET / query params", 8, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/$batch",
                method: 'POST',
                data: {
                    __batchRequests: [{
                        method: 'GET',
                        requestUri: 'People?$filter=(Age ge 15)&$orderby=Age'
                    }]
                }
            }, function (data) {
                //console.log(data);
                notEqual(data, undefined, 'data failed');

                var batch = data.__batchResponses[0];
                equal(batch.statusCode, 200, 'statusCode failed');
                equal(batch.statusText, 'Ok', 'statusText failed');


                equal(batch.headers['Content-Type'], "application/json;odata=verbose;charset=utf-8", 'result content type failed');
                equal(batch.data.results.length, 5, 'result length failed');

                equal(typeof batch.data.results[0].__metadata, 'object', 'metadata is object');
                delete batch.data.results[0].__metadata;

                equal(typeof batch.data.results[0].Id, 'string', 'Id is string');
                delete batch.data.results[0].Id;

                deepEqual(batch.data.results[0], {
                    Age: 15,
                    Description: "desc5",
                    Name: "Person5"
                }, 'item data failed');

                start();

            }, function () {
                console.log(JSON.stringify(arguments));
            },
            OData.batchHandler);

        });
    });
});

test("REST - XML - Batch GET / query params", 8, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.People.toArray(function (p) {

            OData.request({
                requestUri: $example.Context.generateTestData.serviceurl + "/$batch",
                method: 'POST',
                data: {
                    __batchRequests: [{
                        method: 'GET',
                        requestUri: 'People?$filter=(Age ge 15)&$orderby=Age',
                        headers: {
                            'Accept': 'application/atom+xml'
                        }
                    }]
                }
            }, function (data) {
                //console.log(data);
                notEqual(data, undefined, 'data failed');

                var batch = data.__batchResponses[0];
                equal(batch.statusCode, 200, 'statusCode failed');
                equal(batch.statusText, 'Ok', 'statusText failed');


                equal(batch.headers['Content-Type'], "application/atom+xml", 'result content type failed');
                equal(batch.data.results.length, 5, 'result length failed');

                equal(typeof batch.data.results[0].__metadata, 'object', 'metadata is object');
                delete batch.data.results[0].__metadata;

                equal(typeof batch.data.results[0].Id, 'string', 'Id is string');
                delete batch.data.results[0].Id;

                deepEqual(batch.data.results[0], {
                    Age: 15,
                    Description: "desc5",
                    Name: "Person5"
                }, 'item data failed');

                start();

            }, function () {
                console.log(JSON.stringify(arguments));
            },
            OData.batchHandler);

        });
    });

});

test("Save Geography", 5, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.deleteData(context, function () {
        var place = new $example.Place({ Name: 'Headquarter', Location: new $data.GeographyPoint(-44.001536, 44.35433) });

        context.Places.add(place);

        context.saveChanges({
            success: function () {

                context.Places.toArray(function (places) {

                    equal(places.length, 1, 'result length failed');
                    equal(places[0].Id, place.Id, 'loaded Id failed');

                    equal(places[0].Location instanceof $data.GeographyPoint, true, 'Geo type type failed');
                    equal(places[0].Location.longitude, -44.001536, 'Geo type longitude failed');
                    equal(places[0].Location.latitude, 44.35433, 'Geo type longitude failed');

                    start();
                });
            },
            error: function (ex) {
                ok(false, 'save error occured: ' + ex);
                start();
            }
        })

    });
});

test("Modify Geography", 4, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Places.toArray(function (places) {
            var place = places[0];

            context.attach(place);
            place.Location = new $data.GeographyPoint(23.153, -16.138135);
            place.Name = 'Jay location';

            context.saveChanges(function () {
                context.Places.filter('it.Name == "Jay location"').single(null, null, function (placeRes) {

                    equal(placeRes.Id, place.Id, 'loaded Id failed');

                    equal(placeRes.Location instanceof $data.GeographyPoint, true, 'Geo type type failed');
                    equal(placeRes.Location.longitude, 23.153, 'Geo type longitude failed');
                    equal(placeRes.Location.latitude, -16.138135, 'Geo type longitude failed');

                    start();
                });
            });
        });
    });
});

test("Filter Geography equal", 3, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Places.filter(function (p) { return p.Location == this.geo }, { geo: new $data.GeographyPoint(123.15697, 1) }).toArray(function (places) {
            equal(places.length, 1, 'filter for Geography ?!');
            equal(places[0].Location.longitude, 123.15697, 'Location.longitude failed');
            equal(places[0].Location.latitude, 1, 'Location.latitude failed');

            start();
        });
    });
});
/*

MongoDB doesn't support not equals when spatial index exists on field!

test("Filter Geography not equal", 19, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Places.filter(function (p) { return p.Location != this.geo }, { geo: new $data.GeographyPoint(123.15697, 1) }).toArray(function (places) {
            equal(places.length, 9, 'not filter for Geography ?!');
            for (var i = 0; i < 9; i++) {
                equal(places[i].Location.longitude, 123.15697, 'Location.longitude failed');
                notEqual(places[i].Location.latitude, 1, 'Location.latitude failed');
            }


            start();
        });
    });
});
*/
test("Save GeographyObjects", 19, function () {
    stop();

    var context = $example.Context.getContext();
    context.onReady(function () {
        context.GeoTestEntities.removeAll(function () {

            var point = new $data.GeographyPoint([1, 5]);
            var lString = new $data.GeographyLineString([[1, 2], [3, -4.34], [-5, 6.15]]);
            var polygon = new $data.GeographyPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]);
            var polygonWithHole = new $data.GeographyPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
            ]);
            var mPoint = new $data.GeographyMultiPoint([[100.0, 0.0], [101.0, 1.0]]);
            var mLineString = new $data.GeographyMultiLineString([
                  [[100.0, 0.0], [101.0, 1.0]],
                  [[102.0, 2.0], [103.0, 3.0]]
            ]);
            var mPolygon = new $data.GeographyMultiPolygon([
                [
                    [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
            ]);
            var collection = new $data.GeographyCollection({
                geometries: [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [[101.0, 0.0], [102.0, 1.0]]
                    }
                ]
            });

            var item = new $example.GeoTestEntity({
                Name: 'Item1Name',
                GeographyPoint: point,
                GeographyLineString: lString,
                GeographyPolygon: polygon,
                GeographyMultiPoint: mPoint,
                GeographyMultiLineString: mLineString,
                GeographyMultiPolygon: mPolygon,
                GeographyCollection: collection,
            });

            var item2 = new $example.GeoTestEntity({
                Name: 'Item2Name',
                GeographyPoint: point,
                GeographyLineString: lString,
                GeographyPolygon: polygonWithHole,
                GeographyMultiPoint: mPoint,
                GeographyMultiLineString: mLineString,
                GeographyMultiPolygon: mPolygon,
                GeographyCollection: collection,
            });

            context.GeoTestEntities.add(item);
            context.GeoTestEntities.add(item2);

            var itemsToSave = [item, item2];
            context.saveChanges(function () {
                context.GeoTestEntities.orderBy('it.Name').toArray(function (items) {

                    equal(items.length, 2, 'result length');
                    for (var i = 0; i < items.length; i++) {
                        var resItem = items[i];
                        var refItem = itemsToSave[i];

                        equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
                        equal(resItem.Name, 'Item' + (i+1) + 'Name', 'itemName');

                        deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
                        deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
                        deepEqual(resItem.GeographyPolygon.coordinates, (i == 0 ? polygon : polygonWithHole).coordinates, 'GeographyPolygon data');
                        deepEqual(resItem.GeographyMultiPoint.coordinates, mPoint.coordinates, 'GeographyMultiPoint data');
                        deepEqual(resItem.GeographyMultiLineString.coordinates, mLineString.coordinates, 'GeographyMultiLineString data');
                        deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
                        deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

                    }

                    start();
                });
            });

        });
    });
});

test("Modify GeographyObjects", 20, function () {
    stop();

    var context = $example.Context.getContext();
    context.onReady(function () {
        context.GeoTestEntities.removeAll(function () {

            var point = new $data.GeographyPoint([1, 5]);
            var lString = new $data.GeographyLineString([[1, 2], [3, -4.34], [-5, 6.15]]);
            var polygon = new $data.GeographyPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]);
            var polygonWithHole = new $data.GeographyPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
            ]);
            var mPoint = new $data.GeographyMultiPoint([[100.0, 0.0], [101.0, 1.0]]);
            var mLineString = new $data.GeographyMultiLineString([
                  [[100.0, 0.0], [101.0, 1.0]],
                  [[102.0, 2.0], [103.0, 3.0]]
            ]);
            var mPolygon = new $data.GeographyMultiPolygon([
                [
                    [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
            ]);
            var collection = new $data.GeographyCollection({
                geometries: [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [[101.0, 0.0], [102.0, 1.0]]
                    }
                ]
            });

            var item = new $example.GeoTestEntity({
                Name: 'ItemName',
                GeographyPoint: point,
                GeographyLineString: lString,
                GeographyPolygon: polygon,
                GeographyMultiPoint: null,
                GeographyMultiLineString: undefined,
                GeographyMultiPolygon: mPolygon,
                GeographyCollection: collection,
            });

            context.GeoTestEntities.add(item);

            context.saveChanges(function () {
                context.GeoTestEntities.toArray(function (items) {

                    equal(items.length, 1, 'result length');
                    var resItem = items[0];
                    var refItem = item;

                    equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
                    equal(resItem.Name, 'ItemName', 'itemName');

                    deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
                    deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
                    deepEqual(resItem.GeographyPolygon.coordinates, polygon.coordinates, 'GeographyPolygon data');
                    deepEqual(resItem.GeographyMultiPoint, null, 'GeographyMultiPoint data');
                    deepEqual(resItem.GeographyMultiLineString, null, 'GeographyMultiLineString data');
                    deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
                    deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

                    context.GeoTestEntities.attach(resItem);
                    resItem.Name = 'Item updated';
                    resItem.GeographyPolygon = polygonWithHole;
                    resItem.GeographyMultiPoint = mPoint;
                    resItem.GeographyMultiLineString = mLineString;

                    context.saveChanges(function () {
                        context.GeoTestEntities.toArray(function (itemsup) {

                            equal(itemsup.length, 1, 'result length');
                            var refItem = resItem;
                            var resItem = itemsup[0];

                            equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
                            equal(resItem.Name, 'Item updated', 'itemName updated');

                            deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
                            deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
                            deepEqual(resItem.GeographyPolygon.coordinates, polygonWithHole.coordinates, 'GeographyPolygon data');
                            deepEqual(resItem.GeographyMultiPoint.coordinates, mPoint.coordinates, 'GeographyMultiPoint data');
                            deepEqual(resItem.GeographyMultiLineString.coordinates, mLineString.coordinates, 'GeographyMultiLineString data');
                            deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
                            deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

                            start();
                        });
                    });
                });
            });
        });
    });
});

test("Save GeometryObjects", 19, function () {
    stop();

    var context = $example.Context.getContext();
    context.onReady(function () {
        context.GeometryTestEntities.removeAll(function () {

            var point = new $data.GeometryPoint([1, 5]);
            var lString = new $data.GeometryLineString([[1, 2], [3, -4.34], [-5, 6.15]]);
            var polygon = new $data.GeometryPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]);
            var polygonWithHole = new $data.GeometryPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
            ]);
            var mPoint = new $data.GeometryMultiPoint([[100.0, 0.0], [101.0, 1.0]]);
            var mLineString = new $data.GeometryMultiLineString([
                  [[100.0, 0.0], [101.0, 1.0]],
                  [[102.0, 2.0], [103.0, 3.0]]
            ]);
            var mPolygon = new $data.GeometryMultiPolygon([
                [
                    [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
            ]);
            var collection = new $data.GeometryCollection({
                geometries: [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [[101.0, 0.0], [102.0, 1.0]]
                    }
                ]
            });

            var item = new $example.GeometryTestEntity({
                Name: 'Item1Name',
                GeometryPoint: point,
                GeometryLineString: lString,
                GeometryPolygon: polygon,
                GeometryMultiPoint: mPoint,
                GeometryMultiLineString: mLineString,
                GeometryMultiPolygon: mPolygon,
                GeometryCollection: collection,
            });

            var item2 = new $example.GeometryTestEntity({
                Name: 'Item2Name',
                GeometryPoint: point,
                GeometryLineString: lString,
                GeometryPolygon: polygonWithHole,
                GeometryMultiPoint: mPoint,
                GeometryMultiLineString: mLineString,
                GeometryMultiPolygon: mPolygon,
                GeometryCollection: collection,
            });

            context.GeometryTestEntities.add(item);
            context.GeometryTestEntities.add(item2);

            var itemsToSave = [item, item2];
            context.saveChanges(function () {
                context.GeometryTestEntities.orderBy('it.Name').toArray(function (items) {

                    equal(items.length, 2, 'result length');
                    for (var i = 0; i < items.length; i++) {
                        var resItem = items[i];
                        var refItem = itemsToSave[i];

                        equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
                        equal(resItem.Name, 'Item' + (i + 1) + 'Name', 'itemName');

                        deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
                        deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
                        deepEqual(resItem.GeometryPolygon.coordinates, (i == 0 ? polygon : polygonWithHole).coordinates, 'GeometryPolygon data');
                        deepEqual(resItem.GeometryMultiPoint.coordinates, mPoint.coordinates, 'GeometryMultiPoint data');
                        deepEqual(resItem.GeometryMultiLineString.coordinates, mLineString.coordinates, 'GeometryMultiLineString data');
                        deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
                        deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

                    }

                    start();
                });
            });

        });
    });
});

test("Modify GeometryObjects", 20, function () {
    stop();

    var context = $example.Context.getContext();
    context.onReady(function () {
        context.GeometryTestEntities.removeAll(function () {

            var point = new $data.GeometryPoint([1, 5]);
            var lString = new $data.GeometryLineString([[1, 2], [3, -4.34], [-5, 6.15]]);
            var polygon = new $data.GeometryPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]);
            var polygonWithHole = new $data.GeometryPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
            ]);
            var mPoint = new $data.GeometryMultiPoint([[100.0, 0.0], [101.0, 1.0]]);
            var mLineString = new $data.GeometryMultiLineString([
                  [[100.0, 0.0], [101.0, 1.0]],
                  [[102.0, 2.0], [103.0, 3.0]]
            ]);
            var mPolygon = new $data.GeometryMultiPolygon([
                [
                    [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
            ]);
            var collection = new $data.GeometryCollection({
                geometries: [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [[101.0, 0.0], [102.0, 1.0]]
                    }
                ]
            });

            var item = new $example.GeometryTestEntity({
                Name: 'ItemName',
                GeometryPoint: point,
                GeometryLineString: lString,
                GeometryPolygon: polygon,
                GeometryMultiPoint: null,
                GeometryMultiLineString: undefined,
                GeometryMultiPolygon: mPolygon,
                GeometryCollection: collection,
            });

            context.GeometryTestEntities.add(item);

            context.saveChanges(function () {
                context.GeometryTestEntities.toArray(function (items) {

                    equal(items.length, 1, 'result length');
                    var resItem = items[0];
                    var refItem = item;

                    equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
                    equal(resItem.Name, 'ItemName', 'itemName');

                    deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
                    deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
                    deepEqual(resItem.GeometryPolygon.coordinates, polygon.coordinates, 'GeometryPolygon data');
                    deepEqual(resItem.GeometryMultiPoint, null, 'GeometryMultiPoint data');
                    deepEqual(resItem.GeometryMultiLineString, null, 'GeometryMultiLineString data');
                    deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
                    deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

                    context.GeometryTestEntities.attach(resItem);
                    resItem.Name = 'Item updated';
                    resItem.GeometryPolygon = polygonWithHole;
                    resItem.GeometryMultiPoint = mPoint;
                    resItem.GeometryMultiLineString = mLineString;

                    context.saveChanges(function () {
                        context.GeometryTestEntities.toArray(function (itemsup) {

                            equal(itemsup.length, 1, 'result length');
                            var refItem = resItem;
                            var resItem = itemsup[0];

                            equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
                            equal(resItem.Name, 'Item updated', 'itemName updated');

                            deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
                            deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
                            deepEqual(resItem.GeometryPolygon.coordinates, polygonWithHole.coordinates, 'GeometryPolygon data');
                            deepEqual(resItem.GeometryMultiPoint.coordinates, mPoint.coordinates, 'GeometryMultiPoint data');
                            deepEqual(resItem.GeometryMultiLineString.coordinates, mLineString.coordinates, 'GeometryMultiLineString data');
                            deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
                            deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

                            start();
                        });
                    });
                });
            });
        });
    });
});

test("FunctionImport without param str (null param)", 1, function () {
    stop();

    var context = $example.Context.getContext();
    context.onReady(function () {
        context.FuncStrParam(null, function (ret) {
            equal(ret, 'null', 'result is null');
            start();
        });
    });
});

test("FunctionImport without param int (null param)", 1, function () {
    stop();

    var context = $example.Context.getContext();
    context.onReady(function () {
        context.FuncNumParam(null, function (ret) {
            equal(ret, null, 'result is null');
            start();
        });
    });
});

test("Bugfix delete test", 1, function () {
    stop();

    var context = $example.Context.getContext();
    context.onReady(function () {
        for (var i = 0; i < 10; i++) {
            var t = new $example.TestItem({ Id: 'asdad' + i, Name: 'name' + i, Index: i });
            context.TestItems.add(t);
        }
        context.saveChanges(function () {
            context.TestItems.toArray(function (items) {
                for (var i = 0; i < 5; i++) {
                    context.TestItems.remove(items[i]);
                }

                context.saveChanges(function () {
                    context.TestItems.toArray(function (items) {
                        equal(items.length, 5, 'delete failed');
                        start();
                    })
                });

            });
        });

    });
});

test("Save Guid", 3, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.deleteData(context, function () {
        var item = new $example.TestItemGuid({ Id: $data.Guid.NewGuid(), Name: 'item1' });

        context.TestItemGuids.add(item);

        context.saveChanges({
            success: function () {

                context.TestItemGuids.toArray(function (items) {

                    equal(items.length, 1, 'result length failed');
                    equal(items[0].Id.valueOf(), item.Id.valueOf(), 'loaded Id failed');

                    equal(items[0].Name, 'item1', 'Name failed');

                    start();
                });
            },
            error: function (ex) {
                ok(false, 'save error occured: ' + ex);
                start();
            }
        })

    });
});

test("Modify Guid - Filter Guid", 2, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.TestItemGuids.toArray(function (items) {
            var item = items[0];

            context.attach(item);
            item.GuidField = $data.parseGuid('12345678-1234-1234-1234-123412341234');
            item.Name = 'Jay location';

            context.saveChanges(function () {
                context.TestItemGuids.filter('it.GuidField == this.Guid', { Guid: $data.parseGuid('12345678-1234-1234-1234-123412341234') }).single(null, null, function (itemRes) {

                    equal(itemRes.Id.valueOf(), item.Id.valueOf(), 'loaded Id failed');
                    equal(itemRes.GuidField.valueOf(), item.GuidField.valueOf(), 'loaded GuidField failed');

                    start();
                });
            });
        });
    });
});

test("Delete item with guid key", 2, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.TestItemGuids.toArray(function (items) {
            var item = items[0];

            context.TestItemGuids.remove(item);

            context.saveChanges(function () {
                context.TestItemGuids.filter('it.Id == this.Guid', { Guid: item.Id }).length(function (cnt) {
                    equal(cnt, 0, 'delete failed');
                    context.TestItemGuids.length(function (count) {
                        equal(count, items.length - 1, 'delete failed all result');
                        start();
                    });
                });
            });
        });
    });
});

test("Delete item by guid", 2, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.TestItemGuids.toArray(function (items) {
            var item = items[0];

            context.TestItemGuids.remove({ Id: item.Id });

            context.saveChanges(function () {
                context.TestItemGuids.filter('it.Id == this.Guid', { Guid: item.Id }).length(function (cnt) {
                    equal(cnt, 0, 'delete failed');
                    context.TestItemGuids.length(function (count) {
                        equal(count, items.length - 1, 'delete failed all result');
                        start();
                    });
                });
            });
        });
    });
});

$data.Class.define('$example.ComplexT', $data.Entity, null, {
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int' },
    Created: { type: 'date' }
});

$data.Class.define('$example.ComplexTWithComplex', $data.Entity, null, {
    Title: { type: 'string' },
    Complex: { type: '$example.ComplexT' }
});

$data.Class.define('$example.ComplexTWithArrayComplex', $data.Entity, null, {
    Title: { type: 'string' },
    Complex: { type: 'Array', elementType: '$example.ComplexT' }
});

$data.Class.define('$example.ComplexTWithCC', $data.Entity, null, {
    Title: { type: 'string' },
    Complex2: { type: '$example.ComplexTWithComplex' }
});

$data.Class.define('$example.ComplexTWithCCAndArrayC', $data.Entity, null, {
    Title: { type: 'string' },
    Complex: { type: '$example.ComplexT' },
    Complex2Arr: { type: 'Array', elementType: '$example.ComplexTWithComplex' }
});

$data.Class.define('$example.FuncContext', $data.EntityContext, null, {
    People: { type: $data.EntitySet, elementType: $example.Person },
    Orders: { type: $data.EntitySet, elementType: $example.Order },
    FuncComplexRes: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplexRes', returnType: $example.ComplexT, params: [{ a: $data.String }] }),
    FuncComplexResArray: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplexResArray', returnType: $data.Queryable, elementType: $example.ComplexT, params: [{ a: $data.String }] }),
    FuncComplex2Res: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplex2Res', returnType: $example.ComplexTWithComplex, params: [{ a: $data.String }] }),
    FuncComplex2ResArray: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplex2ResArray', returnType: $data.Queryable, elementType: $example.ComplexTWithComplex, params: [{ a: $data.String }] }),
    FuncComplex3Res: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplex3Res', returnType: $example.ComplexTWithCC, params: [{ a: $data.String }] }),
    FuncComplex3ResArray: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplex3ResArray', returnType: $data.Queryable, elementType: $example.ComplexTWithCC, params: [{ a: $data.String }] }),
    FuncComplexWithArrayComplexRes: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplexWithArrayComplexRes', returnType: $example.ComplexTWithArrayComplex, params: [{ a: $data.String }] }),
    FuncComplexWithArrayComplexResArray: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplexWithArrayComplexResArray', returnType: $data.Queryable, elementType: $example.ComplexTWithArrayComplex, params: [{ a: $data.String }] }),
    FuncComplexMultiRes: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplexMultiRes', returnType: $example.ComplexTWithCCAndArrayC, params: [{ a: $data.String }] }),
    FuncComplexMultiResArray: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncComplexMultiResArray', returnType: $data.Queryable, elementType: $example.ComplexTWithCCAndArrayC, params: [{ a: $data.String }] })
});


$example.Context.generateTestData.funcserviceurl = '/funcservice';
$example.FuncContext.getContext = function () {
    var ctx = new $example.FuncContext({ name: 'oData', oDataServiceHost: $example.Context.generateTestData.funcserviceurl, serviceUrl: $example.Context.generateTestData.funcserviceurl, user: 'asd', password: 'asd' });
    return ctx;
};

test("FunctionImport - FuncComplexRes", 5, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplexRes('Hello World', function (ret) {
            equal(ret instanceof $example.ComplexT, true, 'result is $example.ComplexT');
            equal(ret.Name, 'Hello World', 'Name failed');
            equal(ret.Description, 'desc', 'Description failed');
            equal(ret.Age, 42, 'Age failed');
            equal(ret.Created.valueOf(), new Date('2000/01/01 01:01:01').valueOf(), 'Created failed');
            start();
        });
    });
});
test("FunctionImport - FuncComplexResArray", 25, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplexResArray('Hello World', function (result) {
            for (var i = 0; i < 5; i++) {
                var ret = result[i];
                equal(ret instanceof $example.ComplexT, true, 'result is $example.ComplexT');
                equal(ret.Name, 'Hello World' + i, 'Name failed');
                equal(ret.Description, 'desc', 'Description failed');
                equal(ret.Age, i, 'Age failed');
                equal(ret.Created.valueOf(), new Date((2000 + i).toString() + '/01/01 01:01:01').valueOf(), 'Created failed');
            }
            start();
        });
    });
});

test("FunctionImport - FuncComplex2Res", 7, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplex2Res('Hello World', function (ret) {
            equal(ret instanceof $example.ComplexTWithComplex, true, 'result is $example.ComplexTWithComplex');
            equal(ret.Title, 'Hello World', 'Title failed');

            equal(ret.Complex instanceof $example.ComplexT, true, 'result is $example.ComplexT');
            equal(ret.Complex.Name, 'Hello World', 'Name failed');
            equal(ret.Complex.Description, 'desc', 'Description failed');
            equal(ret.Complex.Age, 42, 'Age failed');
            equal(ret.Complex.Created.valueOf(), new Date('2000/01/01 01:01:01').valueOf(), 'Created failed');
            start();
        });
    });
});
test("FunctionImport - FuncComplex2ResArray", 35, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplex2ResArray('Hello World', function (result) {
            for (var i = 0; i < 5; i++) {
                var ret = result[i];
                equal(ret instanceof $example.ComplexTWithComplex, true, 'result is $example.ComplexTWithComplex');
                equal(ret.Title, 'Hello World' + i, 'Title failed');

                equal(ret.Complex instanceof $example.ComplexT, true, 'result is $example.ComplexT');
                equal(ret.Complex.Name, 'Hello World' + i, 'Name failed');
                equal(ret.Complex.Description, 'desc', 'Description failed');
                equal(ret.Complex.Age, i, 'Age failed');
                equal(ret.Complex.Created.valueOf(), new Date((2000 + i).toString() + '/01/01 01:01:01').valueOf(), 'Created failed');
            }
            start();
        });
    });
});

test("FunctionImport - FuncComplex3Res", 9, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplex3Res('Hello World', function (ret) {
            equal(ret instanceof $example.ComplexTWithCC, true, 'result is $example.ComplexTWithCC');
            equal(ret.Title, 'Hello World', 'Title failed');

            equal(ret.Complex2 instanceof $example.ComplexTWithComplex, true, 'result is $example.ComplexTWithComplex');
            equal(ret.Complex2.Title, 'Hello World', 'Title failed');

            equal(ret.Complex2.Complex instanceof $example.ComplexT, true, 'result is $example.ComplexT');
            equal(ret.Complex2.Complex.Name, 'Hello World', 'Name failed');
            equal(ret.Complex2.Complex.Description, 'desc', 'Description failed');
            equal(ret.Complex2.Complex.Age, 42, 'Age failed');
            equal(ret.Complex2.Complex.Created.valueOf(), new Date('2000/01/01 01:01:01').valueOf(), 'Created failed');
            start();
        });
    });
});
test("FunctionImport - FuncComplex3ResArray", 45, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplex3ResArray('Hello World', function (result) {
            for (var i = 0; i < 5; i++) {
                var ret = result[i];
                equal(ret instanceof $example.ComplexTWithCC, true, 'result is $example.ComplexTWithCC');
                equal(ret.Title, 'Hello World' + i, 'Title failed');

                equal(ret.Complex2 instanceof $example.ComplexTWithComplex, true, 'result is $example.ComplexTWithComplex');
                equal(ret.Complex2.Title, 'Hello World' + i, 'Title failed');

                equal(ret.Complex2.Complex instanceof $example.ComplexT, true, 'result is $example.ComplexT');
                equal(ret.Complex2.Complex.Name, 'Hello World' + i, 'Name failed');
                equal(ret.Complex2.Complex.Description, 'desc', 'Description failed');
                equal(ret.Complex2.Complex.Age, i, 'Age failed');
                equal(ret.Complex2.Complex.Created.valueOf(), new Date((2000 + i).toString() + '/01/01 01:01:01').valueOf(), 'Created failed');
            }
            start();
        });
    });

});

test("FunctionImport - FuncComplexWithArrayComplexRes", 28, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplexWithArrayComplexRes('Hello World', function (result) {
            equal(result instanceof $example.ComplexTWithArrayComplex, true, 'result is $example.ComplexTWithArrayComplex');
            equal(result.Title, 'Hello World', 'Title failed');
            equal(result.Complex instanceof Array, true, 'result.Complex is Array');

            for (var i = 0; i < 5; i++) {
                var ret = result.Complex[i];
                equal(ret instanceof $example.ComplexT, true, 'ret is $example.ComplexT');
                equal(ret.Name, 'Hello World' + i, 'Name failed');
                equal(ret.Description, 'desc', 'Description failed');
                equal(ret.Age, i, 'Age failed');
                equal(ret.Created.valueOf(), new Date((2000 + i).toString() + '/01/01 01:01:01').valueOf(), 'Created failed');
            }


            start();
        });
    });
});
test("FunctionImport - FuncComplexWithArrayComplexResArray", 140, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplexWithArrayComplexResArray('Hello World', function (resultArr) {
            for (var i = 0; i < 5; i++) {
                var result = resultArr[i];
                equal(result instanceof $example.ComplexTWithArrayComplex, true, 'result is $example.ComplexTWithArrayComplex');
                equal(result.Title, 'Hello World' + i, 'Title failed');
                equal(result.Complex instanceof Array, true, 'result.Complex is Array');

                for (var j = 0; j < 5; j++) {
                    var ret = result.Complex[j];
                    equal(ret instanceof $example.ComplexT, true, 'ret is $example.ComplexT');
                    equal(ret.Name, 'Hello World' + i + j, 'Name failed');
                    equal(ret.Description, 'desc', 'Description failed');
                    equal(ret.Age, i + j, 'Age failed');
                    equal(ret.Created.valueOf(), new Date((2000 + i + j).toString() + '/01/01 01:01:01').valueOf(), 'Created failed');
                }
            }
            start();
        });
    });
});

test("FunctionImport - FuncComplexMultiRes", 44, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplexMultiRes('Hello World', function (result) {
            equal(result instanceof $example.ComplexTWithCCAndArrayC, true, 'result is $example.ComplexTWithCCAndArrayC');
            equal(result.Title, 'Hello World', 'Title failed');
            equal(result.Complex2Arr instanceof Array, true, 'result.Complex is Array');
            equal(result.Complex instanceof $example.ComplexT, true, 'result.Complex is $exampleSrv.ComplexT');

            equal(result.Complex instanceof $example.ComplexT, true, 'ret is $example.ComplexT');
            equal(result.Complex.Name, 'Hello World', 'Name failed');
            equal(result.Complex.Description, 'desc', 'Description failed');
            equal(result.Complex.Age, 42, 'Age failed');
            equal(result.Complex.Created.valueOf(), new Date('2000/01/01 01:01:01').valueOf(), 'Created failed');

            for (var i = 0; i < 5; i++) {
                var ret = result.Complex2Arr[i];
                equal(ret instanceof $example.ComplexTWithComplex, true, 'ret is $example.ComplexTWithComplex');
                equal(ret.Title, 'Hello World', 'Name failed');


                equal(ret.Complex instanceof $example.ComplexT, true, 'ret is $example.ComplexT');
                equal(ret.Complex.Name, 'Hello World' + i, 'Name failed');
                equal(ret.Complex.Description, 'desc', 'Description failed');
                equal(ret.Complex.Age, i, 'Age failed');
                equal(ret.Complex.Created.valueOf(), new Date((2000 + i).toString() + '/01/01 01:01:01').valueOf(), 'Created failed');
            }


            start();
        });
    });
});
test("FunctionImport - FuncComplexMultiResArray", 220, function () {
    stop();

    var context = $example.FuncContext.getContext();
    context.onReady(function () {
        context.FuncComplexMultiResArray('Hello World', function (resultArr) {
            for (var i = 0; i < 5; i++) {
                var result = resultArr[i];
                equal(result instanceof $example.ComplexTWithCCAndArrayC, true, 'result is $example.ComplexTWithCCAndArrayC');
                equal(result.Title, 'Hello World' + i, 'Title failed');
                equal(result.Complex2Arr instanceof Array, true, 'result.Complex is Array');
                equal(result.Complex instanceof $example.ComplexT, true, 'result.Complex is $exampleSrv.ComplexT');

                equal(result.Complex instanceof $example.ComplexT, true, 'ret is $example.ComplexT');
                equal(result.Complex.Name, 'Hello World' + i, 'Name failed');
                equal(result.Complex.Description, 'desc', 'Description failed');
                equal(result.Complex.Age, i, 'Age failed');
                equal(result.Complex.Created.valueOf(), new Date((2000 + i).toString() + '/01/01 01:01:01').valueOf(), 'Created failed');

                for (var j = 0; j < 5; j++) {
                    var ret = result.Complex2Arr[j];
                    equal(ret instanceof $example.ComplexTWithComplex, true, 'ret is $example.ComplexTWithComplex');
                    equal(ret.Title, 'Hello World', 'Name failed');


                    equal(ret.Complex instanceof $example.ComplexT, true, 'ret is $example.ComplexT');
                    equal(ret.Complex.Name, 'Hello World' + i + j, 'Name failed');
                    equal(ret.Complex.Description, 'desc', 'Description failed');
                    equal(ret.Complex.Age, i + j, 'Age failed');
                    equal(ret.Complex.Created.valueOf(), new Date((2000 + i + j).toString() + '/01/01 01:01:01').valueOf(), 'Created failed');
                }
            }
            start();
        });
    });
});

test("REST - GET JSONP", 9, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context = $example.Context.getContext({ oDataServiceHost: ('http://' + location.host + $example.Context.generateTestData.serviceurl).replace('3001', '3002'), enableJSONP: true });
        context.onReady(function () {
            context.Orders.toArray(function (orders) {
                var order = orders[0];

                equal(order.Date instanceof Date, true, 'date result failed');
                ok(order.Date > new Date(1980), true, 'date result value failed');
                equal(typeof order.Completed, 'boolean', 'bool result failed');
                equal(typeof order.Value, 'number', 'int result failed');
                equal(typeof order.Id, 'string', 'id result failed');
                notEqual(order.Id.indexOf("'"), 0, 'id result failed');

                equal(typeof order.Data, 'object', 'Data result failed');
                equal(typeof order.Data.a, 'number', 'Data.a result failed');
                equal(typeof order.Data.b, 'number', 'Data.b result failed');

                start();
            });
        });
    });
});

test("REST - load all fields on create - single", 7, function () {

    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        var item = new $example.TestItemComputed({ Id: $data.parseGuid('c33bd325-afa9-4941-b21b-bf398f8a2dac'), Name: 'testName' });

        context.add(item);

        context.saveChanges(function () {
            //item props
            equal(item.Id, 'c33bd325-afa9-4941-b21b-bf398f8a2dac', 'GuidField property');
            equal(item.Name, 'testName', 'Name property');
            equal(item.Index, 42, 'Index property');
            equal(item.GuidField, '7b33e20d-3cca-4452-b3e2-eca9525377a1', 'GuidField property');
            equal(item.DateField.valueOf(), new Date('2012').valueOf(), 'DateField property');
            equal(item.BoolField, true, 'BoolField property');
            deepEqual(item.ObjectField, { work: 'item', computed: 'field' }, 'ObjectField property');

            $example.TestItemComputed.removeAll().then(function () {
                start();
            });
        });
    });
});

test("REST - load all fields on create - batch", 14, function () {

    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        var item = new $example.TestItemComputed({ Id: $data.parseGuid('c33bd325-afa9-4941-b21b-bf398f8a2dac'), Name: 'testName' });
        var item2 = new $example.TestItemComputed({ Id: $data.parseGuid('7eeb43b5-752f-4fc6-8f77-665e1ad48a9b') }); 2

        context.add(item);
        context.add(item2);

        context.saveChanges(function () {
            //item props
            equal(item.Id, 'c33bd325-afa9-4941-b21b-bf398f8a2dac', 'GuidField property');
            equal(item.Name, 'testName', 'Name property');
            equal(item.Index, 42, 'Index property');
            equal(item.GuidField, '7b33e20d-3cca-4452-b3e2-eca9525377a1', 'GuidField property');
            equal(item.DateField.valueOf(), new Date('2012').valueOf(), 'DateField property');
            equal(item.BoolField, true, 'BoolField property');
            deepEqual(item.ObjectField, { work: 'item', computed: 'field' }, 'ObjectField property');

            equal(item2.Id, '7eeb43b5-752f-4fc6-8f77-665e1ad48a9b', 'GuidField property');
            equal(item2.Name, 'default Name', 'Name property');
            equal(item2.Index, 42, 'Index property');
            equal(item2.GuidField, '7b33e20d-3cca-4452-b3e2-eca9525377a1', 'GuidField property');
            equal(item2.DateField.valueOf(), new Date('2012').valueOf(), 'DateField property');
            equal(item2.BoolField, true, 'BoolField property');
            deepEqual(item.ObjectField, { work: 'item', computed: 'field' }, 'ObjectField property');

            $example.TestItemComputed.removeAll().then(function () {
                start();
            });
        });
    });
});

test("REST - $value", 10, function () {
    stop(5);

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {

        context.Orders.first(undefined, undefined, function (order) {
            equal(order.getFieldUrl('Id'), $example.Context.generateTestData.serviceurl + "/Orders('" + order.Id + "')/Id/$value", 'Id property url compiled');
            equal(order.getFieldUrl('Value'), $example.Context.generateTestData.serviceurl + "/Orders('" + order.Id + "')/Value/$value", 'Value property url compiled');
            equal(order.getFieldUrl('Date'), $example.Context.generateTestData.serviceurl + "/Orders('" + order.Id + "')/Date/$value", 'Date property url compiled');
            equal(order.getFieldUrl('Completed'), $example.Context.generateTestData.serviceurl + "/Orders('" + order.Id + "')/Completed/$value", 'Completed property url compiled');
            equal(order.getFieldUrl('Data'), $example.Context.generateTestData.serviceurl + "/Orders('" + order.Id + "')/Data/$value", 'Data property url compiled');

            OData.request({ requestUri: order.getFieldUrl('Id'), method: 'GET' }, function (data) {
                equal(data, order.Id, 'Id from request');
                start();
            }, function () {
                console.log(JSON.stringify(arguments));
                stop();
            });

            OData.request({ requestUri: order.getFieldUrl('Value'), method: 'GET' }, function (data) {
                equal(data, order.Value, 'Value from request');
                start();
            }, function () {
                console.log(JSON.stringify(arguments));
                stop();
            });

            OData.request({ requestUri: order.getFieldUrl('Date'), method: 'GET' }, function (data) {
                equal(data, order.Date.toISOString().replace('Z', ''), 'Date from request');
                start();
            }, function () {
                console.log(JSON.stringify(arguments));
                stop();
            });

            OData.request({ requestUri: order.getFieldUrl('Completed'), method: 'GET' }, function (data) {
                equal(data, order.Completed.toString(), 'Completed from request');
                start();
            }, function () {
                console.log(JSON.stringify(arguments));
                stop();
            });

            OData.request({ requestUri: order.getFieldUrl('Data'), method: 'GET' }, function (data) {
                equal(data, JSON.stringify(order.Data), 'Data from request');
                start();
            }, function () {
                console.log(JSON.stringify(arguments));
                stop();
            });
        });
    });
});
