require('jaydata');
require('../JaySvcUtil/JaySvcUtil.js');

(function(){
    var config = {
        nginxTemplate: './nginx/nginx-host.conf',
        nginxConf: '/etc/nginx/sites-enabled/cu.conf',
        schemaAPI: 'http://localhost:3000/contextapi.svc',
        contextFile: './context.js',
        serviceFile: './service.js'
    };
    var handlebars = require('handlebars');
    var fs = require('fs');
    var connect = require('connect');
    var app = connect();
    
    var storm = require('./StormFactory.js');
    
    fs.readFile(config.nginxTemplate, 'utf8', function(err, contents) {
        if (err) throw err;
        var nginxTemplate = handlebars.compile(contents);
        
        app.use(connect.query());
        app.use(connect.bodyParser());
        
        app.use('/make', function(req, res){
            var jsonConf = req.body;
            var nginxConf = nginxTemplate(jsonConf);
            
            fs.writeFile(config.nginxConf, nginxConf, function(err){
                if (err) throw err;
                
                storm.contextFactory({
                    apiUrl: config.schemaAPI,
                    databases: jsonConf.application.dataLayer.databases,
                    filename: config.contextFile
                })(req, res, function(){
                    storm.serviceFactory({
                        services: jsonConf.application.serviceLayer.services,
                        context: config.contextFile,
                        filename: config.serviceFile
                    })(req, res, function(){
                        res.end();
                    });
                });
            });
        });
        
        app.listen(9999);
    });
})();
