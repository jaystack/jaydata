var cluster = require('cluster');
var http = require('http');
var uuid = require('node-uuid');
var mongodb = require('mongodb');
//var sqlite = require('sqlite3');
var $data = require('jaydata');
var numCpus = require('os').cpus().length;

//require('./context.js');
require('./mongoDBStorageProvider.js');

$data.Entity.extend('$test.Item', {
    Id: { type: 'int', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' }
});

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item }
});

$test.context = new $test.Context({ name: 'mongoDB', databaseName: 'test' });

var numReqs = 0;

var workerId = uuid.v4();

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCpus; i++) {
    var worker = cluster.fork();

    worker.on('message', function(msg) {
      if (msg.cmd && msg.cmd == 'notifyRequest') {
        numReqs++;
        
        console.log("numReqs =", numReqs, "workerId =", msg.workerId);
      }
    });
    
    cluster.on('death', function(worker) {
      console.log('worker ' + worker.pid + ' died. restart...');
      var worker = cluster.fork();

        worker.on('message', function(msg) {
          if (msg.cmd && msg.cmd == 'notifyRequest') {
            numReqs++;
            
            console.log("numReqs =", numReqs, "workerId =", msg.workerId);
          }
        });
    });
  }
} else {
  //var cache = {};
  // Worker processes have a http server.
  http.Server(function(req, res) {
    if (req.url == '/favicon.ico'){
        res.writeHead(404);
        res.end();
        return;
    }
    res.writeHead(200, {'Content-Type': 'text/plain; charset=utf-8'});
    /*var errCallback = function(){
		res.end("something went wrong... ;(");
	};
	
    var db = openDatabase("winkles", "1.0", "Winkles Of The World", 32678);
    
    db.transaction(function(transaction){
		transaction.executeSql("CREATE TABLE IF NOT EXISTS winkles (" +
			"id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
			"winklename TEXT NOT NULL, location TEXT NOT NULL);");
	});
	
	var saveWinkle = function(winklename, location, successCallback){
		db.transaction(function(transaction){
			transaction.executeSql(("INSERT INTO winkles (winklename, location) VALUES (?, ?);"), 
			[winklename, location], function(transaction, results){successCallback(results.rows);}, errCallback);
		});
	};

	var loadWinkles = function(location, successCallback){
		db.transaction(function(transaction){
			transaction.executeSql(("SELECT * FROM winkles"), [],
				function(transaction, results){successCallback(results);}, errCallback);
			});
	};
	
	saveWinkle(uuid.v4(), uuid.v4(), function(){
	    loadWinkles(undefined, function(data){
	        res.write(data.length + ' winkles from workerId = ' + workerId + '\n');
            for (var i = 0; i < data.length; i++){
                var r = data.item(i);
                res.write(r.winklename + ' - ' + r.location + '\n');
            }
            res.end();
	    });
	});*/
	
	/*var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.cached.Database('lorem');

    db.serialize(function() {
      db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)");

      var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
      for (var i = 0; i < 1000; i++) {
          stmt.run(uuid.v4());
      }
      stmt.finalize();

      db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
          console.log(row.id + ": " + row.info);
          //res.write(row.id + ": " + row.info);
      });
    });

    db.close();*/
    
    process.send({ cmd: 'notifyRequest', workerId: workerId });
    var server = mongodb.Server('127.0.0.1', 27017, {});
    new mongodb.Db('test', server, {}).open(function(error, client){
        if (error){ res.end(); throw error; }
        var collection = new mongodb.Collection(client, 'test_collection');
        var all = new Array(1000);
        for (var i = 0; i < 1000; i++) all[i] = { guid: uuid.v4() };
        collection.insert(all, {}, function(error, objects){
            if (error){ res.end(); throw error; }
            collection.count(function(error, count){
                if (error){ res.end(); throw error; }
                res.write('guid count: ' + count + '\n');
                res.end();
                client.close();
                /*collection.find().toArray(function(error, results){
                    if (error){ res.end(); throw error; }
                    for (var i = 0; i < results.length; i++){
                        res.write(results[i].guid + '\n');
                    }
                    res.end();
                    client.close();
                });*/
            });
        });
    });
    
    //res.end('hello avan');
	
    /*Northwind.context = new Northwind.NorthwindContainer( { name:'sqLite', databaseName: 'northwind3.sqlite' });
    Northwind.context.onReady(function(db){
        process.send({ cmd: 'notifyRequest', workerId: workerId });
        for (var i = 0; i < 100; i++){
            db.Products.add(new Northwind.Product({
                ProductName: uuid.v4()
            }));
        }
        db.saveChanges({
            success: function(){
                db.Products.toArray({
                    success: function(data){
                        res.write(data.length + ' products from workerId = ' + workerId + '\n');
                        for (var i = 0; i < data.length; i++){
                            res.write(data[i].ProductName + '\n');
                        }
                        res.end();
                    },
                    error: function(err){
                        console.log(err);
                        res.end('something went wrong... ;(');
                    }
                });
            },
            error: function(err){
                console.log(err);
                res.end('something went wrong... ;(');
            }
        });
    });*/
    /*new sqlite.Database('jay', sqlite.OPEN_CREATE | sqlite.OPEN_READWRITE, function(err){
        //console.log(err, db);
        
        
        if (!err) res.end('open database from worker process ' + workerId);
        else res.end('error from worker process ' + workerId);
    });*/
    /*for (var i = 0; i < 10000; i++){
        var n = uuid.v4();
        if (cache[n]) cache[n]++;
        else cache[n] = 1;
    }*/
    //res.end("hello world with " + Object.getOwnPropertyNames(cache).length + " cache items\n");
    // Send message to master process
    //process.send({ cmd: 'notifyRequest', workerId: workerId });
  }).listen(80);
}
