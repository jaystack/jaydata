exports.Test = {
    'Geography': {
        'exists': function (test) {
            test.expect(4);

            test.equal(typeof $data.GeographyPoint, 'function', '$data.GeographyPoint exists failed');

            var geo = new $data.GeographyPoint(1234.1536, -43.543);
            test.equal(geo instanceof $data.GeographyPoint, true, '$data.GeographyPoint instanceof failed');
            test.equal(geo.longitude, 1234.1536, '$data.GeographyPoint longitude failed');
            test.equal(geo.latitude, -43.543, '$data.GeographyPoint latitude failed');

            test.done();
        },
        'in Filter': function (test) {
            test.expect(1);

            var context = $example.Context.getContext();
            var query = context.Places.filter(function (p) { return p.Location == this.loc }, { loc: new $data.GeographyPoint(44.001, -33.123) }).toTraceString();
            test.equal(query.queryText, "/Places?$filter=(Location eq geography'POINT(44.001 -33.123)')", 'GeographyPoint url failed');

            test.done();
        }
    }/*,

    'Geometry': {
        'exists': function (test) {
            test.expect(4);

            test.equal(typeof $data.GeometryPoint, 'function', '$data.GeometryPoint exists failed');

            var geo = new $data.GeometryPoint(1234.1536, -43.543);
            test.equal(geo instanceof $data.GeometryPoint, true, '$data.GeometryPoint instanceof failed');
            test.equal(geo.x, 1234.1536, '$data.GeometryPoint x failed');
            test.equal(geo.y, -43.543, '$data.GeometryPoint y failed');

            test.done();
        },
        'in Filter': function (test) {
            test.expect(1);

            var context = $example.Context.getContext();
            var query = context.Places.filter(function (p) { return p.Location == this.loc }, { loc: new $data.GeometryPoint(44.001, -33.123) }).toTraceString();
            test.equal(query.queryText, "/Places?$filter=(Location eq geometry'POINT(44.001 -33.123)')", 'GeometryPoint url failed');

            test.done();
        }
    }*/
}