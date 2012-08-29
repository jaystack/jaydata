require('jaydata');

(function(){
    var config = {
        nginxTemplate: __dirname + '/nginx/nginx-host.conf',
        nginxConf: '/etc/nginx/sites-enabled/cu.conf',
        schemaAPI: 'http://localhost:3000/contextapi.svc',
        serviceAPI: 'http://localhost:3000/contextapi.svc',
        contextFile: __dirname + '/context.js',
        serviceFile: __dirname + '/service.js',
        localIP: require('os').networkInterfaces()['eth0'][0].address,
        subscriberPath: '/home/lazarv'
    };
    
    var forever = require('forever');
    var handlebars = require('handlebars');
    var fs = require('fs');
    var vm = require('vm');
    var uuid = require('node-uuid');
    var child_process = require('child_process');
    
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
        
        function makeNginxConf(jsonConf, callback){
            jsonConf.ip = config.localIP;
            
            var limitedcors = true;
            for (var x in jsonConf.application.firewall.outgress.allows) {
                var address = jsonConf.application.firewall.outgress.allows[x].address;
                if (address == "*") limitedcors = false;
            }
            jsonConf.limitedcors = limitedcors;
            
            var nginxConf = nginxTemplate(jsonConf);
            
            fs.writeFile(config.nginxConf, nginxConf, function(err){
                if (err) callback(err); else callback();
            });
        }
        
        function restartNginx(callback){
            console.log('Restart NGINX service.');
            child_process.exec('service nginx restart', function(err, stdout, stderr){
                if (err){
                    callback(err);
                }else{
                    if (stdout) console.log(stdout);
                    if (stderr) console.log(stderr);
                    
                    callback();
                }
            });
        }
        
        app.use('/nginx/conf', function(req, res, next){
            makeNginxConf(req.body, function(){
                restartNginx(function(err){
                    if (err) next(err);
                    else{
                        console.log('NGINX ready.');
                        res.end();
                    }
                });
            });
        });
        
        app.use('/make', function(req, res, next){
            makeNginxConf(req.body, next);
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
        
        app.use('/make', function(req, res, next){
            console.log('Restart NGINX service.');
            child_process.exec('service nginx restart', function(err, stdout, stderr){
                if (err) throw err;
                if (stdout) console.log(stdout);
                if (stderr) console.log(stderr);
                
                process.env.HOME = config.subscriberPath;
                forever.restartAll().on('error', function(err){
                    next(err);
                });
                
                console.log('CU ready.');
                res.end();
            });
        });
        
        app.use('/eval', function(req, res){
            var js = '';
            js += 'process.on("uncaughtException", function(err){\n';
            js += '    process.send(err.toString());\n';
            js += '    process.exit(0);\n';
            js += '});\n\n';
            
            js += req.body.js;
            
            js += '\n\n';
            js += 'process.on("message", function(msg){\n';
            js += '    process.send({ serviceTypes: exports.serviceTypes });\n';
            js += '    process.exit(0);\n';
            js += '});\n';
            
            try{
                var script = vm.createScript(js);
                var tmp = __dirname + '/tmp-' + uuid.v4() + '.js';
                fs.writeFile(tmp, js, 'utf8', function(err){
                    if (err) throw err;
                    var child = child_process.fork(tmp);
                    
                    child.on('message', function(msg){
                        fs.unlink(tmp, function(err){
                            if (err) throw err;
                            res.write(JSON.stringify(msg));
                            res.end();
                        });
                    });
                    
                    child.send({});
                });
            }catch(err){
                res.write(JSON.stringify(err.toString()));
                res.end();
            }
        });
        
        app.use(connect.errorHandler());
        
        app.listen(9999);
    });
})();
