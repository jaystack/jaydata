

$(document).ready(function () {
    if ($data.StorageProviderLoader.isSupported('sqLite')) {
        promiseTests({ name: "sqLite", databaseName: 'promiseTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_sqLite');
    }
    if ($data.StorageProviderLoader.isSupported('indexedDb')) {
        promiseTests({ name: "indexedDb", databaseName: 'promiseTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_indexedDb');
    }
});

function promiseTests(providerConfig, msg) {
    module("promise Tests" + msg);

    function closeDbIfNeeded(context) {
        if (context.storageProvider.db) {
            context.storageProvider.db.close();
        }
    }

    test('promise handler base - onReady', 3, function () {
        $data.PromiseHandler = $data.PromiseHandlerBase;

        stop(2);
        var readyPromise = (new $news.Types.NewsContext(providerConfig)).onReady({
            success: function (db) {
                start();
                closeDbIfNeeded(db);
                equal(db instanceof $data.EntityContext, true, 'onready result failed')
            },
            error: function (ex) {
                start();

                ok(false, ex);
            }
        });
        equal(readyPromise instanceof $data.Promise, true, 'promise type failed');

        try {
            readyPromise.then(function (r) { });
            ok(false, 'then not implemented');
        } catch (e) {
            start();
            equal(e.message, '$data.Promise.then', 'then not implemented');
        }

    });
    test('promise handler base - load', 3, function () {
        $data.PromiseHandler = $data.PromiseHandlerBase;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady({
            success: function (db) {
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);

                    stop(2);
                    var loadPromise = db.Users.toArray(function (users) {
                        start();
                        closeDbIfNeeded(db);
                        equal(users instanceof Array, true, 'load failed');
                    });
                    equal(loadPromise instanceof $data.Promise, true, 'promise type failed');

                    try {
                        loadPromise.then(function (r) { });
                        ok(false, 'then not implemented');
                    } catch (e) {
                        start();
                        equal(e.message, '$data.Promise.then', 'then not implemented');
                    }

                });
            },
            error: function (ex) {
                start();

                ok(false, ex);
            }
        });

    });
    test('promise handler base - save', 3, function () {
        $data.PromiseHandler = $data.PromiseHandlerBase;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady({
            success: function (db) {
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);

                    stop(3);
                    var loadPromise = db.Users.toArray(function (users) {
                        start();

                        db.Users.attach(users[0]);
                        users[0].LoginName = 'newLoginName';
                        var savePromise = db.saveChanges(function (r) {
                            start();
                            closeDbIfNeeded(db);
                            ok(true, 'callback called');
                        });
                        equal(savePromise instanceof $data.Promise, true, 'promise type failed');
                        try {
                            savePromise.then(function (r) { });
                            ok(false, 'then not implemented');
                        } catch (e) {
                            start();
                            equal(e.message, '$data.Promise.then', 'then not implemented');
                        }

                    });

                });
            },
            error: function (ex) {
                start();

                ok(false, ex);
            }
        });

    });
    test('promise handler base - loadProperty', 3, function () {
        $data.PromiseHandler = $data.PromiseHandlerBase;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady({
            success: function (db) {
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);

                    stop(3);
                    var loadPromise = db.Users.toArray(function (users) {
                        start();

                        db.Users.attach(users[0]);
                        var loadPropPromise = users[0].get_Articles(function (articles) {
                            start();
                            closeDbIfNeeded(db);
                            ok(articles.length > 0, 'callback called');
                        });
                        equal(loadPropPromise instanceof $data.Promise, true, 'promise type failed');
                        try {
                            loadPropPromise.then(function (r) { });
                            ok(false, 'then not implemented');
                        } catch (e) {
                            start();
                            equal(e.message, '$data.Promise.then', 'then not implemented');
                        }

                    });

                });
            },
            error: function (ex) {
                start();

                ok(false, ex);
            }
        });

    });

    test('promise handler deferred - onReady', 12, function () {
        $data.PromiseHandler = $data.Deferred;

        var equalValue = undefined;
        stop(3);
        var readyPromise = (new $news.Types.NewsContext(providerConfig))
        .onReady(function (db) {
            start();
            equal(db instanceof $data.EntityContext, true, 'onready result failed')
            equal(db._isOK, true, 'context ready failed');

            equalValue = equalValue == undefined ? db.getType().name : equalValue;
            notEqual(equalValue, undefined, 'equalValue failed');
            equal(db.getType().name, equalValue, 'load failed');
        })
        .fail(function (ex) {
            start(3);
            
            ok(false, ex);
        })
        .then(function (db) {
            start();
            equal(db instanceof $data.EntityContext, true, 'onready result then failed')
            equal(db._isOK, true, 'context ready then failed');

            equalValue = equalValue == undefined ? db.getType().name : equalValue;
            notEqual(equalValue, undefined, 'equalValue then failed');
            equal(db.getType().name, equalValue, 'load then failed');

            return db;
        });

        readyPromise.then(function (db) {
            start();
            equal(db instanceof $data.EntityContext, true, 'onready result then2 failed')
            equal(db._isOK, true, 'context ready then2 failed');

            equalValue = equalValue == undefined ? db.getType().name : equalValue;
            notEqual(equalValue, undefined, 'equalValue then2 failed');
            equal(db.getType().name, equalValue, 'load then2 failed');
            closeDbIfNeeded(db);
        });

    });
    test('promise handler deferred - load', 10, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(3);
                var loadPromise = db.Users.toArray(function (users) {
                    start();
                    equal(users instanceof Array, true, 'load failed');

                    equalValue = equalValue == undefined ? users[0].LoginName : equalValue;
                    notEqual(equalValue, undefined, 'equalValue failed');
                    equal(users[0].LoginName, equalValue, 'load failed');
                });
                notEqual(loadPromise instanceof $data.Promise, true, 'promise type failed');

                loadPromise.then(function (users) {
                    start();
                    equal(users instanceof Array, true, 'load then failed');

                    equalValue = equalValue == undefined ? users[0].LoginName : equalValue;
                    notEqual(equalValue, undefined, 'equalValue then failed');
                    equal(users[0].LoginName, equalValue, 'load then failed');

                    return users;
                })
                .then(function (users) {
                    start();
                    equal(users instanceof Array, true, 'load then2 failed');

                    equalValue = equalValue == undefined ? users[0].LoginName : equalValue;
                    notEqual(equalValue, undefined, 'equalValue then2 failed');
                    equal(users[0].LoginName, equalValue, 'load then2 failed');
                    closeDbIfNeeded(db);
                });

            });
        }).fail(function (ex) {
            start(1);
            
            ok(false, ex);
        });

    });
    test('promise handler deferred - save', 5, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(2);
                var loadPromise = db.Users.toArray(function (users) {
                    start();

                    db.Users.attach(users[0]);
                    users[0].LoginName = 'newLoginName';
                    var savePromise = db.saveChanges(function (result) {
                        start();

                        equalValue = equalValue == undefined ? result : equalValue;
                        notEqual(equalValue, undefined, 'equalValue failed');
                        equal(result, equalValue, 'load failed');
                    });
                    notEqual(loadPromise instanceof $data.Promise, true, 'promise type failed');

                    savePromise.then(function (result) {
                        start();

                        equalValue = equalValue == undefined ? result : equalValue;
                        notEqual(equalValue, undefined, 'equalValue then failed');
                        equal(result, equalValue, 'load then failed');
                        closeDbIfNeeded(db);
                    });

                });

            });
        }).fail(function (ex) {
            start(1);
            
            ok(false, ex);
        });

    });
    test('promise handler deferred - loadProperty', 6, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(2);
                var loadPromise = db.Users.toArray(function (users) {
                    start();

                    db.Users.attach(users[0]);
                    users[0].get_Articles(function (articles) {
                        start();
                        equal(articles instanceof Array, true, 'load failed');

                        equalValue = equalValue == undefined ? articles[0].Title : equalValue;
                        notEqual(equalValue, undefined, 'equalValue failed');
                        equal(articles[0].Title, equalValue, 'load failed');
                    }).then(function (articles) {
                        start();
                        equal(articles instanceof Array, true, 'load then failed');

                        equalValue = equalValue == undefined ? articles[0].Title : equalValue;
                        notEqual(equalValue, undefined, 'equalValue then failed');
                        equal(articles[0].Title, equalValue, 'load then failed');
                        closeDbIfNeeded(db);
                    });

                });

            });
        }).fail(function (ex) {
            start(1);
            
            ok(false, ex);
        });

    });

    test('promise handler deferred - wait toArray with trans', 6, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(3);
                var loadUserPromise = db.Users.toArray(function (users) {
                    start();
                    ok(users.length > 0, 'user load fail');
                }, 'returnTransaction');
                var loadArticlePromise = db.Articles.toArray(function (articles) {
                    start();
                    ok(articles.length > 0, 'articles load fail');
                }, 'returnTransaction');

                $.when(loadUserPromise, loadArticlePromise).then(function (users, articles) {
                    start();
                    equal(users[0][0] instanceof $news.Types.User, true, 'users result item type failed');
                    equal(users[1] instanceof $data.Transaction, true, 'users trans returned');
                    equal(articles[0][0] instanceof $news.Types.Article, true, 'articles result item type failed');
                    equal(articles[1] instanceof $data.Transaction, true, 'articles trans returned');
                    closeDbIfNeeded(db);
                });
            });
        }).fail(function (ex) {
            start(1);
            
            ok(false, ex);
        });

    });
    
    test('promise handler deferred - wait save', 4, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(3);

                var cat = new db.Categories.elementType({ Title: 'cat' });
                db.Categories.add(cat);
                var savePromise = db.saveChanges(function (res) {
                    start();
                    equal(arguments.length, 1, 'argument length failed');
                });

                var loadArticleCntPromise = db.Articles.length(function (cnt) {
                    start();
                    equal(typeof cnt, 'number', 'articles count fail');
                });

                $.when(savePromise, loadArticleCntPromise).then(function (saveres, cnt) {
                    start();
                    equal(typeof saveres, 'number', 'savePromise value fail');
                    equal(typeof cnt, 'number', 'articles count fail');
                    closeDbIfNeeded(db);
                });
            });
        }).fail(function (ex) {
            start(1);
            
            ok(false, ex);
        });

    });

    test('promise handler deferred - wait save empty', 4, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(3);

                var savePromise = db.saveChanges(function (res) {
                    start();
                    equal(arguments.length, 1, 'argument length failed');
                });

                var loadArticleCntPromise = db.Articles.length(function (cnt) {
                    start();
                    equal(typeof cnt, 'number', 'articles count fail');
                });

                $.when(savePromise, loadArticleCntPromise).then(function (saveres, cnt) {
                    start();
                    equal(typeof saveres, 'number', 'savePromise value fail');
                    equal(typeof cnt, 'number', 'articles count fail');
                    closeDbIfNeeded(db);
                });
            });
        }).fail(function (ex) {
            start(1);
            
            ok(false, ex);
        });

    });

    test('promise handler deferred - wait toArray / length', 4, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(3);
                var loadUserPromise = db.Users.toArray(function (users) {
                    start();
                    ok(users.length > 0, 'user load fail');
                });
                var loadArticleCntPromise = db.Articles.length(function (cnt) {
                    start();
                    equal(typeof cnt, 'number', 'articles count fail');
                });

                $.when(loadUserPromise, loadArticleCntPromise).then(function (users, cnt) {
                    start();
                    equal(users[0] instanceof $news.Types.User, true, 'users result item type failed');
                    equal(typeof cnt, 'number', 'articles count fail');
                    closeDbIfNeeded(db);
                });
            });
        }).fail(function (ex) {
            start(1);

            ok(false, ex);
        });

    });

    test('promise handler deferred - wait toArray', 4, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(3);
                var loadUserPromise = db.Users.toArray(function (users) {
                    start();
                    ok(users.length > 0, 'user load fail');
                });
                var loadArticlePromise = db.Articles.toArray(function (articles) {
                    start();
                    ok(articles.length > 0, 'articles load fail');
                });

                $.when(loadUserPromise, loadArticlePromise).then(function (users, articles) {
                    start();
                    equal(users[0] instanceof $news.Types.User, true, 'users result item type failed');
                    equal(articles[0] instanceof $news.Types.Article, true, 'articles result item type failed');
                    closeDbIfNeeded(db);
                });
            });
        }).fail(function (ex) {
            start(1);

            ok(false, ex);
        });

    });

    test('promise handler deferred - wait single / first', 4, function () {
        $data.PromiseHandler = $data.Deferred;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var equalValue = undefined;
                stop(3);
                var loadUserPromise = db.Users.first(null, null, function (user) {
                    start();
                    equal(user instanceof $news.Types.User, true, 'user result item type failed');

                });
                var loadArticlePromise = db.Articles.single('it.Id == 1', null,function (article) {
                    start();
                    equal(article instanceof $news.Types.Article, true, 'articles result item type failed');
                });

                $.when(loadUserPromise, loadArticlePromise).then(function (user, article) {
                    start();
                    equal(user instanceof $news.Types.User, true, 'user result item type failed');
                    equal(article instanceof $news.Types.Article, true, 'articles result item type failed');
                    closeDbIfNeeded(db);
                });
            });
        }).fail(function (ex) {
            start(1);

            ok(false, ex);
        });

    });
};