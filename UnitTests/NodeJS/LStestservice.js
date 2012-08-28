require('jaydata');
window.DOMParser = require('xmldom').DOMParser;

var connect = require('connect');
var app = connect();


$data.Class.define('exampleSrv.PersonSrv', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true, nullable: false },
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int' }
});

$data.Class.define('exampleSrv.OrderSrv', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true, nullable: false },
    Value: { type: 'int' },
    Date: { type: 'date' },
    Completed: { type: 'bool' }
});

$data.Class.defineEx('exampleSrv.Context', [$data.EntityContext, $data.ServiceBase], null, {
    People: { type: $data.EntitySet, elementType: exampleSrv.PersonSrv },
    Orders: { type: $data.EntitySet, elementType: exampleSrv.OrderSrv },
    FuncStrParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'string' }]).returns('string')/*,
    FuncIntParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'int' }]).returns('int'),
    FuncNumParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'number' }]).returns('number'),
    FuncObjParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'object' }]).returns('object'),
    FuncArrParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'array' }]).returns('object'),
    FuncBoolParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'bool' }]).returns('bool'),
    FuncDateParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'date' }]).returns('date'),
    //FuncEntityParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'exampleSrv.OrderSrv' }]).returns('exampleSrv.OrderSrv'),

    ATables: {
        type: $data.EntitySet,
        elementType: $data.Entity.extend('exampleSrv.ATableSrv', {
            Id: { type: 'id', key: true, computed: true },
            ComplexData: {
                type: $data.Entity.extend('exampleSrv.Complex1', {
                    Field1: { type: 'int' },
                    Field2: { type: 'string' }
                })
            },
            ComplexArray: {
                type: 'Array',
                elementType: $data.Entity.extend('exampleSrv.Complex2', {
                    Field3: { type: 'int' },
                    Field4: { type: 'string' }
                })
            },
            ComplexArrayPrim: { type: 'Array', elementType: 'string' },
            ComplexEntity: { type: exampleSrv.OrderSrv },
            ComplexEntityArray: { type: 'Array', elementType: exampleSrv.OrderSrv }
        })
    }*/
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
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);

app.use("/", connect.static("/home/borzav/sf/jay/jaydata"));
app.use("/testservice", $data.JayService.createAdapter(exampleSrv.Context, function () {
    console.log('request');
    return new exampleSrv.Context({ name: 'mongoDB', databaseName: 'LSTestDb', responseLimit: -1 });
}));

app.use(connect.errorHandler());

app.listen(3001);
