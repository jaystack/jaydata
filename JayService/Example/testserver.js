
//var nodetime = require('nodetime');
//nodetime.profile();



require('jaydata');

var connect = require('connect');
var app = connect();


$data.Class.define('$example.Person', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int' },
    //Orders: { type: 'Array', elementType: '$example.Order', inverseProperty: 'Person' }
});

$data.Class.define('$example.Order', $data.Entity, null, {
    Id: { type: 'id', key: true, computed: true },
    Value: { type: 'int' },
    Date: { type: 'date' },
    Completed: { type: 'bool' },
    //Person: { type: '$example.Person', inverseProperty: 'Orders' }
});

var testData = [
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 })
];

var mongo = { driver: $data.mongoDBDriver };
var server = mongo.driver.Server('127.0.0.1', 27017, {});
var pClient;
var pError;
var collection;

if ($data.classTimers) {
    $data.classTimers['MongoLoaded'] = 0;
    $data.classTimers.__count['MongoLoaded'] = 0;

    $data.classTimers['JSObjectRequest'] = 0;
    $data.classTimers.__count['JSObjectRequest'] = 0;
}

var db = new mongo.driver.Db('testserviceDb', server, {}).open(function (error, client) {
    pClient = client;
    pError = error;
    collection = new mongo.driver.Collection(pClient, 'People');

});
$data.Class.defineEx('$example.Context', [$data.EntityContext, $data.ServiceBase], null, {
    People: { type: $data.EntitySet, elementType: $example.Person },
    Orders: { type: $data.EntitySet, elementType: $example.Order },
    //120
    EsLoaded: function () {
        ///<returns type="Array" elementType="$example.Person" />

        var self = this;
        return function () {

            var asda = this;
            self.context.People/*.map(function (a) { return { Id: a.Id, Name: a.Name, Description: a.Description, Age: a.Age }; })*/.toArray({
                success: function (ddd) {
                    asda.success(ddd);
                }, error: function () {
                    console.log('error');
                }
            });
        }
    },
    //230
    ProviderLoaded: function () {
        ///<returns type="Array" elementType="Object" />

        var self = this;
        return function () {

            var asda = this;

            var toArrayExp = Container.createToArrayExpression(this.context.expression);
            var query = new $data.Query(toArrayExp, $example.Person, this.context);
            self.context.storageProvider.executeQuery(query, {
                success: function (data) {
                    asda.success(data.rawDataList);
                },
                error: function () {
                },

            });

            //self.context.People/.toArray({
            //    success: function (ddd) {
            //        testData = ddd;
            //        asda.success(ddd);
            //    }, error: function () {
            //        console.log('error');
            //    }
            //});
        }
    },
    ProviderLoaded2: function () {
        ///<returns type="Array" elementType="$example.Person" />

        var self = this;
        return function () {

            var asda = this;

            var toArrayExp = Container.createToArrayExpression(this.context.expression);
            var query = new $data.Query(toArrayExp, $example.Person, this.context);
            self.context.storageProvider.executeQuery(query, {
                success: function (data) {
                    asda.success(data.rawDataList);
                },
                error: function () {
                },

            });

            //self.context.People/.toArray({
            //    success: function (ddd) {
            //        testData = ddd;
            //        asda.success(ddd);
            //    }, error: function () {
            //        console.log('error');
            //    }
            //});
        }
    },
    //240
    MongoLoaded: function () {
        ///<returns type="Array" elementType="$example.Person" />

        var self = this;
        return function () {
            var callBack = this;

            var startDate = new Date().valueOf();

            var mongo = { driver: $data.mongoDBDriver };
            var server = mongo.driver.Server('127.0.0.1', 27017, {});
            var db = new mongo.driver.Db('testserviceDb', server, {}).open(function (error, client) {
                if (client) {
                    var collection = new mongo.driver.Collection(client, 'People');
                    collection.find({ query: {} }, {}).toArray(function (error, results) {
                        if (error) { callBack.error(error); return; }

                        client.close(true, function () {
                            if ($data.classTimers) {
                                $data.classTimers['MongoLoaded'] += new Date().valueOf() - startDate;
                                $data.classTimers.__count['MongoLoaded']++;
                            }
                            callBack.success(results);
                        });
                    });
                } else callBack.error(error);
            });



        }
    },
    MongoLoaded2: function () {
        ///<returns type="Array" elementType="Object" />


        var self = this;
        return function () {
            var callBack = this;


            collection.find({ query: {} }).toArray(function (error, results) {
                if (error) { callBack.error(error); return; }

                callBack.success(results);
            });

        }
    },
    Created: function () {
        ///<returns type="Array" elementType="$example.Person" />
        return [
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 }),
            new $example.Person({ Id: 'adadadadaqeqe', Name: 'asdadasd', Description: 'qweqeqweqweqweeeeeeeeeeeeeeeeeeeeeeeeeeeeq', Age: 1 })
        ];
    },
    Pinned: function () {
        ///<returns type="Array" elementType="$example.Person" />

        return testData;
    },
    Const: function () {
        ///<returns type="string" />

        return 'hello world'
    },
    Timer: function () {
        ///<returns type="Object" />

        var res = { __count: {} };
        for (var t in $data.classTimers) {
            if ($data.classTimers.__count[t]) {
                res.__count[t] = $data.classTimers.__count[t];

                if ($data.classTimers[t])
                    res[t] = $data.classTimers[t];
            }
        }

        return {
            d: res,
            ctor: this.context.getType().toString()
        }
    }
});

$example.Context.annotateFromVSDoc();

app.use(connect.query());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);

app.use("/", connect.static("/home/borzav/sf/jay/jaydata"));
app.use("/myservice", $data.JayService.createAdapter($example.Context, function () {
    return new $example.Context({ name: 'mongoDB', databaseName: 'testserviceDb' });
}));

app.listen(3000);


var app2 = connect();
app2.use('/ab.svc', function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.end('Hello World!');
});

app2.listen(3001);