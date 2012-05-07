function EntityContextTests(providerConfig, msg) {
    msg = msg || '';
    module("BugFix" + msg);
    test('1003_even if a simple field is projected an Article is returned', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.map(function (a) { return a.Title });
                    q.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        equal(typeof a[0], 'string', 'result type failed');
                    });
                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test1', 4, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q1 = db.Articles.map(function (a) { return { t: a.Title, i: a.Id }; });
                    q1.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        equal(a[0] instanceof Object, true, 'result type failed');
                        equal(typeof a[0].t, 'string', 'result type failed');
                        equal(typeof a[0].i, 'number', 'result type failed');
                    });
                });

            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test2', 3, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q2 = db.Articles.map(function (a) { return a.Author; });
                    console.dir(q2.toTraceString());
                    q2.toArray(function (a) {
                        start(1);
                        console.dir(a);
                        equal(a[0] instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].LoginName, 'string', 'result type failed');
                        equal(typeof a[0].Id, 'number', 'result type failed');
                    });
                });


            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test3', 6, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q3 = db.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author }; });
                    q3.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        notEqual(a[0] instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].Title, 'string', 'result type failed');
                        equal(a[0].Auth instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].Auth.LoginName, 'string', 'result type faild');
                        notEqual(a[0].Auth.LoginName.length, 0, 'login name not fill');
                    });
                });
            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test4', 11, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q3 = db.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author, Prof: a.Author.Profile, Z: a.Author.Profile.Bio, k: a.Author.LoginName }; });

                    q3.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        notEqual(a[0] instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].Title, 'string', 'result type failed');
                        equal(a[0].Auth instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].Auth.LoginName, 'string', 'result type faild');
                        notEqual(a[0].Auth.LoginName.length, 0, 'login name not fill');
                        equal(a[0].Prof instanceof $news.Types.UserProfile, true, "result type faild");
                        equal(typeof a[0].Prof.Bio, 'string', 'result type faild');
                        equal(typeof a[0].Z, 'string', 'result type faild');
                        equal(a[0].Z, a[0].Prof.Bio, 'result type faild');
                        equal(typeof a[0].k, "string", "result type faild");
                    });
                });
            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test5', 3, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q2 = db.Articles.map(function (a) { return a.Author.Profile; });
                    q2.toArray(function (a) {
                        start(1);
                        equal(a[0] instanceof $news.Types.UserProfile, true, 'result type failed');
                        equal(typeof a[0].Bio, 'string', 'result type failed');
                        equal(typeof a[0].Id, 'number', 'result type failed');
                    });
                });


            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test6', 5, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q2 = db.Articles.filter(function (a) { return a.Category.Id == 1; }, null).map(function (a) { return { Title: a.Title, LoginName: a.Author.LoginName }; });
                    q2.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.UserProfile, true, 'result type failed');
                        equal(typeof a[0].Title, 'string', 'Title filed type faild');
                        ok(a[0].Title.length > 0, 'Title field value error');
                        equal(typeof a[0].LoginName, 'string', 'LoginName filed type faild');
                        ok(a[0].LoginName.length > 0, 'LoginName field value error');
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1002_even if map is used with anon type an Article is returned', 3, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    db.Articles.map(function (a) { return { T: a.Title } }).toArray(function (a) {
                        start(1);
                        equal(a[0] instanceof $news.Types.Article, false, 'result type failed');
                        equal(typeof a[0], 'object', 'result type failed');
                        equal(typeof a[0].T, 'string', 'result type property failed');
                    });
                });
            } catch (ex) {
                start(1);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1002_even if map is used with anon type an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1001_Article CreateDate comes bac Invalid date', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    db.Articles.toArray(function (a) {
                        start(1);
                        equal(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        notEqual(a[0].CreateDate.valueOf(), NaN, 'datetime value failed');
                    });
                });
            } catch (ex) {
                start(1);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1001_Article CreateDate comes bac Invalid date: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1048_ODATA attach -> saveChanges error', 1, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);


                    db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                        start(1);
                        if (result.length) {
                            var save = result[0];
                            db.Articles.attach(save);
                            save.Title = 'alma';
                            save.Lead = 'alma';
                            save.Body = 'alma';
                            //db.Articles.attach(save);
                            db.saveChanges(function (count) {
                                start(1);
                                equal(count, 1, "save error");
                            });
                        }
                    });
                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1048_ODATA delete -> saveChanges error', 1, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);


                    db.UserProfiles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                        start(1);
                        if (result.length) {
                            var save = result[0];
                            db.UserProfiles.remove(save);
                            db.saveChanges(function (count) {
                                start(1);
                                equal(count, 1, "save error");
                            });
                        }
                    });
                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1038_Include complex type property', 7, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.where(function (item) { return item.Id == this.id }, { id: 1 })
                           .select(function (item) {
                               return {
                                   Title: item.Title,
                                   Lead: item.Lead,
                                   Body: item.Body,
                                   CreateDate: item.CreateDate,
                                   Author: {
                                       Profile: item.Author.Profile //Location hiányzik
                                   },
                                   CmpType: item.Author.Profile
                               };
                           });
                    var meta = q.toTraceString();
                    console.dir(meta);
                    q.toArray(function (result) {
                        start(1);
                        console.dir(result);
                        ok(result, 'Query OK');
                        equal(result.length, 1, 'Result nnumber fiaild');

                        notEqual(result[0].Author instanceof $news.Types.UserProfile, true, 'Author type loading faild');
                        equal(result[0].Author.Profile instanceof $news.Types.UserProfile, true, 'Author.Profile type loading faild');

                        equal(result[0].CmpType instanceof $news.Types.UserProfile, true, 'Profile type loading faild');
                        equal(result[0].CmpType.Location instanceof $news.Types.Location, true, 'Profile.Location type loading faild');
                    });
                    ok(true);

                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    //test('1038_additional_tests_1', 2, function () {
    //    stop(3);
    //    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //        try {
    //            start(1);
    //            $news.Types.NewsContext.generateTestData(db, function () {
    //                start(1);
    //                var q = db.Articles.where(function (item) { return item.Id == this.id }, { id: 1 })
    //                       .select(function (item) {
    //                           return {
    //                               a: {
    //                                   b: {
    //                                       c: {
    //                                           d: item.Title
    //                                       }
    //                                   }
    //                               },
    //                           };
    //                       });
    //                var meta = q.toTraceString();
    //                console.dir(meta);
    //                q.toArray(function (result) {
    //                    start(1);
    //                    console.dir(result);
    //                    ok(result, 'Query OK');
    //                    equal(result.length, 1, 'Result nnumber fiaild');

    //                    equal(typeof result[0], "object", 'object structure build');
    //                    equal(typeof result[0].a, "object", 'object structure build (a)');
    //                    equal(typeof result[0].a.b, "object", 'object structure build (a.b)');
    //                    equal(typeof result[0].a.b.c, "object", 'object structure build (a.b.c)');
    //                    equal(typeof result[0].a.b.c.d, "string", 'object structure build (a.b.c.d)');
    //                    ok(result[0].a.b.c.d.length > 0, 'Complex type loading faild');

    //                });
    //                ok(true);

    //            });

    //        } catch (ex) {
    //            start(4);
    //            ok(false, "Unhandled exception occured");
    //            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
    //            console.dir(ex);
    //            console.log(" ===--");
    //        }
    //    });
    //});
    test('978_create article with inline category fails', 3, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var a = new $news.Types.Article({ Title: "asdads", Category: new $news.Types.Category({ Title: "CatX" }) });
                    db.Articles.add(a);
                    db.saveChanges(function (count) {
                        start(1);
                        equal(count, 2, "Saved entity count faild");
                        equal(a.Id, 27, 'Article Id faild');
                        equal(a.Category.Id, 6, "category Id faild");
                    });
                });
            } catch (ex) {
                start(1);
                ok(false, "Unhandled exception occured");
                console.log("--=== 978_create article with inline category fails: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('977_adding new articles with category ends up in error', 3, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Categories.filter(function (a) { return a.Id == 1; }).toArray(function (a) {
                    start(1);
                    var cat = a[0];
                    ok(cat instanceof $news.Types.Category, "Return value do not a category instance");
                    //db.Categories.attach(cat);
                    for (var i = 0; i < 100; i++) {
                        var art = new $news.Types.Article({ Title: 'Arti' + i, Category: cat });
                        db.Articles.add(art);
                    }
                    db.saveChanges(function (count) {
                        start(1);
                        equal(count, 100, "Saved item count faild");
                    });
                });
            });
        });
    });
    test('976_updating entity will result in cleared out fields in db', 6, function () {
        stop(5);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Articles.filter(function (a) { return a.Id == 1; }).toArray(function (a) {
                    start(1);
                    var art = a[0];
                    ok(art instanceof $news.Types.Article, "Return value do not an article instance");
                    ok(art.Title.length > 0, "Article title faild");

                    db.Articles.attach(art);
                    art.Title = "zpace";
                    var pin_ArticleInitData = JSON.parse(JSON.stringify(art.initData));

                    db.saveChanges(function (count) {
                        start(1);
                        equal(count, 1, "Saved item count faild");
                        db.Articles.filter(function (a) { return a.Id == 1; }).toArray(function (uArticles) {
                            start(1);
                            var uArticle = uArticles[0];
                            ok(uArticle instanceof $news.Types.Article, "Return value do not an article instance");
                            var pin_uArticleInitData = JSON.parse(JSON.stringify(uArticle.initData));
                            deepEqual(pin_uArticleInitData, pin_ArticleInitData, "Article saved faild");
                        });
                    });
                });
            });
        });
    });
    test("974_Projection of Navigational property return a typed entity result but it's init data is empty", 4, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return { T: a.Title, A: a.Author } });
                q.toArray(function (articles) {
                    start(1);
                    equal(articles.length, 26, "Article count faild");
                    ok(articles[0].T.length > 0, "Article1", "1st article title field faild");
                    ok(articles[0].A instanceof $news.Types.User, "1st article Author field faild");
                });

            });
        });
    });
    test("975_Complex type projections - illegal instruction", 4, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return { T: a.Title, A: a.Author.Profile.Location } });
                q.toArray({
                    success: function (articles) {
                        start(1);
                        equal(articles.length, 26, "Article count faild");
                        ok(articles[0].T.length > 0, "Article1", "1st article title field faild");
                        ok(articles[0].A instanceof $news.Types.Location, "1st article Author field faild");
                    },
                    error: function (error) {
                        start(1);
                        console.dir(error);
                        ok(false, 'Query erroro!');
                    }
                });

            });
        });
    });
    //test("XXX_Projection_scalar_with_function_call", 3, function () {
    //    stop(3);
    //    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //        start(1);
    //        ok(db, 'Databse generation faild');
    //        $news.Types.NewsContext.generateTestData(db, function () {
    //            start(1);
    //            var q = db.Articles.filter(function (a) { return a.Id == 1; }, null).map(function (a) { return a.Title.toLowerCase(); });
    //            q.toArray(function (articles) {
    //                start(1);
    //                console.dir(articles);
    //                equal(articles.length, 1, "Article count faild");
    //                equal(articles[0], "article1", "1st article title field faild");
    //            });

    //        });
    //    });
    //});
    //test('973_Complex types filter - illegal instruction exceptions', 3, function () {
    //    stop(3);
    //    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //        $news.alma = db;
    //        start(1);
    //        ok(db, 'Databse generation faild');
    //        $news.Types.NewsContext.generateTestData(db, function () {
    //            start(1);
    //            var q = db.Articles.filter(function (a) { return a.Author.Profile.Location.Zip == 1115 });
    //            q.toArray(function (articles) {
    //                start(1);
    //                ok(articles, 'Query run success');
    //                equal(articles.length, 5, 'Faild query');
    //            });
    //        });
    //    });
    //});
    test('1012_websql provider - Projected Navigational properties are incorrect.', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);

                    var q = db.Articles.map(function (a) { return { T: a.Title, AuthorID: a.Author.Id, A: a.Author } });
                    q.toArray(function (article) {
                        console.dir(article);
                        start(1);
                        equal(article.length, 26, 'Not all articles loaded');
                        equal(typeof article[0].T, 'string', "result type faild");
                        equal(typeof article[0].AuthorID, 'number', "category filed not loaded");
                        ok(article[0].A instanceof $news.Types.User, "category filed not loaded");
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1024_ODATA projection of complex type does not get values', 3, function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); ok(true, "Not supported"); ok(true, "Not supported"); return; }
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.map(function (a) { a.Author.Profile.Location }).include("Author.Profile");
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Location, true, "result type faild");
                        equal(typeof article[0].Zip, 'number', "result type faild");
                        equal(typeof article[0].City, 'string', "result type faild");
                    });
                });

            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1023_OData include does not include', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.include("Category");
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        notEqual(article[0].Category, undefined, "category filed not loaded");
                        equal(typeof article[0].Category.Title, 'string', 'Category title type faild');
                        ok(article[0].Category.Title.length > 0, 'Category title not loaded');
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1023_additional_test_1', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(6);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.include("Author.Profile");
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        equal(article[0].Category, undefined, "category filed not loaded");

                        notEqual(article[0].Author, undefined, "category filed not loaded");
                        notEqual(article[0].Author.Profile, undefined, "category filed not loaded");

                        equal(typeof article[0].Author.Profile.Bio, 'string', 'Category title type faild');
                        ok(article[0].Author.Profile.Bio.length > 0, 'Category title type faild');
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1023_additional_test_2', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(14);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.include("Author").include("Author.Profile").include("Reviewer.Profile");
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        equal(article[0].Category, undefined, "category filed not loaded");

                        equal(article[0].Author instanceof $news.Types.User, true, "result type faild");
                        notEqual(article[0].Author, undefined, "category filed not loaded");
                        equal(article[0].Author.Profile instanceof $news.Types.UserProfile, true, "result type faild");
                        notEqual(article[0].Author.Profile, undefined, "category filed not loaded");
                        equal(typeof article[0].Author.Profile.Bio, 'string', 'Category title type faild');
                        ok(article[0].Author.Profile.Bio.length > 0, 'Category title type faild');

                        notEqual(article[0].Reviewer, undefined, "Reviewer filed not loaded");
                        equal(article[0].Reviewer instanceof $news.Types.User, true, "Reviewer type faild");
                        notEqual(article[0].Reviewer.Profile, undefined, "Reviewer.Profile filed not loaded");
                        equal(article[0].Reviewer.Profile instanceof $news.Types.UserProfile, true, "Reviewer.Profile type faild");

                        equal(typeof article[0].Reviewer.Profile.Bio, 'string', 'Category title type faild');
                        ok(article[0].Reviewer.Profile.Bio.length > 0, 'Category title type faild');
                    });
                });

            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1032_ODATA: order by complex type field', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Users.orderBy(function (item) { return item.Profile.FullName; });
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.User, true, "result type faild");
                        ok(article[0].LoginName.length > 0, "category filed not loaded");
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1032_additional_test_1', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.orderBy(function (item) { return item.Author.Profile.FullName; });
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        ok(article[0].Title.length > 0, "category filed not loaded");
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1032_additional_test_2', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.orderBy(function (item) { return item.Author.Profile.Location.City; });
                    console.dir(q.toTraceString());
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        ok(article[0].Title.length > 0, "category filed not loaded");
                    });
                });
            } catch (ex) {
                start(3);
                ok(false, "Unhandled exception occured");
                console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1067_ID_field_not_write_back', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        //expect(4);
        stop(6);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Categories
				.filter(function (item) { return item.Id == this.id; }, { id: 1 })
				.toArray(function (result) {
				    start(1);
				    var category = result[0];
				    var articleEntity = new $news.Types.Article({
				        Title: 'temp',
				        Lead: 'temp',
				        Body: 'temp',
				        Category: category
				    });

				    db.Articles.add(articleEntity);
				    db.saveChanges(function () {
				        start(1);
				        var tags = 'temp'.split(',');
				        db.Tags
						.filter(function (item) { return item.Title in this.tags; }, { tags: tags })
						.toArray(function (result) {
						    start(1);

						    var existing = [];
						    for (var i = 0; i < result.length; i++) {
						        existing.push(result[i].Title);
						    }
						    for (var i = 0; i < tags.length; i++) {
						        var t = tags[i];
						        if (existing.indexOf(t) < 0) {
						            db.TagConnections.add(new $news.Types.TagConnection({ Article: articleEntity, Tag: new $news.Types.Tag({ Title: t }) }));
						        } else {
						            db.Tags.attach(result[i]);
						            db.TagConnections.add(new $news.Types.TagConnection({ Article: articleEntity, Tag: result[i] }));
						        }
						    }
						    db.Articles.attach(articleEntity);
						    db.saveChanges(function () {
						        start(1);
						        equal(articleEntity.Id, 27, 'Article Id faild');
						        console.log('Article ID: ' + articleEntity.Id);
						    });
						});
				    });
				});
            });
        });
    });
    test('DANI_CategoryModify', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(5);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
                db.Articles.first(function (a) { return a.Id == 4 }, null, function (article) {
                    start(1);
                    db.Articles.attach(article);
                    article.Title = "élhklkjhlkjhkhl";
                    var cat = new $news.Types.Category({ Id: 5 });
                    db.Categories.attach(cat);
                    article.Category = cat;
                    db.saveChanges(function () {
                        start(1);
                        db.Articles.include('Category').first(function (a) { return a.Id == 4 }, null, function (article2) {
                            start(1);
                            ok(article2.Category instanceof $news.Types.Category, 'faild');
                        });
                    });
                }); 
            });
        });
    });
    test('XXXX_navigation_property_handling', function () {
        ok(true);
    });
    //test("get_mapped_custom", 24, function () {
    //    stop(4);
    //    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //        start();
    //        ok(db, "Db create faild");
    //        try {
    //            start();
    //            $news.Types.NewsContext.generateTestData(db, function () {
    //                start();
    //                var q = db.Articles.map(function (m) {
    //                    return {
    //                        a: m.Title,
    //                        Author: m.Title,
    //                        Tags: { Title: m.Title },
    //                        Reviewer: m.Author.Profile,
    //                        b: { a: m.Author.Profile.FullName, b: m.Author.LoginName/*, c: m.Author.Profile.Location*/ }
    //                    }
    //                });
    //                //console.dir(q.toTraceString());
    //                q.toArray({
    //                    success: function (r) {
    //                        start();
    //                        var m = r[0];
    //                        console.dir(r);
    //                        equal(typeof m.a, 'string', 'a');
    //                        equal(typeof m.Author, 'string', 'Author');
    //                        equal(m.Tags instanceof Object, true, 'Tags');
    //                        equal(typeof m.Tags.Title, 'string', 'Tags.Title');
    //                        equal(m.Reviewer instanceof $news.Types.UserProfile, true, 'Reviewer');
    //                        equal(typeof m.Reviewer.Id, 'number', 'Reviewer.Id');
    //                        equal(typeof m.Reviewer.FullName, 'string', 'Reviewer.FullName');
    //                        equal(typeof m.Reviewer.Bio, 'string', 'Reviewer.Bio');
    //                        equal(m.Reviewer.Avatar instanceof Object, true, 'Reviewer.Avatar');
    //                        equal(m.Reviewer.Location instanceof $news.Types.Location, true, 'Reviewer.Location');
    //                        equal(typeof m.Reviewer.Location.Address, 'string', 'Reviewer.Location.Address');
    //                        equal(typeof m.Reviewer.Location.City, 'string', 'Reviewer.Location.City');
    //                        equal(typeof m.Reviewer.Location.Zip, 'number', 'Reviewer.Location.Zip');
    //                        equal(typeof m.Reviewer.Location.Country, 'string', 'Reviewer.Location.Country');
    //                        equal(m.Reviewer.Birthday instanceof Date, true, 'Reviewer.Birthday');
    //                        //equal(m.Reviewer.User instanceof $news.Types.User, true, 'Reviewer.User');
    //                        equal(m.b instanceof Object, true, 'b');
    //                        equal(typeof m.b.a, 'string', 'b.a');
    //                        equal(typeof m.b.b, 'string', 'b.b');
    //                        //equal(m.b.c instanceof $news.Types.Location, true, 'b.c');
    //                        //equal(typeof m.b.c.Address, 'string', 'b.c.Address');
    //                        //equal(typeof m.b.c.City, 'string', 'b.c.City');
    //                        //equal(typeof m.b.c.Zip, 'number', 'b.c.Zip');
    //                        //equal(typeof m.b.c.Country, 'string', 'b.c.Country');

    //                        console.log(r);
    //                    }, error: function (error) { console.log("ERROR");console.log(error);}
    //                });
    //            });
    //        } catch (ex) {
    //            start(2);
    //            ok(false, "Unhandled exception occured");
    //            console.log("--=== get_mapped_custom is returned: ");
    //            console.dir(ex);
    //            console.log(" ===--");
    //        }
    //    });
    //});

    test('sqlite_performace_issue', 0, function () {
        stop(1);

        function rng(max) {
            return Math.floor(Math.random() * max);
        }

        function t() {
            return new Date().getTime();
        }

        function addTestData() {
            var targetArticleNr = 2;
            var cycleSize = 1;

            console.log('running NewsReader test\ntargetArticleNr=' + targetArticleNr + '\ncycleSize=' + cycleSize + '\n');

            var s = t();

            // Users
            var users = [];
            for (var i = 0; i < 100; i++) {
                var cUsr = new $news.Types.User({ LoginName: ("Usr" + i), Email: "usr" + i + "@company.com", Profile: new $news.Types.UserProfile({ FullName: "Full Name", Bio: "Bio" + i, Birthday: new Date(2000, 1, 1 - i), Location: new $news.Types.Location({}) }) });
                users.push(cUsr);
                //$news.context.Users.add(cUsr);
            }
            var now = t();
            console.log('Users generated in ' + (now - s) + 'ms');
            s = now;

            // Categories
            var cats = [
				new $news.Types.Category({ Title: "Sport" }),
				new $news.Types.Category({ Title: "World" }),
				new $news.Types.Category({ Title: "Politics" }),
				new $news.Types.Category({ Title: "Tech" }),
				new $news.Types.Category({ Title: "Health" })
            ];
            for (var i = 0; i < cats.length; i++) {
                $news.context.Categories.add(cats[i]);
            }
            now = t();
            console.log('Categories generated in ' + (now - s) + 'ms');
            s = now;

            // Tags
            var tags = [];
            for (var i = 0; i < 50; i++) {
                var cTag = new $news.Types.Tag({ Title: "Tag" + i });
                tags.push(cTag);
                $news.context.Tags.add(cTag);
            }
            now = t();
            console.log('Tags generated in ' + (now - s) + 'ms');
            s = now;

            var acCount = 0;
            while (acCount * cycleSize <= targetArticleNr) {
                if (acCount > 0) {
                    now = t();
                    console.log('Items added (' + acCount * cycleSize + ') at ' + (now - s) + 'ms');
                }

                for (var i = 0; i < cycleSize; i++) {
                    $news.context.Articles.add(new $news.Types.Article({
                        Title: 'Article' + acCount + '_' + i,
                        Lead: 'Lead' + acCount + '_' + i,
                        Body: 'Body' + acCount + '_' + i,
                        CreateDate: Date.now(),
                        Category: cats[rng(cats.length)],
                        Author: users[rng(users.length)],
                        Tags: []
                    }));
                }

                acCount++;
            }

            now = t();
            console.log('Articles generated in ' + (now - s) + 'ms');
            s = now;

            $news.context.saveChanges();

            now = t();
            console.log('Save completed in ' + (now - s) + 'ms');
            start(1);
        }

        $news.context = new $news.Types.NewsContext({ name: "sqLite", databaseName: "emptyNewsReader", dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables });
        $news.context.onReady(addTestData);

        console.log('\nstarting...');
    });
}