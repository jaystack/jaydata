require('jaydata');
window.DOMParser = require('xmldom').DOMParser;

var connect = require('connect');
var app = connect();


$data.Class.define('Person', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true, nullable: false },
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int', nullable: false }
});

$data.Class.define('Order', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true, nullable: false },
    Value: { type: 'int' },
    Date: { type: 'date' },
    Completed: { type: 'bool' }
});

$data.Class.define('TestItemGuid', $data.Entity, null, {
    Id: { type: 'guid', key: true, nullable: false },
    Name: { type: 'string' },
    Index: { type: 'int' },
    GuidField: { type: 'guid' }
});

$data.Class.defineEx('Context', [$data.EntityContext, $data.ServiceBase], null, {
    People: { type: $data.EntitySet, elementType: Person },
    Orders: { type: $data.EntitySet, elementType: Order },
    TestItemGuids: { type: $data.EntitySet, elementType: TestItemGuid },
    FuncStrParam: function (a) {
        ///<param name="a" type="string"/>
        ///<returns type="string"/>
        return a;
    },
    FuncIntParam: function (a) {
        ///<param name="a" type="int"/>
        ///<returns type="int"/>
        return a;
    }/*,
    FuncNumParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'number' }]).returns('number'),
    //FuncObjParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'object' }]).returns('object'),
    //FuncArrParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'array' }]).returns('object'),
    FuncBoolParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'bool' }]).returns('bool'),
    FuncDateParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'date' }]).returns('date'),
    //FuncEntityParam: (function (a) { return a; }).toServiceOperation().params([{ name: 'a', type: 'Order' }]).returns('Order'),

    ATables: {
        type: $data.EntitySet,
        elementType: $data.Entity.extend('ATable', {
            Id: { type: 'id', key: true, computed: true },
            ComplexData: {
                type: $data.Entity.extend('Complex1', {
                    Field1: { type: 'int' },
                    Field2: { type: 'string' }
                })
            },
            ComplexArray: {
                type: 'Array',
                elementType: $data.Entity.extend('Complex2', {
                    Field3: { type: 'int' },
                    Field4: { type: 'string' }
                })
            },
            ComplexArrayPrim: { type: 'Array', elementType: 'string' },
            ComplexEntity: { type: Order },
            ComplexEntityArray: { type: 'Array', elementType: Order }
        })
    }*/
});
Context.annotateFromVSDoc();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, MERGE, DELETE');
    if (req.method === 'OPTIONS') {
        res.setHeader('Content-Length', 0);
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

app.use("/", connect.static("/home/borzav/sf/jay/jaydata"));
app.use("/testservice", $data.JayService.createAdapter(Context, function () {
    return new Context({ name: 'mongoDB', databaseName: 'LSTestDb', responseLimit: -1 });
}));

app.use(connect.errorHandler());

app.listen(3001);

