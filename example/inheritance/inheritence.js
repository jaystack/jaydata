var $data = require('../../dist/odata');
var TripPin = require('./TripPin');

TripPin.factory({ useParameterAlias: true }).onReady(function(ctx){
    ctx.People
    .include('Trips.PlanItems')
    .filter(function(it){ return it.UserName == this.id; }, { id: 'russellwhyte', trip: 1003 })
    .toArray(function(result){
        console.log(result[0].initData.Trips[1].initData.PlanItems);
    });
});