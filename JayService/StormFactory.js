exports = module.exports = {
    contextFactory: function contextFactory(config){
        if (!config){
            console.error('Context factory configuration missing.');
            return function(req, res, next){ next(); };
        }

        return function contextFactory(req, res, next){
            $data.MetadataLoader.debug = true;
            $data.MetadataLoader.load(config.apiUrl, function (factory, ctxType, text) {
                var context = factory();
                var dbs = config.databases.slice();
                //var file = 'exports = module.exports = function(app){\n\n';
                var file = '(function(){\n\n';
                file += 'var contextTypes = {};\n\n';
                var builder = function(db){
                    context.getContextJS(db, function(js){
                        file += (js + '\n\n');
                        var ctxName = js.match(/\$data.EntityContext.extend\(\"(.*)\",/)[1];
                        file += 'contextTypes["' + db + '"] = ' + ctxName + ';\n\n';
                        //file += '\napp.use("/' + db + '", $data.JayService.createAdapter(' + ctxName + ', function(){\n    return new ' + ctxName + '({ name: "mongoDB", databaseName: "' + db + '" });\n}));\n';
                        if (dbs.length) builder(dbs.shift().name);
                        else{
                            //file += '\n});';
                            file += 'exports = module.exports = { contextTypes: contextTypes };\n\n';
                            file += '})();';
                            require('fs').writeFile(config.filename, file, function(err){
                                if (err) throw err;
                                next();
                            });
                        }
                    });
                };
                
                builder(dbs.shift().name);
            });
        };
    },
    serviceFactory: function serviceFactory(config){
        if (!config){
            console.error('Service factory configuration missing.');
            return function(req, res, next){ next(); };
        }
        
        return function serviceFactory(req, res, next){
            var file = '';
            var fn = function(){
                file += '(function(contextTypes){\n\n';
                file += 'var connect = require("connect");\n\n';
                var listen = [];
                for (var i = 0; i < config.services.length; i++){
                    var s = config.services[i];
                    if (listen.indexOf(s.port) < 0){
                        file += 'var app' + s.port + ' = connect();\n';
                        file += 'app' + s.port + '.use(function (req, res, next){\n';
                        file += '    res.setHeader("Access-Control-Allow-Origin", "*");\n';
                        file += '    res.setHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion");\n';
                        file += '    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, MERGE");\n';
                        file += '    if (req.method === "OPTIONS") res.end(); else next();\n';
                        file += '});\n';
                        file += 'app' + s.port + '.use(connect.query());\n';
                        file += 'app' + s.port + '.use(connect.bodyParser());\n';
                        file += 'app' + s.port + '.use($data.JayService.OData.BatchProcessor.connectBodyReader);\n';
                        listen.push(s.port);
                    }
                    if (s.extend) file += '$data.Class.defineEx("' + s.serviceName + '", [' + (s.database ? 'contextTypes["' + s.database + '"]' : s.serviceName) + ', ' + s.extend + ']);\n';
                    else if (s.database) file += '$data.Class.defineEx("' + s.serviceName + '", [' + (s.database ? 'contextTypes["' + s.database + '"], $data.ServiceBase' : s.serviceName) + ']);\n';
                    file += 'app' + s.port + '.use("/' + s.serviceName + '", $data.JayService.createAdapter(' + s.serviceName + ', function(req, res){\n    return new ' + s.serviceName + '(' + (s.database ? '{ name: "mongoDB", databaseName: req.headers["X-AppId"] + "_' + s.database + '" }' : '') + ');\n}));\n\n';
                }
                for (var i = 0; i < listen.length; i++){
                    file += 'app' + listen[i] + '.listen(' + listen[i] + ');\n';
                }
                file += '\n})(require("' + config.context + '").contextTypes);';
                require('fs').writeFile(config.filename, file, function(err){
                    if (err) throw err;
                    next();
                });
            };
            
            //TODO: include custom service (git, source)
            /*var src = config.services.filter(function(it){ return !it.database; });
            if (src.length){
                src = src.map(function(it){ return it.serviceName; });
                $data.MetadataLoader.debug = true;
                $data.MetadataLoader.load(config.apiUrl, function (factory, ctxType, text) {
                    var context = factory();
                    context.Services.filter(function(it){ return it.Name in this.services; }, { services: src }).toArray(function(result){
                        var srcInclude = function(src){
                            file += (src + '\n\n');
                        };
                        
                        var srcLoader = function(src){
                            var isHttp = !!src.Source.match('http://');
                            var isHttps = !!src.Source.match('https://');
                            if (isHttp || isHttps){
                                //TODO: request source code
                                var http = isHttps ? require('https') : require('http');
                                var xhttp = http.request({
                                    host:
                                    port:
                                    path:
                                    method: 
                                }, )
                            }else{
                                srcInclude(src.Source);
                                if (result.length) srcLoader(result.shift());
                                else fn();
                            }
                        };
                        
                        if (result.length) srcLoader(result.shift());
                        else fn();
                    });
                });
            }else*/ fn();
        };
    }
}
