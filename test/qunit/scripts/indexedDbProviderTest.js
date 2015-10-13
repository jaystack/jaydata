$(document).ready(function () {
    //$data.Trace = new $data.Logger();
    if (!$data.StorageProviderLoader.isSupported('indexedDb'))
        return;

    logResult = [];
    var running = true;
    QUnit.log(function (result) {
        logResult.push(result);
        if (result.message == '[object Event], undefined:undefined') {
            console.log('!!');
        }
    });

    function close(context) {
        $data.Trace.log("!!close context!!");
        context.storageProvider.db.close();
        var startClb = function (event) { start(1); running = false; }
        start();
        context.storageProvider.db.close();
        if (context.storageProvider.indexedDB.deleteDatabase) {
            var request = context.storageProvider.indexedDB.deleteDatabase(context.storageProvider.db.name);
        }
        //request.onsuccess = startClb;
        //request.onerror = startClb;
    }
    function x_test() { };

    module('indexedDbProviderTest');
    test('storageProvider_finds_interfaces', function () {
        expect(4);
        stop(1);
        $data.StorageProviderLoader.load(['indexedDb'], function () {
            start(1);
            var provider = $data.storageProviders.indexedDb ? 
                new $data.storageProviders.indexedDb.IndexedDBStorageProvider() : 
                new $data.storageProviders.indexedDbPro.IndexedDBStorageProvider();

            ok(provider.indexedDB, "IndexedDB interface found");
            ok(provider.IDBRequest, "IDBRequest");
            ok(provider.IDBTransaction, "IDBTransaction");
            ok(provider.IDBKeyRange, "IDBKeyRange");
        });
    });
    test('storageProvider_finds_interfaces', function () {
        expect(4);
        stop(1);
        $data.StorageProviderLoader.load(['indexedDb'], function () {
            start(1);
            var provider = $data.storageProviders.indexedDbPro ?
                new $data.storageProviders.indexedDbPro.IndexedDBStorageProvider() :
                new $data.storageProviders.indexedDb.IndexedDBStorageProvider();

            ok(provider.indexedDB, "IndexedDB interface found");
            ok(provider.IDBRequest, "IDBRequest");
            ok(provider.IDBTransaction, "IDBTransaction");
            ok(provider.IDBKeyRange, "IDBKeyRange");
        });
    });
    /*
    test('disallow_types_with_incorrect_keys', function () {
        expect(2);
        $data.Class.define('indexedDbProviderTest_PersonWithoutKey', $data.Entity, null, {
            Id: { dataType: 'int', computed: true },
            Name: { dataType: 'string' }
        }, null);

        $data.Class.define('indexedDbProviderTest_ContextWithError', $data.EntityContext, null, {
            Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_PersonWithoutKey }
        }, null);

        var context = new indexedDbProviderTest_ContextWithError({
            name: 'indexedDb',
            databaseName: 'indexedDbProvider_openDbSimpleContext',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        });

        context.onReady({
            error: function (exception) {
                equal(exception.name, "KeyNotFoundError");
            }
        });


        $data.Class.define('indexedDbProviderTest_PersonWithoutMultipleKeys', $data.Entity, null, {
            Id: { dataType: 'int', key: true },
            Id2: { dataType: 'int', key: true },
            Name: { dataType: 'string' }
        }, null);

        $data.Class.define('indexedDbProviderTest_ContextWithError', $data.EntityContext, null, {
            Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_PersonWithoutMultipleKeys }
        }, null);
        try {
            var context = new indexedDbProviderTest_ContextWithError({
                name: 'indexedDb',
                databaseName: 'indexedDbProvider_openDbSimpleContext',
                dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
            });
            ok(true, "MultipleKeys Supported");

        } catch (exception) {
            equal(exception.name, "MultipleKeysNotSupportedError");
        }

        $data.Class.define('indexedDbProviderTest_PersonWithoutIncorrectKey', $data.Entity, null, {
            Id: { dataType: 'string', key: true, computed: true },
            Name: { dataType: 'string' }
        }, null);

        $data.Class.define('indexedDbProviderTest_ContextWithError', $data.EntityContext, null, {
            Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_PersonWithoutIncorrectKey }
        }, null);
        try {
            var context = new indexedDbProviderTest_ContextWithError({
                name: 'indexedDb',
                databaseName: 'indexedDbProvider_openDbSimpleContext',
                dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
            });
        } catch (exception) {
            equal(exception.name, "ComputedKeyFieldError");
        }

    });
    */
    var indexedDbProvider_openDbSimpleContext_dbname = 'indexedDbProvider_openDbSimpleContext' + Math.random();
    test('indexedDbProvider_openDbSimpleContext', function () {
        expect(4);
        stop();

        $data.Class.define('indexedDbProviderTest_Person', $data.Entity, null, {
            Id: { dataType: 'int', computed: true, key: true },
            Name: { dataType: 'string' }
        }, null);

        $data.Class.define('indexedDbProviderTest_Context', $data.EntityContext, null, {
            Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_Person }
        }, null);

        try {
            var context = new indexedDbProviderTest_Context({
                name: 'indexedDb',
                databaseName: indexedDbProvider_openDbSimpleContext_dbname,
                dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
            });
        } catch (exception) {
            console.log("!!!");
            console.dir(exception);
        }

        context.onReady(
            {
                error: function (e) {
                    console.dir(e);
                },
                success:
                function () {
                    //start();
                    ok(true, 'simple context opened');
                    context.Persons.toArray({
                        error: function () {
                            ok(false, 'empty db');
                            //start();
                            close(context);
                        },
                        success: function (result) {
                            //start();
                            equal(result.length, 0, 'empty db');
                            stop();
                            close(context);
                            indexedDbProvider_openDbSimpleContext_extend(function () {
                                start();
                                //close(context);
                            });
                        }
                    });
                }
            }
        );
    });

    function indexedDbProvider_openDbSimpleContext_extend(ready) {
        //test('indexedDbProvider_openDbSimpleContext extend', function () {
        //expect(2);
        stop();
        $data.Class.define('indexedDbProviderTest_PersonProfile', $data.Entity, null, {
            Id: { dataType: 'int', computed: true, key: true },
            Name: { dataType: 'string' }
        }, null);

        $data.Class.define('indexedDbProviderTest_Context2', $data.EntityContext, null, {
            Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_Person },
            PersonsProfile: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_PersonProfile }
        }, null);

        try {
            var context = new indexedDbProviderTest_Context2({
                name: 'indexedDb',
                databaseName: indexedDbProvider_openDbSimpleContext_dbname,
                dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
            });
        } catch (exception) {
            console.log("!!!");
            console.dir(exception);
        }

        context.onReady(
            {
                error: function (e) {
                    console.dir(e);
                },
                success:
                function () {
                    //start();
                    ok(true, 'simple context opened');
                    context.PersonsProfile.toArray({
                        error: function () {
                            ok(false, 'empty db');
                            start();
                            close(context);
                            ready();
                        },
                        success: function (result) {
                            //start();
                            equal(result.length, 0, 'empty db');
                            start();
                            close(context);
                            ready();
                        }
                    });
                }
            }
        );
        //});
    }

    test('indexedDbProvider_openDbNewsContext', function () {
        expect(2);
        var context = new $news.Types.NewsContext({
            name: 'indexedDb',
            databaseName: 'indexedDbProvider_openDbNewsContext',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        });
        stop(1);
        context.onReady(function () {
            //start();
            ok(true, 'newsreader context opened');
            context.Users.toArray({
                error: function () {
                    ok(false, 'empty user table');
                    close(context);
                },
                success: function (result) {
                    //start();
                    equal(result.length, 0, 'empty users table');
                    close(context);
                }
            });
        }).fail(function (ex) {
            start();
            ok(false, ex);
        });
    });

    test('indexedDbProvider_openDbInsertSingleKeyCRUD', function () {
        expect(16);
        $data.Class.define('indexedDbProviderTest_Person', $data.Entity, null, {
            Id: { dataType: 'int', key: true },
            Name: { dataType: 'string' },
            Desc: { dataType: 'string' }
        }, null);
        $data.Class.define('indexedDbProviderTest_Context', $data.EntityContext, null, {
            Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_Person }
        }, null);
        var context = new indexedDbProviderTest_Context({
            name: 'indexedDb',
            databaseName: 'indexedDbProvider_openDbInsertSingleKeyCRUD',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        });
        stop(1);
        context.onReady(function () {
            //start();
            context.Persons.toArray({
                error: function () {
                    ok(false, 'empty db');
                    close(context);
                },
                success: function (result) {
                    //start();
                    equal(result.length, 0, 'empty db');
                    var p = new indexedDbProviderTest_Person({ Name: 'user', Desc: 'some text' });
                    equal(p.Id, undefined, 'id undefined');
                    context.Persons.add(p);
                    context.saveChanges({
                        success: function () {
                            ok(false, 'entity insert without id fail');
                            close(context);
                        },
                        error: function () {
                            //start();
                            ok(true, 'entity insert without id fail');
                            p.Id = 1;
                            context.saveChanges({
                                error: function () {
                                    ok(false, 'entity insert with id success');
                                    close(context);
                                },
                                success: function (changedItems) {
                                    //start();
                                    equal(changedItems, 1, 'entity insert with id success');
                                    context.Persons.toArray({
                                        error: function () {
                                            ok(false, 'entity query');
                                            close(context);
                                        },
                                        success: function (result) {
                                            //start();
                                            equal(result.length, 1, 'entity query');
                                            p = result[0];
                                            equal(p.Id, 1, 'entity query');
                                            equal(p.Name, 'user', 'entity query');
                                            context.Persons.attach(p);
                                            p.Name = 'modifiedUser';
                                            context.saveChanges({
                                                error: function () {
                                                    ok(false, 'entity update');
                                                    close(context);
                                                },
                                                success: function (changedItems) {
                                                    //start();
                                                    equal(changedItems, 1, 'entity update');
                                                    context.Persons.toArray({
                                                        error: function (result) {
                                                            ok(false, 'entity update');
                                                            close(context);
                                                        },
                                                        success: function (result) {
                                                            //start();
                                                            equal(result.length, 1, 'entity update');
                                                            p = result[0];
                                                            equal(p.Id, 1, 'entity update');
                                                            equal(p.Name, 'modifiedUser', 'entity update');
                                                            equal(p.Desc, 'some text', 'entity update');
                                                            context.Persons.attach(p);
                                                            p.Id = 2;
                                                            context.saveChanges({
                                                                success: function () {
                                                                    ok(false, 'invalid entity update fail');
                                                                    close(context);
                                                                },
                                                                error: function (a) {
                                                                    //start();
                                                                    ok(true, 'invalid entity update fail');
                                                                    context.Persons.remove(p);
                                                                    context.saveChanges({
                                                                        success: function () {
                                                                            ok(false, 'invalid entity delete fail');
                                                                            close(context);
                                                                        },
                                                                        error: function (e) {
                                                                            //start();
                                                                            ok(true, 'invalid entity delete fail');
                                                                            p.Id = 1;
                                                                            context.saveChanges({
                                                                                error: function () {
                                                                                    ok(false, 'entity delete');
                                                                                    close(context);
                                                                                },
                                                                                success: function (changedItems) {
                                                                                    //start();
                                                                                    equal(changedItems, 1, 'entity delete');
                                                                                    context.Persons.toArray({
                                                                                        error: function () {
                                                                                            ok(false, 'entity delete');
                                                                                            close(context);
                                                                                        },
                                                                                        success: function (result) {
                                                                                            //start();
                                                                                            equal(result.length, 0, 'entity delete');
                                                                                            close(context);
                                                                                        }
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });

    test('indexedDbProvider_count', function () {
        expect(2);
        var context = new $news.Types.NewsContext({
            name: 'indexedDb',
            databaseName: 'indexedDbProvider_count',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        });
        stop(1);
        context.onReady(function () {
            context.Users.length({
                error: function () {
                    ok(false, 'empty user table');
                    close(context);
                },
                success: function (result) {
                    equal(result, 0, 'empty users table');
                    var usr = new $news.Types.User({ LoginName: 'test' });
                    context.Users.add(usr);
                    context.saveChanges({
                        error: function (e) {
                            ok(false, 'user save faild');
                            close(context);
                        },
                        success: function (result) {
                            equal(result, 1, 'nonempty user table');
                            close(context);
                        }
                    });
                }
            });
        }).fail(function (ex) {
            start();
            ok(false, ex);
        });
    });

    test('indexedDbProvider_auto_increment', function () {
        expect(3);
        var context = new $news.Types.NewsContext({
            name: 'indexedDb',
            databaseName: 'indexedDbProvider_count',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        });
        stop(1);
        context.onReady(function () {
            context.Users.toArray({
                error: function () {
                    ok(false, 'error');
                    close(context);
                },
                success: function (result) {
                    var usr = new $news.Types.User({ LoginName: 'test' });
                    context.Users.add(usr);
                    equal(usr.Id, undefined, 'Id is not set');
                    context.saveChanges({
                        error: function (e) {
                            ok(false, 'save error');
                            close(context);
                        },
                        success: function (result) {
                            equal(typeof usr.Id, 'number', 'Id has valid type');
                            equal(usr.Id, 1, 'is has valid value');
                            close(context);
                        }
                    });
                }
            });
        }).fail(function (ex) {
            start();
            ok(false, ex);
        });
    });
    if (window.ActiveXObject === undefined) {
        test('indexedDbProvider_openDb_multiple_key', function () {
            expect(14);
            stop();

            $data.Class.define('indexedDbProviderTest_Person2Key', $data.Entity, null, {
                Id: { dataType: 'int', key: true, required: true },
                IdGuid: { dataType: 'guid', key: true, required: true },
                Name: { dataType: 'string' }
            }, null);

            $data.Class.define('indexedDbProviderTest_Context2Key', $data.EntityContext, null, {
                Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_Person2Key }
            }, null);

            try {
                var context = new indexedDbProviderTest_Context2Key({
                    name: 'indexedDb',
                    databaseName: 'indexedDbProvider_openDb_multiple_key'
                });
            } catch (exception) {
                console.log("!!!");
                console.dir(exception);
            }

            context.onReady({
                error: function (e) {
                    console.dir(e);
                },
                success: function () {
                    //start();
                    ok(true, 'simple context opened');
                    context.Persons.toArray({
                        error: function () {
                            ok(false, 'empty db');
                            //start();
                            close(context);
                        },
                        success: function (result) {
                            var item = new indexedDbProviderTest_Person2Key({ Name: 'test' });
                            context.Persons.add(item);
                            equal(item.Id, undefined, 'Id is not set');
                            equal(item.IdGuid, undefined, 'IdGuid is not set');
                            context.saveChanges({
                                error: function (e) {

                                    item.Id = 1;
                                    item.IdGuid = $data.parseGuid('83a2532a-bc7c-4554-b0fd-c63642a95d04');

                                    context.saveChanges({
                                        error: function (e) {

                                            ok(false, '(in IE10, multiple key not supported on this implementation) save error ' + e);

                                            close(context);
                                        },
                                        success: function (result) {
                                            equal(typeof item.Id, 'number', 'Id has valid type');
                                            equal(item.Id, 1, 'is has valid value');

                                            equal($data.parseGuid(item.IdGuid) instanceof $data.Guid, true, 'IdGuid is guid');
                                            equal(typeof item.IdGuid, 'string', 'IdGuid is guid');
                                            equal(item.IdGuid.valueOf(), '83a2532a-bc7c-4554-b0fd-c63642a95d04', 'IdGuid valid has value');

                                            context.Persons.toArray({
                                                success: function (res) {
                                                    equal(res.length, 1, 'result lenght failed');

                                                    equal(typeof res[0].Id, 'number', 'Id has valid type');
                                                    equal(res[0].Id, 1, 'is has valid value');

                                                    equal($data.parseGuid(res[0].IdGuid) instanceof $data.Guid, true, 'IdGuid is guid');
                                                    equal(typeof res[0].IdGuid, 'string', 'IdGuid is guid');
                                                    equal(res[0].IdGuid.valueOf(), '83a2532a-bc7c-4554-b0fd-c63642a95d04', 'IdGuid valid has value');

                                                    close(context);
                                                },
                                                error: function (res) {
                                                    ok(false, 'save error ' + res);
                                                    close(context);
                                                }
                                            });
                                        }
                                    });

                                },
                                success: function (result) {
                                    ok(false, 'save error ' + result);
                                    close(context);
                                }
                            });

                        }
                    });
                }
            }
            );
        });
    }
    $data.Class.define("idbexample.idbTestItem1", $data.Entity, null, {
        Id: { type: "int", key: true, computed: true },
        i0: { type: "int" },
        b0: { type: "boolean" },
        s0: { type: "string" },
        blob: { type: "blob" },
        n0: { type: "number" },
        d0: { type: "date" },
    }, null);

    $data.Class.define("idbexample.idbTestItem2", $data.Entity, null, {
        Id: { type: "guid", key: true, required: true },
        i0: { type: "int" },
        b0: { type: "boolean" },
        s0: { type: "string" },
        blob: { type: "blob" },
        n0: { type: "number" },
        d0: { type: "date" },
    }, null);

    $data.Class.define('idbexample.idbContext', $data.EntityContext, null, {
        Items1: { dataType: $data.EntitySet, elementType: idbexample.idbTestItem1, indices: [{ name: 'index0', keys: ['i0'], unique: false }, { name: 'i2', keys: ['s0'], unique: false }] },
        Items2: { dataType: $data.EntitySet, elementType: idbexample.idbTestItem2 }
    }, null);

    test('many_data_test', function () {
        var dataNumber = 1000;
        expect((6 + 7) * dataNumber + 6);


        var context = new idbexample.idbContext({
            name: 'indexedDb',
            databaseName: 'idbexample_idbContext',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        });
        stop(1);
        context.onReady(function () {
            //start();
            ok(true, 'idbContext context opened');
            context.Items1.length({
                success: function (result) {
                    equal(result, 0, 'empty items table');
                    for (var i = 0; i < dataNumber; i++) {
                        var item1 = new idbexample.idbTestItem1({
                            i0: i,
                            b0: true,
                            s0: 's0' + i,
                            n0: parseFloat('2.2' + i),
                            d0: new Date((i + 1000).toString() + '/01/01 12:13:14'),
                        });
                        var item2 = new idbexample.idbTestItem2({
                            Id: $data.Guid.NewGuid(),
                            i0: i,
                            b0: false,
                            s0: 's0' + i,
                            n0: parseFloat('2.2' + i),
                            d0: new Date((i + 1000).toString() + '/01/01 12:13:14'),
                        });
                        context.Items1.add(item1);
                        context.Items2.add(item2);
                    }
                    context.saveChanges({
                        success: function () {

                            context.Items1.length(function (res1) {
                                equal(res1, dataNumber, 'item1 length failed');
                                context.Items2.length(function (res2) {
                                    equal(res2, dataNumber, 'item2 length failed');

                                    context.Items1.toArray(function (result1) {
                                        equal(result1.length, res1, 'result1 length failed');
                                        for (var i = 0; i < result1.length; i++) {
                                            equal(typeof result1[i].Id, 'number', 'result1[i].Id failed');
                                            equal(typeof result1[i].i0, 'number', 'result1[i].i0 failed');
                                            equal(result1[i].b0, true, 'result1[i].b0 failed');
                                            equal(typeof result1[i].s0, 'string', 'result1[i].s0 failed');
                                            equal(typeof result1[i].n0, 'number', 'result1[i].n0 failed');
                                            ok(result1[i].d0 instanceof $data.Date, 'result1[i].d0 failed');
                                        }


                                        context.Items2.toArray(function (result2) {
                                            equal(result2.length, res2, 'result2 length failed');
                                            for (var i = 0; i < result2.length; i++) {
                                                ok($data.parseGuid(result2[i].Id) instanceof $data.Guid, 'result2[i].i0 failed');
                                                equal(typeof result2[i].Id, 'string', 'result2[i].i0 failed');
                                                equal(typeof result2[i].i0, 'number', 'result2[i].i0 failed');
                                                equal(result2[i].b0, false, 'result2[i].b0 failed');
                                                equal(typeof result2[i].s0, 'string', 'result2[i].s0 failed');
                                                equal(typeof result2[i].n0, 'number', 'result2[i].n0 failed');
                                                ok(result2[i].d0 instanceof $data.Date, 'result2[i].d0 failed');
                                            }
                                            close(context);
                                        });

                                    });

                                });
                            });

                        },
                        error: function (e) {
                            ok(false, 'error ' + e);
                            close(context);
                        }
                    })
                },
                error: function (e) {
                    ok(false, 'error ' + e);
                    close(context);
                }
            });
        });
    });

    test('next_prev_result', function () {
        var context = new idbexample.idbContext({
            name: 'indexedDb',
            databaseName: 'idbexample_idbContext2',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        });
        stop(1);
        context.onReady(function () {
            var maxItemNum = 30;
            for (var i = 0; i < maxItemNum; i++) {
                var item1 = new idbexample.idbTestItem1({
                    i0: i,
                    b0: i % 2 ? true : false,
                    s0: 's0' + (maxItemNum - i),
                    n0: parseFloat('2.2' + i),
                    d0: new Date((i + 1000).toString() + '/01/01 12:13:14'),
                });
                var item2 = new idbexample.idbTestItem2({
                    Id: $data.Guid.NewGuid(),
                    i0: i,
                    b0: i % 2 ? true : false,
                    s0: 's0' + (maxItemNum - i),
                    n0: parseFloat('2.2' + i),
                    d0: new Date((i + 1000).toString() + '/01/01 12:13:14'),
                });
                if (i == 500) {
                    item2_500_guid = item2.Id;
                }
                context.Items1.add(item1);
                context.Items2.add(item2);
            }
            context.saveChanges({
                success: function () {
                    context.Items1.take(5).toArray(function (result) {
                        equal(result.length, 5, "endsWith(), result length");
                        for (var i = 0; i < result.length; i++) {
                            equal(result[i].i0, i, "Id error");
                        }
                        result.next(function (result2) {
                            equal(result2.length, 5, "endsWith(), result length");
                            for (var i = 0; i < result.length; i++) {
                                equal(result2[i].i0, (i + 5), "Id error");
                            }
                            close(context);
                        });
                    });
                }
            });
        });
    });

    test('indexed_db_simple_tests', function () {
        
        var context = new idbexample.idbContext({
            name: 'indexedDb',
            databaseName: 'idbexample_idbContext1',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        });
        stop(1);
        var item2_500_guid = "";
        context.onReady(function () {
            var maxItemNum = 1000;
            for (var i = 0; i < maxItemNum; i++) {
                var item1 = new idbexample.idbTestItem1({
                    i0: i,
                    b0: i % 2 ? true : false,
                    s0: 's0' + (maxItemNum - i),
                    n0: parseFloat('2.2' + i),
                    d0: new Date((i + 1000).toString() + '/01/01 12:13:14'),
                });
                var item2 = new idbexample.idbTestItem2({
                    Id: $data.Guid.NewGuid(),
                    i0: i,
                    b0: i % 2 ? true : false,
                    s0: 's0' + (maxItemNum - i),
                    n0: parseFloat('2.2' + i),
                    d0: new Date((i + 1000).toString() + '/01/01 12:13:14'),
                });
                if (i == 500) {
                    item2_500_guid = item2.Id;
                }
                context.Items1.add(item1);
                context.Items2.add(item2);
            }
            context.saveChanges({
                success: function () {
                    //context.Items2.take(5).toArray(function (result) {
                    //    equal(result.length, 5, "endsWith(), result length");
                    //    result.next(function (result2) {
                    //        equal(result2.length, 5, "endsWith(), result length");
                    //        close(context);
                    //    });
                    //}); return;
                    subQuery = context.Items2.filter("it.i0<10").select(function (item) { return item.i0; });
                    $.when(
                            context.Items1.filter(function (item) { return item.i0 == this.a; }, { a: 40 }).toArray(function (result) {
                                equal(result.length, 1, "param query result legth");
                                equal(result[0].i0, 40, "item id error");
                            }),
                            context.Items1.filter(function (item) { return item.i0 == this.a && item.i0 == 20; }, { a: 40 }).toArray(function (result) {
                                equal(result.length, 0, "and operator test");
                            }),
                            context.Items1.filter(function (item) { return item.i0 == this.a || item.i0 == 20; }, { a: 40 }).toArray(function (result) {
                                equal(result.length, 2, "or operator test");
                                equal(result[0].i0, 20, "or operator test item[0]");
                                equal(result[1].i0, 40, "or operator test item[1]");
                            }),
                            context.Items1.filter(function (item) { return item.i0 < this.a && item.i0 > 20; }, { a: 40 }).toArray(function (result) {
                                equal(result.length, 19, "and between, result length");
                                equal(result[0].i0, 21, "and between, 1st id");
                                equal(result[18].i0, 39, "and between, last id");
                            }),
                            context.Items1.filter(function (item) { return item.i0 > this.a && item.i0 > 15 || item.i0 <= 100 && item.i0 > 95; }, { a: 20 }).toArray(function (result) {
                                equal(result.length, maxItemNum - 21, "length error");
                                equal(result[0].i0, 21, "item id error");
                            }),
                            context.Items1.filter(function (item) { return item.i0 > this.a && (item.i0 > 15 || item.i0 <= 100) && item.i0 > 95; }, { a: 20 }).toArray(function (result) {
                                equal(result.length, 904, "length error");
                                equal(result[0].i0, 96, "item id error");
                            }),
                            context.Items1.filter("it.d0>this.d", { d: new Date("1980/01/01 12:13:14") }).toArray(function (result) {
                                equal(result.length, 19, "date filter, length error");
                                equal(result[0].i0, 981, "item id error");
                            }),
                            context.Items1.filter("it.d0>=this.d", { d: new Date("1980/01/01 12:13:14") }).toArray(function (result) {
                                equal(result.length, 20, "date filter, length error");
                                equal(result[0].i0, 980, "item id error");
                            }),
                            context.Items1.filter("it.b0==true").toArray(function (result) {
                                equal(result.length, 500, "date filter, length error");
                                equal(result[0].i0, 1, "item id error");
                            }),
                            context.Items1.filter("it.b0!=true").toArray(function (result) {
                                equal(result.length, 500, "date filter, length error");
                                equal(result[0].i0, 0, "item id error");
                            }),
                            context.Items1.length(function (result) {
                                equal(result, maxItemNum, "Max item number");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").length(function (result) {
                                equal(result, 5, "Max item number");
                            }),
                            context.Items1.filter("10>it.i0 && 5<=it.i0").length(function (result) {
                                equal(result, 5, "Max item number");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").forEach(function (item, idx, result) {
                                equal(result.length, 5, "Max item number");
                                equal(item.i0, idx + 5, "index");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").map(function (item) { return { a: item.i0 } }).toArray(function (result) {
                                var resultOK = result.length == 5;
                                for (var i = 0; i < result.length; i++) {
                                    resultOK &= (result[i].a == i + 5) && (result[i]['i0'] === undefined);
                                }
                                ok(resultOK);
                            }),
                            context.Items1.single("it.i0 == 2", {
                                success: function (result) {
                                    ok(result instanceof $data.Entity, "result type error");
                                    equal(resul.Id, 2, "Entity id error");
                                },
                                error: function () {
                                    ok(false, JSON.stringify(arguments));
                                }
                            }),
                            context.Items1.first("it.i0<10 && it.i0>=5", null, function (result) {
                                ok(result instanceof $data.Entity);
                                equal(result.i0, 5, "id error in first filter");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").take(3).toArray(function (result) {
                                equal(result.length, 3, "take filter, result count error");
                                equal(result[0].i0, 5, "take filter, id error");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").skip(3).toArray(function (result) {
                                equal(result.length, 2, "take filter, result count error");
                                equal(result[0].i0, 8, "take filter, id error");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").skip(2).take(2).toArray(function (result) {
                                equal(result.length, 2, "skip - take filter, result count error");
                                equal(result[0].i0, 7, "skip - take filter, id error");
                                equal(result[1].i0, 8, "skip - take filter, id error");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").take(2).skip(2).toArray(function (result) {
                                equal(result.length, 2, "skip - take filter, result count error");
                                equal(result[0].i0, 7, "skip - take filter, id error");
                                equal(result[1].i0, 8, "skip - take filter, id error");
                            }),
                            
                            context.Items1.filter("it.i0<10 && it.i0>=5").orderBy("it.s0").toArray(function (result) {
                                equal(result.length, 5, "orderBy filter, result count error");
                                equal(result[0].i0, 9, "orderBy filter, id error");
                                equal(result[1].i0, 8, "orderBy filter, id error");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").orderByDescending("it.s0").toArray(function (result) {
                                equal(result.length, 5, "orderBy filter, result count error");
                                equal(result[0].i0, 5, "orderBy filter, id error");
                                equal(result[1].i0, 6, "orderBy filter, id error");
                            }),
                            context.Items1.filter("it.i0<10 && it.i0>=5").orderBy("it.s0").skip(2).take(2).toArray(function (result) {
                                equal(result.length, 2, "order - skip - take filter, result count error");
                                equal(result[0].i0, 7, "order - skip - take filter, id error");
                                equal(result[1].i0, 6, "order - skip - take filter, id error");
                            }),
                            context.Items1.filter("it.i0<40").filter("it.i0>20 && it.i0!=5").toArray(function (result) {
                                equal(result.length, 19, "and between, result length");
                                equal(result[0].i0, 21, "and between, 1st id");
                                equal(result[18].i0, 39, "and between, last id");
                            }),
                            context.Items1.filter("it.i0<40").filter("it.i0>20 && it.i0!=5").map(function (item) { return { a: item.i0, b: item.s0 } }).toArray(function (result) {
                                equal(result.length, 19, "and between, result length");
                                equal(result[0].a, 21, "and between, 1st id");
                                equal(result[18].a, 39, "and between, last id");
                                equal(typeof (result[0].b), 'string', "and between, last id");
                            }),
                            context.Items1.filter("it.s0.contains('111') == true").toArray(function (result) {
                                equal(result.length, 1, "contains(), result length");
                            }),
                            context.Items1.filter(function (item) { return item.s0.contains(this.val) == true;}, {val:"111"}).toArray(function (result) {
                                equal(result.length, 1, "contains(), result length");
                            }),
                            context.Items1.filter("it.s0.startsWith('s01') == true").toArray(function (result) {
                                equal(result.length, 112, "startsWith(), result length");
                            }),
                            context.Items1.filter("it.s0.endsWith('11') == true").toArray(function (result) {
                                equal(result.length, 10, "endsWith(), result length");
                            }),
                            context.Items1.filter("it.s0.length() <= 4").toArray(function (result) {
                                equal(result.length, 99, "length(), result length");
                            }),
                            context.Items1.filter("4 >= it.s0.length()").toArray(function (result) {
                                equal(result.length, 99, "length(), result length");
                            }),
                            context.Items1.filter("it.s0.substr(2,2) == '99'").toArray(function (result) {
                                equal(result.length, 11, "substr(), result length");
                            }),
                            context.Items1.filter("it.s0 in ['s01','s02']").toArray(function (result) {
                                equal(result.length, 2, "in(), result length");
                            }),
                            context.Items2.filter("(it.Id == this.i && it.i0==500) || (it.i0 == 500 && it.i0 != 501)", { i: item2_500_guid }).toArray(function (result) {
                                equal(result.length, 1, "multiple key, result length");
                            })
                    ).then(function () {
                        close(context);
                    }).fail(function () {
                        ok(false, JSON.stringify(arguments));
                        close(context);
                    });
                }
            });
        });
    });

});