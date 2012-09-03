exports.Test = {
    'Geography': {
        'exists': function (test) {
            test.expect(4);

            test.equal(typeof $data.Geography, 'function', '$data.Geography exists failed');

            var geo = new $data.Geography(1234.1536, -43.543);
            test.equal(geo instanceof $data.Geography, true, '$data.Geography instanceof failed');
            test.equal(geo.longitude, 1234.1536, '$data.Geography longitude failed');
            test.equal(geo.latitude, -43.543, '$data.Geography latitude failed');

            test.done();
        },
        'in Filter': function (test) {
            test.expect(1);

            var context = $example.Context.getContext();
            var query = context.Places.filter(function (p) { return p.Location == this.loc }, { loc: new $data.Geography(44.001, -33.123) }).toTraceString();
            test.equal(query.queryText, "/Places?$filter=(Location eq POINT(44.001 -33.123))", 'Geography url failed');

            test.done();
        }
    }
}