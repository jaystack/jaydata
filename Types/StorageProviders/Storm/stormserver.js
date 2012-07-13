require('mongodb');
var $data = require('jaydata');

require('../project/jaydata/Types/Access.js');
require('../project/jaydata/Types/ServiceOperation.js');
require('../project/jaydata/Types/StorageProviders/mongoDB/mongoDBStorageProvider.js');
require('../project/jaydata/Types/StorageProviders/Storm/StormStorageProvider.js');
require('../project/jaydata/Types/Query.js');
require('../project/jaydata/Types/Queryable.js');
require('../project/jaydata/Types/EntitySet.js');
require('../project/jaydata/Types/EntityContext.js');
require('../project/jaydata_borzav/Types/StorageProviders/InMemory/InMemoryCompiler.js');
require('../project/jaydata_borzav/Types/StorageProviders/InMemory/InMemoryFunctionCompiler.js');

require('./stormcontext.js');

var connect = require('connect');
var app = require('connect')();

app.use(connect.multipart());
app.use(connect.urlencoded());
app.use(connect.json());
app.use(connect.bodyParser());
app.use(connect.query());

app.use('/', function(req, res){
    if (req.method === 'GET'){
        $test.context = new $test.Context({ name: 'mongoDB', databaseName: 'storm' });
        $test.context.onReady(function(db){
            var callback = function(result){
                res.write(JSON.stringify(result));
                res.end();
            };
            
            var compiled = req.query.expression;
            
            var qs = db[req.query.entitySet];
            /*if (compiled.$include){
                for (var i = 0; i < compiled.$include.length; i++){
                    qs += '.include("' + compiled.$include[i] + '")';
                }
            }*/
            if (compiled.$filter) qs = qs.filter(compiled.$filter);
            if (compiled.$order){
                for (var i = 0; i < compiled.$order.length; i++){
                    qs = qs[compiled.$order[i].direction ? 'orderBy' : 'orderByDescending'](compiled.$order[i]);
                }
            }
            if (compiled.$skip) qs = qs.skip(compiled.$skip);
            if (compiled.$take) qs = qs.take(compiled.$take);
            if (compiled.$length) qs.length(callback);
            else qs.toArray(callback);
        });
    }else if (req.method === 'POST'){
        $test.context = new $test.Context({ name: 'mongoDB', databaseName: 'storm' });
        $test.context.onReady(function(db){
            var callback = $data.typeSystem.createCallbackSetting({
                success: function(cnt){
                    res.write(cnt.toString());
                    res.end();
                },
                error: function(err){
                    res.write('ohoh');
                    res.end();
                }
            });
            
            var collections = JSON.parse(req.body.items);
            
            for (var es in collections){
                var c = collections[es];
                if (c.insertAll && c.insertAll.length){
                    for (var i = 0; i < c.insertAll.length; i++)
                        db[es].add(c.insertAll[i]);
                }
                
                if (c.removeAll && c.removeAll.length){
                    for (var i = 0; i < c.removeAll.length; i++)
                        db[es].remove(c.removeAll[i]);
                }
                
                if (c.updateAll && c.updateAll.length){
                    for (var i = 0; i < c.updateAll.length; i++){
                        console.log('attach', c.updateAll[i]);
                        var item = new db[es].createNew(c.updateAll[i]);
                        db[es].attach(item);
                        item.entityState = $data.EntityState.Modified;
                    }
                }
            }
            
            console.log(JSON.stringify(collections));
            db.saveChanges(callback);
        });
    }
});

app.listen(3000);
