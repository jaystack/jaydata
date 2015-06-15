require('jaydata');
try{ require('jaydata-mongodb-pro'); }catch(err){}
window.DOMParser = require('xmldom').DOMParser;

var nodeunit = require('nodeunit');
var util = require('util');
require('./NewsReaderContext.js');

exports['commonTests'] = require('./UnitTests/NodeJS/commonTests.js');
exports['EntityTransform'] = require('./UnitTests/NodeJS/EntityTransformTests.js');
exports['oDataMetaDataGenerator'] = require('./UnitTests/NodeJS/oDataMetaDataGeneratorTests.js');
exports['oDataResponseDataBuilder'] = require('./UnitTests/NodeJS/oDataResponseDataBuilderTests.js');
exports['oDataBatchTest'] = require('./UnitTests/NodeJS/oDataBatchTests.js');
exports['argumentBinderTests'] = require('./UnitTests/NodeJS/argumentBinderTests.js');
exports['oDataXmlResultTests'] = require('./UnitTests/NodeJS/oDataXmlResultTests.js');

try{ exports['mongoProviderTests'] = require('./Pro/UnitTests/mongoProviderTests.js'); }
catch(err){ exports['mongoProviderTests'] = require('./UnitTests/mongoProviderTests.js'); }

require('./UnitTests/NodeJS/TypesTest.js');

var connect = require('connect');
var app = connect();

$data.Class.define('$exampleSrv.PersonSrv', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int' }
});

$data.Class.define('$exampleSrv.OrderSrv', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Value: { type: 'int' },
    Date: { type: 'date' },
    Completed: { type: 'bool' },
    Data: { type: 'object' }
});

$data.Class.define('$exampleSrv.PlaceSrv', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Name: { type: 'string' },
    Location: { type: 'GeographyPoint' }
});

$data.Class.define('$exampleSrv.TestItem', $data.Entity, null, {
    Id: { type: 'string', key: true },
    Name: { type: 'string' },
    Index: { type: 'int' }
});

$data.Class.define('$exampleSrv.TestItemGuid', $data.Entity, null, {
    Id: { type: 'guid', key: true },
    Name: { type: 'string' },
    Index: { type: 'int' },
    GuidField: { type: 'guid' }
});

$data.Class.define('$exampleSrv.TestItemComputed', $data.Entity, null, {
    Id: { type: 'guid', key: true, required: true },
    Name: { type: 'string' },
    Index: { type: 'int' },
    GuidField: { type: 'guid' },
    DateField: { type: 'date' },
    BoolField: { type: 'bool' },
    ObjectField: { type: 'object' }
});

$data.Class.define('$exampleSrv.GeoTestEntity', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Name: { type: 'string' },
    GeographyPoint: { type: 'GeographyPoint' },
    GeographyLineString: { type: 'GeographyLineString' },
    GeographyPolygon: { type: 'GeographyPolygon' },
    GeographyMultiPoint: { type: 'GeographyMultiPoint' },
    GeographyMultiLineString: { type: 'GeographyMultiLineString' },
    GeographyMultiPolygon: { type: 'GeographyMultiPolygon' },
    GeographyCollection: { type: 'GeographyCollection' },
});

$data.Class.define('$exampleSrv.GeometryTestEntity', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Name: { type: 'string' },
    GeometryPoint: { type: 'GeometryPoint' },
    GeometryLineString: { type: 'GeometryLineString' },
    GeometryPolygon: { type: 'GeometryPolygon' },
    GeometryMultiPoint: { type: 'GeometryMultiPoint' },
    GeometryMultiLineString: { type: 'GeometryMultiLineString' },
    GeometryMultiPolygon: { type: 'GeometryMultiPolygon' },
    GeometryCollection: { type: 'GeometryCollection' },
});

$exampleSrv.TestItemComputed.addEventListener('beforeCreate', function (sender, item) {
    if (!item.Name)
        item.Name = 'default Name';

    item.Index = 42;
    item.GuidField = $data.parseGuid('7b33e20d-3cca-4452-b3e2-eca9525377a1');
    item.DateField = new Date('2012');
    item.BoolField = true;
    item.ObjectField = { work: 'item', computed: 'field' };
});

$data.Class.defineEx('$exampleSrv.Context', [$data.EntityContext, $data.ServiceBase], null, {
    People: { type: $data.EntitySet, elementType: $exampleSrv.PersonSrv },
    Orders: { type: $data.EntitySet, elementType: $exampleSrv.OrderSrv },
    Places: { type: $data.EntitySet, elementType: $exampleSrv.PlaceSrv, indices: $data.storageProviders.mongoDBPro ? [{ keys: [{ field: 'Location', spatial: true }] }] : undefined },
    TestItems: { type: $data.EntitySet, elementType: $exampleSrv.TestItem },
    TestItemGuids: { type: $data.EntitySet, elementType: $exampleSrv.TestItemGuid },
    TestItemComputeds: { type: $data.EntitySet, elementType: $exampleSrv.TestItemComputed },
    GeoTestEntities: { type: $data.EntitySet, elementType: $exampleSrv.GeoTestEntity },
    GeometryTestEntities: { type: $data.EntitySet, elementType: $exampleSrv.GeometryTestEntity },
    FuncStrParam: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="string"/>
        return a;
    }),
    FuncGuidParam: (function (a) {
        ///<param name="a" type="guid"/>
        ///<returns type="string"/>
        return a;
    }),
    FuncIntParam: (function (a) {
        ///<param name="a" type="int"/>
        ///<returns type="int"/>
        return a;
    }),
    FuncNumParam: (function (a) {
        ///<param name="a" type="number"/>
        ///<returns type="number"/>
        return a;
    }),
    FuncObjParam: (function (a) {
        ///<param name="a" type="object"/>
        ///<returns type="object"/>
        return a;
    }),
    FuncArrParam: (function (a) {
        ///<param name="a" type="array"/>
        ///<returns type="object"/>
        return a;
    }),
    FuncBoolParam: (function (a) {
        ///<param name="a" type="bool"/>
        ///<returns type="bool"/>
        return a;
    }),
    FuncDateParam: (function (a) {
        ///<param name="a" type="date"/>
        ///<returns type="date"/>
        return a;
    }),
    FuncGeographyParam: (function (a) {
        ///<param name="a" type="GeographyPoint"/>
        ///<returns type="GeographyPoint"/>
        return a;
    }),
    FuncGeometryParam: (function (a) {
        ///<param name="a" type="GeometryPoint"/>
        ///<returns type="GeometryPoint"/>
        return a;
    }),
    FuncEntityParam: (function (a) {
        ///<param name="a" type="$exampleSrv.PersonSrv"/>
        ///<returns type="$exampleSrv.PersonSrv"/>
        return a;
    }),
    //FuncEntityParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: '$exampleSrv.OrderSrv' }]).returns('$exampleSrv.OrderSrv'),

    ATables: {
        type: $data.EntitySet,
        elementType: $data.Entity.extend('$exampleSrv.ATableSrv', {
            Id: { type: 'id', key: true, computed: true },
            ComplexData: {
                type: $data.Entity.extend('$exampleSrv.Complex1', {
                    Field1: { type: 'int' },
                    Field2: { type: 'string' }
                })
            },
            ComplexArray: {
                type: 'Array',
                elementType: $data.Entity.extend('$exampleSrv.Complex2', {
                    Field3: { type: 'int' },
                    Field4: { type: 'string' }
                })
            },
            ComplexArrayPrim: { type: 'Array', elementType: 'string' },
            ComplexEntity: { type: $exampleSrv.OrderSrv },
            ComplexEntityArray: { type: 'Array', elementType: $exampleSrv.OrderSrv }
        })
    }
});

$exampleSrv.Context.annotateFromVSDoc();

var onException = false;
app.use(function (req, res, next) {
    if (!onException) {
        process.on('uncaughtException', function (err) {
            if (req.tracker) {
                var u = 0;
                if (u = req.tracker.unfinished()) {
                    var str = '<ul>';
                    str += 'Undone tests [' + u + '] (or their setups/teardowns): ';
                    var names = req.tracker.names();
                    for (var i = 0; i < names.length; i += 1) {
                        str += '<li>' + names[i] + '</li>';
                    }
                    str += '</ul>';
                    next(str);
                }
            } else {
                next(err);
            }
        });
        onException = true;
    }
    next();
});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, MERGE, DELETE');
    if (req.method === 'OPTIONS') {
        res.end();
    } else {
        next();
    }
});

/*app.use(connect.basicAuth(function (user, pass) {
    return 'asd' == user & 'asd' == pass;
}));*/

app.use(connect.query());
app.use(connect.bodyParser());
app.use($data.JayService.OData.Utils.simpleBodyReader());

app.use("/", connect.static(__dirname));
app.use("/testservice", $data.JayService.createAdapter($exampleSrv.Context, function () {
    return new $exampleSrv.Context({ name: 'mongoDB', databaseName: 'testserviceDb', responseLimit: 30 });
}));

app.use("/nodeunit", function (req, res, next) {
    var reporter = {
        run: function (files, options, callback) {
            var utils = {
                betterErrors: function (assertion) {
                    if (!assertion.error) return assertion;

                    var e = assertion.error;
                    if (e.actual && e.expected) {
                        var actual = util.inspect(e.actual, false, 10).replace(/\n$/, '');
                        var expected = util.inspect(e.expected, false, 10).replace(/\n$/, '');
                        var multiline = (
                            actual.indexOf('\n') !== -1 ||
                            expected.indexOf('\n') !== -1
                        );
                        var spacing = (multiline ? '\n' : ' ');
                        e._message = e.message;
                        e.stack = (
                            e.name + ':' + spacing +
                            actual + spacing + e.operator + spacing +
                            expected + '\n' +
                            e.stack.split('\n').slice(1).join('\n')
                        );
                    }
                    return assertion;
                }
            };

            var track = {
                createTracker: function (on_exit) {
                    var names = {};
                    var tracker = {
                        names: function () {
                            var arr = [];
                            for (var k in names) {
                                if (names.hasOwnProperty(k)) {
                                    arr.push(k);
                                }
                            }
                            return arr;
                        },
                        unfinished: function () {
                            return tracker.names().length;
                        },
                        put: function (testname) {
                            names[testname] = testname;
                        },
                        remove: function (testname) {
                            delete names[testname];
                        }
                    };

                    req.tracker = tracker;

                    return tracker;
                },
                default_on_exit: function (tracker) {

                }
            };

            res.write('<html>');
            res.write('<head>');
            res.write('<title>JayData NodeUnit Tests</title>');
            res.write('<style type="text/css">');
            res.write('body { font: 12px Helvetica Neue }');
            res.write('h2 { margin:0 ; padding:0 }');
            res.write('pre { font: 11px Andale Mono; margin-left: 1em; padding-left: 1em; margin-top:0; font-size:smaller;}');
            res.write('.assertion_message { margin-left: 1em; }');
            res.write('  ol {' +
            '	list-style: none;' +
            '	margin-left: 1em;' +
            '	padding-left: 1em;' +
            '	text-indent: -1em;' +
            '}');
            res.write('  ol li.pass:before { content: "\\2714 \\0020"; color: green; }');
            res.write('  ol li.fail:before { content: "\\2716 \\0020"; color: red; }');
            res.write('</style>');
            res.write('</head>');
            res.write('<body>');

            var start = new Date().getTime();
            var tracker = track.createTracker(function (tracker) {
                if (tracker.unfinished()) {
                    res.write('')
                    res.write('');
                    res.write(error(bold(
                        'FAILURES: Undone tests (or their setups/teardowns): '
                    )));
                    var names = tracker.names();
                    for (var i = 0; i < names.length; i += 1) {
                        res.write('- ' + names[i]);
                    }
                    res.write('');
                    res.write('To fix this, make sure all tests call test.done()');
                    process.reallyExit(tracker.unfinished());
                }
            });

            var opts = {
                moduleStart: function (name) {
                    res.write('<h2>' + name + '</h2>');
                    res.write('<ol>');
                },
                testDone: function (name, assertions) {
                    tracker.remove(name);

                    if (!assertions.failures()) {
                        res.write('<li class="pass">' + name + '</li>');
                    }
                    else {
                        res.write('<li class="fail">' + name);
                        assertions.forEach(function (a) {
                            if (a.failed()) {
                                a = utils.betterErrors(a);
                                if (a.error instanceof AssertionError && a.message) {
                                    res.write('<div class="assertion_message">' + 'Assertion Message: ' + a.message + '</div>');
                                }
                                res.write('<pre>' + a.error.stack + '</pre>');
                            }
                        });
                        res.write('</li>');
                    }
                },
                moduleDone: function () {
                    res.write('</ol>');
                },
                done: function (assertions, end) {
                    var end = end || new Date().getTime();
                    var duration = end - start;
                    if (assertions.failures()) {
                        res.write(
                            '<h3>FAILURES: ' + assertions.failures() +
                            '/' + assertions.length + ' assertions failed (' +
                            assertions.duration + 'ms)</h3>'
                        );
                    }
                    else {
                        res.write(
                           '<h3>OK: ' + assertions.length +
                           ' assertions (' + assertions.duration + 'ms)</h3>'
                        );
                    }
                    res.write('</body>');
                    res.write('</html>');

                    if (callback) callback(assertions.failures() ? new Error('We have got test failures.') : undefined);
                },
                testStart: function (name) {
                    tracker.put(name);
                }
            };

            if (files && files.length) {
                var paths = files.map(function (p) {
                    return path.join(process.cwd(), p);
                });
                nodeunit.runFiles(paths, opts);
            } else {
                nodeunit.runModules(files, opts);
            }
        }
    };
    reporter.run(exports, null, function (err) {
        if (err) next(err);
        else res.end();
    });
});

app.use(connect.errorHandler());

$data.Class.define('$exampleSrv.ComplexT', $data.Entity, null, {
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int' },
    Created: { type: 'date' }
});

$data.Class.define('$exampleSrv.ComplexTWithComplex', $data.Entity, null, {
    Title: { type: 'string' },
    Complex: { type: '$exampleSrv.ComplexT' }
});

$data.Class.define('$exampleSrv.ComplexTWithArrayComplex', $data.Entity, null, {
    Title: { type: 'string' },
    Complex: { type: 'Array', elementType: '$exampleSrv.ComplexT' }
});

$data.Class.define('$exampleSrv.ComplexTWithCC', $data.Entity, null, {
    Title: { type: 'string' },
    Complex2: { type: '$exampleSrv.ComplexTWithComplex' }
});

$data.Class.define('$exampleSrv.ComplexTWithCCAndArrayC', $data.Entity, null, {
    Title: { type: 'string' },
    Complex: { type: '$exampleSrv.ComplexT' },
    Complex2Arr: { type: 'Array', elementType: '$exampleSrv.ComplexTWithComplex' }
});

$data.Class.defineEx('$exampleSrv.FuncContext', [$data.EntityContext, $data.ServiceBase], null, {
    People: { type: $data.EntitySet, elementType: $exampleSrv.PersonSrv },
    Orders: { type: $data.EntitySet, elementType: $exampleSrv.OrderSrv },
    FuncComplexRes: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="$exampleSrv.ComplexT"/>
        return new $exampleSrv.ComplexT({ Name: a, Description: 'desc', Age: 42, Created: new Date('2000/01/01 01:01:01') });
    }),
    FuncComplexResArray: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="Array" elementType="$exampleSrv.ComplexT"/>

        var res = [];
        for (var i = 0; i < 5; i++) {
            res.push(new $exampleSrv.ComplexT({ Name: a + i, Description: 'desc', Age: i, Created: new Date((2000 + i).toString() + '/01/01 01:01:01') }));
        }
        return res;
    }),
    FuncComplex2Res: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="$exampleSrv.ComplexTWithComplex"/>
        return new $exampleSrv.ComplexTWithComplex({ Title: a, Complex: new $exampleSrv.ComplexT({ Name: a, Description: 'desc', Age: 42, Created: new Date('2000/01/01 01:01:01') }) });
    }),
    FuncComplex2ResArray: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="Array" elementType="$exampleSrv.ComplexTWithComplex"/>

        var res = [];
        for (var i = 0; i < 5; i++) {
            res.push(new $exampleSrv.ComplexTWithComplex({ Title: a + i, Complex: new $exampleSrv.ComplexT({ Name: a + i, Description: 'desc', Age: i, Created: new Date((2000 + i).toString() + '/01/01 01:01:01') }) }));
        }
        return res;
    }),
    FuncComplex3Res: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="$exampleSrv.ComplexTWithCC"/>
        return new $exampleSrv.ComplexTWithCC({ Title: a, Complex2: new $exampleSrv.ComplexTWithComplex({ Title: a, Complex: new $exampleSrv.ComplexT({ Name: a, Description: 'desc', Age: 42, Created: new Date('2000/01/01 01:01:01') }) }) });
    }),
    FuncComplex3ResArray: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="Array" elementType="$exampleSrv.ComplexTWithCC"/>

        var res = [];
        for (var i = 0; i < 5; i++) {
            res.push(new $exampleSrv.ComplexTWithCC({ Title: a + i, Complex2: new $exampleSrv.ComplexTWithComplex({ Title: a + i, Complex: new $exampleSrv.ComplexT({ Name: a + i, Description: 'desc', Age: i, Created: new Date((2000 + i).toString() + '/01/01 01:01:01') }) }) }));
        }
        return res;
    }),
    FuncComplexWithArrayComplexRes: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="$exampleSrv.ComplexTWithArrayComplex"/>

        var res = [];
        for (var i = 0; i < 5; i++) {
            res.push(new $exampleSrv.ComplexT({ Name: a + i, Description: 'desc', Age: i, Created: new Date((2000 + i).toString() + '/01/01 01:01:01') }));
        }
        return new $exampleSrv.ComplexTWithArrayComplex({ Title: a, Complex: res });
    }),
    FuncComplexWithArrayComplexResArray: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="Array" elementType="$exampleSrv.ComplexTWithArrayComplex"/>

        var res = [];
        for (var i = 0; i < 5; i++) {

            var res2 = [];
            for (var j = 0; j < 5; j++) {
                res2.push(new $exampleSrv.ComplexT({ Name: a + i + j, Description: 'desc', Age: i + j, Created: new Date((2000 + i + j).toString() + '/01/01 01:01:01') }));
            }

            res.push(new $exampleSrv.ComplexTWithArrayComplex({ Title: a + i, Complex: res2 }));
        }
        return res;
    }),
    FuncComplexMultiRes: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="$exampleSrv.ComplexTWithCCAndArrayC"/>

        var res = [];
        for (var i = 0; i < 5; i++) {
            res.push(new $exampleSrv.ComplexTWithComplex({ Title: a, Complex: new $exampleSrv.ComplexT({ Name: a + i, Description: 'desc', Age: i, Created: new Date((2000 + i).toString() + '/01/01 01:01:01') }) }));
        }
        return new $exampleSrv.ComplexTWithCCAndArrayC({
            Title: a,
            Complex: new $exampleSrv.ComplexT({ Name: a, Description: 'desc', Age: 42, Created: new Date('2000/01/01 01:01:01') }),
            Complex2Arr: res
        });
    }),
    FuncComplexMultiResArray: (function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="Array" elementType="$exampleSrv.ComplexTWithCCAndArrayC"/>

        var res = [];
        for (var i = 0; i < 5; i++) {

            var res2 = [];
            for (var j = 0; j < 5; j++) {
                res2.push(new $exampleSrv.ComplexTWithComplex({ Title: a, Complex: new $exampleSrv.ComplexT({ Name: a + i + j, Description: 'desc', Age: i + j, Created: new Date((2000 + i + j).toString() + '/01/01 01:01:01') }) }));
            }

            res.push(new $exampleSrv.ComplexTWithCCAndArrayC({
                Title: a + i,
                Complex: new $exampleSrv.ComplexT({ Name: a + i, Description: 'desc', Age: i, Created: new Date((2000 + i).toString() + '/01/01 01:01:01') }),
                Complex2Arr: res2
            }));
        }
        return res;
    })
});

$exampleSrv.FuncContext.annotateFromVSDoc();

app.use("/funcservice", $data.JayService.createAdapter($exampleSrv.FuncContext, function () {
    return new $exampleSrv.FuncContext({ name: 'mongoDB', databaseName: 'funcserviceDb', responseLimit: 30 });
}));

$data.Class.defineEx('JayData.NewsReader.NewsContextService', [$news.Types.NewsContext, $data.ServiceBase], null, {
    TestItemTypes: { type: $data.EntitySet, elementType: TestItemType }
});
JayData.NewsReader.NewsContextService.annotateFromVSDoc();

app.use("/Services/emptyNewsReader.svc", $data.JayService.createAdapter(JayData.NewsReader.NewsContextService, function () {
    return new JayData.NewsReader.NewsContextService({ name: 'mongoDB', databaseName: 'newsreader', responseLimit: 100 });
}));
app.use("/Services/emptyNewsReaderV3.svc", $data.JayService.createAdapter(JayData.NewsReader.NewsContextService, function () {
    return new JayData.NewsReader.NewsContextService({ name: 'mongoDB', databaseName: 'newsreader', responseLimit: 100 });
}));
app.use("/odata.svc", $data.JayService.createAdapter(JayData.NewsReader.NewsContextService, function () {
    return new JayData.NewsReader.NewsContextService({ name: 'mongoDB', databaseName: 'newsreader', responseLimit: 100 });
}));

app.use("/Services/oDataDbDelete.asmx/Delete", function(req, res){
    var c = new $news.Types.NewsContext({ name: 'mongoDB', databaseName: 'newsreader', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
    c.onReady(function(){
        res.end();
    });
    
    var seed = exports['mongoProviderTests'].seed;
    for (var i in seed){
        seed[i] = 0;
    }
});

$data.Class.defineEx('TestNewsReaderContextService', [TestNewsReaderContext, $data.ServiceBase]);
TestItemType.addMember('Id', { 'key': true, 'type': 'Edm.Int32', 'nullable': false });
var TestItemTypeKey = 0;
TestItemType.addEventListener('beforeCreate', function (sender, item) {
    item.Id = ++TestItemTypeKey;
});

app.use("/typetestService", $data.JayService.createAdapter(TestNewsReaderContextService, function () {
    return new TestNewsReaderContextService({ name: 'mongoDB', databaseName: 'test', responseLimit: 100 });
}));


require('./UnitTests/CollectionTests.js');
$data.Class.defineEx('CollectionContextService', [CollectionContext, $data.ServiceBase]);
JayData.Models.CollectionProp.TestEntity.addMember('Id', { 'key': true, 'type': 'Edm.Int32', 'nullable': false });
var _TestEntityKey = 0;
JayData.Models.CollectionProp.TestEntity.addEventListener('beforeCreate', function (sender, item) {
    item.Id = ++_TestEntityKey;
});

app.use("/collectiontestService", $data.JayService.createAdapter(CollectionContextService, function () {
    return new CollectionContextService({ name: 'mongoDB', databaseName: 'test', responseLimit: 100 });
}));

app.listen(3001);
app.listen(3002);
