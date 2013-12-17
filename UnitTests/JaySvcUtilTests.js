$(document).ready(function () {
    if (typeof XSLTProcessor == "undefined" && window.ActiveXObject === undefined) { 
        module("JaySvcUtilTests");
        test('XSLTProcessor is not enable', 1, function () {
            ok(false, 'JaySvcUtil.js is not supported!!');
        });
    } else {
        metadataTests({ name: "sqLite", databaseName: 'kendoTests', oDataServiceHost: "/Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
    }
});

function metadataTests(providerConfig, msg) {
    module("JaySvcUtilTests" + (msg ? msg : ''));

    test('factory test', 10, function () {
        stop();

        var orig = $data.MetadataLoader.debugMode;
        $data.MetadataLoader.debugMode = true;
        $data.MetadataLoader.factoryCache = {};

        $data.MetadataLoader.load('/Services/emptyNewsReader.svc', {
            success: function (f, type, code) {

                equal(typeof f, 'function', 'factory is function');
                equal(typeof type, 'function', 'type is function');
                equal(typeof code, 'string', 'code is string');

                var ctx = f();
                ok(ctx instanceof $data.EntityContext, 'factory return $data.EntityContext');
                ok(type.isAssignableTo($data.EntityContext), 'type is extends $data.EntityContext');
                ok(ctx instanceof type, 'context instance of type ');
                ok(Object.keys($data.MetadataLoader.factoryCache).length > 0, 'factory cache has record')

                $data.MetadataLoader.load('/Services/emptyNewsReader.svc', {
                    success: function (f2, type2, code2) {

                        ok(f2 === f, 'factory is same if load again');
                        ok(type2 === type, 'type is same if load again');
                        ok(code2 === undefined, 'code is undefined if load again');

                        $data.MetadataLoader.debugMode = orig;
                        $data.MetadataLoader.factoryCache = {};
                        start();
                    },
                    error: function (e) {
                        ok(false, 'Error: ' + e);
                        $data.MetadataLoader.factoryCache = {};
                        $data.MetadataLoader.debugMode = orig;
                        start();
                    }
                });
            },
            error: function (e) {
                ok(false, 'Error: ' + e);
                $data.MetadataLoader.factoryCache = {};
                $data.MetadataLoader.debugMode = orig;
                start();
            }
        });

    });

    test('factory options test', 6, function () {
        stop();

        var orig = $data.MetadataLoader.debugMode;
        $data.MetadataLoader.debugMode = true;
        $data.MetadataLoader.factoryCache = {};

        $data.MetadataLoader.load('/Services/emptyNewsReader.svc', {
            success: function (f, type, code) {

                var ctx = f();
                ctx.onReady(function () {

                    equal(ctx.storageProvider.providerConfiguration.user, 'John', 'user');
                    equal(ctx.storageProvider.providerConfiguration.password, 'xxx', 'password');
                    equal(ctx.Articles.elementType.fullName.indexOf('test_DefaultNamespace') === 0, true, 'startswidth default namespace');

                    $data.MetadataLoader.factoryCache = {};
                    $data.MetadataLoader.debugMode = orig;

                    var ctx2 = f({ user: 'UserName', password: 'pass', customProp: 'value' });
                    ctx2.onReady(function () {
                        equal(ctx2.storageProvider.providerConfiguration.user, 'UserName', 'user');
                        equal(ctx2.storageProvider.providerConfiguration.password, 'pass', 'password');
                        equal(ctx2.storageProvider.providerConfiguration.customProp, 'value', 'customProp');

                        start();
                    });
                });
            },
            error: function (e) {
                console.log(e);
                ok(false, 'Error: ' + e);
                $data.MetadataLoader.factoryCache = {};
                $data.MetadataLoader.debugMode = orig;
                start();
            }
        }, {
            user: 'John',
            password: 'xxx',
            DefaultNamespace: 'test_DefaultNamespace'
        });

    });

    test('instance test', 4, function () {
        stop();

        var orig = $data.MetadataLoader.debugMode;
        $data.MetadataLoader.debugMode = true;
        $data.MetadataLoader.factoryCache = {};

        $data.MetadataLoader.load('/Services/emptyNewsReader.svc', {
            success: function (f, type, code) {

                var ctx = f();
                ctx.onReady(function () {

                    ok(ctx.Articles instanceof $data.EntitySet, 'Article EntitySet exists');
                    ok(typeof ctx.PrefilteredArticles === 'function', 'ServiceOperation is exists');
                    notEqual(ctx.Articles.elementType.fullName, 'JayData.NewsReader.Article', 'JayData.NewsReader.Article is not a type Name');
                    ok(ctx.Articles.elementType.fullName.indexOf('JayData.NewsReader.Article') > 0, 'JayData.NewsReader.Article is a part of Article\'s type Name');


                    $data.MetadataLoader.factoryCache = {};
                    $data.MetadataLoader.debugMode = orig;
                    start();
                });
            },
            error: function (e) {
                ok(false, 'Error: ' + e);
                $data.MetadataLoader.factoryCache = {};
                $data.MetadataLoader.debugMode = orig;
                start();
            }
        });

    });


    test('factory test', 12, function () {
        stop();
        $data.service('/UnitTests/JaySvcUtil/$metadata.action.xml', function (f, type) {

            var context = f();
            context.onReady(function () {

                var memDef = context.Categories.elementType.getMemberDefinition('AppendDescription');
                equal(memDef.kind, 'method', 'memDef kind is method');
                equal(memDef.method.IsBindable, true, 'memDef is IsBindable');
                equal(memDef.method.returnType, 'Edm.String', 'returnType is Edm.String');
                equal(memDef.method.IsSideEffecting === undefined, true, 'IsSideEffecting is undefined');
                deepEqual(memDef.method.params, [{ name: 'value', type: 'Edm.String' }, { name: 'date', type: 'Edm.DateTime' }], 'params');
                var item = new context.Categories.elementType();
                equal(typeof item.AppendDescription, 'function', 'item.AppendDescription is function');

                memDef = type.getMemberDefinition('Orders');
                equal(typeof memDef.actions, 'object', 'collections has actions');
                equal(memDef.actions['LastModified'].type === $data.ServiceAction, true, 'LastModified is service action');
                equal(memDef.actions['LastModified'].IsSideEffecting, false, 'IsSideEffecting is false');
                equal(memDef.actions['LastModified'].EntitySet, 'Orders', 'EntitySet is Orders');
                equal(memDef.actions['LastModified'].IsBindable, true, 'IsBindable is true');

                equal(typeof context.Orders.LastModified, 'function', 'context.Categories.LastModified is function');

                start();
            });
        });

    });

    test('Inhertiance test', 9, function () {
        stop();

        $data.service('/odatainheritance', { DefaultNamespace: '' }, function (f, type) {

            var context = f();
            context.onReady(function () {

                equal(context.Vehicle instanceof $data.EntitySet, false, 'Vehicle entitySet');

                equal(context.Cars instanceof $data.EntitySet, true, 'Car entitySet');
                equal(context.Cars.elementType.isAssignableTo($data.Entity), true, 'Car is $data.Entity');
                equal(context.Cars.elementType.isAssignableTo(JayData.Models.ODataInheritance.Vehicle), true, 'Car is Vehicle');

                equal(context.Ships instanceof $data.EntitySet, true, 'Ship entitySet');
                equal(context.Ships.elementType.isAssignableTo($data.Entity), true, 'Ship is $data.Entity');
                equal(context.Ships.elementType.isAssignableTo(JayData.Models.ODataInheritance.Ship), true, 'Ship is Vehicle');

                context.Cars.Reset(function () {
                    context.Cars.toArray(function (res) {
                        var car = res[0];

                        equal(car instanceof JayData.Models.ODataInheritance.Car, true, 'result is Car');
                        equal(car instanceof JayData.Models.ODataInheritance.Vehicle, true, 'result is Vehicle');

                        start();
                    });
                });
            });

        }).fail(function(err){
            console.log(err);
            start();
        });
    });

    test('Inhertiance CRUD', 19, function () {
        stop();

        $data.service('/odatainheritance', { DefaultNamespace: '' }, function (f, type) {

            var context = f({ dataServiceVersion: '3.0' });
            context.onReady(function () {
                context.Cars.Reset()
                 //Read
                .then(function () {
                    return context.Cars.toArray(function (res) {
                        equal(res.length, 4, 'result count');
                        equal(res[0] instanceof JayData.Models.ODataInheritance.Vehicle, true, 'result[0] is Vehicle');
                    });
                })
                //Create
                .then(function () {
                    var car = new JayData.Models.ODataInheritance.Car({ Id: 42, Speed: 42, Weight: 420, Doors: 2, Color: 'Yellow' });

                    equal(car.Id, 42, 'Id');
                    equal(car.Speed, 42, 'Speed');
                    equal(car.Weight, 420, 'Weight');
                    equal(car.Doors, 2, 'Doors');
                    equal(car.Color, 'Yellow', 'Color');

                    context.Cars.add(car);
                    return context.saveChanges().then(function () {
                        return context.Cars.single(function (c) { return c.Id == 42 }).then(function (savedCar) {
                            equal(savedCar.Id, 42, 'savedCar Id');
                            equal(savedCar.Speed, 42, 'savedCar Speed');
                            equal(savedCar.Weight, 420, 'savedCar Weight');
                            equal(savedCar.Doors, 2, 'savedCar Doors');
                            equal(savedCar.Color, 'Yellow', 'savedCar Color');

                            return context.Cars.toArray(function (res) {
                                equal(res.length, 5, 'result count');
                            });
                        });
                    });

                })
                //Update
                .then(function () {
                    return context.Cars.single(function (c) { return c.Id == 42 }).then(function (car) {
                        context.attach(car);
                        car.Doors = 5;
                        car.Color = 'LightGreen';

                        return context.saveChanges().then(function () {
                            return context.Cars.single(function (c) { return c.Id == 42 }).then(function (updated) {
                                equal(updated.Id, 42, 'updated Id');
                                equal(updated.Speed, 42, 'updated Speed');
                                equal(updated.Weight, 420, 'updated Weight');
                                equal(updated.Doors, 5, 'updated Doors');
                                equal(updated.Color, 'LightGreen', 'updated Color');

                            });
                        });

                    });
                })
                //Delete
                .then(function () {
                    context.Cars.remove({ Id: 42 });
                    return context.saveChanges().then(function () {
                        return context.Cars.toArray(function (res) {
                            equal(res.length, 4, 'result count');
                        });
                    });
                })
                .then(function () {
                    start();
                })
                .fail(function (e) {
                    ok(false, 'Error ' + e);
                    start();
                })
            });

        }).fail(function(err){
            console.log(err);
            start();
        });
    });
}
