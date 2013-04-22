$data.WebApiConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,//function (number) { return (typeof number === 'string' && /^\d+$/.test(number)) ? parseInt(number) : number; },
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': function (dbData) { return dbData ? new Date(dbData) : undefined; },
        '$data.DateTimeOffset': function (dbData) { return dbData ? new Date(dbData) : undefined; },
        '$data.Time': function (v) { return $data.Container.convertTo(v, $data.Time); },
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } else if (typeof o === 'string') { return JSON.parse(o); } return o; },
        '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } else if (o instanceof $data.Array) { return o; } return JSON.parse(o); },
        '$data.GeographyPoint': function (geo) {
            if (geo && typeof geo === 'object' && Array.isArray(geo.coordinates)) {
                return new $data.GeographyPoint(geo.coordinates);
            }
            return geo;
        },
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
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': function (e) { return e ? e.toISOString().replace('Z', '') : e; },
        '$data.Time': function (v) { return v ? v.toISOString().split('T')[1].replace('Z', '') : v; },
        '$data.DateTimeOffset': function (v) { return v ? v.toISOString() : v; },
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': function (v) { return v ? $data.Blob.toBase64(v) : v; },
        '$data.Object': $data.Container.proxyConverter,
        '$data.Array': $data.Container.proxyConverter,
        '$data.GeographyPoint': $data.Container.proxyConverter,
        '$data.Guid': $data.Container.proxyConverter
    },
    escape: {
        '$data.Entity': function (e) { return JSON.stringify(e); },
        '$data.Integer': $data.Container.proxyConverter,
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
        '$data.Blob': function (b) { return b ? "X'" + $data.Blob.toHexString(b) + "'" : b; },
        '$data.Object': function (o) { return JSON.stringify(o); },
        '$data.Array': function (o) { return JSON.stringify(o); },
        '$data.GeographyPoint': function (g) { if (g) { return $data.GeographyBase.stringifyToUrl(g); } return g; },
        '$data.Guid': function (guid) { return guid ? ("guid'" + guid.toString() + "'") : guid; }
    }
};
