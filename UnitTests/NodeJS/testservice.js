require('jaydata');

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
    Completed: { type: 'bool' }
});

$data.Class.defineEx('$exampleSrv.Context', [$data.EntityContext, $data.ServiceBase], null, {
    People: { type: $data.EntitySet, elementType: $exampleSrv.PersonSrv },
    Orders: { type: $data.EntitySet, elementType: $exampleSrv.OrderSrv }
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
app.use("/testservice", $data.JayService.createAdapter($exampleSrv.Context, function () {
    return new $exampleSrv.Context({ name: 'mongoDB', databaseName: 'testserviceDb' });
}));

app.listen(3001);
