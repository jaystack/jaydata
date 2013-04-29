$(document).ready(function () {
    var mockProvider = $data.Class.define('mockProvider', $data.StorageProviderBase, null, {
        initializeStore: function (callBack) {
            callBack.success(this.context);
        },
        supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date], writable: false },
        setContext: function (ctx) { this.context = ctx; },
        saveChanges: function (callback, changedItems) {
            this.entities = this.entities || 0;
            this.entities += changedItems.length;
            callback.success();
        },
        executeQuery: function (queryable, callBack) {
            callBack.success();
        }
    }, null);
    $data.StorageProviderBase.registerProvider("mock", mockProvider);
    module("Context_BugFix");
    test('976_Entity_State_Check_Attach', 11, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: 'mock' })).onReady(function (db) {
            start(1);
            ok(db, "Database create error");

            //Initialize state
            var cat1 = Container.createCategory({ Id: 3, Title: 'Category 1' });
            equal(cat1.entityState, undefined, 'Initialize state of entity faild');
            ok(cat1 instanceof $news.Types.Category, "New object type is faild");
            if (cat1.changedProperties) {
                equal(cat1.changedProperties.length, 0, "Changed properties array contains unexpected data");
            } else {
                ok(cat1.changedProperties === undefined, "Changed properties array contains unexpected data");
            }

            //Changed property before attached
            cat1.Title = "Changed:1";
            equal(cat1.changedProperties.length, 1, "Changed properties array contains unexpected data");
            equal(cat1.entityState, undefined, 'State of entity changed before attach to context');

            //Attached entity
            db.Categories.attach(cat1);
            equal(cat1.entityState, $data.EntityState.Unchanged, 'State of entity after attach faild');
            if (cat1.changedProperties) {
                equal(cat1.changedProperties.length, 0, "After attached: Changed properties array contains unexpected data");
            } else {
                ok(cat1.changedProperties === undefined, "After attached: Changed properties array contains unexpected data");
            }

            //Changed property before attached
            cat1.Title = "Changed:2";
            equal(cat1.changedProperties.length, 1, "After attached: Changed properties array contains unexpected data");
            equal(cat1.entityState, $data.EntityState.Modified, 'State of entity after attach and changed property faild');
            //ReChanged property before attached
            cat1.Title = "Changed:3";
            equal(cat1.changedProperties.length, 1, "After attached: ReChanged properties array contains unexpected data");
        });
    });
    test('976_Entity_State_Check_Add', 11, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: 'mock' })).onReady(function (db) {
            start(1);
            ok(db, "Database create error");

            //Initialize state
            var cat1 = Container.createCategory({ Id: 3, Title: 'Category 1' });
            equal(cat1.entityState, undefined, 'Initialize state of entity faild');
            ok(cat1 instanceof $news.Types.Category, "New object type is faild");
            if (cat1.changedProperties) {
                equal(cat1.changedProperties.length, 0, "Changed properties array contains unexpected data");
            } else {
                ok(cat1.changedProperties === undefined, "Changed properties array contains unexpected data");
            }

            //Changed property before Add
            cat1.Title = "Changed:1";
            equal(cat1.changedProperties.length, 1, "Changed properties array contains unexpected data");
            equal(cat1.entityState, undefined, 'State of entity changed before attach to context');

            //Add entity
            db.Categories.add(cat1);
            equal(cat1.entityState, $data.EntityState.Added, 'State of entity after attach faild');
            if (cat1.changedProperties) {
                equal(cat1.changedProperties.length, 0, "After Add: Changed properties array contains unexpected data");
            } else {
                ok(cat1.changedProperties === undefined, "After Add: Changed properties array contains unexpected data");
            }

            //Changed property before Add
            cat1.Title = "Changed:2";
            equal(cat1.changedProperties.length, 1, "After Add: Changed properties array contains unexpected data");
            equal(cat1.entityState, $data.EntityState.Added, 'State of entity after attach and changed property faild');
            //ReChanged property before Add
            cat1.Title = "Changed:3";
            equal(cat1.changedProperties.length, 1, "After Add: ReChanged properties array contains unexpected data");
        });
    });
    module("Context initialize");
    if ($data.StorageProviderLoader.isSupported('sqLite')) {
        test('Crate context', 1, function () {
            stop(1);
            $C('$t.EntityContextTest.TestItem', $data.Entity, null, {
                Id: { dataType: $data.Integer, key: true, computed: true },
                Str1: { dataType: $data.String },
                Num1: { dataType: $data.Number },
                Blob1: { dataType: $data.Blob },
                Bool1: { dataType: $data.Boolean },
                Date1: { dataType: $data.Date }
            });
            $C('$t.EntityContextTest.TestItemFromString', $data.Entity, null, {
                Id: { dataType: '$data.Integer', key: true, computed: true },
                Str1: { dataType: '$data.String' },
                Num1: { dataType: '$data.Number' },
                Blob1: { dataType: '$data.Blob' },
                Bool1: { dataType: '$data.Boolean' },
                Date1: { dataType: '$data.Date' }
            });
            $C('$t.EntityContextTest.DataTypeContext', $data.EntityContext, null, {
                TestTable1: { dataType: '$data.EntitySet', elementType: '$t.EntityContextTest.TestItemFromString' },
                TestTable2: { dataType: $data.EntitySet, elementType: $t.EntityContextTest.TestItem }
            });
            try {
                var cnt = new $t.EntityContextTest.DataTypeContext({ name: 'sqLite' });
                cnt.onReady(function (db) {
                    start(1);
                    ok(db, "Db create faild");
                    console.dir(db);
                });
            } catch (e) {
                start(1);
                ok(false, "Db create faild");
            }
        });
    }
    //test('Crate context 2', 1, function () {
    //    stop(1);
    //    function registerEdmTypes() {
    //        $data.Container.registerType('Edm.Boolean', $data.Boolean);
    //        $data.Container.registerType('Edm.Binary', $data.Blob);
    //        $data.Container.registerType('Edm.DateTime', $data.Date);
    //        $data.Container.registerType('Edm.DateTimeOffset', $data.Integer);
    //        $data.Container.registerType('Edm.Time', $data.Integer);
    //        $data.Container.registerType('Edm.Decimal', $data.Number);
    //        $data.Container.registerType('Edm.Single', $data.Number);
    //        $data.Container.registerType('Edm.Double', $data.Number);
    //        $data.Container.registerType('Edm.Guid', $data.String);
    //        $data.Container.registerType('Edm.Int16', $data.Integer);
    //        $data.Container.registerType('Edm.Int32', $data.Integer);
    //        $data.Container.registerType('Edm.Int64', $data.Integer);
    //        $data.Container.registerType('Edm.Byte', $data.Integer);
    //        $data.Container.registerType('Edm.String', $data.String);
    //    };
    //    registerEdmTypes();

    //    $data.Entity.extend('JayData.WarDBCF.War', {
    //        'Id': { key: true, dataType: 'Edm.Int32', nullable: false, required: true, computed: true },
    //        'Name': { dataType: 'Edm.String', nullable: false, required: true, maxLength: 100 },
    //        'TimeStamp': { dataType: 'Edm.Binary', nullable: false, required: true, maxLength: 8, computed: true },
    //        'StartDate': { dataType: 'JayData.WarDBCF.HistoricDate', nullable: false, required: true },
    //        'EndDate': { dataType: 'JayData.WarDBCF.HistoricDate', nullable: false, required: true },
    //        'Document': { dataType: 'Edm.String', nullable: true, maxLength: 100 },
    //        'Battles': { dataType: 'Array', elementType: 'JayData.WarDBCF.Battle', inverseProperty: 'War' },
    //        'Sides': { dataType: 'Array', elementType: 'JayData.WarDBCF.Side', inverseProperty: 'War' }
    //    });

    //    $data.Entity.extend('JayData.WarDBCF.HistoricDate', {
    //        'Year': { dataType: 'Edm.Int32', nullable: false, required: true },
    //        'Month': { dataType: 'Edm.Int32', nullable: true },
    //        'Day': { dataType: 'Edm.Int32', nullable: true }
    //    });

    //    $data.Entity.extend('JayData.WarDBCF.Battle', {
    //        'Id': { key: true, dataType: 'Edm.Int32', nullable: false, required: true, computed: true },
    //        'Name': { dataType: 'Edm.String', nullable: true, maxLength: 4000 },
    //        'StartYear': { dataType: 'Edm.Int32', nullable: false, required: true },
    //        'StartMonth': { dataType: 'Edm.Int32', nullable: true },
    //        'StartDay': { dataType: 'Edm.Int32', nullable: true },
    //        'EndYear': { dataType: 'Edm.Int32', nullable: false, required: true },
    //        'EndMonth': { dataType: 'Edm.Int32', nullable: true },
    //        'EndDay': { dataType: 'Edm.Int32', nullable: true },
    //        'War': { dataType: 'JayData.WarDBCF.War', inverseProperty: 'Battles' },
    //        'Belligerents': { dataType: 'Array', elementType: 'JayData.WarDBCF.Belligerent', inverseProperty: 'Battle' },
    //        'Winner': { dataType: 'JayData.WarDBCF.Side', inverseProperty: '$$unbound' }
    //    });

    //    $data.Entity.extend('JayData.WarDBCF.Belligerent', {
    //        'Id': { key: true, dataType: 'Edm.Int32', nullable: false, required: true, computed: true },
    //        'Casualties': { dataType: 'Edm.Int32', nullable: false, required: true },
    //        'Country': { dataType: 'JayData.WarDBCF.Country', inverseProperty: 'AsBelligerents' },
    //        'Battle': { dataType: 'JayData.WarDBCF.Battle', inverseProperty: 'Belligerents' },
    //        'Side': { dataType: 'JayData.WarDBCF.Side', inverseProperty: '$$unbound' }
    //    });

    //    $data.Entity.extend('JayData.WarDBCF.Country', {
    //        'Id': { key: true, dataType: 'Edm.Int32', nullable: false, required: true, computed: true },
    //        'Name': { dataType: 'Edm.String', nullable: true, maxLength: 4000 },
    //        'CountryInfo': { dataType: 'JayData.WarDBCF.CountryInfo', inverseProperty: 'Country' },
    //        'AsBelligerents': { dataType: 'Array', elementType: 'JayData.WarDBCF.Belligerent', inverseProperty: 'Country' }
    //    });

    //    $data.Entity.extend('JayData.WarDBCF.CountryInfo', {
    //        'Id': { key: true, dataType: 'Edm.Int32', nullable: false, required: true },
    //        'Country': { dataType: 'JayData.WarDBCF.Country', required: true, inverseProperty: 'CountryInfo' }
    //    });

    //    $data.Entity.extend('JayData.WarDBCF.Side', {
    //        'Id': { key: true, dataType: 'Edm.Int32', nullable: false, required: true, computed: true },
    //        'Name': { dataType: 'Edm.String', nullable: true, maxLength: 4000 },
    //        'War': { dataType: 'JayData.WarDBCF.War', inverseProperty: 'Sides' }
    //    });

    //    $data.EntityContext.extend('System.Data.Objects.WDBCF', {
    //        Wars: { dataType: $data.EntitySet, elementType: JayData.WarDBCF.War },
    //        Battles: { dataType: $data.EntitySet, elementType: JayData.WarDBCF.Battle },
    //        Belligerents: { dataType: $data.EntitySet, elementType: JayData.WarDBCF.Belligerent },
    //        Countries: { dataType: $data.EntitySet, elementType: JayData.WarDBCF.Country },
    //        CountryInfoes: { dataType: $data.EntitySet, elementType: JayData.WarDBCF.CountryInfo },
    //        Sides: { dataType: $data.EntitySet, elementType: JayData.WarDBCF.Side }
    //    });

    //    var cnt = new System.Data.Objects.WDBCF({ name: 'sqLite' });
    //    cnt.onReady(function (db) {
    //        start(1);
    //        ok(db, "Db create faild");
    //        console.dir(db);
    //    });
    //});

    // THIS IS NOT THE CURRENT USE CASE, THEREFORE COMMENTED OUT
    //test('Attach entity twice', 1, function () {
    //    stop(1);
    //    (new $news.Types.NewsContext({ name: 'mock' })).onReady(function (db) {
    //        start(1);
    //        var tag = new $news.Types.Tag({ Id: 1, Title: 'tag' });
    //        db.Tags.attach(tag);
    //        raises(function () {
    //            db.Tags.attach(tag);
    //        }, Exception, 'dublicate attach not throw exception');
    //    });
    //});
    test('Attach or get entity twice', 1, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: 'mock' })).onReady(function (db) {
            start(1);
            var tag = new $news.Types.Tag({ Id: 1, Title: 'tag' });
            db.Tags.attach(tag);
            try {
                var t = db.Tags.attachOrGet(tag);
                ok(t === tag, 'Reference equality error');
            } catch (ex) {
                ok(false, 'Throw exception');

            }
        });
    });
    test('Attach or get entity twice', 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: 'mock' })).onReady(function (db) {
            start(1);
            var tag = new $news.Types.Tag({ Id: 1, Title: 'tag' });
            db.Tags.attach(tag);
            try {
                var tag2 = new $news.Types.Tag({ Id: 1, Title: 'tag' });

                var t = db.Tags.attachOrGet(tag2);
                ok(t === tag, 'Reference equality error');
                ok(t !== tag2, 'Reference equality error');
            } catch (ex) {
                ok(false, 'Throw exception');

            }
        });
    });
    test('EntityContext_attach', 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: 'mock' })).onReady(function (db) {
            start(1);
            var tag = new $news.Types.Tag({ Id: 1, Title: 'tag' });
            notEqual(tag.entityState, $data.EntityState.Unchanged);
            db.attach(tag);
            equal(tag.entityState, $data.EntityState.Unchanged);
        });
    });

    //module("EntityContext_Basic");
    //test('save_entity_with_pk', 10, function () {
    //    stop(2);
    //    (new $news.Types.NewsContext({ databaseName: "EntityContext_Basic", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var cat1 = new $news.Types.Category({ Id: 4, Title: "Category1" });
    //        var cat2 = new $news.Types.Category({ Id: 9, Title: "Category2" });
    //        db.Categories.add(cat1);
    //        db.Categories.add(cat2);
    //        db.saveChanges(function () {
    //            start();
    //            equal(cat1.Id, 4, "Live 'cat1' obejct 'Id' error");
    //            equal(cat1.Title, 'Category1', "Live 'cat1' obejct 'Title' error");

    //            equal(cat2.Id, 9, "Live 'cat2' obejct 'Id' error");
    //            equal(cat2.Title, 'Category2', "Live 'cat2' obejct 'Title' error");

    //            db.Categories.orderBy(function (item) { return item.Id; }).toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 2, "Stored entities number faild");
    //                equal(result[0].Id, 4, "Reloaded 'cat1' obejct 'Id' error");
    //                equal(result[0].Title, 'Category1', "Reloaded 'cat1' obejct 'Title' error");

    //                equal(result[1].Id, 9, "Reloaded 'cat2' obejct 'Id' error");
    //                equal(result[1].Title, 'Category2', "Reloaded 'cat2' obejct 'Title' error");
    //            });
    //        });
    //    });
    //});
    //test('save_one_many___Articles', 25, function () {
    //    stop(3);
    //    (new $news.Types.NewsContext({ databaseName: "EntityContext_Basic", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var p1 = new db.Articles.createNew({ Title: 'Post_1', Body: 'Description1' });
    //        var p2 = new db.Articles.createNew({ Title: 'Post_2', Body: 'Description2' });
    //        var b1 = new db.Categories.createNew({ Title: 'Blog_1', Articles: [p1, p2] });
    //        db.Categories.add(b1);
    //        db.saveChanges(function (savedItemsCount) {
    //            start();
    //            equal(savedItemsCount, 3, "Saved items faild");

    //            equal(b1.Id, 1, "Live 'b1' obejct 'Id' field error");
    //            equal(b1.Title, 'Blog_1', "Live 'b1' obejct 'Id' field error");
    //            ok(b1.Articles, "Live 'b1' obejct 'Articles' field not set");
    //            equal(b1.Articles.length, 2, "Live 'b1' obejct 'Posts' field error");

    //            equal(p1.Id, 1, "Live 'p1' obejct 'Id' field error");
    //            equal(p1.Title, 'Post_1', "Live 'p1' obejct 'Title' field error");
    //            equal(p1.Body, 'Description1', "Live 'p1' obejct 'Body' field error");
    //            equal(p1.Category.Id, b1.Id, "Live 'p1' obejct 'Blog' field error");

    //            equal(p2.Id, 2, "Live 'p2' obejct 'Id' field error");
    //            equal(p2.Title, 'Post_2', "Live 'p2' obejct 'Title' field error");
    //            equal(p2.Body, 'Description2', "Live 'p2' obejct 'Body' field error");
    //            equal(p2.Category.Id, b1.Id, "Live 'p2' obejct 'Blog' field error");

    //            db.Categories.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 1, "Stored entities number faild");
    //                var rl_blog = result[0];
    //                equal(rl_blog.Id, 1, "Reloaded 'blog' obejct 'Id' error");
    //                equal(rl_blog.Title, 'Blog_1', "Reloaded 'blog' obejct 'Title' error");
    //                //equal(rl_blog.Posts.length, '2', "Reloaded 'blog' obejct 'Posts' error");
    //            });
    //            db.Articles.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 2, "Stored entities number faild");

    //                var d1 = result.filter(function (item) { return item.Id == 1 }, this)[0];
    //                equal(d1.Id, 1, "Reloaded 'd1' obejct 'Id' field error");
    //                equal(d1.Title, 'Post_1', "Reloaded 'd1' obejct 'Title' field error");
    //                equal(d1.Body, 'Description1', "Reloaded 'd1' obejct 'Body' field error");
    //                //equal(d1.Blog.Id, 1, "Reloaded 'd1' obejct 'Blog' field error");

    //                var d2 = result.filter(function (item) { return item.Id == 2 }, this)[0];
    //                equal(d2.Id, 2, "Reloaded 'd2' obejct 'Id' field error");
    //                equal(d2.Title, 'Post_2', "Reloaded 'd2' obejct 'Title' field error");
    //                equal(d2.Body, 'Description2', "Reloaded 'd2' obejct 'Body' field error");
    //                //equal(d2.Blog.Id, 1, "Reloaded 'd2' obejct 'Blog' field error");
    //            });
    //        });
    //    });
    //});
    //test('save_one_many___Category', 25, function () {
    //    stop(3);
    //    (new $news.Types.NewsContext({ databaseName: "EntityContext_Basic", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var b1 = new db.Categories.createNew({ Title: 'Blog_1' });
    //        var p1 = new db.Articles.createNew({ Title: 'Post_1', Body: 'Description1', Category: b1 });
    //        var p2 = new db.Articles.createNew({ Title: 'Post_2', Body: 'Description2', Category: b1 });

    //        db.Articles.add(p1);
    //        db.Articles.add(p2);
    //        db.saveChanges(function (savedItemsCount) {
    //            start();
    //            equal(savedItemsCount, 3, "Saved items faild");

    //            equal(b1.Id, 1, "Live 'b1' obejct 'Id' field error");
    //            equal(b1.Title, 'Blog_1', "Live 'b1' obejct 'Id' field error");
    //            ok(b1.Articles, "Live 'b1' obejct 'Articles' field not set");
    //            if (b1.Articles) {
    //                equal(b1.Articles.length, 2, "Live 'b1' obejct 'Articles' field error");
    //            }
    //            equal(p1.Id, 1, "Live 'p1' obejct 'Id' field error");
    //            equal(p1.Title, 'Post_1', "Live 'p1' obejct 'Title' field error");
    //            equal(p1.Body, 'Description1', "Live 'p1' obejct 'Body' field error");
    //            equal(p1.Category.Id, b1.Id, "Live 'p1' obejct 'Blog' field error");

    //            equal(p2.Id, 2, "Live 'p2' obejct 'Id' field error");
    //            equal(p2.Title, 'Post_2', "Live 'p2' obejct 'Title' field error");
    //            equal(p2.Body, 'Description2', "Live 'p2' obejct 'Body' field error");
    //            equal(p2.Category.Id, b1.Id, "Live 'p2' obejct 'Blog' field error");

    //            db.Categories.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 1, "Stored entities number faild");
    //                var rl_blog = result[0];
    //                equal(rl_blog.Id, 1, "Reloaded 'blog' obejct 'Id' error");
    //                equal(rl_blog.Title, 'Blog_1', "Reloaded 'blog' obejct 'Title' error");
    //                //equal(rl_blog.Posts.length, '2', "Reloaded 'blog' obejct 'Posts' error");
    //            });
    //            db.Articles.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 2, "Stored entities number faild");

    //                var d1 = result.filter(function (item) { return item.Id == 1 }, this)[0];
    //                equal(d1.Id, 1, "Reloaded 'd1' obejct 'Id' field error");
    //                equal(d1.Title, 'Post_1', "Reloaded 'd1' obejct 'Title' field error");
    //                equal(d1.Body, 'Description1', "Reloaded 'd1' obejct 'Body' field error");
    //                //equal(d1.Blog.Id, 1, "Reloaded 'd1' obejct 'Blog' field error");

    //                var d2 = result.filter(function (item) { return item.Id == 2 }, this)[0];
    //                equal(d2.Id, 2, "Reloaded 'd2' obejct 'Id' field error");
    //                equal(d2.Title, 'Post_2', "Reloaded 'd2' obejct 'Title' field error");
    //                equal(d2.Body, 'Description2', "Reloaded 'd2' obejct 'Body' field error");
    //                //equal(d2.Blog.Id, 1, "Reloaded 'd2' obejct 'Blog' field error");
    //            });
    //        });
    //    });
    //});
    ////test('save_one_one___User', 20, function () {
    ////    stop(3);
    ////    (new $news.Types.NewsContext({ databaseName: "EntityContext_Basic", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    ////        var u1 = new db.Users.createNew({ LoginName: 'User_1' });
    ////        var up1 = new db.UserProfiles.createNew({ FullName: 'Hát Izsak', User: u1 });

    ////        db.UserProfiles.add(up1);
    ////        db.saveChanges(function (savedItemsCount) {
    ////            start();
    ////            equal(savedItemsCount, 2, "Saved items faild");

    ////            equal(u1.Id, 1, "Live 'u1' obejct 'Id' field error");
    ////            equal(u1.LoginName, 'User_1', "Live 'u1' obejct 'LoginName' field error");
    ////            ok(u1.Profile, "Live 'u1' object 'Profile' field not set");
    ////            if (u1.Profile) {
    ////                equal(u1.Profile, up1, "Live 'up1' obejct 'Profile' field error");
    ////            }

    ////            equal(up1.Id, 1, "Live 'up1' obejct 'Id' field error");
    ////            equal(up1.FullName, 'Hát Izsak', "Live 'FullName' obejct 'Title' field error");
    ////            equal(up1.User, u1, "Live 'up1' obejct 'User' field error");

    ////            db.Users.include("Profile").toArray(function (result) {
    ////                start();

    ////                ok(result, "Query response faild");
    ////                equal(result.length, 1, "Stored entities number faild");
    ////                equal(result[0].Id, 1, "Reloaded 'user' obejct 'Id' error");
    ////                equal(result[0].LoginName, 'User_1', "Reloaded 'user' obejct 'LoginName' error");
    ////                ok(result[0].Profile, "Reloaded 'user' obejct 'Profile' field not exists");
    ////                equal(result[0].Profile.FullName, up1.FullName, "Reloaded 'user' obejct 'Profile.FullName' field error");
    ////            });
    ////            db.UserProfiles.include("User").toArray(function (result) {
    ////                start();

    ////                ok(result, "Query response faild");
    ////                equal(result.length, 1, "Stored entities number faild");

    ////                equal(result[0].Id, 1, "Reloaded 'userProfile' obejct 'Id' error");
    ////                equal(result[0].FullName, 'Hát Izsak', "Reloaded 'userProfile' obejct 'LoginName' error");
    ////                ok(result[0].User, "Reloaded 'userprofile' obejct 'User' field not exists");
    ////                equal(result[0].User.LoginName, u1.LoginName, "Reloaded 'userprofile' obejct 'User.LoginName' field error");
    ////            });
    ////        });
    ////    });
    ////});
    ////test('save_one_one___Profile', 20, function () {
    ////    stop(3);
    ////    (new $news.Types.NewsContext({ databaseName: "EntityContext_Basic", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    ////        var up1 = new db.UserProfiles.createNew({ FullName: 'Hát Izsak' });
    ////        var u1 = new db.Users.createNew({ LoginName: 'User_1', Profile: up1 });

    ////        db.Users.add(u1);
    ////        db.saveChanges(function (savedItemsCount) {
    ////            start();
    ////            equal(savedItemsCount, 2, "Saved items faild");

    ////            equal(u1.Id, 1, "Live 'u1' obejct 'Id' field error");
    ////            equal(u1.LoginName, 'User_1', "Live 'u1' obejct 'LoginName' field error");
    ////            equal(u1.Profile, up1, "Live 'up1' obejct 'Profile' field error");

    ////            equal(up1.Id, 1, "Live 'up1' obejct 'Id' field error");
    ////            equal(up1.FullName, 'Hát Izsak', "Live 'FullName' obejct 'Title' field error");
    ////            ok(up1.User, "Live 'up1' obejct 'User' field not set");
    ////            if (up1.User) {
    ////                equal(up1.User, u1, "Live 'up1' obejct 'User' field error");
    ////            }
    ////            db.Users.include("Profile").toArray(function (result) {
    ////                start();

    ////                ok(result, "Query response faild");
    ////                equal(result.length, 1, "Stored entities number faild");
    ////                equal(result[0].Id, 1, "Reloaded 'user' obejct 'Id' error");
    ////                equal(result[0].LoginName, 'User_1', "Reloaded 'user' obejct 'LoginName' error");
    ////                ok(result[0].Profile, "Reloaded 'user' obejct 'Profile' field not exists");
    ////                equal(result[0].Profile.FullName, up1.FullName, "Reloaded 'user' obejct 'Profile.FullName' field error");
    ////            });
    ////            db.UserProfiles.include("User").toArray(function (result) {
    ////                start();

    ////                ok(result, "Query response faild");
    ////                equal(result.length, 1, "Stored entities number faild");

    ////                equal(result[0].Id, 1, "Reloaded 'userProfile' obejct 'Id' error");
    ////                equal(result[0].FullName, 'Hát Izsak', "Reloaded 'userProfile' obejct 'LoginName' error");
    ////                ok(result[0].User, "Reloaded 'userprofile' obejct 'User' field not exists");
    ////                equal(result[0].User.LoginName, u1.LoginName, "Reloaded 'userprofile' obejct 'User.LoginName' field error");
    ////            });
    ////        });
    ////    });
    ////});

    //module("EntityContext_Basic_EntityState");
    //test('simple_crud_function', 2, function () {
    //    stop(6);
    //    (new $news.Types.NewsContext({ databaseName: "EntityContext_Basic_EntityState", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        start();
    //        ok(db, 'Database create faild');
    //        //TODO: automaic added entity
    //        var cUser = new db.Users.createNew({ LoginName: "User1" });
    //        ok(cUser.entityState == null || cUser.entityState == undefined || cUser.entityState == $data.EntityState.Detached, "Wrong initialize entity state");
    //        db.Users.add(cUser);
    //        equal(cUser.entityState, $data.EntityState.Added, "Added state not set");
    //        cUser.LoginName = "LoginName";
    //        cUser.Email = "test@test.hu";
    //        equal(cUser.entityState, $data.EntityState.Added, "Added state changed modified");
    //        db.saveChanges(function (saveResult) {
    //            start();
    //            equal(saveResult, 1, "Count of saved object faild");
    //            equal(cUser.entityState, $data.EntityState.Unchanged, "After save, entity state not set Unchanged");
    //            cUser.LoginName = "ChangeLoginName";
    //            equal(cUser.entityState, $data.EntityState.Modified, "Entity state not change to 'Modified' value");
    //            db.saveChanges(function (saveResult2) {
    //                start();
    //                equal(saveResult, 1, "Saved object count faild");
    //                equal(cUser.entityState, $data.EntityState.Unchanged, "After save, entity state not set Unchanged");
    //                db.Users.toArray(function (usersResult) {
    //                    start();
    //                    equal(usersResult.length, 1, "Not saved any user entity");
    //                    equal(usersResult[0].Id, cUser.Id, "Reloaded entity and live object integrity faild at: Id field");
    //                    equal(usersResult[0].LoginName, cUser.LoginName, "Reloaded entity and live object integrity faild at: LoginName field");
    //                    equal(usersResult[0].Email, cUser.Email, "Reloaded entity and live object integrity faild at: Email field");

    //                    db.Users.remove(cUser);
    //                    equal(cUser.entityState, $data.EntityState.Deleted, "Pinned entity state not change to 'Deleted' value");
    //                    //TODO: it is sure?
    //                    equal(usersResult[0].entityState, $data.EntityState.Deleted, "Reloaded entity state not change to 'Deleted' value");
    //                    db.saveChanges(function (saveResult3) {
    //                        start();
    //                        equal(saveResult3, 1, "Not only one element deleted");
    //                        //TODO: it is sure?
    //                        ok(cUser.entityState == null || cUser.entityState == undefined || cUser.entityState == $data.EntityState.Detached, "After deleted entity state not set");
    //                        db.Users.toArray(function (usersResult2) {
    //                            start();
    //                            ok(usersResult2, "Usres query faild"),
    //                            equal(usersResult2.length, 0, "User deleted function faild");
    //                        });
    //                    });
    //                });
    //            });
    //        });
    //    });
    //});

    //module("EntityContext_BufferedChange");
    //test('simple_crud_function', 2, function () {
    //    stop(2);
    //    (new $news.Types.NewsContext({ databaseName: "EntityContext_Basic_EntityState", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        start();
    //        ok(db, 'Database create faild');
    //        var cUser = new db.Users.createNew({ LoginName: "User1" });
    //        db.Users.add(cUser);
    //        db.Users.toArray(function (usersResult) {
    //            start();
    //            equal(usersResult.length, 1, "Auto save faild");
    //        });
    //    });
    //});


    //module("EntityContextTests_StorageModel");
    ////test("storage_model_builder", 5, function () {
    ////    $data.t1 = {};
    ////    $data.t1.Category = $data.Class.define("Category", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Title: { dataType: "string" },
    ////        Articles: { dataType: "Array", elementType: "$data.t1.Article", inverseProperty: "Category" }
    ////    }, null);
    ////    $data.t1.Article = $data.Class.define("Article", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Title: { dataType: "string" },
    ////        Category: { dataType: "$data.t1.Category" },
    ////        Tags: { dataType: "Array", elementType: "$data.t1.TagConnection", inverseProperty: "Article" },
    ////        Owner: { dataType: "$data.t1.User" }
    ////    }, null);
    ////    $data.t1.TagConnection = $data.Class.define("TagConnection", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Article: { dataType: "$data.t1.Article" },
    ////        Tag: { dataType: "$data.t1.Tag" }
    ////    }, null);
    ////    $data.t1.Tag = $data.Class.define("Tag", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Title: { dataType: "string" },
    ////        Posts: { dataType: "Array", elementType: "$data.t1.TagConnection", inverseProperty: "Tag" }
    ////    }, null);
    ////    $data.t1.User = $data.Class.define("User", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Name: { dataType: "string" },
    ////        Articles: { dataType: "Array", elementType: "$data.t1.Article", inverseProperty: "Owner" },
    ////        Detail: { dataType: "$data.t1.UserDetail", inverseProperty: "User" }
    ////    }, null);
    ////    $data.t1.UserDetail = $data.Class.define("UserDetail", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        FullName: { dataType: "string" },
    ////        Picture: { dataType: "blob" },
    ////        Address: { dataType: "$data.t1.Address" },
    ////        User: { dataType: " $data.t1.User" }
    ////    }, null);
    ////    $data.t1.Address = $data.Class.define("Address", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Address: { dataType: "string" },
    ////        City: { dataType: "string" },
    ////        Country: { dataType: "string" }
    ////    }, null);

    ////    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    ////        Categories: { dataType: $data.EntitySet, elementType: $data.t1.Category },
    ////        Articles: { dataType: $data.EntitySet, elementType: $data.t1.Article },
    ////        TagConnections: { dataType: $data.EntitySet, elementType: $data.t1.TagConnection },
    ////        Tags: { dataType: $data.EntitySet, elementType: $data.t1.Tag },
    ////        Users: { dataType: $data.EntitySet, elementType: $data.t1.User },
    ////        UserDetails: { dataType: $data.EntitySet, elementType: $data.t1.UserDetail },
    ////    }, null);

    ////    stop(3);
    ////    (new ContextType({ name: "sqLite", databaseName: "NewsReaderTest", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    ////        start();
    ////        var cat = new $data.t1.Category({ Id: 1, Title: "cat1" });
    ////        var art = new $data.t1.Article({ Id: 1, Title: "article", Category: cat });
    ////        db.Articles.add(art);

    ////        db.saveChanges(function () {
    ////            start();
    ////            db.Categories.include("Articles").where(function (item, param) { return item.Id > 0 }, null).toArray(function (includeResult) {
    ////                start();
    ////                ok(includeResult, "query faild");
    ////                equal(includeResult.length, 1, "Missing number of categories");
    ////                ok(includeResult[0].Articles, "Article collection initialization faild");
    ////                equal(includeResult[0].Articles.length, 1, "Preload article faild");
    ////                equal(includeResult[0].Articles[0].Title, "article", "Value of article title missing");
    ////            });
    ////        });
    ////    });
    ////});
    //test("logical_physical_model_test", function () {
    //    $data.t1 = {};
    //    $data.t1.Blog = $data.Class.define("Blog", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        Posts: { dataType: "Array", elementType: "$data.t1.Post", inverseProperty: "BlogRef" }
    //    }, null);

    //    $data.t1.Post = $data.Class.define("Post", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        BlogRef: { dataType: "$data.t1.Blog" }
    //    }, null);

    //    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    //        Blogs: { dataType: $data.EntitySet, elementType: $data.t1.Blog },
    //        Posts: { dataType: $data.EntitySet, elementType: $data.t1.Post }
    //    }, null);

    //    stop(2);
    //    var c = (new ContextType({ name: "sqLite", databaseName: "EntityContextTest_lp", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var b1 = new $data.t1.Blog({ Id: 1, Title: "test1" });
    //        var p1 = new $data.t1.Post({ Id: 1, Title: "Post1", BlogRef: b1 });
    //        db.Blogs.add(b1);
    //        db.Posts.add(p1);
    //        db.saveChanges(function (result) {
    //            start();
    //            db.Posts.where(function (item, param) { return item.Id == 1 }, null).toArray(function (result) {
    //                start();
    //                ok(true);
    //            });

    //        });
    //    });
    //});
    //test("complex_type_in_global_namespace", function () {
    //    $data.t1 = {};
    //    $data.t1.Blog = $data.Class.define("Blog", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        Posts: { dataType: "Array", elementType: "$data.t1.Post", inverseProperty: "BlogRef" }
    //    }, null);
    //    $data.t1.ComplexType = $data.Class.define("ComplexType", $data.Entity, null, {
    //        Title: { dataType: "string" },
    //        Description: { dataType: "string" }
    //    }, null);
    //    $data.t1.Post = $data.Class.define("Post", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        BlogRef: { dataType: "$data.t1.Blog" },
    //        CmpType: { dataType: $data.t1.ComplexType }
    //    }, null);


    //    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    //        Blogs: { dataType: $data.EntitySet, elementType: $data.t1.Blog },
    //        Posts: { dataType: $data.EntitySet, elementType: $data.t1.Post }
    //    }, null);

    //    stop(2);
    //    var c = (new ContextType({ name: "sqLite", databaseName: "EntityContextTest_lp", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var b1 = new $data.t1.Blog({ Id: 1, Title: "test1" });
    //        var ct1 = new $data.t1.ComplexType({ Title: "ComplexTyp1", Description: "desc" });
    //        var p1 = new $data.t1.Post({ Id: 1, Title: "Post1", BlogRef: b1, CmpType: ct1 });
    //        db.Blogs.add(b1);
    //        db.Posts.add(p1);
    //        db.saveChanges(function (result) {
    //            start();
    //            db.Posts.where(function (item, param) { return item.Id == 1 }, null).toArray(function (result) {
    //                start();
    //                ok(true);
    //            });

    //        });
    //    });
    //});


    //module("EntityContextTests_CollectEntities");
    //test("collect_all_entities__one_many__one", function () {

    //    var Blog = $data.Class.define("Blog", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        Posts: { dataType: "Array", elementType: "Post", inverseProperty: "BlogRef" }
    //    }, null);
    //    var Post = $data.Class.define("Post", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        BlogRef: { dataType: "Blog" },
    //    }, null);

    //    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    //        Blogs: { dataType: $data.EntitySet, elementType: Blog },
    //        Posts: { dataType: $data.EntitySet, elementType: Post },
    //    }, null);

    //    stop(2);
    //    var c = (new ContextType({ name: "mock", databaseName: "EntityContextTest_lp", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var b1 = new Blog({ Id: 1, Title: "test1" });
    //        var p1 = new Post({ Id: 1, Title: "Post1", BlogRef: b1 });
    //        db.Posts.add(p1);
    //        db.saveChanges(function (result) {
    //            start(2);
    //            equal(db.storageProvider.entities, 2, "Entity count faild!");
    //        });
    //    });
    //});
    //test("collect_all_entities_with_comlexType__one_many__one", function () {

    //    var Blog = $data.Class.define("Blog", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        Posts: { dataType: "Array", elementType: "Post", inverseProperty: "BlogRef" }
    //    }, null);
    //    var ComplexType = $data.Class.define("ComplexType", $data.Entity, null, {
    //        Title: { dataType: "string" },
    //        Description: { dataType: "string" }
    //    }, null);
    //    var Post = $data.Class.define("Post", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        BlogRef: { dataType: "Blog" },
    //        CmpType: { dataType: "ComplexType_Ref" }
    //    }, null);

    //    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    //        Blogs: { dataType: $data.EntitySet, elementType: Blog },
    //        Posts: { dataType: $data.EntitySet, elementType: Post },
    //        ComplexType_Ref: { value: ComplexType }
    //    }, null);

    //    stop(2);
    //    var c = (new ContextType({ name: "mock", databaseName: "EntityContextTest_lp", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var b1 = new Blog({ Id: 1, Title: "test1" });
    //        var ct1 = new ComplexType({ Title: "ComplexTyp1", Description: "desc" });
    //        var p1 = new Post({ Id: 1, Title: "Post1", BlogRef: b1, CmpType: ct1 });
    //        //db.Blogs.add(b1);
    //        db.Posts.add(p1);
    //        db.saveChanges(function (result) {
    //            start(2);
    //            equal(db.storageProvider.entities, 2, "Entity count faild!");
    //        });
    //    });
    //});
    //test("collect_all_entities_with_comlexType__one_many__many", function () {

    //    var Blog = $data.Class.define("Blog", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        Posts: { dataType: "Array", elementType: "Post", inverseProperty: "BlogRef" }
    //    }, null);
    //    var ComplexType = $data.Class.define("ComplexType", $data.Entity, null, {
    //        Title: { dataType: "string" },
    //        Description: { dataType: "string" }
    //    }, null);
    //    var Post = $data.Class.define("Post", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        BlogRef: { dataType: "Blog" },
    //        CmpType: { dataType: "ComplexType_Ref" }
    //    }, null);

    //    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    //        Blogs: { dataType: $data.EntitySet, elementType: Blog },
    //        Posts: { dataType: $data.EntitySet, elementType: Post },
    //        ComplexType_Ref: { value: ComplexType }
    //    }, null);

    //    stop(2);
    //    var c = (new ContextType({ name: "mock", databaseName: "EntityContextTest_lp", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        $data.db = db;
    //        var ct1 = new ComplexType({ Title: "ComplexTyp1", Description: "desc" });
    //        var p1 = new Post({ Id: 1, Title: "Post1", CmpType: ct1 });
    //        var b1 = new Blog({ Id: 1, Title: "test1", Posts: [p1] });
    //        db.Blogs.add(b1);
    //        //db.Posts.add(p1);
    //        db.saveChanges(function (result) {
    //            start(2);
    //            //console.dir(db);
    //            equal(db.storageProvider.entities, 2, "Entity count faild!");
    //        });
    //    });
    //});

    //module("EntityContextTests_Main");
    //test('save_entity_without_pk', 14, function () {
    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "integer" },
    //            fld2: { dataType: "string" },
    //            fld3: { dataType: "string" }
    //        }, null)
    //        }
    //    }, null);

    //    stop(2);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var data1 = new db.Table1Items.createNew({ fld1: 5, fld2: 'fld2_1', fld3: 'fld3_1' });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld1: 30, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data2);
    //        db.saveChanges(function () {
    //            start();
    //            equal(data1.fld1, 5, "Live 'data1' obejct 'fld1' error");
    //            equal(data1.fld2, 'fld2_1', "Live 'data1' obejct 'fld2' error");
    //            equal(data1.fld3, 'fld3_1', "Live 'data1' obejct 'fld3' error");

    //            equal(data2.fld1, 30, "Live 'data2' obejct 'fld1' error");
    //            equal(data2.fld2, 'fld2_2', "Live 'data2' obejct 'fld2' error");
    //            equal(data2.fld3, 'fld3_2', "Live 'data2' obejct 'fld3' error");

    //            db.Table1Items.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 2, "Stored entities number faild");
    //                var d1 = result.filter(function (item) { return item.fld1 == 5 }, this)[0];
    //                equal(d1.fld1, 5, "Reloaded 'data1' obejct 'fld1' error");
    //                equal(d1.fld2, 'fld2_1', "Reloaded 'data1' obejct 'fld2' error");
    //                equal(d1.fld3, 'fld3_1', "Reloaded 'data1' obejct 'fld3' error");

    //                var d2 = result.filter(function (item) { return item.fld1 == 30 }, this)[0];
    //                equal(d2.fld1, 30, "Reloaded 'data2' obejct 'fld1' error");
    //                equal(d2.fld2, 'fld2_2', "Reloaded 'data2' obejct 'fld2' error");
    //                equal(d2.fld3, 'fld3_2', "Reloaded 'data2' obejct 'fld3' error");
    //            });
    //        });
    //    });
    //});

    //test('save_entity_with_auto_pk', 14, function () {
    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "integer", key: true, computed: true },
    //            fld2: { dataType: "string" },
    //            fld3: { dataType: "string" }
    //        }, null)
    //        }
    //    }, null);

    //    stop(2);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var data1 = new db.Table1Items.createNew({ fld2: 'fld2_1', fld3: 'fld3_1' });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data2);
    //        db.saveChanges(function () {
    //            start();
    //            equal(data1.fld1, 2, "Live 'data1' obejct 'fld1' error");
    //            equal(data1.fld2, 'fld2_1', "Live 'data1' obejct 'fld2' error");
    //            equal(data1.fld3, 'fld3_1', "Live 'data1' obejct 'fld3' error");

    //            equal(data2.fld1, 1, "Live 'data2' obejct 'fld1' error");
    //            equal(data2.fld2, 'fld2_2', "Live 'data2' obejct 'fld2' error");
    //            equal(data2.fld3, 'fld3_2', "Live 'data2' obejct 'fld3' error");

    //            db.Table1Items.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 2, "Stored entities number faild");
    //                var d1 = result.filter(function (item) { return item.fld1 == 2 }, this)[0];
    //                equal(d1.fld1, 2, "Reloaded 'data1' obejct 'fld1' error");
    //                equal(d1.fld2, 'fld2_1', "Reloaded 'data1' obejct 'fld2' error");
    //                equal(d1.fld3, 'fld3_1', "Reloaded 'data1' obejct 'fld3' error");

    //                var d2 = result.filter(function (item) { return item.fld1 == 1 }, this)[0];
    //                equal(d2.fld1, 1, "Reloaded 'data2' obejct 'fld1' error");
    //                equal(d2.fld2, 'fld2_2', "Reloaded 'data2' obejct 'fld2' error");
    //                equal(d2.fld3, 'fld3_2', "Reloaded 'data2' obejct 'fld3' error");
    //            });
    //        });
    //    });
    //});
    //test('save_entity_multiple_pk', 14, function () {

    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "integer", key: true },
    //            fld2: { dataType: "string", key: true },
    //            fld3: { dataType: "string" }
    //        }, null)
    //        }
    //    }, null);

    //    stop(3);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        start();
    //        var data1 = new db.Table1Items.createNew({ fld1: 7, fld2: 'fld2_1', fld3: 'fld3_1' });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld1: 9, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data2);
    //        db.saveChanges(function () {
    //            start();
    //            equal(data1.fld1, 7, "hmmm");
    //            equal(data1.fld2, 'fld2_1', "hmmm");
    //            equal(data1.fld3, 'fld3_1', "hmmm");

    //            equal(data2.fld1, 9, "hmmm");
    //            equal(data2.fld2, 'fld2_2', "hmmm");
    //            equal(data2.fld3, 'fld3_2', "hmmm");

    //            db.Table1Items.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 2, "Stored entities number faild");
    //                var d1 = result.filter(function (item) { return item.fld1 == 7 }, this)[0];
    //                equal(d1.fld1, 7, "Reloaded 'data1' obejct 'fld1' error");
    //                equal(d1.fld2, 'fld2_1', "Reloaded 'data1' obejct 'fld2' error");
    //                equal(d1.fld3, 'fld3_1', "Reloaded 'data1' obejct 'fld3' error");

    //                var d2 = result.filter(function (item) { return item.fld1 == 9 }, this)[0];
    //                equal(d2.fld1, 9, "Reloaded 'data2' obejct 'fld1' error");
    //                equal(d2.fld2, 'fld2_2', "Reloaded 'data2' obejct 'fld2' error");
    //                equal(d2.fld3, 'fld3_2', "Reloaded 'data2' obejct 'fld3' error");
    //            });
    //        });
    //    });
    //});

    //test('save_one_many_Array_setOneSide', 20, function () {
    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Blogs: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("Blog", $data.Entity, null,
    //            {
    //                Id: { dataType: "integer", key: true, computed: true },
    //                Title: { dataType: "string" },
    //                Posts: { dataType: 'Array', elementType: "Post", inverseProperty: "Blog" }
    //            }, null)
    //        },
    //        Posts: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("Post", $data.Entity, null, {
    //                Id: { dataType: "int", key: true, computed: true },
    //                Title: { dataType: "string" },
    //                Description: { dataType: "string" },
    //                Blog: { dataType: "Blog" }
    //            }, null)
    //        }
    //    }, null);

    //    stop(3);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var b1 = new db.Blogs.createNew({ Title: 'Blog_1' });
    //        var p1 = new db.Posts.createNew({ Title: 'Post_1', Description: 'Description1', Blog: b1 });
    //        var p2 = new db.Posts.createNew({ Title: 'Post_2', Description: 'Description2', Blog: b1 });

    //        db.Posts.add(p1);
    //        db.Posts.add(p2);
    //        db.saveChanges(function () {
    //            start();
    //            equal(b1.Id, 1, "Live 'b1' obejct 'Id' field error");
    //            equal(b1.Title, 'Blog_1', "Live 'b1' obejct 'Id' field error");
    //            //equal(b1.Posts.length, 2, "Live 'b1' obejct 'Posts' field error");
    //            //window['a'] = b1;
    //            //console.dir(b1);

    //            equal(p1.Id, 2, "Live 'p1' obejct 'Id' field error");
    //            equal(p1.Title, 'Post_1', "Live 'p1' obejct 'Title' field error");
    //            equal(p1.Description, 'Description1', "Live 'p1' obejct 'Description' field error");
    //            //equal(p1.Blog.Id, b1.Id, "Live 'p1' obejct 'Blog' field error");

    //            equal(p2.Id, 1, "Live 'p2' obejct 'Id' field error");
    //            equal(p2.Title, 'Post_2', "Live 'p2' obejct 'Title' field error");
    //            equal(p2.Description, 'Description2', "Live 'p2' obejct 'Description' field error");
    //            //equal(p2.Blog.Id, b1.Id, "Live 'p2' obejct 'Blog' field error");

    //            db.Blogs.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 1, "Stored entities number faild");
    //                var rl_blog = result[0];
    //                equal(rl_blog.Id, 1, "Reloaded 'blog' obejct 'Id' error");
    //                equal(rl_blog.Title, 'Blog_1', "Reloaded 'blog' obejct 'Title' error");
    //                //equal(rl_blog.Posts.length, '2', "Reloaded 'blog' obejct 'Posts' error");
    //            });
    //            db.Posts.toArray(function (result) {
    //                start();

    //                ok(result, "Query response faild");
    //                equal(result.length, 2, "Stored entities number faild");

    //                var d1 = result.filter(function (item) { return item.Id == 2 }, this)[0];
    //                equal(d1.Id, 2, "Reloaded 'd1' obejct 'Id' field error");
    //                equal(d1.Title, 'Post_1', "Reloaded 'd1' obejct 'Title' field error");
    //                equal(d1.Description, 'Description1', "Reloaded 'd1' obejct 'Description' field error");
    //                //equal(d1.Blog.Id, 1, "Reloaded 'd1' obejct 'Blog' field error");

    //                var d2 = result.filter(function (item) { return item.Id == 1 }, this)[0];
    //                equal(d2.Id, 1, "Reloaded 'd2' obejct 'Id' field error");
    //                equal(d2.Title, 'Post_2', "Reloaded 'd2' obejct 'Title' field error");
    //                equal(d2.Description, 'Description2', "Reloaded 'd2' obejct 'Description' field error");
    //                //equal(d2.Blog.Id, 1, "Reloaded 'd2' obejct 'Blog' field error");
    //            });
    //        });
    //    });
    //});
    //test("save_one_many_with_complex_type_in_context", 10, function () {
    //    $data.t1 = {};
    //    $data.t1.Blog = $data.Class.define("Blog", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        Posts: { dataType: "Array", elementType: "$data.t1.Post", inverseProperty: "BlogRef" }
    //    }, null);
    //    var ComplexType = $data.Class.define("ComplexType", $data.Entity, null, {
    //        Title: { dataType: "string" },
    //        Description: { dataType: "string" }
    //    }, null);
    //    $data.t1.Post = $data.Class.define("Post", $data.Entity, null, {
    //        Id: { dataType: "int", key: true },
    //        Title: { dataType: "string" },
    //        BlogRef: { dataType: "$data.t1.Blog" },
    //        CmpType: { dataType: "ComplexType_Ref" }
    //    }, null);


    //    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    //        Blogs: { dataType: $data.EntitySet, elementType: $data.t1.Blog },
    //        Posts: { dataType: $data.EntitySet, elementType: $data.t1.Post },
    //        ComplexType_Ref: { value: ComplexType }
    //    }, null);

    //    stop(3);
    //    var c = new ContextType({ name: "sqLite", databaseName: "EntityContextTest_lp", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
    //    c.onReady(function (db) {
    //        var b1 = new $data.t1.Blog({ Id: 1, Title: "Blog1" });
    //        var ct1 = new ComplexType({ Title: "ComplexType1", Description: "desc" });
    //        var p1 = new $data.t1.Post({ Id: 1, Title: "Post1", BlogRef: b1, CmpType: ct1 });
    //        db.Posts.add(p1);
    //        db.saveChanges(function (result) {
    //            start();
    //            db.Blogs.toArray(function (blogResult) {
    //                start();
    //                ok(blogResult, "Blog resultset error");
    //                equal(blogResult.length, 1, "Blog numbers faild");
    //                equal(blogResult[0].Id, 1, "Blog 'Id' field error");
    //                equal(blogResult[0].Title, 'Blog1', "Blog 'Title' field error");
    //            });
    //            db.Posts.toArray(function (postsResult) {
    //                start();
    //                ok(postsResult, "Post resultset error");
    //                equal(postsResult.length, 1, "Post numbers faild");
    //                equal(postsResult[0].Id, 1, "Post 'Id' field error");
    //                equal(postsResult[0].Title, 'Post1', "Post 'Title' field error");
    //                equal(postsResult[0].CmpType.Title, 'ComplexType1', "Complex type of post 'Title' field value error");
    //                equal(postsResult[0].CmpType.Description, 'desc', "Complex type of post 'Description' field value error");
    //            });

    //        });
    //    });
    //    $data.c = c;
    //});
    //test("save_blob", 2, function () {
    //    $data.Class.define("$test.Types.BlobTestContext", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("$test.Types.TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "int", key: true },
    //            fld2: { dataType: "string" },
    //            fld3: { dataType: "blob" }
    //        }, null)
    //        }
    //    }, null);
    //    stop(2);
    //    (new $test.Types.BlobTestContext({ databaseName: "EntityContextBlobTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        start();
    //        ok(db, "Db create faild");
    //        db.Table1Items.add(new $test.Types.TestEntity({ fld1: 1, fld2: "Test data1", fld3: "kjkjkj" }));
    //        db.saveChanges(function () {
    //            start();
    //            ok(true);
    //        });
    //    });
    //});

    //test("remove_entity_with_key", function () {

    //    var EntityContextTestDatabase = $data.Class.define("EntityContextTestDatabase", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "int", key: true },
    //            fld2: { dataType: "string", required: true },
    //            fld3: { dataType: "string", required: true }
    //        }, null)
    //        }
    //    }, null);

    //    expect(2);
    //    stop(2);
    //    (new EntityContextTestDatabase({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var data1 = new db.Table1Items.createNew({ fld1: 5, fld2: 'fld2_1', fld3: 'fld3_1' });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld1: 30, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data2);
    //        var data3 = new db.Table1Items.createNew({ fld1: 60, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data3);
    //        db.saveChanges(function () {
    //            db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).toArray(function (dataList) {
    //                start();
    //                equal(dataList.length, 3, "insert data error");
    //                db.Table1Items.remove(data2);
    //                db.saveChanges(function () {
    //                    db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).toArray(function (dataList) {
    //                        start();
    //                        equal(dataList.length, 2, "remove data error");
    //                    });
    //                });
    //            });
    //        });
    //    });
    //});
    //test("remove_entity_with_multiple_key", function () {
    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "int", key: true },
    //            fld2: { dataType: "string", key: true },
    //            fld3: { dataType: "string" }
    //        }, null)
    //        }
    //    }, null);

    //    expect(2);
    //    stop(2);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var data1 = new db.Table1Items.createNew({ fld1: 5, fld2: 'fld2_1', fld3: 'fld3_1' });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld1: 30, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data2);
    //        var data3 = new db.Table1Items.createNew({ fld1: 60, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data3);
    //        db.saveChanges(function () {
    //            db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).toArray(function (dataList) {
    //                start();
    //                equal(dataList.length, 3, "insert data error");
    //                db.Table1Items.remove(data2);
    //                db.saveChanges(function () {
    //                    db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).toArray(function (dataList) {
    //                        start();
    //                        equal(dataList.length, 2, "remove data error");
    //                    });
    //                });
    //            });
    //        });
    //    });
    //});
    //test("remove_entity_without_key", function () {
    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "integer" },
    //            fld2: { dataType: "string" },
    //            fld3: { dataType: "number" },
    //            fld4: { dataType: "bool" },
    //            fld5: { dataType: "date" }
    //        }, null)
    //        }
    //    }, null);
    //    expect(2);
    //    stop(2);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var data1 = new db.Table1Items.createNew({ fld1: 5, fld2: 'fld2_1', fld3: 5.5, fld4: true, fld5: new Date() });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld1: 30, fld2: 'fld2_2', fld3: 30.5, fld4: false, fld5: new Date() });
    //        db.Table1Items.add(data2);
    //        var data3 = new db.Table1Items.createNew({ fld1: 60, fld2: 'fld2_2', fld3: 60.5, fld4: false, fld5: new Date() });
    //        db.Table1Items.add(data3);
    //        db.saveChanges(function () {
    //            db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).toArray(function (dataList) {
    //                start();
    //                equal(dataList.length, 3, "insert data error");
    //                db.Table1Items.remove(data2);
    //                db.saveChanges(function () {
    //                    db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).toArray(function (dataList) {
    //                        start();
    //                        equal(dataList.length, 2, "remove data error");
    //                    });
    //                });
    //            });
    //        });
    //    });
    //});

    //test("update_entity_with_key", function () {
    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "integer", key: true },
    //            fld2: { dataType: "string" },
    //            fld3: { dataType: "string" }
    //        }, null)
    //        }
    //    }, null);

    //    expect(8);
    //    stop(2);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var data1 = new db.Table1Items.createNew({ fld1: 5, fld2: 'fld2_1', fld3: 'fld3_1' });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld1: 30, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data2);
    //        var data3 = new db.Table1Items.createNew({ fld1: 60, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data3);
    //        db.saveChanges(function () {
    //            db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).toArray(function (dataList) {
    //                start();
    //                equal(dataList.length, 3, "insert data error");
    //                data2 = new db.Table1Items.createNew({ fld1: 30, fld2: 'aaaa', fld3: 'bbbb' });
    //                db.Table1Items.attach(data2);
    //                data2.entityState = $data.EntityState.Modified;
    //                db.saveChanges(function () {
    //                    db.Table1Items.where(function (item, param) { return item.fld1 == 30 }, null).toArray(function (dataList) {
    //                        var reloadedData = dataList[0];
    //                        start();
    //                        equal(dataList.length, 1, "update data error");

    //                        equal(reloadedData.fld1, data2.fld1, 'index field error');
    //                        equal(reloadedData.fld2, data2.fld2, '1 string field error');
    //                        equal(reloadedData.fld3, data2.fld3, '2 string field error');

    //                        equal(reloadedData.fld1, 30, 'index field error');
    //                        equal(reloadedData.fld2, 'aaaa', '1 string field error');
    //                        equal(reloadedData.fld3, 'bbbb', '2 string field error');
    //                    });
    //                });
    //            });
    //        });
    //    });
    //});
    //test("select_some_field", function () {
    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "integer", key: true },
    //            fld2: { dataType: "string" },
    //            fld3: { dataType: "string" }
    //        }, null)
    //        }
    //    }, null);

    //    expect(3);
    //    stop(1);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var data1 = new db.Table1Items.createNew({ fld1: 5, fld2: 'fld2_1', fld3: 'fld3_1' });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld1: 30, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data2);
    //        var data3 = new db.Table1Items.createNew({ fld1: 60, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data3);
    //        db.saveChanges(function () {
    //            db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).select(function (m) { return m.fld1 }).toArray(function (dataList) {
    //                start();
    //                document["a"] = dataList[0];
    //                equal(dataList.length, 3, "insert data error");
    //                ok(!(dataList[0] instanceof db.Table1Items.createNew), "invalid object type");
    //                equal(dataList[0].fld1, 5, "select eror");

    //            });
    //        });
    //    });
    //});
    //test("select_some_field_alias", function () {
    //    var context = $data.Class.define("context", $data.EntityContext, null,
    //    {
    //        Table1Items: {
    //            dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null,
    //        {
    //            fld1: { dataType: "integer", key: true },
    //            fld2: { dataType: "string" },
    //            fld3: { dataType: "string" }
    //        }, null)
    //        }
    //    }, null);

    //    expect(3);
    //    stop(1);
    //    (new context({ databaseName: "EntityContextTestDatabase", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var data1 = new db.Table1Items.createNew({ fld1: 5, fld2: 'fld2_1', fld3: 'fld3_1' });
    //        db.Table1Items.add(data1);
    //        var data2 = new db.Table1Items.createNew({ fld1: 30, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data2);
    //        var data3 = new db.Table1Items.createNew({ fld1: 60, fld2: 'fld2_2', fld3: 'fld3_2' });
    //        db.Table1Items.add(data3);
    //        db.saveChanges(function () {
    //            db.Table1Items.where(function (item, param) { return item.fld1 > 0 }, null).select(function (m) { return { c1: m.fld1 } }).toArray(function (dataList) {
    //                start();
    //                document["a"] = dataList[0];
    //                equal(dataList.length, 3, "insert data error");
    //                ok(!(dataList[0] instanceof db.Table1Items.createNew), "invalid object type");
    //                equal(dataList[0].c1, 5, "select eror");

    //            });
    //        });
    //    });
    //});

    //module("EntityContextTests_Include");
    ////test("include_many_one", function () {

    ////    var Blog = $data.Class.define("Blog", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Title: { dataType: "string" },
    ////        Posts: { dataType: "Array", elementType: "Post", inverseProperty: "BlogRef" }
    ////    }, null);
    ////    var Post = $data.Class.define("Post", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Title: { dataType: "string" },
    ////        BlogRef: { dataType: "Blog" },
    ////    }, null);

    ////    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    ////        Blogs: { dataType: $data.EntitySet, elementType: Blog },
    ////        Posts: { dataType: $data.EntitySet, elementType: Post },
    ////    }, null);

    ////    stop(2);
    ////    var c = (new ContextType({ name: "sqLite", databaseName: "EntityContextTest_lp", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    ////        var b1 = new Blog({ Id: 1, Title: "test1" });
    ////        var p1 = new Post({ Id: 1, Title: "Post1", BlogRef: b1/*, CmpType: ct1*/ });
    ////        db.Posts.add(p1);
    ////        db.saveChanges(function (result) {
    ////            start();
    ////            db.Blogs.include("Posts").where(function (i, p) { return i.Id > 0 }, null).orderBy(function (i) { return i.Id }).toArray(function (result) {
    ////                //console.dir(result);
    ////                start()
    ////                ok(true);
    ////            });
    ////        });
    ////    });
    ////});
    ////test("include_one_many", function () {

    ////    var Blog = $data.Class.define("Blog", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Title: { dataType: "string" },
    ////        Posts: { dataType: "Array", elementType: "Post", inverseProperty: "BlogRef" }
    ////    }, null);
    ////    var Post = $data.Class.define("Post", $data.Entity, null, {
    ////        Id: { dataType: "int", key: true },
    ////        Title: { dataType: "string" },
    ////        BlogRef: { dataType: "Blog" },
    ////    }, null);

    ////    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    ////        Blogs: { dataType: $data.EntitySet, elementType: Blog },
    ////        Posts: { dataType: $data.EntitySet, elementType: Post },
    ////    }, null);

    ////    stop(2);
    ////    var c = (new ContextType({ name: "sqLite", databaseName: "EntityContextTest_lp", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    ////        var b1 = new Blog({ Id: 1, Title: "test1" });
    ////        var p1 = new Post({ Id: 1, Title: "Post1", BlogRef: b1/*, CmpType: ct1*/ });
    ////        db.Posts.add(p1);
    ////        db.saveChanges(function (result) {
    ////            start();
    ////            db.Posts.include("BlogRef").where(function (i, p) { return i.Id > 0 }, null).orderBy(function (i) { return i.Id }).toArray(function (result) {
    ////                //console.dir(result);
    ////                start()
    ////                ok(true);
    ////            });
    ////        });
    ////    });
    ////});

    //module("EntityContextTests_DateTimeFiled");
    //test("save_update_delete_date_field", 7, function () {
    //    var TestType = $data.Class.define("Blog", $data.Entity, null, {
    //        Id: { dataType: "date", key: true },
    //        CreateDate: { dataType: "date" },
    //        Title: { dataType: "string" }
    //    }, null);
    //    var ContextType = $data.Class.define("ContextType", $data.EntityContext, null, {
    //        TestTable: { dataType: $data.EntitySet, elementType: TestType }
    //    }, null);
    //    var newDate = new Date();
    //    stop(6);
    //    var c = (new ContextType({ name: "sqLite", databaseName: "EntityContextTest_DateTime", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables })).onReady(function (db) {
    //        var b1 = new TestType({ Id: newDate, Title: "test1", CreateDate: newDate });
    //        db.TestTable.add(b1);
    //        db.saveChanges(function (result) {
    //            start();
    //            db.TestTable.toArray(function (result) {
    //                start();
    //                equal(result.length, 1, "Saved entities number faild");
    //                ok(result[0].CreateDate instanceof Date, "CreateDate field data type error");
    //                equal(result[0].CreateDate.valueOf(), newDate.valueOf(), "Date field invalid value");

    //                var updateDate = new Date();
    //                b1.CreateDate = updateDate;
    //                db.TestTable.attach(b1);
    //                b1.entityState = $data.EntityState.Modified;
    //                db.saveChanges(function (db2) {
    //                    start();
    //                    db.TestTable.toArray(function (updateResult) {
    //                        start();
    //                        equal(updateResult.length, 1, "Update entities number faild");
    //                        ok(updateResult[0].CreateDate instanceof Date, "Update field data type error");
    //                        equal(updateResult[0].CreateDate.valueOf(), updateDate.valueOf(), "Update field invalid value");

    //                        db.TestTable.remove({ Id: newDate });
    //                        db.saveChanges(function (db3) {
    //                            start();
    //                            db.TestTable.toArray(function (updateResult) {
    //                                start();
    //                                equal(updateResult.length, 0, "Delete entities number faild");
    //                            });
    //                        });
    //                    });
    //                });
    //            });
    //        });
    //    });
    //});



    test('multiple onready test', function () {
        var run = 5;
        stop((run * 2) + 1);
        expect((run * 2 * 2) + 2);

        var initCounter = 0;
        var slowProvider = $data.Class.define('slowProvider', $data.StorageProviderBase, null, {
            initializeStore: function (callBack) {
                setTimeout(function () {
                    equal(initCounter++, 0, 'initializeStore called more than once');

                    callBack.success(this.context);
                }, 2000);
            },
            supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date], writable: false },
            setContext: function (ctx) { this.context = ctx; },
            saveChanges: function (callback, changedItems) {
                this.entities = this.entities || 0;
                this.entities += changedItems.length;
                callback.success();
            },
            executeQuery: function (queryable, callBack) {
                callBack.success();
            }
        }, null);
        $data.StorageProviderBase.registerProvider("slow", slowProvider);

        var ctx = new $news.Types.NewsContext({ name: 'slow' });

        for (var i = 0; i < run; i++) {
            ctx.onReady(function (context) {
                ok(context, 'context onready Called ' + i);
                equal(i, run, 'async called callback not wait for iterations');
                start();
            });
        }

        ctx.onReady(function () {
            var iteration = 0;
            for (var i = 0; i < run; i++) {
                ctx.onReady(function (context) {
                    ok(context, 'context onready Called after ready ' + i);
                    equal(i, iteration++, 'sync called callback wait for iterations');
                    start();
                });
            }
        });

        ctx.ready.then(function () {
            ok(true, 'ready.then called');
            start();
        });

    });


    test('multiple onready fail test', function () {
        var run = 5;
        stop(run + 2);
        expect((run * 2) + 2);

        var ctx = new $news.Types.NewsContext({ name: 'nothing' });

        ctx.onReady(function (context) {
            ok(false, 'onready called');
            start(run + 1);
        });

        ctx.onReady({
            success: function () {
                ok(false, 'onready called');
                start(run + 1);
            },
            error: function (err) {
                equal(err, 'Provider fallback failed!', 'context error callback');
                start();

                var iteration = 0;
                for (var i = 0; i < run; i++) {
                    ctx.onReady({
                        error: function (err) {
                            equal(err, 'Provider fallback failed!', 'context error callback');
                            equal(i, iteration++, 'sync called callback wait for iterations');
                            start();
                        }
                    });
                }
            }
        });

        ctx.ready.fail(function () {
            ok(true, 'ready.fail called');
            start();
        });
    });


    test('multiple onready fail initializeStore test', function () {
        var run = 5;
        stop((run * 2) + 1);
        expect((run * 2 * 2) + 2);
        var initCounter = 0;
        var slowErrorProvider = $data.Class.define('slowErrorProvider', $data.StorageProviderBase, null, {
            initializeStore: function (callBack) {
                setTimeout(function () {
                    equal(initCounter++, 0, 'initializeStore called more than once');

                    callBack.error('generated fail');
                }, 2000);
            },
            supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date], writable: false },
            setContext: function (ctx) { this.context = ctx; },
            saveChanges: function (callback, changedItems) {
                this.entities = this.entities || 0;
                this.entities += changedItems.length;
                callback.success();
            },
            executeQuery: function (queryable, callBack) {
                callBack.success();
            }
        }, null);
        $data.StorageProviderBase.registerProvider("slowErrorProvider", slowErrorProvider);

        var ctx = new $news.Types.NewsContext({ name: 'slowErrorProvider' });

        for (var i = 0; i < run; i++) {
            ctx.onReady({
                success: function () { ok(false, 'success onready'); start(); },
                error: function (err) {
                    equal(err, 'generated fail', 'context onready error Called ' + i);
                    equal(i, run, 'async called callback not wait for iterations');
                    start();
                }
            });
        }

        ctx.onReady({
            success: function () { ok(false, 'success onready'); start(run); },
            error: function () {
                var iteration = 0;
                for (var i = 0; i < run; i++) {
                    ctx.onReady({
                        success: function () { ok(false, 'success onready'); start(); },
                        error: function (err) {
                            equal(err, 'generated fail', 'context onready error Called after ready ' + i);
                            equal(i, iteration++, 'sync called callback wait for iterations');
                            start();
                        }
                    });
                }
            }
        });

        ctx.ready.fail(function () {
            ok(true, 'ready.fail called');
            start();
        });

    });

    test('Entity context ready property tests', 3, function () {
        stop(3);
        var context = new $news.Types.NewsContext({ name: 'oData' });

        context.ready.then(function (ctx) {
            equal(ctx instanceof $data.EntityContext, true, 'contex is ready');
            start();
        });

        context.ready.then(function (ctx) {
            equal(ctx instanceof $data.EntityContext, true, 'contex is ready other');
            start();
        });

        context.onReady().then(function (ctx) {
            equal(ctx instanceof $data.EntityContext, true, 'contex is ready in onReady()');
            start();
        });

    });

    (function () {
        module("Entity_Action_compile");

        $data.Class.define('Tests.ActionContextTest_1', $data.EntityContext, null, {
            Categories: {
                type: $data.EntitySet,
                elementType: $data.Entity.extend('Tests.CategoryWithAction', {
                    'Id': { 'key': true, 'type': 'Edm.Int32', 'nullable': false, 'required': true },
                    'Name': { 'type': 'Edm.String' },
                    'Description': { 'type': 'Edm.String' },
                    'NameIndex': { 'type': 'Edm.Int32' },
                    'Topic': { 'type': 'Tests.Topic', inverseProperty: 'Categories' },
                    'AppendDescription': { type: $data.ServiceAction, returnType: 'Edm.String', IsBindable: true, IsAlwaysBindable: true, params: [{ name: 'value', type: 'Edm.String' }] },
                    'NameStart': { type: $data.ServiceAction, returnType: 'Edm.String', IsBindable: true, IsSideEffecting: false, IsAlwaysBindable: true, params: [{ name: 'value', type: 'Edm.Int32' }] },
                    'ManyParamFunc': {
                        type: $data.ServiceAction, returnType: 'Edm.String', IsBindable: true, IsSideEffecting: false, IsAlwaysBindable: true, params:
                            [
                                { name: 'p1', type: '$data.Object' },
                                { name: 'p2', type: 'Edm.Int32' },
                                { name: 'p3', type: 'Edm.Boolean' },
                                { name: 'p4', type: 'Edm.String' },
                                { name: 'p5', type: 'Edm.DateTime' }
                            ]
                    }
                }),
                actions: {
                    'MostRecent': { type: $data.ServiceAction, 'EntitySet': 'Categories', returnType: 'Tests.CategoryWithAction', IsBindable: true, IsAlwaysBindable: true, params: [{ name: 'Contains', type: 'Edm.String' }] },
                    'LastModifiedName': { type: $data.ServiceAction, 'EntitySet': 'Categories', returnType: 'Edm.String', IsBindable: true, IsSideEffecting: false, IsAlwaysBindable: true, params: [] },
                    'Lasts': { type: $data.ServiceAction, 'EntitySet': 'Categories', returnType: $data.Queryable, elementType: 'Tests.CategoryWithAction', IsBindable: true, IsSideEffecting: false, IsAlwaysBindable: true, params: [{ name: 'Top', type: 'Edm.Int32' }], method: 'GET' }
                }
            },
            Topics: {
                type: $data.EntitySet,
                elementType: $data.Entity.extend('Tests.Topic', {
                    'Id': { 'key': true, 'type': 'Edm.Int32', 'nullable': false, 'required': true },
                    'Name': { 'type': 'Edm.String' },
                    'Description': { 'type': 'Edm.String' },
                    'Categories': { 'type': 'Array', elementType: 'Tests.CategoryWithAction', inverseProperty: 'Topic' }
                })
            },
            GetDoubledName: { type: $data.ServiceOperation, returnType: 'Edm.String', IsBindable: false, IsSideEffecting: false, params: [{ name: 'name', type: 'Edm.String' }] },
            AnOtherFunction: { type: $data.ServiceOperation, returnType: 'Edm.String', params: [{ name: 'value', type: 'Edm.String' }] },
            ManyParamFunc: {
                type: $data.ServiceOperation, returnType: 'Edm.String', IsSideEffecting: false, params:
                    [
                        { name: 'p1', type: '$data.Object' },
                        { name: 'p2', type: 'Edm.Int32' },
                        { name: 'p3', type: 'Edm.Boolean' },
                        { name: 'p4', type: 'Edm.String' },
                        { name: 'p5', type: 'Edm.DateTime' }
                    ],
                method: 'GET'
            }
        });

        function checkUrlTextAndHookResult(name, expectN, fn, expected, resPayload, reqPayLoad) {
            test(name, expectN + 3, function () {
                stop();
                var context = new Tests.ActionContextTest_1({ name: 'oData', oDataServiceHost: '/api' });
                context.onReady(function () {
                    start();
                    var orig_prepareRequest = context.prepareRequest;
                    context.prepareRequest = function (req) {
                        stop();
                        req[2] = function (err) {
                            equal(err.request.requestUri, expected, 'request url');
                            equal(err.request.method, reqPayLoad ? 'POST' : 'GET', 'request method');
                            deepEqual(err.request.data, reqPayLoad === true ? undefined : reqPayLoad, 'request payload');

                            req[1](resPayload);

                            context.prepareRequest = orig_prepareRequest;
                            start();
                        }
                    }
                    fn(context);
                });
            });
        }

        test('Collection Queryable result compile', 1, function () {
            var context = new Tests.ActionContextTest_1({ name: 'oData', oDataServiceHost: '/api' });
            context.onReady(function () {
                var q = context.Categories.Lasts(5).toTraceString();
                equal(q.queryText, '/Categories/Lasts?Top=5', 'Lasts Collection action queryText');
            });
        });
        test('Collection Queryable result compile - object param', 1, function () {
            var context = new Tests.ActionContextTest_1({ name: 'oData', oDataServiceHost: '/api' });
            context.onReady(function () {
                var q = context.Categories.Lasts({ Top: 5 }).toTraceString();
                equal(q.queryText, '/Categories/Lasts?Top=5', 'Lasts Collection action queryText');
            });
        });

        checkUrlTextAndHookResult('Collection Entity result', 4, function (context) {
            var p = context.Categories.MostRecent().then(function (data) {

                ok(data instanceof Tests.CategoryWithAction, 'MostRecent, resultType');
                equal(data.Name, 'Sport', 'MostRecent, Name');
                equal(data.Description, 'desc', 'MostRecent, Description');

            });
            ok(p.then, 'MostRecent, promise returned');
        }, '/api/Categories/MostRecent', { MostRecent: { Id: 1, Name: 'Sport', Description: 'desc' } }, true);

        checkUrlTextAndHookResult('Collection Entity result with param', 4, function (context) {
            var p = context.Categories.MostRecent('Hello', function (data) {
                ok(data instanceof Tests.CategoryWithAction, 'MostRecent, resultType');
                equal(data.Name, 'Sport', 'MostRecent, Name');
                equal(data.Description, 'desc', 'MostRecent, Description');
            });

            ok(p.then, 'MostRecent, promise returned');
        }, "/api/Categories/MostRecent", { MostRecent: { Id: 1, Name: 'Sport', Description: 'desc' } }, { Contains: 'Hello' });

        checkUrlTextAndHookResult('Collection Entity result with param - object param', 4, function (context) {
            var p = context.Categories.MostRecent({ Contains: 'Hello' }, function (data) {
                ok(data instanceof Tests.CategoryWithAction, 'MostRecent, resultType');
                equal(data.Name, 'Sport', 'MostRecent, Name');
                equal(data.Description, 'desc', 'MostRecent, Description');
            });

            ok(p.then, 'MostRecent, promise returned');
        }, "/api/Categories/MostRecent", { MostRecent: { Id: 1, Name: 'Sport', Description: 'desc' } }, { Contains: 'Hello' });

        checkUrlTextAndHookResult('Collection Queryable result inline', 6, function (context) {
            var p = context.Categories.Lasts(5, function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            });

            ok(p.then, 'Lasts, promise returned');
        }, "/api/Categories/Lasts?Top=5", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Collection Queryable result inline - object param', 6, function (context) {
            var p = context.Categories.Lasts({ Top: 5 }, function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            });

            ok(p.then, 'Lasts, promise returned');
        }, "/api/Categories/Lasts?Top=5", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Collection Queryable result - toArray', 6, function (context) {
            var q = context.Categories.Lasts(5);

            q.toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            })

            ok(q instanceof $data.Queryable, 'Lasts, queryable returned');
        }, "/api/Categories/Lasts?Top=5", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Collection Queryable result - toArray - object param', 6, function (context) {
            var q = context.Categories.Lasts({ Top: 5 });

            q.toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            })

            ok(q instanceof $data.Queryable, 'Lasts, queryable returned');
        }, "/api/Categories/Lasts?Top=5", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Collection Queryable result with filter', 6, function (context) {
            var q = context.Categories.Lasts(5).filter(function (c) { return c.Name == 'World'; });

            q.toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            })

            ok(q instanceof $data.Queryable, 'Lasts, queryable returned');
        }, "/api/Categories/Lasts?Top=5&$filter=(Name eq 'World')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Collection Queryable result with filter - object param', 6, function (context) {
            var q = context.Categories.Lasts({ Top: 5 }).filter(function (c) { return c.Name == 'World'; });

            q.toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            })

            ok(q instanceof $data.Queryable, 'Lasts, queryable returned');
        }, "/api/Categories/Lasts?Top=5&$filter=(Name eq 'World')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Collection String result', 1, function (context) {
            context.Categories.LastModifiedName(function (data) {
                equal(data, 'Hello World!', 'LastModifiedName');
            });
        }, '/api/Categories/LastModifiedName', { LastModifiedName: 'Hello World!' }, true);

        checkUrlTextAndHookResult('Entity Action', 1, function (context) {
            var item = new Tests.CategoryWithAction({ Id: 1 });
            context.Categories.attach(item);

            item.AppendDescription(' World!').then(function (data) {
                equal(data, 'Hello World!', 'AppendDescription');
            });
        }, "/api/Categories(1)/AppendDescription", { AppendDescription: 'Hello World!' }, { value: ' World!' });

        checkUrlTextAndHookResult('Entity Action - object param', 1, function (context) {
            var item = new Tests.CategoryWithAction({ Id: 1 });
            context.Categories.attach(item);

            item.AppendDescription({ value: ' World!' }).then(function (data) {
                equal(data, 'Hello World!', 'AppendDescription');
            });
        }, "/api/Categories(1)/AppendDescription", { AppendDescription: 'Hello World!' }, { value: ' World!' });

        checkUrlTextAndHookResult('Entity Function in $filter - const param', 5, function (context) {

            context.Categories.filter(function (c) { return c.NameStart(5) == 'Hello' }).toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            });

        }, "/api/Categories?$filter=(NameStart(value=5) eq 'Hello')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Entity Function in $filter - const param - object param', 5, function (context) {

            context.Categories.filter(function (c) { return c.NameStart({ value: 5 }) == 'Hello' }).toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            });

        }, "/api/Categories?$filter=(NameStart(value=5) eq 'Hello')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Entity Function in $filter - property param', 5, function (context) {

            context.Categories.filter(function (c) { return c.NameStart(c.NameIndex) == 'Hello' }).toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            });

        }, "/api/Categories?$filter=(NameStart(value=NameIndex) eq 'Hello')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Entity Function in $filter - property param - object param', 5, function (context) {

            context.Categories.filter(function (c) { return c.NameStart({ value: c.NameIndex }) == 'Hello' }).toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.CategoryWithAction, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            });

        }, "/api/Categories?$filter=(NameStart(value=NameIndex) eq 'Hello')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Collection Function in $filter - property param', 5, function (context) {

            context.Topics.filter(function (c) { return c.Categories.LastModifiedName() == 'Hello' }).toArray(function (data) {
                ok(Array.isArray(data), 'Lasts, result param');
                equal(data.length, 2, 'Lasts, result length');
                ok(data[0] instanceof Tests.Topic, 'Lasts, resultType');
                equal(data[0].Name, 'Sport', 'Lasts, Name');
                equal(data[0].Description, 'desc', 'Lasts, Description');
            });

        }, "/api/Topics?$filter=(Categories/LastModifiedName() eq 'Hello')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }, { Id: 2, Name: 'Action', Description: 'desc2' }] });

        checkUrlTextAndHookResult('Context function call in $filter', 4, function (context) {

            var p = context.Categories.filter(function (it) { return $context.GetDoubledName(it.Name) == 'SportSport' }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=(GetDoubledName(name=Name) eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter - object param', 4, function (context) {

            var p = context.Categories.filter(function (it) { return $context.GetDoubledName({ name: it.Name }) == 'SportSport' }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=(GetDoubledName(name=Name) eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter from string', 4, function (context) {

            var p = context.Categories.filter("$context.GetDoubledName(it.Name) == 'SportSport'").toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=(GetDoubledName(name=Name) eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter from string - object param', 4, function (context) {

            var p = context.Categories.filter("$context.GetDoubledName({ name: it.Name }) == 'SportSport'").toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=(GetDoubledName(name=Name) eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter inverse', 4, function (context) {

            var p = context.Categories.filter(function (it) { return 'SportSport' == $context.GetDoubledName(it.Name) }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=('SportSport' eq GetDoubledName(name=Name))", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter inverse - object param', 4, function (context) {

            var p = context.Categories.filter(function (it) { return 'SportSport' == $context.GetDoubledName({ name: it.Name }) }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=('SportSport' eq GetDoubledName(name=Name))", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter more filter', 4, function (context) {

            var p = context.Categories.filter(function (it) { return it.Name == 'Sport' || ($context.GetDoubledName(it.Name) == 'SportSport' && it.Description == 'desc') }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=((Name eq 'Sport') or ((GetDoubledName(name=Name) eq 'SportSport') and (Description eq 'desc')))", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter more filter - object param', 4, function (context) {

            var p = context.Categories.filter(function (it) { return it.Name == 'Sport' || ($context.GetDoubledName({ name: it.Name }) == 'SportSport' && it.Description == 'desc') }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=((Name eq 'Sport') or ((GetDoubledName(name=Name) eq 'SportSport') and (Description eq 'desc')))", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $orderby', 4, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.GetDoubledName(it.Name) }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$orderby=GetDoubledName(name=Name) desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $orderby - object param', 4, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.GetDoubledName({ name: it.Name }) }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$orderby=GetDoubledName(name=Name) desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $orderby - const param - object param', 4, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.GetDoubledName({ name: 'Sport' }) }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$orderby=GetDoubledName(name='Sport') desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter const param', 4, function (context) {

            var p = context.Categories.filter(function (it) { return $context.GetDoubledName('Sport') == 'SportSport' }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=(GetDoubledName(name='Sport') eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter const param - object param', 4, function (context) {

            var p = context.Categories.filter(function (it) { return $context.GetDoubledName({ name: 'Sport' }) == 'SportSport' }).toArray().then(function (datas) {

                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');

            });
            ok(p.then, 'Category, promise returned');
        }, "/api/Categories?$filter=(GetDoubledName(name='Sport') eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter exception', 2, function (context) {

            var p = context.Categories.filter(function (it) { return $context.AnOtherFunction('Sport') == 'SportSport' }).toArray().fail(function (ex) {
                expect(1);
                start();
                equal(ex.message, "Context 'ActionContextTest_1' Operation 'AnOtherFunction' is not supported by the provider");
            });
        }, "/api/Categories?$filter=(GetDoubledName(name='Sport') eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter exception - object param', 2, function (context) {

            var p = context.Categories.filter(function (it) { return $context.AnOtherFunction({ name: 'Sport' }) == 'SportSport' }).toArray().fail(function (ex) {
                expect(1);
                start();
                equal(ex.message, "Context 'ActionContextTest_1' Operation 'AnOtherFunction' is not supported by the provider");
            });
        }, "/api/Categories?$filter=(GetDoubledName(name='Sport') eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context function call in $filter exception 2', 2, function (context) {

            var p = context.Categories.filter(function (it) { return $context.onReady() == 'SportSport' }).toArray().fail(function (ex) {
                expect(1);
                start();
                equal(ex.message, "Context 'ActionContextTest_1' Operation 'onReady' is not supported by the provider");
            });
        }, "/api/Categories?$filter=(GetDoubledName(name='Sport') eq 'SportSport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation param resolve', 1, function (context) {

            var p = context.ManyParamFunc({ a: 42, b: 'World' }, 15, false, 'Hello', new Date('2000/01/02')).then(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc?p1={\"a\":42,\"b\":\"World\"}&p2=15&p3=false&p4='Hello'&p5=datetime'2000-01-01T23:00:00.000'", { ManyParamFunc: 'hello world' });

        checkUrlTextAndHookResult('Context Operation param resolve 2', 1, function (context) {

            var p = context.ManyParamFunc({ a: 42, b: 'World' }, 15, false).then(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc?p1={\"a\":42,\"b\":\"World\"}&p2=15&p3=false", { ManyParamFunc: 'hello world' });

        checkUrlTextAndHookResult('Context Operation param resolve 3', 1, function (context) {

            var p = context.ManyParamFunc({ a: 42, b: 'World' }, 15, null, undefined, new Date('2000/01/02')).then(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc?p1={\"a\":42,\"b\":\"World\"}&p2=15&p3=null&p5=datetime'2000-01-01T23:00:00.000'", { ManyParamFunc: 'hello world' });

        checkUrlTextAndHookResult('Context Operation param resolve 4', 1, function (context) {

            var p = context.ManyParamFunc().then(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc", { ManyParamFunc: 'hello world' });
        checkUrlTextAndHookResult('Context Operation param resolve 5', 1, function (context) {

            var p = context.ManyParamFunc(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc", { ManyParamFunc: 'hello world' });

        checkUrlTextAndHookResult('Context Operation param resolve - object param', 1, function (context) {

            var p = context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: false, p4: 'Hello', p5: new Date('2000/01/02') }).then(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc?p1={\"a\":42,\"b\":\"World\"}&p2=15&p3=false&p4='Hello'&p5=datetime'2000-01-01T23:00:00.000'", { ManyParamFunc: 'hello world' });

        checkUrlTextAndHookResult('Context Operation param resolve 2 - object param', 1, function (context) {

            var p = context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: false }).then(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc?p1={\"a\":42,\"b\":\"World\"}&p2=15&p3=false", { ManyParamFunc: 'hello world' });

        checkUrlTextAndHookResult('Context Operation param resolve 3 - object param', 1, function (context) {

            var p = context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: null, p4: undefined, p5: new Date('2000/01/02') }).then(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc?p1={\"a\":42,\"b\":\"World\"}&p2=15&p3=null&p5=datetime'2000-01-01T23:00:00.000'", { ManyParamFunc: 'hello world' });

        checkUrlTextAndHookResult('Context Operation param resolve 4 - object param', 1, function (context) {

            var p = context.ManyParamFunc({ p1: undefined }).then(function (val) {
                equal(val, "hello world");
            });
        }, "/api/ManyParamFunc", { ManyParamFunc: 'hello world' });

        checkUrlTextAndHookResult('Context Operation in $filter param resolve', 3, function (context) {

            var p = context.Categories.filter(function (it) { return $context.ManyParamFunc({ a: 42, b: 'World' }, 15, false, 'Hello', date) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false,p4='Hello',p5=datetime'2000-01-01T23:00:00.000') eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $filter param resolve 2', 3, function (context) {

            var p = context.Categories.filter(function (it) { return $context.ManyParamFunc({ a: 42, b: 'World' }, 15, false) == 'Sport' }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false) eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $filter param resolve 3', 3, function (context) {

            var p = context.Categories.filter(function (it) { return $context.ManyParamFunc({ a: 42, b: 'World' }, 15, null, undefined, date) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=null,p5=datetime'2000-01-01T23:00:00.000') eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $filter param resolve - object param', 3, function (context) {

            var p = context.Categories.filter(function (it) { return $context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: false, p4: 'Hello', p5: date }) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false,p4='Hello',p5=datetime'2000-01-01T23:00:00.000') eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $filter param resolve 2 - object param', 3, function (context) {

            var p = context.Categories.filter(function (it) { return $context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: false }) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false) eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $filter param resolve 3 - object param', 3, function (context) {

            var p = context.Categories.filter(function (it) { return $context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: null, p4: undefined, p5: date }) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=null,p5=datetime'2000-01-01T23:00:00.000') eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $orderby param resolve', 3, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.ManyParamFunc({ a: 42, b: 'World' }, 15, false, 'Hello', date) }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$orderby=ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false,p4='Hello',p5=datetime'2000-01-01T23:00:00.000') desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $orderby param resolve 2', 3, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.ManyParamFunc({ a: 42, b: 'World' }, 15, false) }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$orderby=ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false) desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $orderby param resolve 3', 3, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.ManyParamFunc({ a: 42, b: 'World' }, 15, null, undefined, date) }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$orderby=ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=null,p5=datetime'2000-01-01T23:00:00.000') desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $orderby param resolve - object param', 3, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: false, p4: 'Hello', p5: date }) }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$orderby=ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false,p4='Hello',p5=datetime'2000-01-01T23:00:00.000') desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $orderby param resolve 2 - object param', 3, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: false }) }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$orderby=ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false) desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Context Operation in $orderby param resolve 3 - object param', 3, function (context) {

            var p = context.Categories.orderByDescending(function (it) { return $context.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: null, p4: undefined, p5: date }) }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$orderby=ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=null,p5=datetime'2000-01-01T23:00:00.000') desc", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Entity Operation in $filter param resolve', 3, function (context) {

            var p = context.Categories.filter(function (it) { return it.ManyParamFunc({ a: 42, b: 'World' }, 15, false, 'Hello', date) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false,p4='Hello',p5=datetime'2000-01-01T23:00:00.000') eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Entity Operation in $filter param resolve 2', 3, function (context) {

            var p = context.Categories.filter(function (it) { return it.ManyParamFunc({ a: 42, b: 'World' }, 15, false) == 'Sport' }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false) eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Entity Operation in $filter param resolve 3', 3, function (context) {

            var p = context.Categories.filter(function (it) { return it.ManyParamFunc({ a: 42, b: 'World' }, 15, null, undefined, date) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=null,p5=datetime'2000-01-01T23:00:00.000') eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Entity Operation in $filter param resolve - object param', 3, function (context) {

            var p = context.Categories.filter(function (it) { return it.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: false, p4: 'Hello', p5: date }) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false,p4='Hello',p5=datetime'2000-01-01T23:00:00.000') eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Entity Operation in $filter param resolve 2 - object param', 3, function (context) {

            var p = context.Categories.filter(function (it) { return it.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: false }) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=false) eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

        checkUrlTextAndHookResult('Entity Operation in $filter param resolve 3 - object param', 3, function (context) {

            var p = context.Categories.filter(function (it) { return it.ManyParamFunc({ p1: { a: 42, b: 'World' }, p2: 15, p3: null, p4: undefined, p5: date }) == 'Sport' }, { date: new Date('2000/01/02') }).toArray().then(function (datas) {
                var data = datas[0];
                ok(data instanceof Tests.CategoryWithAction, 'Category, resultType');
                equal(data.Name, 'Sport', 'Category, Name');
                equal(data.Description, 'desc', 'Category, Description');
            });
        }, "/api/Categories?$filter=(ManyParamFunc(p1={\"a\":42,\"b\":\"World\"},p2=15,p3=null,p5=datetime'2000-01-01T23:00:00.000') eq 'Sport')", { results: [{ Id: 1, Name: 'Sport', Description: 'desc' }] });

    })();
});

function LocalContextTests(providerConfig, msg) {
    msg = msg || '';
    module("LocalContextTests_" + msg);

    function _getConfig(extension) {
        return $data.typeSystem.extend({}, JSON.parse(JSON.stringify(providerConfig)), extension);
    }

    function _getContext() {
        stop();
        var pConf = _getConfig();
        return new CollectionContext(pConf).onReady();
    };
    function _finishCb(context) {
        if (context.storageProvider.db && context.storageProvider.db.close)
            context.storageProvider.db.close();

        start();
    };

    test('IntegerKeyContext', 8, function () {
        stop();

        $data.Entity.extend('$lct.IntegerKey', {
            Id: { type: 'int', key: true, computed: true },
            Name: { type: 'string' }
        });
        $data.EntityContext.extend('$lct.IntegerKeyContext', {
            Items: { type: $data.EntitySet, elementType: $lct.IntegerKey }
        });

        var context = new $lct.IntegerKeyContext(_getConfig({ databaseName: 'IntegerKeyContext' }));
        context.onReady()
        .then(function () {
            ok(true, 'context created');

            var item = new $lct.IntegerKey({ Name: 'test1' });
            context.add(item);
            return context.saveChanges().then(function () {
                var id = item.Id;
                equal(typeof id, 'number', 'Id is not undefined');
                equal(item.Name, 'test1', 'item.Name');

                context.attach(item);
                item.Name = 'test2';

                return context.saveChanges().then(function () {

                    equal(item.Id, id, 'Id is same');
                    equal(item.Name, 'test2', 'item.Name');

                    return context.beginTransaction(true).then(function (tran) {
                        return context.Items.toArray(undefined, tran).then(function (items) {

                            equal(items[0].Id, id, 'Id is same');
                            equal(items[0].Name, 'test2', 'item.Name');

                            for (var i = 0; i < items.length; i++) {
                                context.remove(items[i]);
                            }

                            return context.saveChanges().then(function () {
                                return context.beginTransaction(true).then(function (tran) {
                                    return context.Items.length(function (cnt) {
                                        equal(cnt, 0, 'db cleared');

                                        _finishCb(context);
                                    }, tran);
                                });
                            });
                        });
                    });
                });
            });
        }).fail(function (e) {
            ok(false, JSON.stringify(e));
            _finishCb(context);
        });
    });

    test('GuidKeyContext', 8, function () {
        stop();

        $data.Entity.extend('$lct.GuidKeyContext', {
            Id: { type: 'guid', key: true, computed: true },
            Name: { type: 'string' }
        });
        $data.EntityContext.extend('$lct.GuidKeyContextContext', {
            Items: { type: $data.EntitySet, elementType: $lct.GuidKeyContext }
        });

        var context = new $lct.GuidKeyContextContext(_getConfig({ databaseName: 'GuidKeyContextContext' }));
        context.onReady()
        .then(function () {
            ok(true, 'context created');

            var item = new $lct.GuidKeyContext({ Name: 'test1' });
            context.add(item);
            return context.saveChanges().then(function () {
                var id = item.Id;
                equal(typeof id, 'string', 'Id is not undefined');
                equal(item.Name, 'test1', 'item.Name');

                context.attach(item);
                item.Name = 'test2';

                return context.saveChanges().then(function () {

                    equal(item.Id, id, 'Id is same');
                    equal(item.Name, 'test2', 'item.Name');

                    return context.beginTransaction(true).then(function (tran) {
                        return context.Items.toArray(undefined, tran).then(function (items) {

                            equal(items[0].Id, id, 'Id is same');
                            equal(items[0].Name, 'test2', 'item.Name');

                            for (var i = 0; i < items.length; i++) {
                                context.remove(items[i]);
                            }

                            return context.saveChanges().then(function () {
                                return context.beginTransaction(true).then(function (tran) {
                                    return context.Items.length(function (cnt) {
                                        equal(cnt, 0, 'db cleared');

                                        _finishCb(context);
                                    }, tran);
                                });
                            });
                        });
                    });
                });
            });
        }).fail(function (e) {
            ok(false, JSON.stringify(e));
            _finishCb(context);
        });
    });


    test('LongKeyContext success', 8, function () {
        stop();

        $data.Entity.extend('$lct.LongKey', {
            Id: { type: 'long', key: true, computed: true },
            Name: { type: 'string' }
        });
        $data.EntityContext.extend('$lct.LongKeyContext', {
            Items: { type: $data.EntitySet, elementType: $lct.LongKey }
        });

        var context = new $lct.LongKeyContext(_getConfig({ databaseName: 'LongKeyContext' }));
        context.onReady()
        .then(function () {
            ok(true, 'context created');

            var item = new $lct.LongKey({ Id: '1234', Name: 'test1' });
            context.add(item);
            return context.saveChanges().then(function () {
                var id = item.Id;
                equal(typeof id, 'string', 'Id is not undefined');
                equal(item.Name, 'test1', 'item.Name');

                context.attach(item);
                item.Name = 'test2';
                return context.saveChanges().then(function () {

                    equal(item.Id, id, 'Id is same');
                    equal(item.Name, 'test2', 'item.Name');

                    return context.beginTransaction(true).then(function (tran) {
                        return context.Items.toArray(undefined, tran).then(function (items) {

                            equal(items[0].Id, id, 'Id is same');
                            equal(items[0].Name, 'test2', 'item.Name');

                            for (var i = 0; i < items.length; i++) {
                                context.remove(items[i]);
                            }

                            return context.saveChanges().then(function () {
                                return context.beginTransaction(true).then(function (tran) {
                                    return context.Items.length(function (cnt) {
                                        equal(cnt, 0, 'db cleared');

                                    }, tran);
                                });
                            });
                        });
                    });
                });
            });
        })
        .then(function () { _finishCb(context); })
        .fail(function (e) {
            ok(false, JSON.stringify(e));
            _finishCb(context);
        });
    });

    test('LongKeyContext failed', 3, function () {
        stop();

        $data.Entity.extend('$lct.LongKey', {
            Id: { type: 'long', key: true, computed: true },
            Name: { type: 'string' }
        });
        $data.EntityContext.extend('$lct.LongKeyContext', {
            Items: { type: $data.EntitySet, elementType: $lct.LongKey }
        });

        var context = new $lct.LongKeyContext(_getConfig({ databaseName: 'LongKeyContext' }));
        context.onReady()
        .then(function () {
            ok(true, 'context created');

            var item = new $lct.LongKey({ Name: 'test1' });
            context.add(item);
            return context.saveChanges().then(function () {
                equal(typeof id, 'undefined', 'Id is not undefined');
                equal(item.Name, 'test1', 'item.Name');

                return context.beginTransaction(true).then(function (tran) {
                    return context.Items.toArray(undefined, tran).then(function (items) {

                        for (var i = 0; i < items.length; i++) {
                            context.remove(items[i]);
                        }

                        return context.saveChanges();
                    });
                });

            });
        })
        .then(function () { _finishCb(context); })
        .fail(function (e) {
            ok(true);
            equal(e.message, 'DataError: DOM IDBDatabase Exception 0', JSON.stringify(e));
            _finishCb(context);
        });
    });

}