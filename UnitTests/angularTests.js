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
     then/success
     dom valtoztas
     hasOwnProperty
     _isNew
     _isDirty
     $data injected

     cacheing
     callback success, error
     error
     save
     remove
     saveChanges
    */
    test("angular bootstrapping", 1, function () {
        var app = init();
        ok(app !== undefined, 'Can not bootstrap angularjs with jaydata');
        clean();
    });
    test("angular toLiveArray/refresh", 3, function () {
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
                        ok(li.length === 3, 'list should have three children, but it has ' + li.length);
                        start();
                        $scope.categories
                        .then(function () {
                            ok(true, 'then should also work after the promise is fulfilled');
                            start();
                        });
                        stop;
                        clean();
                    });
                });
            };
            var app = init('<div ng-controller="theController"><ul id="theList"><li ng-repeat="category in categories">{{category.name}}</li></ul></div>');
        });
        stop();
    });
    test("angular hasOwnProperty", 4, function () {
        theController = function ($scope, $data) {
            var categoryType = $data.Entity.extend("Category", {
                Id: { type: "int", key: true, computed: true },
                name: { type: String, required: true, maxLength: 200 }
            });
            var c = new categoryType();
            ok(c.hasOwnProperty('Id'), 'hasOwnProperty failed for Id');
            ok(c.hasOwnProperty('alma') === false, 'hasOwnProperty failed for alma');
            ok(c.hasOwnProperty('changedProperties') === false, 'hasOwnProperty failed for changedProperties');
            ok(c.hasOwnProperty('isValid') === false, 'hasOwnProperty failed for isValid');
            clean();
        };
        var app = init('<div ng-controller="theController"><ul id="theList"><li ng-repeat="category in categories">{{category.name}}</li></ul></div>');
    });
    test("angular _isNew/_isDirty", 6, function () {
        theController = function ($scope, $data) {
            var categoryType = $data.Entity.extend("Category", {
                Id: { type: "int", key: true, computed: true },
                name: { type: String, required: true, maxLength: 200 }
            });
            var c = new categoryType();
            c.name = 'alma';
            ok(c._isNew, '_isNew failed');
            ok(c._isDirty === false, '_isDirty failed');
            c.save()
            .then(function () {
                ok(c.Id !== undefined, 'save nem sikerult');
                ok(c._isNew === false, '_isNew failed after save');
                ok(c._isDirty === false, '_isDirty failed after save');
                c.name = 'alma';
                ok(c._isDirty, '_isDirty failed');
                clean();
            });
        };
        var app = init('<div ng-controller="theController"><ul id="theList"><li ng-repeat="category in categories">{{category.name}}</li></ul></div>');
    });
}
