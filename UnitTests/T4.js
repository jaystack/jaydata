function T4_CrossProviderTests() {

    //oData
    ComplexTypeTests({ name: 'oData', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'oData');

    //sqLite/WebSql
    if ($data.StorageProviderLoader.isSupported('sqLite')) {
        ComplexTypeTests({ name: 'sqLite', databaseName: 'ComplexTypeTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'sqLite');
    }

    //indexedDb
    if ($data.StorageProviderLoader.isSupported('indexedDb')) {
        ComplexTypeTests({ name: 'indexedDb', databaseName: 'ComplexTypeTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'indexedDb');
    }

    //InMemory
    ComplexTypeTests({ name: 'InMemory', databaseName: 'ComplexTypeTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'InMemory');

    //LocalStore
    ComplexTypeTests({ name: 'LocalStore', databaseName: 'ComplexTypeTests_T4', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'LocalStore');
}

function _finishCb(context) {
    if (context.storageProvider.db && context.storageProvider.db.close)
        context.storageProvider.db.close();

    start();
}

function ComplexTypeTests(providerConfig, msg) {
    module("ComplexTypeTests_" + (msg || ''));

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
};