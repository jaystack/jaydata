function T4_CrossProviderTests() {

    //oData
    ComplexTypeTests({ name: 'oData', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'oData');
    LiveArrayTests({ name: 'oData', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'oData');

    //sqLite/WebSql
    if ($data.StorageProviderLoader.isSupported('sqLite')) {
        ComplexTypeTests({ name: 'sqLite', databaseName: 'ComplexTypeTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'sqLite');
        LiveArrayTests({ name: 'sqLite', databaseName: 'LiveArrayTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'sqLite');
        if ($data.storageProviders.sqLitePro)
            EntityContextOnUpdateTests({ name: 'sqLite', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'sqLite');
    }

    //indexedDb
    if ($data.StorageProviderLoader.isSupported('indexedDb')) {
        ComplexTypeTests({ name: 'indexedDb', databaseName: 'ComplexTypeTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'indexedDb');
        LiveArrayTests({ name: 'indexedDb', databaseName: 'LiveArrayTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'indexedDb');
        if ($data.storageProviders.indexedDbPro)
            EntityContextOnUpdateTests({ name: 'indexedDb', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'indexedDb');
    }

    //InMemory
    ComplexTypeTests({ name: 'InMemory', databaseName: 'ComplexTypeTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'InMemory');
    LiveArrayTests({ name: 'InMemory', databaseName: 'LiveArrayTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'InMemory');

    //LocalStore
    ComplexTypeTests({ name: 'LocalStore', databaseName: 'ComplexTypeTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'LocalStore');
    LiveArrayTests({ name: 'LocalStore', databaseName: 'LiveArrayTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'LocalStore');
}

function _finishCb(context) {
    if (context.storageProvider.db && context.storageProvider.db.close)
        context.storageProvider.db.close();

    start();
}

ComplexTypeTests = function ComplexTypeTests(providerConfig, msg) {
    if (typeof module == 'function') module("ComplexTypeTests_" + (msg || ''));

    test("Save and load complex values", 5*7+1, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.UserProfiles.add(new $news.Types.UserProfile({
                    FullName: 'FullName_' + i,
                    Birthday: new Date(),
                    Location: new $news.Types.Location({
                        Address: 'Address' + i,
                        Zip: 1000 * (i + 1),
                        Country: 'Country' + i,
                        City: 'City' + i
                    }),
                    User: new $news.Types.User({ Email: 'email', LoginName: 'login' + i })
                }));
            }

            context.saveChanges(function () {
                context.UserProfiles.toArray(function (res) {
                    equal(res.length, 5, 'result count');

                    for (var i = 0; i < 5; i++) {
                        equal(res[i] instanceof $news.Types.UserProfile, true, 'item is UserProfile');
                        equal(res[i].FullName, 'FullName_' + i, 'item[i].FullName is string');

                        equal(res[i].Location instanceof $news.Types.Location, true, 'item is UserProfile');
                        equal(res[i].Location.Address, 'Address' + i, 'item[i].Location.Address is string');
                        equal(res[i].Location.Zip, 1000 * (i + 1), 'item[i].Location.Zip is string');
                        equal(res[i].Location.Country, 'Country' + i, 'item[i].Location.Country is string');
                        equal(res[i].Location.City, 'City' + i, 'item[i].Location.City is string');
                    }

                    _finishCb(context);
                });
            });
        });

    });

    test("Map complex values", 5 * 7 + 1, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.UserProfiles.add(new $news.Types.UserProfile({
                    FullName: 'FullName_' + i,
                    Birthday: new Date(),
                    Location: new $news.Types.Location({
                        Address: 'Address' + i,
                        Zip: 1000 * (i + 1),
                        Country: 'Country' + i,
                        City: 'City' + i
                    }),
                    User: new $news.Types.User({ Email: 'email', LoginName: 'login' + i })
                }));
            }

            context.saveChanges(function () {
                context.UserProfiles.map(function (it) { return { Location: it.Location } }).toArray(function (res) {
                    equal(res.length, 5, 'result count');

                    for (var i = 0; i < 5; i++) {
                        equal(res[i] instanceof $news.Types.UserProfile, false, 'item is UserProfile');
                        ok(res[i].FullName === undefined, 'item[i].FullName is string');

                        equal(res[i].Location instanceof $news.Types.Location, true, 'item is UserProfile');
                        equal(res[i].Location.Address, 'Address' + i, 'item[i].Location.Address is string');
                        equal(res[i].Location.Zip, 1000 * (i + 1), 'item[i].Location.Zip is string');
                        equal(res[i].Location.Country, 'Country' + i, 'item[i].Location.Country is string');
                        equal(res[i].Location.City, 'City' + i, 'item[i].Location.City is string');
                    }

                    _finishCb(context);
                });
            });
        });

    });

    test("filter Complex value", 5 * 7 + 1, function () {
        if (typeof $data.storageProviders.IndexedDBPro !== undefined && msg === 'indexedDb') { expect(1); ok(true, 'not supported'); return; }

        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.UserProfiles.add(new $news.Types.UserProfile({
                    FullName: 'FullName_' + i,
                    Birthday: new Date(),
                    Location: new $news.Types.Location({
                        Address: 'Address' + i,
                        Zip: 1000 * (i + 1),
                        Country: 'Country' + i,
                        City: 'City' + i
                    }),
                    User: new $news.Types.User({ Email: 'email', LoginName: 'login' + i })
                }));
            }

            context.saveChanges(function () {
                context.UserProfiles.filter(function (it) { return it.Location.Address.contains('Address') }).toArray(function (res) {
                    equal(res.length, 5, 'result count');

                    for (var i = 0; i < 5; i++) {
                        equal(res[i] instanceof $news.Types.UserProfile, true, 'item is UserProfile');
                        equal(res[i].FullName, 'FullName_' + i, 'item[i].FullName is string');

                        equal(res[i].Location instanceof $news.Types.Location, true, 'item is UserProfile');
                        equal(res[i].Location.Address, 'Address' + i, 'item[i].Location.Address is string');
                        equal(res[i].Location.Zip, 1000 * (i + 1), 'item[i].Location.Zip is string');
                        equal(res[i].Location.Country, 'Country' + i, 'item[i].Location.Country is string');
                        equal(res[i].Location.City, 'City' + i, 'item[i].Location.City is string');
                    }

                    _finishCb(context);
                });
            });
        });

    });

    test("filter Complex value 2", 5 * 7 + 1, function () {
        if (typeof $data.storageProviders.IndexedDBPro !== undefined && msg === 'indexedDb') { expect(1); ok(true, 'not supported'); return; }

        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.UserProfiles.add(new $news.Types.UserProfile({
                    FullName: 'FullName_' + i,
                    Birthday: new Date(),
                    Location: new $news.Types.Location({
                        Address: 'Address' + i,
                        Zip: 1000 * (i + 1),
                        Country: 'Country' + i,
                        City: 'City' + i
                    }),
                    User: new $news.Types.User({ Email: 'email', LoginName: 'login' + i })
                }));
            }

            context.saveChanges(function () {
                context.UserProfiles.filter(function (it) { return it.Location.Address.contains('Address') && it.Location.Zip < 9999 }).toArray(function (res) {
                    equal(res.length, 5, 'result count');

                    for (var i = 0; i < 5; i++) {
                        equal(res[i] instanceof $news.Types.UserProfile, true, 'item is UserProfile');
                        equal(res[i].FullName, 'FullName_' + i, 'item[i].FullName is string');

                        equal(res[i].Location instanceof $news.Types.Location, true, 'item is UserProfile');
                        equal(res[i].Location.Address, 'Address' + i, 'item[i].Location.Address is string');
                        equal(res[i].Location.Zip, 1000 * (i + 1), 'item[i].Location.Zip is string');
                        equal(res[i].Location.Country, 'Country' + i, 'item[i].Location.Country is string');
                        equal(res[i].Location.City, 'City' + i, 'item[i].Location.City is string');
                    }

                    _finishCb(context);
                });
            });
        });

    });

    test("filter string values", 5 * 7 + 1, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.UserProfiles.add(new $news.Types.UserProfile({
                    FullName: 'FullName_' + i,
                    Birthday: new Date(),
                    Location: new $news.Types.Location({
                        Address: 'Address' + i,
                        Zip: 1000 * (i + 1),
                        Country: 'Country' + i,
                        City: 'City' + i
                    }),
                    User: new $news.Types.User({ Email: 'email', LoginName: 'login' + i })
                }));
            }

            context.saveChanges(function () {
                context.UserProfiles.filter(function (it) { return it.FullName.contains('Full') == true }).toArray(function (res) {
                    equal(res.length, 5, 'result count');

                    for (var i = 0; i < 5; i++) {
                        equal(res[i] instanceof $news.Types.UserProfile, true, 'item is UserProfile');
                        equal(res[i].FullName, 'FullName_' + i, 'item[i].FullName is string');

                        equal(res[i].Location instanceof $news.Types.Location, true, 'item is UserProfile');
                        equal(res[i].Location.Address, 'Address' + i, 'item[i].Location.Address is string');
                        equal(res[i].Location.Zip, 1000 * (i + 1), 'item[i].Location.Zip is string');
                        equal(res[i].Location.Country, 'Country' + i, 'item[i].Location.Country is string');
                        equal(res[i].Location.City, 'City' + i, 'item[i].Location.City is string');
                    }

                    _finishCb(context);
                });
            });
        });

    });

    test("orderby with null field Value", 5 * 2 + 1, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.Categories.add(new $news.Types.Category({
                    Title: i < 3 ? null : 'Title_' + i,
                }));
            }

            context.saveChanges(function () {
                context.Categories.orderBy('it.Title').toArray(function (res) {
                    equal(res.length, 5, 'result count');

                    for (var i = 0; i < res.length; i++) {
                        equal(res[i] instanceof $news.Types.Category, true, 'item is Category');
                        if (i < 3) {
                            equal(res[i].Title, null, 'item[i].Title is string');
                        } else {
                            equal(res[i].Title, 'Title_' + i, 'item[i].Title is string');
                        }
                    }

                    _finishCb(context);
                });
            });
        });

    });

    test("orderbyDesc with null field Value", 5 * 2 + 1, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.Categories.add(new $news.Types.Category({
                    Title: i < 3 ? null : 'Title_' + i,
                }));
            }

            context.saveChanges(function () {
                context.Categories.orderByDescending('it.Title').toArray(function (res) {
                    equal(res.length, 5, 'result count');

                    for (var i = 0; i < res.length; i++) {
                        equal(res[i] instanceof $news.Types.Category, true, 'item is Category');
                        if (i > 1) {
                            equal(res[i].Title, null, 'item[i].Title is string' + res[i].Title);
                        } else {
                            equal(res[i].Title, 'Title_' + (res.length - i - 1), 'item[i].Title is string' + res[i].Title);
                        }
                    }

                    _finishCb(context);
                });
            });
        });

    });

    test("orderbyDESC orderbyASC", 5 * 4*2 + 1, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.TestTable2.add({ Id: $data.createGuid(), i0: 1, s0: 'value' + i });
                context.TestTable2.add({ Id: $data.createGuid(), i0: 1, s0: 'value' + i });
                context.TestTable2.add({ Id: $data.createGuid(), i0: 2, s0: 'value' + i });
                context.TestTable2.add({ Id: $data.createGuid(), i0: 2, s0: 'value' + i });
            }

            context.saveChanges(function () {
                context.TestTable2.orderByDescending('it.i0').orderBy('it.s0').toArray(function (res) {
                    equal(res.length, 20, 'result count');

                    for (var i = 0; i < res.length; i++) {
                        var i0 = i < 10 ? 2 : 1;
                        equal(res[i].i0, i0, 'i0: ' + i0);
                        var s0 = 'value' + Math.floor((i > 9 ? (i - 10) : i) / 2);
                        equal(res[i].s0, s0, 's0: ' + s0);

                    }

                    _finishCb(context);
                });
            });
        });

    });
};

function EntityContextOnUpdateTests(providerConfig, msg) {
    if (typeof module == 'function') module("EntityContextOnUpdateTests_" + (msg || ''));

    test("onupdate dropdb", 5, function () {
        stop();
        var pconf = JSON.parse(JSON.stringify(providerConfig));

        var afterUpdate = false;

        pconf.databaseName = 'onupdate_test_1';
        pconf.dbCreation = $data.storageProviders.DbCreationType.DropAllExistingTables;
        pconf.onUpdated = function (ctx, callback) {
            ok(ctx instanceof $data.EntityContext, "param1 is context");
            equal(typeof callback.success, 'function', "param2 has success");
            equal(typeof callback.error, 'function', "param2 has error");

            equal(afterUpdate, false, "afterUpdate is false");
            afterUpdate = true;
            callback.success();
        };

        (new $news.Types.NewsContext(pconf)).onReady(function (context) {
            equal(afterUpdate, true, "afterUpdate is false");

            _finishCb(context);
        });
    });

    test("onupdate fail test", 2, function () {
        stop();
        var pconf = JSON.parse(JSON.stringify(providerConfig));

        var afterUpdate = false;

        pconf.databaseName = 'onupdate_test_2';
        pconf.dbCreation = $data.storageProviders.DbCreationType.DropAllExistingTables;
        pconf.onUpdated = function (ctx, callback) {
            afterUpdate = true;
            callback.error(ctx);
        };

        var ctx;
        (ctx = new $news.Types.NewsContext(pconf)).onReady(function (context) {
            ok(false, "context is onready");
            _finishCb(context);
        }).fail(function () {
            ok(true, "context is onready failed");
            equal(afterUpdate, true, "afterUpdate is false");

            _finishCb(ctx);
        });
    });

    test("onupdate if db change - no changes", 1, function () {
        stop();
        var pconf = JSON.parse(JSON.stringify(providerConfig));

        var afterUpdate = false;

        pconf.databaseName = 'onupdate_test_3';
        (new $news.Types.NewsContext(pconf)).onReady(function (context) {
            stop();
            _finishCb(context);

            pconf.dbCreation = $data.storageProviders.DbCreationType.DropTableIfChange;
            pconf.onUpdated = function (ctx, callback) {
                ok(false, "onUpdated is running");
                afterUpdate = true;
                callback.success();
            };

            (new $news.Types.NewsContext(pconf)).onReady(function (context) {
                equal(afterUpdate, false, "afterUpdate is false");
                _finishCb(context);
            });
        });
    });

    $data.Entity.extend('OUType1', {
        Id: { type: 'int', key: true, computed: true },
        Title: { type: 'string' }
    });
    $data.Entity.extend('OUType2', {
        Id: { type: 'int', key: true, computed: true },
        Title: { type: 'string' },
        Lead: { type: 'string' }
    });
    $data.Entity.extend('OUType3', {
        Id1: { type: 'int', key: true },
        Id2: { type: 'int', key: true },
        Title: { type: 'string' }
    });
    $data.EntityContext.extend('OUCTX1', {
        OUTypes1: { type: $data.EntitySet, elementType: OUType1 }
    });
    $data.EntityContext.extend('OUCTX2', {
        OUTypes2: { type: $data.EntitySet, elementType: OUType2 }
    });
    $data.EntityContext.extend('OUCTX3', {
        OUTypes1: { type: $data.EntitySet, elementType: OUType3 }
    });
    $data.EntityContext.extend('OUCTX12', {
        OUTypes1: { type: $data.EntitySet, elementType: OUType1 },
        OUTypes2: { type: $data.EntitySet, elementType: OUType2 }
    });

    test("onupdate double context instance, first recreate", 2, function () {
        stop();
        var pconf = JSON.parse(JSON.stringify(providerConfig));

        var afterUpdate = false;

        pconf.databaseName = 'onupdate_test_4';
        pconf.dbCreation = $data.storageProviders.DbCreationType.DropAllExistingTables;
        pconf.onUpdated = function (ctx, callback) {
            equal(afterUpdate, false, "onUpdated is first running");
            afterUpdate = true;
            callback.success();
        };

        (new OUCTX1(pconf)).onReady(function (context) {
            equal(afterUpdate, true, "afterUpdate is true");

            stop();
            _finishCb(context);

            pconf.dbCreation = $data.storageProviders.DbCreationType.DropTableIfChange;
            (new OUCTX1(pconf)).onReady(function (context) {

                _finishCb(context);
            });
        });
    });

    test("onupdate entity change", 4, function () {
        if (providerConfig.name == "indexedDb") { expect(1); ok(true, "Not supported"); return; }

        stop();
        var pconf = JSON.parse(JSON.stringify(providerConfig));

        var afterUpdate = false;

        pconf.databaseName = 'onupdate_test_5';
        pconf.dbCreation = $data.storageProviders.DbCreationType.DropAllExistingTables;
        pconf.onUpdated = function (ctx, callback) {
            //2 times run
            ok(true, "onUpdated is running");
            afterUpdate = true;
            callback.success();
        };

        (new OUCTX1(pconf)).onReady(function (context) {
            equal(afterUpdate, true, "afterUpdate is true");

            stop();
            _finishCb(context);

            afterUpdate = false;
            pconf.dbCreation = $data.storageProviders.DbCreationType.DropTableIfChange;
            (new OUCTX2(pconf)).onReady(function (context) {
                equal(afterUpdate, true, "afterUpdate is true");

                _finishCb(context);
            });
        });
    });

    test("onupdate context change", 4, function () {
        var doTest = function () {
            stop();
            var pconf = JSON.parse(JSON.stringify(providerConfig));

            var afterUpdate = false;

            pconf.databaseName = 'onupdate_test_6';
            pconf.dbCreation = $data.storageProviders.DbCreationType.DropAllExistingTables;
            pconf.onUpdated = function (ctx, callback) {
                //2 times run
                ok(true, "onUpdated is running");
                afterUpdate = true;
                callback.success();
            };

            (new OUCTX1(pconf)).onReady(function (context) {
                equal(afterUpdate, true, "afterUpdate is true");

                stop();
                _finishCb(context);

                afterUpdate = false;
                pconf.dbCreation = $data.storageProviders.DbCreationType.DropTableIfChange;
                (new OUCTX12(pconf)).onReady(function (context) {
                    equal(afterUpdate, true, "afterUpdate is true");

                    _finishCb(context);
                });
            });
        };

        if (providerConfig.name == "indexedDb") {
            var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            if (indexedDB.deleteDatabase) {
                stop();
                var tran = indexedDB.deleteDatabase('onupdate_test_6')
                tran.onsuccess = function () {
                    start();
                    doTest();
                };
                tran.onerror = function () {
                    start();
                    expect(1); ok(true, "cannot delete database"); return;
                };

            } else {
                expect(1); ok(true, "Not supported"); return;
            }
        } else {
            doTest();
        }
    });

    test("onupdate entity key change", 4, function () {
        if (providerConfig.name == "indexedDb" && !$data.storageProviders.indexedDbPro) { expect(1); ok(true, "Not supported"); return; }

        stop();
        var pconf = JSON.parse(JSON.stringify(providerConfig));

        var afterUpdate = false;

        pconf.databaseName = 'onupdate_test_7';
        pconf.dbCreation = $data.storageProviders.DbCreationType.DropAllExistingTables;
        pconf.onUpdated = function (ctx, callback) {
            //2 times run
            ok(true, "onUpdated is running");
            afterUpdate = true;
            callback.success();
        };

        (new OUCTX1(pconf)).onReady(function (context) {
            equal(afterUpdate, true, "afterUpdate is true");

            stop();
            _finishCb(context);

            afterUpdate = false;
            pconf.dbCreation = $data.storageProviders.DbCreationType.DropTableIfChange;
            (new OUCTX3(pconf)).onReady(function (context) {
                equal(afterUpdate, true, "afterUpdate is true");

                _finishCb(context);
            });
        });
    });

    test("onupdate populate before ready", 2, function () {
        stop();
        var pconf = JSON.parse(JSON.stringify(providerConfig));

        pconf.databaseName = 'onupdate_test_8';
        pconf.dbCreation = $data.storageProviders.DbCreationType.DropAllExistingTables;
        pconf.onUpdated = function (ctx, callback) {
            
            $news.Types.NewsContext.generateTestData(ctx, function () {
                ok(true, "data created");
                callback.success();
            });

        };

        (new $news.Types.NewsContext(pconf)).onReady(function (context) {

            context.Categories.toArray({
                success: function (res) {
                    ok(res.length > 0, "context loaded data");
                    _finishCb(context);
                },
                error: function (e) {
                    ok(false, "context loaded data");
                    console.log(e);
                    _finishCb(context);
                }

            });

        });
    });
};

function LiveArrayTests(providerConfig, msg) {
    if (typeof module == 'function') module("LiveArrayTests_" + (msg || ''));

    test("toLiveArray", 5, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {
            $news.Types.NewsContext.generateTestData(context, function () {

                var result = context.Articles.toLiveArray();
                result.then(function (r) {
                    equal(result.length, 26, 'result is not empty');
                    ok(result === r, 'result is equal with promise result');

                    result.length = 5;
                    equal(result.length, 5, 'result is changed');

                    result.refresh();
                    result.then(function () {
                        equal(result.length, 26, 'result is not empty 2');
                    }).then(function () {
                        equal(result.length, 26, 'result is not empty 3');

                        _finishCb(context);
                    });
                });
            });
        });
    });

    test("toLiveArray - paging", 7, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {
            $news.Types.NewsContext.generateTestData(context, function () {

                var result = context.Articles.take(5).toLiveArray();
                result.then(function () {
                    equal(result.length, 5, 'result is not empty');

                    var title = result[0].Title;
                    result.next();
                    equal(result.length, 5, 'result is not empty before next');

                    result.then(function () {
                        equal(result.length, 5, 'result is not empty 2');

                        var title2 = result[0].Title;
                        notEqual(title2, title, 'result is paged');


                        result.prev();
                        equal(result.length, 5, 'result is not empty before prev');

                        result.then(function () {
                            equal(result.length, 5, 'result is not empty 2');

                            equal(result[0].Title, title, 'result is paged back');

                            _finishCb(context);
                        });
                    });
                });
            });
        });
    });
}
