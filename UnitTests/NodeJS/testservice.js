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



app.use(connect.query());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);

app.use("/", connect.static("/home/borzav/sf/jay/jaydata"));
app.use("/testservice", $data.JayService.createAdapter($exampleSrv.Context, function () {
    return new $exampleSrv.Context({ name: 'mongoDB', databaseName: 'testserviceDb' });
}));

app.listen(3000);


