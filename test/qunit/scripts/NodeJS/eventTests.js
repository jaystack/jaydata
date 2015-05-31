require('jaydata');

$data.Entity.extend('$test.A', {
    Id: { type: 'id', required: true, key: true, computed: true },
    Value: { type: 'string' }
});

$data.EntityContext.extend('$test.Context', {
    AAA: { type: $data.EntitySet, elementType: $test.A, beforeCreate: function(){
        return function(cb, data){
            //console.log('beforeCreate', arguments.callee.caller.toString());
            cb(true);
        };
    } },
    test: (function(){
        var self = this;
        return function(success, error){
            self.AAA.add(new $test.A({ Value: 'aaa' }));
            self.AAA.add(new $test.A({ Value: 'bbb' }));

            self.saveChanges(function(cnt){
                console.log('saved', cnt);
                self.executionContext.success(cnt);
            });
        };
    }).toServiceOperation().returns('int')
});

var connect = require('connect');
var app = connect();

$data.Class.defineEx('$test.Service', [$test.Context, $data.ServiceBase]);

app.use(connect.query());
app.use(connect.bodyParser());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);

app.use("/client", connect.static(__dirname + '/client'));
app.use("/eventtest", $data.JayService.createAdapter($test.Service, function(){
    return new $test.Service({ name: 'mongoDB', databaseName: 'eventtest' });
}));

app.listen(12345);
