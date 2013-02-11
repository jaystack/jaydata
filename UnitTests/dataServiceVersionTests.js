

function dataServiceVersionTest(providerConfig, msg) {
    module("dataServiceVersionTest" + msg);

    function getProviderconfig() {
        return JSON.parse(JSON.stringify(providerConfig));
    }

    test('Update Request method tests', 3, function () {
        if (providerConfig.name !== "oData") { expect(1); ok(true, "Not supported"); return; }

        stop();
        (new $news.Types.NewsContext(getProviderconfig())).onReady(function (db) {
            db.Categories.add({ Title: 'Custom Category' });
            db.saveChanges(function () {
                db.Categories.first(undefined, undefined, function (cat) {

                    equal(cat.Title, 'Custom Category', 'categoryname');

                    db.Categories.attach(cat);
                    cat.Title += ' changed';

                    db.prepareRequest = function (req) {
                        if (db.storageProvider.providerConfiguration.maxDataServiceVersion === '3.0') {
                            equal(req[0].method, 'PATCH', 'request method value is PATCH');
                        } else {
                            equal(req[0].method, 'MERGE', 'request method value is MERGE');
                        }
                    }

                    db.saveChanges(function () {
                        db.prepareRequest = function () { };

                        db.Categories.first(undefined, undefined, function (updCat) {
                            equal(cat.Title, 'Custom Category changed', 'categoryname');

                            start();
                        });

                    });

                });
            });


        });
    });

    test('Update Request method tests in Batch', 4, function () {
        if (providerConfig.name !== "oData") { expect(1); ok(true, "Not supported"); return; }

        stop();
        (new $news.Types.NewsContext(getProviderconfig())).onReady(function (db) {
            db.Categories.add({ Title: 'Custom Category' });
            db.saveChanges(function () {
                db.Categories.first(undefined, undefined, function (cat) {
                    db.Categories.add({ Title: 'Custom Category 2' });
                    equal(cat.Title, 'Custom Category', 'categoryname');

                    db.Categories.attach(cat);
                    cat.Title += ' changed';

                    db.prepareRequest = function (req) {
                        equal(req[0].method, 'POST', 'batch request method value is POST');

                        if (db.storageProvider.providerConfiguration.maxDataServiceVersion === '3.0') {
                            equal(req[0].data.__batchRequests[0].__changeRequests[1].method, 'PATCH', 'inner request method value is PATCH');
                        } else {
                            equal(req[0].data.__batchRequests[0].__changeRequests[1].method, 'MERGE', 'inner request method value is MERGE');
                        }
                    }

                    db.saveChanges(function () {
                        db.prepareRequest = function () { };

                        db.Categories.first(undefined, undefined, function (updCat) {
                            equal(cat.Title, 'Custom Category changed', 'categoryname');

                            start();
                        });

                    });

                });
            });


        });
    });

    test('Count request test', 1, function () {
        if (providerConfig.name !== "oData") { expect(1); ok(true, "Not supported"); return; }

        stop();
        (new $news.Types.NewsContext(getProviderconfig())).onReady(function (db) {
            db.Categories.add({ Title: 'Custom Category' });
            db.Categories.add({ Title: 'Custom Category2' });
            db.Categories.add({ Title: 'Custom Category3' });
            db.saveChanges(function () {

                db.Categories.length(function (len) {
                    equal(len, 3, 'length result');
                    start();
                }).fail(function (e) {
                    if (db.storageProvider.providerConfiguration.maxDataServiceVersion === '1.0') {
                        var resp = JSON.parse(e.data[0].response.body);
                        equal(resp.error.message.value, "The DataServiceVersion '1.0' is too low for the request. The lowest supported version is '2.0'.", '$count is not supported in version 1.0');
                    } else {
                        ok(false, 'Error ' + e)
                    }
                    start();
                });
                
            });


        });
    });

};