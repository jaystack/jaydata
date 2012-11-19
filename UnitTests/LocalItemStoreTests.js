$(function () {

    module('Local Item Store');

    function xtest() { };

    test('simplified entity context constructor', 3, function () {
        stop();

        $data.Entity.extend("Article", {
            Id: { type: 'int', key: true, computed: true },
            Title: { type: 'string' }
        });

        $data.EntityContext.extend("mine", {
            Articles: { type: $data.EntitySet, elementType: Article }
        });


        var db = new mine("http://localhost:50594/jaydata/Services/emptyNewsReader.svc");
        db.onReady(function () {
            ok(db.storageProvider instanceof $data.storageProviders.oData.oDataProvider, "provider type guessed correctly from url");

            db = new mine("FooBarDb");
            db.onReady(function () {
                ok(db.storageProvider instanceof $data.storageProviders.sqLite.SqLiteStorageProvider, "provider type guessed correctly from init string");

                db = new mine({ provider: 'sqLite', databaseName: "FooBarDb" });
                db.onReady(function () {
                    ok(db.storageProvider instanceof $data.storageProviders.sqLite.SqLiteStorageProvider, "provider type guessed correctly from init data");
                    start();
                });
            });
        });

        

    });

    test('create_context_type', 3, function () {

        $data.Entity.extend("MyType2", {
            Id: { type: 'int', key: true, computed: true },
            Field: { type: String }
        });

        var contextInstance = $data.ItemStore._getDefaultItemStoreFactory(new MyType2());
        ok(contextInstance instanceof $data.EntityContext, "context is EntityContext");

        contextInstance = $data.ItemStore._getDefaultItemStoreFactory(MyType2);
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
            .save({ Value: 15, Product: "AAAA" })
            .then(function (item) {
                start(1);
                ok(true, "first save done")
                console.log("save done", JSON.stringify(item));
                item.Value = 10;
                stop(1);
                console.log("before resave", JSON.stringify(item));
                return item.save();
            })
            .then(function (item) {
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




    $data.Entity.extend("ItemStore.Example.Article", {
        Id: { type: 'int', key: true, computed: true },
        Title: { type: 'string' }
    });

    $data.EntityContext.extend("ItemStore.Example.Context", {
        Articles: { type: $data.EntitySet, elementType: ItemStore.Example.Article }
    });

    var factory = function () {
        return new ItemStore.Example.Context({ name: 'local', databaseName: 'mine_DB' });
    }

    test('$data implementation', 3, function () {
        stop();
        var context = factory();

        context.onReady(function () {
            start();
            equal($data('ItemStore.Example.Article').fullName, 'ItemStore.Example.Article', 'type resolve from context instance');

            equal($data(context.getType(), 'Article').fullName, 'ItemStore.Example.Article', 'type resolve from context type');
            equal($data(context, 'Article').fullName, 'ItemStore.Example.Article', 'type resolve from context instance');


            $data.ItemStore = new $data.ItemStoreClass();
        });
    });

    test('storeFactory on entities', 10, function () {
        stop(1);

        $data.addStore('remote', factory, true);

        var item = new ItemStore.Example.Article({ Title: 'first' });
        equal(typeof item.storeFactory, 'undefined', 'store factory not set on new item');

        item.save().then(function (item) {
            ok(true, 'item saved');

            equal(typeof item.storeFactory, 'undefined', 'store factory not set on new item');

            item.Title = 'asdasd';
            equal(item.Title, 'asdasd', 'item Title after refresh');
            item.refresh().then(function (rItem) {
                equal(item.Title, 'first', 'item Title after refresh');
                equal(rItem.Title, 'first', 'item Title after refresh');

                $data('ItemStore.Example.Article').read(item.Id).then(function (item) {
                    equal(typeof item.storeFactory, 'function', 'store factory set on loaded item');

                    $data('ItemStore.Example.Article').readAll().then(function (items) {
                        equal(typeof items[0].storeFactory, 'function', 'store factory set on loaded item');


                        var context = factory();
                        context.onReady(function () {
                            context.Articles.first()
                                .then(function (item) {
                                    equal(typeof item.storeFactory, 'function', 'store factory set on loaded item');

                                    $data('ItemStore.Example.Article').removeAll()
                                        .then(function () {
                                            return $data('ItemStore.Example.Article').itemCount()
                                                .then(function (count) {
                                                    equal(count, 0, 'items deleted');
                                                    $data.ItemStore = new $data.ItemStoreClass();
                                                    start();
                                                });
                                        });
                                });
                        });
                    });
                });
            });
        });
    });

    test('load entity from standard context and save', 3, function () {
        stop(1);
        $data.addStore('dummy', function () { ok(false, 'dummy store factory'); throw 'wrong code running'; }, true);

        var context = factory();
        context.onReady(function () {
            var item = new ItemStore.Example.Article({ Title: 'first' });
            context.add(item);

            context.saveChanges(function () {
                context.Articles.first().then(function (item2) {
                    item2.Title = 'changed Title';
                    item2.save()
                        .then(function () {
                            context.Articles.toArray().then(function (items) {
                                equal(items.length, 1, 'result count failed');
                                equal(items[0].Id, item.Id, 'result Id failed');
                                equal(items[0].Title, 'changed Title', 'result Title failed');

                                items[0].remove()
                                    .then(function () {
                                    $data.ItemStore = new $data.ItemStoreClass();
                                    start();
                                });
                            });
                        });
                });
            });

        });
    });

    test('default factory change', 6, function () {
        stop(1);

        $data.addStore('remote', factory, true);

        var item = new ItemStore.Example.Article({ Title: 'first' });
        equal(typeof item.storeFactory, 'undefined', 'store factory not set on new item');

        item.save().then(function (item) {
            ok(true, 'item saved');

            equal(typeof item.storeFactory, 'undefined', 'store factory not set on new item');

            
            $data.addStore('dummy', function () { ok(false, 'dummy store factory'); throw 'wrong code running'; }, true);

            $data('ItemStore.Example.Article').read(item.Id, 'remote').then(function (item2) {
                equal(item2.Id, item2.Id, 'item Id');
                equal(item2.Title, item2.Title, 'item Title');

                $data('ItemStore.Example.Article').removeAll('remote')
                    .then(function () {
                        return $data('ItemStore.Example.Article').itemCount('remote')
                            .then(function (count) {
                                equal(count, 0, 'items deleted');
                                $data.ItemStore = new $data.ItemStoreClass();
                                start();
                            });
                    });
            });
        });
    });


});