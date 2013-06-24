function EntityContextTests(providerConfig, msg) {
    msg = msg || '';
    module("BugFix" + msg);

    test('store token set after saveChanges', 4, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            var article = new db.Articles.elementType({ Title: 'Title', Lead: 'Lead', Body: 'Body' });
            db.Articles.add(article);
            equal(article.storeToken, undefined, 'StoreToken is not avaliable after create');

            db.saveChanges(function () {
                db.Articles.toArray(function (res) {
                    var rarticle = res[0];

                    equal(rarticle.Title, 'Title', 'Article Title');
                    equal(article.storeToken, db.storeToken, 'StoreToken is set');
                    equal(article.storeToken, rarticle.storeToken, 'StoreToken is same on loaded entity');

                    start();
                });
            });
        });
    });

    test('no attach Child entity at save', 3, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.include('Category').filter('it.Id == 1').toArray(function (res) {
                    var article = res[0];
                    db.Articles.attach(article);
                    article.Title = 'Changed_Title';
                    article.Category = article.Category;
                    article.Category.Title = 'Changed_Category_Title';

                    db.saveChanges(function () {
                        db.Articles.include('Category').filter('it.Id == 1').toArray(function (res) {
                            var rarticle = res[0];

                            equal(rarticle.Title, 'Changed_Title', 'Article Title Changed');
                            equal(rarticle.Category.Id, article.Category.Id, 'Article.Category Id not Changed');
                            equal(rarticle.Category.Title, 'Changed_Category_Title', 'Article.Category Title Changed');

                            start();
                        });
                    });
                });
            });
        });
    });

    test('no attach Child entity at save 2', 3, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.include('Category').filter('it.Id == 1').toArray(function (res) {
                    var article = res[0];
                    db.Articles.attach(article);
                    article.Category = article.Category;
                    article.Category.Title = 'Changed_Category_Title';

                    db.saveChanges(function () {
                        db.Articles.include('Category').filter('it.Id == 1').toArray(function (res) {
                            var rarticle = res[0];

                            equal(rarticle.Title, article.Title, 'Article not Changed');
                            equal(rarticle.Category.Id, article.Category.Id, 'Article.Category Id not Changed');
                            equal(rarticle.Category.Title, 'Changed_Category_Title', 'Article.Category Title Changed');

                            start();
                        });
                    });
                });
            });
        });
    });

    test('no attach Child entity at save 3', 2, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Categories.include('Articles').filter('it.Id == 1').toArray(function (res) {
                    var category = res[0];
                    db.Categories.attach(category);
                    category.Title = 'Changed_Title';
                    category.Articles[0].Title = 'Changed_Articles[0]_Title';

                    db.saveChanges(function () {
                        db.Categories.include('Articles').filter('it.Id == 1').toArray(function (res) {
                            var rcategory = res[0];

                            equal(rcategory.Title, 'Changed_Title', 'Category Title Changed');
                            equal(rcategory.Articles.filter(function (c) { return c.Title == rcategory.Articles[0].Title && c.Id == rcategory.Articles[0].Id }).length, 1, 'Article.Articles[0] Id not Changed')

                            start();
                        });
                    });
                });
            });
        });
    });

    test('no attach Child entity at save 3', 2, function () {
        stop();
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Categories.include('Articles').filter('it.Id == 1').toArray(function (res) {
                    var category = res[0];
                    db.Categories.attach(category);
                    category.Articles[0].Title = 'Changed_Articles[0]_Title';

                    db.saveChanges(function () {
                        db.Categories.include('Articles').filter('it.Id == 1').toArray(function (res) {
                            var rcategory = res[0];

                            equal(rcategory.Title, category.Title, 'Article not Changed');
                            equal(rcategory.Articles.filter(function (c) { return c.Title == rcategory.Articles[0].Title && c.Id == rcategory.Articles[0].Id }).length, 1, 'Article.Articles[0] Id not Changed')

                            start();
                        });
                    });
                });
            });
        });
    });

    test("Guid key with ' in ' structure", 6, function () {

        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.TestTable2.add(new $news.Types.TestItemGuid({
                    Id: $data.createGuid().toString(),
                    Title: 'Title_test_' + i
                }));
            }

            context.saveChanges(function () {
                context.TestTable2.map('it.Id').take(2).toArray(function (res) {
                    equal(res.length, 2, 'result count');
                    equal(typeof res[0], 'string', 'item 0 is string');
                    equal(typeof res[1], 'string', 'item 1 is string');

                    context.TestTable2.filter(function (it) { return it.Id in this.keys }, { keys: res }).toArray(function (typedRes) {
                        equal(res.length, 2, 'result count');

                        for (var i = 0; i < 2; i++) {
                            ok(res.indexOf(typedRes[i].Id >= 0), "key '" + typedRes[i].Id + "' in result");
                        }


                        start();
                    });
                });
            });
        });

    });

    test("Guid key delete", 2, function () {

        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            var item = new $news.Types.TestItemGuid({
                Id: $data.createGuid().toString(),
                s0: 'Title_test'
            })

            context.TestTable2.add(item);

            context.saveChanges(function () {
                context.TestTable2.toArray(function (res) {
                    
                    equal(res[0].Id, item.Id, 'keys');

                    context.TestTable2.remove(res[0]);

                    context.saveChanges(function () {
                        context.TestTable2.toArray(function (res2) {
                            equal(res2.length, 0, 'table is clear');


                            start();
                        });
                    });
                });
            });
        });
    });

    test("Guid key update", 4, function () {

        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

            var item = new $news.Types.TestItemGuid({
                Id: $data.createGuid().toString(),
                s0: 'Title_test'
            })

            context.TestTable2.add(item);

            context.saveChanges(function () {
                context.TestTable2.toArray(function (res) {

                    equal(res[0].Id, item.Id, 'keys');
                    equal(res[0].s0, item.s0, 'Title_test');

                    context.TestTable2.attach(res[0]);
                    res[0].s0 = 'Title_test2';


                    context.saveChanges(function () {
                        context.TestTable2.toArray(function (res2) {
                            equal(res2.length, 1, 'table is clear');
                            equal(res2[0].s0, 'Title_test2', 'Title_test2');

                            start();
                        });
                    });
                });
            });
        });
    });

    test('deep_include_fix', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(18);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var trace = db.Users.include('Articles.Category').include('Profile').toTraceString();
                var config = trace.modelBinderConfig;
                ok(config.$item, 'no $item');
                ok(config.$item.Articles, 'no Articles');
                ok(config.$item.Articles.$item, 'no Articles.$item');
                ok(config.$item.Articles.$item.Category, 'no Articles.Category');
                ok(config.$item.Profile, 'no Profile');

                db.Users.include('Articles.Category').include('Profile').filter(function (it) { return it.LoginName == this.name; }, { name: 'Usr1' }).toArray(function (users) {
                    ok(users, 'no users');
                    ok(Array.isArray(users), 'not an Array');
                    ok(users[0], 'empty');
                    ok(users[0] instanceof $news.Types.User, 'not a User');
                    equal(users[0].Email, 'usr1@company.com', 'bad Email');
                    ok(Array.isArray(users[0].Articles), 'not an Array');
                    ok(users[0].Articles[0], 'empty');
                    ok(users[0].Articles[0] instanceof $news.Types.Article, 'not an Article');
                    ok(users[0].Articles[0].Category, 'bad Category');
                    ok(users[0].Articles[0].Category instanceof $news.Types.Category, 'not a Category');
                    ok(users[0].Profile, 'bad Profile');
                    ok(users[0].Profile instanceof $news.Types.UserProfile, 'not a UserProfile');
                    equal(users[0].Profile.Bio, 'Bio1', 'bad Profile.Bio');
                    start(1);
                });
            });
        });
    });

    test('remove navgation property value', function () {
        expect(4);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.include('Category').filter('it.Id == 1').toArray(function (items) {
                    var item = items[0];
                    db.Articles.attach(item);
                    notEqual(item.Category, null, 'article category is not null');
                    equal(item.Category instanceof $news.Types.Category, true, 'article category is Category');

                    item.Category = null;
                    equal(item.Category, null, 'article category set to null');

                    db.saveChanges(function () {

                        db.Articles.include('Category').filter('it.Id == 1').toArray(function (items2) {
                            equal(items2[0].Category, null, 'article has valid category value');

                            start();
                        });
                    });
                });
            });
        });
    });

    test('remove navgation property value without inclue', function () {
        expect(4);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.filter('it.Id == 1').toArray(function (items) {
                    var item = items[0];
                    db.Articles.attach(item);
                    ok(item.Category !== null, 'article category is not null');
                    equal(item.Category, undefined, 'article category is undefined');

                    item.Category = null;
                    equal(item.Category, null, 'article category set to null');

                    db.saveChanges(function () {

                        db.Articles.include('Category').filter('it.Id == 1').toArray(function (items2) {
                            equal(items2[0].Category, null, 'article has valid category value');

                            start();
                        });
                    });
                });
            });
        });
    });

    test('load entity without include', function () {
        expect(3);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            //$news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.add({ Title: 'TitleData', Lead: 'LeadData' });
                db.saveChanges(function () {

                    db.Articles.length(function (c) {
                        console.log("!!!!", c);
                        db.Articles.single('it.Title == "TitleData"', null, function (item) {
                            db.Articles.attach(item);
                            ok(item.Category === undefined, 'article category is undefined');
                            equal(item.Title, 'TitleData', 'item title');
                            equal(item.Lead, 'LeadData', 'item lead');

                            start();
                        });

                    });
                });
            //});
        });
    });

    test('load entity with include', function () {
        expect(3);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            //$news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.add({ Title: 'TitleData', Lead: 'LeadData' });
                db.saveChanges(function () {


                    db.Articles.include('Category').single('it.Title == "TitleData"', null, function (item) {
                        db.Articles.attach(item);
                        ok(item.Category === null, 'article category is null');
                        equal(item.Title, 'TitleData', 'item title');
                        equal(item.Lead, 'LeadData', 'item lead');

                        start();
                    });
                });
            //});
        });
    });

    test('date null value', function () {
        expect(2);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var a1 = new db.Articles.elementType({ Title: '123', Lead: 'asd', CreateDate: null });
                db.Articles.add(a1);
                db.saveChanges({
                    success: function () {
                        db.Articles.filter('it.Title === "123" || it.Id === 1').toArray(function (res) {
                            if (res[0].CreateDate === null) {
                                equal(res[0].CreateDate, null, 'CreateDate is null')
                                notEqual(res[1].CreateDate, null, 'CreateDate not null')
                            } else {
                                equal(res[1].CreateDate, null, 'CreateDate is null')
                                notEqual(res[0].CreateDate, null, 'CreateDate not null')
                            }

                            start();
                        });
                    },
                    error: function () {
                        ok(false, 'error called');
                        start();
                    }
                });
            });
        });
    });
    test('batch error handler called', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(1);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var a1 = db.Articles.attachOrGet({ Id: 1 });
                a1.Title = 'changed2';

                var a2 = db.Articles.attachOrGet({ Id: 2 });
                a2.Title = 'changed2';

                db.saveChanges({
                    success: function () {
                        ok(false, 'save success');
                        start();
                    },
                    error: function () {
                        ok(true, 'error called');
                        start();
                    }
                });
            });
        });
    });
    test('map as jaydata type', function () {
        expect(6);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.orderBy('it.Id').map(function (a) { return { Id: a.Id, Lead: a.Lead, Body: a.Body, Category: a.Category }; }, null, $news.Types.Article).toArray(function (art) {
                    equal(art[1] instanceof $news.Types.Article, true, 'result is typed');

                    equal(typeof art[1].Id, 'number', 'result Id is typed');
                    equal(typeof art[1].Lead, 'string', 'result Lead is typed');
                    equal(typeof art[1].Body, 'string', 'result Body is typed');
                    equal(typeof art[1].CreateDate, 'undefined', 'result CreateDate is undefined');
                    equal(art[1].Category instanceof $news.Types.Category, true, 'art[1].Category is Array');

                    start();
                });
            });

        });
    });
    test('map as default', function () {
        expect(6);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.orderBy('it.Id').map(function (a) { return { Id: a.Id, Lead: a.Lead, Body: a.Body, Category: a.Category }; }, null, 'default').toArray(function (art) {
                    equal(art[1] instanceof $news.Types.Article, true, 'result is typed');

                    equal(typeof art[1].Id, 'number', 'result Id is typed');
                    equal(typeof art[1].Lead, 'string', 'result Lead is typed');
                    equal(typeof art[1].Body, 'string', 'result Body is typed');
                    equal(typeof art[1].CreateDate, 'undefined', 'result CreateDate is undefined');
                    equal(art[1].Category instanceof $news.Types.Category, true, 'art[1].Category is Array');

                    start();
                });
            });

        });
    });
    test('sqLite 0..1 table generation not required', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }

        expect(1);
        stop(1);

        $data.Class.define('$example.Types.AClass1', $data.Entity, null, {
            Id: { type: 'int', key: true, computed: true },
            Name: { type: 'string' },
            BItem: { type: '$example.Types.BClass1', inverseProperty: 'AItem' },
        });
        $data.Class.define('$example.Types.BClass1', $data.Entity, null, {
            Id: { type: 'int', key: true, computed: true },
            Name: { type: 'string', required: true },
            AItem: { type: 'Array', elementType: '$example.Types.AClass1', inverseProperty: 'BItem' }
        });
        $data.Class.define('$example.Types.ClassContext1', $data.EntityContext, null, {
            AItems: { type: $data.EntitySet, elementType: $example.Types.AClass1 },
            BItems: { type: $data.EntitySet, elementType: $example.Types.BClass1 }
        });



        (new $example.Types.ClassContext1({ name: 'sqLite', databaseName: 'T1_ClassContext1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }))
            .onReady(function (db) {
                var a = new $example.Types.AClass1({ Name: 'name1', BItem: null });
                db.AItems.add(a);
                db.saveChanges({
                    success: function () {
                        ok('save success', 'save success');
                        start();
                    },
                    error: function (ex) {
                        ok(false, ex.message);
                        start();
                    }
                });
            });
    });
    test('sqLite 0..1 table generation required', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }

        expect(1);
        stop(1);

        $data.Class.define('$example.Types.AClass2', $data.Entity, null, {
            Id: { type: 'int', key: true, computed: true },
            Name: { type: 'string' },
            BItem: { type: '$example.Types.BClass2', required: true, inverseProperty: 'AItem' },
        });
        $data.Class.define('$example.Types.BClass2', $data.Entity, null, {
            Id: { type: 'int', key: true, computed: true },
            Name: { type: 'string', required: true },
            AItem: { type: 'Array', elementType: '$example.Types.AClass2', inverseProperty: 'BItem' }
        });
        $data.Class.define('$example.Types.ClassContext2', $data.EntityContext, null, {
            AItems: { type: $data.EntitySet, elementType: $example.Types.AClass2 },
            BItems: { type: $data.EntitySet, elementType: $example.Types.BClass2 }
        });



        (new $example.Types.ClassContext2({ name: 'sqLite', databaseName: 'T1_ClassContext2', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }))
            .onReady(function (db) {
                var a = new $example.Types.AClass2({ Name: 'name1', BItem: null });
                db.AItems.add(a);
                db.saveChanges({
                    success: function () {
                        ok(false, 'required field failed');
                        start();
                    },
                    error: function (ex) {
                        ok(ex.message.indexOf('constraint failed') >= 0, 'required side is required');
                        start();
                    }
                });
            });
    });
    test('sqLite 0..1 table generation not required guid key', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }

        expect(1);
        stop(1);

        $data.Class.define('$example.Types.AClass1g', $data.Entity, null, {
            Id: { type: 'guid', key: true, required: true },
            Name: { type: 'string' },
            BItem: { type: '$example.Types.BClass1g', inverseProperty: 'AItem' },
        });
        $data.Class.define('$example.Types.BClass1g', $data.Entity, null, {
            Id: { type: 'guid', key: true, required: true },
            Name: { type: 'string', required: true },
            AItem: { type: 'Array', elementType: '$example.Types.AClass1g', inverseProperty: 'BItem' }
        });
        $data.Class.define('$example.Types.ClassContext1g', $data.EntityContext, null, {
            AItems: { type: $data.EntitySet, elementType: $example.Types.AClass1g },
            BItems: { type: $data.EntitySet, elementType: $example.Types.BClass1g }
        });



        (new $example.Types.ClassContext1g({ name: 'sqLite', databaseName: 'T1_ClassContext1g', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }))
            .onReady(function (db) {
                var a = new $example.Types.AClass1g({ Id: $data.parseGuid('97e78352-13ef-4068-9ed7-31023bbd8204'), Name: 'name1', BItem: null });
                db.AItems.add(a);
                db.saveChanges({
                    success: function () {
                        ok('save success', 'save success');
                        start();
                    },
                    error: function (ex) {
                        ok(false, ex.message);
                        start();
                    }
                });
            });
    });
    test('sqLite 0..1 table generation required guid key', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }

        expect(1);
        stop(1);

        $data.Class.define('$example.Types.AClass2g', $data.Entity, null, {
            Id: { type: 'guid', key: true, required: true },
            Name: { type: 'string' },
            BItem: { type: '$example.Types.BClass2g', required: true, inverseProperty: 'AItem' },
        });
        $data.Class.define('$example.Types.BClass2g', $data.Entity, null, {
            Id: { type: 'guid', key: true, required: true },
            Name: { type: 'string', required: true },
            AItem: { type: 'Array', elementType: '$example.Types.AClass2g', inverseProperty: 'BItem' }
        });
        $data.Class.define('$example.Types.ClassContext2g', $data.EntityContext, null, {
            AItems: { type: $data.EntitySet, elementType: $example.Types.AClass2g },
            BItems: { type: $data.EntitySet, elementType: $example.Types.BClass2g }
        });



        (new $example.Types.ClassContext2g({ name: 'sqLite', databaseName: 'T1_ClassContext2g', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }))
            .onReady(function (db) {
                var a = new $example.Types.AClass2g({ Id: $data.parseGuid('97e78352-13ef-4068-9ed7-31023bbd8204'), Name: 'name1', BItem: null });
                db.AItems.add(a);
                db.saveChanges({
                    success: function () {
                        ok(false, 'required field failed');
                        start();
                    },
                    error: function (ex) {
                        ok(ex.message.indexOf('constraint failed') >= 0, 'required side is required');
                        start();
                    }
                });
            });
    });
    test('navProperty many', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

        expect(5);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.map(function (a) { return { id: a.Id, catArticles: a.Category.Articles }; }).toArray(function (art) {
                    console.log(art);
                    equal(art[0].catArticles instanceof Array, true, 'many nav property is array');
                    equal(art[1].catArticles instanceof Array, true, 'many nav property is array');

                    equal(art[1].catArticles[0] instanceof $news.Types.Article, true, 'item[1].catArticles[0] is $news.Types.Article');
                    equal(art[1].catArticles[0].Body, 'Body1', 'item[1].catArticles[0].Body has value');
                    equal(art[1].catArticles[0].Lead, 'Lead1', 'item[1].catArticles[0].Lead has value');
                    start();
                });
            });

        });
    });
    test('navProperty single', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

        expect(3);
        stop(1);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.map(function (a) { return { id: a.Id, category: a.Category }; }).toArray(function (art) {
                    equal(art[0].category instanceof $news.Types.Category, true, 'many nav property is $news.Types.Category');
                    equal(art[1].category instanceof $news.Types.Category, true, 'many nav property is $news.Types.Category');

                    equal(art[1].category.Title, 'Sport', 'art[1].category.Title has value');
                    start();
                });
            });

        });
    });
    test('guid key, navProperty', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

        expect(8);
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            var itemGrp = new $news.Types.TestItemGroup({ Id: $data.parseGuid('73304541-7f4f-4133-84a4-16ccc2ce600d'), Name: 'Group1' });
            equal(itemGrp.Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', ' init guid value');
            var item = new $news.Types.TestItemGuid({ Id: $data.parseGuid('bb152892-3a48-4ffa-83cd-5f952e21c6eb'), i0: 0, b0: true, s0: '0', Group: itemGrp });

            //db.TestItemGroups.add(itemGrp);
            db.TestTable2.add(item);

            db.saveChanges(function () {
                db.TestItemGroups.toArray(function (res) {
                    equal(res[0].Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', 'res init guid value');
                    db.TestTable2.toArray(function (res2) {
                        equal(res2[0].Id, 'bb152892-3a48-4ffa-83cd-5f952e21c6eb', 'res2 init guid value');


                        db.TestItemGroups.attach(itemGrp);
                        var item2 = new $news.Types.TestItemGuid({ Id: $data.parseGuid('03be7d99-5dc1-464b-b890-5b997c86a798'), i0: 1, b0: true, s0: '0', Group: itemGrp });
                        db.TestTable2.add(item2);

                        db.saveChanges(function () {
                            db.TestItemGroups.toArray(function (res) {
                                equal(res.length, 1, 'res length');
                                equal(res[0].Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', 'res init guid value');
                                db.TestTable2.orderBy('it.i0').toArray(function (res2) {
                                    equal(res2.length, 2, 'res2 length');
                                    equal(res2[0].Id, 'bb152892-3a48-4ffa-83cd-5f952e21c6eb', 'res2 init guid value');
                                    equal(res2[1].Id, '03be7d99-5dc1-464b-b890-5b997c86a798', 'res2 init guid value');
                                    start();
                                });
                            });
                        });

                    })
                })
            });

        });
    });
    test('concurrency test', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

        expect(8);
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                $news.Types.NewsContext.generateTestData(db, function () {
                    db.Articles.toArray(function (a) {
                        db.Articles.toArray(function (a2) {
                            var article = a[0];
                            var article2 = a2[0];
                            equal(article.Id, article2.Id, 'test items equal failed');
                            equal(article.RowVersion, article2.RowVersion, 'test items RowVersion equal failed');

                            db.Articles.attach(article);
                            article.Body += 'Changed body';
                            db.saveChanges(function () {
                                equal(article.Id, article2.Id, 'test items equal');
                                notEqual(article.RowVersion, article2.RowVersion, 'test items RowVersion notequal failed');

                                db.Articles.attach(article2);
                                article2.Body += 'Changed later';

                                db.saveChanges({
                                    success: function () {
                                        start(1);
                                        ok(false, 'save success on invalid element failed');
                                    },
                                    error: function () {
                                        article2.RowVersion = '*';
                                        db.saveChanges({
                                            success: function () {

                                                equal(article.Id, article2.Id, 'test items equal');
                                                notEqual(article.RowVersion, article2.RowVersion, 'test items RowVersion notequal failed');

                                                db.Articles.filter(function (art) { return art.Id == this.Id }, { Id: article2.Id }).toArray(function (a3) {
                                                    start(1);

                                                    equal(a3[0].Id, article2.Id, 'test items equal failed');
                                                    equal(a3[0].RowVersion, article2.RowVersion, 'test items RowVersion equal failed');
                                                });
                                            },
                                            error: function () {
                                                start(1);
                                                ok(false, 'save not success on valid element failed');
                                            }
                                        });
                                    }
                                })

                            });
                        });
                    });
                });


            } catch (ex) {
                start(1);
                ok(false, "Unhandled exception occured");
                console.log("--=== concurrency test: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('OData provider - Filter by GUID field should be supported', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

        expect(20);
        stop(6);
        $data.Class.define("$news.Types.TestItemExtended", $data.Entity, null, {
            Id: { type: "int", key: true },
            i0: { type: "int" },
            b0: { type: "boolean" },
            s0: { type: "string" },
            blob: { type: "blob" },
            n0: { type: "number" },
            d0: { type: "date" },
            g0: { type: "guid" },
        }, null);

        $data.Class.define("$news.Types.NewsContextPartial", $data.EntityContext, null, {
            TestTable: { type: $data.EntitySet, elementType: $news.Types.TestItemExtended }
        });

        (new $news.Types.NewsContextPartial(providerConfig)).onReady(function (db) {
            var guid = new $data.Guid('ae22ffc7-8d96-488e-84f2-c04753242348');

            var q = db.TestTable.filter(function (t) { return t.g0 == this.guid }, { guid: guid });
            var q2 = db.TestTable.filter(function (t) { return t.g0 == this.guid }, { guid: new $data.Guid('c22f0ecd-8cff-403c-89d7-8d18c457f1ef') });
            var q3 = db.TestTable.filter(function (t) { return t.g0 == this.guid }, { guid: new $data.Guid() });
            var q4 = db.TestTable.filter(function (t) { return t.g0 == this.guid }, { guid: null });

            if (providerConfig.name == "sqLite") { ok(true, "Not supported"); ok(true, "Not supported"); ok(true, "Not supported"); ok(true, "Not supported"); }
            else {
                equal(q.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'ae22ffc7-8d96-488e-84f2-c04753242348')", 'param guid failed');
                equal(q2.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'c22f0ecd-8cff-403c-89d7-8d18c457f1ef')", 'inline guid failed');
                equal(q3.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'00000000-0000-0000-0000-000000000000')", 'empty guid failed');
                equal(q4.toTraceString().queryText, "/TestTable?$filter=(g0 eq null)", 'null guid failed');
            }
            var item1 = new $news.Types.TestItemExtended({ Id: 42, g0: guid });
            var item2 = new $news.Types.TestItemExtended({ Id: 43, g0: new $data.Guid('c22f0ecd-8cff-403c-89d7-8d18c457f1ef') });
            var item3 = new $news.Types.TestItemExtended({ Id: 44, g0: new $data.Guid() });
            var item4 = new $news.Types.TestItemExtended({ Id: 45, g0: null });
            db.TestTable.add(item1);
            db.TestTable.add(item2);
            db.TestTable.add(item3);
            db.TestTable.add(item4);
            db.saveChanges(function () {
                db.TestTable.toArray(function (items) {
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        switch (item.Id) {
                            case 42:
                                equal(item.g0, 'ae22ffc7-8d96-488e-84f2-c04753242348', "Id:42, guid value failed");
                                break;
                            case 43:
                                equal(item.g0, 'c22f0ecd-8cff-403c-89d7-8d18c457f1ef', "Id:43, guid value failed");
                                break;
                            case 44:
                                equal(item.g0, '00000000-0000-0000-0000-000000000000', "Id:44, guid value failed");
                                break;
                            case 45:
                                equal(item.g0, null, "Id:45, guid value failed");
                                break;
                            default:
                        }
                    }
                    start();
                });

                q.toArray(function (items) {
                    equal(items.length, 1, 'result count failed');
                    equal(items[0].g0.toString(), 'ae22ffc7-8d96-488e-84f2-c04753242348', "param guid value failed");
                    start();
                });
                q2.toArray(function (items) {
                    equal(items.length, 1, 'result count failed');
                    equal(items[0].g0.toString(), 'c22f0ecd-8cff-403c-89d7-8d18c457f1ef', "param inline value failed");
                    start();
                });
                q3.toArray(function (items) {
                    equal(items.length, 1, 'result count failed');
                    equal(items[0].g0.toString(), '00000000-0000-0000-0000-000000000000', "param empty value failed");
                    start();
                });
                q4.toArray(function (items) {
                    equal(items.length, 1, 'result count failed');
                    equal(items[0].g0, null, "param null value failed");
                    start();
                });

                db.TestTable.map(function (t) { return t.g0; }).toArray(function (items) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i]) {
                            equal($data.parseGuid(items[i]) instanceof $data.Guid, true, 'guid map failed: ' + i);
                        } else {
                            equal(items[i], null, 'guid map failed: ' + i);
                        }
                    }
                    start();
                });

            });


        });


    });
    test('EntityField == null or null == EntityField filter', 6, function () {
        stop(6);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    db.Articles.toArray(function (a) {
                        start(1);
                        var article = a[0];
                        db.Articles.attach(article);
                        article.Body = null;
                        db.saveChanges(function () {
                            start(1);
                            db.Articles.filter(function (a) { return a.Body == null; }).toArray(function (a1) {
                                start(1);
                                equal(a1.length, 1, 'result count failed');
                                equal(a1[0] instanceof $news.Types.Article, true, 'result type failed');
                                equal(a1[0].Body, null, 'result type failed');


                            });
                            db.Articles.filter(function (a) { return null == a.Body; }).toArray(function (a1) {
                                start(1);
                                equal(a1.length, 1, 'result count failed');
                                equal(a1[0] instanceof $news.Types.Article, true, 'result type failed');
                                equal(a1[0].Body, null, 'result type failed');


                            });
                        });

                    });
                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== EntityField == null or null == EntityField filter filter: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('EntityField != null or null != EntityField filter', 2, function () {
        stop(6);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    db.Articles.toArray(function (a) {
                        start(1);
                        var article = a[0];
                        db.Articles.attach(article);
                        article.Body = null;
                        db.saveChanges(function () {
                            start(1);
                            db.Articles.filter(function (a) { return a.Body != null; }).toArray(function (a1) {
                                start(1);
                                equal(a1.length, a.length - 1, 'result count failed');;
                            });
                            db.Articles.filter(function (a) { return null != a.Body; }).toArray(function (a1) {
                                start(1);
                                equal(a1.length, a.length - 1, 'result count failed');
                            });
                        });

                    });
                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== EntityField == null or null == EntityField filter filter: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_even if a simple field is projected an Article is returned', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.map(function (a) { return a.Title });
                    q.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        equal(typeof a[0], 'string', 'result type failed');
                    });
                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test1', 4, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q1 = db.Articles.map(function (a) { return { t: a.Title, i: a.Id }; });
                    q1.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        equal(a[0] instanceof Object, true, 'result type failed');
                        equal(typeof a[0].t, 'string', 'result type failed');
                        equal(typeof a[0].i, 'number', 'result type failed');
                    });
                });

            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test2', 3, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q2 = db.Articles.map(function (a) { return a.Author; });
                    console.dir(q2.toTraceString());
                    q2.toArray(function (a) {
                        start(1);
                        console.dir(a);
                        equal(a[0] instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].LoginName, 'string', 'result type failed');
                        equal(typeof a[0].Id, 'number', 'result type failed');
                    });
                });


            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test3', 6, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q3 = db.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author }; });
                    q3.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        notEqual(a[0] instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].Title, 'string', 'result type failed');
                        equal(a[0].Auth instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].Auth.LoginName, 'string', 'result type faild');
                        notEqual(a[0].Auth.LoginName.length, 0, 'login name not fill');
                    });
                });
            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test4', 11, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q3 = db.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author, Prof: a.Author.Profile, Z: a.Author.Profile.Bio, k: a.Author.LoginName }; });

                    q3.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        notEqual(a[0] instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].Title, 'string', 'result type failed');
                        equal(a[0].Auth instanceof $news.Types.User, true, 'result type failed');
                        equal(typeof a[0].Auth.LoginName, 'string', 'result type faild');
                        notEqual(a[0].Auth.LoginName.length, 0, 'login name not fill');
                        equal(a[0].Prof instanceof $news.Types.UserProfile, true, "result type faild");
                        equal(typeof a[0].Prof.Bio, 'string', 'result type faild');
                        equal(typeof a[0].Z, 'string', 'result type faild');
                        equal(a[0].Z, a[0].Prof.Bio, 'result type faild');
                        equal(typeof a[0].k, "string", "result type faild");
                    });
                });
            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test5', 3, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q2 = db.Articles.map(function (a) { return a.Author.Profile; });
                    q2.toArray(function (a) {
                        start(1);
                        equal(a[0] instanceof $news.Types.UserProfile, true, 'result type failed');
                        equal(typeof a[0].Bio, 'string', 'result type failed');
                        equal(typeof a[0].Id, 'number', 'result type failed');
                    });
                });


            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1003_additional_test6', 5, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q2 = db.Articles.filter(function (a) { return a.Category.Id == 1; }, null).map(function (a) { return { Title: a.Title, LoginName: a.Author.LoginName }; });
                    q2.toArray(function (a) {
                        start(1);
                        notEqual(a[0] instanceof $news.Types.UserProfile, true, 'result type failed');
                        equal(typeof a[0].Title, 'string', 'Title filed type faild');
                        ok(a[0].Title.length > 0, 'Title field value error');
                        equal(typeof a[0].LoginName, 'string', 'LoginName filed type faild');
                        ok(a[0].LoginName.length > 0, 'LoginName field value error');
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1002_even if map is used with anon type an Article is returned', 3, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    db.Articles.map(function (a) { return { T: a.Title } }).toArray(function (a) {
                        start(1);
                        equal(a[0] instanceof $news.Types.Article, false, 'result type failed');
                        equal(typeof a[0], 'object', 'result type failed');
                        equal(typeof a[0].T, 'string', 'result type property failed');
                    });
                });
            } catch (ex) {
                start(1);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1002_even if map is used with anon type an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1001_Article CreateDate comes bac Invalid date', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    db.Articles.toArray(function (a) {
                        start(1);
                        equal(a[0] instanceof $news.Types.Article, true, 'result type failed');
                        notEqual(a[0].CreateDate.valueOf(), NaN, 'datetime value failed');
                    });
                });
            } catch (ex) {
                start(1);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1001_Article CreateDate comes bac Invalid date: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1048_ODATA attach -> saveChanges error', 1, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);


                    db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                        start(1);
                        if (result.length) {
                            var save = result[0];
                            db.Articles.attach(save);
                            save.Title = 'alma';
                            save.Lead = 'alma';
                            save.Body = 'alma';
                            //db.Articles.attach(save);
                            db.saveChanges(function (count) {
                                start(1);
                                equal(count, 1, "save error");
                            });
                        }
                    });
                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1048_ODATA delete -> saveChanges error', 1, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);


                    db.UserProfiles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                        start(1);
                        if (result.length) {
                            var save = result[0];
                            db.UserProfiles.remove(save);
                            db.saveChanges(function (count) {
                                start(1);
                                equal(count, 1, "save error");
                            });
                        }
                    });
                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1038_Include complex type property', 7, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.where(function (item) { return item.Id == this.id }, { id: 1 })
                           .select(function (item) {
                               return {
                                   Title: item.Title,
                                   Lead: item.Lead,
                                   Body: item.Body,
                                   CreateDate: item.CreateDate,
                                   Author: {
                                       Profile: item.Author.Profile //Location hiányzik
                                   },
                                   CmpType: item.Author.Profile
                               };
                           });
                    var meta = q.toTraceString();
                    console.dir(meta);
                    q.toArray(function (result) {
                        start(1);
                        console.dir(result);
                        ok(result, 'Query OK');
                        equal(result.length, 1, 'Result nnumber fiaild');

                        notEqual(result[0].Author instanceof $news.Types.UserProfile, true, 'Author type loading faild');
                        equal(result[0].Author.Profile instanceof $news.Types.UserProfile, true, 'Author.Profile type loading faild');

                        equal(result[0].CmpType instanceof $news.Types.UserProfile, true, 'Profile type loading faild');
                        equal(result[0].CmpType.Location instanceof $news.Types.Location, true, 'Profile.Location type loading faild');
                    });
                    ok(true);

                });

            } catch (ex) {
                start(4);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1038_additional_tests_1', 8, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.where(function (item) { return item.Id == this.id }, { id: 1 })
                           .select(function (item) {
                               return {
                                   a: {
                                       b: {
                                           c: {
                                               d: item.Title
                                           }
                                       }
                                   },
                               };
                           });
                    q.toArray(function (result) {
                        start(1);
                        console.dir(result);
                        ok(result, 'Query OK');
                        equal(result.length, 1, 'Result nnumber fiaild');

                        equal(typeof result[0], "object", 'object structure build');
                        equal(typeof result[0].a, "object", 'object structure build (a)');
                        equal(typeof result[0].a.b, "object", 'object structure build (a.b)');
                        equal(typeof result[0].a.b.c, "object", 'object structure build (a.b.c)');
                        equal(typeof result[0].a.b.c.d, "string", 'object structure build (a.b.c.d)');
                        ok(result[0].a.b.c.d.length > 0, 'Complex type loading faild');

                    });
                });

            } catch (ex) {
                start(3);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('978_create article with inline category fails', 3, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                //$news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var a = new $news.Types.Article({ Title: "asdads", Category: new $news.Types.Category({ Title: "CatX" }) });
                    db.Articles.add(a);
                    db.saveChanges(function (count) {
                        start(1);
                        equal(count, 2, "Saved entity count faild");
                        equal(a.Id, 1, 'Article Id faild');
                        equal(a.Category.Id, 1, "category Id faild");
                    });
                //});
            } catch (ex) {
                start(1);
                ok(false, "Unhandled exception occured");
                console.log("--=== 978_create article with inline category fails: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('977_adding new articles with category ends up in error', 3, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Categories.filter(function (a) { return a.Id == 1; }).toArray(function (a) {
                    start(1);
                    var cat = a[0];
                    ok(cat instanceof $news.Types.Category, "Return value do not a category instance");
                    db.Categories.attach(cat);
                    for (var i = 0; i < 100; i++) {
                        var art = new $news.Types.Article({ Title: 'Arti' + i, Category: cat });
                        db.Articles.add(art);
                    }
                    db.saveChanges({
                        success: function (count) {
                            start(1);
                            equal(count, 100, "Saved item count faild");
                        },
                        error: function (error) {
                            start(1);
                            console.dir(error);
                            ok(false, error);
                        }
                    });
                });
            });
        });
    });
    test('976_updating entity will result in cleared out fields in db', 7, function () {
        stop(5);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Articles.filter(function (a) { return a.Id == 1; }).toArray(function (a) {
                    start(1);
                    var art = a[0];
                    ok(art instanceof $news.Types.Article, "Return value do not an article instance");
                    ok(art.Title.length > 0, "Article title faild");

                    db.Articles.attach(art);
                    art.Title = "zpace";
                    var pin_ArticleInitData = JSON.parse(JSON.stringify(art.initData));

                    db.saveChanges(function (count) {
                        start(1);
                        equal(count, 1, "Saved item count faild");
                        db.Articles.filter(function (a) { return a.Id == 1; }).toArray(function (uArticles) {
                            start(1);
                            var uArticle = uArticles[0];
                            ok(uArticle instanceof $news.Types.Article, "Return value do not an article instance");

                            if (providerConfig.name[0] === 'sqLite')//ETag
                            {
                                ok(true, 'sqLite ETag update not supported yet');
                            } else {
                                notEqual(pin_ArticleInitData.RowVersion, uArticle.RowVersion, 'ETag update faild');
                                pin_ArticleInitData.RowVersion = uArticle.RowVersion;//deepEqual helper
                            }
                            var pin_uArticleInitData = JSON.parse(JSON.stringify(uArticle.initData));
                            deepEqual(pin_uArticleInitData, pin_ArticleInitData, "Article saved faild");
                        });
                    });
                });
            });
        });
    });
    test("974_Projection of Navigational property return a typed entity result but it's init data is empty", 4, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return { T: a.Title, A: a.Author } });
                q.toArray(function (articles) {
                    start(1);
                    equal(articles.length, 26, "Article count faild");
                    ok(articles[0].T.length > 0, "Article1", "1st article title field faild");
                    ok(articles[0].A instanceof $news.Types.User, "1st article Author field faild");
                });

            });
        });
    });
    test("975_Complex type projections - illegal instruction", 4, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return { T: a.Title, A: a.Author.Profile.Location } });
                q.toArray({
                    success: function (articles) {
                        start(1);
                        equal(articles.length, 26, "Article count faild");
                        ok(articles[0].T.length > 0, "Article1", "1st article title field faild");
                        ok(articles[0].A instanceof $news.Types.Location, "1st article Author field faild");
                    },
                    error: function (error) {
                        start(1);
                        console.dir(error);
                        ok(false, 'Query erroro!');
                    }
                });

            });
        });
    });
    test("write_boolean_property", 3, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            ok(db, 'Databse generation faild');
            //$news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var item = new $news.Types.TestItem();
                item.b0 = true;
                db.TestTable.add(item);
                db.saveChanges(function () {
                    start(1);
                    db.TestTable.toArray(function (result) {
                        start(1);
                        ok(result, 'query error');
                        ok(result[0].b0, 'boolean result error');
                    });
                });
            //});
        });
    });
    //test("XXX_Projection_scalar_with_function_call", 3, function () {
    //    stop(3);
    //    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //        start(1);
    //        ok(db, 'Databse generation faild');
    //        $news.Types.NewsContext.generateTestData(db, function () {
    //            start(1);
    //            var q = db.Articles.filter(function (a) { return a.Id == 1; }, null).map(function (a) { return a.Title.toLowerCase(); });
    //            q.toArray(function (articles) {
    //                start(1);
    //                console.dir(articles);
    //                equal(articles.length, 1, "Article count faild");
    //                equal(articles[0], "article1", "1st article title field faild");
    //            });

    //        });
    //    });
    //});
    //test('973_Complex types filter - illegal instruction exceptions', 3, function () {
    //    stop(3);
    //    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //        $news.alma = db;
    //        start(1);
    //        ok(db, 'Databse generation faild');
    //        $news.Types.NewsContext.generateTestData(db, function () {
    //            start(1);
    //            var q = db.Articles.filter(function (a) { return a.Author.Profile.Location.Zip == 1115 });
    //            q.toArray(function (articles) {
    //                start(1);
    //                ok(articles, 'Query run success');
    //                equal(articles.length, 5, 'Faild query');
    //            });
    //        });
    //    });
    //});
    test('1012_websql provider - Projected Navigational properties are incorrect.', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);

                    var q = db.Articles.map(function (a) { return { T: a.Title, AuthorID: a.Author.Id, A: a.Author } });
                    q.toArray(function (article) {
                        console.dir(article);
                        start(1);
                        equal(article.length, 26, 'Not all articles loaded');
                        equal(typeof article[0].T, 'string', "result type faild");
                        equal(typeof article[0].AuthorID, 'number', "category filed not loaded");
                        ok(article[0].A instanceof $news.Types.User, "category filed not loaded");
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1024_ODATA projection of complex type does not get values', 3, function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); ok(true, "Not supported"); ok(true, "Not supported"); return; }
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.include("Author.Profile").map(function (a) { return a.Author.Profile.Location });
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Location, true, "result type faild");
                        equal(typeof article[0].Zip, 'number', "result type faild");
                        equal(typeof article[0].City, 'string', "result type faild");
                    });
                });

            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1023_OData include does not include', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.include("Category");
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        notEqual(article[0].Category, undefined, "category filed not loaded");
                        equal(typeof article[0].Category.Title, 'string', 'Category title type faild');
                        ok(article[0].Category.Title.length > 0, 'Category title not loaded');
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1023_additional_test_1', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(6);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.include("Author.Profile");
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        equal(article[0].Category, undefined, "category filed not loaded");

                        ok(article[0].Author !== undefined, "category filed not loaded");
                        ok(article[0].Author.Profile !== undefined, "category filed not loaded");

                        equal(typeof article[0].Author.Profile.Bio, 'string', 'Category title type faild');
                        ok(article[0].Author.Profile.Bio.length > 0, 'Category title type faild');
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1023_additional_test_2', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(14);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.include("Author").include("Author.Profile").include("Reviewer.Profile");
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        ok(article[0].Category === undefined, "category filed not loaded");

                        equal(article[0].Author instanceof $news.Types.User, true, "result type faild");
                        ok(article[0].Author !== undefined, "category filed not loaded");
                        equal(article[0].Author.Profile instanceof $news.Types.UserProfile, true, "result type faild");
                        ok(article[0].Author.Profile !== undefined, "category filed not loaded");
                        equal(typeof article[0].Author.Profile.Bio, 'string', 'Category title type faild');
                        ok(article[0].Author.Profile.Bio.length > 0, 'Category title type faild');

                        ok(article[0].Reviewer !== undefined, "Reviewer filed not loaded");
                        equal(article[0].Reviewer instanceof $news.Types.User, true, "Reviewer type faild");
                        ok(article[0].Reviewer.Profile !== undefined, "Reviewer.Profile filed not loaded");
                        equal(article[0].Reviewer.Profile instanceof $news.Types.UserProfile, true, "Reviewer.Profile type faild");

                        equal(typeof article[0].Reviewer.Profile.Bio, 'string', 'Category title type faild');
                        ok(article[0].Reviewer.Profile.Bio.length > 0, 'Category title type faild');
                    });
                });

            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1032_ODATA: order by complex type field', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Users.orderBy(function (item) { return item.Profile.FullName; });
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.User, true, "result type faild");
                        ok(article[0].LoginName.length > 0, "category filed not loaded");
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1032_additional_test_1', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.orderBy(function (item) { return item.Author.Profile.FullName; });
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        ok(article[0].Title.length > 0, "category filed not loaded");
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1032_additional_test_2', 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            try {
                start(1);
                $news.Types.NewsContext.generateTestData(db, function () {
                    start(1);
                    var q = db.Articles.orderBy(function (item) { return item.Author.Profile.Location.City; });
                    console.dir(q.toTraceString());
                    q.toArray(function (article) {
                        start(1);
                        equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                        ok(article[0].Title.length > 0, "category filed not loaded");
                    });
                });
            } catch (ex) {
                start(3);
                ok(false, "Unhandled exception occured");
                console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });
    test('1067_ID_field_not_write_back', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        //expect(4);
        stop(6);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Categories
				.filter(function (item) { return item.Id == this.id; }, { id: 1 })
				.toArray(function (result) {
				    start(1);
				    var category = result[0];
				    db.Categories.attach(category);
				    var articleEntity = new $news.Types.Article({
				        Title: 'temp',
				        Lead: 'temp',
				        Body: 'temp',
				        Category: category
				    });

				    db.Articles.add(articleEntity);
				    db.saveChanges({
				        success: function () {
				            start(1);
				            var tags = 'temp'.split(',');
				            db.Tags
						.filter(function (item) { return item.Title in this.tags; }, { tags: tags })
						.toArray(function (result) {
						    start(1);

						    var existing = [];
						    for (var i = 0; i < result.length; i++) {
						        existing.push(result[i].Title);
						    }
						    for (var i = 0; i < tags.length; i++) {
						        var t = tags[i];
						        if (existing.indexOf(t) < 0) {
						            db.TagConnections.add(new $news.Types.TagConnection({ Article: articleEntity, Tag: new $news.Types.Tag({ Title: t }) }));
						        } else {
						            db.Tags.attach(result[i]);
						            db.TagConnections.add(new $news.Types.TagConnection({ Article: articleEntity, Tag: result[i] }));
						        }
						    }
						    db.Articles.attach(articleEntity);
						    db.saveChanges({
						        success: function () {
						            start(1);
						            equal(articleEntity.Id, 27, 'Article Id faild');
						            console.log('Article ID: ' + articleEntity.Id);
						        },
						        error: function (error) {
						            star(1);
						            console.dir(error);
						            ok(false, error);
						        }
						    });
						});
				        },
				        error: function (error) {
				            start(3);
				            console.dir(error);
				            ok(false, error);
				        }
				    });
				});
            });
        });
    });
    test('DANI_CategoryModify', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(1);
        stop(5);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Articles.first(function (a) { return a.Id == 4 }, null, function (article) {
                    start(1);
                    db.Articles.attach(article);
                    article.Title = "Some test data";
                    var cat = new $news.Types.Category({ Id: 5 });
                    db.Categories.attach(cat);
                    article.Category = cat;
                    db.saveChanges(function () {
                        start(1);
                        db.Articles.include('Category').first(function (a) { return a.Id == 4 }, null, function (article2) {
                            start(1);
                            ok(article2.Category instanceof $news.Types.Category, 'faild');
                        });
                    });
                });
            });
        });
    });
    test('get_mapped_custom', 23, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start();
            ok(db, "Db create faild");
            try {
                start();
                $news.Types.NewsContext.generateTestData(db, function () {
                    start();
                    var q = db.Articles
                        .include('Reviewer.Profile.User') //WARN: oData not supported, but not cause error!!! Simple ignore it!
                        .map(function (m) {
                            return {
                                a: m.Title,
                                Author: m.Title,
                                Tags: { Title: m.Title },
                                Reviewer: m.Reviewer.Profile,
                                b: { a: m.Author.Profile.FullName, b: m.Author.LoginName, c: m.Author.Profile.Location }
                            }
                        });
                    //console.dir(q.toTraceString());
                    q.toArray({
                        success: function (r) {
                            start();
                            var m = r[0];
                            equal(typeof m.a, 'string', 'a');
                            equal(typeof m.Author, 'string', 'Author');
                            equal(m.Tags instanceof Object, true, 'Tags');
                            equal(typeof m.Tags.Title, 'string', 'Tags.Title');
                            equal(m.Reviewer instanceof $news.Types.UserProfile, true, 'Reviewer');
                            equal(typeof m.Reviewer.Id, 'number', 'Reviewer.Id');
                            equal(typeof m.Reviewer.FullName, 'string', 'Reviewer.FullName');
                            equal(typeof m.Reviewer.Bio, 'string', 'Reviewer.Bio');
                            //equal(m.Reviewer.Avatar instanceof Object, true, 'Reviewer.Avatar');
                            equal(m.Reviewer.Location instanceof $news.Types.Location, true, 'Reviewer.Location');
                            equal(typeof m.Reviewer.Location.Address, 'string', 'Reviewer.Location.Address');
                            equal(typeof m.Reviewer.Location.City, 'string', 'Reviewer.Location.City');
                            equal(typeof m.Reviewer.Location.Zip, 'number', 'Reviewer.Location.Zip');
                            equal(typeof m.Reviewer.Location.Country, 'string', 'Reviewer.Location.Country');
                            equal(m.Reviewer.Birthday instanceof Date, true, 'Reviewer.Birthday');
                            //equal(m.Reviewer.User instanceof $news.Types.User, true, 'Reviewer.User'); //TODO: not supported yet
                            equal(m.b instanceof Object, true, 'b');
                            equal(typeof m.b.a, 'string', 'b.a');
                            equal(typeof m.b.b, 'string', 'b.b');
                            equal(m.b.c instanceof $news.Types.Location, true, 'b.c');
                            equal(typeof m.b.c.Address, 'string', 'b.c.Address');
                            equal(typeof m.b.c.City, 'string', 'b.c.City');
                            equal(typeof m.b.c.Zip, 'number', 'b.c.Zip');
                            equal(typeof m.b.c.Country, 'string', 'b.c.Country');
                        },
                        error: function (error) { console.log("ERROR"); console.log(error); }
                    });
                });
            } catch (ex) {
                start(2);
                ok(false, "Unhandled exception occured");
                console.log("--=== get_mapped_custom is returned: ");
                console.dir(ex);
                console.log(" ===--");
            }
        });
    });

    test('Include: indirect -> map scalar(string)', 53, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return a.Category.Title });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (categoriesTitle) {
                        start(1);
                        equal(categoriesTitle.length, 26, 'Article category error');
                        categoriesTitle.forEach(function (ct, index) {
                            equal(typeof ct, 'string', 'data type error at ' + index + '. position');
                            ok(ct.length >= 4, 'data length error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> map scalar(int)', 79, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return a.Category.Id });
                q.toArray({
                    success: function (categoriesId) {
                        start(1);
                        equal(categoriesId.length, 26, 'Article category error');
                        categoriesId.forEach(function (ci, index) {
                            equal(typeof ci, 'number', 'data type error at ' + index + '. position');
                            ok(ci > 0, 'data min value error at ' + index + '. position');
                            ok(ci < 6, 'data max value error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> map object include scalar(string)', 79, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return { t: a.Category.Title } });
                console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (categoriesTitle) {
                        start(1);
                        equal(categoriesTitle.length, 26, 'Article category error');
                        categoriesTitle.forEach(function (ct, index) {
                            equal(typeof ct, 'object', 'data type error at ' + index + '. position');
                            equal(typeof ct.t, 'string', 'data type error at ' + index + '. position');
                            ok(ct.t.length >= 4, 'data length error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> map object include scalar(int)', 105, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return { t: a.Category.Id } });
                console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (categoriesId) {
                        start(1);
                        equal(categoriesId.length, 26, 'Article category error');
                        categoriesId.forEach(function (ci, index) {
                            equal(typeof ci, 'object', 'data type error at ' + index + '. position');
                            equal(typeof ci.t, 'number', 'data type error at ' + index + '. position');
                            ok(ci.t > 0, 'data min value error at ' + index + '. position');
                            ok(ci.t < 6, 'data max value error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> map Entity_', function () {
        //if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        expect(105);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return a.Category; });
                console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 26, 'Result number error');
                        results.forEach(function (r, index) {
                            ok(r instanceof $news.Types.Category, 'data type error at ' + index + '. position');
                            ok(r.Id > 0, 'category Id min value error at ' + index + '. position');
                            ok(r.Id < 6, 'category Id max value error at ' + index + '. position');
                            ok(r.Title.length >= 4, 'category title error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    /*FIX: odata need expand*/
    test('Include: indirect -> map EntitySet', 209, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return a.Tags; });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 26, 'Result number error');
                        results.forEach(function (r, index) {
                            ok(r instanceof Array, 'data type error at ' + index + '. position');
                            equal(r.length, 2, "tagconnection number faild");
                            r.forEach(function (tc) {
                                ok(tc instanceof $news.Types.TagConnection, 'data type error at ' + index + '. position');
                                ok(tc.Id > 0, 'TagConnection Id min value error at ' + index + '. position');
                                ok(tc.Id < 53, 'TagConnection Id max value error at ' + index + '. position');
                            });
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> map ComplexType', 19, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.UserProfiles.map(function (up) { return up.Location });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 6, 'Result number error');
                        results.forEach(function (r, index) {
                            ok(r instanceof $news.Types.Location, 'data type error at ' + index + '. position');
                            ok(r.Address.length > 7, 'Location address value error at ' + index + '. position');
                            ok(r.City.length > 4, 'Location city value error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> map object include Entity', 131, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return { r: a.Category }; });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 26, 'Result number error');
                        results.forEach(function (r, index) {
                            equal(typeof r, 'object', 'data type error at ' + index + '. position');
                            ok(r.r instanceof $news.Types.Category, 'data type error at ' + index + '. position');
                            ok(r.r.Id > 0, 'category Id min value error at ' + index + '. position');
                            ok(r.r.Id < 6, 'category Id max value error at ' + index + '. position');
                            ok(r.r.Title.length >= 4, 'category title error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> map object include EntitySet', 287, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return { r: a.Tags }; });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 26, 'Result number error');
                        results.forEach(function (r, index) {
                            equal(typeof r, 'object', 'data type error at ' + index + '. position');
                            ok(r.r instanceof Array, 'data type error at ' + index + '. position');
                            equal(r.r.length, 2, 'TagConnection number error');
                            r.r.forEach(function (tc, index) {
                                ok(tc instanceof $news.Types.TagConnection, 'data type error at ' + index + '. position');
                                ok(tc.Id > 0, 'TagConnection Id min value error at ' + index + '. position');
                                ok(tc.Id < 53, 'TagConnection Id max value error at ' + index + '. position');
                                ok(index < 2, 'TagConnection number error');
                            });
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> map object include ComplexType', 25, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.UserProfiles.map(function (up) { return { r: up.Location } });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 6, 'Result number error');
                        results.forEach(function (r, index) {
                            equal(typeof r, 'object', 'data type error at ' + index + '. position');
                            ok(r.r instanceof $news.Types.Location, 'data type error at ' + index + '. position');
                            ok(r.r.Address.length > 7, 'Location address value error at ' + index + '. position');
                            ok(r.r.City.length > 4, 'Location city value error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> filter scalar(string)', 46, function () {
        var refDate = new Date();
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.filter(function (a) { return a.Category.Title == 'Sport' });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 5, 'Article category error');
                        results.forEach(function (r, index) {
                            ok(r instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                            ok(r.Title.length > 5, 'Title length error at ' + index + '. position');
                            ok(r.Lead.length >= 5, 'Lead length error at ' + index + '. position');
                            ok(r.Body.length >= 5, 'Body length error at ' + index + '. position');
                            ok(r.CreateDate instanceof Date, 'CreateDate data type error at ' + index + '. position');
                            ok(r.CreateDate >= refDate, 'CreateDate value error at ' + index + '. position');
                            ok(r.Category === undefined, 'Category value error  at ' + index + '. position');
                            ok(r.Author === undefined, 'Author value error  at ' + index + '. position');
                            ok(r.Reviewer === undefined, 'Reviewer value error  at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> filter scalar(int)', 91, function () {
        var refDate = new Date();
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.filter(function (a) { return a.Category.Id > 3 });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 10, 'Article category error');
                        results.forEach(function (r, index) {
                            ok(r instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                            ok(r.Title.length > 5, 'Title length error at ' + index + '. position');
                            ok(r.Lead.length > 5, 'Lead length error at ' + index + '. position');
                            ok(r.Body.length > 5, 'Body length error at ' + index + '. position');
                            ok(r.CreateDate instanceof Date, 'CreateDate data type error at ' + index + '. position');
                            ok(r.CreateDate >= refDate, 'CreateDate value error at ' + index + '. position');
                            ok(r.Category === undefined, 'Category value error  at ' + index + '. position');
                            ok(r.Author === undefined, 'Author value error  at ' + index + '. position');
                            ok(r.Reviewer === undefined, 'Reviewer value error  at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> filter ComplexType', 10, function () {
        var refDate = new Date(Date.parse("1976/02/01"));
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.UserProfiles.filter(function (up) { return up.Location.Zip == 1117 });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 1, 'Article category error');
                        results.forEach(function (r, index) {
                            ok(r instanceof $news.Types.UserProfile, 'data type error at ' + index + '. position');
                            equal(r.FullName, 'Full Name', 'Title length error at ' + index + '. position');
                            ok(r.Birthday instanceof Date, 'CreateDate data type error at ' + index + '. position');
                            equal(r.Birthday.valueOf(), refDate.valueOf(), 'CreateDate value error at ' + index + '. position');
                            ok(r.Location instanceof $news.Types.Location, 'Category value error  at ' + index + '. position');
                            equal(r.Location.Zip, 1117, 'Location.Zip value error  at ' + index + '. position');
                            equal(r.Location.City, 'City2', 'Location.City value error  at ' + index + '. position');
                            equal(r.Location.Address, 'Address7', 'Location.Address value error  at ' + index + '. position');
                            equal(r.Location.Country, 'Country2', 'Location.Country value error  at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: indirect -> filter scalar(string) ComplexType', 10, function () {
        var refDate = new Date(Date.parse("1979/05/01"));
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.UserProfiles.filter(function (up) { return up.FullName == 'Full Name2' });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 1, 'Article category error');
                        results.forEach(function (r, index) {
                            ok(r instanceof $news.Types.UserProfile, 'data type error at ' + index + '. position');
                            equal(r.FullName, 'Full Name2', 'FullName value error at ' + index + '. position');
                            ok(r.Birthday instanceof Date, 'Birthday data type error at ' + index + '. position');
                            equal(r.Birthday.valueOf(), refDate.valueOf(), 'Birthday value error at ' + index + '. position');
                            ok(r.Location instanceof $news.Types.Location, 'Location data type at ' + index + '. position');
                            equal(r.Location.Zip, 3451, 'Location.Zip value error  at ' + index + '. position');
                            equal(r.Location.City, 'City5', 'Location.City value error  at ' + index + '. position');
                            equal(r.Location.Address, 'Address0', 'Location.Address value error  at ' + index + '. position');
                            equal(r.Location.Country, 'Country5', 'Location.Country value error  at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: mixed -> filter, map, include', function () {
        if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        expect(39);
        var refDate = new Date(Date.parse("1979/05/01"));
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include("Author.Profile").include("Category")
                            .filter(function (item) { return item.Category.Title == 'World' && item.Author.Profile.FullName == 'Full Name2' && item.Reviewer.Profile.Bio == "Bio3" })
                            .map(function (item) {
                                return {
                                    name: item.Title,
                                    People: {
                                        p1: { name: item.Author.LoginName, prof: item.Author.Profile },
                                        p2: { name: item.Reviewer.LoginName, bio: item.Reviewer.Profile.Bio, tags: item.Tags, adr: item.Reviewer.Profile.Location.Address },
                                        p3: { loc: item.Author.Profile.Location }
                                    },
                                    Cat: item.Category.Title,
                                    Articles: item.Category.Articles
                                }
                            });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 1, 'Article category error');
                        results.forEach(function (r, index) {
                            ok(r instanceof Object, 'data type error at ' + index + '. position');
                            equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                            equal(r.name, 'Article25', 'name value error at ' + index + '. position');

                            ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                            //p1 property
                            ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                            equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                            equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                            ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                            equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                            ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                            equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                            //p2 property
                            ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                            equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                            equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position');
                            equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                            equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position');
                            //p2.Tags
                            ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                            equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                            r.People.p2.tags.forEach(function (t) {
                                ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                            });
                            //p2.adr
                            equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                            //p3.loc
                            ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                            ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                            equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                            //r.Cat
                            equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                            equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position');
                            //r.Articles
                            ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                            equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                            r.Articles.forEach(function (a) {
                                ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                                ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                            });
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: mixed -> filter, map (without complex type property), include', function () {
        //if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        expect(38);
        var refDate = new Date(Date.parse("1979/05/01"));
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include("Author.Profile").include("Category")
                            .filter(function (item) { return item.Category.Title == 'World' && item.Author.Profile.FullName == 'Full Name2' && item.Reviewer.Profile.Bio == "Bio3" })
                            .map(function (item) {
                                return {
                                    name: item.Title,
                                    People: {
                                        p1: { name: item.Author.LoginName, prof: item.Author.Profile },
                                        p2: { name: item.Reviewer.LoginName, bio: item.Reviewer.Profile.Bio, tags: item.Tags },
                                        p3: { loc: item.Author.Profile.Location }
                                    },
                                    Cat: item.Category.Title,
                                    Articles: item.Category.Articles
                                }
                            });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 1, 'Article category error');
                        results.forEach(function (r, index) {
                            ok(r instanceof Object, 'data type error at ' + index + '. position');
                            equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                            equal(r.name, 'Article25', 'name value error at ' + index + '. position');

                            ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                            //p1 property
                            ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                            equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                            equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                            ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                            equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                            ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                            equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                            //p2 property
                            ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                            equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                            equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position');
                            equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                            equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position');
                            //p2.Tags
                            ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                            equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                            r.People.p2.tags.forEach(function (t) {
                                ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                            });
                            //p2.adr
                            //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                            //p3.loc
                            ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                            ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                            equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                            //r.Cat
                            equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                            equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position');
                            //r.Articles
                            ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                            equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                            r.Articles.forEach(function (a) {
                                ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                                ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                            });
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: many mixed -> filter, map (without complex type property), include', function () {
        //if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
        expect(75);
        var refDate = new Date(Date.parse("1979/05/01"));
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include("Author.Profile").include("Category")
                            .filter(function (item) { return (item.Category.Title == 'World' || item.Category.Title == 'Sport') && item.Author.Profile.FullName == 'Full Name2' })
                            .map(function (item) {
                                return {
                                    name: item.Title,
                                    People: {
                                        p1: { name: item.Author.LoginName, prof: item.Author.Profile },
                                        p2: { name: item.Reviewer.LoginName, bio: item.Reviewer.Profile.Bio, tags: item.Tags },
                                        p3: { loc: item.Author.Profile.Location }
                                    },
                                    Cat: item.Category.Title,
                                    Articles: item.Category.Articles
                                }
                            });
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (results) {
                        start(1);
                        equal(results.length, 2, 'Article category error');

                        var r = results[0];
                        var index = 0;

                        ok(r instanceof Object, 'data type error at ' + index + '. position');
                        equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                        equal(r.name, 'Article5', 'name value error at ' + index + '. position');

                        ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                        //p1 property
                        ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                        equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                        equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                        ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                        equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                        ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                        equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                        //p2 property
                        ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                        equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                        equal(r.People.p2.name, 'Usr2', 'r.People.p2.name value error at ' + index + '. position');
                        equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                        equal(r.People.p2.bio, 'Bio2', 'r.People.p2.bio value error at ' + index + '. position');
                        //p2.Tags
                        ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                        equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                        r.People.p2.tags.forEach(function (t) {
                            ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                        });
                        //p2.adr
                        //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                        //p3.loc
                        ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                        ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                        equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                        //r.Cat
                        equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                        equal(r.Cat, 'Sport', 'r.Cat value error at ' + index + '. position');
                        //r.Articles
                        ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                        equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                        r.Articles.forEach(function (a) {
                            ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                            ok(['Article1', 'Article2', 'Article5', 'Article3', 'Article4'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                        });

                        r = results[1];
                        index = 1;

                        ok(r instanceof Object, 'data type error at ' + index + '. position');
                        equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                        equal(r.name, 'Article25', 'name value error at ' + index + '. position');

                        ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                        //p1 property
                        ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                        equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                        equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                        ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                        equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                        ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                        equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                        //p2 property
                        ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                        equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                        equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position');
                        equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                        equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position');
                        //p2.Tags
                        ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                        equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                        r.People.p2.tags.forEach(function (t) {
                            ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                        });
                        //p2.adr
                        //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                        //p3.loc
                        ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                        ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                        equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                        //r.Cat
                        equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                        equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position');
                        //r.Articles
                        ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                        equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                        r.Articles.forEach(function (a) {
                            ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                            ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: direct -> Entity', 105, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include('Category');
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (result) {
                        start(1);
                        equal(result.length, 26, 'Article category error');
                        result.forEach(function (article, index) {
                            ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                            ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                            ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. position');
                            ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position');
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: direct -> EntitySet', 209, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include('Tags');
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (result) {
                        start(1);
                        equal(result.length, 26, 'Article category error');
                        result.forEach(function (article, index) {
                            ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                            ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                            ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position');
                            equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position');
                            article.Tags.forEach(function (tag) {
                                ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position');
                                equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position');
                            });

                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: direct -> Entity EntitySet', 261, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include('Category').include('Tags');
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (result) {
                        start(1);
                        equal(result.length, 26, 'Article category error');
                        result.forEach(function (article, index) {
                            ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                            ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                            ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. position');
                            ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position');
                            ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position');
                            equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position');
                            article.Tags.forEach(function (tag) {
                                ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position');
                                equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position');
                            });

                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: direct -> deep Entity', 209, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include('Author.Profile');
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (result) {
                        start(1);
                        equal(result.length, 26, 'Article category error');
                        result.forEach(function (article, index) {
                            ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                            ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                            ok(article.Author instanceof $news.Types.User, 'article.Author data type error at ' + index + '. position');
                            ok(article.Author.LoginName.length >= 4, 'article.Author.LoginName length error at ' + index + '. position');
                            ok(article.Author.Profile instanceof $news.Types.UserProfile, 'article.Author.Profile type error at ' + index + '. position');
                            ok(article.Author.Profile.Bio.length > 2, 'article.Author.Profile.Bio length number error at ' + index + '. position');

                            ok(article.Author.Profile.Location instanceof $news.Types.Location, 'article.Author.Profile.Location type error at ' + index + '. position');
                            ok(article.Author.Profile.Location.Address.length > 2, 'article.Author.Profile.Location.Address length number error at ' + index + '. position');


                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });
    test('Include: direct -> mixed deep Entity, EntitySet', 417, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include('Author.Profile').include('Category').include('Tags');
                //console.log('q: ', q.toTraceString());
                q.toArray({
                    success: function (result) {
                        start(1);
                        equal(result.length, 26, 'Article category error');
                        result.forEach(function (article, index) {
                            ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                            ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                            ok(article.Author instanceof $news.Types.User, 'article.Author data type error at ' + index + '. position');
                            ok(article.Author.LoginName.length >= 4, 'article.Author.LoginName length error at ' + index + '. position');
                            ok(article.Author.Profile instanceof $news.Types.UserProfile, 'article.Author.Profile type error at ' + index + '. position');
                            ok(article.Author.Profile.Bio.length > 2, 'article.Author.Profile.Bio length number error at ' + index + '. position');

                            ok(article.Author.Profile.Location instanceof $news.Types.Location, 'article.Author.Profile.Location type error at ' + index + '. position');
                            ok(article.Author.Profile.Location.Address.length > 2, 'article.Author.Profile.Location.Address length number error at ' + index + '. position');

                            ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. position');
                            ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position');
                            ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position');
                            equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position');
                            article.Tags.forEach(function (tag) {
                                ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position');
                                equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position');
                            });
                        });
                    },
                    error: function (error) {
                        start(1);
                        ok(false, error);
                    }
                });
            });
        });
    });

    /*test('sqlite_performace_issue', 0, function () {
        stop(1);

        function rng(max) {
            return Math.floor(Math.random() * max);
        }

        function t() {
            return new Date().getTime();
        }

        function addTestData() {
            var targetArticleNr = 2;
            var cycleSize = 1;

            console.log('running NewsReader test\ntargetArticleNr=' + targetArticleNr + '\ncycleSize=' + cycleSize + '\n');

            var s = t();

            // Users
            var users = [];
            for (var i = 0; i < 100; i++) {
                var cUsr = new $news.Types.User({ LoginName: ("Usr" + i), Email: "usr" + i + "@company.com", Profile: new $news.Types.UserProfile({ FullName: "Full Name", Bio: "Bio" + i, Birthday: new Date(2000, 1, 1 - i), Location: new $news.Types.Location({}) }) });
                users.push(cUsr);
                //$news.context.Users.add(cUsr);
            }
            var now = t();
            console.log('Users generated in ' + (now - s) + 'ms');
            s = now;

            // Categories
            var cats = [
                new $news.Types.Category({ Title: "Sport" }),
                new $news.Types.Category({ Title: "World" }),
                new $news.Types.Category({ Title: "Politics" }),
                new $news.Types.Category({ Title: "Tech" }),
                new $news.Types.Category({ Title: "Health" })
            ];
            for (var i = 0; i < cats.length; i++) {
                $news.context.Categories.add(cats[i]);
            }
            now = t();
            console.log('Categories generated in ' + (now - s) + 'ms');
            s = now;

            // Tags
            var tags = [];
            for (var i = 0; i < 50; i++) {
                var cTag = new $news.Types.Tag({ Title: "Tag" + i });
                tags.push(cTag);
                $news.context.Tags.add(cTag);
            }
            now = t();
            console.log('Tags generated in ' + (now - s) + 'ms');
            s = now;

            var acCount = 0;
            while (acCount * cycleSize <= targetArticleNr) {
                if (acCount > 0) {
                    now = t();
                    console.log('Items added (' + acCount * cycleSize + ') at ' + (now - s) + 'ms');
                }

                for (var i = 0; i < cycleSize; i++) {
                    $news.context.Articles.add(new $news.Types.Article({
                        Title: 'Article' + acCount + '_' + i,
                        Lead: 'Lead' + acCount + '_' + i,
                        Body: 'Body' + acCount + '_' + i,
                        CreateDate: Date.now(),
                        Category: cats[rng(cats.length)],
                        Author: users[rng(users.length)],
                        Tags: []
                    }));
                }

                acCount++;
            }

            now = t();
            console.log('Articles generated in ' + (now - s) + 'ms');
            s = now;

            $news.context.saveChanges();

            now = t();
            console.log('Save completed in ' + (now - s) + 'ms');
            start(1);
        }

        $news.context = new $news.Types.NewsContext({ name: "sqLite", databaseName: "emptyNewsReader", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
        $news.context.onReady(addTestData);

        console.log('\nstarting...');
    });*/
}
