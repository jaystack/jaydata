require('jaydata');
//var sqlite = require('mongodb');
require('./contextapi-context.js');
require('./contextapi-api.js');

$data.Class.defineEx('$data.ContextAPI.API', [$data.ContextAPI.Context, $data.ContextAPI.FunctionImport]);

$data.Entity.extend('$test.Item', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' },
    CreatedAt: { type: 'datetime' },
    ForeignKey: { type: 'id' }
});

$data.Entity.extend('$test.ComplexValue', {
    Value: { type: 'string' },
    Rank: { type: 'int' }
});

/*$data.Entity.extend('$test.MoreComplexValue', {
    Value: { type: 'string' },
    Rank: { type: 'int' },
    Child: { type: '$test.ComplexValue' }
});*/

$data.Entity.extend('$test.ComplexItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: '$test.ComplexValue' }
});

/*$data.Entity.extend('$test.MoreComplexItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: '$test.MoreComplexValue' },
    ValueChild: { type: '$test.ComplexValue' }
});*/

$data.Entity.extend('$test.ObjectItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'Object' }
});

$data.Entity.extend('$test.ArrayItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Values: { type: 'Array', elementType: 'string' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.ArrayComplexItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Values: { type: 'Array', elementType: '$test.ComplexValue' },
    Rank: { type: 'int' }
});

$data.EntityContext.extend('$test.EntityContext', {
    Items: { type: $data.EntitySet, elementType: $test.Item },
    ComplexItems: { type: $data.EntitySet, elementType: $test.ComplexItem },
    //MoreComplexItems: { type: $data.EntitySet, elementType: $test.MoreComplexItem },
    ObjectItems: { type: $data.EntitySet, elementType: $test.ObjectItem },
    ArrayItems: { type: $data.EntitySet, elementType: $test.ArrayItem },
    ArrayComplexItems: { type: $data.EntitySet, elementType: $test.ArrayComplexItem }
});

$data.Class.defineEx('$test.Context', [$test.EntityContext, $data.ServiceBase]);

var connect = require('connect');
var app = connect();

app.use(connect.query());
//app.use(connect.bodyParser());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);
app.use("/client", connect.static('/home/lazarv/project/jaydata'));
//var context = new $data.ContextAPI.API({ name: 'mongoDB', databaseName: 'contextapi' });
app.use("/test.svc", $data.JayService.createAdapter($test.Context, function(){
    //return context;
    return new $test.Context({ name: 'mongoDB', databaseName: 'test', username: 'admin', password: '***' });
}));

app.use("/contextapi.svc", $data.JayService.createAdapter($data.ContextAPI.API, function(){
    //return context;
    return new $data.ContextAPI.API({ name: 'mongoDB', databaseName: 'contextapi' });
}));

app.listen(3000);
/*var connect = require('connect');
var app = connect();
app.use(connect.query());
app.use(connect.bodyParser());
app.use('/contextapi.svc/getAllEntities', function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World!');
});

app.listen(3000);*/
