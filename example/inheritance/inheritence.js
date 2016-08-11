var $data = require('../../dist/odata');
var TripPin = require('./TripPin');

TripPin.factory({ useParameterAlias: true }).onReady(function(ctx){
    //ctx.GetNearestAirport(47.4979, 19.0402, console.log.bind(console));
    /*ctx.getPeople('russellwhyte').getTrips(1003).getPlanItems(21).update(new ($data('Microsoft.OData.SampleService.Models.TripPin.Flight'))({
        ConfirmationCode: "JH58494_updated2"
    }), function(r){
        console.log('result:', r);
    });*/
    /*ctx.getPeople('russellwhyte').getTrips(1003).getPlanItems().create(new ($data('Microsoft.OData.SampleService.Models.TripPin.Event'))({
        "ConfirmationCode": "4372899DD",
        "Description": "Client Meeting",
        "Duration": "PT3H",
        "EndsAt": "2014-06-01T23:11:17.5479185-07:00",
        "OccursAt": {
            //"@odata.type": "#Microsoft.OData.SampleService.Models.TripPin.EventLocation",
            "Address": "100 Church Street, 8th Floor, Manhattan, 10007",
            "BuildingInfo": "Regus Business Center",
            "City": {
                //"@odata.type": "#Microsoft.OData.SampleService.Models.TripPin.City",
                "CountryRegion": "United States",
                "Name": "New York City",
                "Region": "New York"
            }
        },
        "PlanItemId": 33,
        "StartsAt": "2014-05-25T23:11:17.5459178-07:00"
    }), function(r){
        console.log('result:', r);
    });*/
    /*ctx.getPeople('russellwhyte').getTrips(1003).getPlanItems(21).delete(function(r){
        console.log('result:', r);
    });*/
    /*ctx.People.include('Trips.PlanItems').find('russellwhyte', function(r){
        //console.log(r.Trips[0].PlanItems);
    });*/
});