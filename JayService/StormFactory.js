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
            var file = '(function(contextTypes){\n\n';
            file += 'var connect = require("connect");\n\n';
            var listen = [];
            for (var i = 0; i < config.services.length; i++){
                var s = config.services[i];
                file += 'var app' + s.port + ' = connect();\n';
                if (s.extend) file += '$data.Class.defineEx("' + s.serviceName + '", [' + (s.database ? 'contextTypes["' + s.database + '"]' : s.serviceName) + ', ' + s.extend + ']);\n';
                else file += '$data.Class.defineEx("' + s.serviceName + '", [' + (s.database ? 'contextTypes["' + s.database + '"], $data.ServiceBase' : s.serviceName) + ']);\n';
                file += 'app' + s.port + '.use("/' + s.serviceName + '", $data.JayService.createAdapter(' + s.serviceName + ', function(){\n    return new ' + s.serviceName + '(' + (s.database ? '{ name: "mongoDB", databaseName: "' + s.database + '" }' : '') + ');\n}));\n\n';
                listen.push(s.port);
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
    }
}
