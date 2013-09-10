/// <reference path="../Scripts/angular-1.2.0-rc2" />
/// <reference path="../NewsReaderContext.js" />
/// <reference path="../Modules/angular.js" />

$(document).ready(function () {
    if (!$data.StorageProviderLoader.isSupported('sqLite')) return;
    angularTests({ name: "sqLite", databaseName: 'angularTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
});

function angularTests(providerConfig) {
    //return;
    module("angularTests");

    function init(markup) {
        markup = markup || '';
        stop();
        var div = $('body').append('<div id="ng-test" ng-app="app">' + markup + '</div>');
        var app = angular.module('app', ['jaydata']);
        angular.bootstrap($('#ng-test'), ['app']);
        return app;
    }

    function clean() {
        $('#ng-test').remove();
        start();
    }

    /*
     toLiveArray
     refresh

     _isNew
     _isDirty
     cacheing
     $data injected
     hasOwnProperty
     callback success, error
     options
     chainOrfire
     then/success
     error
     dom valtoztas
     save
     remove
     saveChanges
    */
    test("angular bootstrapping", 1, function () {
        var app = init();
        ok(app !== undefined, 'Can not bootstrap angularjs with jaydata');
        clean();
    });
    test("angular toLiveArray/refresh", 2, function () {
        $data.Entity.extend("Category", {
            Id: { type: "int", key: true, computed: true },
            name: { type: String, required: true, maxLength: 200 }
        });
        $data.EntityContext.extend("NorthwindDatabase", {
            Categories: { type: $data.EntitySet, elementType: Category }
        });
        var nwDB = new NorthwindDatabase({ name: "local", databaseName: 'angularTests', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
        nwDB.onReady()
        .then(function() {
            theController = function ($scope, $data) {
                $scope.categories = nwDB.Categories.toLiveArray();

                var theList = $('#theList')[0];
                var li = $(theList).children();
                ok(li.length === 0, 'list should have no children');
                nwDB.Categories.addMany([{ name: '1' }, { name: '2' }, { name: '3' }]);
                nwDB.saveChanges()
                .then(function () {
                    $scope.categories.refresh()
                    .then(function () {
                        $scope.$digest();
                        theList = $('#theList')[0];
                        li = $(theList).children();
                        ok(li.length === 3, 'list should have three children');
                        start();
                        clean();
                    });
                });
            };
            var app = init('<div ng-controller="theController"><ul id="theList"><li ng-repeat="category in categories">{{category.name}}</li></ul></div>');
        });
        stop();
    });
}
