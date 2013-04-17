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
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Entity': function (e) { return "'" + JSON.stringify(e.initData) + "'" },
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Number': function (number) { return number % 1 == 0 ? number : number + 'm'; },
        '$data.Date': function (date) { return date ? "datetime'" + date.toISOString() + "'" : null; },
        '$data.String': function (text) { return "'" + text.replace(/'/g, "''") + "'"; },
        '$data.Boolean': function (bool) { return bool ? 'true' : 'false'; },
        '$data.Blob': function (blob) { return blob; },
        '$data.Object': function (o) { return JSON.stringify(o); },
        '$data.Array': function (o) { return JSON.stringify(o); },
        '$data.GeographyPoint': function (geo) {
            /*POINT(-127.89734578345 45.234534534)*/
            if (geo instanceof $data.GeographyPoint)
                return "geography'POINT(" + geo.longitude + ' ' + geo.latitude + ")'";
            return geo;
        },
        '$data.Guid': function (guid) { return guid ? ("guid'" + guid.toString() + "'") : guid; }
    }
};
