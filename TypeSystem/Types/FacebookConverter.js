$data.FacebookConverter = {
    fromDb: {
        '$data.Number': function (value) { return value; },
        '$data.Integer': function (value) { return value; },
        '$data.String': function (value) { return value; },
        '$data.Date': function (value) { return new Date(typeof value === "string" ? parseInt(value) : value); },
        '$data.Boolean': function (value) { return !!value },
        '$data.Blob': function (value) { return value; },
        '$data.Array': function (value) { if (value === undefined) { return new $data.Array(); } return value; }
    },
    toDb: {
        '$data.Number': function (value) { return value; },
        '$data.Integer': function (value) { return value; },
        '$data.String': function (value) { return "'" + value + "'"; },
        '$data.Date': function (value) { return value ? value.valueOf() : null; },
        '$data.Boolean': function (value) { return value },
        '$data.Blob': function (value) { return value; },
        '$data.Array': function (value) { return '(' + value.join(', ') + ')'; }
    }
};
