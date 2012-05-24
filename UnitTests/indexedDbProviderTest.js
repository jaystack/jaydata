$(document).ready(function () {
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
        var request = context.storageProvider.indexedDB.deleteDatabase(context.storageProvider.db.name);
        request.onsuccess = startClb;
        request.onerror = startClb;
    }
    module('indexedDbProviderTest');
    test('indexedDbProvider_openDbSimpleContext', function () {
        expect(2);
        $data.Class.define('indexedDbProviderTest_Person', $data.Entity, null, {
            Id: { dataType: 'int', key: true, computed: true },
            Name: { dataType: 'string' }
        }, null);
        $data.Class.define('indexedDbProviderTest_Context', $data.EntityContext, null, {
            Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_Person }
        }, null);
        var context = new indexedDbProviderTest_Context({
            name: 'indexedDb',
            databaseName: 'indexedDbProvider_openDbSimpleContext',
            dbCreation: $data.storageProviders.indexedDb.DbCreationType.DropStoreIfExists
        });
        stop(1);
        context.onReady(function () {
            //start();
            ok(true, 'simple context opened');
            context.Persons.toArray({
                error: function () {
                    ok(false, 'empty db');
                    close(context);
                },
                success: function (result) {
                    //start();
                    equal(result.length, 0, 'empty db');
                    close(context);
                }
            });
        });
    });
    test('indexedDbProvider_openDbNewsContext', function () {
        expect(2);
        var context = new $news.Types.NewsContext({
            name: 'indexedDb',
            databaseName: 'indexedDbProvider_openDbNewsContext',
            dbCreation: $data.storageProviders.indexedDb.DbCreationType.DropStoreIfExists
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
        expect(15);
        $data.Class.define('indexedDbProviderTest_Person', $data.Entity, null, {
            Id: { dataType: 'int', key: true },
            Name: { dataType: 'string' }
        }, null);
        $data.Class.define('indexedDbProviderTest_Context', $data.EntityContext, null, {
            Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_Person }
        }, null);
        var context = new indexedDbProviderTest_Context({
            name: 'indexedDb',
            databaseName: 'indexedDbProvider_openDbInsertSingleKeyCRUD',
            dbCreation: $data.storageProviders.indexedDb.DbCreationType.DropAllExistingTables
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
                    var p = new indexedDbProviderTest_Person({ Name: 'user' });
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
            dbCreation: $data.storageProviders.indexedDb.DbCreationType.DropStoreIfExists
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
                        error: function() {
                            ok(false, 'nonempty user table');
                            close(context);
                        },
                        success: function(result) {
                            equal(result, 1, 'nonempty user table');
                            close(context);
                        }
                    });
                }
            });
        });
    });
});