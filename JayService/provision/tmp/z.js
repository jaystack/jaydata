z = {
    type: 'init-compute-unit',
    appOwner: 'guid1',
    application: {
        type: 'application',
        appID: "guid",
        hosts: ["appID.jaystack.net","fubar.net","js.com"],
        serviceLayer: {
            services: [
                {
                    type:"service",
                    serviceName: "Database1Service",
                    database: "Database1",
                    port: 80,
                    internalPort: 60080,
                    publish: false
                },
                {
                    type:"service",
                    serviceName: "CustomService",
                    port: 8080,
                    ssl: true
                },
                {
                    type:"service",
                    serviceName: "CustomService2",
                    extends: "Database1Service",
                    database: "Database3",
                    port: 8080
                }
            ]
        },
        applicationLayer : {
            computeUnits: [
                {
                    awsInstanceID: "spot1",
                    type: "compute-unit",
                    publicAddress: "",
                },
                {
                    awsInstanceID: "spot2",
                    type: "compute-unit",
                    publicAddress: "ip-address",
                }]
        },
        dataLayer: {
            dbServer: "defaultserver1.local",
            databases: [{
                type: "database",
                name: "Database1"
            },{
                type: "database",
                name: "Database3",
                //dbServer: "otherdbserver"
            }
            ]
        },
        provision: {
            applications: [
                {
                    type: "application",
                    appID: "guid2",
                    hosts: [
                        "foobar.com",
                        "zoobar.net"
                    ],
                    dataLayer: {
                        dbServer: "server2.local"
                    }
                }
            ]
        }
   }

}
