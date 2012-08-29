
$data.Class.define('$data.JayService.OData.Defaults', null, null, null, {
    jsonReturnContentType: { value: 'application/json;odata=verbose;charset=utf-8' },

    jsonContentType: { value: 'application/json' },
    jsonV3ContentType: { value: 'application/json;odata=verbose' },

    xmlContentType: { value: 'application/atom+xml' },
    multipartContentType: { value: 'multipart/mixed' },

    defaultResponseLimit: { value: 100 }
});

$data.Class.define('$data.JayService.OData.Utils', null, null, null, {
    getHeaderValue: function (headers, name) {
        for (var key in headers) {
            if (key.toLowerCase() === name.toLowerCase())
                return headers[key];
        }
        return '';
    },
    getRandom: function (prefix) {
        return prefix + Math.random() + Math.random();
    },
    parseUrlPart: function (urlPart, context, withoutConvert) {

        var p = urlPart.split('(');
        var ids;
        if (p.length > 1) {
            var p2 = p[1].split(')');
            p.splice(1, 1, p2[0], p2[1]);

            var pIds = p2[0].split(',');
            if (pIds.length > 1) {
                ids = {};
                for (var i = 0; i < pIds.length; i++) {
                    var idPart = pIds[i].split('=');
                    ids[idPart[0]] = idPart[1];
                }

            } else {
                ids = pIds[0];
            }
        }

        var eSet = context[p[0]];
        if (!eSet) return null;
        return result = {
            set: eSet,
            idObj: ids ? $data.JayService.OData.Utils.paramMapping(ids, eSet, withoutConvert) : undefined
        };
    },
    paramMapping: function (values, set, withoutConvert) {
        if (!values)
            return;

        var keyProps = set.elementType.memberDefinitions.getKeyProperties();
        result = {};

        for (var i = 0; i < keyProps.length; i++) {
            var memDef = keyProps[i];

            if (keyProps.length === 1) {
                var value = values;
            } else {
                var value = values[memDef.name];
            }

            //TODO converter
            var resolvedType = Container.resolveType(memDef.type);
            if (withoutConvert)
                result[memDef.name] = value;
            else
                result[memDef.name] = (resolvedType === $data.String || resolvedType === $data.ObjectID) ? value.slice(1, value.length - 1) : value;
        }

        return result;
    },

    simpleBodyReader: function (options) {

        var options = $data.typeSystem.extend({
            contentTypes: [
                $data.JayService.OData.Defaults.multipartContentType,
                $data.JayService.OData.Defaults.xmlContentType
            ]
        });

        return function (req, res, next) {
            var contentType = $data.JayService.OData.Utils.getHeaderValue(req.headers, 'Content-Type');
            var readBody = false;
            if (Array.isArray(options.contentTypes)) {
                for (var i = 0; i < options.contentTypes.length; i++) {
                    if (contentType.indexOf(options.contentTypes[i]) >= 0) {
                        readBody = true;
                        break;
                    }

                }
            }

            if (readBody) {
                req.body = '';
                req.on('data', function (chunk) {
                    req.body += chunk.toString();
                });
                req.on('end', function (chunk) {
                    next();
                });
            } else {
                next();
            }
        }
    }
});