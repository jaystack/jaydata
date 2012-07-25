/**
 * Created with JetBrains WebStorm.
 * User: zpace
 * Date: 7/6/12
 * Time: 8:00 PM
 * To change this template use File | Settings | File Templates.
 */
$data = require('jaydata');//["$data"];
service = require('./JayService.js');

require('./oDataMetaDataGenerator.js');


$data.Entity.extend("Demo.Person", {
    FirstName: { type: "string" },
    LastName: {type: "string" },
    Age: { type: "number" }
});

$data.ServiceBase.extend("Demo.Service", {

    MyFunkyFunction: service.serviceFunction()
        .param("a","number")
        .returnsArrayOf("number")
        (function(a) {
            return [5,6,7,8,9];
        }),


    GetPersonsByAge: function(age) {
        ///<param name="age" type="number" />
        ///<returns type="Array" />
        ///<elements type="Object" />
        return function(result, error) {

            result( [
                new Demo.Person({FirstName : "Viktor", LastName: 'Borza'}),
                new Demo.Person({FirstName : "Viktor", LastName: 'Lazar'})
            ]);
        }
    },

    MyOtherFunction: function(a,b,c) {
        ///<param name="a" type="string" />
        ///<param name="b" type="string" />
        ///<param name="c" type="number" />
        ///<returns type="Array" />
        ///<elements type="string" />
        return [a,b,c];
    },
    MyOtherFunctionX: function(a,b,c) {
        ///<param name="a" type="string" />
        ///<param name="b" type="string" />
        ///<param name="c" type="number" />
        ///<returns type="Object" />
        return [a,b,c];
    }
});

Demo.Service.annotateFromVSDoc();

//var adapter = service.createAdapter(ServiceClass,  instanceFactory);
var connect = require('connect');
var app = require('connect')();
app.use(connect.query());
app.use("/", connect.static("/home/zpace/JSService/"));
//app.use("/ServiceClass", adapter);
app.use("/x", service.createAdapter(Demo.Service, function() { return new Demo.Service} ));
//var myAdapter = service.createAdapter($abc.SVC, function() { return new $abc.SVC({name:'Facebook'}) });
//app.use("/my", myAdapter);

app.listen(3000);
console.log("started");