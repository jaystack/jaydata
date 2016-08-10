(function(mod) {
    if (typeof exports == "object" && typeof module == "object") return mod(exports, require("../../dist/core.js")); // CommonJS
    if (typeof define == "function" && define.amd) return define(["exports", "jaydata/core"], mod); // AMD
    mod($data.generatedContext || ($data.generatedContext = {}), $data); // Plain browser env
})(function(exports, $data) {

    var types = {};

    types["Microsoft.OData.SampleService.Models.TripPin.PersonGender"] = $data.createEnum("Microsoft.OData.SampleService.Models.TripPin.PersonGender", [{
        "name": "Male",
        "index": 0,
        "value": 0
    }, {
        "name": "Female",
        "index": 1,
        "value": 1
    }, {
        "name": "Unknown",
        "index": 2,
        "value": 2
    }]);

    types["Microsoft.OData.SampleService.Models.TripPin.City"] = $data("$data.Entity").extend("Microsoft.OData.SampleService.Models.TripPin.City", {
        CountryRegion: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        Name: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        Region: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.Location"] = $data("$data.Entity").extend("Microsoft.OData.SampleService.Models.TripPin.Location", {
        Address: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        City: {
            "type": "Microsoft.OData.SampleService.Models.TripPin.City",
            "nullable": false,
            "required": true
        }
    }, {
        openType: {
            "value": true
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.EventLocation"] = types["Microsoft.OData.SampleService.Models.TripPin.Location"].extend("Microsoft.OData.SampleService.Models.TripPin.EventLocation", {
        BuildingInfo: {
            "type": "Edm.String"
        }
    }, {
        openType: {
            "value": true
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.AirportLocation"] = types["Microsoft.OData.SampleService.Models.TripPin.Location"].extend("Microsoft.OData.SampleService.Models.TripPin.AirportLocation", {
        Loc: {
            "type": "Edm.GeographyPoint",
            "nullable": false,
            "required": true
        }
    }, {
        openType: {
            "value": true
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.Photo"] = $data("$data.Entity").extend("Microsoft.OData.SampleService.Models.TripPin.Photo", {
        Id: {
            "type": "Edm.Int64",
            "nullable": false,
            "required": true,
            "key": true
        },
        Name: {
            "type": "Edm.String"
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.Person"] = $data("$data.Entity").extend("Microsoft.OData.SampleService.Models.TripPin.Person", {
        UserName: {
            "type": "Edm.String",
            "nullable": false,
            "required": true,
            "key": true
        },
        FirstName: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        LastName: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        Emails: {
            "type": "Array",
            "elementType": "Edm.String"
        },
        AddressInfo: {
            "type": "Array",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Location"
        },
        Gender: {
            "type": "Microsoft.OData.SampleService.Models.TripPin.PersonGender"
        },
        Concurrency: {
            "type": "Edm.Int64",
            "nullable": false,
            "computed": true,
            "concurrencyMode": $data.ConcurrencyMode.Fixed
        },
        Friends: {
            "type": "Array",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Person",
            "inverseProperty": "$$unbound"
        },
        Trips: {
            "type": "Array",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Trip",
            "inverseProperty": "$$unbound"
        },
        Photo: {
            "type": "Microsoft.OData.SampleService.Models.TripPin.Photo",
            "inverseProperty": "$$unbound"
        },
        ShareTrip: {
            "type": "$data.ServiceAction",
            "namespace": "Microsoft.OData.SampleService.Models.TripPin",
            "returnType": null,
            "params": [{
                "name": "userName",
                "type": "Edm.String"
            }, {
                "name": "tripId",
                "type": "Edm.Int32"
            }]
        },
        GetFavoriteAirline: {
            "type": "$data.ServiceFunction",
            "namespace": "Microsoft.OData.SampleService.Models.TripPin",
            "returnType": "Microsoft.OData.SampleService.Models.TripPin.Airline",
            "params": []
        },
        GetFriendsTrips: {
            "type": "$data.ServiceFunction",
            "namespace": "Microsoft.OData.SampleService.Models.TripPin",
            "returnType": "$data.Queryable",
            "params": [{
                "name": "userName",
                "type": "Edm.String"
            }],
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Trip"
        }
    }, {
        openType: {
            "value": true
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.Airline"] = $data("$data.Entity").extend("Microsoft.OData.SampleService.Models.TripPin.Airline", {
        AirlineCode: {
            "type": "Edm.String",
            "nullable": false,
            "required": true,
            "key": true
        },
        Name: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.Airport"] = $data("$data.Entity").extend("Microsoft.OData.SampleService.Models.TripPin.Airport", {
        IcaoCode: {
            "type": "Edm.String",
            "nullable": false,
            "required": true,
            "key": true
        },
        Name: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        IataCode: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        Location: {
            "type": "Microsoft.OData.SampleService.Models.TripPin.AirportLocation",
            "nullable": false,
            "required": true
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.PlanItem"] = $data("$data.Entity").extend("Microsoft.OData.SampleService.Models.TripPin.PlanItem", {
        PlanItemId: {
            "type": "Edm.Int32",
            "nullable": false,
            "required": true,
            "key": true
        },
        ConfirmationCode: {
            "type": "Edm.String"
        },
        StartsAt: {
            "type": "Edm.DateTimeOffset"
        },
        EndsAt: {
            "type": "Edm.DateTimeOffset"
        },
        Duration: {
            "type": "Edm.Duration"
        },
        Trip: {
            type: 'Microsoft.OData.SampleService.Models.TripPin.Trip'
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.PublicTransportation"] = types["Microsoft.OData.SampleService.Models.TripPin.PlanItem"].extend("Microsoft.OData.SampleService.Models.TripPin.PublicTransportation", {
        SeatNumber: {
            "type": "Edm.String"
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.Flight"] = types["Microsoft.OData.SampleService.Models.TripPin.PublicTransportation"].extend("Microsoft.OData.SampleService.Models.TripPin.Flight", {
        FlightNumber: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        From: {
            "type": "Microsoft.OData.SampleService.Models.TripPin.Airport",
            "nullable": false,
            "required": true,
            "inverseProperty": "$$unbound"
        },
        To: {
            "type": "Microsoft.OData.SampleService.Models.TripPin.Airport",
            "nullable": false,
            "required": true,
            "inverseProperty": "$$unbound"
        },
        Airline: {
            "type": "Microsoft.OData.SampleService.Models.TripPin.Airline",
            "nullable": false,
            "required": true,
            "inverseProperty": "$$unbound"
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.Event"] = types["Microsoft.OData.SampleService.Models.TripPin.PlanItem"].extend("Microsoft.OData.SampleService.Models.TripPin.Event", {
        Description: {
            "type": "Edm.String"
        },
        OccursAt: {
            "type": "Microsoft.OData.SampleService.Models.TripPin.EventLocation",
            "nullable": false,
            "required": true
        }
    }, {
        openType: {
            "value": true
        }
    });

    types["Microsoft.OData.SampleService.Models.TripPin.Trip"] = $data("$data.Entity").extend("Microsoft.OData.SampleService.Models.TripPin.Trip", {
        TripId: {
            "type": "Edm.Int32",
            "nullable": false,
            "required": true,
            "key": true
        },
        ShareId: {
            "type": "Edm.Guid"
        },
        Description: {
            "type": "Edm.String"
        },
        Name: {
            "type": "Edm.String",
            "nullable": false,
            "required": true
        },
        Budget: {
            "type": "Edm.Single",
            "nullable": false,
            "required": true
        },
        StartsAt: {
            "type": "Edm.DateTimeOffset",
            "nullable": false,
            "required": true
        },
        EndsAt: {
            "type": "Edm.DateTimeOffset",
            "nullable": false,
            "required": true
        },
        Tags: {
            "type": "Array",
            "elementType": "Edm.String",
            "nullable": false,
            "required": true
        },
        Photos: {
            "type": "Array",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Photo",
            "inverseProperty": "$$unbound"
        },
        PlanItems: {
            "type": "Array",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.PlanItem",
            "inverseProperty": "$$unbound"
        },
        GetInvolvedPeople: {
            "type": "$data.ServiceFunction",
            "namespace": "Microsoft.OData.SampleService.Models.TripPin",
            "returnType": "$data.Queryable",
            "params": [],
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Person"
        }
    });

    exports.type = types["Microsoft.OData.SampleService.Models.TripPin.DefaultContainer"] = $data("$data.EntityContext").extend("Microsoft.OData.SampleService.Models.TripPin.DefaultContainer", {
        Photos: {
            "type": "$data.EntitySet",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Photo"
        },
        People: {
            "type": "$data.EntitySet",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Person"
        },
        Airlines: {
            "type": "$data.EntitySet",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Airline"
        },
        Airports: {
            "type": "$data.EntitySet",
            "elementType": "Microsoft.OData.SampleService.Models.TripPin.Airport"
        },
        ResetDataSource: {
            "type": "$data.ServiceAction",
            "returnType": null,
            "params": []
        },
        GetNearestAirport: {
            "type": "$data.ServiceFunction",
            "returnType": "Microsoft.OData.SampleService.Models.TripPin.Airport",
            "params": [{
                "name": "lat",
                "type": "Edm.Double"
            }, {
                "name": "lon",
                "type": "Edm.Double"
            }]
        }
    });

    var ctxType = exports.type;
    exports.factory = function(config) {
        if (ctxType) {
            var cfg = $data.typeSystem.extend({
                name: "oData",
                oDataServiceHost: "http://services.odata.org/V4/(S(wpi040cv1vije4pw4qqws3vy))/TripPinServiceRW",
                withCredentials: false,
                maxDataServiceVersion: "4.0"
            }, config);
            return new ctxType(cfg);
        } else {
            return null;
        }
    };

    if (typeof Reflect !== "undefined" && typeof Reflect.defineMetadata === "function") {
        Reflect.defineMetadata("Org.OData.Core.V1.Permissions", "Org.OData.Core.V1.Permission/Read", types["Microsoft.OData.SampleService.Models.TripPin.Photo"].prototype, "Id")
        Reflect.defineMetadata("Org.OData.Core.V1.AcceptableMediaTypes", ["image/jpeg"], types["Microsoft.OData.SampleService.Models.TripPin.Photo"].prototype)
        Reflect.defineMetadata("Org.OData.Core.V1.Permissions", "Org.OData.Core.V1.Permission/Read", types["Microsoft.OData.SampleService.Models.TripPin.Person"].prototype, "UserName")
        Reflect.defineMetadata("Org.OData.Core.V1.Computed", "true", types["Microsoft.OData.SampleService.Models.TripPin.Person"].prototype, "Concurrency")
        Reflect.defineMetadata("Org.OData.Core.V1.Permissions", "Org.OData.Core.V1.Permission/Read", types["Microsoft.OData.SampleService.Models.TripPin.Airline"].prototype, "AirlineCode")
        Reflect.defineMetadata("Org.OData.Core.V1.Permissions", "Org.OData.Core.V1.Permission/Read", types["Microsoft.OData.SampleService.Models.TripPin.Airport"].prototype, "IcaoCode")
        Reflect.defineMetadata("Org.OData.Core.V1.Immutable", "true", types["Microsoft.OData.SampleService.Models.TripPin.Airport"].prototype, "IataCode")
        Reflect.defineMetadata("Org.OData.Core.V1.Permissions", "Org.OData.Core.V1.Permission/Read", types["Microsoft.OData.SampleService.Models.TripPin.PlanItem"].prototype, "PlanItemId")
        Reflect.defineMetadata("Org.OData.Core.V1.Permissions", "Org.OData.Core.V1.Permission/Read", types["Microsoft.OData.SampleService.Models.TripPin.Trip"].prototype, "TripId")
        Reflect.defineMetadata("Org.OData.Measures.V1.ISOCurrency", "USD", types["Microsoft.OData.SampleService.Models.TripPin.Trip"].prototype, "Budget")
        Reflect.defineMetadata("Org.OData.Measures.V1.Scale", "2", types["Microsoft.OData.SampleService.Models.TripPin.Trip"].prototype, "Budget")
        Reflect.defineMetadata("Org.OData.Core.V1.ResourcePath", "Photos", types["Microsoft.OData.SampleService.Models.TripPin.Photo"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.SearchRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Photo"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.InsertRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Photo"].prototype)
        Reflect.defineMetadata("Org.OData.Core.V1.OptimisticConcurrency", ["Concurrency"], types["Microsoft.OData.SampleService.Models.TripPin.Person"].prototype)
        Reflect.defineMetadata("Org.OData.Core.V1.ResourcePath", "People", types["Microsoft.OData.SampleService.Models.TripPin.Person"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.NavigationRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Person"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.SearchRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Person"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.InsertRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Person"].prototype)
        Reflect.defineMetadata("Org.OData.Core.V1.ResourcePath", "Airlines", types["Microsoft.OData.SampleService.Models.TripPin.Airline"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.SearchRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Airline"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.InsertRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Airline"].prototype)
        Reflect.defineMetadata("Org.OData.Core.V1.ResourcePath", "Airports", types["Microsoft.OData.SampleService.Models.TripPin.Airport"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.SearchRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Airport"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.InsertRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Airport"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.DeleteRestrictions", undefined, types["Microsoft.OData.SampleService.Models.TripPin.Airport"].prototype)
        Reflect.defineMetadata("Org.OData.Core.V1.DereferenceableIDs", "true", types["Microsoft.OData.SampleService.Models.TripPin.DefaultContainer"].prototype)
        Reflect.defineMetadata("Org.OData.Core.V1.ConventionalIDs", "true", types["Microsoft.OData.SampleService.Models.TripPin.DefaultContainer"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.ConformanceLevel", "Org.OData.Capabilities.V1.ConformanceLevelType/Advanced", types["Microsoft.OData.SampleService.Models.TripPin.DefaultContainer"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.SupportedFormats", ["application/json;odata.metadata=full;IEEE754Compatible=false;odata.streaming=true", "application/json;odata.metadata=minimal;IEEE754Compatible=false;odata.streaming=true", "application/json;odata.metadata=none;IEEE754Compatible=false;odata.streaming=true"], types["Microsoft.OData.SampleService.Models.TripPin.DefaultContainer"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.AsynchronousRequestsSupported", "true", types["Microsoft.OData.SampleService.Models.TripPin.DefaultContainer"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.BatchContinueOnErrorSupported", "false", types["Microsoft.OData.SampleService.Models.TripPin.DefaultContainer"].prototype)
        Reflect.defineMetadata("Org.OData.Capabilities.V1.FilterFunctions", ["contains", "endswith", "startswith", "length", "indexof", "substring", "tolower", "toupper", "trim", "concat", "year", "month", "day", "hour", "minute", "second", "round", "floor", "ceiling", "cast", "isof"], types["Microsoft.OData.SampleService.Models.TripPin.DefaultContainer"].prototype)
    }

});