

$(document).ready(function () {
    if (!$data.StorageProviderLoader.isSupported('sqLite')) return;

	promiseTests({ name: "sqLite", databaseName: 'promiseTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
});

function promiseTests(providerConfig) {
    module("promise Tests");

    test('promise handler base - onReady', 3, function () {
        $data.PromiseHandler = $data.PromiseHandlerBase;

        stop(2);
        var readyPromise = (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start();
            equal(db instanceof $data.EntityContext, true, 'onready result failed')
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

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                stop(2);
                var loadPromise = db.Users.toArray(function (users) {
                    start();
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
        });

    });
    test('promise handler base - save', 3, function () {
        $data.PromiseHandler = $data.PromiseHandlerBase;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                stop(3);
                var loadPromise = db.Users.toArray(function (users) {
                    start();

                    db.Users.attach(users[0]);
                    users[0].LoginName = 'newLoginName';
                    var savePromise = db.saveChanges(function (r) {
                        start();
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
        });

    });
    test('promise handler base - loadProperty', 3, function () {
        $data.PromiseHandler = $data.PromiseHandlerBase;

        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                stop(3);
                var loadPromise = db.Users.toArray(function (users) {
                    start();

                    db.Users.attach(users[0]);
                    var loadPropPromise = users[0].get_Articles(function (articles) {
                        start();
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
        });

    });

    test('promise handler deferred - onReady', 12, function () {
        $data.PromiseHandler = $data.Deferred;

        var equalValue = undefined;
        stop(3);
        var readyPromise = (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start();
            equal(db instanceof $data.EntityContext, true, 'onready result failed')
            equal(db._isOK, true, 'context ready failed');

            equalValue = equalValue == undefined ? db.getType().name : equalValue;
            notEqual(equalValue, undefined, 'equalValue failed');
            equal(db.getType().name, equalValue, 'load failed');
        }).then(function (db) {
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
                });

            });
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
                    });

                });

            });
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
                    });

                });

            });
        });

    });
    test('promise handler deferred - wait', 4, function () {
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

                $.when(loadUserPromise, loadArticlePromise).then(function(users, articles){
                    start();
                    equal(users[0][0] instanceof $news.Types.User, true, 'users result item type failed');
                    equal(articles[0][0] instanceof $news.Types.Article, true, 'articles result item type failed');
                });
            });
        });

    });
};