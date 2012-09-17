
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
    Location: { type: 'geo' }
});

$data.Class.define('$example.Context', $data.EntityContext, null, {
    People: { type: $data.EntitySet, elementType: $example.Person },
    Orders: { type: $data.EntitySet, elementType: $example.Order },
    Places: { type: $data.EntitySet, elementType: $example.Place },
    FuncStrParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncStrParam', returnType: $data.String, params: [{ a: $data.String }] }),
    FuncIntParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncIntParam', returnType: $data.Integer, params: [{ a: $data.Integer }] }),
    FuncNumParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncNumParam', returnType: $data.Number, params: [{ a: $data.Number }] }),
    FuncObjParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncObjParam', returnType: $data.Object, params: [{ a: $data.Object }] }),
    FuncArrParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncArrParam', returnType: $data.Object, params: [{ a: $data.Array }] }),
    FuncArrParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncArrParam', returnType: $data.Object, params: [{ a: $data.Array }] }),
    FuncBoolParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncBoolParam', returnType: $data.Boolean, params: [{ a: $data.Boolean }] }),
    FuncDateParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncDateParam', returnType: $data.Date, params: [{ a: $data.Date }] }),
    FuncGeographyParam: $data.EntityContext.generateServiceOperation({ serviceName: 'FuncGeographyParam', returnType: $data.Geography, params: [{ a: $data.Geography }] }),

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
                    for (var i = 0; i < p.length; i++) {
                        ctx.People.remove(p[i]);
                    }
                    for (var i = 0; i < o.length; i++) {
                        ctx.Orders.remove(o[i]);
                    }
                    for (var i = 0; i < pl.length; i++) {
                        ctx.Places.remove(pl[i]);
                    }
                    ctx.saveChanges(function () {
                        if (o.length >= $example.Context.generateTestData.itemsInTables || p.length >= $example.Context.generateTestData.itemsInTables) {
                            $example.Context.deleteData(ctx, callback);
                        } else {
                            callback.success();
                        }
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
            ctx.Places.add({ Name: 'Places' + i, Location: new $data.Geography(123.15697, i) });
        }

        ctx.saveChanges(callback);
    });
};

$example.Context.generateTestData.serviceurl = '/testservice';
$example.Context.generateTestData.itemsInTables = 10;
$example.Context.getContext = function () {
    var ctx = new $example.Context({ name: 'oData', oDataServiceHost: $example.Context.generateTestData.serviceurl, serviceUrl: $example.Context.generateTestData.serviceurl, user: 'asd', password: 'asd' });
    return ctx;
};

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
                console.log(data);
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
                console.log(data);
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
                console.log(data);
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
                console.log(data);
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
                console.log(data);
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
                console.log(data);
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
                console.log(data);
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
        var place = new $example.Place({ Name: 'Headquarter', Location: new $data.Geography(-44.001536, 44.35433) });

        context.Places.add(place);

        context.saveChanges({
            success: function () {

                context.Places.toArray(function (places) {

                    equal(places.length, 1, 'result length failed');
                    equal(places[0].Id, place.Id, 'loaded Id failed');

                    equal(places[0].Location instanceof $data.Geography, true, 'Geo type type failed');
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
            place.Location = new $data.Geography(23.153, -16.138135);
            place.Name = 'Jay location';

            context.saveChanges(function () {
                context.Places.filter('it.Name == "Jay location"').single(null, null, function (placeRes) {

                    equal(placeRes.Id, place.Id, 'loaded Id failed');

                    equal(placeRes.Location instanceof $data.Geography, true, 'Geo type type failed');
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
        context.Places.filter(function (p) { return p.Location == this.geo }, { geo: new $data.Geography(123.15697, 1) }).toArray(function (places) {
            equal(places.length, 1, 'filter for Geography ?!');
            equal(places[0].Location.longitude, 123.15697, 'Location.longitude failed');
            equal(places[0].Location.latitude, 1, 'Location.latitude failed');

            start();
        });
    });
});

test("Filter Geography not equal", 19, function () {
    stop();

    var context = $example.Context.getContext();
    $example.Context.generateTestData(context, function () {
        context.Places.filter(function (p) { return p.Location != this.geo }, { geo: new $data.Geography(123.15697, 1) }).toArray(function (places) {
            equal(places.length, 9, 'not filter for Geography ?!');
            for (var i = 0; i < 9; i++) {
                equal(places[i].Location.longitude, 123.15697, 'Location.longitude failed');
                notEqual(places[i].Location.latitude, 1, 'Location.latitude failed');
            }
            

            start();
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
