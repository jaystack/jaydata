/**
 * Created with JetBrains WebStorm.
 * User: zpace
 * Date: 7/6/12
 * Time: 8:00 PM
 * To change this template use File | Settings | File Templates.
 */
require('jaydata');//["$data"];

$data.Entity.extend("Demo.Person", {
    FirstName:{ type:"string" },
    LastName:{type:"string" },
    Age:{ type:"number" }
});

$data.ServiceBase.extend("Demo.Service", {

    MyFunkyFunction:$data.JayService.serviceFunction()
        .param("a", "number")
        .returnsArrayOf("number")
        (function (a) {
            return [5, 6, 7, 8, 9];
        }),


    SomeFunction: function(a,b,c) {
        return 42;
    },

    GetPersonsByAge: $data.JayService.serviceFunction().
        param("age", "Array").
        returnsArrayOf("Demo.Person")
        (function (age) {
            return [ new Demo.Person({FirstName:"Viktor", LastName:'Borza'}), new Demo.Person({FirstName:"Viktor", LastName:'Lazar'}) ];
        }),

    MyOtherFunction:function (a, b, c) {
        ///<param name="a" type="string" />
        ///<param name="b" type="string" />
        ///<param name="c" type="number" />
        ///<returns type="Array" elementType="Object" />
        return [ new Demo.Person({FirstName:"Viktor", LastName:'Borza'}), new Demo.Person({FirstName:"Viktor", LastName:'Lazar'}) ];
    },

    MyOtherFunctionX:function (a, b, c) {
        ///<param name="a" type="string" />
        ///<param name="b" type="string" />
        ///<param name="c" type="number" />
        ///<returns type="Object" />
        return [a, b, c];
    }
});

Demo.Service.annotateFromVSDoc();

//var adapter = service.createAdapter(ServiceClass,  instanceFactory);
var connect = require('connect');
var app = require('connect')();
app.use(connect.query());
app.use("/", connect.static("../"));
//app.use("/ServiceClass", adapter);
app.use("/x", $data.JayService.createAdapter(Demo.Service, function () {
    return new Demo.Service
}));
//var myAdapter = service.createAdapter($abc.SVC, function() { return new $abc.SVC({name:'Facebook'}) });
//app.use("/my", myAdapter);

app.listen(3001);
console.log("started");