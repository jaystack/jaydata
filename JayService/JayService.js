$data.Class.define("$data.JayService", null, null, {
    constructor:function () {
    }
}, {
    serviceFunction:function (fn) {

        var f = fn || function (fn) {
            var keys = Object.keys(f);
            for (var i = 0; i < keys.length; i++) {
                fn[keys[i]] = f[keys[i]];
            }
            return fn;
        };

        f.param = function (name, type) {
            f.params = f.params || [];
            f.params.push({name:name, type:type});
            return f;
        };

        f.returns = function (type) {
            f.returnType = type;
            return f;
        };

        f.returnsArrayOf = function (type) {
            f.returnType = "Array";
            f.elementType = type;
            return f;
        };

        f.returnsCollectionOf = function (type) {
            f.returnType = "Collection";
            f.elementType = type;
            return f;
        };
        
        f.httpMethod = function(type){
            f.method = type || 'GET';
            return f;
        };

        return f;
    },
    createAdapter: function (type, instanceFactory) {
        ///	<signature>
        ///     <summary>JSONObjectAdapter middleware factory for Express and Connect</summary>
        ///     <description>JSONObjectAdapter middleware factory for Express and Connect</description>
        ///     <param name="type" type="function">Service class type</param>
        ///     <param name="instanceFactory" type="function">Service class instance factory</param>
        ///     <return type="function" />
        ///	</signature>

        var self = this;
        return function (req, res, next) {
            
            self.routeParser(this, req);

            var factory = instanceFactory || function() { return new type; };
            var adapter = new $data.JSObjectAdapter(type, factory);
            adapter.handleRequest(req, res, function (err) {
                if (typeof err === "string") err = new Error(err);
                self.errorHandler.call(this, err, req, res, next);
            });
        }
    },
    resultAsXml:function (data) {
        return new $data.XmlResult(data);
    },
    routeParser: function (app, req) {
        if (!(typeof req.fullRoute === 'string' && req.fullRoute.length)){
            var schema = 'http';
            if (req && req.headers) {
                if (req.connection.encrypted || req.headers['X-Forwarded-Protocol'] === 'https' || req.headers['x-forwarded-protocol'] === 'https')
                    schema += 's';

                req.fullRoute = (req.baseRoute || (schema + '://' + req.headers.host)) + app.route;
            }
        }
    },
    errorHandler: function (err, req, res, next) {
        var accept = req.headers.accept || '';
        if (~accept.indexOf('json')) {
            if (err.status) res.statusCode = err.status;
            if (res.statusCode < 400) res.statusCode = 500;

            var error = { message: { value: err.message, lang: err.lang || 'en-US' }, stack: err.stack };
            for (var prop in err) { if (prop !== 'message') error[prop] = err[prop]; }
            var json = JSON.stringify({ error: error });

            res.setHeader('Content-Type', 'application/json');
            res.end(json);
        } else {
            next(err);
        }
    }
});

