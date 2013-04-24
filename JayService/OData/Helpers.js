
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
        ///	<signature>
        ///     <summary>Read value from header object</summary>
        ///     <description>Read value from header object</description>
        ///     <param name="headers" type="Object" />
        ///     <param name="name" type="String" />
        ///     <return type="String" />
        ///	</signature>
        ///	<signature>
        ///     <summary>Read value from header object</summary>
        ///     <description>Read value from header object</description>
        ///     <param name="headers" type="Array" />
        ///     <param name="name" type="String" />
        ///     <return type="String" />
        ///	</signature>

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
        urlPart = decodeURI(urlPart);
        if (urlPart.indexOf('/') === 0)
            urlPart = urlPart.slice(1);

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

            var resolvedType = Container.resolveType(memDef.type);
            if (withoutConvert)
                result[memDef.name] = value;
            else {
                var typeName = Container.resolveName(resolvedType);
                var converter = $data.oDataConverter.unescape[typeName];
                var resultValue = converter ? converter(value) : value;

                converter = $data.oDataConverter.fromDb[typeName];
                result[memDef.name] = converter ? converter(resultValue) : resultValue;
            }
        }

        return result;
    },

    simpleBodyReader: function (options) {
        ///	<signature>
        ///     <summary>Express and Connect middleware for read data to req.body when a contentType is multipart/mixed or application/atom+xml</summary>
        ///     <description>Express and Connect middleware for read data to req.body when a contentType is multipart/mixed or application/atom+xml</description>
        ///     <param name="options" type="Object">
        ///         { 
        ///             contentTypes: [] //list of contentTypes for read
        ///         }
        ///     </param>
        ///     <return type="function" />
        ///	</signature>

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