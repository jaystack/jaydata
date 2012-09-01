z = {
    type: 'init-compute-unit',
    appOwner: 'guid1',
    application: {
        type: 'application',
        appID: "guid",
        hosts: ["appID.jaystack.net","fubar.net","js.com"],
        processLogin: "app1-user",
        processPassword: "app1-password",
        firewall: {
            type: "firewall",
            ingress: {

                allows: [
                    {
                        type: "allow",
                        address: "195.7.12.12/12",
                        port: ["80"]
                    },
                    {
                        type: "allow",
                        address: "*",
                        port: ["80","1025","9999"]
                    }

                ]

            },
            outgress: {
                allows: [
                    {
                        type: "allow",
                        address: "facebook.com",
                        method: ["GET","POST","HEAD"]
                    },
                    {
                        type: "allow",
                        address: "*",
                        method: ["GET"]
                    }

                ]
            }
        },
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
            type: ['micro', "|", 'small',"|","medium"],
            computeUnits: [
                {
                    awsInstanceID: "spot1",
                    type: "compute-unit",
                    publicAddress: "",
                    internalAddress: "127.0.0.1"
                },
                {
                    awsInstanceID: "spot2",
                    type: "compute-unit",
                    publicAddress: "ip-address",
                    internalAddress: "127.0.0.1"
                }]
        },
        dataLayer: {
            dbServer: "server1.local",
            databases: [{
                type: "database",
                name: "Database1"
            },{
                type: "database",
                name: "Database3",
                dbServer: "otherdbserver"
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
