require('odata');
require('jaydata');
var Q = require('q');

var connect = require('connect');



var app = connect();
app.use("/", function(req, res) {
    $data.serviceClient('http://342-cu.amazon.jaystack.net/personApi').then( function(context) {


        context.getPersonsByAge(100, function(persons) {
            persons.forEach(function(person) {
               res.write("Person: " + person.FirstName + "(" + person.Age + ")");
            });
            res.end("Total number of persons a century old:" + persons.length);
        })
    });

}).listen(3002);


