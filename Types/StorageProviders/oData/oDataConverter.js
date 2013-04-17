$data.oDataConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,//function (number) { return (typeof number === 'string' && /^\d+$/.test(number)) ? parseInt(number) : number; },
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
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': function (v) { try{ return $data.Container.convertTo(atob(v), '$data.Blob'); }catch(e){ return v; } },
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
        //'$data.Entity': $data.Container.proxyConverter,
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': function (e) { return e ? e.toISOString() : e; },
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': $data.Container.proxyConverter,
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
        //'$data.Entity': function (e) { return "'" + JSON.stringify(e.initData) + "'" },
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Number': function (number) { return number % 1 == 0 ? number : number + 'm'; },
        '$data.Date': function (date) { return date ? "datetime'" + date + "'" : null; },
        '$data.String': function (text) { return typeof text === 'string' ? "'" + text.replace(/'/g, "''") + "'" : text; },
        '$data.Boolean': function (bool) { return typeof bool === 'boolean' ? bool.toString() : bool; },
        '$data.Blob': $data.Container.proxyConverter,
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
    }
};
