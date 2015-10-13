require('jaydata');

$data.Entity.extend('$test.Item', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' },
    CreatedAt: { type: 'datetime' },
    ForeignKey: { type: 'id' }/*,
    Thing: { type: '$test.Thing', inverseProperty: 'Item' }*/
});

/*$data.Entity.extend('$test.Thing', {
    Id: { type: 'int', computed: true, key: true },
    Oh: { type: 'string' },
    Item: { type: '$test.Item', required: true }
});*/

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item },
    /*GetThat: (function(){
        return [1, 2, 3];
    }).returns($data.Array, $data.Integer).serviceName('GetThat').params([])
    Things: { type: $data.EntitySet, elementType: $test.Thing }*/
});

var connect = require('connect');
var app = require('connect')();

app.use(connect.multipart());
app.use(connect.urlencoded());
app.use(connect.json());
app.use(connect.bodyParser());
app.use(connect.query());

ISODate = function(date){
    return new Date(date);
};

app.use('/', function(req, res){
    if (req.method === 'GET'){
        $test.context = new $test.Context({ name: 'mongoDB', databaseName: 'storm' });
        $test.context.onReady(function(db){
            var callback = function(result){
                res.write(JSON.stringify(result));
                res.end();
            };
            
            var compiled = req.query.expression || {};
            
            var qs = db[req.query.entitySet] || db;
            if (compiled.$serviceOperation){
                var fn = qs[compiled.$serviceOperation.name];
                if ((typeof fn.returnType.isAssignableTo === 'function' && fn.returnType.isAssignableTo($data.Queryable))){
                    qs = fn.apply(this, compiled.$serviceOperation.params);
                }else{
                    callback(fn.apply(this, compiled.$serviceOperation.params));
                }
            }else{
                /*if (compiled.$include){
                    for (var i = 0; i < compiled.$include.length; i++){
                        qs += '.include("' + compiled.$include[i] + '")';
                    }
                }*/
                if (compiled.$filter) qs = qs.filter(compiled.$filter);
                if (compiled.$order){
                    for (var i = 0; i < compiled.$order.length; i++){
                        qs = qs[(JSON.parse(compiled.$order[i].direction) ? 'orderBy' : 'orderByDescending')](compiled.$order[i].fn);
                    }
                }
                if (compiled.$take) qs = qs.take(compiled.$take);
                if (compiled.$skip) qs = qs.skip(compiled.$skip);
                if (compiled.$length) qs.length(callback);
                else qs.toArray(callback);
            }
        });
    }else if (req.method === 'POST'){
        var entities = JSON.parse(req.body.items);
        $test.context = new $test.Context({ name: 'mongoDB', databaseName: 'storm' });
        $test.context.onReady(function(db){
            var callback = $data.typeSystem.createCallbackSetting({
                success: function(cnt){
                    res.write(JSON.stringify({ __count: cnt, items: entities.map(function(it){ return it.initData; }) }));
                    res.end();
                },
                error: function(err){
                    res.write(err.toString());
                    res.end();
                }
            });
            
            for (var i = 0; i < entities.length; i++){
                var e = entities[i];
                var item = new db[e.entitySet].createNew(e.data);
                entities[i] = item;
                switch (e.entityState){
                    case $data.EntityState.Added:
                        db[e.entitySet].add(item);
                        break;
                    case $data.EntityState.Deleted:
                        db[e.entitySet].remove(item);
                        break;
                    case $data.EntityState.Modified:
                        db[e.entitySet].attach(item);
                        item.entityState = $data.EntityState.Modified;
                        break;
                    default:
                        break;
                }
            }
            
            db.saveChanges(callback);
        });
    }
});

app.listen(3000);
