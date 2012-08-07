require('jaydata');

var connect = require('connect');
var app = connect();


$data.Class.define('$test.A', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Prop1: { type: 'string' },
    Prop2: { type: 'string' },
    Prop3: { type: 'string' }
});

$data.Class.defineEx('$test.TContext', [$data.EntityContext, $data.ServiceBase], null, {
    A: { type: $data.EntitySet, elementType: $test.A }
});



app.use(connect.query());
//app.use(connect.bodyParser());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);

app.use("/", connect.static("/home/borzav/sf/jay/my_jaydata"));
app.use("/my.svc", $data.JayService.createAdapter($test.TContext, function () {
    return new $test.TContext({ name: 'mongoDB', databaseName: 'contextapi' });
}));

app.listen(3000);


