require('jaydata');
require('../JaySvcUtil/JaySvcUtil.js');

(function(){
    var config = {
        nginxTemplate: './nginx/nginx-host.conf',
        nginxConf: '/etc/nginx/sites-enabled/cu.conf',
        schemaAPI: 'http://localhost:3000/contextapi.svc',
        serviceAPI: 'http://localhost:3000/contextapi.svc',
        contextFile: './context.js',
        serviceFile: './service.js',
        localIP: require('os').networkInterfaces()['eth0'][0].address
    };
    
    var handlebars = require('handlebars');
    var fs = require('fs');
    var connect = require('connect');
    var app = connect();
    
    fs.readFile(config.nginxTemplate, 'utf8', function(err, contents) {
        if (err) throw err;
        var nginxTemplate = handlebars.compile(contents);
        
        handlebars.registerHelper('unique', function(array, fn, elseFn) {
            var ports = {};
            if (array && array.length > 0){
                var buffer = '';
                for (var i = 0, j = array.length; i < j; i++){
                    var item = array[i];
                    if (ports[item.port] == undefined) {
                        ports[item.port] = true;
                        buffer += fn.fn(item);
                    }
                }
                return buffer;
            }else{
                return elseFn();
            }
        });
        
        handlebars.registerHelper('json', function(context) {
            return new handlebars.SafeString(JSON.stringify(context));
        });
        
        app.use(connect.query());
        app.use(connect.bodyParser());
        
        app.use('/make', function(req, res, next){
            var jsonConf = req.body;
            jsonConf.ip = config.localIP;
            var nginxConf = nginxTemplate(jsonConf);
            console.log(nginxConf);
            
            fs.writeFile(config.nginxConf, nginxConf, function(err){
                if (err) throw err;
                next();
            });
        });
        
        app.use('/make', $data.JayService.Middleware.contextFactory({
            apiUrl: config.schemaAPI,
            filename: config.contextFile
        }));
        
        app.use('/make', $data.JayService.Middleware.serviceFactory({
            apiUrl: config.serviceAPI,
            context: config.contextFile,
            filename: config.serviceFile
        }));
        
        app.use('/make', function(req, res){
            console.log('CU ready.');
            res.end();
        });
        
        app.listen(9999);
    });
})();
