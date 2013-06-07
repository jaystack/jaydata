$data.mongoDBConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': function (date) { return date ? new Date(date) : date; },
        '$data.DateTimeOffset': function (date) { return date ? new Date(date) : date; },
        '$data.Time': function (date) { return date ? Container.convertTo(date, $data.Time) : date; },
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': function (v) { return v ? $data.Container.convertTo(typeof v === 'string' ? atob(v) : v.buffer || v, $data.Blob) : v; },
        '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } return o; },
        '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } return o; },
        '$data.ObjectID': function (id) { return id ? new Buffer(id.toString(), 'ascii').toString('base64') : id; },
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
        "$data.Guid": function (g) { return g ? $data.parseGuid(g).toString() : g; }
    },
    toDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': $data.Container.proxyConverter,
        '$data.DateTimeOffset': $data.Container.proxyConverter,
        '$data.Time': $data.Container.proxyConverter,
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Object': $data.Container.proxyConverter,
        '$data.Array': $data.Container.proxyConverter,
        '$data.ObjectID': function (id) {
            if (id && typeof id === 'string') {
                try {
                    return new $data.ObjectID(id);
                } catch (e) {
                    try {
                        return new $data.ObjectID(new Buffer(id, 'base64').toString('ascii'));
                    } catch (e) {
                        console.log(e);
                        return id;
                    }
                }
            } else return id;
        },
        '$data.GeographyPoint': function (g) { return g ? g.coordinates : g; },
        '$data.GeographyLineString': $data.Container.proxyConverter,
        '$data.GeographyPolygon': $data.Container.proxyConverter,
        '$data.GeographyMultiPoint': $data.Container.proxyConverter,
        '$data.GeographyMultiLineString': $data.Container.proxyConverter,
        '$data.GeographyMultiPolygon': $data.Container.proxyConverter,
        '$data.GeographyCollection': $data.Container.proxyConverter,
        '$data.GeometryPoint': function (g) { return g ? g.coordinates : g; },
        '$data.GeometryLineString': $data.Container.proxyConverter,
        '$data.GeometryPolygon': $data.Container.proxyConverter,
        '$data.GeometryMultiPoint': $data.Container.proxyConverter,
        '$data.GeometryMultiLineString': $data.Container.proxyConverter,
        '$data.GeometryMultiPolygon': $data.Container.proxyConverter,
        '$data.GeometryCollection': $data.Container.proxyConverter,
        "$data.Guid": function (g) { return g ? g.toString() : g; }
    }
};
