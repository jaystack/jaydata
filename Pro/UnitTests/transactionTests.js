function TransactionTests(providerConfig, msg) {
    msg = msg || '';
    module("Transactions_" + msg);
    function getProviderConfig() {
        return JSON.parse(JSON.stringify(providerConfig));
    }
    function closeDbIfNeeded(context) {
        if (context.storageProvider.db) {
            context.storageProvider.db.close();
        }
    }
    $data.Class.define('indexedDbProviderTest_Person', $data.Entity, null, {
        Id: { dataType: 'int', key: true },
        Name: { dataType: 'string' },
        Desc: { dataType: 'string' }
    }, null);
    $data.Class.define('indexedDbProviderTest_Context', $data.EntityContext, null, {
        Persons: { dataType: $data.EntitySet, elementType: indexedDbProviderTest_Person }
    }, null);

    test('write_table_count_without_setTimeout', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        var context = new indexedDbProviderTest_Context(getProviderConfig());
        stop(1);
        context.onReady(function () {
            for (var i = 0; i < 10; i++) {

                var fn = function () {
                    var idx = i;
                    context.beginTransaction(true, function (tran) {
                        console.log("GetLength: " + idx);
                        context.Persons.length(function (result, tran2) {
                            deepEqual(tran2._objectId, tran._objectId, "Transaction error");
                            equal(result, idx, "Row count error");
                            context.Persons.add(new indexedDbProviderTest_Person({ Id: idx, Name: idx.toString() }));
                            console.log("Save: " + idx);
                            context.saveChanges({
                                success: function (count, tran3) {
                                    console.log("Saved: " + idx);
                                    deepEqual(tran3._objectId, tran._objectId, "Transaction3 error");
                                    deepEqual(tran3._objectId, tran2._objectId, "Tran3 - tran2 error");
                                    if (idx == 9) {
                                        context.beginTransaction(function (tran4) {
                                            context.Persons.toArray(function (result) {
                                                notDeepEqual(tran4._objectId, tran._objectId, "tran4 error");
                                                notDeepEqual(tran4._objectId, tran3._objectId, "tran4-tran3 error");
                                                notDeepEqual(tran4._objectId, tran2._objectId, "tran4-tran2 error");
                                                equal(result.length, 10, "Row count error");
                                                for (var j = 0; j < result.length; j++) {
                                                    equal(result[j].Name, j.toString(), "Name error");
                                                    equal(result[j].Id, j, "Id error");
                                                }
                                                closeDbIfNeeded(context);
                                                start();
                                            }, tran4);
                                        });
                                    }
                                },
                                error: function () {
                                    ok(false, "dbwrite error");
                                    closeDbIfNeeded(context);
                                    start();
                                }
                            }, tran2);
                        }, tran);
                    });
                };
                fn();
            }
        });
    });

    test('write_table_count_with_setTimeout', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        var context = new indexedDbProviderTest_Context(getProviderConfig());
        stop(1);
        context.onReady(function () {
            var fn = function (idx) {
                setTimeout(function () {
                    context.beginTransaction(true, function (tran) {
                        console.log("GetLength: " + idx);
                        context.Persons.length(function (result, tran2) {
                            equal(tran2._objectId, tran._objectId, "Transaction error");
                            equal(result, idx, "Row count error");
                            context.Persons.add(new indexedDbProviderTest_Person({ Id: idx, Name: idx.toString() }));
                            console.log("Save: " + idx);
                            context.saveChanges({
                                success: function (count, tran3) {
                                    console.log("Saved: " + idx);
                                    deepEqual(tran3._objectId, tran._objectId, "Transaction3 error");
                                    deepEqual(tran3._objectId, tran2._objectId, "Tran3 - tran2 error");
                                    if (idx == 9) {
                                        context.beginTransaction(function (tran4) {
                                            context.Persons.toArray(function (result) {
                                                notDeepEqual(tran4._objectId, tran._objectId, "tran4 error");
                                                notDeepEqual(tran4._objectId, tran3._objectId, "tran4-tran3 error");
                                                notDeepEqual(tran4._objectId, tran2._objectId, "tran4-tran2 error");
                                                equal(result.length, 10, "Row count error");
                                                for (var j = 0; j < result.length; j++) {
                                                    equal(result[j].Name, j.toString(), "Name error");
                                                    equal(result[j].Id, j, "Id error");
                                                }
                                                closeDbIfNeeded(context);
                                                start();
                                            }, tran4);
                                        });
                                    }
                                },
                                error: function () {
                                    ok(false, "dbwrite error");
                                    closeDbIfNeeded(context);
                                    start();
                                }
                            }, tran2);
                        }, tran);
                    });
                }, 0);
            };
            for (var i = 0; i < 10; i++) {
                fn(i);
            }
        });
    });

    test('singleKeyCRUD_external_tran', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        expect(4);
        var context = new indexedDbProviderTest_Context(getProviderConfig());
        stop(1);
        context.onReady(function () {
            context.beginTransaction(function (tran) {
                context.tran = tran
                context.Persons.toArray({
                    error: function () {
                        ok(false, 'empty db');
                        closeDbIfNeeded(context);
                        start();
                    },
                    success: function (result, tranBack) {
                        deepEqual(tranBack._objectId, tran._objectId, "In/Out transactions are not same after query!");
                        equal(result.length, 0, 'empty db');
                        var p = new indexedDbProviderTest_Person({ Id: 1, Name: 'user', Desc: 'some text' });
                        context.Persons.add(p);

                        context.beginTransaction(true, function (tran2) {
                            console.log("tran2 OK");
                            context.saveChanges({
                                success: function (result, tranBack2) {
                                    deepEqual(tranBack2._objectId, tran2._objectId, "In/Out transactions are not same after save!");
                                    ok(true, 'save');
                                    console.log(arguments);
                                    closeDbIfNeeded(context);
                                    start();
                                },
                                error: function () {
                                    ok(false, 'entity insert without id fail');
                                    closeDbIfNeeded(context);
                                    start();
                                }
                            }, tran2);
                        });

                    }
                }, tran);
            });
        });
    });

    test('singleKeyCRUD_same_tran', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

        expect(26);
        var context = new indexedDbProviderTest_Context(getProviderConfig());
        stop(1);
        context.onReady(function () {
            context.beginTransaction(true, function (tran) {
                context.Persons.toArray({
                    error: function (tran) {
                        ok(false, 'empty db');
                        closeDbIfNeeded(context);
                        start();
                    },
                    success: function (result, tran2) {
                        deepEqual(tran2._objectId, tran._objectId, 'transactions equality error');
                        equal(result.length, 0, 'empty db');
                        var p = new indexedDbProviderTest_Person({ Name: 'user', Desc: 'some text' });
                        equal(p.Id, undefined, 'id undefined');
                        context.Persons.add(p);
                        context.saveChanges({
                            success: function (count, tran3) {
                                deepEqual(tran3._objectId, tran._objectId, 'transactions equality error');
                                ok(false, 'entity insert without id fail');
                                closeDbIfNeeded(context);
                                start();
                            },
                            error: function (tran3) {
                                deepEqual(tran3._objectId, tran._objectId, 'transactions equality error');
                                ok(true, 'entity insert without id fail');
                                p.Id = 1;
                                context.saveChanges({
                                    error: function (tran4) {
                                        deepEqual(tran3._objectId, tran._objectId, 'transactions equality error');
                                        ok(false, 'entity insert with id success');
                                        closeDbIfNeeded(context);
                                        start();
                                    },
                                    success: function (changedItems, tran4) {
                                        notDeepEqual(tran4._objectId, tran._objectId, 'transactions equality error');
                                        equal(changedItems, 1, 'entity insert with id success');
                                        context.Persons.toArray({
                                            error: function (tran5) {
                                                deepEqual(tran5._objectId, tran4._objectId, 'transactions equality error');
                                                ok(false, 'entity query');
                                                closeDbIfNeeded(context);
                                                start();
                                            },
                                            success: function (result, tran5) {
                                                deepEqual(tran5._objectId, tran4._objectId, 'transactions equality error');
                                                equal(result.length, 1, 'entity query');
                                                p = result[0];
                                                equal(p.Id, 1, 'entity query');
                                                equal(p.Name, 'user', 'entity query');
                                                context.Persons.attach(p);
                                                p.Name = 'modifiedUser';
                                                context.saveChanges({
                                                    error: function (tran6) {
                                                        deepEqual(tran6._objectId, tran4._objectId, 'transactions equality error');
                                                        ok(false, 'entity update');
                                                        closeDbIfNeeded(context);
                                                        start();
                                                    },
                                                    success: function (changedItems, tran6) {
                                                        deepEqual(tran6._objectId, tran4._objectId, 'transactions equality error');
                                                        equal(changedItems, 1, 'entity update');
                                                        context.Persons.toArray({
                                                            error: function (tran7) {
                                                                deepEqual(tran7._objectId, tran4._objectId, 'transactions equality error');
                                                                ok(false, 'entity update');
                                                                closeDbIfNeeded(context);
                                                                start();
                                                            },
                                                            success: function (result, tran7) {
                                                                deepEqual(tran7._objectId, tran4._objectId, 'transactions equality error');
                                                                equal(result.length, 1, 'entity update');
                                                                p = result[0];
                                                                equal(p.Id, 1, 'entity update');
                                                                equal(p.Name, 'modifiedUser', 'entity update');
                                                                equal(p.Desc, 'some text', 'entity update');
                                                                context.Persons.attach(p);
                                                                p.Id = 2;
                                                                context.saveChanges({
                                                                    success: function (tran8) {
                                                                        notDeepEqual(tran8._objectId, tran4._objectId, 'transactions equality error');
                                                                        ok(false, 'invalid entity update fail');
                                                                        closeDbIfNeeded(context);
                                                                        start();
                                                                    },
                                                                    error: function (tran8) {
                                                                        notDeepEqual(tran8._objectId, tran4._objectId, 'transactions equality error');
                                                                        ok(true, 'invalid entity update fail');
                                                                        context.Persons.remove(p);
                                                                        context.saveChanges({
                                                                            success: function (tran9) {
                                                                                notDeepEqual(tran9._objectId, tran8._objectId, 'transactions equality error');
                                                                                ok(false, 'invalid entity delete fail');
                                                                                closeDbIfNeeded(context);
                                                                                start();
                                                                            },
                                                                            error: function (tran9) {
                                                                                notDeepEqual(tran9._objectId, tran8._objectId, 'transactions equality error');
                                                                                ok(true, 'invalid entity delete fail');
                                                                                p.Id = 1;
                                                                                context.saveChanges({
                                                                                    error: function (tran10) {
                                                                                        notDeepEqual(tran10._objectId, tran9._objectId, 'transactions equality error');
                                                                                        ok(false, 'entity delete');
                                                                                       
                                                                                    },
                                                                                    success: function (changedItems, tran10) {
                                                                                        notDeepEqual(tran10._objectId, tran9._objectId, 'transactions equality error');
                                                                                        equal(changedItems, 1, 'entity delete');
                                                                                        context.Persons.toArray({
                                                                                            error: function (tran11) {
                                                                                                deepEqual(tran11._objectId, tran10._objectId, 'transactions equality error');
                                                                                                ok(false, 'entity delete');
                                                                                                closeDbIfNeeded(context);
                                                                                                start();
                                                                                            },
                                                                                            success: function (result, tran11) {
                                                                                                deepEqual(tran11._objectId, tran10._objectId, 'transactions equality error');
                                                                                                equal(result.length, 0, 'entity delete');
                                                                                                closeDbIfNeeded(context);
                                                                                                start();
                                                                                            }
                                                                                        }, tran10);
                                                                                    }
                                                                                }, 'returnTransaction');
                                                                            }
                                                                        }, 'returnTransaction');
                                                                    }
                                                                });
                                                            }
                                                        }, tran6);
                                                    }
                                                }, tran5);
                                            }
                                        }, tran4);
                                    }
                                }, 'returnTransaction');
                            }
                        }, tran2);
                    }
                }, tran);
            });
        });
    });

    test('Abort_test', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }

        var context = new indexedDbProviderTest_Context(getProviderConfig());
        stop(1);
        context.onReady(function () {
            context.beginTransaction(true, function (tran) {

                context.Persons.toArray({
                    error: function (tran) {
                        ok(false, 'empty db');
                        closeDbIfNeeded(context);
                        start();
                    },
                    success: function (result, tran2) {
                        deepEqual(tran2._objectId, tran._objectId, 'transactions equality error');
                        equal(result.length, 0, 'empty db');
                        var p = new indexedDbProviderTest_Person({ Id: 1, Name: 'user', Desc: 'some text' });
                        context.Persons.add(p);

                        context.saveChanges({
                            success: function (count, tran3) {
                                deepEqual(tran3._objectId, tran._objectId, 'transactions equality error');
                                context.beginTransaction(true, function (tran4) {

                                    tran4.onerror.attach(function () {
                                        context.beginTransaction(function (tran7) {
                                            context.Persons.toArray({
                                                error: function (tran8) {
                                                    ok(false, "get data after abort error");
                                                    equal(tran8._objectId, tran7._objectId, "Tran error");
                                                    closeDbIfNeeded(context);
                                                    start();
                                                },
                                                success: function (result, tran8) {
                                                    equal(tran8._objectId, tran7._objectId, "Tran error");
                                                    equal(result.length, 1, "Data integrity error");
                                                    equal(result[0].Name, "user", "Date integrity 2 error");
                                                    closeDbIfNeeded(context);
                                                    start();
                                                }
                                            }, tran7);
                                        });
                                    });

                                    var p = new indexedDbProviderTest_Person({ Id: 2, Name: 'user2', Desc: 'some text' });
                                    context.Persons.add(p);
                                    context.saveChanges({
                                        success: function (count, tran5) {
                                            equal(tran5._objectId, tran4._objectId, "Tran error");
                                            context.Persons.toArray({
                                                error: function (tran6) {
                                                    ok(false, "get data error");
                                                    equal(tran6._objectId, tran5._objectId, "Tran error");
                                                    closeDbIfNeeded(context);
                                                    start();
                                                },
                                                success: function (result, tran6) {
                                                    equal(result.length, 2, "Data integrity error");
                                                    equal(result[0].Name, "user", "Date integrity 2 error");
                                                    equal(result[1].Name, "user2", "Date integrity 2 error");
                                                    ok(true, 'Uncaught Exception can be okay in WebSql');
                                                    tran6.abort();
                                                   

                                                }
                                            }, tran5);
                                        },
                                        error: function (tran5) {
                                            ok(false, "2nd change error");
                                            equal(tran5._objectId, tran4._objectId, "Tran error");
                                            closeDbIfNeeded(context);
                                            start();
                                        }
                                    }, tran4);
                                });
                            },
                            error: function (tran3) {
                                deepEqual(tran3._objectId, tran._objectId, 'transactions equality error');
                                ok(false, 'empty db');
                                closeDbIfNeeded(context);
                                start();
                            }
                        }, tran2);
                    }
                }, tran);
            });
        });
    });

    test('simple Abort test', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        stop(1);
        (new $news.Types.NewsContext(getProviderConfig())).onReady(function (db) {

            var cat = new $news.Types.Category({ Id: 1, Title: 'error onSave' });
            db.Categories.add(cat);
            //db.Categories.add(cat);

            db.beginTransaction(true, function (tran) {

               
                tran.oncomplete.attach(function () { console.log('-oncomplete', arguments); })
                tran.onerror.attach(function () {
                    console.log('-onabort', arguments);

                    db.Categories.toArray(function (res, tran3) {

                        equal(res.length, 0, 'rollback applied');
                        closeDbIfNeeded(db);
                        start();
                    });
                });


                db.saveChanges({
                    success: function (res, tran1) {

                        db.Categories.toArray({
                            success: function (res, tran2) {
                                ok(true, 'Uncaught Exception can be okay in WebSql');
                                tran2.abort();
                            },
                            error: function () {
                                ok(false, 'error handler called');
                            }
                        }, tran1);

                    },
                    error: function () {
                        ok(false, 'error handler called');
                    }
                }, tran);
            });
        });

    });

    test('simple Abort test promise', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        stop(1);
        (new $news.Types.NewsContext(getProviderConfig())).onReady(function (db) {

            var cat = new $news.Types.Category({ Id: 1, Title: 'error onSave' });
            db.Categories.add(cat);
            //db.Categories.add(cat);

            db.beginTransaction(true, function (tran) {

                
                tran.oncomplete.attach(function () { console.log('-oncomplete', arguments); })
                tran.onerror.attach(function () {
                    console.log('-onabort', arguments);

                    db.Categories.toArray(function (res, tran3) {

                        equal(res.length, 0, 'rollback applied');
                        closeDbIfNeeded(db);
                        start();
                    });
                });


                db.saveChanges({
                    success: function (res, tran1) {

                        db.Categories.toArray(undefined, tran1).then(function (res, tran2) {
                            ok(true, 'Uncaught Exception can be okay in WebSql');
                            tran2.abort();
                        }).fail(function () {
                            ok(false, 'error handler called');
                        });

                    },
                    error: function () {
                        ok(false, 'error handler called');
                    }
                }, tran);
            });
        });

    });

    test('insert_failed_test', 1, function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        expect(2);
        stop(1);
        (new $news.Types.NewsContext(getProviderConfig())).onReady(function (db) {

            var cat = new $news.Types.Category({ Id: 1, Title: 'Item1' });
            db.Categories.add(cat);
            var cat = new $news.Types.Category({ Id: 1, Title: 'Item2' });
            db.Categories.add(cat);

            db.beginTransaction(true, function (tran) {

                tran.oncomplete.attach(function () { console.log('-oncomplete', arguments); })
                tran.onerror.attach(function () {
                    console.log('-onerror', arguments);

                    db.Categories.toArray(function (res, tran3) {

                        equal(res.length, 0, 'rollback applied');
                        closeDbIfNeeded(db);
                        start();
                    });
                });


                db.saveChanges({
                    success: function (res, tran1) {
                        ok(false, 'error handler not called');
                    },
                    error: function (ex, promise) {
                        ok(true, 'error handler called');
                    }
                }, tran);
            });
        });

    });

    test('insert failed test promise', 1, function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        expect(2);
        stop(1);
        (new $news.Types.NewsContext(getProviderConfig())).onReady(function (db) {

            var cat = new $news.Types.Category({ Id: 1, Title: 'Item1' });
            db.Categories.add(cat);
            var cat = new $news.Types.Category({ Id: 1, Title: 'Item2' });
            db.Categories.add(cat);

            db.beginTransaction(true, function (tran) {

                tran.oncomplete.attach(function () { console.log('-oncomplete', arguments); })
                tran.onerror.attach(function () {
                    console.log("test", new Date().getTime());
                    console.log('-onerror', arguments);

                    db.Categories.toArray(function (res, tran3) {

                        equal(res.length, 0, 'rollback applied');
                        closeDbIfNeeded(db);
                        start();
                    });
                });


                db.saveChanges(undefined, tran).then(function (res, tran1) {
                    ok(false, 'error handler not called');
                }).fail(function () {
                    ok(true, 'promise error handler called');
                });
            });
        });

    });

    test('loadProperty with trans', 5, function () {
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Users.toArray(function (users, tran) {

                    db.Users.attach(users[0]);
                    var loadPropPromise = users[0].get_Articles(function (articles, tran1) {
                        equal(tran._objectId, tran1._objectId, 'transaction0-1 are equals');
                        ok(articles.length > 0, 'callback called');

                        db.loadItemProperty(users[0], 'Articles', function (articles1, tran2) {
                            equal(tran._objectId, tran2._objectId, 'transaction0-2 are equals');
                            equal(tran1._objectId, tran2._objectId, 'transaction1-2 are equals');
                            start(1);
                            ok(articles1.length > 0, 'callback called');
                            closeDbIfNeeded(db);
                        }, tran1);
                    }, tran);

                }, 'returnTransaction');

            });
        });

    });

    test('transaction command', function () {
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Users.toArray(function (users, tran) {
                    equal(tran instanceof $data.Transaction, true, 'transaction is avaliable');

                    ok(true, 'transaction is not returned is okay x1');
                    db.Users.toArray(function (users, tran) {
                        equal(typeof tran, 'undefined', 'transaction is not avaliable');
                        start();
                        closeDbIfNeeded(db);
                    }, 'other_value');

                }, 'returnTransaction');

                

            });
        });

    });

    test('begin transaction promise test', 3, function () {
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

                var tranPromise = db.beginTransaction(function () {
                    ok(true, 'beginTransaction callback called');
                });

                tranPromise.then(function (tran) {
                    ok(true, 'promise then called');
                    equal(tran instanceof $data.Transaction, true, 'promise has transaction value');
                    closeDbIfNeeded(db);
                    start();
                });

        });

    });

    test('begin transaction promise test just then', 2, function () {
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            var tranPromise = db.beginTransaction();

            tranPromise.then(function (tran) {
                ok(true, 'promise then called');
                equal(tran instanceof $data.Transaction, true, 'promise has transaction value');
                closeDbIfNeeded(db);
                start();
            });

        });

    });
};

function SimpleTransactionTests(providerConfig, msg) {
    msg = msg || '';
    module("Simple_Transactions_" + msg);
    function getProviderConfig() {
        return JSON.parse(JSON.stringify(providerConfig));
    }
    function closeDbIfNeeded(context) {
        if (context.storageProvider.db) {
            context.storageProvider.db.close();
        }
    }


    test('get transaction', 2, function () {
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            var tranPromise = db.beginTransaction();

            tranPromise.then(function (tran) {
                ok(true, 'promise then called');
                equal(tran instanceof $data.Transaction, true, 'promise has transaction value');
                closeDbIfNeeded(db);
                start();
            });

        });

    });

    test('returnTransaction toArray', 2, function () {
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            var promise = db.Categories.toArray(undefined, 'returnTransaction');

            promise.then(function (items, tran) {
                ok(true, 'promise then called');
                equal(tran instanceof $data.Transaction, true, 'promise has transaction value');
                closeDbIfNeeded(db);
                start();
            });

        });

    });

    test('returnTransaction empty saveChanges', 2, function () {
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            var promise = db.saveChanges(undefined, 'returnTransaction');

            promise.then(function (items, tran) {
                ok(true, 'promise then called');
                equal(tran instanceof $data.Transaction, true, 'promise has transaction value');
                closeDbIfNeeded(db);
                start();
            });

        });

    });

};