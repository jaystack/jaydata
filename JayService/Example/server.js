require('jaydata');

var connect = require('connect');
var app = connect();


$data.Class.define('$example.Person', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int' },
    //Orders: { type: 'Array', elementType: '$example.Order', inverseProperty: 'Person' }
});

$data.Class.define('$example.Order', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Value: { type: 'int', $custom: 'almafa' },
    Date: { type: 'date' },
    Completed: { type: 'bool' },
    //Details: { type: 'Array', elementType: '$example.Complex' }
    //Person: { type: '$example.Person', inverseProperty: 'Orders' }
});

$data.Class.define('$example.Complex', $data.Entity, null, {
    Location: { type: 'string' },
    Count: { type: 'int' },
    Date: { type: 'date' },
    //Orders: { type: 'Array', elementType: '$example.Order', inverseProperty: 'Person' }
});

$data.Class.defineEx('$example.Context', [$data.EntityContext, $data.ServiceBase], null, {
    People: { type: $data.EntitySet, elementType: $example.Person },
    Orders: { type: $data.EntitySet, elementType: $example.Order }
});

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, MERGE, DELETE');
    if (req.method === 'OPTIONS') {
        res.end();
    } else {
        next();
    }
});

app.use(connect.query());
app.use(connect.bodyParser());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);

app.use("/", connect.static("/home/borzav/sf/jay/jaydata"));
app.use("/myservice", $data.JayService.createAdapter($example.Context, function () {
    return new $example.Context({ name: 'mongoDB', databaseName: 'exampleDb' });
}));

app.listen(3000);


