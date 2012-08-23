$data.Class.define('$data.JayService.Middleware', null, null, null, {
    appID: function(config){
        return function(req, res, next){
            var appId = req.headers['x-appid'] || 'unknown';
            delete req.headers['x-appid'];
            
            Object.defineProperty(req, 'getAppId', {
                value: function(){
                    return appId;
                },
                enumerable: true
            });
            
            next();
        };
    },
    currentDatabase: function(){
        return function(req, res, next){
            var db = {
                server: JSON.parse(req.headers['x-db-server']),
                username: req.headers['x-db-user'],
                password: req.headers['x-db-password']
            };
            delete req.headers['x-db-server'];
            delete req.headers['x-db-user'];
            delete req.headers['x-db-password'];
            
            console.log(db);
            Object.defineProperty(req, 'getCurrentDatabase', {
                value: function(){
                    return db;
                },
                enumerable: true
            });
            
            next();
        }
    },
    databaseConnections: function(config){
        if (!config) throw 'Database connections configuration missing.';
        if (!$data.mongoDBDriver) throw 'mongoDB driver missing.';
        
        var connectionFactory = function(name, server){
            return function(){
                if (server.length > 1){
                    var replSet = [];
                    for (var i = 0; i < server.length; i++){
                        replSet.push(new $data.mongoDBDriver.Server(server[i].address, server[i].port || 27017, {}));
                    }
                    return new $data.mongoDBDriver.Db(req.getAppId() + '_' + name, new $data.mongoDBDriver.ReplSetServers(replSet), {});
                }else return new $data.mongoDBDriver.Db(req.getAppId() + '_' + name, new $data.mongoDBDriver.Server(server[0].address, server[0].port || 27017, {}), {});
            };
        };
        
        var dbs = {};
        for (var i in config){
            if (config.hasOwnProperty(i)){
                dbs[i] = connectionFactory(i, config[i]);
            }
        }
        
        return function(req, res, next){
            Object.defineProperty(req, 'dbConnections', { value: dbs, enumerable: true });
            next();
        }
    },
    contextFactory: function(config){
        if (!config){
            console.error('Context factory configuration missing.');
            return function(req, res, next){ next(); };
        }

        return function contextFactory(req, res, next){
            $data.MetadataLoader.debug = true;
            $data.MetadataLoader.load(config.apiUrl, function (factory, ctxType, text) {
                var context = factory();
                var dbs = config.cu.application.dataLayer.databases.slice();
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
    serviceFactory: function(config){
        if (!config){
            console.error('Service factory configuration missing.');
            return function(req, res, next){ next(); };
        }
        
        return function serviceFactory(req, res, next){
            var file = '';
            var fn = function(){
                file += '(function(contextTypes){\n\n';
                file += 'var connect = require("connect");\n\n';
                
                var dbConf = {};
                for (var i = 0; i < config.cu.application.dataLayer.databases.length; i++){
                    var db = config.cu.application.dataLayer.databases[i];
                    dbConf[db.name] = db.dbServer || config.cu.application.dataLayer.dbServer;
                    if (typeof dbConf[db.name] === 'string') dbConf[db.name] = [{ address: dbConf[db.name].split(':')[0], port: dbConf[db.name].split(':')[1] }]
                    if (!(dbConf[db.name] instanceof Array)) dbConf[db.name] = [dbConf[db.name]];
                }
                
                var listen = [];
                for (var i = 0; i < config.cu.application.serviceLayer.services.length; i++){
                    var s = config.cu.application.serviceLayer.services[i];
                    if (listen.indexOf(s.port) < 0){
                        file += 'var app' + s.port + ' = connect();\n';
                        file += 'app' + s.port + '.use($data.JayService.Middleware.appID());\n';
                        file += 'app' + s.port + '.use($data.JayService.Middleware.currentDatabase());\n';
                        file += 'app' + s.port + '.use($data.JayService.Middleware.databaseConnections(' + JSON.stringify(dbConf, null, '    ') + '));\n';
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
                    file += 'app' + s.port + '.use("/' + s.serviceName + '", $data.JayService.createAdapter(' + s.serviceName + ', function(req, res){\n    return new ' + s.serviceName + '(' + (s.database ? '$data.typeSystem.extend({ name: "mongoDB", databaseName: req.getAppId() + "_' + s.database + '" }, req.getCurrentDatabase())' : '') + ');\n}));\n\n';
                }
                for (var i = 0; i < listen.length; i++){
                    file += 'app' + listen[i] + '.listen(' + listen[i] + ', "127.0.0.1");\n';
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
});
