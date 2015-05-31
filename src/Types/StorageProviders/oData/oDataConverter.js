$data.oDataConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.ObjectID': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,//function (number) { return (typeof number === 'string' && /^\d+$/.test(number)) ? parseInt(number) : number; },
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': function (dbData) {
            if (dbData) {
                if (dbData instanceof Date) {
                    return dbData;
                } else if (dbData.substring(0, 6) === '/Date(') {
                    return new Date(parseInt(dbData.substr(6)));
                } else {
                    //ISODate without Z? Safari compatible with Z
                    if (dbData.indexOf('Z') === -1 && !dbData.match('T.*[+-]'))
                        dbData += 'Z';
                    return new Date(dbData);
                }
            } else {
                return dbData;
            }
        },
        '$data.DateTimeOffset': function (dbData) {
            if (dbData) {
                if (dbData instanceof Date) {
                    return dbData;
                } else if (dbData.substring(0, 6) === '/Date(') {
                    return new Date(parseInt(dbData.substr(6)));
                } else {
                    //ISODate without Z? Safari compatible with Z
                    if (dbData.indexOf('Z') === -1 && !dbData.match('T.*[+-]'))
                        dbData += 'Z';
                    return new Date(dbData);
                }
            } else {
                return dbData;
            }
        },
        '$data.Time': $data.Container.proxyConverter,
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': function (v) {
            if (typeof v == 'string'){
                try { return $data.Container.convertTo(atob(v), '$data.Blob'); }
                catch (e) { return v; }
            }else return v;
        },
        '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } else if (typeof o === 'string') { return JSON.parse(o); } return o; },
        '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } else if (o instanceof $data.Array) { return o; } return JSON.parse(o); },
        '$data.GeographyPoint': function (g) { if (g) { return new $data.GeographyPoint(g); } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return new $data.GeographyLineString(g); } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return new $data.GeographyPolygon(g); } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return new $data.GeographyMultiPoint(g); } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return new $data.GeographyMultiLineString(g); } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return new $data.GeographyMultiPolygon(g); } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return new $data.GeographyCollection(g); } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return new $data.GeometryPoint(g); } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return new $data.GeometryLineString(g); } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return new $data.GeometryPolygon(g); } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return new $data.GeometryMultiPoint(g); } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return new $data.GeometryMultiLineString(g); } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return new $data.GeometryMultiPolygon(g); } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return new $data.GeometryCollection(g); } return g; },
        '$data.Guid': function (guid) { return guid ? guid.toString() : guid; }
    },
    toDb: {
        '$data.Entity': $data.Container.proxyConverter,
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.ObjectID': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': function (e) { return e ? e.toISOString().replace('Z', '') : e; },
        '$data.Time': $data.Container.proxyConverter,
        '$data.DateTimeOffset': function(v){ return v ? v.toISOString() : v; },
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': function (v) { return v ? $data.Blob.toBase64(v) : v; },
        '$data.Object': $data.Container.proxyConverter,
        '$data.Array': $data.Container.proxyConverter,
        '$data.GeographyPoint': $data.Container.proxyConverter,
        '$data.GeographyLineString': $data.Container.proxyConverter,
        '$data.GeographyPolygon': $data.Container.proxyConverter,
        '$data.GeographyMultiPoint': $data.Container.proxyConverter,
        '$data.GeographyMultiLineString': $data.Container.proxyConverter,
        '$data.GeographyMultiPolygon': $data.Container.proxyConverter,
        '$data.GeographyCollection': $data.Container.proxyConverter,
        '$data.GeometryPoint': $data.Container.proxyConverter,
        '$data.GeometryLineString': $data.Container.proxyConverter,
        '$data.GeometryPolygon': $data.Container.proxyConverter,
        '$data.GeometryMultiPoint': $data.Container.proxyConverter,
        '$data.GeometryMultiLineString': $data.Container.proxyConverter,
        '$data.GeometryMultiPolygon': $data.Container.proxyConverter,
        '$data.GeometryCollection': $data.Container.proxyConverter,
        '$data.Guid': $data.Container.proxyConverter
    },
    escape: {
        '$data.Entity': function (e) { return JSON.stringify(e); },
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter, // double: 13.5D
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': function (v) { return v ? v + 'm' : v; },
        '$data.Float': function (v) { return v ? v + 'f' : v; },
        '$data.Int64': function (v) { return v ? v + 'L' : v; },
        '$data.Time': function (v) { return v ? "time'" + v + "'" : v; },
        '$data.DateTimeOffset': function (date) { return date ? "datetimeoffset'" + date + "'" : date; },
        '$data.Date': function (date) { return date ? "datetime'" + date + "'" : date; },
        '$data.String': function (text) { return typeof text === 'string' ? "'" + text.replace(/'/g, "''") + "'" : text; },
        '$data.ObjectID': function (text) { return typeof text === 'string' ? "'" + text.replace(/'/g, "''") + "'" : text; },
        '$data.Boolean': function (bool) { return typeof bool === 'boolean' ? bool.toString() : bool; },
        '$data.Blob': function (b) { return b ? "X'" + $data.Blob.toHexString($data.Container.convertTo(atob(b), $data.Blob)) + "'" : b; },
        '$data.Object': function (o) { return JSON.stringify(o); },
        '$data.Array': function (o) { return JSON.stringify(o); },
        '$data.GeographyPoint': function (g) { if (g) { return $data.GeographyBase.stringifyToUrl(g); } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return $data.GeographyBase.stringifyToUrl(g); } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return $data.GeographyBase.stringifyToUrl(g); } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return $data.GeographyBase.stringifyToUrl(g); } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return $data.GeographyBase.stringifyToUrl(g); } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return $data.GeographyBase.stringifyToUrl(g); } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return $data.GeographyBase.stringifyToUrl(g); } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return $data.GeometryBase.stringifyToUrl(g); } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return $data.GeometryBase.stringifyToUrl(g); } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return $data.GeometryBase.stringifyToUrl(g); } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return $data.GeometryBase.stringifyToUrl(g); } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return $data.GeometryBase.stringifyToUrl(g); } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return $data.GeometryBase.stringifyToUrl(g); } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return $data.GeometryBase.stringifyToUrl(g); } return g; },
        '$data.Guid': function (guid) { return guid ? ("guid'" + guid.toString() + "'") : guid; }
    },
    unescape: {
        '$data.Entity': function (v, c) {
            var config = c || {};
            var value = JSON.parse(v);
            if (value && config.type) {
                var type = Container.resolveType(config.type);
                /*Todo converter*/
                return new type(value, { converters: undefined });
            }
            return value;
        },
        '$data.Number': function (v) { return JSON.parse(v); },
        '$data.Integer': function (v) { return JSON.parse(v); },
        '$data.Int32': function (v) { return JSON.parse(v); },
        '$data.Byte': function (v) { return JSON.parse(v); },
        '$data.SByte': function (v) { return JSON.parse(v); },
        '$data.Decimal': function (v) {
            if (typeof v === 'string' && v.toLowerCase().lastIndexOf('m') === v.length - 1) {
                return v.substr(0, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.Float': function (v) {
            if (typeof v === 'string' && v.toLowerCase().lastIndexOf('f') === v.length - 1) {
                return v.substr(0, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.Int16': function (v) { return JSON.parse(v); },
        '$data.Int64': function (v) {
            if (typeof v === 'string' && v.toLowerCase().lastIndexOf('l') === v.length - 1) {
                return v.substr(0, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.Boolean': function (v) { return JSON.parse(v); },
        '$data.Date': function (v) {
            if (typeof v === 'string' && /^datetime'/.test(v)) {
                return v.slice(9, v.length - 1);
            }
            return v;
        },
        '$data.String': function (v) {
            if (typeof v === 'string' && v.indexOf("'") === 0 && v.lastIndexOf("'") === v.length - 1) {
                return v.slice(1, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.ObjectID': function (v) {
            if (typeof v === 'string' && v.indexOf("'") === 0 && v.lastIndexOf("'") === v.length - 1) {
                return v.slice(1, v.length - 1);
            } else {
                return v;
            }
        },
        '$data.Guid': function (v) {
            if (/^guid'\w{8}-\w{4}-\w{4}-\w{4}-\w{12}'$/.test(v)) {
                var data = v.slice(5, v.length - 1)
                return $data.parseGuid(data).toString();
            }
            return v;
        },
        '$data.Array': function (v, c) {
            var config = c || {};

            var value = JSON.parse(v) || [];
            if (value && config.elementType) {
                var type = Container.resolveType(config.elementType);
                var typeName = Container.resolveName(type);
                if (type && type.isAssignableTo && type.isAssignableTo($data.Entity)) {
                    typeName = $data.Entity.fullName;
                }

                if (Array.isArray(value)) {
                    var converter = $data.oDataConverter.unescape[typeName];
                    for (var i = 0; i < value.length; i++) {
                        value[i] = converter ? converter(value[i]) : value[i];
                    }
                }
                return value;
            }
            return value;
        },
        '$data.DateTimeOffset': function (v) {
            if (typeof v === 'string' && /^datetimeoffset'/.test(v)) {
                return $data.Container.convertTo(v.slice(15, v.length - 1), $data.DateTimeOffset);
            }
            return v;
        },
        '$data.Time': function (v) {
            if (typeof v === 'string' && /^time'/.test(v)) {
                return $data.Container.convertTo(v.slice(5, v.length - 1), $data.Time);
            }
            return v;
        },
        '$data.Blob': function(v){
            if (typeof v === 'string'){
                if (/^X'/.test(v)){
                    return $data.Blob.createFromHexString(v.slice(2, v.length - 1));
                }else if (/^binary'/.test(v)){
                    return $data.Blob.createFromHexString(v.slice(7, v.length - 1));
                }
            }
            return v;
        },
        '$data.Object': function (v) { return JSON.parse(v); },
        '$data.GeographyPoint': function (v) {
            if (/^geography'POINT\(/i.test(v)) {
                var data = v.slice(10, v.length - 1);
                return $data.GeographyBase.parseFromString(data);
            }
            return v;
        },
        '$data.GeographyPolygon': function (v) {
            if (/^geography'POLYGON\(/i.test(v)) {
                var data = v.slice(10, v.length - 1);
                return $data.GeographyBase.parseFromString(data);
            }
            return v;
        },
        '$data.GeometryPoint': function (v) {
            if (/^geometry'POINT\(/i.test(v)) {
                var data = v.slice(9, v.length - 1);
                return $data.GeometryBase.parseFromString(data);
            }
            return v;
        },
        '$data.GeometryPolygon': function (v) {
            if (/^geometry'POLYGON\(/i.test(v)) {
                var data = v.slice(9, v.length - 1);
                return $data.GeometryBase.parseFromString(data);
            }
            return v;
        }
    },
    xmlEscape: {
        '$data.Byte': function (v) { return v.toString(); },
        '$data.SByte': function (v) { return v.toString(); },
        '$data.Decimal': function (v) { return v.toString(); },
        '$data.Float': function (v) { return v.toString(); },
        '$data.Int16': function (v) { return v.toString(); },
        '$data.Int64': function (v) { return v.toString(); },
        '$data.Integer': function (v) { return v.toString(); },
        '$data.Int32': function (v) { return v.toString(); },
        '$data.Boolean': function (v) { return v.toString(); },
        '$data.Blob': function (v) { return $data.Blob.toBase64(v); },
        '$data.Date': function (v) { return v.toISOString().replace('Z', ''); },
        '$data.DateTimeOffset': function(v){ return v.toISOString(); },
        '$data.Time': function (v) { return v.toString(); },
        '$data.Number': function (v) { return v.toString(); },
        '$data.Integer': function (v) { return v.toString(); },
        '$data.Int32': function (v) { return v.toString(); },
        '$data.String': function (v) { return v.toString(); },
        '$data.ObjectID': function (v) { return v.toString(); },
        '$data.Object': function (v) { return JSON.stringify(v); },
        '$data.Guid': function (v) { return v.toString(); }/*,
        '$data.GeographyPoint': function (v) { return this._buildSpatialPoint(v, 'http://www.opengis.net/def/crs/EPSG/0/4326'); },
        '$data.GeometryPoint': function (v) { return this._buildSpatialPoint(v, 'http://www.opengis.net/def/crs/EPSG/0/0'); },
        '$data.GeographyLineString': function (v) { return this._buildSpatialLineString(v, 'http://www.opengis.net/def/crs/EPSG/0/4326'); },
        '$data.GeometryLineString': function (v) { return this._buildSpatialLineString(v, 'http://www.opengis.net/def/crs/EPSG/0/0'); }*/
    },
    simple: { //$value, $count
        '$data.Byte': function (v) { return v.toString(); },
        '$data.SByte': function (v) { return v.toString(); },
        '$data.Decimal': function (v) { return v.toString(); },
        '$data.Float': function (v) { return v.toString(); },
        '$data.Int16': function (v) { return v.toString(); },
        '$data.Int64': function (v) { return v.toString(); },
        '$data.ObjectID': function (o) { return o.toString(); },
        '$data.Integer': function (o) { return o.toString(); },
        '$data.Int32': function (o) { return o.toString(); },
        '$data.Number': function (o) { return o.toString(); },
        '$data.Date': function (o) { return o instanceof $data.Date ? o.toISOString().replace('Z', '') : o.toString() },
        '$data.DateTimeOffset': function(v){ return v ? v.toISOString() : v; },
        '$data.Time': function (o) { return o.toString(); },
        '$data.String': function (o) { return o.toString(); },
        '$data.Boolean': function (o) { return o.toString(); },
        '$data.Blob': function (o) { return o; },
        '$data.Object': function (o) { return JSON.stringify(o); },
        '$data.Array': function (o) { return JSON.stringify(o); },
        '$data.Guid': function (o) { return o.toString(); },
        '$data.GeographyPoint': function (o) { return JSON.stringify(o); },
        '$data.GeometryPoint': function (o) { return JSON.stringify(o); },
        '$data.GeographyLineString': function (o) { return JSON.stringify(o); },
        '$data.GeographyPolygon': function (o) { return JSON.stringify(o); },
        '$data.GeographyMultiPoint': function (o) { return JSON.stringify(o); },
        '$data.GeographyMultiLineString': function (o) { return JSON.stringify(o); },
        '$data.GeographyMultiPolygon': function (o) { return JSON.stringify(o); },
        '$data.GeographyCollection': function (o) { return JSON.stringify(o); },
        '$data.GeometryLineString': function (o) { return JSON.stringify(o); },
        '$data.GeometryPolygon': function (o) { return JSON.stringify(o); },
        '$data.GeometryMultiPoint': function (o) { return JSON.stringify(o); },
        '$data.GeometryMultiLineString': function (o) { return JSON.stringify(o); },
        '$data.GeometryMultiPolygon': function (o) { return JSON.stringify(o); },
        '$data.GeometryCollection': function (o) { return JSON.stringify(o); }
    }
};
