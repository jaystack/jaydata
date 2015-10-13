$(document).ready(function () {
    module("inMemory_provider_tests");


    test('empty context', 1, function () {
        stop(1);
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory' });
        memoryContext.onReady(function () {
            memoryContext.Oceans.toArray(function (r) {
                start();
                equal(r.length, 0, 'empty context source length failed');
            });
        });
    });

    test('inicialized context', 1, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            memoryContext.Oceans.toArray(function (r) {
                start();
                equal(r.length, 2, 'inicialized context source length failed');
            });
        });
    });

    test('inicialized context invalid element', 1, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.place({ woeid: 1235, name: 'invalidplace', lang: 'en-us' })
        ];
        try {
            var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
            memoryContext.onReady(function () {
                memoryContext.Oceans.toArray(function (r) {
                    start();
                    ok(false, 'invalid element in context');
                });
            });
        } catch (e) {
            start();
            ok(true, 'invalid element in context failed');
        }

    });

    test('length', 1, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            memoryContext.Oceans.length(function (r) {
                start();
                equal(r, 2, 'result value failed');
            });
        });
    });
    test('forEach', 2, function () {
        stop(2);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            memoryContext.Oceans.forEach(function (r, idx) {
                start();
                equal(r.name, 'ocean' + (idx + 1), 'foreach result value failed');
            });
        });
    });

    test('filter string equal', 3, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.name == 'ocean1'; }).toTraceString();
            equal(q.$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\n return (o.name == 'ocean1');\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.filter(function (o) { return o.name == 'ocean1'; }).toArray(function (r) {
                start();
                equal(r.length, 1, 'filter result length failed');
                equal(r[0].name, 'ocean1', 'filter result[0] name failed');
            });
        });
    });

    test('single', 1, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            memoryContext.Oceans.single(function (o) { return o.name == 'ocean1'; }, undefined, function (r) {
                start();
                equal(r.name, 'ocean1', 'single result name failed');
            });
        });
    });

    test('first', 1, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            memoryContext.Oceans.first(undefined, undefined, function (r) {
                start();
                equal(r.name, 'ocean1', 'first result name failed');
            });
        });
    });

    test('some', 2, function () {
        stop(2);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            memoryContext.Oceans.some(function (o) { return o.name == 'ocean2'; }, undefined, function (r) {
                start();
                equal(r, true, 'some result failed');
            });
            memoryContext.Oceans.some(function (o) { return o.name == 'ocean3'; }, undefined, function (r) {
                start();
                equal(r, false, 'some result failed');
            });
        });
    });

    test('every', 2, function () {
        stop(2);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            try {
                memoryContext.Oceans.every(function (o) { return o.lang == 'en-us'; }, undefined, function (r) {
                    start();
                    equal(r, true, 'every result failed');
                });
                memoryContext.Oceans.every(function (o) { return o.name == 'ocean2'; }, undefined, function (r) {
                    start();
                    equal(r, false, 'every result failed');
                });
            } catch (e) {
                start(2);
                ok(true, e);
                ok(true, 'not supported')
            }


        });
    });

    test('filter simple binary', 3, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.name == 'ocean2' && o.woeid == 1235; }).toTraceString();
            equal(q.$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\nreturn ((o.name == 'ocean2') && (o.woeid == 1235));\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.filter(function (o) { return o.name == 'ocean2' && o.woeid == 1235; }).toArray(function (r) {
                start();
                equal(r.length, 1, 'filter result length failed');
                equal(r[0].name, 'ocean2', 'filter result[0] name failed');
            });
        });
    });

    test('filter complex binary', 3, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.name == 'ocean2' && (o.woeid == 1235 || o.name == 'ocean1'); }).toTraceString();
            equal(q.$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\nreturn ((o.name == 'ocean2') && ((o.woeid == 1235) || (o.name == 'ocean1')));\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.filter(function (o) { return o.name == 'ocean2' && o.woeid == 1235; }).toArray(function (r) {
                start();
                equal(r.length, 1, 'filter result length failed');
                equal(r[0].name, 'ocean2', 'filter result[0] name failed');
            });
        });
    });

    test('filter complex field equal', 4, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us',
                placeTypeName: new $data.Yahoo.types.Geo.placeTypeNameCf({ code: '1', content: 'Ocean' })
            }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us',
                placeTypeName: new $data.Yahoo.types.Geo.placeTypeNameCf({ code: '2', content: 'Sea' })
            })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.placeTypeName.code == '1'; }).toTraceString();
            equal(q.$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\nreturn (o.placeTypeName.code == '1');\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.filter(function (o) { return o.placeTypeName.code == '1'; }).toArray(function (r) {
                start();
                equal(r.length, 1, 'filter result length failed');
                equal(r[0].name, 'ocean1', 'filter result[0] name failed');
                equal(r[0].placeTypeName.content, 'Ocean', 'filter result[0] placeTypeName.content failed');
            });
        });
    });

    test('filter in', 7, function () {
        stop(2);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us',
                placeTypeName: new $data.Yahoo.types.Geo.placeTypeNameCf({ code: '1', content: 'Ocean' })
            }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us',
                placeTypeName: new $data.Yahoo.types.Geo.placeTypeNameCf({ code: '2', content: 'Sea' })
            })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.woeid in [1235, 1236, 1237]; }).toTraceString();
            equal(q.$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\nreturn ([1235,1236,1237].indexOf(o.woeid) > -1);\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.filter(function (o) { return o.woeid in [1235, 1236, 1237]; }).toArray(function (r) {
                start();
                equal(r.length, 1, 'filter result length failed');
                equal(r[0].name, 'ocean2', 'filter result[0] name failed');
                equal(r[0].placeTypeName.content, 'Sea', 'filter result[0] placeTypeName.content failed');
            });

            var paramArray = [1235, 1236, 1237];
            memoryContext.Oceans.filter(function (o) { return o.woeid in this; }, paramArray).toArray(function (r) {
                start();
                equal(r.length, 1, 'filter result length failed');
                equal(r[0].name, 'ocean2', 'filter result[0] name failed');
                equal(r[0].placeTypeName.content, 'Sea', 'filter result[0] placeTypeName.content failed');
            });
        });
    });

    test('take', 3, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1236, name: 'ocean3', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1237, name: 'ocean4', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1238, name: 'ocean5', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1239, name: 'ocean6', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.take(5).toTraceString();
            equal(q.$take, 5, 'take value failed');

            memoryContext.Oceans.take(5).toArray(function (r) {
                start();
                equal(r.length, 5, 'take result length failed');
                equal(r[0].name, 'ocean1', 'take result[0] name failed');
            });
        });
    });

    test('skip', 3, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1236, name: 'ocean3', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1237, name: 'ocean4', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1238, name: 'ocean5', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1239, name: 'ocean6', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.skip(4).toTraceString();
            equal(q.$skip, 4, 'skip value failed');

            memoryContext.Oceans.skip(4).toArray(function (r) {
                start();
                equal(r.length, 2, 'skip result length failed');
                equal(r[0].name, 'ocean5', 'skip result[0] name failed');
            });
        });
    });

    test('skip - take', 4, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1236, name: 'ocean3', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1237, name: 'ocean4', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1238, name: 'ocean5', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1239, name: 'ocean6', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.skip(2).take(1).toTraceString();
            equal(q.$skip, 2, 'skip value failed');
            equal(q.$take, 1, 'take value failed');

            memoryContext.Oceans.skip(2).take(1).toArray(function (r) {
                start();
                equal(r.length, 1, 'skip-take result length failed');
                equal(r[0].name, 'ocean3', 'skip-take result[0] name failed');
            });
        });
    });

    test('orderBy - orderByDescending', 26, function () {
        stop(4);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean3', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1237, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean4', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1237, name: 'ocean5', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1237, name: 'ocean6', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.orderBy(function (o) { return o.name; }).toTraceString();
            equal(q.$order[0].toString().replace(/[\n ]/g, '').replace('/**/', ''), 'function anonymous(o) {\nreturn o.name;\n}'.replace(/[\n ]/g, ''), 'orderBy value failed');

            memoryContext.Oceans.orderBy(function (o) { return o.name; }).toArray(function (r) {
                start();
                equal(r.length, 6, 'orderBy result length failed');
                equal(r[0].name, 'ocean1', 'orderBy result[0] name failed');
                equal(r[5].name, 'ocean6', 'orderBy result[0] name failed');
            });

            var q = memoryContext.Oceans.orderByDescending(function (o) { return o.name; }).toTraceString();
            equal(q.$order[0].toString().replace(/[\n ]/g, '').replace('/**/', ''), 'function anonymous(o) {\nreturn o.name;\n}'.replace(/[\n ]/g, ''), 'orderByDescending value failed');

            memoryContext.Oceans.orderByDescending(function (o) { return o.name; }).toArray(function (r) {
                start();
                equal(r.length, 6, 'orderBy result length failed');
                equal(r[0].name, 'ocean6', 'orderByDescending result[0] name failed');
                equal(r[5].name, 'ocean1', 'orderByDescending result[0] name failed');
            });

            var q = memoryContext.Oceans.orderBy(function (o) { return o.woeid; }).orderBy(function (o) { return o.name; }).toTraceString();
            equal(q.$order[0].toString().replace(/[\n ]/g, '').replace('/**/', ''), 'function anonymous(o) {\nreturn o.woeid;\n}'.replace(/[\n ]/g, ''), 'orderBy-orderBy value failed');
            equal(q.$order[1].toString().replace(/[\n ]/g, '').replace('/**/', ''), 'function anonymous(o) {\nreturn o.name;\n}'.replace(/[\n ]/g, ''), 'orderBy-orderBy value failed');

            memoryContext.Oceans.orderBy(function (o) { return o.woeid; }).orderBy(function (o) { return o.name; }).toArray(function (r) {
                start();
                equal(r.length, 6, 'orderBy result length failed');
                equal(r[0].name, 'ocean2', 'orderBy-orderBy result[0] name failed');
                equal(r[1].name, 'ocean3', 'orderBy-orderBy result[1] name failed');
                equal(r[2].name, 'ocean4', 'orderBy-orderBy result[2] name failed');
                equal(r[3].name, 'ocean1', 'orderBy-orderBy result[3] name failed');
                equal(r[4].name, 'ocean5', 'orderBy-orderBy result[4] name failed');
                equal(r[5].name, 'ocean6', 'orderBy-orderBy result[5] name failed');
            });

            var q = memoryContext.Oceans.orderBy(function (o) { return o.woeid; }).orderByDescending(function (o) { return o.name; }).toTraceString();
            equal(q.$order[0].toString().replace(/[\n ]/g, '').replace('/**/', ''), 'function anonymous(o) {\nreturn o.woeid;\n}'.replace(/[\n ]/g, ''), 'orderBy-orderByDescending value failed');
            equal(q.$order[1].toString().replace(/[\n ]/g, '').replace('/**/', ''), 'function anonymous(o) {\nreturn o.name;\n}'.replace(/[\n ]/g, ''), 'orderBy-orderByDescending value failed');

            memoryContext.Oceans.orderBy(function (o) { return o.woeid; }).orderByDescending(function (o) { return o.name; }).toArray(function (r) {
                start();
                equal(r.length, 6, 'orderBy result length failed');
                equal(r[0].name, 'ocean4', 'orderBy-orderByDescending result[0] name failed');
                equal(r[1].name, 'ocean3', 'orderBy-orderByDescending result[1] name failed');
                equal(r[2].name, 'ocean2', 'orderBy-orderByDescending result[2] name failed');
                equal(r[3].name, 'ocean6', 'orderBy-orderByDescending result[3] name failed');
                equal(r[4].name, 'ocean5', 'orderBy-orderByDescending result[4] name failed');
                equal(r[5].name, 'ocean1', 'orderBy-orderByDescending result[5] name failed');
            });
        });
    });

    test('map', 14, function () {
        stop(4);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.map(function (o) { return o.name; }).toTraceString();
            equal(q.$map.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\nreturn o.name;\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.map(function (o) { return o.name; }).toArray(function (r) {
                start();
                equal(r.length, 2, 'filter result length failed');
                equal(r[0], 'ocean1', 'filter result[0] name failed');
            });

            var q = memoryContext.Oceans.map(function (o) { return { n: o.name }; }).toTraceString();
            equal(q.$map.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\nreturn { n: o.name };\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.map(function (o) { return { n: o.name }; }).toArray(function (r) {
                start();
                equal(r.length, 2, 'filter result length failed');
                equal(r[0].n, 'ocean1', 'filter result[0] name failed');
            });

            var q = memoryContext.Oceans.map(function (o) { return { n: o.name, w: o.woeid }; }).toTraceString();
            equal(q.$map.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\nreturn { n: o.name, w: o.woeid };\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.map(function (o) { return { n: o.name, w: o.woeid }; }).toArray(function (r) {
                start();
                equal(r.length, 2, 'filter result length failed');
                equal(r[0].n, 'ocean1', 'filter result[0] name failed');
                equal(r[0].w, 1234, 'filter result[0] name failed');
            });

            var q = memoryContext.Oceans.map(function (o) { return { n: o.name, a: { b: { w: o.woeid}} }; }).toTraceString();
            equal(q.$map.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\nreturn { n: o.name, a: { b: { w: o.woeid } } };\n}".replace(/[\n ]/g, ''));

            memoryContext.Oceans.map(function (o) { return { n: o.name, a: { b: { w: o.woeid}} }; }).toArray(function (r) {
                start();
                equal(r.length, 2, 'filter result length failed');
                equal(r[0].n, 'ocean1', 'filter result[0] name failed');
                equal(r[0].a.b.w, 1234, 'filter result[0] name failed');
            });
        });
    });

    test('add to context', 4, function () {
        stop(1);
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory' });
        memoryContext.onReady(function () {
            memoryContext.Oceans.toArray(function (r) {
                equal(r.length, 0, 'empty context source length failed');
                var item = new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' });
                memoryContext.Oceans.add(item);
                memoryContext.Oceans.toArray(function (r) {
                    equal(r.length, 0, 'empty context source length failed');

                    memoryContext.saveChanges(function () {
                        equal(item.entityState, $data.EntityState.Unchanged, 'item.entityState failed');
                        memoryContext.Oceans.toArray(function (r) {
                            start();
                            equal(r.length, 1, 'filled context source length failed');
                        });
                    });
                });
            });
        });
    });

    test('remove from context', 4, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { "geo.oceans": items } });
        memoryContext.onReady(function () {
            memoryContext.Oceans.toArray(function (r) {
                equal(r.length, 2, 'context source length failed');
                memoryContext.Oceans.remove(items[0]);
                memoryContext.Oceans.toArray(function (r) {
                    equal(r.length, 2, 'empty context source length failed');

                    memoryContext.saveChanges(function () {
                        memoryContext.Oceans.toArray(function (r) {
                            start();
                            equal(r.length, 1, 'removed context source length failed');
                            equal(r[0].name, 'ocean2', 'item name in context failed');
                        });
                    });
                });
            });
        });
    });

    test('array toQueryable with jayData type', 3, function () {
        stop(1);
        var items = [
            new $data.Yahoo.types.Geo.ocean({ woeid: 1234, name: 'ocean1', lang: 'en-us' }),
            new $data.Yahoo.types.Geo.ocean({ woeid: 1235, name: 'ocean2', lang: 'en-us' })
        ];

        var arrayQueryable = items.toQueryable();

        equal(arrayQueryable instanceof $data.Queryable, true, 'array toQueryable failed');

        arrayQueryable.filter(function (o) { return o.name == 'ocean1' }).toArray(function (r) {
            start();
            equal(r.length, 1, 'arrayQueryable filter result length failed');
            equal(r[0].name, 'ocean1', 'arrayQueryable filter result[0] name failed');
        });
    });

    test('array toQueryable with object (not supported)', 3, function () {
        stop(1);
        var items = [
            { name: 'a1', age: 10 },
            { name: 'a2', age: 25 }
        ];
        try {
            var arrayQueryable = items.toQueryable();

            equal(arrayQueryable instanceof $data.Queryable, true, 'array toQueryable failed');

            arrayQueryable.filter(function (o) { return o.name == 'a1' }).toArray(function (r) {
                start();
                equal(r.length, 1, 'arrayQueryable filter result length failed');
                equal(r[0].name, 'ocean1', 'arrayQueryable filter result[0] name failed');
            });
        } catch (e) {
            expect(2);
            start();
            ok(true, 'Not supported');
            ok(true, e);
        }

    });


    test('orderbyDescending with take', 2, function () {
        stop(3);
        var memoryContext = new $news.Types.NewsContext({ name: 'InMemory' });
        memoryContext.onReady(function () {
            start(1);
            memoryContext.Tags.add(new $news.Types.Tag({ Title: 'a' }));
            memoryContext.Tags.add(new $news.Types.Tag({ Title: 'b' }));
            memoryContext.saveChanges(function () {
                start(1);
                memoryContext.Tags.orderByDescending("it.Title").take(1).toArray(function (result) {
                    start(1);
                    equal(result.length, 1, 'number of tags failed');
                    equal(result[0].Title, "b", 'taking descending ordered element failed');
                });
            });

        });
    });

    test('int computed field',2, function(){
        stop(3);
        var memoryContext = new $news.Types.NewsContext({name: 'InMemory'});
        memoryContext.onReady(function(){
            start(1);
            memoryContext.Tags.add(new $news.Types.Tag({Title:'Tag3'}));
            memoryContext.saveChanges(function(){
                start(1);
                memoryContext.Tags.toArray(function(result){
                    start(1);
                    equal(result.length, 1, 'number of tags failed');
                    equal(result[0].Id, 1, 'PK field failed');
                });
            });

        });
    });

    test('int computed field with init data',2, function(){
        stop(3);
        var items = [
            new $news.Types.Tag({Id:1, Title: "Tag1" }),
            new $news.Types.Tag({Id:2, Title: "Tag2" })
        ];
        var memoryContext = new $news.Types.NewsContext({name: 'InMemory', source:{Tags:items}});
        memoryContext.onReady(function(){
            start(1);
            memoryContext.Tags.add(new $news.Types.Tag({Title:'Tag3'}));
            memoryContext.saveChanges(function(){
                start(1);
                memoryContext.Tags.toArray(function(result){
                    start(1);
                    equal(result.length, 3, 'number of tags failed');
                    equal(result[2].Id, 3, 'PK field failed');
                });
            });

        });
    });

    test('int computed field with init data complex',2, function(){
        stop(3);
        var items = [
            new $news.Types.Tag({Id:1, Title: "Tag1" }),
            new $news.Types.Tag({Id:7, Title: "Tag2" }),
            new $news.Types.Tag({Id:2, Title: "Tag3" }),
            new $news.Types.Tag({Id:9, Title: "Tag4" }),
            new $news.Types.Tag({Id:3, Title: "Tag5" })
        ];
        var memoryContext = new $news.Types.NewsContext({name: 'InMemory', source:{Tags:items}});
        memoryContext.onReady(function(){
            start(1);
            memoryContext.Tags.add(new $news.Types.Tag({Title:'Tag3'}));
            memoryContext.saveChanges(function(){
                start(1);
                memoryContext.Tags.toArray(function(result){
                    start(1);
                    equal(result.length, 6, 'number of tags failed');
                    equal(result[5].Id, 10, 'PK field failed');
                });
            });

        });
    });

    test('modify data',3, function(){
        stop(3);
        var items = [
            new $news.Types.Tag({Id:1, Title: "Tag1" }),
            new $news.Types.Tag({Id:7, Title: "Tag2" }),
            new $news.Types.Tag({Id:2, Title: "Tag3" }),
            new $news.Types.Tag({Id:9, Title: "Tag4" }),
            new $news.Types.Tag({Id:3, Title: "Tag5" })
        ];
        var memoryContext = new $news.Types.NewsContext({name: 'InMemory', source:{Tags:items}});
        memoryContext.onReady(function(){
            start(1);
            var entity = new $news.Types.Tag({Id:2});
            memoryContext.Tags.attach(entity);
            entity.Title = "almafa"
            memoryContext.saveChanges(function(){
                start(1);
                memoryContext.Tags
                    .filter(function(item){return item.Id == 2;})
                    .toArray(function(result){
                        start(1);
                        equal(result.length, 1, 'number of tags failed');
                        equal(result[0].Id, 2, 'PK field value error');
                        equal(result[0].Title, 'almafa', 'Title value failed');
                });
            });

        });
    });

    test('guid computed field',4, function(){
        stop(3);
        $data.Class.define("$test.GuidItem", $data.Entity, null, {
            Id: { type: $data.Guid, key: true, computed:true },
            Title: {type:'string'}
        });
        $data.Class.define("$test.GuidContext", $data.EntityContext, null, {
            TestTable: { type: $data.EntitySet, elementType: $test.GuidItem }
        });
        var memoryContext = new $test.GuidContext({name: 'InMemory'});
        memoryContext.onReady(function(){
            start(1);
            memoryContext.TestTable.add(new $test.GuidItem({Title:'Tag3'}));
            memoryContext.saveChanges(function(){
                start(1);
                memoryContext.TestTable.toArray(function(result){
                    start(1);
                    equal(result.length, 1, 'number of tags failed');
                    notEqual(result[0].Id, undefined, 'PK field failed');
                    ok($data.parseGuid(result[0].Id) instanceof $data.Guid, 'PK field type failed');
                    ok(typeof result[0].Id, 'string', 'PK field type failed');
                });
            });

        });
    });

    test('guid computed field with init data',4, function(){
        stop(3);
        $data.Class.define("$test.GuidItem", $data.Entity, null, {
            Id: { type: $data.Guid, key: true, computed:true },
            Title: {type:'string'}
        });
        $data.Class.define("$test.GuidContext", $data.EntityContext, null, {
            TestTable: { type: $data.EntitySet, elementType: $test.GuidItem }
        });
        var items = [
            new $test.GuidItem({Id:$data.Guid.NewGuid(), Title: "Tag1" }),
            new $test.GuidItem({Id:$data.Guid.NewGuid(), Title: "Tag2" })
        ];
        var memoryContext = new $test.GuidContext({name: 'InMemory', source:{TestTable:items}});
        memoryContext.onReady(function(){
            start(1);
            memoryContext.TestTable.add(new $test.GuidItem({Title:'Tag3'}));
            memoryContext.saveChanges(function(){
                start(1);
                memoryContext.TestTable.toArray(function(result){
                    start(1);
                    equal(result.length, 3, 'number of tags failed');
                    notEqual(result[2].Id, undefined, 'PK field failed');
                    ok($data.parseGuid(result[2].Id) instanceof $data.Guid, 'PK field type failed');
                    ok(typeof result[2].Id, 'string', 'PK field type failed');
                });
            });

        });
    });

    test('persist local store',2, function(){
        stop(4);
        window.localStorage.removeItem("JayData_InMemory_Provider");
        var memoryContext = new $news.Types.NewsContext({name: 'LocalStore'});
        memoryContext.onReady(function(){
            start(1);
            memoryContext.Tags.add(new $news.Types.Tag({Title:'Tag3'}));
            memoryContext.saveChanges(function(){
                start(1);
                var memoryContext2 = new $news.Types.NewsContext({name: 'LocalStore'});
                memoryContext2.onReady(function(){
                    start(1);
                    memoryContext2.Tags.toArray(function(result){
                        start(1);
                        equal(result.length, 1, 'number of tags failed');
                        equal(result[0].Id, 1, 'PK field failed');
                    });
                });
            });

        });
    });

    test('filter not operator', 5, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Categories.filter(function (c) { return !(c.Title == 'Sport'); }).toArray(function (res) {
                    equal(res.length, 4, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Category, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - contains', 7, function () {
        stop(2);
        
        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Title.contains('ticle2'); }).toArray(function (res) {
                    equal(res.length, 6, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - startsWith', 7, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Title.startsWith('Article2'); }).toArray(function (res) {
                    equal(res.length, 6, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - endsWith', 6, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Title.endsWith('1'); }).toArray(function (res) {
                    equal(res.length, 5, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - length', 6, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Title.length() == 8 }).toArray(function (res) {
                    equal(res.length, 5, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - substr', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Title.substr(2) == "ticle21" }).toArray(function (res) {
                    equal(res.length, 1, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - substr 2 param', 7, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Title.substr(2, 6) == "ticle2" }).toArray(function (res) {
                    equal(res.length, 6, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - toLowerCase', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Title.toLowerCase() == "article1" }).toArray(function (res) {
                    equal(res.length, 1, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - toUpperCase', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Title.toUpperCase() == "ARTICLE1" }).toArray(function (res) {
                    equal(res.length, 1, 'result length failed');

                    for (var i = 0; i < res.length; i++) {
                        ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                    }

                    start(1);
                });
            });
        });
    });

    test('filter field operation - trim', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.add({ Title: '  hello world   ', Lead: 'lead' });
                db.saveChanges(function () { 
                    db.Articles.filter(function (a) { return a.Title.trim() == "hello world" }).toArray(function (res) {
                        equal(res.length, 1, 'result length failed');

                        for (var i = 0; i < res.length; i++) {
                            ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                        }

                        start(1);
                    });
                });
            });
        });
    });

    test('filter field operation - ltrim', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.add({ Title: '  hello world   ', Lead: 'lead' });
                db.saveChanges(function () {
                    db.Articles.filter(function (a) { return a.Title.ltrim() == "hello world   " }).toArray(function (res) {
                        equal(res.length, 1, 'result length failed');

                        for (var i = 0; i < res.length; i++) {
                            ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                        }

                        start(1);
                    });
                });
            });
        });
    });

    test('filter field operation - rtrim', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.add({ Title: '  hello world   ', Lead: 'lead' });
                db.saveChanges(function () {
                    db.Articles.filter(function (a) { return a.Title.rtrim() == "  hello world" }).toArray(function (res) {
                        equal(res.length, 1, 'result length failed');

                        for (var i = 0; i < res.length; i++) {
                            ok(res[0] instanceof $news.Types.Article, 'item ' + i + ' type failed');
                        }

                        start(1);
                    });
                });
            });
        });
    });

    test('map field operation', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({ name: 'InMemory' })).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {

                var title = '  hello world   ';
                db.Articles.add({ Title: title, Lead: 'lead' });
                db.saveChanges(function () {
                    db.Articles.filter(function (a) { return a.Title == "  hello world   " })
                        .map(function (a) {
                            return {
                                contains: a.Title.contains('hello'),
                                contains2: a.Title.contains('hello2'),
                                notcontains: !a.Title.contains('hello'),
                                startsWith: a.Title.startsWith('  hello'),
                                startsWith2: a.Title.startsWith('hello'),
                                endsWith: a.Title.endsWith('world   '),
                                length: a.Title.length(),
                                substr: a.Title.substr(2),
                                substr2: a.Title.substr(2,3),
                                toLowerCase: a.Title.toLowerCase(),
                                toUpperCase: a.Title.toUpperCase(),
                                trim: a.Title.trim(),
                                ltrim: a.Title.ltrim(),
                                rtrim: a.Title.rtrim()
                            };
                        })
                        .toArray(function (res) {
                        equal(res.length, 1, 'result length failed');

                        deepEqual(res[0], {
                            contains: $data.StringFunctions.contains(title, 'hello'),
                            contains2: $data.StringFunctions.contains(title, 'hello2'),
                            notcontains: !$data.StringFunctions.contains(title, 'hello'),
                            startsWith: $data.StringFunctions.startsWith(title, '  hello'),
                            startsWith2: $data.StringFunctions.startsWith(title, 'hello'),
                            endsWith: $data.StringFunctions.endsWith(title, 'world   '),
                            length: title.length,
                            substr: title.substr(2),
                            substr2: title.substr(2, 3),
                            toLowerCase: title.toLowerCase(),
                            toUpperCase: title.toUpperCase(),
                            trim: title.trim(),
                            ltrim: title.trimLeft(),
                            rtrim: title.trimRight()
                        });

                        start(1);
                    });
                });
            });
        });
    });

    $data.Entity.extend('$example.FilterTypeTest', {
        Id: { type: 'int', key: true, computed: true },
        Name: { type: 'string' },
        propDate: { type: 'date' },
        propBool: { type: 'bool' },
        propNum: { type: 'number' },
        propInt: { type: 'int' },
        propGuid: { type: 'guid' }
    });

    $data.EntityContext.extend('$example.FilterTypeContext', {
        Entities: { type: $data.EntitySet, elementType: $example.FilterTypeTest }
    });

    test('filter types', 18, function () {
        stop(1);

        var memoryContext = new $example.FilterTypeContext({ name: 'InMemory' });
        memoryContext.onReady(function () {

            var item = new $example.FilterTypeTest({
                Name: 'name',
                propDate: new Date('2000/01/01'),
                propBool: true,
                propNum: 3.14,
                propInt: 42,
                propGuid: new $data.Guid('c1736305-189b-436c-ac2d-09a76eb9de1b')
            });
            memoryContext.Entities.add(item);
            var item2 = new $example.FilterTypeTest({
                Name: 'name2',
                propDate: new Date('2013/01/01'),
                propBool: false,
                propNum: 4.14,
                propInt: 56,
                propGuid: new $data.Guid('c9abb6a2-5b8c-45d8-8bb0-5d88e9dbf1a2')
            });
            memoryContext.Entities.add(item2);

            memoryContext.saveChanges(function () {


                //string
                var q = memoryContext.Entities.filter(function (o) { return o.Name == 'name'; });
                equal(q.toTraceString().$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\n return (o.Name == 'name');\n}".replace(/[\n ]/g, ''));

                stop();
                q.toArray(function (r) {
                    start();
                    equal(r.length, 1, 'filter string result length failed');
                    equal(r[0].Name, 'name', 'filter string result[0] name failed');
                });

                //date
                var q = memoryContext.Entities.filter(function (o) { return o.propDate < this.date; }, { date: new Date('2005/01/01') });
                equal(q.toTraceString().$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), ("function anonymous(o) {\n return (o.propDate < new Date(Date.parse('" + (new Date('2005/01/01')).toISOString() + "')));\n}").replace(/[\n ]/g, ''));

                stop();
                q.toArray(function (r) {
                    start();
                    equal(r.length, 1, 'filter date result length failed');
                    equal(r[0].Name, 'name', 'filter date result[0] name failed');
                });

                //bool
                var q = memoryContext.Entities.filter(function (o) { return o.propBool == false; });
                equal(q.toTraceString().$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\n return (o.propBool == false);\n}".replace(/[\n ]/g, ''));

                stop();
                q.toArray(function (r) {
                    start();
                    equal(r.length, 1, 'filter bool result length failed');
                    equal(r[0].Name, 'name2', 'filter bool result[0] name failed');
                });

                //number
                var q = memoryContext.Entities.filter(function (o) { return o.propNum < 4.1; });
                equal(q.toTraceString().$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\n return (o.propNum < 4.1);\n}".replace(/[\n ]/g, ''));

                stop();
                q.toArray(function (r) {
                    start();
                    equal(r.length, 1, 'filter number result length failed');
                    equal(r[0].Name, 'name', 'filter number result[0] name failed');
                });

                //int
                var q = memoryContext.Entities.filter(function (o) { return o.propInt > 50; });
                equal(q.toTraceString().$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\n return (o.propInt > 50);\n}".replace(/[\n ]/g, ''));

                stop();
                q.toArray(function (r) {
                    start();
                    equal(r.length, 1, 'filter number result length failed');
                    equal(r[0].Name, 'name2', 'filter number result[0] name failed');
                });

                //guid
                var q = memoryContext.Entities.filter(function (o) { return o.propGuid == this.guid; }, { guid: new $data.Guid('c9abb6a2-5b8c-45d8-8bb0-5d88e9dbf1a2') });
                equal(q.toTraceString().$filter.toString().replace(/[\n ]/g, '').replace('/**/', ''), "function anonymous(o) {\n return (o.propGuid == 'c9abb6a2-5b8c-45d8-8bb0-5d88e9dbf1a2');\n}".replace(/[\n ]/g, ''));

                stop();
                q.toArray(function (r) {
                    start();
                    equal(r.length, 1, 'filter number result length failed');
                    equal(r[0].Name, 'name2', 'filter number result[0] name failed');
                });

                start();
            });
        });
    });
});
