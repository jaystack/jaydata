require('jaydata');
window.DOMParser = require('xmldom').DOMParser;

$data.ODataServer = function(type, db){
    var connect = require('connect');
    var basicAuth = require('basic-auth-connect');
    var domain = require('domain');
    
    var config = typeof type === 'object' ? type : {};
    var type = config.type || type;
    config.database = config.database || db || type.name;
    if (!config.provider) config.provider = {};
    config.provider.name = config.provider.name || 'mongoDB';
    config.provider.databaseName = config.provider.databaseName || config.database || db || type.name;
    config.provider.responseLimit = config.provider.responseLimit || config.responseLimit || 100;
    config.provider.user = config.provider.user || config.user;
    config.provider.checkPermission = config.provider.checkPermission || config.checkPermission;
    
    var serviceType = $data.Class.defineEx(type.fullName + '.Service', [type, $data.ServiceBase]);
    serviceType.annotateFromVSDoc();
    
    var basicAuthFn = function(req, res, next){
        if (!config.basicAuth && !config.rootAuth) return next();
        var callback = config.rootAuth ? function(){ basicAuth(config.rootAuth)(req, res, next); } : next;
        if (typeof config.basicAuth == 'function'){
            basicAuth(config.basicAuth)(req, res, callback);
        }else if (typeof config.basicAuth == 'object' && config.basicAuth.username && config.basicAuth.password){
            basicAuth(config.basicAuth.username, config.basicAuth.password)(req, res, callback);
        }else callback();
    };
    
    var corsFn = function(req, res, next){
        if (config.CORS !== false){
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', 'X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion, Authorization');
            res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, MERGE, PATCH, DELETE');
            if (req.method === 'OPTIONS'){
                res.setHeader('Access-Control-Max-Age', '31536000');
                res.setHeader('Cache-Control', 'max-age=31536000');
                res.end();
            }else{
                next();
            }
        }else next();
    };

    var qs = require('qs');
    var queryFn = function(req, res, next){
        if (!req.query){
            req.query = qs.parse(req._parsedUrl.query);
            next();
        }else next();
    };

    var bodyParser = require('body-parser');
    var bodyFn = function(req, res, next){
        if (!req.body){
            bodyParser()(req, res, next);
        }else next();
    };
    
    var simpleBodyFn = function(req, res, next){
        $data.JayService.OData.Utils.simpleBodyReader()(req, res, next);
    };
    
    var errorFn = function(req, res, next, callback){
        var reqd = domain.create();
        reqd.add(req);
        reqd.add(res);
        reqd.add(next);
        reqd.on('error', function(err){
            try{
                console.error(err);
                next(err);
            }catch (derr){
                console.error('Error sending 500', derr, req.url);
                reqd.dispose();
            }
        });
        reqd.run(function(){
            callback();
        });
    };

    var errorHandler = require('errorhandler');
    var errorHandlerFn = function(err, req, res, next){
        if (config.errorHandler){
            errorHandler.title = typeof config.errorHandler == 'string' ?  config.errorHandler : config.provider.databaseName;
            errorHandler()(err, req, res, next);
        }else next(err);
    };

    return function(req, res, next){
        var self = this;
        
        if (config.provider.checkPermission){
            Object.defineProperty(req, 'checkPermission', {
                value: config.provider.checkPermission.bind(req),
                enumerable: true
            });
            config.provider.checkPermission = req.checkPermission;
        }

        var schema = 'http';
        if (req && req.headers) {
            if (req.connection.encrypted || req.headers['X-Forwarded-Protocol'] === 'https' || req.headers['x-forwarded-protocol'] === 'https')
                schema += 's';

            req.fullRoute = (req.baseRoute || (schema + '://' + req.headers.host)) + (req.baseUrl || (req.originalUrl.replace(req.url, '')));
        }
        
        basicAuthFn(req, res, function(){
            config.provider.user = config.user = req.user || req.remoteUser || config.user || config.provider.user || 'anonymous';
            corsFn(req, res, function(){
                queryFn(req, res, function(){
                    bodyFn(req, res, function(){
                        simpleBodyFn(req, res, function(){
                            errorFn(req, res, next, function(){
                                $data.JayService.createAdapter(serviceType, function(){
                                    return new serviceType(config.provider);
                                }).call(self, req, res, function(err){
                                    if (typeof err === 'string') err = new Error(err);
                                    errorHandlerFn(err, req, res, next);
                                });
                            });
                        });
                    });
                });
            });
        });
    };
};

$data.createODataServer = function(type, path, port, host){
    var config = typeof type === 'object' ? type : {};
    var connect = require('connect');
    var app = connect();

    app.use(config.path || path || '/', $data.ODataServer(type));
    app.listen(config.port || port || 80, config.host || host);
};

module.exports = exports = $data.ODataServer;
