var http = require('http');

var req = http.request({
    host: 'localhost',
    port: 9999,
    path: '/make',
    method: 'POST',
    headers: { 'content-type': 'application/json' }
}, function(res){
    res.setEncoding('utf8');
    res.on('data', function(chunk){
        console.log(chunk);
    });
});

req.on('error', function(err){
    throw err;
});
req.write(JSON.stringify({
    type: 'init-compute-unit',
    appOwner: 'guid',
    application: {
        type: 'application',
        appID: 'app1',
        hosts: ['app1.storm.jaystack.com'],
        processLogin: 'app1-username',
        processPassword: 'app1-password',
        serviceLayer: {
            services: [{
                serviceName: 'newsreader',
                database: 'NewsReader',
                port: 53999
            }]
        },
        applicationLayer: {
            type: ['micro', '|', 'small', '|', 'medium'],
            computeUnits: [{
                awsInstanceID: 'spot1',
                type: 'compute-unit',
                publicAddress: '127.0.0.1',
                internalAddress: '127.0.0.1'
            }]  
        },
        dataLayer: {
            dbServer: [{
                address: '127',
                port: 27017
            }],
            databases: [{
                type: 'database',
                name: 'NewsReader'
            }, {
                type: 'database',
                name: 'ReplicaSet',
                dbServer: [{
                    address: '127',
                    port: 27017
                }, {
                    address: '',
                    port: 27018
                }]
            }]
        }
    }
}));
req.end();
