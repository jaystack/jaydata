require('jaydata');

(function(){
    var config = {
        nginxConf: '/etc/nginx/sites-enabled/cu.conf',
        schemaAPI: 'http://localhost:8181/db',
        serviceAPI: 'http://localhost:8181/db',
        contextFile: __dirname + '/context.js',
        serviceFile: __dirname + '/service.js',
        filePath: __dirname + '/files',
        localIP: require('os').networkInterfaces()['eth0'][0].address,
        subscriberPath: '/home/lazarv',
        filestore: 'http://admin.storm.jaystack.com',
        samba: 'ip-10-229-59-222.eu-west-1.compute.internal'
    };
    
    var forever = require('forever');
    var handlebars = require('handlebars');
    var fs = require('fs');
    var vm = require('vm');
    var uuid = require('node-uuid');
    var child_process = require('child_process');
    
    var express = require('express');
    var app = express();
    
    app.use(express.query());
    app.use(express.bodyParser());
    
    app.use('/nginx/conf', $data.JayService.Middleware.nginxFactory({ filename: config.nginxConf }));
    app.use('/nginx/conf', function(req, res, next){
        console.log('Restart NGINX service.');
        child_process.exec('service nginx restart', function(err, stdout, stderr){
            if (err){
                next(err);
            }else{
                if (stdout) console.log(stdout);
                if (stderr) console.log(stderr);
                
                console.log('NGINX ready.');
                res.end();
            }
        });
    });
    
    app.use('/make', function(req, res, next){
        var json = req.body;
        console.log('Mounting SAMBA.');
        child_process.exec('smbmount \\\\\\\\' + config.samba + '\\\\subscriber\\\\' + json.application.appID + '\\\\js /mnt -o user=subscriber', function(err, stdout, stderr){
            if (err){
                console.log('ERROR while mounting =>', config.samba);
                //next(err);
                next();
            }else{
                //if (stdout) console.log(stdout);
                //if (stderr) console.log(stderr);
                
                console.log('SAMBA mount ready.');
                next();
            }
        });
    });
    
    app.use('/make', $data.JayService.Middleware.nginxFactory({
        filename: config.nginxConf,
        filestore: config.filestore
    }));
    
    app.use('/make', $data.JayService.Middleware.contextFactory({
        apiUrl: config.schemaAPI,
        filename: config.contextFile
    }));
    
    app.use('/make', $data.JayService.Middleware.serviceFactory({
        apiUrl: config.serviceAPI,
        context: config.contextFile,
        filename: config.serviceFile
    }));
    
    app.use('/make', $data.JayService.Middleware.sourceFactory({
        path: config.filePath
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
    
    app.use(express.errorHandler());
    
    app.listen(9999);
})();
