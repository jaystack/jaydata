$data.mongoDBConverter = {
    fromDb: {
        '$data.Integer': function (number) { return number; },
        '$data.Number': function (number) { return number; },
        '$data.Date': function (date) { return date ? new Date(date) : date; },
        '$data.String': function (text) { return text; },
        '$data.Boolean': function (bool) { return bool; },
        '$data.Blob': function (blob) { return blob; },
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
        '$data.Integer': function (number) { return number; },
        '$data.Number': function (number) { return number; },
        '$data.Date': function (date) { return date; },
        '$data.String': function (text) { return text; },
        '$data.Boolean': function (bool) {
            if (typeof bool === 'string') {
                switch (bool) {
                    case 'true': case 'true': case 'TRUE':
                    case 'yes': case 'Yes': case 'YES':
                        return true;
                    default:
                        return false;
                }
            }
            //return typeof bool === 'string' ? (bool === 'true' ? true : false) : !!bool;
            return bool === null || bool === undefined ? null : !!bool;
        },
        '$data.Blob': function (blob) { return blob; },
        '$data.Object': function (o) { return o; },
        '$data.Array': function (o) { return o; },
        '$data.ObjectID': function (id) {
            if (id && typeof id === 'string'){
                return new $data.mongoDBDriver.ObjectID.createFromHexString(new Buffer(id, 'base64').toString('ascii'));
            }else return id;
        },
        '$data.GeographyPoint': function (g) { return g.coordinates; },
        '$data.GeographyLineString': function (g) { return g; },
        '$data.GeographyPolygon': function (g) { return g; },
        '$data.GeographyMultiPoint': function (g) { return g; },
        '$data.GeographyMultiLineString': function (g) { return g; },
        '$data.GeographyMultiPolygon': function (g) { return g; },
        '$data.GeographyCollection': function (g) { return g; },
        '$data.GeometryPoint': function (g) { return g.coordinates; },
        '$data.GeometryLineString': function (g) { return g; },
        '$data.GeometryPolygon': function (g) { return g; },
        '$data.GeometryMultiPoint': function (g) { return g; },
        '$data.GeometryMultiLineString': function (g) { return g; },
        '$data.GeometryMultiPolygon': function (g) { return g; },
        '$data.GeometryCollection': function (g) { return g; },
        "$data.Guid": function (g) { return g ? g.toString() : g; }
    }
};
