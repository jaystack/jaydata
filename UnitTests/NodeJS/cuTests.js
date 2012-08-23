var http = require('http');

function send(options, data){
    var req = http.request(options, function(res){
        res.setEncoding('utf8');
        res.on('data', function(chunk){
            console.log(chunk);
        });
    });

    req.on('error', function(err){
        throw err;
    });
    req.write(data);
    req.end();
}

send({
    host: 'localhost',
    port: 9999,
    path: '/make',
    method: 'POST',
    headers: { 'content-type': 'application/json' }
}, JSON.stringify({
    type: 'init-compute-unit',
    appOwner: 'guid',
    application: {
        type: 'application',
        appID: 'app1',
        hosts: ['app1.storm.jaystack.com'],
        processLogin: 'app1-username',
        processPassword: 'app1-password',
        firewall: {
            type: "firewall",
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
            services: [{
                serviceName: 'newsreader',
                database: 'NewsReader',
                port: 53999,
                authenticate: false,
                ssl: true
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
            dbServer: '127.0.0.1:27017',
            databases: [{
                type: 'database',
                name: 'NewsReader',
                dbServer: '192.168.1.111'
            }]
        }
    }
}));

require('fs').readFile('./cuJavaScriptTest.js', 'utf8', function(err, content){
    send({
        host: 'localhost',
        port: 9999,
        path: '/eval',
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    }, JSON.stringify({ js: content }));
});
