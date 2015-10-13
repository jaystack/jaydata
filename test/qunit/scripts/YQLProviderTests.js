$(document).ready(function () {
    module("YQL_provider_tests");

    var yahooContext = new $data.Yahoo.YQLContext({ name: 'YQL' });
    yahooContext.onReady(function (context) {
        test("YQL provider default initialize", 3, function () {
            var provider = new $data.storageProviders.YQL.YQLProvider();
            notEqual(provider.providerConfiguration, null, "Default provider config object faild");
            equal(provider.providerConfiguration.YQLQueryUrl, "http://query.yahooapis.com/v1/public/yql?q=", "Default YQL query url faild!");
            equal(provider.providerConfiguration.YQLFormat, "format=json", "Default YQL format faild!");
        });
        test("YQL provider custom initialize", 3, function () {
            var provider = new $data.storageProviders.YQL.YQLProvider({ YQLQueryUrl: "http://query.yahooapis.com/v1/yql?q=", YQLFormat: "format=xml" });
            notEqual(provider.providerConfiguration, null, "Custom provider config object faild");
            equal(provider.providerConfiguration.YQLQueryUrl, "http://query.yahooapis.com/v1/yql?q=", "Default YQL query url faild!");
            equal(provider.providerConfiguration.YQLFormat, "format=xml", "Default YQL format faild!");
        });

        test("query_full_table", 2, function () {
            var q = context.Oceans.toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans", "Invalid query string");

        });

        test("query_full_table_orderby", 2, function () {
            var q = context.Oceans
            .orderBy(function (item) { return item.name; }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans | sort(field='name', descending='false')", "Invalid query string");
        });

        test("query_full_table_multiple_orderby", 2, function () {
            var q = context.Oceans
            .orderBy(function (item) { return item.name; })
            .orderBy(function (item) { return item.woeid; }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans | sort(field='woeid', descending='false', field='name', descending='false')", "Invalid query string");
        });

        test("query_full_table_orderby_desc", 2, function () {
            var q = context.Oceans
            .orderByDescending(function (item) { return item.name; }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans | sort(field='name', descending='true')", "Invalid query string");
        });

        test("query_full_table_multiple_orderby_desc", 2, function () {
            var q = context.Oceans
            .orderByDescending(function (item) { return item.name; })
            .orderByDescending(function (item) { return item.woeid; }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans | sort(field='woeid', descending='true', field='name', descending='true')", "Invalid query string");
        });

        test("query_full_table_multiple_orderby_asc_desc", 2, function () {
            var q = context.Oceans
            .orderBy(function (item) { return item.name; })
            .orderByDescending(function (item) { return item.woeid; }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans | sort(field='woeid', descending='true', field='name', descending='false')", "Invalid query string");
        });

        test("query_full_table_top", 2, function () {
            var q = context.Oceans.take(10).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans | truncate(count=10)", "Invalid query string");
        });

        test("query_full_table_skip", 2, function () {
            var q = context.Oceans.skip(10).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans", "Invalid query string");
        });

        test("query_full_table_skip_top", 2, function () {
            var q = context.Oceans.skip(10).take(5).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans | truncate(count=15) | tail(count=5)", "Invalid query string");
        });

        test("filter_table_1_field_string", 2, function () {
            var q = context.Oceans.where(function (o) { return o.name == "alma"; }, {}).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE (name = 'alma')", "Invalid query string");
        });

        test("filter_table_1_field_int", 2, function () {
            var q = context.Oceans.where(function (o) { return o.woeid == 12345; }, {}).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE (woeid = 12345)", "Invalid query string");
        });

        test("filter_table_2_field_mix", 2, function () {
            var q = context.Oceans.where(function (o) { return o.name == "alma" && o.woeid == 12345; }, {}).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE ((name = 'alma') AND (woeid = 12345))", "Invalid query string");
        });

        test("filter_table_contains", 2, function () {
            var q = context.Oceans.where(function (o) { return o.name.contains("A"); }, {}).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE (name LIKE '%A%')", "Invalid query string");
        });

        test("filter_table_contains_param", 2, function () {
            var q = context.Oceans.where(function (o) { return o.name.contains(this.containsParam) }, { containsParam: "A" }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE (name LIKE '%A%')", "Invalid query string");
        });

        test("filter_table_start_with", 2, function () {
            var q = context.Oceans.where(function (o) { return o.name.startsWith("A"); }, {}).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE (name LIKE 'A%')", "Invalid query string");
        });

        test("filter_table_end_with", 2, function () {
            var q = context.Oceans.where(function (o) { return o.name.endsWith("A"); }, {}).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE (name LIKE '%A')", "Invalid query string");
        });

        test("filter_table_in_array", 2, function () {
            var q = context.Oceans.where(function (o) { return o.woeid in this.woeids; }, { woeids: [123, 456, 789] }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE (woeid IN (123, 456, 789))", "Invalid query string");
        });

        test("filter_table_in_queryable", 2, function () {
            var places = context.Places.where(function (place) { return place.name == "Hungary" }, null).select(function (p) { return p.woeid });
            var q = context.Oceans.where(function (o) { return o.woeid in this.woeids; }, { woeids: places }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.oceans WHERE (woeid IN (SELECT woeid FROM geo.places WHERE (name = \'Hungary\')))", "Invalid query string");
        });

        test("filter_table_complextype", 2, function () {
            var q = context.Places.where(function (p) { return p.boundingBox.southWest.latitude == this.latitude }, { latitude: "50.864220" }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT * FROM geo.places WHERE (boundingBox.southWest.latitude = '50.864220')", "Invalid query string");
        });

        test("select_table_single", 2, function () {
            var q = context.Places.where(function (p) { return p.name == this.name }, { name: 'nameprop' }).select(function (p) { return p.areaRank }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT areaRank FROM geo.places WHERE (name = 'nameprop')", "Invalid query string");
        });

        test("select_table_single_custom", 2, function () {
            var q = context.Places.where(function (p) { return p.name == this.name }, { name: 'nameprop' }).select(function (p) { return { s1: p.areaRank } }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT areaRank FROM geo.places WHERE (name = 'nameprop')", "Invalid query string");
        });

        test("select_table_single_complexType", 2, function () {
            var q = context.Places.where(function (p) { return p.name == this.name }, { name: 'nameprop' }).select(function (p) { return p.placeTypeName.content }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT placeTypeName.content FROM geo.places WHERE (name = 'nameprop')", "Invalid query string");
        });

        test("select_table_single_complexType_custom", 2, function () {
            var q = context.Places.where(function (p) { return p.name == this.name }, { name: 'nameprop' }).select(function (p) { return { s1: p.placeTypeName.content } }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT placeTypeName.content FROM geo.places WHERE (name = 'nameprop')", "Invalid query string");
        });

        test("select_table_multi", 2, function () {
            var q = context.Places.where(function (p) { return p.name == this.name }, { name: 'nameprop' }).select(function (p) { return { areaRank: p.areaRank, popRank: p.popRank } }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT areaRank, popRank FROM geo.places WHERE (name = 'nameprop')", "Invalid query string");
        });

        test("select_table_multi_custom", 2, function () {
            var q = context.Places.where(function (p) { return p.name == this.name }, { name: 'nameprop' }).select(function (p) { return { s1: p.areaRank, s2: p.popRank } }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT areaRank, popRank FROM geo.places WHERE (name = 'nameprop')", "Invalid query string");
        });

        test("select_table_multi_complexType", 2, function () {
            var q = context.Places.where(function (p) { return p.name == this.name }, { name: 'nameprop' }).select(function (p) { return { s1: p.placeTypeName.content, s2: p.boundingBox.southWest.latitude } }).toTraceString();
            ok(q.params, "Params array invalid value");
            equal(q.queryText, "SELECT placeTypeName.content, boundingBox.southWest.latitude FROM geo.places WHERE (name = 'nameprop')", "Invalid query string");
        });

        test("query_table_result_Oceans", 2, function () {
            stop(1);
            context.Oceans.toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
                equal(result[0] instanceof $data.Yahoo.types.Geo.ocean, true, 'result item type');
            });
        });

        test("query_table_result_1", 1, function () {
            stop(1);
            context.Oceans.take(1).toArray(function (result) {
                start(1);
                equal(result.length, 1, "Result array length invalid");
            });
        });

        test("query_table_result_2", 1, function () {
            stop(1);
            context.Oceans.take(2).toArray(function (result) {
                start(1);
                equal(result.length, 2, "Result array length invalid");
            });
        });

        test("query_table_result_Seas", 1, function () {
            stop(1);
            context.Seas.toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_Continents", 1, function () {
            stop(1);
            context.Continents.toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_Counties", 1, function () {
            stop(1);
            context.Counties.where(function (c) { return c.place == this.place && c.lang == "hu-HU"; }, { place: "Pest" }).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_Countries", 1, function () {
            stop(1);
            context.Countries.toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_Districts", 1, function () {
            stop(1);
            context.Districts.where(function (c) { return c.place == this.place; }, { place: "Greater London" }).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_Places", 2, function () {
            stop(1);
            context.Places.where(function (c) { return c.text == this.text; }, { text: "Budaörs, magyarország" }).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
                equal(result[0] instanceof $data.Yahoo.types.Geo.place, true, 'result item type');
            });
        });

        test("query_table_result_places_ancestors", 1, function () {
            stop(1);
            context.PlaceAncestors.where(function (c) { return c.descendant_woeid == 2502265; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_places_children", 1, function () {
            stop(1);
            context.PlaceChildrens.where(function (c) { return c.parent_woeid == 2502265; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_places_common", 1, function () {
            stop(1);
            context.PlaceCommons.where(function (c) { return c.woeid1 == 2502265 && c.woeid2 == 2488042; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_places_descendants", 1, function () {
            stop(1);
            context.PlaceDescendants.where(function (c) { return c.ancestor_woeid == 2502265; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_places_neighbors", 1, function () {
            stop(1);
            context.PlaceNeighbors.where(function (c) { return c.neighbor_woeid == 2502265; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_places_parent", 1, function () {
            stop(1);
            context.PlaceParents.where(function (c) { return c.child_woeid == 2502265; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_places_siblings", 1, function () {
            stop(1);
            context.PlaceSiblings.where(function (c) { return c.sibling_woeid == 2502265; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_places_belongtos", 1, function () {
            stop(1);
            context.PlaceBelongtos.where(function (c) { return c.member_woeid == 2502265; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_placetypes", 1, function () {
            stop(1);
            context.PlaceTypes.toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid //TODO");
            });
        });

        test("query_table_result_states", 1, function () {
            stop(1);
            context.States.where(function (c) { return c.place == "United States"; }, null).toArray(function (result) {
                start(1);
                ok(result.length > 0, "Result array length invalid");
            });
        });

        test("query_table_result_property_checks", 5, function () {
            stop(1);
            context.Places.where(function (c) { return c.woeid == this.woeid; }, { woeid: 2514815 }).toArray(function (result) {
                start(1);
                equal(result[0].name, 'Washington', 'result item value');
                equal(result[0].country.code, 'US', 'result item complex value');
                equal(result[0].admin1.type, 'District', 'result item complex value');
                equal(result[0].centroid.latitude, '38.899101', 'result item complex value');
                equal(result[0].boundingBox.northEast.latitude, '38.995960', 'result item complex value');
            });
        });

        test("query_table_result_select_checks", 5, function () {
            stop(1);
            context.Places.where(function (c) { return c.woeid == this.woeid; }, { woeid: 2514815 }).select(function (c) { return { name: c.name, popRank: c.popRank } }).toArray(function (result) {
                start(1);

                equal(result.length, 1, 'result length');
                equal(result[0].getType, undefined, 'Anonymous result');
                equal(result[0].name, 'Washington', 'result item value');
                equal(result[0].popRank, '13', 'result item value');
                equal(result[0].areaRank, undefined, 'result item value');
            });
        });

        test('query_table_result_single_first', 5, function () {

            stop();
            context.Oceans.first(undefined, undefined, function (o) {
                start();
                equal(o instanceof $data.Yahoo.types.Geo.ocean, true, 'result type failed');
                equal(o.name, 'Atlantic Ocean', 'result property load failed');
            });

            stop();
            context.Oceans.take(1).single(undefined, undefined, {
                error: function (o) {
                    start();
                    equal(o instanceof Exception, true, 'result type failed');
                }
            });

            stop();
            context.Oceans.first(function (o) { return o.name.contains('p') }, undefined, function (o) {
                start();
                equal(o instanceof $data.Yahoo.types.Geo.ocean, true, 'result type failed');
                equal(o.name, 'Pacific Ocean', 'result property load failed');

            })
        });


        test("YQL Data provider exists", 10, function () {
            ok(context.Atom != undefined, "YQL EntitSet object faild");
            ok(context.Csv != undefined, "YQL EntitSet object faild");
            ok(context.DataUri != undefined, "YQL EntitSet object faild");
            ok(context.Feed != undefined, "YQL EntitSet object faild");
            ok(context.FeedNormalizer != undefined, "YQL EntitSet object faild");
            ok(context.Html != undefined, "YQL EntitSet object faild");
            ok(context.Json != undefined, "YQL EntitSet object faild");
            ok(context.Rss != undefined, "YQL EntitSet object faild");
            ok(context.Xml != undefined, "YQL EntitSet object faild");
            ok(context.Xslt != undefined, "YQL EntitSet object faild");
        });

        test("YQL query_data_full_table", 3, function () {
            var q = context.Html.toTraceString();
            equal(q.queryText, "SELECT * FROM html", "Invalid query string");

            var q = context.Html.filter(function (s) { return s.url == 'http://www.jaystack.com'; }).toTraceString();
            equal(q.queryText, "SELECT * FROM html WHERE (url = 'http://www.jaystack.com')", "Invalis query string");

            var q = context.Html.filter(function (s) { return s.url == 'http://www.jaystack.com' && s.xpath == '//div'; }).toTraceString();
            equal(q.queryText, "SELECT * FROM html WHERE ((url = 'http://www.jaystack.com') AND (xpath = '//div'))", "Invalis query string");
        });

        test("YQL query_data_full_live_html", 5, function () {
            stop(2);
            context.Html.filter(function (f) { return f.url == 'http://www.jaydata.com'; }).toArray(function (result) {
                start();
                equal(result.length, 1, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
            });

            context.Html.filter(function (f) { return f.url == 'http://www.jaydata.com' && f.xpath == '//div'; }).toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
            });

        });

        test("YQL query_data_full_live_Csv", 3, function () {
            stop(1);

            context.Csv.filter(function (f) { return f.url == 'http://download.finance.yahoo.com/d/quotes.csv?s=YHOO,GOOG,AAPL&f=sl1d1t1c1ohgv&e=.csv' && f.columns == 'symbol,price,date,time,change,col1,high,low,col2'; }).toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
            });
        });

        test("YQL query_data_full_live_Datauri", 3, function () {
            stop(1);

            context.DataUri.filter(function (f) { return f.url == 'http://l.yimg.com/a/i/us/pps/yql32.png'; }).toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
            });

        });

        test("YQL query_data_full_live_Feed", 3, function () {
            stop(1);

            context.Feed.filter(function (f) { return f.url == 'http://rss.news.yahoo.com/rss/topstories'; }).toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
            });
        });

        test("YQL query_data_full_live_FeedNormalizer", 3, function () {
            stop(1);
            context.FeedNormalizer.filter(function (f) { return f.url == 'http://rss.news.yahoo.com/rss/topstories' && f.output == 'atom_1.0'; }).toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
            });
        });

        test("YQL query_data_full_live_Json", 3, function () {
            stop(1);
            context.Json.filter(function (f) { return f.url == 'http://pipes.yahoo.com/pipes/pipes.popular?_out=json' && f.itemPath == 'value.items'; }).toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
            });
        });

        test("YQL query_data_full_live_Rss", 3, function () {
            stop(1);
            context.Rss.filter(function (f) { return f.url == 'http://rss.news.yahoo.com/rss/topstories'; }).toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0] instanceof $data.Yahoo.types.YQLRss, true, "Anonymous result failed");
            });
        });

        test("YQL query_data_full_live_Xml", 3, function () {
            stop(1);
            context.Xml.filter(function (f) { return f.url == 'http://rss.news.yahoo.com/rss/topstories'; }).toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
            });
        });

       test("YQL query_data_complexType_live", 29, function () {
            stop(1)
            context.Places.where(function (p) { return p.text == this.text && p.boundingBox.southWest.latitude == this.latitude; }, { text: "us", latitude: '50.864220' })
            .toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType(), $data.Yahoo.types.Geo.place, "place item result");
                equal(result[0].boundingBox.southWest.latitude, '50.864220', "result item value");
            });

            stop(1)
            context.Places.where(function (p) { return p.text == this.text && p.boundingBox.southWest.latitude == this.latitude; }, { text: "us", latitude: '50.864220' })
            .select(function (p) { return p.boundingBox.southWest.latitude; })
            .toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is not array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
                equal(result[0], '50.864220', "result item value");
            });
            
            stop(1)
            context.Places.where(function (p) { return p.text == this.text && p.boundingBox.southWest.latitude == this.latitude; }, { text: "us", latitude: '50.864220' })
            .select(function (p) { return p.boundingBox.southWest; })
            .toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is not array");
                ok(result.length > 0, "result length");
                equal(result[0].getType(), $data.Yahoo.types.Geo.centroidCf, "Anonymous result");
                equal(result[0].latitude, '50.864220', "result item value");
            });

            stop(1)
            context.Places.where(function (p) { return p.text == this.text && p.boundingBox.southWest.latitude == this.latitude; }, { text: "us", latitude: '50.864220' })
            .select(function (p) { return p.boundingBox; })
            .toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is not array");
                ok(result.length > 0, "result length");
                notEqual(result[0].getType, undefined, "Not Anonymous result");
                equal(result[0] instanceof $data.Yahoo.types.Geo.boundingBoxCf, true, "result item type");
                equal(result[0].southWest instanceof $data.Yahoo.types.Geo.centroidCf, true, "result item type");
                equal(result[0].southWest.latitude, '50.864220', "result item value");
            });

            stop(1)
            context.Places.where(function (p) { return p.text == this.text && p.boundingBox.southWest.latitude == this.latitude; }, { text: "us", latitude: '50.864220' })
            .select(function (p) { return { name: p.name, boundingBox: p.boundingBox }; })
            .toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is not array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
                equal(result[0].name, 'University of Sussex', "result item value");
                equal(result[0].boundingBox instanceof $data.Yahoo.types.Geo.boundingBoxCf, true, "result item type");
                equal(result[0].boundingBox.southWest instanceof $data.Yahoo.types.Geo.centroidCf, true, "result item type");
                equal(result[0].boundingBox.southWest.latitude, '50.864220', "result item value");
            });

            stop(1)
            context.Places.where(function (p) { return p.text == this.text && p.boundingBox.southWest.latitude == this.latitude; }, { text: "us", latitude: '50.864220' })
            .select(function (p) { return { latitude: p.boundingBox.southWest.latitude }; })
            .toArray(function (result) {
                start();
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
                equal(result[0].latitude, '50.864220', "result item value");
            });

        });
    });

});
