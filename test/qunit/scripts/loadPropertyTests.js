
$(document).ready(function () {
    loadPropertyTests({ name: "oData", databaseName: 'loadPropertyTests', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'oData');

    if (!$data.StorageProviderLoader.isSupported('sqLite')) return;

    loadPropertyTests({ name: "sqLite", databaseName: 'loadPropertyTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'sqLite');
});

function loadPropertyTests(providerConfig, msg) {
    module("loadProperty_Tests_" + msg);

    test('load property - simple', 5, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.toArray(function (articles) {
                    try {
                        start(1);
                        ok(true, 'article load fail');
                        var refTitle = articles[0].Title;
                        equal(articles[0].Title, refTitle, 'Article title has invalid value');
                        articles[0].Title = undefined;
                        equal(articles[0].Title, undefined, 'Article title is not undefined');

                        stop(1);
                        db.loadItemProperty(articles[0], 'Title', function (title) {
                            start(1);
                            equal(title, refTitle, 'Article title has invalid value');
                        });

                        db.Articles.attach(articles[0]);
                        stop(1);
                        articles[0].get_Title({
                            success: function (title) {
                                start(1);
                                equal(title, refTitle, 'Article title has invalid value');
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

    test('load property - simple - no attach', 5, function () {
        stop(1);

        $data.Class.define("$news.Types.myCategory", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            Title: { type: "string" },
            Articles: { type: "Array", elementType: "$news.Types.myArticle", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$news.Types.myArticle", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            RowVersion: { type: $data.Blob, concurrencyMode: $data.ConcurrencyMode.Fixed },
            Title: { type: "string" },
            Lead: { type: "string" },
            Body: { type: "string" },
            CreateDate: { type: "datetime" },
            Thumbnail_LowRes: { type: "blob" },
            Thumbnail_HighRes: { type: "blob" },
            Category: { type: "$news.Types.myCategory", inverseProperty: "Articles" },
        }, null);

        $data.Class.define("$news.Types.myNewsContext", $data.EntityContext, null, {
            Categories: { type: $data.EntitySet, elementType: $news.Types.myCategory },
            Articles: { type: $data.EntitySet, elementType: $news.Types.myArticle }
        });

        (new $news.Types.NewsContext(providerConfig)).onReady(function (datadb) {
            $news.Types.NewsContext.generateTestData(datadb, function () {
                var cfg = JSON.parse(JSON.stringify(providerConfig));
                cfg.dbCreation = 0;
                (new $news.Types.myNewsContext(cfg)).onReady(function (db) {

                    db.Articles.toArray(function (articles) {
                        try {
                            start(1);
                            ok(true, 'article load fail');
                            var refTitle = articles[0].Title;
                            equal(articles[0].Title, refTitle, 'Article title has invalid value');
                            articles[0].Title = undefined;
                            equal(articles[0].Title, undefined, 'Article title is not undefined');

                            stop(1);
                            db.loadItemProperty(articles[0], 'Title', function (title) {
                                start(1);
                                equal(title, refTitle, 'Article title has invalid value');
                            });

                            //db.Articles.attach(articles[0]);
                            stop(1);
                            articles[0].get_Title({
                                success: function (title) {
                                    start(1);
                                    equal(title, refTitle, 'Article title has invalid value');
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
    });

    test('load property - Nav property - no attach', 5, function () {
        stop(1);
        $data.Class.define("$news.Types.myCategory", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            Title: { type: "string" },
            Articles: { type: "Array", elementType: "$news.Types.myArticle", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$news.Types.myArticle", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            RowVersion: { type: $data.Blob, concurrencyMode: $data.ConcurrencyMode.Fixed },
            Title: { type: "string" },
            Lead: { type: "string" },
            Body: { type: "string" },
            CreateDate: { type: "datetime" },
            Thumbnail_LowRes: { type: "blob" },
            Thumbnail_HighRes: { type: "blob" },
            Category: { type: "$news.Types.myCategory", inverseProperty: "Articles" },
        }, null);

        $data.Class.define("$news.Types.myNewsContext", $data.EntityContext, null, {
            Categories: { type: $data.EntitySet, elementType: $news.Types.myCategory },
            Articles: { type: $data.EntitySet, elementType: $news.Types.myArticle }
        });

        (new $news.Types.NewsContext(providerConfig)).onReady(function (datadb) {
            $news.Types.NewsContext.generateTestData(datadb, function () {
                var cfg = JSON.parse(JSON.stringify(providerConfig));
                cfg.dbCreation = 0;
                (new $news.Types.myNewsContext(cfg)).onReady(function (db) {
                    db.Articles.toArray(function (articles) {
                        try {
                            start(1);
                            ok(true, 'article load fail');
                            equal(typeof articles[0].Category, 'undefined', 'Article Category not missing');

                            stop(1);
                            db.loadItemProperty(articles[0], 'Category', function (cat) {
                                start(1);
                                equal(cat instanceof $news.Types.myCategory, true, 'Category has wrong type');
                            });

                            //db.Articles.attach(articles[0]);
                            stop(1);
                            articles[0].get_Category({
                                success: function (cat) {
                                    start(1);
                                    equal(cat instanceof $news.Types.myCategory, true, 'Category has wrong type');
                                    equal(typeof cat.Title, 'string', 'Category has wrong type');
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
    });

    test('load property - many', 6, function () {
        stop(1);
        $data.Class.define("$news.Types.myCategory", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            Title: { type: "string" },
            Articles: { type: "Array", elementType: "$news.Types.myArticle", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$news.Types.myArticle", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            RowVersion: { type: $data.Blob, concurrencyMode: $data.ConcurrencyMode.Fixed },
            Title: { type: "string" },
            Lead: { type: "string" },
            Body: { type: "string" },
            CreateDate: { type: "datetime" },
            Thumbnail_LowRes: { type: "blob" },
            Thumbnail_HighRes: { type: "blob" },
            Category: { type: "$news.Types.myCategory", inverseProperty: "Articles" },
        }, null);

        $data.Class.define("$news.Types.myNewsContext", $data.EntityContext, null, {
            Categories: { type: $data.EntitySet, elementType: $news.Types.myCategory },
            Articles: { type: $data.EntitySet, elementType: $news.Types.myArticle }
        });

        (new $news.Types.NewsContext(providerConfig)).onReady(function (datadb) {
            $news.Types.NewsContext.generateTestData(datadb, function () {
                var cfg = JSON.parse(JSON.stringify(providerConfig));
                cfg.dbCreation = 0;
                (new $news.Types.myNewsContext(cfg)).onReady(function (db) {
                    db.Categories.toArray(function (categories) {
                        try {
                            start(1);
                            ok(true, 'article load fail');
                            equal(typeof categories[0].Articles, 'undefined', 'Category Articles not missing');

                            stop(1);
                            db.loadItemProperty(categories[0], 'Articles', function (articles) {
                                start(1);
                                ok(articles.length > 0, 'result length is 0');
                                equal(articles[0] instanceof $news.Types.myArticle, true, 'Article has wrong type');
                            });

                            //db.Categories.attach(categories[0]);
                            stop(1);
                            categories[0].get_Articles({
                                success: function (articles) {
                                    start(1);
                                    ok(articles.length > 0, 'result length is 0');
                                    equal(articles[0] instanceof $news.Types.myArticle, true, 'Article has wrong type');
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
    });

    test('load property - from poco Instance', 5, function () {
        stop(1);
        $data.Class.define("$news.Types.myCategory", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            Title: { type: "string" },
            Articles: { type: "Array", elementType: "$news.Types.myArticle", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$news.Types.myArticle", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            RowVersion: { type: $data.Blob, concurrencyMode: $data.ConcurrencyMode.Fixed },
            Title: { type: "string" },
            Lead: { type: "string" },
            Body: { type: "string" },
            CreateDate: { type: "datetime" },
            Thumbnail_LowRes: { type: "blob" },
            Thumbnail_HighRes: { type: "blob" },
            Category: { type: "$news.Types.myCategory", inverseProperty: "Articles" },
        }, null);

        $data.Class.define("$news.Types.myNewsContext", $data.EntityContext, null, {
            Categories: { type: $data.EntitySet, elementType: $news.Types.myCategory },
            Articles: { type: $data.EntitySet, elementType: $news.Types.myArticle }
        });

        (new $news.Types.NewsContext(providerConfig)).onReady(function (datadb) {
            $news.Types.NewsContext.generateTestData(datadb, function () {
                var cfg = JSON.parse(JSON.stringify(providerConfig));
                cfg.dbCreation = 0;
                (new $news.Types.myNewsContext(cfg)).onReady(function (db) {
                    start(1);
                    var article = new $news.Types.myArticle({ Id: 1 });

                    try {
                        equal(typeof article.Title, 'undefined', 'Article Title not missing');

                        stop(1);
                        db.loadItemProperty(article, 'Title', function (title) {
                            start(1);
                            equal(typeof title, "string", 'title has wrong type');
                            equal(title.indexOf('Article') >= 0, true, 'title has wrong data');
                        });

                        stop(1);
                        article.get_Title({
                            success: function (title) {
                                start(1);
                                equal(typeof title, "string", 'title has wrong type');
                                equal(title.indexOf('Article') >= 0, true, 'title has wrong data');
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

    test('load property - from poco Instance - complex Type', 7, function () {
        stop(1);
        $data.Class.define("$news.Types.myUserProfile", $data.Entity, null, {
            Id: { type: "int", key: true, computed: true },
            FullName: { type: "string" },
            Bio: { type: "string" },
            Avatar: { type: "blob" },
            Location: { type: "$news.Types.myLocation" },
            Birthday: { type: "date" }
        }, null);
        $data.Class.define("$news.Types.myLocation", $data.Entity, null, {
            Address: { type: "string" },
            City: { type: "string" },
            Zip: { type: "int" },
            Country: { type: "string" }
        }, null);

        $data.Class.define("$news.Types.myNewsContext", $data.EntityContext, null, {
            UserProfiles: { type: $data.EntitySet, elementType: $news.Types.myUserProfile }
        });

        (new $news.Types.NewsContext(providerConfig)).onReady(function (datadb) {
            $news.Types.NewsContext.generateTestData(datadb, function () {
                var cfg = JSON.parse(JSON.stringify(providerConfig));
                cfg.dbCreation = 0;
                (new $news.Types.myNewsContext(cfg)).onReady(function (db) {
                    start(1);
                    var userprofile = new $news.Types.myUserProfile({ Id: 1 });

                    try {
                        equal(typeof userprofile.Location, 'undefined', 'userprofile Location not missing');

                        stop(1);
                        db.loadItemProperty(userprofile, 'Location', function (location) {
                            start(1);
                            equal(location instanceof $news.Types.myLocation, true, 'Location has wrong type');
                            equal(location.Zip > 0, true, 'Location has wrong data');
                            equal(typeof location.Address, 'string', 'Location has wrong data 2');
                        });

                        stop(1);
                        userprofile.get_Location({
                            success: function (location) {
                                start(1);
                                equal(location instanceof $news.Types.myLocation, true, 'Location has wrong type');
                                equal(location.Zip > 0, true, 'Location has wrong data');
                                equal(typeof location.Address, 'string', 'Location has wrong data 2');
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