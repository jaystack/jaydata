function T3(providerConfig, msg) {
    msg = msg || '';
    module("DataTests" + msg);
    test('Filter_noFilter', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(9);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.Tags;
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 5, 'Number of tags faild');
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
                    }
                    equal(typeof r[0].Id, 'number', 'Field type error: Id');
                    equal(typeof r[0].Title, 'string', 'Field type error: Id');
                });

            });
        });
    });
    test('Filter_noFilter_orderby', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(13);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.Tags.orderBy(function (t) { return t.Title });
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 5, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok(preItem < r[i].Title, 'Order error at ' + i + ' position');
                        }
                        preItem = r[i].Title;
                    }
                    equal(typeof r[0].Id, 'number', 'Field type error: Id');
                    equal(typeof r[0].Title, 'string', 'Field type error: Id');
                });

            });
        });
    });
    test('Filter_noFilter_orderbyDesc', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(13);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.Tags.orderByDescending(function (t) { return t.Title });
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 5, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok(preItem > r[i].Title, 'Order error at ' + i + ' position');
                        }
                        preItem = r[i].Title;
                    }
                    equal(typeof r[0].Id, 'number', 'Field type error: Id');
                    equal(typeof r[0].Title, 'string', 'Field type error: Id');
                });

            });
        });
    });
    test('Filter_noFilter_multiple_orderby', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(15);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.UserProfiles.orderByDescending(function (t) { return t.FullName }).orderBy(function (t) { return t.Bio });
                q.toArray(function (r) {
                    start(1); console.dir(r);
                    ok(r, "faild query");
                    equal(r.length, 6, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok((preItem.FullName > r[i].FullName) || ((preItem.FullName == r[i].FullName) && (preItem.Bio < r[i].Bio)), 'Order error at ' + i + ' position');
                        }
                        preItem = r[i];
                    }
                    equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
                    equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

                });

            });
        });
    });
    test('Filter_noFilter_multiple_orderby', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(9);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.UserProfiles.orderBy(function (t) { return t.Bio }).skip(1).take(2);
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 2, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok(preItem.Bio < r[i].Bio, 'Order error at ' + i + ' position');
                        }
                        preItem = r[i];
                    }
                    equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
                    equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

                    equal(r[0].Bio, 'Bio2', 'Data integrity error');
                    equal(r[1].Bio, 'Bio3', 'Data integrity error');
                });

            });
        });
    });
    test('Filter_scalar_field_use_one_one_relation', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(9);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.Users.filter(function (u) { return u.Profile.Bio == "Bio3" });
                q.toArray(function (r) {
                    start(1); console.dir(r);
                    ok(r, "faild query");
                    equal(r.length, 1, 'Number of tags faild');
                    ok(r[0] instanceof $news.Types.User, 'Data type error');
                    equal(typeof r[0].Id, 'number', 'Field type error: Id');
                    equal(typeof r[0].LoginName, 'string', 'Field type error: LoginName');
                    equal(typeof r[0].Email, 'string', 'Field type error: Email');

                    equal(r[0].Id, '5', 'Data integrity error');
                    equal(r[0].LoginName, 'Usr3', 'Data integrity error');
                    equal(r[0].Email, 'usr3@company.com', 'Data integrity error');
                });

            });
        });
    });
    test('Filter_noFilter_multiple_orderby', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(9);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.UserProfiles.orderBy(function (t) { return t.Bio }).skip(1).take(2);
                q.toArray(function (r) {
                    start(1);
                    ok(r, "faild query");
                    equal(r.length, 2, 'Number of tags faild');
                    var preItem = null;
                    for (var i = 0; i < r.length; i++) {
                        ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
                        if (preItem) {
                            ok(preItem.Bio < r[i].Bio, 'Order error at ' + i + ' position');
                        }
                        preItem = r[i];
                    }
                    equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
                    equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

                    equal(r[0].Bio, 'Bio2', 'Data integrity error');
                    equal(r[1].Bio, 'Bio3', 'Data integrity error');
                });

            });
        });
    });
    test('Update_Articles_Title', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(5);
        stop(5);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 3 }).toArray(function (result) {
                    start(1);
                    ok(result, 'query failed');
                    equal(result.length, 1, 'not only 1 row in result set');
                    var a = result[0];
                    db.Articles.attach(a);
                    a.Title = 'updatedArticleTitle';
                    db.saveChanges(function () {
                        start(1);
                        db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 3 }).toArray(function (result) {
                            start(1);
                            ok(result, 'query failed');
                            equal(result.length, 1, 'not only 1 row in result set');
                            var a = result[0];
                            equal(a.Title, 'updatedArticleTitle', 'update failed');
                        });
                    });
                });
            });
        });
    });
    test('Batch_Update_Articles', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(29);
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Articles.toArray(function (result) {
                    start(1);
                    ok(result, 'query failed');
                    for (var i = 0; i < result.length; i++) {
                        var a = result[i];
                        db.Articles.attach(a);
                        a.Title = 'updatedArticleTitle';
                    }
                    db.saveChanges(function () {
                        db.Articles.toArray(function (result) {
                            start(1);
                            ok(result, 'query failed');
                            equal(result.length, 26, 'not only 1 row in result set');
                            for (var i = 0; i < result.length; i++) {
                                var a = result[i];
                                equal(a.Title, 'updatedArticleTitle', 'update failed');
                            }
                        });
                    });
                });
            });
        });
    });

    test('Include_Articles_in_Category', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Categories.include('Articles').toArray(function (result) {
                    start(1);
                    ok(result, 'query failed');
                    var a = result[0];
                    equal(a.Articles instanceof Array, true, 'Articles is not an Array');
                    equal(a.Articles[0] instanceof $news.Types.Article, true, 'First element in articles is not a $news.Types.Article');
                    equal(typeof a.Articles[0].Title == 'string', true, 'Article.Title is not a string');
                });
            });
        });
    });
    test('Include_Category_in_Article', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Articles.include('Category').toArray(function (result) {
                    start(1);
                    ok(result, 'query failed');
                    var a = result[0];
                    equal(a.Category instanceof $news.Types.Category, true, 'Category is not an Category');
                    equal(typeof a.Category.Title == 'string', true, 'Article.Title is not a string');
                });
            });
        });
    });
    //test('Delete_with_Include', function () {
    //    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    //    expect(1);
    //    stop(8);
    //    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //        start(1);
    //        $news.Types.NewsContext.generateTestData(db, function () {
    //            start(1);

    //            db.Categories.map(function (item) { return item.Title; }).toArray(function (result) {
    //                start(1);
    //                console.log(result);
    //                var before = result.length;
    //                db.TagConnections.filter(function (item) { return item.Article.Id == 1; }).toArray(function (result) {
    //                    start(1);
    //                    for (var i = 0; i < result.length; i++) {
    //                        db.TagConnections.remove(result[i]);
    //                    }
    //                    db.saveChanges(function () {
    //                        start(1);
    //                        db.Articles.include('Category').single(function (item) { return item.Id == 1; }, null, {
    //                            success: function (result) {
    //                                start(1);
    //                                console.log(result);
    //                                //db.Articles.attach(result);
    //                                db.Articles.remove(result);
    //                                db.saveChanges(function () {
    //                                    start(1);
    //                                    db.Categories.map(function (item) { return item.Title; }).toArray(function (result) {
    //                                        start(1);
    //                                        console.log(result);
    //                                        var after = result.length;
    //                                        equals(after, before, 'categories changed');
    //                                    });
    //                                })
    //                            },
    //                            error: function (error) {
    //                                console.dir(error);
    //                            }
    //                        });
    //                    });
    //                });
    //            });
    //        });
    //    });
    //});
    test('Update_Articles_and_add_new_TagConnection', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(7);
        stop(7);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                    start(1);
                    ok(result, 'query failed');
                    equal(result.length, 1, 'not only 1 row in result set');
                    var a = result[0];
                    db.Articles.attach(a);
                    a.Title = 'updatedArticleTitle';
                    db.saveChanges({
                        success: function () {
                            start(1);
                            db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                                start(1);
                                ok(result, 'query failed');
                                equal(result.length, 1, 'not only 1 row in result set');
                                var a = result[0];
                                equal(a.Title, 'updatedArticleTitle', 'update failed');
                                db.Articles.attach(a);
                                db.TagConnections.add(new $news.Types.TagConnection({ Article: a, Tag: new $news.Types.Tag({ Title: 'newtag' }) }));
                                db.saveChanges({
                                    success: function () {
                                        start(1);
                                        db.TagConnections.filter(function (item) { return item.Article.Id == 1 && item.Tag.Title == 'newtag'; }).toArray(function (result) {
                                            start(1);
                                            ok(result, 'query failed');
                                            equal(result.length, 1, 'not only 1 row in result set');
                                        });
                                    },
                                    error: function (error) {
                                        start(2);
                                        console.dir(error);
                                        ok(false, error);
                                    }
                                });
                            });
                        },
                        error: function (error) {
                            start(4);
                            console.dir(error);
                            ok(false, error);
                        }
                    });
                });
            });
        });
    });
    test('full_table_length', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(2);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Articles.length({
                    success: function (result) {
                        start(1);
                        ok(result, 'query failed');
                        equal(result, 26, 'not only 1 row in result set');
                        console.dir(result);
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
    test('full_table_single', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(2);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Articles.single(function (a) { return a.Id == 1; }, null, {
                    success: function (result) {
                        start(1);
                        ok(result, 'query failed');
                        ok(result instanceof $news.Types.Article, 'Result faild');
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
    test('full_table_single_faild', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(1);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Articles.single(function (a) { return a.Id > 1; }, null, {
                    success: function (result) {
                        start(1);
                        ok(false, 'Single return more than 1 item');
                    },
                    error: function (error) {
                        start(1);
                        ok(true, 'OK');
                    }
                });
            });
        });
    });
    test('delete_with_in_operator', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(2);
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.TagConnections.map(function (item) { return item.Tag.Id; }).toArray(function (ids) {
                    start(1);
                    db.Tags.filter(function (item) { return !(item.Id in this.tags); }, { tags: ids }).toArray(function (result) {
                        start(1);
                        ok(result, 'query error');
                        equal(result.length, 2, 'query number faild');
                    });
                });
            });
        });
    });
    test('navigation_property_both_side', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(48);
        stop(1);
        $data.Class.define("$navProp.Category", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$navProp.Article", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Category: { dataType: "$navProp.Category", inverseProperty: "Articles" },
            Author: { dataType: "$navProp.User", inverseProperty: "Articles" },
        }, null);
        $data.Class.define("$navProp.User", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            LoginName: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Author" },
            Profile: { dataType: "$navProp.UserProfile", inverseProperty: "User" },
        }, null);
        $data.Class.define("$navProp.UserProfile", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            FullName: { dataType: "string" },
            User: { dataType: "$navProp.User", inverseProperty: "Profile", required: true }
        }, null);
        $data.Class.define("$navProp.NewsContext", $data.EntityContext, null, {
            Categories: { dataType: $data.EntitySet, elementType: $navProp.Category },
            Articles: { dataType: $data.EntitySet, elementType: $navProp.Article },
            Users: { dataType: $data.EntitySet, elementType: $navProp.User },
            UserProfiles: { dataType: $data.EntitySet, elementType: $navProp.UserProfile },
        }, null);
        (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

            var storageModel = db._storageModel.getStorageModel($navProp.Category);
            var assoc = storageModel.Associations['Articles'];
            equal(assoc.From, 'Category', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
            equal(assoc.To, 'Article', 'To property value error');
            equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

            //////// Article
            storageModel = db._storageModel.getStorageModel($navProp.Article);
            assoc = storageModel.Associations['Category'];
            equal(assoc.From, 'Article', 'From property value error');
            equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
            equal(assoc.To, 'Category', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

            assoc = storageModel.Associations['Author'];
            equal(assoc.From, 'Article', 'From property value error');
            equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
            equal(assoc.To, 'User', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


            ///////User
            storageModel = db._storageModel.getStorageModel($navProp.User);
            assoc = storageModel.Associations['Articles'];
            equal(assoc.From, 'User', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
            equal(assoc.To, 'Article', 'To property value error');
            equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

            assoc = storageModel.Associations['Profile'];
            equal(assoc.From, 'User', 'From property value error');
            equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
            equal(assoc.To, 'UserProfile', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

            ///////UserProfile
            storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
            assoc = storageModel.Associations['User'];
            equal(assoc.From, 'UserProfile', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
            equal(assoc.To, 'User', 'To property value error');
            equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
            start();
        });
    });
    test('navigation_property_one_side', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(48);
        stop(1);
        $data.Class.define("$navProp.Category", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$navProp.Article", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Category: { dataType: "$navProp.Category" },
            Author: { dataType: "$navProp.User" },
        }, null);
        $data.Class.define("$navProp.User", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            LoginName: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Author" },
            Profile: { dataType: "$navProp.UserProfile", inverseProperty: "User" },
        }, null);
        $data.Class.define("$navProp.UserProfile", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            FullName: { dataType: "string" },
            User: { dataType: "$navProp.User", required: true }
        }, null);
        $data.Class.define("$navProp.NewsContext", $data.EntityContext, null, {
            Categories: { dataType: $data.EntitySet, elementType: $navProp.Category },
            Articles: { dataType: $data.EntitySet, elementType: $navProp.Article },
            Users: { dataType: $data.EntitySet, elementType: $navProp.User },
            UserProfiles: { dataType: $data.EntitySet, elementType: $navProp.UserProfile },
        }, null);
        (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

            var storageModel = db._storageModel.getStorageModel($navProp.Category);
            var assoc = storageModel.Associations['Articles'];
            equal(assoc.From, 'Category', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
            equal(assoc.To, 'Article', 'To property value error');
            equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

            //////// Article
            storageModel = db._storageModel.getStorageModel($navProp.Article);
            assoc = storageModel.Associations['Category'];
            equal(assoc.From, 'Article', 'From property value error');
            equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
            equal(assoc.To, 'Category', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

            assoc = storageModel.Associations['Author'];
            equal(assoc.From, 'Article', 'From property value error');
            equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
            equal(assoc.To, 'User', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


            ///////User
            storageModel = db._storageModel.getStorageModel($navProp.User);
            assoc = storageModel.Associations['Articles'];
            equal(assoc.From, 'User', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
            equal(assoc.To, 'Article', 'To property value error');
            equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

            assoc = storageModel.Associations['Profile'];
            equal(assoc.From, 'User', 'From property value error');
            equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
            equal(assoc.To, 'UserProfile', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

            ///////UserProfile
            storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
            assoc = storageModel.Associations['User'];
            equal(assoc.From, 'UserProfile', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
            equal(assoc.To, 'User', 'To property value error');
            equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
            start();
        });
    });
    test('navigation_property_many_side', function () {
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(48);
        stop(1);
        $data.Class.define("$navProp.Category", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article" }
        }, null);
        $data.Class.define("$navProp.Article", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Category: { dataType: "$navProp.Category", inverseProperty: "Articles" },
            Author: { dataType: "$navProp.User", inverseProperty: "Articles" },
        }, null);
        $data.Class.define("$navProp.User", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            LoginName: { dataType: "string" },
            Articles: { dataType: "Array", elementType: $navProp.Article },
            Profile: { dataType: "$navProp.UserProfile" },
        }, null);
        $data.Class.define("$navProp.UserProfile", $data.Entity, null, {
            Id: { dataType: "int", key: true, computed: true },
            FullName: { dataType: "string" },
            User: { dataType: "$navProp.User", inverseProperty: "Profile", required: true }
        }, null);
        $data.Class.define("$navProp.NewsContext", $data.EntityContext, null, {
            Categories: { dataType: $data.EntitySet, elementType: $navProp.Category },
            Articles: { dataType: $data.EntitySet, elementType: $navProp.Article },
            Users: { dataType: $data.EntitySet, elementType: $navProp.User },
            UserProfiles: { dataType: $data.EntitySet, elementType: $navProp.UserProfile },
        }, null);
        (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

            var storageModel = db._storageModel.getStorageModel($navProp.Category);
            var assoc = storageModel.Associations['Articles'];
            equal(assoc.From, 'Category', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
            equal(assoc.To, 'Article', 'To property value error');
            equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

            //////// Article
            storageModel = db._storageModel.getStorageModel($navProp.Article);
            assoc = storageModel.Associations['Category'];
            equal(assoc.From, 'Article', 'From property value error');
            equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
            equal(assoc.To, 'Category', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

            assoc = storageModel.Associations['Author'];
            equal(assoc.From, 'Article', 'From property value error');
            equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
            equal(assoc.To, 'User', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


            ///////User
            storageModel = db._storageModel.getStorageModel($navProp.User);
            assoc = storageModel.Associations['Articles'];
            equal(assoc.From, 'User', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
            equal(assoc.To, 'Article', 'To property value error');
            equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

            assoc = storageModel.Associations['Profile'];
            equal(assoc.From, 'User', 'From property value error');
            equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
            equal(assoc.To, 'UserProfile', 'To property value error');
            equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

            ///////UserProfile
            storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
            assoc = storageModel.Associations['User'];
            equal(assoc.From, 'UserProfile', 'From property value error');
            equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
            equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
            strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
            equal(assoc.To, 'User', 'To property value error');
            equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
            equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
            strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
            start();
        });
    });

    test('Select with constant value', function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Articles.map(function (a) { return { title: a.Title, c: 5 } }).toArray({
                    success: function (result) {
                        //if (providerConfig.name != "sqLite") { ok(false, "Not supported fail"); return; }
                        expect(3);
                        start(1);
                        ok(result, 'query failed');
                        var a = result[0];
                        equal(a.c, 5, 'result const value failed');
                        equal(typeof a.title === 'string', true, 'result field type failed');
                    },
                    error: function (e) {
                        //if (providerConfig.name != "oData") { ok(true, "Not supported fail"); return; }
                        expect(2);
                        start(1);
                        ok(e, 'query failed');
                        equal(e.message, 'Constant value is not supported in Projection.', 'projection constant expression error failed');
                    }
                });
            });
        });
    });

    test('OrderBy_complex', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(2);
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start();
            var q = db.Articles.orderBy(function (a) { return a.Id + 5; }).toTraceString();
            equal(q.queryText, "/Articles?$orderby=(Id add 5)", 'complex order by failed');

            q = db.Articles.orderBy(function (a) { return a.Body.concat(a.Lead); }).toTraceString();
            equal(q.queryText, "/Articles?$orderby=concat(Body,Lead)", 'complex order by failed');
        });
    });

    test('OData_Function_Call', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticles(4, 'Art').filter(function (a) { return a.Id < 7 }).toArray(function (result) {
                    start(1);
                    ok(result);
                    ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                    ok(result[1].Title.length > 0, 'Title faild');
                })
            });
        });
    });


}

function T3_oDataV3(providerConfig, msg) {
    msg = msg || '';
    module("DataTestsV3" + msg);


    test("OData_Function_sub_frames", function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(17);
        stop(6);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var articleFilter = db.Articles.filter(function (art) { return art.Title == 'Article1'; });
                var q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
                var c = q.toTraceString();
                equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Title eq 'Article1'))", "A1: Invalid query string");

                q.toArray({
                    success: function (result) {
                        start();
                        equal(result.length, 1, 'A1: result length failed');
                        equal(result[0].Title, 'Sport', 'A1: result value failed');
                    },
                    error: function (e) {
                        start();

                        ok(false, 'A1: Category some article.Title == "Article1", error: ' + e);
                    }
                });

                q = db.Categories.filter(function (ctg) { return ctg.Articles.every(this.filter); }, { filter: articleFilter });
                c = q.toTraceString();
                equal(c.queryText, "/Categories?$filter=Articles/all(art: (art/Title eq 'Article1'))", "A2: Invalid query string");

                q.toArray({
                    success: function (result) {
                        start();
                        equal(result.length, 0, 'A2: result length failed');
                    },
                    error: function (e) {
                        start();
                        ok(false, 'A2: Category every article.Title == "Article1", error: ' + e);
                    }
                });

                articleFilter = db.Articles.filter(function (art) { return art.Author.Profile.FullName == 'Full Name2'; });
                q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
                c = q.toTraceString();
                equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Author/Profile/FullName eq 'Full Name2'))", "A3: Invalid query string");

                q.toArray({
                    success: function (result) {
                        start();
                        equal(result.length, 5, 'A3: result length failed');
                        equal(result[0].Title, 'Sport', 'A3: result value failed');
                    },
                    error: function (e) {
                        start();
                        ok(false, 'A3: Category some article Author.Profile.Fullname "Full Name2", error: ' + e);
                    }
                });

                articleFilter = db.Articles.filter(function (art) { return art.Author.Profile.FullName == 'Starts With Test'; });
                q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
                c = q.toTraceString();
                equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Author/Profile/FullName eq 'Starts With Test'))", "A4: Invalid query string");

                q.toArray({
                    success: function (result) {
                        start();
                        equal(result.length, 1, 'A4: result length failed');
                        equal(result[0].Title, 'Politics', 'A4: result value failed');
                    },
                    error: function (e) {
                        start();
                        ok(false, 'A4: Category some article Author.Profile.Fullname "Starts With Test", error: ' + e);
                    }
                });


                var tagFilter = db.TagConnections.filter(function (tagCon) { return tagCon.Tag.Title == 'Tag1'; });
                articleFilter = db.Articles.filter(function (art) { return art.Tags.some(this.filter); }, { filter: tagFilter });
                q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter })
                c = q.toTraceString();
                equal(c.queryText, "/Categories?$filter=Articles/any(art: art/Tags/any(tagCon: (tagCon/Tag/Title eq 'Tag1')))", "A5: Invalid query string");

                q.toArray({
                    success: function (result) {
                        start();
                        equal(result.length, 5, 'A5: result length failed');
                        equal(result[0].Title, 'Sport', 'A5: result value failed');
                    },
                    error: function (e) {
                        start();
                        ok(false, 'A5: Category some article Author.Profile.Fullname "Starts With Test", error: ' + e);
                    }
                });

                tagFilter = db.TagConnections.filter(function (tagCon) { return tagCon.Tag.Title == 'Tag3'; });
                articleFilter = db.Articles.filter(function (art) { return art.Tags.some(this.filter) && art.Author.LoginName == 'Usr4'; }, { filter: tagFilter });
                q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter })
                c = q.toTraceString();
                equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Tags/any(tagCon: (tagCon/Tag/Title eq 'Tag3')) and (art/Author/LoginName eq 'Usr4')))", "A6: Invalid query string");

                q.toArray({
                    success: function (result) {
                        start();
                        equal(result.length, 3, 'A6: result length failed');
                        equal(result[0].Title, 'World', 'A6: result value failed');
                    },
                    error: function (e) {
                        start();
                        ok(false, 'A6: Category some article Author.Profile.Fullname "Starts With Test", error: ' + e);
                    }
                });
            });
        });
    });

}