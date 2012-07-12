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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
            var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.name == 'ocean1'; }).toTraceString();
            equal(q.$filter.toString(), "function anonymous(o) {\nreturn (o.name == 'ocean1');\n}");

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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.name == 'ocean2' && o.woeid == 1235; }).toTraceString();
            equal(q.$filter.toString(), "function anonymous(o) {\nreturn ((o.name == 'ocean2') && (o.woeid == 1235));\n}");

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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.placeTypeName.code == '1'; }).toTraceString();
            equal(q.$filter.toString(), "function anonymous(o) {\nreturn (o.placeTypeName.code == '1');\n}");

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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.filter(function (o) { return o.woeid in [1235, 1236, 1237]; }).toTraceString();
            equal(q.$filter.toString(), "function anonymous(o) {\nreturn ([1235,1236,1237].indexOf(o.woeid) > -1);\n}");

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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.orderBy(function (o) { return o.name; }).toTraceString();
            equal(q.$order[0].toString(), 'function anonymous(o) {\nreturn o.name;\n}', 'orderBy value failed');

            memoryContext.Oceans.orderBy(function (o) { return o.name; }).toArray(function (r) {
                start();
                equal(r.length, 6, 'orderBy result length failed');
                equal(r[0].name, 'ocean1', 'orderBy result[0] name failed');
                equal(r[5].name, 'ocean6', 'orderBy result[0] name failed');
            });

            var q = memoryContext.Oceans.orderByDescending(function (o) { return o.name; }).toTraceString();
            equal(q.$order[0].toString(), 'function anonymous(o) {\nreturn o.name;\n}', 'orderByDescending value failed');

            memoryContext.Oceans.orderByDescending(function (o) { return o.name; }).toArray(function (r) {
                start();
                equal(r.length, 6, 'orderBy result length failed');
                equal(r[0].name, 'ocean6', 'orderByDescending result[0] name failed');
                equal(r[5].name, 'ocean1', 'orderByDescending result[0] name failed');
            });

            var q = memoryContext.Oceans.orderBy(function (o) { return o.woeid; }).orderBy(function (o) { return o.name; }).toTraceString();
            equal(q.$order[0].toString(), 'function anonymous(o) {\nreturn o.woeid;\n}', 'orderBy-orderBy value failed');
            equal(q.$order[1].toString(), 'function anonymous(o) {\nreturn o.name;\n}', 'orderBy-orderBy value failed');

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
            equal(q.$order[0].toString(), 'function anonymous(o) {\nreturn o.woeid;\n}', 'orderBy-orderByDescending value failed');
            equal(q.$order[1].toString(), 'function anonymous(o) {\nreturn o.name;\n}', 'orderBy-orderByDescending value failed');

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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
        memoryContext.onReady(function () {
            var q = memoryContext.Oceans.map(function (o) { return o.name; }).toTraceString();
            equal(q.$map.toString(), "function anonymous(o) {\nreturn o.name;\n}");

            memoryContext.Oceans.map(function (o) { return o.name; }).toArray(function (r) {
                start();
                equal(r.length, 2, 'filter result length failed');
                equal(r[0], 'ocean1', 'filter result[0] name failed');
            });

            var q = memoryContext.Oceans.map(function (o) { return { n: o.name }; }).toTraceString();
            equal(q.$map.toString(), "function anonymous(o) {\nreturn { n: o.name };\n}");

            memoryContext.Oceans.map(function (o) { return { n: o.name }; }).toArray(function (r) {
                start();
                equal(r.length, 2, 'filter result length failed');
                equal(r[0].n, 'ocean1', 'filter result[0] name failed');
            });

            var q = memoryContext.Oceans.map(function (o) { return { n: o.name, w: o.woeid }; }).toTraceString();
            equal(q.$map.toString(), "function anonymous(o) {\nreturn { n: o.name, w: o.woeid };\n}");

            memoryContext.Oceans.map(function (o) { return { n: o.name, w: o.woeid }; }).toArray(function (r) {
                start();
                equal(r.length, 2, 'filter result length failed');
                equal(r[0].n, 'ocean1', 'filter result[0] name failed');
                equal(r[0].w, 1234, 'filter result[0] name failed');
            });

            var q = memoryContext.Oceans.map(function (o) { return { n: o.name, a: { b: { w: o.woeid}} }; }).toTraceString();
            equal(q.$map.toString(), "function anonymous(o) {\nreturn { n: o.name, a: { b: { w: o.woeid } } };\n}");

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
        var memoryContext = new $data.Yahoo.YQLContext({ name: 'InMemory', source: { Oceans: items} });
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
    
});