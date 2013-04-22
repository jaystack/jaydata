
$data.Entity.extend('TestItemType', {
    'Id': { 'key': true, 'type': 'Edm.Int32', 'nullable': false, 'computed': true },
    'b0': { 'type': 'Edm.Boolean' },
    'b1': { 'type': 'Edm.Byte' },
    'd0': { 'type': 'Edm.DateTime' },
    'de0': { 'type': 'Edm.Decimal', 'nullable': false, 'required': true },
    'n0': { 'type': 'Edm.Double' },
    'si0': { 'type': 'Edm.Single' },
    'g0': { 'type': 'Edm.Guid' },
    'i16': { 'type': 'Edm.Int16' },
    'i0': { 'type': 'Edm.Int32' },
    'i64': { 'type': 'Edm.Int64' },
    's0': { 'type': 'Edm.String', 'maxLength': 4000 },
    //'blob': { 'type': 'Edm.Binary' },
    //'blob': { 'type': 'Array', 'elementType': 'Edm.Byte' },
    //'dto': { 'type': 'Edm.DateTimeOffset' },
    //'timeprop': { 'type': 'Edm.Time' },
    //'sb0': { 'type': 'Edm.SByte' }
});

$data.EntityContext.extend('TestNewsReaderContext', {
    'TestItemTypes': { type: $data.EntitySet, elementType: TestItemType },
});


function TypeTests(providerConfig, msg) {
    msg = msg || '';
    module("TypeTests_" + msg);



    function _getContext() {
        stop();
        var pConf = JSON.parse(JSON.stringify(providerConfig));
        return new TestNewsReaderContext(pConf).onReady().fail(function(err){
            console.log(err);
            start();
        });
    }

    function _getCleanContext() {
        return _getContext()
            .then(function (context) {
                return context.TestItemTypes.toArray()
                    .then(function (items) {
                        if (context.storageProvider.providerConfiguration.noBatch) {
                            var promises = [];
                            items.forEach(function (item) {
                                promises.push(item.remove(context.storeToken));
                            });

                            return $.when.apply($, promises);
                        } else {
                            items.forEach(function (item) {
                                context.remove(item);
                            });

                            return context.saveChanges()
                        }
                    }).then(function () {
                        return context;
                    });;
            }).fail(function(err){
                console.log(err);
                start();
            });
    }

    function _getDataContext(num, counter) {
        num = num || 1;
        if (!counter) counter = 0;
        var context;
        return _getCleanContext()
            .then(function (_context) {
                context = _context;
                var promises = [];

                for (var i = 0; i < num; i++) {
                    
                    var item = new TestItemType({
                        'b0': counter % 2 ? false : true,
                        'b1': 8 + (counter * 2),
                        'd0': new Date(2000 + counter, 0, 1),
                        'de0': '1353456' + counter + '.00',
                        'n0': 1356 * counter,
                        'si0': 3.14 * counter,
                        'g0': $data.createGuid().toString().toLowerCase(),
                        'i16': counter * 8,
                        'i0': counter * 16,
                        'i64': '13546846213' + counter,
                        's0': 'helloWorld' + counter,
                        'blob': [1, 2, 3, 4, i],
                        'dto': new Date(2100 + counter, 0, 1),
                        'timeprop': new Date(0, 0, 0, 15, 15 + counter, 05),
                        'sb0': 8 + (counter * 2)
                    });

                    if (context.storageProvider.providerConfiguration.noBatch) {
                        promises.push(item.save(context.storeToken));
                    } else {
                        context.TestItemTypes.add(item);
                    }
                    counter++;
                }

                if (context.storageProvider.providerConfiguration.noBatch) {
                    return $.when.apply($, promises);
                } else {
                    return context.saveChanges();
                }
            })
            .then(function () {
                return context;
            });
    }

    function _finishCb(context) {
        if (context.storageProvider.db && context.storageProvider.db.close)
            context.storageProvider.db.close();

        start();
    }


    test('FirstTest - CreateContext', 1, function () {
        _getContext().then(function (context) {
            ok(context.storageProvider instanceof $data.StorageProviderBase, 'context created');
            _finishCb(context);
        });
    });

    test('save Entity', 11, function () {
        _getCleanContext().then(function (context) {

            var refDate = new Date();
            var refGuid = $data.createGuid().toString().toLowerCase()
            var item = new TestItemType({
                //'blob': [1, 2, 3, 4, 500],
                'b0': false,
                'b1': 230,
                'd0': refDate,
                'de0': '1353456.00',
                'n0': 1356,
                'si0': 1235.1534423828125,
                'g0': refGuid,
                'i16': 351,
                'i0': 13534,
                'i64': '13546846213',
                's0': 'helloWorld'
            });
            context.TestItemTypes.add(item);

            context.saveChanges({
                success: function () {

                    context.TestItemTypes.toArray(function (items) {
                        
                        equal(items[0].b0, false, 'b0');
                        equal(items[0].b1, 230, 'b1');
                        ok(Math.abs(items[0].d0.valueOf() - refDate.valueOf()) < 100, 'd0');
                        equal(items[0].de0, items[0].de0.indexOf('.00') > 0 ? '1353456.00' : '1353456', 'de0');
                        equal(items[0].n0, 1356, 'n0');
                        equal(items[0].si0, 1235.1534423828125, 'si0');
                        equal(items[0].g0, refGuid, 'g0');
                        equal(items[0].i16, 351, 'i16');
                        equal(items[0].i0, 13534, 'i0');
                        equal(items[0].i64, '13546846213', 'i64');
                        equal(items[0].s0, 'helloWorld', 's0');

                        _finishCb(context);
                    });
                },
                error: function () {
                    ok(false, 'save error');
                    _finishCb(context);
                }
            });
        });
    });

    test('update Entity', 22, function () {
        _getCleanContext().then(function (context) {

            var refDate = new Date();
            var refGuid = $data.createGuid().toString().toLowerCase()
            var item = new TestItemType({
                //'blob': [1, 2, 3, 4, 500],
                'b0': false,
                'b1': 230,
                'd0': refDate,
                'de0': '1353456.00',
                'n0': 1356,
                'si0': 1235.1534423828125,
                'g0': refGuid,
                'i16': 351,
                'i0': 13534,
                'i64': '13546846213',
                's0': 'helloWorld'
            });
            context.TestItemTypes.add(item);

            context.saveChanges({
                success: function () {

                    context.TestItemTypes.toArray(function (items) {

                        equal(items[0].b0, false, 'b0');
                        equal(items[0].b1, 230, 'b1');
                        ok(Math.abs(items[0].d0.valueOf() - refDate.valueOf()) < 100, 'd0');
                        equal(items[0].de0, items[0].de0.indexOf('.00') > 0 ? '1353456.00' : '1353456', 'de0');
                        equal(items[0].n0, 1356, 'n0');
                        equal(items[0].si0, 1235.1534423828125, 'si0');
                        equal(items[0].g0, refGuid, 'g0');
                        equal(items[0].i16, 351, 'i16');
                        equal(items[0].i0, 13534, 'i0');
                        equal(items[0].i64, '13546846213', 'i64');
                        equal(items[0].s0, 'helloWorld', 's0');


                        var item2 = items[0];
                        context.attach(item2);

                        var refDate2 = new Date();
                        var refGuid2 = $data.createGuid().toString().toLowerCase()

                        item2.b0 = true,
                        item2.b1 = 250,
                        item2.d0 = refDate2,
                        item2.de0 = '1353459.00',
                        item2.n0 = 13567,
                        item2.si0 = 2235.1533203125,
                        item2.g0 = refGuid2,
                        item2.i16 = 2351,
                        item2.i0 = 135340,
                        item2.i64 = '1354684621379',
                        item2.s0 = 'helloWorld2'

                        context.saveChanges(function () {
                            context.TestItemTypes.toArray(function (items2) {

                                equal(items2[0].b0, true, 'b0 - update');
                                equal(items2[0].b1, 250, 'b1 - update');
                                ok(Math.abs(items2[0].d0.valueOf() - refDate2.valueOf()) < 100, 'd0 - update');
                                equal(items2[0].de0, items2[0].de0.indexOf('.00') > 0 ? '1353459.00' : '1353459', 'de0 - update');
                                equal(items2[0].n0, 13567, 'n0 - update');
                                equal(items2[0].si0, 2235.1533203125, 'si0 - update');
                                equal(items2[0].g0, refGuid2, 'g0 - update');
                                equal(items2[0].i16, 2351, 'i16 - update');
                                equal(items2[0].i0, 135340, 'i0 - update');
                                equal(items2[0].i64, '1354684621379', 'i64 - update');
                                equal(items2[0].s0, 'helloWorld2', 's0 - update');



                                _finishCb(context);
                            });
                        });
                    });
                },
                error: function () {
                    ok(false, 'save error');
                    _finishCb(context);
                }
            });
        });
    });

    test('count', 1, function () {
        if (providerConfig.noCount) { ok(true, "Not supported"); return; }

        _getDataContext(10).then(function (context) {
            context.TestItemTypes.length(function (cnt) {
                equal(cnt, 10, 'data length');

                _finishCb(context);
            }).fail($data.debug);
            
        });
    });

    test('filter boolean', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(itemNumber)
            .then(function (context) {
                context.TestItemTypes.filter('it.b0 == true').toArray(function (item) {
                    var count = item.length;
                    for (var i = 0; i < item.length; i++) {
                        equal(item[i].b0, true, 'value');
                    }

                    context.TestItemTypes.filter('it.b0 != true').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            equal(oItem[i].b0, false, 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter byte', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.b1 == 10').toArray(function (item) {
                    var count = item.length;
                    equal(item[0].b1, 10, 'value');

                    context.TestItemTypes.filter('it.b1 != 10').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].b1, 10, 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter date', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.d0 < "2000/05/04"').toArray(function (item) {
                    var count = item.length;
                    equal(item[0].d0.valueOf(), new Date(2000, 0, 1).valueOf(), 'value');

                    context.TestItemTypes.filter('it.d0 > "2000/05/04"').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].d0.valueOf(), new Date(2000, 0, 1).valueOf(), 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter decimal', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.de0 == "13534560.00"').toArray(function (item) {
                    var count = item.length;
                    if(count > 0)
                        equal(item[0].de0, item[0].de0.indexOf('.00') > 0 ? "13534560.00" : "13534560", 'value');

                    context.TestItemTypes.filter('it.de0 != "13534560.00"').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].de0, oItem[i].de0.indexOf('.00') > 0 ? "13534560.00" : "13534560", 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter double', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.n0 == 1356').toArray(function (item) {
                    var count = item.length;
                    equal(item[0].n0, 1356, 'value');

                    context.TestItemTypes.filter('it.n0 != 1356').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].n0, 1356, 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter single', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.si0 == 3.140000104904175').toArray(function (item) {
                    var count = item.length;
                    equal(item[0].si0, 3.140000104904175, 'value');

                    context.TestItemTypes.filter('it.si0 != 3.140000104904175').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].si0, 3.140000104904175, 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter guid', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.first().then(function (item) {
                    var guidRef = item.g0;
                    context.TestItemTypes.filter('it.g0 == "' + guidRef + '"').toArray(function (item) {
                        var count = item.length;
                        equal(item[0].g0, guidRef, 'value');

                        context.TestItemTypes.filter('it.g0 != "' + guidRef + '"').toArray(function (oItem) {
                            for (var i = 0; i < oItem.length; i++) {
                                notEqual(oItem[i].g0, guidRef, 'opposite value');
                            }
                            equal(count + oItem.length, itemNumber, 'data length');

                            _finishCb(context);

                        });
                    });
                });
            });
    });

    test('filter Int16', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.i16 == 8').toArray(function (item) {
                    var count = item.length;
                    equal(item[0].i16, 8, 'value');

                    context.TestItemTypes.filter('it.i16 != 8').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].i16, 8, 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter Int32', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.i0 == 16').toArray(function (item) {
                    var count = item.length;
                    equal(item[0].i0, 16, 'value');

                    context.TestItemTypes.filter('it.i0 != 16').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].i0, 16, 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter Int64', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.i64 == 135468462131').toArray(function (item) {
                    var count = item.length;
                    equal(item[0].i64, '135468462131', 'value');

                    context.TestItemTypes.filter('it.i64 != 135468462131').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].i64, '135468462131', 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    test('filter string', function () {
        var itemNumber = 4;
        expect(1 + itemNumber);

        _getDataContext(4)
            .then(function (context) {
                context.TestItemTypes.filter('it.s0 == "helloWorld1"').toArray(function (item) {
                    var count = item.length;
                    equal(item[0].s0, "helloWorld1", 'value');

                    context.TestItemTypes.filter('it.s0 != "helloWorld1"').toArray(function (oItem) {
                        for (var i = 0; i < oItem.length; i++) {
                            notEqual(oItem[i].s0, "helloWorld1", 'opposite value');
                        }
                        equal(count + oItem.length, itemNumber, 'data length');

                        _finishCb(context);

                    });
                });
            });
    });

    
}

