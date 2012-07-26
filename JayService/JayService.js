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
    createAdapter:function (type, instanceFactory) {
        return function (req, res, next) {
            var adapter = new $data.JSObjectAdapter(type, instanceFactory);
            adapter.handleRequest(req, res, next);
        }
    },
    resultAsXml:function (data) {
        return new $data.XmlResult(data);
    }
});

