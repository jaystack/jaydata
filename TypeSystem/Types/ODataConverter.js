$data.ODataConverter = {
    fromDb: {
        '$data.Integer': function (number) { return (typeof number === 'string' && /^\d+$/.test(number)) ? parseInt(number) : number; },
        '$data.Number': function (number) { return number; },
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
        '$data.String': function (text) { return text; },
        '$data.Boolean': function (bool) { return bool; },
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
        //'$data.Entity': function (e) { return e; },
        '$data.Integer': function (e) { return e; },
        '$data.Number': function (e) { return e; },
        '$data.Date': function (e) { return e ? e.toISOString() : e; },
        '$data.String': function (e) { return e; },
        '$data.Boolean': function (e) { return e; },
        '$data.Blob': function (e) { return e; },
        '$data.Object': function (e) { return e; },
        '$data.Array': function (e) { return e; },
        '$data.GeographyPoint': function (e) { return e; },
        '$data.GeographyLineString': function (e) { return e; },
        '$data.GeographyPolygon': function (e) { return e; },
        '$data.GeographyMultiPoint': function (e) { return e; },
        '$data.GeographyMultiLineString': function (e) { return e; },
        '$data.GeographyMultiPolygon': function (e) { return e; },
        '$data.GeographyCollection': function (e) { return e; },
        '$data.GeometryPoint': function (e) { return e; },
        '$data.GeometryLineString': function (e) { return e; },
        '$data.GeometryPolygon': function (e) { return e; },
        '$data.GeometryMultiPoint': function (e) { return e; },
        '$data.GeometryMultiLineString': function (e) { return e; },
        '$data.GeometryMultiPolygon': function (e) { return e; },
        '$data.GeometryCollection': function (e) { return e; },
        '$data.Guid': function (e) { return e; }
    },
    escape: {
        //'$data.Entity': function (e) { return "'" + JSON.stringify(e.initData) + "'" },
        '$data.Integer': function (number) { return number; },
        '$data.Number': function (number) { return number % 1 == 0 ? number : number + 'm'; },
        '$data.Date': function (date) { return date ? "datetime'" + date + "'" : null; },
        '$data.String': function (text) { return typeof text === 'string' ? "'" + text.replace(/'/g, "''") + "'" : text; },
        '$data.Boolean': function (bool) { return typeof bool === 'boolean' ? bool.toString() : bool; },
        '$data.Blob': function (blob) { return blob; },
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
