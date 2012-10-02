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
        }

        f.param = function (name, type) {
            f.params = f.params || [];
            f.params.push({name:name, type:type});
            return f;
        }

        f.returns = function (type) {
            f.returnType = type;
            return f;
        }

        f.returnsArrayOf = function (type) {
            f.returnType = "Array";
            f.elementType = type;
            return f;
        }

        f.returnsCollectionOf = function (type) {
            f.returnType = "Collection";
            f.elementType = type;
            return f;
        }

        return f;
    },
    createAdapter: function (type, instanceFactory) {
        var self = this;
        return function (req, res, next) {
            
            self.routeParser(this, req);

            var factory = instanceFactory || function() { return new type; };
            var adapter = new $data.JSObjectAdapter(type, factory);
            adapter.handleRequest(req, res, next);
        }
    },
    resultAsXml:function (data) {
        return new $data.XmlResult(data);
    },
    routeParser: function (app, req) {
        var schema = 'http';
        if (req && req.headers) {
            if (req.connection.encrypted || req.headers['X-Forwarded-Protocol'] === 'https' || req.headers['x-forwarded-protocol'] === 'https')
                schema += 's';

            if (req.headers.host) {
                req.fullRoute = schema + '://' + req.headers.host + app.route;
            }
        }
    }
});

