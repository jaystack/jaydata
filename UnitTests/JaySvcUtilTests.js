$(document).ready(function () {
    if (typeof XSLTProcessor === undefined) {
        module("JaySvcUtilTests");
        test('XSLTProcessor is not enable', 1, function () {
            ok(false, 'JaySvcUtil.js is not supported!!');
        });
    } else {
        metadataTests({ name: "sqLite", databaseName: 'kendoTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
    }
});

function metadataTests(providerConfig, msg) {
    module("JaySvcUtilTests" + (msg ? msg : ''));

    test('factory test', 10, function () {
        stop();

        var orig = $data.MetadataLoader.debugMode;
        $data.MetadataLoader.debugMode = true;
        $data.MetadataLoader.factoryCache = {};

        $data.MetadataLoader.load('Services/emptyNewsreader.svc', {
            success: function (f, type, code) {

                equal(typeof f, 'function', 'factory is function');
                equal(typeof type, 'function', 'type is function');
                equal(typeof code, 'string', 'code is string');

                var ctx = f();
                ok(ctx instanceof $data.EntityContext, 'factory return $data.EntityContext');
                ok(type.isAssignableTo($data.EntityContext), 'type is extends $data.EntityContext');
                ok(ctx instanceof type, 'context instance of type ');
                ok(Object.keys($data.MetadataLoader.factoryCache).length > 0, 'factory cache has record')

                $data.MetadataLoader.load('Services/emptyNewsreader.svc', {
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

        $data.MetadataLoader.load('Services/emptyNewsreader.svc', {
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

        $data.MetadataLoader.load('Services/emptyNewsreader.svc', {
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
        $data.service('UnitTests/JaySvcUtil/$metadata.action.xml', function (f, type) {

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
}