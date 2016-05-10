$(document).ready(function () {
    if (!$data.StorageProviderLoader.isSupported('sqLite')) return;
    frameOperatorTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
    setOperationTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
});

function frameOperatorTests(providerConfig) {
    module("frameOperator Tests");

    test("frameOperators", 25, function () {
        stop(11);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

            $news.Types.NewsContext.generateTestData(db, function () {

                notEqual(db.Articles.toArray, undefined, 'toArray on EntitySet failed');
                notEqual(db.Articles.filter(function () { return true; }).toArray, undefined, 'toArray on Queryable failed');

                db.Articles.toArray(function (articles) {
                    start();

                    ok(articles.length > 0, 'result count failed');

                });

                notEqual(db.Articles.forEach, undefined, 'forEach on EntitySet failed');
                notEqual(db.Articles.take(1).forEach, undefined, 'forEach on Queryable failed');

                db.Articles.take(1).forEach(function (article) {
                    start();

                    ok(true, 'result failed');

                });

                notEqual(db.Articles.length, undefined, 'length on EntitySet failed');
                notEqual(db.Articles.filter(function () { return true; }).length, undefined, 'length on Queryable failed');

                db.Articles.length(function (num) {
                    start();

                    ok(num > 0, 'result count failed');

                });

                notEqual(db.Articles.single, undefined, 'single on EntitySet failed');
                notEqual(db.Articles.filter(function () { return true; }).single, undefined, 'single on Queryable failed');

                db.Articles.filter(function (a) { return a.Id == 1 }).single(null, null, function (val) {
                    start();

                    ok(true, 'result failed');

                });

                db.Articles.single(function (a) { return a.Id == 1 }, null, function (val) {
                    start();

                    ok(true, 'result failed');

                });

                notEqual(db.Articles.first, undefined, 'first on EntitySet failed');
                notEqual(db.Articles.filter(function () { return true; }).first, undefined, 'first on Queryable failed');

                db.Articles.first(null, null, function (val) {
                    start();

                    ok(true, 'result failed');

                });

                db.Articles.first(function (a) { return a.Id == 1 }, null, function (val) {
                    start();

                    ok(true, 'result failed');

                });

                notEqual(db.Articles.some, undefined, 'some on EntitySet failed');
                notEqual(db.Articles.filter(function () { return true; }).some, undefined, 'some on Queryable failed');

                try {
                    db.Articles.some(null, null, function (val) {
                        start();

                        equal(val, true, 'result failed');

                    });

                    db.Articles.some(function (a) { return a.Id == 1 }, null, function (val) {
                        start();

                        equal(val, true, 'result failed');

                    });
                } catch (e) {
                    ok(true, 'some');
                    ok(true, e);
                    start(2);
                }

                notEqual(db.Articles.every, undefined, 'every on EntitySet failed');
                notEqual(db.Articles.filter(function () { return true; }).every, undefined, 'every on Queryable failed');

                try {
                    db.Articles.every(null, null, function (val) {
                        start();

                        equal(val, true, 'result failed');

                    });

                    db.Articles.every(function (a) { return a.Id == 1 }, null, function (val) {
                        start();

                        equal(val, false, 'result failed');

                    });
                } catch (e) {
                    ok(true, 'every');
                    ok(true, e);
                    start(2);
                }

            });
        });
    });
};

function setOperationTests(providerConfig) {
    module("setOperationTests Tests");

    test("setOperationTests oData inline 1:N operators", 3, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            var subsubFilter = db.Tags.filter(function (t) { t.Id == 5 });
            var subFilter = db.Articles.filter(function (a) { return a.Tags.some(this.someFilter); }, { someFilter: subsubFilter });
            start();

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