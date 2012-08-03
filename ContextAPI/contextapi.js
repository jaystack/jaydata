require('jaydata');
require('./contextapi-context.js');
require('./contextapi-api.js');

$data.Class.defineEx('$data.ContextAPI.API', [$data.ContextAPI.Context, $data.ContextAPI.FunctionImport]);

var connect = require('connect');
var app = connect();

app.use(connect.query());
app.use(connect.bodyParser());
app.use("/client", connect.static(__dirname + '/client'));
app.use("/contextapi.svc", $data.JayService.createAdapter($data.ContextAPI.API, function(){
    return new $data.ContextAPI.API({ name: 'mongoDB', databaseName: 'contextapi' });
}));

app.listen(3000);
