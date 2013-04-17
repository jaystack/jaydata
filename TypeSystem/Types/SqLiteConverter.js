$data.SqLiteConverter = {
    fromDb: {
        "$data.Integer": function (number) { return number; },
        "$data.Number": function (number) { return number; },
        "$data.Date": function (dbData) { return dbData != null ? new Date(dbData) : dbData; },
        "$data.String": function (text) { return text; },
        "$data.Boolean": function (b) { return b === 1 ? true : false; },
        "$data.Blob": function (blob) { return blob; },
        "$data.Array": function () {
            if (arguments.length == 0) return [];
            return arguments[0] ? JSON.parse(arguments[0]) : undefined;
        },
        "$data.Guid": function (g) { return g ? $data.parseGuid(g).toString() : g; },
        '$data.GeographyPoint': function (g) { if (g) { return new $data.GeographyPoint(JSON.parse(g)); } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return new $data.GeographyLineString(JSON.parse(g)); } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return new $data.GeographyPolygon(JSON.parse(g)); } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return new $data.GeographyMultiPoint(JSON.parse(g)); } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return new $data.GeographyMultiLineString(JSON.parse(g)); } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return new $data.GeographyMultiPolygon(JSON.parse(g)); } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return new $data.GeographyCollection(JSON.parse(g)); } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return new $data.GeometryPoint(JSON.parse(g)); } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return new $data.GeometryLineString(JSON.parse(g)); } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return new $data.GeometryPolygon(JSON.parse(g)); } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return new $data.GeometryMultiPoint(JSON.parse(g)); } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return new $data.GeometryMultiLineString(JSON.parse(g)); } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return new $data.GeometryMultiPolygon(JSON.parse(g)); } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return new $data.GeometryCollection(JSON.parse(g)); } return g; }
    },
    toDb: {
        "$data.Integer": function (number) { return number; },
        "$data.Number": function (number) { return number; },
        "$data.Date": function (date) { return date ? date.valueOf() : null; },
        "$data.String": function (text) { return text; },
        "$data.Boolean": function (b) { return b ? 1 : 0; },
        "$data.Blob": function (blob) { return blob; },
        "$data.Array": function (arr) { return arr ? JSON.stringify(arr) : arr; },
        "$data.Guid": function (g) { return g ? g.toString() : g; },
        "$data.Object": function (value) { if (value === null) { return null; } throw 'Not supported exception'; },
        '$data.GeographyPoint': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return JSON.stringify(g); } return g; }
    }
};
