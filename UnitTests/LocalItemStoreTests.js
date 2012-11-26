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
                ok(db.storageProvider instanceof $data.StorageProviderBase, "provider type guessed correctly from init string");

                if ($data.StorageProviderLoader.isSupported('sqLite')) {
                    db = new mine({ provider: 'sqLite', databaseName: "FooBarDb" });
                    db.onReady(function () {
                        ok(db.storageProvider instanceof $data.storageProviders.sqLite.SqLiteStorageProvider, "provider type guessed correctly from init data");
                        start();
                    });
                } else {
                    ok(true);
                    start();
                }
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

    test('query in Local Item Store', 1, function () {
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
            $data("Cart11").query(function (item) { return item.Value >= this.val }, { val: 5 }).then(function (items) {
                equal(items.length, 5, 'query length correct');

                $data("Cart11").removeAll().then(function () {
                    start();
                });
            });
        });
    });

    test('query in Local Item Store 2', 1, function () {
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
            $data("Cart13").query(function (item) { return item.Product.contains(this.val) }, { val: 'tem5' }).then(function (items) {
                equal(items.length, 1, 'query length correct');

                $data("Cart13").removeAll().then(function () {
                    start();
                });
            });
        });
    });

    test('takeFirst in Local Item Store', 1, function () {
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
            $data("Cart12").takeFirst(function (item) { return item.Value >= this.val && item.Value < 6 }, { val: 5 }).then(function (item) {
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
    };
    var dummyFactory = function (type) {
        if (type) {
            ok(false, 'dummy store factory');
            throw 'wrong code running';
        }
    }
    var addDummyfactory = function (name, isDefault) {
        $data.ItemStore.resetStoreToDefault(name, isDefault);
        $data.ItemStore.itemStoreConfig.aliases[name] = function (type) {
            ok(false, 'dummy store factory');
            throw 'wrong code running';
        }
    }

    test('contextToken - entityType store', 7, function () {
        equal(typeof ItemStore.Example.Article.storeToken, 'undefined', 'contextToken in entitySet type, BEFORE FIRST INIT');

        var ctx = factory();

        equal(ctx.contextToken.typeName, 'ItemStore.Example.Context', 'contextToken typeName');
        deepEqual(ctx.contextToken.args, { name: 'local', databaseName: 'mine_DB' }, 'contextToken args');
        equal(typeof ctx.contextToken.factory, 'function', 'contextToken factory');

        equal(ItemStore.Example.Article.storeToken.typeName, 'ItemStore.Example.Context', 'contextToken typeName');
        deepEqual(ItemStore.Example.Article.storeToken.args, { name: 'local', databaseName: 'mine_DB' }, 'contextToken args');
        equal(typeof ItemStore.Example.Article.storeToken.factory, 'function', 'contextToken factory');
    });


    test('addStore', 9, function () {
        stop();

        equal($data.ItemStore.itemStoreConfig.default, 'local', 'default store');
        equal(Object.keys($data.ItemStore.itemStoreConfig.aliases).length, 1, 'store aliases');
        equal(Object.keys($data.ItemStore.itemStoreConfig.contextTypes).length, 0, 'store aliases');

        $data.addStore('remote2', factory, true).then(function () {
            equal($data.ItemStore.itemStoreConfig.default, 'remote2', 'changed default store');
            equal(Object.keys($data.ItemStore.itemStoreConfig.aliases).length, 2, 'store aliases');
            equal(Object.keys($data.ItemStore.itemStoreConfig.contextTypes).length, 1, 'store aliases');

            $data.addStore('remote3', factory).then(function () {
                equal($data.ItemStore.itemStoreConfig.default, 'remote2', 'not changed default store');
                equal(Object.keys($data.ItemStore.itemStoreConfig.aliases).length, 3, 'store aliases');
                equal(Object.keys($data.ItemStore.itemStoreConfig.contextTypes).length, 2, 'store aliases');

                $data.ItemStore = new $data.ItemStoreClass();
                start();
            });
        });
    });

    test('$data implementation', 5, function () {
        stop();
        $data.addStore('remote', factory, true)
        var context = factory();


        context.onReady(function () {
            start();
            equal($data('ItemStore.Example.Article').fullName, 'ItemStore.Example.Article', 'type resolve from context instance');

            equal($data('Article', context.getType()).fullName, 'ItemStore.Example.Article', 'type resolve from context type');
            equal($data('Article', context).fullName, 'ItemStore.Example.Article', 'type resolve from context instance');

            equal($data('Article', 'remote').fullName, 'ItemStore.Example.Article', 'type resolve with alias');
            equal($data('Article').fullName, 'ItemStore.Example.Article', 'type resolve from default context');

            $data.ItemStore = new $data.ItemStoreClass();
        });
    });

    test('storeToken on entities', 10, function () {
        stop(1);

        $data.addStore('remote', factory, true).then(function () {

            var item = new ItemStore.Example.Article({ Title: 'first' });
            equal(typeof item.storeToken, 'undefined', 'store token not set on new item');

            item.save().then(function (item) {
                ok(true, 'item saved');

                equal(typeof item.storeToken, 'undefined', 'store token not set on new item');

                item.Title = 'asdasd';
                equal(item.Title, 'asdasd', 'item Title after refresh');
                item.refresh().then(function (rItem) {
                    equal(item.Title, 'first', 'item Title after refresh');
                    equal(rItem.Title, 'first', 'item Title after refresh');

                    $data('ItemStore.Example.Article').read(item.Id).then(function (item) {
                        equal(typeof item.storeToken, 'object', 'store token set on loaded item');

                        $data('ItemStore.Example.Article').readAll().then(function (items) {
                            equal(typeof items[0].storeToken, 'object', 'store token set on loaded item');


                            var context = factory();
                            context.onReady(function () {
                                context.Articles.first()
                                    .then(function (item) {
                                        equal(typeof item.storeToken, 'object', 'store token set on loaded item');

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
    });

    test('load entity from standard context and save', 3, function () {
        stop(1);
        addDummyfactory('dummy', true);

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

    test('use type hint to save', 7, function () {
        stop(1);
        addDummyfactory('dummy', true);

        $data.Entity.extend("ItemStore.Example.Article2", {
            Id: { type: 'int', key: true, computed: true },
            Title: { type: 'string' },
            Description: { type: 'string' }
        });

        $data.EntityContext.extend("ItemStore.Example.Context2", {
            Articles: { type: $data.EntitySet, elementType: ItemStore.Example.Article2 }
        });

        var ctx = new ItemStore.Example.Context2({ name: 'local', databaseName: 'ItemStore_test_context2' });
        var savedItemId;
        $data.addStore('remote', ctx.contextToken.factory)
            .then(function () {
                return $data('Article2', 'remote').save({ Title: 'apple', Description: 'tree' })
            })
            .then(function (savedItem) {
                equal(typeof savedItem.Id, 'number', 'has key value');
                equal(savedItem.Title, 'apple', 'Title value');
                equal(savedItem.Description, 'tree', 'Description value');
                savedItemId = savedItem.Id;

                return ctx.Articles.single('it.Id === this.value', { value: savedItem.Id });

            })
            .then(function (loadedValue) {
                equal(typeof loadedValue.Id, 'number', 'has key value');
                equal(loadedValue.Title, 'apple', 'Title value');
                equal(loadedValue.Description, 'tree', 'Description value');

                return loadedValue.remove();
            })
            .then(function () {
                return $data('Article2', 'remote').itemCount();
            })
            .then(function (count) {
                equal(count, 0, 'item deleted');

                $data.ItemStore = new $data.ItemStoreClass();
                start();
            })
            .fail(function (e) {
                ok(false, 'Error' + e);
                $data.ItemStore = new $data.ItemStoreClass();
                start();
            });
    });

    test('default factory change', 6, function () {
        stop(1);

        $data.addStore('remote', factory, true).then(function () {

            var item = new ItemStore.Example.Article({ Title: 'first' });
            equal(typeof item.storeFactory, 'undefined', 'store factory not set on new item');

            item.save().then(function (item) {
                ok(true, 'item saved');

                equal(typeof item.storeFactory, 'undefined', 'store factory not set on new item');


                addDummyfactory('dummy', true);

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

    test('entityType AddMany', 7, function () {
        stop(1);

        $data.addStore('remote', factory, true)
            .then(function () {
                return $data('Article').addMany([
                    { Title: 'apple1' },
                    { Title: 'apple2' },
                    { Title: 'apple3' }
                ]);
            })
            .then(function (savedItems) {

                for (var i = 0; i < savedItems.length; i++) {
                    var savedItem = savedItems[i];
                    equal(typeof savedItem.Id, 'number', 'has key value');
                    equal(savedItem.Title, 'apple' + (i + 1), 'Title value');
                }

                return $data('Article').removeAll();

            })
            .then(function () {
                return $data('Article').itemCount();
            })
            .then(function (count) {
                equal(count, 0, 'item deleted');

                $data.ItemStore = new $data.ItemStoreClass();
                start();
            })
            .fail(function (e) {
                ok(false, 'Error' + e);
                $data.ItemStore = new $data.ItemStoreClass();
                start();
            });
    });

    test('refresh change storeToken', 5, function () {
        stop(1);

        $data.addStore('remote', factory, true)
            .then(function () {
                return $data('Article').addMany([
                    { Title: 'apple1' },
                    { Title: 'apple2' },
                    { Title: 'apple3' }
                ]);
            })
            .then(function () {
                return $data('Article').readAll();
            })
            .then(function (loadedItems) {

                var loadedItem = loadedItems[0];

                var oldToken = loadedItem.storeToken;
                loadedItem.storeToken = { prop: 'changed' };
                return loadedItem.refresh().then(function (refreshed) {
                    equal(JSON.stringify(loadedItem.storeToken), JSON.stringify(oldToken), 'valid token1');
                    equal(JSON.stringify(refreshed.storeToken), JSON.stringify(oldToken), 'valid token2');

                    notEqual(JSON.stringify(loadedItem.storeToken), JSON.stringify({ prop: 'changed' }), 'invalid token1');
                    notEqual(JSON.stringify(refreshed.storeToken), JSON.stringify({ prop: 'changed' }), 'invalid token2');

                    return $data('Article').removeAll().then(function () {
                        return $data('Article', 'remote').itemCount();
                    });
                })
            })
            .then(function (count) {
                equal(count, 0, 'item deleted');

                $data.ItemStore = new $data.ItemStoreClass();
                start();
            })
            .fail(function (e) {
                ok(false, 'Error' + e);
                $data.ItemStore = new $data.ItemStoreClass();
                start();
            });
    });

    test('return $data.service in factory', 6, function () {
        stop(1);

        $data.addStore('remote', function () {
            return $data.service({ url: 'Services/emptyNewsReader.svc' });
        }, true).then(function (ctx) {

            $data('Article', 'remote')
                .save({ Title: 'watermelon', Lead: 'fruit' })
                .then(function (art) {
                    notEqual(art instanceof $news.Types.Article, true, 'valid type');
                    equal(art instanceof ctx.Articles.elementType, true, 'valid context type');
                    equal(typeof art.Id, 'number', 'has Id');
                    equal(art.Title, 'watermelon', 'has Title');
                    equal(art.Lead, 'fruit', 'has Lead');

                    return $data('Article').removeAll().then(function () {
                        return $data('Article', 'remote').itemCount();
                    });
                })
                .then(function (count) {
                    equal(count, 0, 'item deleted');
                    $data.ItemStore = new $data.ItemStoreClass();
                    start();
                });
                
        })
        .fail(function (e) {
            equal(e.message, 'factory dont have context instance', 'invalid factory');
            $data.ItemStore = new $data.ItemStoreClass();
            start();
        });
    });

    test('return promise in factory', 6, function () {
        stop(1);

        $data.addStore('remote', function () {
            var p = new $data.PromiseHandler();
            p.deferred.resolve(new $news.Types.NewsContext({ name: 'oData', oDataServiceHost: "Services/emptyNewsReader.svc" }));
            return p.getPromise();
        }, true).then(function (ctx) {

            $data('Article', 'remote')
                .save({ Title: 'watermelon1', Lead: 'fruit1' })
                .then(function (art) {
                    equal(art instanceof $news.Types.Article, true, 'valid type');
                    equal(art instanceof ctx.Articles.elementType, true, 'valid context type');
                    equal(typeof art.Id, 'number', 'has Id');
                    equal(art.Title, 'watermelon1', 'has Title');
                    equal(art.Lead, 'fruit1', 'has Lead');

                    return $data('Article').removeAll().then(function () {
                        return $data('Article', 'remote').itemCount();
                    });
                })
                .then(function (count) {
                    equal(count, 0, 'item deleted');

                    $data.ItemStore = new $data.ItemStoreClass();
                    start();
                });

        })
        .fail(function (e) {
            ok(false, 'Error' + e);
            $data.ItemStore = new $data.ItemStoreClass();
            start();
        });
    });

    test('return context in factory', 5, function () {
        stop(1);

        $data.addStore('remote', function () {
            var p = new $data.PromiseHandler();
            p.deferred.resolve(new $news.Types.NewsContext({ name: 'local', oDataServiceHost: "Services/emptyNewsReader.svc" }));
            return p.getPromise();
        }, true).then(function () {

            $data('Article', 'remote')
                .save({ Title: 'watermelon', Lead: 'fruit' })
                .then(function (art) {
                    equal(art instanceof $news.Types.Article, true, 'valid type');
                    equal(typeof art.Id, 'number', 'has Id');
                    equal(art.Title, 'watermelon', 'has Title');
                    equal(art.Lead, 'fruit', 'has Lead');

                    return $data('Article').removeAll().then(function () {
                        return $data('Article', 'remote').itemCount();
                    });
                })
                .then(function (count) {
                    equal(count, 0, 'item deleted');

                    $data.ItemStore = new $data.ItemStoreClass();
                    start();
                });

        })
        .fail(function (e) {
            ok(false, 'Error' + e);
            $data.ItemStore = new $data.ItemStoreClass();
            start();
        });
    });

    test('add contextToken as factory', 5, function () {
        stop(1);
        var context = new $news.Types.NewsContext({ name: 'local', oDataServiceHost: "Services/emptyNewsReader.svc" });
        $data.addStore('remote', context.contextToken, true).then(function () {
            $data('Article', 'remote')
                .save({ Title: 'watermelon', Lead: 'fruit' })
                .then(function (art) {
                    equal(art instanceof $news.Types.Article, true, 'valid type');
                    equal(typeof art.Id, 'number', 'has Id');
                    equal(art.Title, 'watermelon', 'has Title');
                    equal(art.Lead, 'fruit', 'has Lead');

                    return $data('Article').removeAll().then(function () {
                        return $data('Article', 'remote').itemCount();
                    });
                })
                .then(function (count) {
                    equal(count, 0, 'item deleted');

                    $data.ItemStore = new $data.ItemStoreClass();
                    start();
                });

        })
        .fail(function (e) {
            ok(false, 'Error' + e);
            $data.ItemStore = new $data.ItemStoreClass();
            start();
        });
    });

});