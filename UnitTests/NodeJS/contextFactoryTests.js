require('jaydata');
require('../../JaySvcUtil/JaySvcUtil.js');

var connect = require('connect');
var app = connect();

var storm = require('../../JayService/StormFactory.js');

app.use(storm.contextFactory({
    apiUrl: 'http://localhost:3000/contextapi.svc',
    databases: [{ name: 'NewsReader' }],
    filename: './context.js'
}));

app.use(storm.serviceFactory({
    services: [{
        serviceName: 'newsreader',
        database: 'NewsReader',
        port: 53999
    }],
    context: './context.js',
    filename: './service.js'
}));

app.use(function(req, res, next){
    require('./service.js');
    next();
});

app.listen(9999);
