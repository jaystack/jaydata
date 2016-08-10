var $data = require('../../dist/odata');
var TripPin = require('./TripPin');

TripPin.factory({ useParameterAlias: true }).onReady(function(ctx){
    ctx.GetNearestAirport(47.4979, 19.0402, console.log.bind(console));
    ctx.getPeople('russellwhyte').getTrips(1003).getPlanItems(21).read(function(r){
        console.log(r);
    });
    ctx.People.include('Trips.PlanItems').find('russellwhyte', function(r){
        console.log(r.Trips[0].PlanItems);
    });
});