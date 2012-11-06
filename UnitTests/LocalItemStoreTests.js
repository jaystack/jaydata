$(function () {

    module('Local Item Store');

    function xtest() { };

    test('simplified entity context constructor', 3, function() {

        $data.Entity.extend("Article", {
            Id: { type: 'int', key: true, computed: true },
            Title: { type: 'string' }
        });

        $data.EntityContext.extend("mine", {
            Articles: { type: $data.EntitySet, elementType: Article }
        });
        var db = new mine("http://localhost:50594/jaydata/Services/emptyNewsReader.svc");
        ok(db.storageProvider instanceof $data.storageProviders.oData.oDataProvider, "provider type guessed correctly from url");

        db = new mine("FooBarDb");
        ok(db.storageProvider instanceof $data.storageProviders.sqLite.SqLiteStorageProvider, "provider type guessed correctly from init string");

        db = new mine({ provider: 'sqLite', databaseName: "FooBarDb" });
        ok(db.storageProvider instanceof $data.storageProviders.sqLite.SqLiteStorageProvider, "provider type guessed correctly from init data");

    });

    test('create_context_type', 3, function () {

        $data.Entity.extend("MyType2", {
            Id: { type: 'int', key: true, computed: true },
            Field: { type: String }
        });
        
        var contextFactory = $data.Entity.getDefaultItemStoreFactory(new MyType2());
        var contextInstance = new contextFactory();
        ok(contextInstance instanceof $data.EntityContext, "context is EntityContext");

        var contextFactory = $data.Entity.getDefaultItemStoreFactory(MyType2);
        var contextIntance = new contextFactory();
        ok(contextInstance instanceof $data.EntityContext, "context is EntityContext");

        stop(1);
        contextInstance.onReady(function () {
            start(1);
            ok(true, "context could be initialized");
        });
    });

    test('promise chain', 7, function () {

        var rand = Math.random().toString().substr(2, 4);
        var typeName = 'Cart' + rand;
        $data.define(typeName, {
            Data: String
        });

        stop(1);
        $data(typeName)
            .save({ Data: 'abc' })
            .then(function (item) {
                start(1);
                ok(item.Id === 1, "First item created");
                ok(item.Data === 'abc', "First item value");
                stop(1);
                return $data(typeName).save({ Data: 'def' });
            })
            .then(function (item) {
                start(1);
                ok(item.Id === 2, "Second item created");
                ok(item.Data === 'def', "First item value");
                stop(1);
                return $data(typeName).readAll();
            })
            .then(function (items) {
                start(1);
                ok(items.constructor === Array, "result is array");
                ok(items.length === 2, "contains correct number of items");
                stop(1);
            })
            .then($data(typeName).removeAll)
            .then($data(typeName).readAll)
            .then(function (items) {
                start(1);
                ok(items.length === 0, "items wiped");
            });


    });


    test('save_and_update', 2, function () {
        $data.define("Cart10", {
            Product: String,
            Value: Number
        });

        stop(1);
        $data("Cart10")
            .save({ Value:15, Product: "AAAA" })
            .then(function (item) {
                start(1);
                ok(true, "first save done")
                console.log("save done", JSON.stringify(item));
                item.Value = 10;
                stop(1);
                console.log("before resave", JSON.stringify(item));
                return item.save();
            })
            .then(function(item) {
                return $data("Cart10").read(item.Id);
            })
            .then(function (resaveditem) {
                start(1);
                ok(resaveditem.Value === 10, "Value correctly set");
            }, function (err) {
                start(1);
                console.log("notok");
            });
    });

    test('save item to Local Item Store', 10, function () {

        var type = $data.define("Cart4", {
            ID: "int",
            ProductID: Number,
            ProductName: String,
            Amount: Number
        });
        stop(1);
        $data("Cart4")
            .save({ ProductName: 'xxx' })
            .then(function (item) {
                start(1);
                ok(true, "item created");
                stop(1);
                $data("Cart4")
                    .read(item.ID)
                    .then(function (item) {
                        start(1);
                        ok(true, "item loaded");
                        stop(1);
                        var result = item.remove();
                        console.log("res", result);
                        return result;
                    })
                    .then(function (item) {
                        start(1);
                        ok(true, "item removed");
                        stop(1);
                        return $data("Cart4").read(item.ID);
                    })
                    .fail(function (err) {
                        start(1);
                        ok(true, "item can not be loaded");
                    });
            });

        stop(1);
        $data("Cart4")
            .save({ ProductName: "Tea" })
            .then(function (item) {
                start(1);
                ok(true, "item loaded");
                stop(1);
                return $data("Cart4").remove(item.ID);
            })
            .then(function (item) {
                return $data("Cart4").read(item.ID);
            })
            .fail(function () {
                start(1);
                ok(true, "item removed well");
            });

        $data.define("Cart5", {
            Product: String,
            Price: Number
        });
        stop(1);
        $data("Cart5")
            .save({ Product: 'Tea' })
            .then(function () { return $data("Cart5").save({ Product: 'Tea2' }) })
            .then(function () { return $data("Cart5").save({ Product: 'Tea2' }) })
            .then($data("Cart5").readAll)
            .then(function (items) {
                start(1);
                ok(items.constructor === Array, "result is array");
                ok(items[0] instanceof Cart5, "result is of correct type");
                stop(1);
                $data("Cart5")
                    .removeAll()
                    .then(function (items) {
                        console.log("remove all", items);
                        start(1);
                        ok(true, "remove all success");
                        stop(1);
                        return $data("Cart5").readAll();
                    })
                    .then(function (items) {
                        start(1);
                        ok(items.length === 0, "container cleared");
                    }, function (error) {
                        start(1);
                        console.error("error in readAll", error);
                    })
            });

    });

    test('filter in Local Item Store', 1, function () {
        $data.define("Cart11", {
            Product: String,
            Value: Number
        });

        stop(1);
        var promises = []
        for (var i = 0; i < 10; i++) {
            promises.push($data("Cart11").save({ Value: i, Product: 'item' + i }));
        }

        $.when(promises).then(function () {
            $data("Cart11").filter(function (item) { return item.Value >= this.val }, { val: 5 }).then(function (items) {
                equal(items.length, 5, 'filter length correct');

                $data("Cart11").removeAll().then(function () {
                    start();
                });
            });
        });
    });

    test('filter in Local Item Store 2', 1, function () {
        $data.define("Cart13", {
            Product: String,
            Value: Number
        });

        stop(1);
        var promises = []
        for (var i = 0; i < 10; i++) {
            promises.push($data("Cart13").save({ Value: i, Product: 'item' + i }));
        }

        $.when(promises).then(function () {
            $data("Cart13").filter(function (item) { return item.Product.contains(this.val) }, { val: 'tem5' }).then(function (items) {
                equal(items.length, 1, 'filter length correct');

                $data("Cart13").removeAll().then(function () {
                    start();
                });
            });
        });
    });

    test('first in Local Item Store', 1, function () {
        $data.define("Cart12", {
            Product: String,
            Value: Number
        });

        stop(1);
        var promises = []
        for (var i = 0; i < 10; i++) {
            promises.push($data("Cart12").save({ Value: i, Product: 'item' + i }));
        }

        $.when(promises).then(function () {
            $data("Cart12").first(function (item) { return item.Value >= this.val && item.Value < 6 }, { val: 5 }).then(function (item) {
                equal(item.Value, 5, 'item.Value is correct');

                $data("Cart12").removeAll().then(function () {
                    start();
                });
            });
        });
    });
});