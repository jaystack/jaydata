
require('jaydata');
var connect = require('connect');

//annotate with JSON Schema
$data.Entity.extend("Demo.Person", {
    FirstName: { type:"string", required: true },
    LastName: {type:"string" , required: true},
    Age: { type:"number", required: true, minValue: 1, maxValue: 150 }
});

//annotate with JSON Schema
$data.Entity.extend("Demo.Order", {
    OrderDate: { type:"date", required: true },
    PersonName: {type:"string" , required: true},
    Amount: { type:"number", required: true }
});

$data.ServiceBase.extend("Demo.PersonAPI", {

    //annotate with fluent api
    createPerson:$data.JayService.serviceFunction()
        .param("firstName", "string")
        .param("lastName", "string")
        .param("age","number")
        .returns("Demo.Person")
        (function (firstName, lastName, age) {
            //call to storage, omitted
            return new Demo.Person( { FirstName: firstName, LastName: lastName, Age: age})
        }),

    //annotate with comments
    getPersonsByAge: function (age) {
            ///<param name="age" type="number" />
            ///<returns type="Array" elementType="Demo.Person" />
            return [
                new Demo.Person({FirstName:"Viktor", LastName:'Borza', Age: age}),
                new Demo.Person({FirstName:"Viktor", LastName:'Lazar', Age: age})
            ];
        },

    constructor: function() {
        this.internalFunction = function() {
            //not visible on OData endpoint
        }
    }
});

Demo.PersonAPI.annotateFromVSDoc();

//publish service
var app = connect();
app.use(connect.query());
app.use("/personApi", $data.JayService.createAdapter(Demo.PersonAPI));
app.listen(3001);
console.log("started");














//app.use("/", connect.static("../"));
//app.use("/ServiceClass", adapter);
