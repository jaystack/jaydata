var z = {
    type: 'init-compute-unit',
    appOwner: {'guid'},
    application: {
        {
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
                            method: ["GET","POST","HEAD"]
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
                        port: "80",
                        publish: false
                    },
                    {
                        type:"service",
                        serviceName: "CustomService",
                        port: "8080"
                    },
                    {
                        type:"service",
                        serviceName: "CustomService2",
                        extends: "Database1Service",
                        database: "Database3",
                        port: "8080"
                    }
                ]
            },
            applicationLayer : {
                type: ['micro', "|", 'small',"|","medium"],
                computeUnits: [
                    {
                        awsInstanceID: "spot1",
                        type: "compute-unit",
                        publicAddress: "ip-address",
                        internalAddress: "ip-address"
                    },
                    {
                        awsInstanceID: "spot2",
                        type: "compute-unit",
                        publicAddress: "ip-address",
                        internalAddress: "ip-address"
                    }]
            },
            dataLayer: {
                dbServer: "server1.local",
                databases: [{
                    type: "database",
                    name: "MyDB1"
                },{
                    type: "database",
                    name: "MyDB2"
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

}
