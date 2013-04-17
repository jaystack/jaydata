$data.FacebookConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.String': $data.Container.proxyConverter,
        '$data.Date': function (value) { return new Date(typeof value === "string" ? parseInt(value) : value); },
        '$data.Boolean': function (value) { return !!value },
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Array': function (value) { if (value === undefined) { return new $data.Array(); } return value; }
    },
    toDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.String': function (value) { return "'" + value + "'"; },
        '$data.Date': function (value) { return value ? value.valueOf() : null; },
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Array': function (value) { return '(' + value.join(', ') + ')'; }
    }
};
