$(document).ready(function () {

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
        context.storageProvider.db.close();
        var startClb = function (event) { start(1); running = false; }
        start();
        context.storageProvider.db.close();
        var request = context.storageProvider.indexedDB.deleteDatabase(context.storageProvider.db.name);
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
            var provider = new $data.storageProviders.indexedDb.IndexedDBStorageProvider();
            ok(provider.indexedDB, "IndexedDB interface found");
            ok(provider.IDBRequest, "IDBRequest");
            ok(provider.IDBTransaction, "IDBTransaction");
            ok(provider.IDBKeyRange, "IDBKeyRange");
        });
    });

    test('disallow_types_with_incorrect_keys', function () {
        expect(3);
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
                            ok(false, 'nonempty user table');
                            close(context);
                        },
                        success: function (result) {
                            equal(result, 1, 'nonempty user table');
                            close(context);
                        }
                    });
                }
            });
        });
    });

    test('indexedDbProvider auto increment', function () {
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
        });
    });

    test('indexedDbProvider_openDb multiple key', function () {
        expect(12);
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

                                        equal(item.IdGuid instanceof $data.Guid, true, 'IdGuid is guid');
                                        equal(item.IdGuid.valueOf(), '83a2532a-bc7c-4554-b0fd-c63642a95d04', 'IdGuid valid has value');

                                        context.Persons.toArray({
                                            success: function (res) {
                                                equal(res.length, 1, 'result lenght failed');

                                                equal(typeof res[0].Id, 'number', 'Id has valid type');
                                                equal(res[0].Id, 1, 'is has valid value');

                                                equal(res[0].IdGuid instanceof $data.Guid, true, 'IdGuid is guid');
                                                equal(res[0].IdGuid.valueOf(), '83a2532a-bc7c-4554-b0fd-c63642a95d04', 'IdGuid valid has value');

                                                close(context);
                                            },
                                            error: function (res) {
                                                ok(false, 'save error '+ res);
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
        Items1: { dataType: $data.EntitySet, elementType: idbexample.idbTestItem1 },
        Items2: { dataType: $data.EntitySet, elementType: idbexample.idbTestItem2 }
    }, null);

    test('many data test', function () {
        var dataNumber = 1000;
        expect((6+6)*dataNumber + 6);
        

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
                                                ok(result2[i].Id instanceof $data.Guid, 'result2[i].i0 failed');
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
                    ok(false, 'error '+ e);
                    close(context);
                }
            });
        });
    });
});