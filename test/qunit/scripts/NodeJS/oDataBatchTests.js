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

$data.Class.define('$example.Context', $data.EntityContext, null, {
    People: { type: $data.EntitySet, elementType: $example.Person },
    Orders: { type: $data.EntitySet, elementType: $example.Order },
    Places: { type: $data.EntitySet, elementType: $example.Place },
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
            ctx.Orders.add({ Value: i * 1000, Date: new Date((2000 + i) + '/01/01'), Completed: i % 2 });
            if ($data.storageProviders.mongoDBPro) ctx.Places.add({ Name: 'Place' + i, Location: new $data.GeographyPoint([i / 100, i / 100]) });
        }

        ctx.saveChanges(callback);
    });
};

$example.Context.generateTestData.itemsInTables = 10;
$example.Context.getContext = function () {
    var ctx = new $example.Context({ name: 'oData', oDataServiceHost: "http://127.0.0.1:3001/testservice" });
    return ctx;
};

exports.Tests = {
    'deleteDataFromDb': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {

            context.People.toArray(function (p) {
                context.Orders.toArray(function (o) {
                    test.equal(p.length, 0, 'People count failed');
                    test.equal(o.length, 0, 'Orders count failed');

                    test.done();
                });
            });

        });
    },
    'insert full entity': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {
            var p = new $example.Person({ Name: 'John', Description: 'Desc', Age: 42 });
            var p1 = new $example.Person({ Name: 'John1', Description: 'Desc1', Age: 42 });
            context.People.add(p);
            context.People.add(p1);
            context.saveChanges({
                success: function () {
                    context.People.toArray(function (res) {
                        test.equal(res.length, 2, 'result count failed');

                        for (var i = 0; i < res.length; i++) {
                            if(res[i].Name === 'John')
                                test.deepEqual(res[i].initData, p.initData, 'full entity save failed');
                        }
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
    },
    'generateTestData - insert elements': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {

            context.People.toArray(function (p) {
                context.Orders.toArray(function (o) {
                    test.equal(p.length, $example.Context.generateTestData.itemsInTables, 'People count failed');
                    test.equal(o.length, $example.Context.generateTestData.itemsInTables, 'Orders count failed');

                    test.done();
                });
            });

        });
    },
    'update with full entity': function (test) {
        test.expect(3);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {
            context.People.toArray(function (res) {
                var key = res[0].Id;
                test.notEqual(res[0].Name, 'New name', 'init value failed');

                var item = res[0];
                context.People.attach(item);
                item.Name = 'New name';
                context.saveChanges({
                    success: function () {
                        context.People.filter(function (p) { return p.Id == this.key; }, { key: key }).toArray({
                            success: function (res2) {
                                test.deepEqual(res2[0].initData, item.initData, 'full entity update failed');
                                test.equal(res2[0].Name, 'New name', 'updated property failed');

                                test.done();
                            }, error: function (e) {
                                console.log(e);

                                test.ok(false, 'test failed: ' + e)
                                test.done();
                            }
                        });
                    }, error: function () {
                        test.ok(false, 'test save failed: ' + e)
                        test.done();
                    }
                });
            });
        });
    },
    'update with partial entity': function (test) {
        test.expect(3);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {
            context.People.toArray(function (res) {
                var key = res[0].Id;
                test.notEqual(res[0].Name, 'New name', 'init value failed');

                var item = new $example.Person({ Id: key });
                context.People.attach(item);
                item.Name = 'New name';

                context.saveChanges({
                    success: function () {
                        context.People.filter(function (p) { return p.Id == this.key; }, { key: key }).toArray({
                            success: function (res2) {
                                test.notDeepEqual(res2[0].initData, item.initData, 'full entity update failed');
                                test.equal(res2[0].Name, 'New name', 'updated property failed');

                                test.done();
                            }, error: function (e) {
                                test.ok(false, 'test failed: ' + e)
                                test.done();
                            }
                        });
                    }, error: function () {
                        test.ok(false, 'test failed: ' + e)
                        test.done();
                    }
                });
            });
        });
    },
    'update with partial entity without set boolean': function (test) {
        test.expect(4);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {
            context.Orders.filter(function (o) { return o.Completed == true; }).toArray(function (res) {
                var key = res[0].Id;
                test.equal(res[0].Completed, true, 'init value failed');

                var item = new $example.Order({ Id: key });
                context.Orders.attach(item);
                item.Value = 1337;

                context.saveChanges({
                    success: function () {
                        context.Orders.filter(function (p) { return p.Id == this.key; }, { key: key }).toArray({
                            success: function (res2) {
                                test.notDeepEqual(res2[0].initData, item.initData, 'full entity update failed');
                                test.equal(res2[0].Value, 1337, 'updated property failed');
                                test.equal(res2[0].Completed, true, 'undefined updated property failed');

                                test.done();
                            }, error: function () {
                                test.ok(false, 'test failed: ' + e)
                                test.done();
                            }
                        });
                    }, error: function () {
                        test.ok(false, 'test failed: ' + e)
                        test.done();
                    }
                });
            });
        });
    },
    'delete with full entity': function (test) {
        test.expect(1);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {
            context.People.toArray(function (res) {
                var key = res[0].Id
                context.People.remove(res[0]);
                context.saveChanges({
                    success: function () {
                        context.People.filter(function (p) { return p.Id == this.key; }, { key: key }).toArray({
                            success: function (res2) {

                                test.equal(res2.length, 0, 'delete entity failed');
                                test.done();

                            }, error: function (e) {
                                test.ok(false, 'test failed: ' + e)
                                test.done();
                            }
                        });
                    }, error: function () {
                        test.ok(false, 'test failed: ' + e)
                        test.done();
                    }
                });
            });
        });
    },
    'delete with partial entity': function (test) {
        test.expect(1);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {
            context.People.toArray(function (res) {
                var key = res[0].Id
                context.People.remove({ Id: key });
                context.saveChanges({
                    success: function () {
                        context.People.filter(function (p) { return p.Id == this.key; }, { key: key }).toArray({
                            success: function (res2) {

                                test.equal(res2.length, 0, 'delete entity failed');
                                test.done();

                            }, error: function (e) {
                                test.ok(false, 'test failed: ' + e)
                                test.done();
                            }
                        });
                    }, error: function () {
                        test.ok(false, 'test failed: ' + e)
                        test.done();
                    }
                });
            });
        });
    },
    'entity without bool value': function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {
            var order = new $example.Order({ Value: 42 });
            var order2 = new $example.Order({ Value: 43, Completed: null });
            context.add(order);
            context.add(order2);
            context.saveChanges({
                success: function () {
                    context.Orders.toArray({
                        success: function (orders) {

                            for (var i = 0; i < orders.length; i++) {
                                var o = orders[i];
                                if (o.Completed === null)
                                    test.equal(o.Completed, null, 'order Completed failed');
                                else
                                    test.equal(o.Completed, undefined, 'order Completed failed');
                            }

                            test.done();
                        }, error: function () {
                            test.ok(false, 'test failed: ' + e)
                            test.done();
                        }
                    });
                }, error: function () {
                    test.ok(false, 'test failed: ' + e)
                    test.done();
                }
            });

        });
    },
    'update without bool value': function (test) {
        test.expect(3);

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {
            var order = new $example.Order({ Value: 42, Completed: true });
            context.add(order);
            context.saveChanges({
                success: function () {
                    context.Orders.toArray({
                        success: function (orders) {

                            var o = orders[0];
                            test.equal(o.Completed, true, 'order Completed failed');
                            var editedO = new $example.Order({ Id: o.Id });
                            context.attach(editedO);
                            editedO.Value = 84;

                            context.saveChanges({
                                success: function () {
                                    context.Orders.toArray({
                                        success: function (orders2) {

                                            test.equal(orders2[0].Completed, true, 'order Completed after update failed');
                                            test.equal(orders2[0].Value, 84, 'order update failed');

                                            test.done();

                                        }, error: function () {
                                            test.ok(false, 'test failed: ' + e)
                                            test.done();
                                        }
                                    });
                                }, error: function () {
                                    test.ok(false, 'test failed: ' + e)
                                    test.done();
                                }
                            });
                        }, error: function () {
                            test.ok(false, 'test failed: ' + e)
                            test.done();
                        }
                    });
                }, error: function () {
                    test.ok(false, 'test failed: ' + e)
                    test.done();
                }
            });

        });
    },
    'entity date value': function (test) {
        test.expect(2);
        var date = new Date();

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {
            var order = new $example.Order({ Date: date });
            context.add(order);
            context.saveChanges({
                success: function () {
                    context.Orders.toArray({
                        success: function (orders) {

                            var o = orders[0];
                            test.equal(o.Date.valueOf(), date.valueOf(), 'order Date failed');
                            var editedO = new $example.Order({ Id: o.Id });
                            context.attach(editedO);
                            var date2 = new Date('2000/05/05');
                            editedO.Date = date2;

                            context.saveChanges({
                                success: function () {
                                    context.Orders.toArray({
                                        success: function (orders2) {

                                            test.equal(orders2[0].Date.valueOf(), date2.valueOf(), 'order Date after update failed');

                                            test.done();

                                        }, error: function () {
                                            test.ok(false, 'test failed: ' + e)
                                            test.done();
                                        }
                                    });
                                }, error: function () {
                                    test.ok(false, 'test failed: ' + e)
                                    test.done();
                                }
                            });
                        }, error: function () {
                            test.ok(false, 'test failed: ' + e)
                            test.done();
                        }
                    });
                }, error: function () {
                    test.ok(false, 'test failed: ' + e)
                    test.done();
                }
            });

        });
    },
    'entity without date value': function (test) {
        test.expect(2);
        var date = new Date();

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {
            var order = new $example.Order({ Value: 42 });
            context.add(order);
            context.saveChanges({
                success: function () {
                    context.Orders.toArray({
                        success: function (orders) {

                            var o = orders[0];
                            test.equal(o.Date, null, 'order Date failed');
                            var editedO = new $example.Order({ Id: o.Id });
                            context.attach(editedO);
                            editedO.Date = date;

                            context.saveChanges({
                                success: function () {
                                    context.Orders.toArray({
                                        success: function (orders2) {

                                            test.equal(orders2[0].Date.valueOf(), date.valueOf(), 'order Date after update failed');

                                            test.done();

                                        }, error: function () {
                                            test.ok(false, 'test failed: ' + e)
                                            test.done();
                                        }
                                    });
                                }, error: function () {
                                    test.ok(false, 'test failed: ' + e)
                                    test.done();
                                }
                            });
                        }, error: function () {
                            test.ok(false, 'test failed: ' + e)
                            test.done();
                        }
                    });
                }, error: function () {
                    test.ok(false, 'test failed: ' + e)
                    test.done();
                }
            });

        });
    },

    'CUD in one batch': function (test) {
        test.expect(11);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {
            context.People.toArray(function (res) {
                context.Orders.filter('it.Completed == true').toArray(function (ores) {
                    var dkey = res[0].Id
                    context.People.remove(res[0]);

                    var ukey = ores[0].Id
                    context.Orders.attach(ores[0]);
                    ores[0].Value = 1337;

                    var ukey2 = ores[1].Id
                    test.equal(ores[1].Completed, true, 'ores[1].Completed value failed');
                    var item = new $example.Order({ Id: ores[1].Id })
                    context.Orders.attach(item);
                    item.Value = 1337;

                    context.Orders.add({ Value: 1337, Date: new Date('1999/12/12'), Completed: false });

                    context.saveChanges({
                        success: function () {
                            context.People.filter(function (p) { return p.Id == this.key; }, { key: dkey }).toArray({
                                success: function (p) {
                                    context.Orders.filter(function (p) { return p.Value == 1337; }).toArray({
                                        success: function (o) {
                                            test.equal(p.length, 0, 'delete entity failed');
                                            test.equal(o.length, 3, 'Orders result failed');

                                            for (var i = 0; i < o.length; i++) {
                                                var order = o[i];
                                                switch (order.Id) {
                                                    case ukey:
                                                        test.deepEqual(order.initData, ores[0].initData, 'full entity Update failed');
                                                        test.equal(ores[0].Value, 1337, 'full entity Value field failed');
                                                        break;
                                                    case ukey2:
                                                        test.notDeepEqual(order.initData, item.initData, 'partial entity Update failed');
                                                        test.equal(order.Value, 1337, 'partial entity Value field failed');
                                                        test.equal(order.Completed, true, 'partial entity Completed field failed');
                                                        break;
                                                    default:
                                                        test.equal(order.Value, 1337, 'new entity Value field failed');
                                                        test.equal(order.Date.valueOf(), new Date('1999/12/12').valueOf(), 'new entity Date field failed');
                                                        test.equal(order.Completed, false, 'new entity Completed field failed');
                                                        break;
                                                }
                                            }


                                            test.done();

                                        }, error: function (e) {
                                            test.ok(false, 'test failed: ' + e)
                                            test.done();
                                        }
                                    });
                                }, error: function () {
                                    test.ok(false, 'test failed: ' + e)
                                    test.done();
                                }
                            });
                        }, error: function () {
                            test.ok(false, 'test failed: ' + e)
                            test.done();
                        }
                    });
                });
            });
        });
    },
    'updateMany People': function (test) {
        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {
            context.People.toArray(function (res) {
                var length = res.length;
                test.expect(2 * length + 1);


                for (var i = 0; i < res.length; i++) {
                    context.People.attach(res[i]);
                    res[i].Name = 'hello world' + i;
                    res[i].Age = 42
                }

                context.saveChanges({
                    success: function () {
                        context.People.toArray(function (res2) {
                            test.equal(res2.length, length, 'result count failed');

                            for (var i = 0; i < res2.length; i++) {
                                test.equal(res2[i].Age, 42, 'modified Age failed');
                                test.equal(res2[i].Name.slice(0, 11), 'hello world', 'modified Age failed');
                            }

                            test.done();

                        });
                    }

                });

            });
        });
    },
    'updateMany Orders': function (test) {
        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {
            context.Orders.toArray(function (res) {
                var length = res.length;
                test.expect(2 * length + 1);


                for (var i = 0; i < res.length; i++) {
                    context.Orders.attach(res[i]);
                    res[i].Completed = true;
                    res[i].Value = 42
                }

                context.saveChanges({
                    success: function () {
                        context.Orders.toArray(function (res2) {
                            test.equal(res2.length, length, 'result count failed');

                            for (var i = 0; i < res2.length; i++) {
                                test.equal(res2[i].Completed, true, 'modified Completed failed');
                                test.equal(res2[i].Value, 42, 'modified Value failed');
                            }

                            test.done();

                        });
                    }

                });

            });
        });
    },
    'CUD in one big batch many entity': function (test) {
        var scale = 4
        test.expect(scale + 2);

        var context = $example.Context.getContext();
        $example.Context.deleteData(context, function () {

            var date = new Date();
            for (var i = 0; i < scale; i++) {
                context.People.add({ Name: 'Person' + i, Description: 'desc' + i, Age: i });
                context.Orders.add({ Value: i, Date: date, Completed: i % 2 ? true : false });
            }

            context.saveChanges({
                success: function () {
                    context.People.toArray({
                        success: function (p) {
                            context.Orders.toArray({
                                success: function (o) {

                                    for (var i = 0; i < scale / 2; i++) {
                                        context.People.remove(p[i]);
                                        context.Orders.attach(o[i]);
                                        o[i].Value += 1000;
                                    }

                                    for (var i = scale / 2; i < scale; i++) {
                                        context.Orders.remove(o[i]);
                                        context.People.attach(p[i]);
                                        p[i].Age += 1000;
                                        //console.log(p[i].Age, p[i].Age >= 1000, p[i].initData, p[i].entityState);
                                    }

                                    for (var i = 0; i < scale / 4; i++) {
                                        context.People.add({ Name: '2Person' + i, Description: 'desc' + i, Age: i });
                                        context.Orders.add({ Value: i + 500, Date: date, Completed: i % 2 ? true : false });
                                    }

                                    context.saveChanges({
                                        success: function () {
                                            context.People.orderByDescending('it.Age').toArray({
                                                success: function (p2) {
                                                    context.Orders.orderByDescending('it.Value').toArray({
                                                        success: function (o2) {

                                                            test.equal(p2.length, scale / 4 * 3, 'Perople result length failed')
                                                            test.equal(o2.length, scale / 4 * 3, 'Orders result length failed')

                                                            for (var i = 0; i < scale / 2; i++) {
                                                                //console.log(p2[i].Age, p2[i].Age >= 1000, p2[i].initData);
                                                                test.ok(p2[i].Age >= 1000, 'edited person failed');
                                                                //console.log(o2[i].Value, o2[i].Value >= 1000);
                                                                test.ok(o2[i].Value >= 1000, 'edited order failed');
                                                            }

                                                            test.done();

                                                        }, error: function () {
                                                            test.ok(false, 'test failed: ' + e)
                                                            test.done();
                                                        }
                                                    });
                                                }, error: function () {
                                                    test.ok(false, 'test failed: ' + e)
                                                    test.done();
                                                }
                                            });
                                        }, error: function () {
                                            test.ok(false, 'test failed: ' + e)
                                            test.done();
                                        }
                                    });
                                }, error: function (e) {
                                    test.ok(false, 'test failed: ' + e)
                                    test.done();
                                }
                            });
                        }, error: function () {
                            test.ok(false, 'test failed: ' + e)
                            test.done();
                        }
                    });
                }, error: function () {
                    test.ok(false, 'test failed: ' + e)
                    test.done();
                }
            });
        });
    }

};

if ($data.storageProviders.mongoDBPro){
    exports.Tests.getGeoDataFromDb = function (test) {
        test.expect(1);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {

            context.Places.toArray(function (p) {
                test.equal(p.length, $example.Context.generateTestData.itemsInTables, 'Places count failed');
                test.done();
            }).fail(function(err){
                test.ok(false, 'Query failed');
                test.done();
            });

        });
    };
    exports.Tests.filterGeoDataFromDb = function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {

            //console.log(context.Places.filter(function(it){ return it.Location.distance(this.point) < 0.0004 }, { point: new $data.GeographyPoint([0.01, 0.01]) }).toTraceString());
            console.log('filterGeoDataFromDb');
            context.Places.filter(function(it){ return it.Location.distance(this.point) < 0.0004 }, { point: new $data.GeographyPoint([0.01, 0.01]) })
            .orderByDescending('it.Name')
            .toArray(function (p) {
                test.equal(p.length, 3, 'Places count failed');
                //console.log(p.map(function(it){ return it.initData.Location; }));
                test.deepEqual(p.map(function(it){ return it.initData.Location; }), [
                    {
                        type: 'Point',
                        coordinates: [0.02, 0.02],
                        crs: { properties: { name: 'EPSG:4326' }, type: 'name' }
                    }, {
                        type: 'Point',
                        coordinates: [0.01, 0.01],
                        crs: { properties: { name: 'EPSG:4326' }, type: 'name' }
                    }, {
                        type: 'Point',
                        coordinates: [0, 0],
                        crs: { properties: { name: 'EPSG:4326' }, type: 'name' }
                    }
                ], 'Bad places filtered');
                test.done();
            }).fail(function(err){
                console.log(JSON.parse(err.data[0].response.body).error);
            });

        });
    };
    
    exports.Tests.orderGeoDataFromDb = function (test) {
        test.expect(2);

        var context = $example.Context.getContext();
        $example.Context.generateTestData(context, function () {

            //console.log(context.Places.filter(function(it){ return it.Location.distance(this.point) < 0.0004 }, { point: new $data.GeographyPoint([0.01, 0.01]) }).toTraceString());
            context.Places.filter(function(it){ return it.Location.distance(this.point) < 0.0004 }, { point: new $data.GeographyPoint([0.01, 0.01]) })
            .orderBy(function(it){ return it.Location.distance(this.point); }, { point: new $data.GeographyPoint([0.01, 0.01]) })
            .toArray(function (p) {
                test.equal(p.length, 3, 'Places count failed');
                //console.log(p.map(function(it){ return it.initData.Location; }));
                test.deepEqual(p.map(function(it){ return it.initData.Location; }), [
                    {
                        type: 'Point',
                        coordinates: [0, 0],
                        crs: { properties: { name: 'EPSG:4326' }, type: 'name' }
                    }, {
                        type: 'Point',
                        coordinates: [0.02, 0.02],
                        crs: { properties: { name: 'EPSG:4326' }, type: 'name' }
                    }, {
                        type: 'Point',
                        coordinates: [0.01, 0.01],
                        crs: { properties: { name: 'EPSG:4326' }, type: 'name' }
                    }
                ], 'Bad places filtered');
                test.done();
            }).fail(function(err){
                console.log(JSON.parse(err.data[0].response.body).error);
            });

        });
    };
}
