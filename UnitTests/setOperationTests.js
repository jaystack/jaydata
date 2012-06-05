$(document).ready(function () {
    if (!$data.storageProviders.sqLite.SqLiteStorageProvider.isSupported) return;
    frameOperatorTests({ name: "sqLite", dataBaseName: 'frameOperatorTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables });
    setOperationTests({ name: "oData", dataBaseName: 'setOperationTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables });
});

function frameOperatorTests(providerConfig) {
    module("frameOperator Tests");

    test("frameOperator toArray", 3, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            notEqual(db.Articles.toArray, undefined, 'toArray on EntitySet failed');
            notEqual(db.Articles.filter(function () { return true; }).toArray, undefined, 'toArray on Queryable failed');

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.toArray(function (articles) {
                    start();

                    ok(articles.length > 0, 'result count failed');

                });
            });
        });
    });

    test("frameOperator forEach", 3, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            notEqual(db.Articles.forEach, undefined, 'forEach on EntitySet failed');
            notEqual(db.Articles.take(1).forEach, undefined, 'forEach on Queryable failed');

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.take(1).forEach(function (article) {
                    start();

                    ok(true, 'result failed');

                });
            });
        });
    });

    test("frameOperator length", 3, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            notEqual(db.Articles.length, undefined, 'length on EntitySet failed');
            notEqual(db.Articles.filter(function () { return true; }).length, undefined, 'length on Queryable failed');

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.length(function (num) {
                    start();

                    ok(num > 0, 'result count failed');

                });
            });
        });
    });

    test("frameOperator single", 4, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            notEqual(db.Articles.single, undefined, 'single on EntitySet failed');
            notEqual(db.Articles.filter(function () { return true; }).single, undefined, 'single on Queryable failed');

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.filter(function (a) { return a.Id == 1 }).single(null, null, function (val) {
                    start();

                    ok(true, 'result failed');

                });
            });

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.single(function (a) { return a.Id == 1 }, null, function (val) {
                    start();

                    ok(true, 'result failed');

                });
            });
        });
    });

    test("frameOperator first", 4, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            notEqual(db.Articles.first, undefined, 'first on EntitySet failed');
            notEqual(db.Articles.filter(function () { return true; }).first, undefined, 'first on Queryable failed');

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.first(null, null, function (val) {
                    start();

                    ok(true, 'result failed');

                });
            });

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.first(function (a) { return a.Id == 1 }, null, function (val) {
                    start();

                    ok(true, 'result failed');

                });
            });
        });
    });

    test("frameOperator some", 4, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            notEqual(db.Articles.some, undefined, 'some on EntitySet failed');
            notEqual(db.Articles.filter(function () { return true; }).some, undefined, 'some on Queryable failed');

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.some(null, null, function (val) {
                    start();

                    equal(val, true, 'result failed');

                });
            });

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.some(function (a) { return a.Id == 1 }, null, function (val) {
                    start();

                    equal(val, true, 'result failed');

                });
            });
        });
    });

    test("frameOperator every", 4, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            notEqual(db.Articles.every, undefined, 'every on EntitySet failed');
            notEqual(db.Articles.filter(function () { return true; }).every, undefined, 'every on Queryable failed');

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.every(null, null, function (val) {
                    start();

                    equal(val, true, 'result failed');

                });
            });

            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.every(function (a) { return a.Id == 1 }, null, function (val) {
                    start();

                    equal(val, false, 'result failed');

                });
            });
        });
    });

};

function setOperationTests(providerConfig) {
    module("setOperationTests Tests");

    test("setOperationTests oData inline 1:N operators", 3, function () {
        //stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            var subFilter = db.Articles.filter(function (a) { return a.Id == 5; });

            try {
                var q = db.Categories.filter(function (c) { return c.Articles.some(this.someFilter); }, { someFilter: subFilter }).toTraceString();
                ok(true, 'some on articles collection in query failed');
            } catch (e) {
                ok(false, 'some on articles collection in query failed');
            }
            
            try {
                var q = db.Categories.filter(function (c) { return c.Articles.map(this.mapFilter); }, { mapFilter: subFilter }).toTraceString();
                ok(false, 'map on articles collection in query failed');
            } catch (e) {
                ok(true, 'map on articles collection in query failed');
            }

            try {
                var q = db.Categories.filter(function (c) { return c.Title.map(this.mapFilter); }, { mapFilter: subFilter }).toTraceString();
                ok(false, 'map on Title in query failed');
            } catch (e) {
                ok(true, 'map on Title in query failed');
            }

        });
    });
};