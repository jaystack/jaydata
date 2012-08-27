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
                var file = 'exports = module.exports = function(app){\n\n';
                var builder = function(db){
                    context.getContextJS(db, function(js){
                        file += (js + '\n');
                        var ctxName = js.match(/\$data.EntityContext.extend\(\"(.*)\",/)[1];
                        file += '\napp.use("/' + db + '", $data.JayService.createAdapter(' + ctxName + ', function(){\n    return new ' + ctxName + '({ name: "mongoDB", databaseName: "' + db + '" });\n}));\n';
                        if (dbs.length) builder(dbs.shift());
                        else{
                            file += '\n});';
                            require('fs').writeFile(config.filename, file, function(err){
                                if (err) throw err;
                                next();
                            });
                        }
                    });
                };
                
                builder(dbs.shift());
            });
        };
    },
    serviceFactory: function serviceFactory(config){
        if (!config){
            console.error('Service factory configuration missing.');
            return function(req, res, next){ next(); };
        }
        
        return function serviceFactory(req, res, next){
            
        };
    }
}
