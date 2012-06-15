
$(document).ready(function () {
	if (!$data.storageProviders.sqLite.SqLiteStorageProvider.isSupported) return;

	loadPropertyTests({ name: "sqLite", databaseName: 'loadPropertyTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables });
});

function loadPropertyTests(providerConfig) {
    module("loadProperty Tests");

    test('load property - simple', 5, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.toArray(function (articles) {
                    try {
                        start(1);
                        ok(true, 'article load fail');
                        equal(articles[0].Title, "Article1", 'Article title has invalid value');
                        articles[0].Title = undefined;
                        equal(articles[0].Title, undefined, 'Article title is not undefined');

                        stop(1);
                       db.loadItemProperty(articles[0], 'Title', function (title) {
                            start(1);
                            equal(title, "Article1", 'Article title has invalid value');
                        });

                        db.Articles.attach(articles[0]);
                        stop(1);
                        articles[0].get_Title({
                            success: function (title) {
                                start(1);
                                equal(title, "Article1", 'Article title has invalid value');
                            },
                            error: function (e) {
                                ok(false, "Unhandled exception occured ");
                                console.dir(e);
                                start(4);
                            }
                        });
                    } catch (e) {
                        ok(false, "Unhandled exception occured ");
                        console.dir(e);
                        start(4);
                    }

                });
            });
        });
    });

    test('load property - Nav property', 4, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.toArray(function (articles) {
                    try {
                        start(1);
                        ok(true, 'article load fail');
                        equal(typeof articles[0].Author, 'undefined', 'Article author not missing');

                        stop(1);
                        db.loadItemProperty(articles[0], 'Author', function (author) {
                            start(1);
                            equal(author instanceof $news.Types.User, true, 'author has wrong type');
                        });

                        db.Articles.attach(articles[0]);
                        stop(1);
                        articles[0].get_Author({
                            success: function (author) {
                                start(1);
                                equal(author instanceof $news.Types.User, true, 'author has wrong type');
                            },
                            error: function (e) {
                                ok(false, "Unhandled exception occured ");
                                console.dir(e);
                                start(4);
                            }
                        });
                    } catch (e) {
                        ok(false, "Unhandled exception occured ");
                        console.dir(e);
                        start(4);
                    }

                });
            });
        });
    });

    test('load property - many', 6, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Users.toArray(function (users) {
                    try {
                        start(1);
                        ok(true, 'article load fail');
                        equal(typeof users[0].Author, 'undefined', 'Article author not missing');

                        stop(1);
                        db.loadItemProperty(users[0], 'Articles', function (articles) {
                            start(1);
                            ok(articles.length > 0, 'result length is 0');
                            equal(articles[0] instanceof $news.Types.Article, true, 'article has wrong type');
                        });

                        db.Users.attach(users[0]);
                        stop(1);
                        users[0].get_Articles({
                            success: function (articles) {
                                start(1);
                                ok(articles.length > 0, 'result length is 0');
                                equal(articles[0] instanceof $news.Types.Article, true, 'article has wrong type');
                            },
                            error: function (e) {
                                ok(false, "Unhandled exception occured ");
                                console.dir(e);
                                start(4);
                            }
                        });
                    } catch (e) {
                        ok(false, "Unhandled exception occured ");
                        console.dir(e);
                        start(4);
                    }

                });
            });
        });
    });

};