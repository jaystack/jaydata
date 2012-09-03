var http = require('http');

function send(options, data, callback){
    var req = http.request(options, function(res){
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function(chunk){
            data += chunk;
        });
        res.on('end', function(){
            (callback || console.log)(data);
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
        "serviceLayer": {
            "services": [
                {
                "type": "service",
                "allowAnonymous": true,
                "serviceName": "dbService",
                "allowedSubPathList": ["*"],
                "internalPort": 60080,
                "database": "db",
                "sourceType": "script",
                "source": "$data.ServiceBase.extend(\"dbService\", {\n ping: function(){\n /// <returnType type=\"string\"/>\n return 'ping';\n }\n});\n\ndbService.annotateFromVSDoc();",
                "ingress": [
                    {
                    "type": "allow",
                    "address": "*",
                    "port": 80
                    }
                ],
                "outgress": [
                    {
                    "type": "allow",
                    "origin": "*"
                    }
                ]
            },
            {
                "type": "service",
                "allowAnonymous": true,
                "serviceName": "bass",
                "allowedSubPathList": ["*"],
                "internalPort": 60080,
                "sourceType": "script",
                "source": "$data.ServiceBase.extend(\"dbService\", {\n ping: function(){\n /// <returnType type=\"string\"/>\n return 'ping';\n }\n});\n\ndbService.annotateFromVSDoc();",
                "ingress": [
                    {
                    "type": "allow",
                    "address": "*",
                    "port": 80
                    },
                    {
                    "type": "allow",
                    "address": "*",
                    "port": 443,
                    "ssl": true
                    }
                ]
            }
        ]
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
            dbServer: [{ address: '127.0.0.1', port: 27017 }],
            dbUser: 'admin',
            dbPwd: '***',
            databases: [{
                type: 'database',
                name: 'db'
            }]
        }
    }
}));

/*require('fs').readFile('./cuJavaScriptTest.js', 'utf8', function(err, content){
    send({
        host: 'localhost',
        port: 9999,
        path: '/eval',
        method: 'POST',
        headers: { 'content-type': 'application/json' }
    }, JSON.stringify({ js: content }), function(data){
        console.log(JSON.stringify(JSON.parse(data), null, '    '));
    });
});*/
