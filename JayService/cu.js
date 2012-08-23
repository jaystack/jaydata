require('jaydata');
require('../JaySvcUtil/JaySvcUtil.js');

(function(){
    var config = {
        nginxTemplate: './nginx/nginx-host.conf',
        nginxConf: '/etc/nginx/sites-enabled/cu.conf',
        schemaAPI: 'http://localhost:3000/contextapi.svc',
        serviceAPI: 'http://localhost:3000/contextapi.svc',
        contextFile: './context.js',
        serviceFile: './service.js'
    };
    var handlebars = require('handlebars');
    var fs = require('fs');
    var connect = require('connect');
    var app = connect();
    
    fs.readFile(config.nginxTemplate, 'utf8', function(err, contents) {
        if (err) throw err;
        var nginxTemplate = handlebars.compile(contents);
        
        handlebars.registerHelper("unique", function(array, fn, elseFn) {
          var ports = {};
          if (array && array.length > 0) {
            var buffer = "";
            for (var i = 0, j = array.length; i < j; i++) {
              var item = array[i];
              if (ports[item.port] == undefined) {
                ports[item.port] = true;
                buffer += fn.fn(item);
              }
            }
            return buffer;
          }
          else {
            return elseFn();
          }
        });
        
        app.use(connect.query());
        app.use(connect.bodyParser());
        
        app.use('/make', function(req, res){
            var jsonConf = req.body;
            var nginxConf = nginxTemplate(jsonConf);
            console.log(nginxConf);
            
            fs.writeFile(config.nginxConf, nginxConf, function(err){
                if (err) throw err;
                
                $data.JayService.Middleware.contextFactory({
                    apiUrl: config.schemaAPI,
                    cu: jsonConf,
                    filename: config.contextFile
                })(req, res, function(){
                    $data.JayService.Middleware.serviceFactory({
                        apiUrl: config.serviceAPI,
                        cu: jsonConf,
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
