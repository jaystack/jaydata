/**
 * Created with JetBrains WebStorm.
 * User: nochtap
 * Date: 8/6/12
 * Time: 11:19 AM
 * To change this template use File | Settings | File Templates.
 */
require('jaydata');
require('./userapi-context.js');
require('./userapi-services.js');

$data.Class.defineEx('$data.UserAPI.API', [$data.UserAPI.Context, $data.UserAPI.FunctionImport]);

var connect = require('connect');
var app = connect();

app.use(connect.query());
app.use(connect.bodyParser());
app.use(connect.static('/index.html'));
app.use("/userapi.svc", $data.JayService.createAdapter($data.UserAPI.API, function(){
    return new $data.UserAPI.API({ name: 'mongoDB', databaseName: 'userdb' });
}));

app.listen(3005);
