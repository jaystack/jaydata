
$(function () {

    module("webapi action test");

    test('webApi OData Entity action test', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({ 
            name: "oData", 
            databaseName: 'T1', 
            oDataServiceHost: "Services/emptyNewsReader.svc", 
            serviceUrl: 'Services/oDataDbDelete.asmx', 
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
                $news.Types.NewsContext.generateTestData(db, function () {
                    $data.service('odata', function (f, t) {

                        var context = f();
                        context.onReady(function () {
                            context.Categories.first("it.Title == 'Sport'", null, function (cat) {

                                cat.GetFirstArticleTitle('cle2', function (name) {
                                    equal(name, 'Article2', 'Entity Action result');

                                    start();
                                });

                                cat.GetFirstArticleTitle({ contains: 'cle2' }, function (name) {
                                    equal(name, 'Article2', 'Entity Action result');

                                    start();
                                });

                            });
                        });
                    });
                });
        });
    });

    test('webApi OData Collection action test', 2, function () {
        stop(2);

        (new $news.Types.NewsContext({
            name: "oData",
            databaseName: 'T1',
            oDataServiceHost: "Services/emptyNewsReader.svc",
            serviceUrl: 'Services/oDataDbDelete.asmx',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        })).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                $data.service('odata', function (f, t) {

                    var context = f();
                    context.onReady(function () {

                        context.Categories.GetFirstArticleTitle('cle', function (name) {
                            equal(name, 'Article21', 'Entity Action result');

                            start();
                        });

                        context.Categories.GetFirstArticleTitle({ contains: 'cle' }, function (name) {
                            equal(name, 'Article21', 'Entity Action result');

                            start();
                        });

                    });
                });
            });
        });
    });

    test('webApi OData Entity action GeographyPoint', function () {
        stop(2);

        (new $news.Types.NewsContext({
            name: "oData",
            databaseName: 'T1',
            oDataServiceHost: "Services/emptyNewsReader.svc",
            serviceUrl: 'Services/oDataDbDelete.asmx',
            dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
        })).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                $data.service('odata', function (f, t) {

                    var context = f({ maxDataServiceVersion: '3.0' });
                    context.onReady(function () {
                        context.Categories.first("it.Title == 'Sport'", null, function (cat) {

                            var geoPoint = new $data.GeographyPoint(-1.35, 44.35);

                            context.prepareRequest = function (req) {
                                ok(true, '!!!!! Override Accept format to odata=verbose');
                                console.log(req[0]);
                                req[0].headers.Accept = 'application/atomsvc+xml;q=0.8, application/json;odata=verbose;q=0.7, application/json;q=0.5, */*;q=0.1';
                                context.prepareRequest = function () { };
                            };

                            context.attach(cat);

                            cat.LocationSwipe(geoPoint, {
                                success: function (newLocation) {
                                    equal(newLocation.longitude, 44.35, 'Entity Action result longitude');
                                    equal(newLocation.latitude, -1.35, 'Entity Action result latitude');
                                    deepEqual(newLocation.coordinates, [44.35, -1.35], 'Entity Action result coordinates')
                                    deepEqual(geoPoint.coordinates, [-1.35, 44.35], 'geoPoint coordinates')

                                    start();
                                },
                                error: function (e) {
                                    ok(e.data[0].request.headers.Accept.indexOf('fullmetadata') > -1, 'WebApi geo not supported with fullmetadata');
                                    ok(false, 'Error: ' + e);
                                    start();
                                }
                            });

                            cat.LocationSwipe({ Loc: geoPoint }, {
                                success: function (newLocation) {
                                    equal(newLocation.longitude, 44.35, 'Entity Action result longitude');
                                    equal(newLocation.latitude, -1.35, 'Entity Action result latitude');
                                    deepEqual(newLocation.coordinates, [44.35, -1.35], 'Entity Action result coordinates')
                                    deepEqual(geoPoint.coordinates, [-1.35, 44.35], 'geoPoint coordinates')

                                    start();
                                },
                                error: function (e) {
                                    ok(e.data[0].request.headers.Accept.indexOf('fullmetadata') > -1, 'WebApi geo not supported with fullmetadata'); ok(false, 'Error: ' + e);
                                    start();
                                }
                            });

                        });
                    });
                });
            });
        });
    });
    

});

function T3WebapiBugfix(providerConfiguration, msg) {
    module("webapi fix test" + msg);

    test('oData V3 date result', 1, function () {
        stop();

        (new $news.Types.NewsContext(providerConfiguration)).onReady(function (db) {
            
            var date = new Date("2013/02/07 14:22:17");
            db.Articles.add({ Title: 'item title', Lead: 'item Lead', CreateDate: date });
            db.saveChanges(function(){
                db.Articles.toArray(function(items){
                    var art = items[0];
                    equal(art.CreateDate.valueOf(), date.valueOf(), 'saved and recived dates are equals');
                    start();
                });
            });

        });
    });

};


function webApiTests(providerConfiguration, msg) {
    module("webapi test" + msg);


}