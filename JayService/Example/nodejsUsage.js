require('datajs');
require('jaydata');

var connect = require('connect');
var app = connect();

app.use("/", function (req, res) {
    $data.serviceClient('http://1-cu.amazon.jaystack.net:3000/myservice/').then(function (context) {

        context.People.toArray(function (a) { console.log(a); })

        context.People
            .map(function (u) { return u.Name })
            .toArray(function (u) { console.log(u); });

        context.People
            .filter(function (u) { return u.Name == 'Peter' && u.Age > 30 })
            .toArray(function (u) { console.log(u); });

        context.People
            .filter(function (u) { return u.Name == 'Peter' && u.Age > 30 })
            .orderByDescending(function (a) { return a.Name })
            .toArray(function (a) { console.log(a); });

        context.Orders
            .filter(function (u) { return u.Person.Name == 'Peter' && u.Date > new Date() })
            .toArray(function (a) { console.log(a); });
    });
});

app.listen(3002);