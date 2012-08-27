function T3_Storm(providerConfig, msg) {
    msg = msg || '';
    module("DataTests" + msg);
    test('Filter_noFilter', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(9);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.Tags;
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 5, 'Number of tags faild');
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
                    }
                    equal(typeof r[0].Id, 'string', 'Field type error: Id');
                    equal(typeof r[0].Title, 'string', 'Field type error: Id');
                });

            });
        });
    });
    test('Filter_noFilter_orderby', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(55);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.Articles.orderBy(function (t) { return t.Title });
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 26, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.Article, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok(preItem < r[i].Title, 'Order error at ' + i + ' position');
                        }
                        preItem = r[i].Title;
                    }
                    equal(typeof r[0].Id, 'string', 'Field type error: Id');
                    equal(typeof r[0].Title, 'string', 'Field type error: Id');
                });

            });
        });
    });
    test('Filter_noFilter_orderbyDesc', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(13);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.Categories.orderByDescending(function (t) { return t.Title });
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 5, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.Category, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok(preItem > r[i].Title, 'Order error at ' + i + ' position');
                        }
                        preItem = r[i].Title;
                    }
                    equal(typeof r[0].Id, 'string', 'Field type error: Id');
                    equal(typeof r[0].Title, 'string', 'Field type error: Id');
                });

            });
        });
    });
    test('Filter_noFilter_multiple_orderby', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(15);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.UserProfiles.orderByDescending(function (t) { return t.FullName }).orderBy(function (t) { return t.Bio });
                q.toArray(function (r) {
                    start(1); console.dir(r);
                    ok(r, "faild query");
                    equal(r.length, 6, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok((preItem.FullName > r[i].FullName) || ((preItem.FullName == r[i].FullName) && (preItem.Bio < r[i].Bio)), 'Order error at ' + i + ' position');
                        }
                        preItem = r[i];
                    }
                    equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
                    equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

                });

            });
        });
    });
    test('Filter_noFilter_multiple_orderby', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(9);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.UserProfiles.orderBy(function (t) { return t.Bio }).skip(1).take(2);
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 2, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok(preItem.Bio < r[i].Bio, 'Order error at ' + i + ' position');
                        }
                        preItem = r[i];
                    }
                    equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
                    equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

                    equal(r[0].Bio, 'Bio2', 'Data integrity error');
                    equal(r[1].Bio, 'Bio3', 'Data integrity error');
                });

            });
        });
    });
 }
