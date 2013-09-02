function T3(providerConfig, msg) {
    msg = msg || '';
    module("DataTests" + msg);

    test('BreezeLikeAPI', 6, function () {
        stop(4);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles
                    .filter("Id", "==", 1)
                    .toArray(function (items) {
                        start();
                        equal(items.length, 1, "one record found");
                        equal(items[0].Id, 1, "record is Id = 1");
                    });

                db.Articles
                    .filter("Id", "in", [1,3,5,7])
                    .toArray(function (items) {
                        start();
                        equal(items.length, 4, "one record found");
                        equal(items[1].Id, 3, "record is Id = 3");
                    });

                db.Articles
                    .filter("Title", ".startsWith", "Article2")
                    .filter("Title", ".contains", "25")
                    .toArray(function (items) {
                        start();
                        equal(items.length, 1, "one record found");
                    });


                db.Articles
                    .include("Author")
                    .filter("Author.LoginName", ".startsWith", "Usr1")
                    .filter("Id", ">", 10)
                    .toArray(function (items) {
                        start();
                        equal(items[0].Author.LoginName, 'Usr1', 'Author matches');
                        //equal(items.length, 1, "one record found");
                    });

                //db.Articles
                //    .filter("Id", "in", [1, 3, 5, 7])
                //    .toArray(function (items) {
                //        start();
                //        equal(items.length, 4, "one record found");
                //        equal(items[1].Id, 3, "record is Id = 3");
                //    });
                //db.Articles.take(5).toArray(function (it) {
                //    deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'item Id list');
                //    equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

                //    it.next().then(function (it) {
                //        deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'next item Id list');
                //        equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');
                //        start();
                //    }).fail(function (ex) {
                //        ok(false, 'Error: ' + ex);
                //        start();
                //    });
                //})

            });
        });
    });

    test('paging - next - 5', 4, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.take(5).toArray(function (it) {
                    deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'item Id list');
                    equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

                    it.next().then(function (it) {
                        deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'next item Id list');
                        equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');
                        start();
                    }).fail(function (ex) {
                        ok(false, 'Error: ' + ex);
                        start();
                    });
                })

            });
        });
    });

    test('paging - next - 5 inside promise', 4, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.take(5).toArray().then(function (it) {
                    deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'item Id list');
                    equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

                    it.next().then(function (it) {
                        deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'next item Id list');
                        equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');
                        start();
                    }).fail(function (ex) {
                        ok(false, 'Error: ' + ex);
                        start();
                    });
                })

            });
        });
    });

    test('paging - prev - 5', 4, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.take(5).skip(5).toArray(function (it) {
                    deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'item Id list');
                    equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

                    it.prev().then(function (it) {
                        deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'prev item Id list');
                        equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');
                        start();
                    }).fail(function (ex) {
                        ok(false, 'Error: ' + ex);
                        start();
                    });
                })

            });
        });
    });

    test('paging - prev - 5 from 3', 2, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.take(5).skip(3).toArray(function (it) {
                    deepEqual(it.map(function (i) { return i.Id; }), [4, 5, 6, 7, 8], 'item Id list');

                    it.prev().then(function (it) {
                        deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'prev item Id list');
                        start();
                    }).fail(function (ex) {
                        ok(false, 'Error: ' + ex);
                        start();
                    });
                })

            });
        });
    });

    test('paging - prev - error - 5 from 0', 3, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.take(5).toArray(function (it) {
                    deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'item Id list');

                    it.prev().then(function (it) {
                        ok(false, 'invalid run, excepted fail way');
                        start();
                    }).fail(function (ex) {
                        equal(ex.message, 'Invalid skip value!', 'error message');
                        equal(ex.data.skip, -5, 'invalid skip value');

                        start();
                    });
                })

            });
        });
    });

    test('paging - error - no take', 7, function () {
        stop(2);

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.toArray(function (it) {
                    equal(it.length, 26, 'full result requested');

                    it.next().then(function (it) {
                        ok(false, 'invalid run, excepted fail way');
                        start();
                    }).fail(function (ex) {
                        equal(ex.message, 'take expression not defined in the chain!', 'error message');
                        equal(typeof ex.data.skip, 'undefined', 'skip value');
                        equal(typeof ex.data.take, 'undefined', 'skip value');

                        start();
                    });


                    it.prev().then(function (it) {
                        ok(false, 'invalid run, excepted fail way');
                        start();
                    }).fail(function (ex) {
                        equal(ex.message, 'take expression not defined in the chain!', 'error message');
                        equal(typeof ex.data.skip, 'undefined', 'skip value');
                        equal(typeof ex.data.take, 'undefined', 'skip value');

                        start();
                    });
                })

            });
        });
    });

    test('paging deep - next-next-prev - 5', 4, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.take(5).toArray(function (it) {
                    deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'item Id list');

                    it.next().then(function (it) {
                        deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'next item Id list');
                        
                        it.next().then(function (it) {
                            deepEqual(it.map(function (i) { return i.Id; }), [11, 12, 13, 14, 15], 'next2 item Id list');
                            
                            it.prev().then(function (it) {
                                deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'prev item Id list');
                                start();
                            }).fail(function (ex) {
                                ok(false, 'Error: ' + ex);
                                start();
                            });

                        }).fail(function (ex) {
                            ok(false, 'Error: ' + ex);
                            start();
                        });

                    }).fail(function (ex) {
                        ok(false, 'Error: ' + ex);
                        start();
                    });
                })

            });
        });
    });

    test('paging deep - next-next-prev - 5 with map', 8, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.map(function (it) { return { Id: it.Id, Title: it.Title } }).take(5).toArray(function (it) {
                    deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'item Id list');
                    equal(it[0] instanceof $news.Types.Article, false, 'anonymous type');

                    it.next().then(function (it) {
                        deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'next item Id list');
                        equal(it[0] instanceof $news.Types.Article, false, 'anonymous type');

                        it.next().then(function (it) {
                            deepEqual(it.map(function (i) { return i.Id; }), [11, 12, 13, 14, 15], 'next2 item Id list');
                            equal(it[0] instanceof $news.Types.Article, false, 'anonymous type');

                            it.prev().then(function (it) {
                                deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'prev item Id list');
                                equal(it[0] instanceof $news.Types.Article, false, 'anonymous type');
                                start();
                            }).fail(function (ex) {
                                ok(false, 'Error: ' + ex);
                                start();
                            });

                        }).fail(function (ex) {
                            ok(false, 'Error: ' + ex);
                            start();
                        });

                    }).fail(function (ex) {
                        ok(false, 'Error: ' + ex);
                        start();
                    });
                })

            });
        });
    });

    test('paging deep - next-next-prev - 2 with filter, order', 8, function () {
        stop();

        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.filter('it.Title.contains("1")').orderBy('it.Title').take(2).toArray(function (it) {
                    deepEqual(it.map(function (i) { return i.Title; }), ['Article1', 'Article21'], 'item Id list');
                    equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

                    it.next().then(function (it) {
                        deepEqual(it.map(function (i) { return i.Title; }), ['Article31', 'Article41'], 'next item Id list');
                        equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

                        it.next().then(function (it) {
                            deepEqual(it.map(function (i) { return i.Title; }), ['Article51'], 'next2 item Id list');
                            equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

                            it.prev().then(function (it) {
                                deepEqual(it.map(function (i) { return i.Title; }), ['Article31', 'Article41'], 'prev item Id list');
                                equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');
                                start();
                            }).fail(function (ex) {
                                ok(false, 'Error: ' + ex);
                                start();
                            });

                        }).fail(function (ex) {
                            ok(false, 'Error: ' + ex);
                            start();
                        });

                    }).fail(function (ex) {
                        ok(false, 'Error: ' + ex);
                        start();
                    });
                })

            });
        });
    });

    test('inlineCount - array result', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(19);
        stop(5);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.withInlineCount().toArray(function (items) {
                    equal(items.totalCount, items.length, 'inline count without filter, take, skip');
                    start(1);
                });

                db.Articles.filter('it.Title.contains("1")').withInlineCount().toArray(function (items) {
                    equal(items.totalCount, items.length, 'inline count with filter');
                    start(1);
                });

                db.Articles.withInlineCount().take(3).toArray(function (items) {
                    notEqual(items.totalCount, items.length, 'inline count with take');
                    equal(items.length, 3, 'length value with take');
                    equal(items.totalCount, 26, 'inline count value with take');
                    start(1);
                });

                db.Articles.withInlineCount().skip(2).take(3).toArray(function (items) {
                    notEqual(items.totalCount, items.length, 'inline count with skip, take');
                    equal(items.length, 3, 'length value with skip, take');
                    equal(items.totalCount, 26, 'inline count value with skip, take');
                    start(1);

                    db.Articles.withInlineCount().skip(8).take(3).toArray(function (items2) {
                        notEqual(items2.totalCount, items.length, 'inline count with skip, take');
                        equal(items2.totalCount, 26, 'inline count value with skip, take');

                        for (var i = 0; i < items.length; i++) {
                            for (var j = 0; j < items2.length; j++) {
                                notEqual(items[i].Id, items2[j].Id, 'i: ' + i + ', j: ' + j + ' Id not equal');
                            }
                        }

                        start(1);
                    });
                });
            });
        });
    });

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
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
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
        //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
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
    test('full_table_length_with_include', function () {
        expect(2);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Categories.include("Articles").map(function (c) { return {i:c.Id}}).length({
                    success: function (result) {
                        start(1);
                        ok(result, 'query failed');
                        equal(result, 5, 'not only 1 row in result set');
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
    test('full_table_length_with_multiple_include', function () {
        expect(2);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                db.Categories.include("Articles").include("Articles.Author").map(function (c) { return { i: c.Id } }).length({
                    success: function (result) {
                        start(1);
                        ok(result, 'query failed');
                        equal(result, 5, 'not only 1 row in result set');
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
        var c = $data.createContainer();
        $data.Class.define("$navProp.Category", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$navProp.Article", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Category: { dataType: "$navProp.Category", inverseProperty: "Articles" },
            Author: { dataType: "$navProp.User", inverseProperty: "Articles" },
        }, null);
        $data.Class.define("$navProp.User", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            LoginName: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Author" },
            Profile: { dataType: "$navProp.UserProfile", inverseProperty: "User" },
        }, null);
        $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            FullName: { dataType: "string" },
            User: { dataType: "$navProp.User", inverseProperty: "Profile", required: true }
        }, null);
        $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
            Categories: { dataType: $data.EntitySet, elementType: c.$navProp.Category },
            Articles: { dataType: $data.EntitySet, elementType: c.$navProp.Article },
            Users: { dataType: $data.EntitySet, elementType: c.$navProp.User },
            UserProfiles: { dataType: $data.EntitySet, elementType: c.$navProp.UserProfile },
        }, null);
        var $navProp = c.$navProp;

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
        var c = $data.createContainer();
        $data.Class.define("$navProp.Category", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$navProp.Article", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Category: { dataType: "$navProp.Category" },
            Author: { dataType: "$navProp.User" },
        }, null);
        $data.Class.define("$navProp.User", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            LoginName: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Author" },
            Profile: { dataType: "$navProp.UserProfile", inverseProperty: "User" },
        }, null);
        $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            FullName: { dataType: "string" },
            User: { dataType: "$navProp.User", required: true }
        }, null);
        $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
            Categories: { dataType: $data.EntitySet, elementType: c.$navProp.Category },
            Articles: { dataType: $data.EntitySet, elementType: c.$navProp.Article },
            Users: { dataType: $data.EntitySet, elementType: c.$navProp.User },
            UserProfiles: { dataType: $data.EntitySet, elementType: c.$navProp.UserProfile },
        }, null);
        var $navProp = c.$navProp;
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
        var c = $data.createContainer();

        $data.Class.define("$navProp.Category", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
        }, null);
        $data.Class.define("$navProp.Article", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            Title: { dataType: "string" },
            Category: { dataType: "$navProp.Category", inverseProperty: "Articles" },
            Author: { dataType: "$navProp.User", inverseProperty: "Articles" },
        }, null);
        $data.Class.define("$navProp.User", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            LoginName: { dataType: "string" },
            Articles: { dataType: "Array", elementType: c.$navProp.Article },
            Profile: { dataType: "$navProp.UserProfile" },
        }, null);
        $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
            Id: { dataType: "int", key: true, computed: true },
            FullName: { dataType: "string" },
            User: { dataType: "$navProp.User", inverseProperty: "Profile", required: true }
        }, null);
        var $navProp = c.$navProp;
        $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
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

    test('OData_Function_Import_ComplexType', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredLocation(4, 'Art').then(function (result) {
                    start(1);
                    ok(result);
                    ok(result instanceof $news.Types.Location, 'Return type faild');
                    ok(result.Address.length > 0, 'Title faild');
                })
            });
        });
    });
    test('OData_Function_Import_ComplexTypes', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredLocations(4, 'Art').toArray(function (result) {
                    start(1);
                    ok(result);
                    ok(result[0] instanceof $news.Types.Location, 'Return type faild');
                    ok(result[1].Address.length > 0, 'Title faild');
                })
            });
        });
    });
    test('OData_Function_Import_Scalar', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(2);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticlesCount(4, 'Art').then(function (result) {
                    start(1);
                    ok(result);
                    ok(typeof result === 'number', 'Return type faild');
                })
            });
        });
    });
    test('OData_Function_Import_ScalarList', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticlesId(4, 'Art').toArray(function (result) {
                    start(1);
                    ok(result);
                    ok(typeof result[0] === 'number', 'Return type faild');
                    ok(typeof result[1] === 'number', 'Return type faild');
                })
            });
        });
    });
    test('OData_Function_Import_ScalarList2', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticlesId(4, 'Art', function (result) {
                    start(1);
                    ok(result);
                    ok(typeof result[0] === 'number', 'Return type faild');
                    ok(typeof result[1] === 'number', 'Return type faild');
                })
            });
        });
    });
    test('OData_Function_Import_Articles', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticles(4, 'Art').toArray(function (result) {
                    start(1);
                    ok(result);
                    equal(result.length, 22, 'Result number faild');
                    ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                    ok(result[1].Title.length > 0, 'Title faild');
                }).fail(function(err){
                    console.log(err);
                    start(1);
                });
            });
        });
    });
    test('OData_Function_Import_ArticleList', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticleList(4, 'Art').toArray(function (result) {
                    start(1);
                    ok(result);
                    ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                    ok(result[1].Title.length > 0, 'Title faild');
                })
            });
        });
    });
    test('OData_Function_Import_ArticleObject', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticle(4, 'Art').then(function (result) {
                    start(1);
                    ok(result);
                    ok(result instanceof $news.Types.Article, 'Return type faild');
                    ok(result.Title.length > 0, 'Title faild');
                })
            });
        });
    });
    test('OData_Function_Import_Articles_With_PostFilter', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticles(4, 'Art').filter(function (a) { return a.Id < 10;}).toArray(function (result) {
                    start(1);
                    ok(result);
                    equal(result.length, 5, 'Result number faild');
                    ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                    ok(result[1].Title.length > 0, 'Title faild');
                }).fail(function(err){
                    console.log(err);
                    start(1);
                });
            });
        });
    });
    test('OData_Function_Import_Articles_With_PostFilter_Map', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticles(4, 'Art').filter(function (a) { return a.Id < 10; }).map(function (a) { return {T:a.Id}}).toArray(function (result) {
                    start(1);
                    ok(result);
                    equal(result.length, 5, 'Result number faild');
                    ok(!(result[0] instanceof $news.Types.Article), 'Return type faild');
                    ok(typeof result[1].T === 'number', 'Filed data type error');
                }).fail(function(err){
                    console.log(err);
                    start(1);
                });
            });
        });
    });
    /*test('OData_Function_Import_CreateCategory_Post', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(7);
        stop(5);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            //$news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.CreateCategory('new Category').then(function (result) {
                    start(1);
                    ok(!result);

                    db.Categories.single('it.Title == "new Category"').then(function (newCat) {
                        start(1);

                        ok(newCat);
                        ok(newCat instanceof $news.Types.Category, 'Return type faild');
                        ok(newCat.Title, 'new Category');
                    }).fail(function () {
                        start(1);
                        ok(false, 'WCF post error!');
                    });

                    db.Categories.single('it.Title == "new Category"').then(function (newCat) {
                        start(1);

                        ok(newCat);
                        ok(newCat instanceof $news.Types.Category, 'Return type faild');
                        ok(newCat.Title, 'new Category');
                    }).fail(function () {
                        start(1);
                        ok(false, 'WCF post error!');
                    });
                }).fail(function () {
                    start(3);
                    ok(false, 'WCF post error!');
                });
            //});
        });
    });*/

    test('OData_Function_Import_ComplexType object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredLocation({ minId: 4, startsWith: 'Art' }).then(function (result) {
                    start(1);
                    ok(result);
                    ok(result instanceof $news.Types.Location, 'Return type faild');
                    ok(result.Address.length > 0, 'Title faild');
                })
            });
        });
    });
    test('OData_Function_Import_ComplexTypes object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredLocations({ minId: 4, startsWith: 'Art' }).toArray(function (result) {
                    start(1);
                    ok(result);
                    ok(result[0] instanceof $news.Types.Location, 'Return type faild');
                    ok(result[1].Address.length > 0, 'Title faild');
                })
            });
        });
    });
    test('OData_Function_Import_Scalar object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(2);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticlesCount({ minId: 4, startsWith: 'Art' }).then(function (result) {
                    start(1);
                    ok(result);
                    ok(typeof result === 'number', 'Return type faild');
                })
            });
        });
    });
    test('OData_Function_Import_ScalarList object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticlesId({ minId: 4, startsWith: 'Art' }).toArray(function (result) {
                    start(1);
                    ok(result);
                    ok(typeof result[0] === 'number', 'Return type faild');
                    ok(typeof result[1] === 'number', 'Return type faild');
                })
            });
        });
    });
    test('OData_Function_Import_ScalarList2 object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticlesId({ minId: 4, startsWith: 'Art' }, function (result) {
                    start(1);
                    ok(result);
                    ok(typeof result[0] === 'number', 'Return type faild');
                    ok(typeof result[1] === 'number', 'Return type faild');
                })
            });
        });
    });
    test('OData_Function_Import_Articles object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticles({ minId: 4, startsWith: 'Art' }).toArray(function (result) {
                    start(1);
                    ok(result);
                    equal(result.length, 22, 'Result number faild');
                    ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                    ok(result[1].Title.length > 0, 'Title faild');
                }).fail(function(err){
                    console.log(err);
                    start(1);
                });
            });
        });
    });
    test('OData_Function_Import_ArticleList object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticleList({ minId: 4, startsWith: 'Art' }).toArray(function (result) {
                    start(1);
                    ok(result);
                    ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                    ok(result[1].Title.length > 0, 'Title faild');
                })
            });
        });
    });
    test('OData_Function_Import_ArticleObject object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(3);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticle({ minId: 4, startsWith: 'Art' }).then(function (result) {
                    start(1);
                    ok(result);
                    ok(result instanceof $news.Types.Article, 'Return type faild');
                    ok(result.Title.length > 0, 'Title faild');
                })
            });
        });
    });
    test('OData_Function_Import_Articles_With_PostFilter object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticles({ minId: 4, startsWith: 'Art' }).filter(function (a) { return a.Id < 10; }).toArray(function (result) {
                    start(1);
                    ok(result);
                    equal(result.length, 5, 'Result number faild');
                    ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                    ok(result[1].Title.length > 0, 'Title faild');
                }).fail(function(err){
                    console.log(err);
                    start(1);
                });
            });
        });
    });
    test('OData_Function_Import_Articles_With_PostFilter_Map object param', function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(4);
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.PrefilteredArticles({ minId: 4, startsWith: 'Art' }).filter(function (a) { return a.Id < 10; }).map(function (a) { return { T: a.Id } }).toArray(function (result) {
                    start(1);
                    ok(result);
                    equal(result.length, 5, 'Result number faild');
                    ok(!(result[0] instanceof $news.Types.Article), 'Return type faild');
                    ok(typeof result[1].T === 'number', 'Filed data type error');
                }).fail(function(err){
                    console.log(err);
                    start(1);
                });
            });
        });
    });





    test('Type beforeCreate in context', 9, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            //$news.Types.NewsContext.generateTestData(db, function () {

                var beforeCreate = function (sender, item) {
                    ok(sender === db.Articles.elementType, 'beforeCreate event sender');
                    ok(item === entity, 'beforeCreate event argument');

                    equal(item.Id, entity.Id, 'beforeCreate Lead property');
                    equal(item.Id, undefined, 'beforeCreate Lead property value');
                    equal(item.Title, entity.Title, 'beforeCreate Lead property');
                    equal(item.Title, 'hello', 'beforeCreate Lead property value');
                    equal(item.Lead, entity.Lead, 'beforeCreate Lead property');
                    equal(item.Lead, 'world', 'beforeCreate Lead property value');

                    equal(item.entityState, $data.EntityState.Added, 'beforeCreate EntityState property value');
                    start();
                };

                db.Articles.elementType.addEventListener('beforeCreate', beforeCreate);

                var entity = new db.Articles.elementType({ Title: 'hello', Lead: 'world' });
                db.Articles.add(entity);
                db.saveChanges(function () {
                    db.Articles.elementType.removeEventListener('beforeCreate', beforeCreate);

                    db.Articles.add({ Title: 'hello2', Lead: 'world2' });
                    db.saveChanges(function () {
                        start();
                    });
                });
            //});
        });
    });

    test('Type beforeCreate cancel in context', 11, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            //$news.Types.NewsContext.generateTestData(db, function () {

                var beforeCreate = function (sender, item) {
                    ok(sender === db.Articles.elementType, 'beforeCreate event sender');
                    ok(item === entity, 'beforeCreate event argument');

                    equal(item.Id, entity.Id, 'beforeCreate Lead property');
                    equal(item.Id, undefined, 'beforeCreate Lead property value');
                    equal(item.Title, entity.Title, 'beforeCreate Lead property');
                    equal(item.Title, 'hello', 'beforeCreate Lead property value');
                    equal(item.Lead, entity.Lead, 'beforeCreate Lead property');
                    equal(item.Lead, 'world', 'beforeCreate Lead property value');

                    equal(item.entityState, $data.EntityState.Added, 'beforeCreate EntityState property value');
                    start();
                    return false;
                };

                db.Articles.elementType.addEventListener('beforeCreate', beforeCreate);

                var entity = new db.Articles.elementType({ Title: 'hello', Lead: 'world' });
                db.Articles.add(entity);
                db.saveChanges(function (cnt) {
                    equal(cnt, 0, 'added entity count');
                    db.Articles.elementType.removeEventListener('beforeCreate', beforeCreate);

                    db.Articles.add({ Title: 'hello2', Lead: 'world2' });
                    db.Articles.filter('it.Title == "hello"').toArray().then(function (items) {
                        equal(items.length, 0, 'added entity count');

                        start();
                    });
                });
            //});
        });
    });

    test('Type beforeCreate cancel one in context', 9, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            //$news.Types.NewsContext.generateTestData(db, function () {

                var beforeCreate = function (sender, item) {
                    ok(sender === db.Articles.elementType, 'beforeCreate event sender');

                    equal(item.entityState, $data.EntityState.Added, 'beforeCreate EntityState property value');
                    start();
                    return item.Title === 'hello' ? false : true;
                };

                db.Articles.elementType.addEventListener('beforeCreate', beforeCreate);

                var entity = new db.Articles.elementType({ Title: 'hello', Lead: 'world' });
                db.Articles.add(entity);
                db.Articles.add({ Title: 'hello2', Lead: 'world2' });
                db.saveChanges(function (cnt) {
                    equal(cnt, 1, 'added entity count');
                    db.Articles.elementType.removeEventListener('beforeCreate', beforeCreate);

                    db.Articles.add({ Title: 'hello2', Lead: 'world2' });
                    db.Articles.filter('it.Title == "hello" || it.Title == "hello2"').toArray().then(function (items) {
                        equal(items.length, 1, 'added entity count');

                        equal(typeof items[0].Id, 'number', 'loaded Id property');
                        equal(items[0].Title, 'hello2', 'loaded Title property');
                        equal(items[0].Lead, 'world2', 'loaded Lead property');

                        start();
                    });
                });
            //});
        });
    });

    test('Type afterCreate in context', 9, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            //$news.Types.NewsContext.generateTestData(db, function () {

                var afterCreate = function (sender, item) {
                    ok(sender === db.Articles.elementType, 'afterCreate event sender');
                    ok(item === entity, 'afterCreate event argument');

                    equal(item.Id, entity.Id, 'afterCreate Lead property');
                    equal(typeof item.Id, 'number', 'afterCreate Lead property value');
                    equal(item.Title, entity.Title, 'afterCreate Lead property');
                    equal(item.Title, 'hello', 'afterCreate Lead property value');
                    equal(item.Lead, entity.Lead, 'afterCreate Lead property');
                    equal(item.Lead, 'world', 'afterCreate Lead property value');

                    equal(item.entityState, $data.EntityState.Added, 'beforeCreate EntityState property value');
                    start();
                };

                db.Articles.elementType.addEventListener('afterCreate', afterCreate);

                var entity = new db.Articles.elementType({ Title: 'hello', Lead: 'world' });
                db.Articles.add(entity);
                db.saveChanges(function () {
                    db.Articles.elementType.removeEventListener('afterCreate', afterCreate);

                    db.Articles.add({ Title: 'hello2', Lead: 'world2' });
                    db.saveChanges(function () {
                        start();
                    });
                });
            //});
        });
    });

    test('Type beforeUpdate in context', 9, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.first().then(function (entity) {
                    var beforeUpdate = function (sender, item) {
                        ok(sender === db.Articles.elementType, 'beforeUpdate event sender');
                        ok(item === entity, 'beforeUpdate event argument');

                        equal(item.Id, entity.Id, 'beforeUpdate Lead property');
                        equal(typeof item.Id, 'number', 'beforeUpdate Lead property value');
                        equal(item.Title, entity.Title, 'beforeUpdate Lead property');
                        equal(item.Title, 'hello', 'beforeUpdate Lead property value');
                        equal(item.Lead, entity.Lead, 'beforeUpdate Lead property');
                        equal(item.Lead, 'world', 'beforeUpdate Lead property value');

                        equal(item.entityState, $data.EntityState.Modified, 'beforeCreate EntityState property value');
                        start();
                    };

                    db.Articles.elementType.addEventListener('beforeUpdate', beforeUpdate);

                    db.Articles.attach(entity);
                    entity.Title = 'hello';
                    entity.Lead = 'world';

                    db.saveChanges(function () {
                        db.Articles.elementType.removeEventListener('beforeUpdate', beforeUpdate);

                        db.Articles.attach(entity);
                        entity.Title = 'hello2';
                        entity.Lead = 'world2';

                        db.saveChanges(function () {
                            start();
                        });
                    });
                }).fail($data.debug);
            });
        });
    });

    test('Type beforeUpdate cancel in context', 11, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.Articles.first().then(function (entity) {
                    var beforeUpdate = function (sender, item) {
                        ok(sender === db.Articles.elementType, 'beforeUpdate event sender');
                        ok(item === entity, 'beforeUpdate event argument');

                        equal(item.Id, entity.Id, 'beforeUpdate Lead property');
                        equal(typeof item.Id, 'number', 'beforeUpdate Lead property value');
                        equal(item.Title, entity.Title, 'beforeUpdate Lead property');
                        equal(item.Title, 'hello', 'beforeUpdate Lead property value');
                        equal(item.Lead, entity.Lead, 'beforeUpdate Lead property');
                        equal(item.Lead, 'world', 'beforeUpdate Lead property value');

                        equal(item.entityState, $data.EntityState.Modified, 'beforeCreate EntityState property value');
                        start();

                        return false;
                    };

                    db.Articles.elementType.addEventListener('beforeUpdate', beforeUpdate);

                    db.Articles.attach(entity);
                    entity.Title = 'hello';
                    entity.Lead = 'world';

                    db.saveChanges(function () {
                        db.Articles.elementType.removeEventListener('beforeUpdate', beforeUpdate);

                        db.Articles.single('it.Id == this.value', { value: entity.Id }).then(function (item) {
                            notEqual(item.Title, 'hello', 'beforeUpdate Lead property value');
                            notEqual(item.Lead, 'world', 'beforeUpdate Lead property value');
                            start();
                        }).fail(function (e) {
                            ok(false, e);
                            start();
                        });

                    });
                }).fail($data.debug);
            });
        });
    });

    test('Type afterUpdate in context', 9, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.first().then(function (entity) {
                    var afterUpdate = function (sender, item) {
                        ok(sender === db.Articles.elementType, 'afterUpdate event sender');
                        ok(item === entity, 'afterUpdate event argument');

                        equal(item.Id, entity.Id, 'afterUpdate Lead property');
                        equal(typeof item.Id, 'number', 'afterUpdate Lead property value');
                        equal(item.Title, entity.Title, 'afterUpdate Lead property');
                        equal(item.Title, 'hello', 'afterUpdate Lead property value');
                        equal(item.Lead, entity.Lead, 'afterUpdate Lead property');
                        equal(item.Lead, 'world', 'afterUpdate Lead property value');

                        equal(item.entityState, $data.EntityState.Modified, 'beforeCreate EntityState property value');
                        start();
                    };

                    db.Articles.elementType.addEventListener('afterUpdate', afterUpdate);

                    db.Articles.attach(entity);
                    entity.Title = 'hello';
                    entity.Lead = 'world';

                    db.saveChanges(function () {
                        db.Articles.elementType.removeEventListener('afterUpdate', afterUpdate);

                        db.Articles.attach(entity);
                        entity.Title = 'hello2';
                        entity.Lead = 'world2';

                        db.saveChanges(function () {
                            start();
                        });
                    });
                }).fail($data.debug);
            });
        });
    });

    test('Type beforeDelete in context', 5, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.TagConnections.toArray().then(function (entities) {
                    var entity = entities[0];

                    var beforeDelete = function (sender, item) {
                        ok(sender === db.TagConnections.elementType, 'beforeDelete event sender');
                        ok(item === entity, 'beforeDelete event argument');

                        equal(item.Id, entity.Id, 'beforeDelete Id property');
                        equal(typeof item.Id, 'number', 'beforeDelete Id property value');

                        equal(item.entityState, $data.EntityState.Deleted, 'beforeCreate EntityState property value');
                        start();
                    };

                    db.TagConnections.elementType.addEventListener('beforeDelete', beforeDelete);

                    db.TagConnections.remove(entity);

                    return db.saveChanges(function () {
                        db.TagConnections.elementType.removeEventListener('beforeDelete', beforeDelete);

                        db.TagConnections.remove(entities[1]);

                        db.saveChanges(function () {
                            start();
                        });
                    });
                }).fail($data.debug);
            });
        });
    });

    test('Type beforeDelete cancel in context', 6, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                db.TagConnections.toArray().then(function (entities) {
                    var entity = entities[0];

                    var beforeDelete = function (sender, item) {
                        ok(sender === db.TagConnections.elementType, 'beforeDelete event sender');
                        ok(item === entity, 'beforeDelete event argument');

                        equal(item.Id, entity.Id, 'beforeDelete Id property');
                        equal(typeof item.Id, 'number', 'beforeDelete Id property value');

                        equal(item.entityState, $data.EntityState.Deleted, 'beforeCreate EntityState property value');
                        start();
                        return false;
                    };

                    db.TagConnections.elementType.addEventListener('beforeDelete', beforeDelete);

                    db.TagConnections.remove(entity);

                    return db.saveChanges(function () {
                        db.TagConnections.elementType.removeEventListener('beforeDelete', beforeDelete);

                        db.TagConnections.remove(entities[1]);

                        db.TagConnections.single('it.Id == this.value', { value: entity.Id }).then(function (item) {
                            ok(true, 'not deleted');
                            start();
                        }).fail(function (e) {
                            ok(false, e);
                            start();
                        });
                    });
                }).fail($data.debug);
            });
        });
    });

    test('Type afterDelete in context', 5, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.TagConnections.toArray().then(function (entities) {
                    var entity = entities[0];

                    var afterDelete = function (sender, item) {
                        ok(sender === db.TagConnections.elementType, 'afterDelete event sender');
                        ok(item === entity, 'afterDelete event argument');

                        equal(item.Id, entity.Id, 'afterDelete Id property');
                        equal(typeof item.Id, 'number', 'afterDelete Id property value');

                        equal(item.entityState, $data.EntityState.Deleted, 'beforeCreate EntityState property value');
                        start();
                    };

                    db.TagConnections.elementType.addEventListener('afterDelete', afterDelete);

                    db.TagConnections.remove(entity);

                    return db.saveChanges(function () {
                        db.TagConnections.elementType.removeEventListener('afterDelete', afterDelete);

                        db.TagConnections.remove(entities[1]);

                        db.saveChanges(function () {
                            start();
                        });
                    });
                }).fail($data.debug);
            });
        });
    });
}

function T3_oDataV3(providerConfig, msg) {
    msg = msg || '';
    module("DataTestsV3" + msg);


    test("OData_Function_sub_frames", function () {
        if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
        expect(20);
        stop(7);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var q = db.Categories.filter(function (ctg) { return ctg.Articles.some(); });
                var c = q.toTraceString();
                equal(c.queryText, "/Categories?$filter=Articles/any()", "A0: Invalid query string");

                q.toArray({
                    success: function (result) {
                        start();
                        equal(result.length, 5, 'A0: result length failed');
                        equal(result[0].Title, 'Sport', 'A0: result value failed');
                    },
                    error: function (e) {
                        start();

                        ok(false, 'A0: Category some article, error: ' + e);
                    }
                });

                var articleFilter = db.Articles.filter(function (art) { return art.Title == 'Article1'; });
                q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
                c = q.toTraceString();
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


$data.Class.define('$example.GeoTestEntity', $data.Entity, null, {
    Id: { type: 'int', key: true, computed: true },
    Name: { type: 'string' },
    GeographyPoint: { type: 'GeographyPoint' },
    GeographyLineString: { type: 'GeographyLineString' },
    GeographyPolygon: { type: 'GeographyPolygon' },
    GeographyMultiPoint: { type: 'GeographyMultiPoint' },
    GeographyMultiLineString: { type: 'GeographyMultiLineString' },
    GeographyMultiPolygon: { type: 'GeographyMultiPolygon' },
    GeographyCollection: { type: 'GeographyCollection' },
});

$data.Class.define('$example.GeometryTestEntity', $data.Entity, null, {
    Id: { type: 'int', key: true, computed: true },
    Name: { type: 'string' },
    GeometryPoint: { type: 'GeometryPoint' },
    GeometryLineString: { type: 'GeometryLineString' },
    GeometryPolygon: { type: 'GeometryPolygon' },
    GeometryMultiPoint: { type: 'GeometryMultiPoint' },
    GeometryMultiLineString: { type: 'GeometryMultiLineString' },
    GeometryMultiPolygon: { type: 'GeometryMultiPolygon' },
    GeometryCollection: { type: 'GeometryCollection' },
});

$data.Class.define('$example.GuidTestEntity', $data.Entity, null, {
    Id: { type: 'guid', key: true },
    Name: { type: 'string' }
});


$data.Class.define('$example.Context', $data.EntityContext, null, {
    GeoTestEntities: { type: $data.EntitySet, elementType: $example.GeoTestEntity },
    GeometryTestEntities: { type: $data.EntitySet, elementType: $example.GeometryTestEntity },
    GuidTestEntities: { type: $data.EntitySet, elementType: $example.GuidTestEntity }
});

function GeoTests(providerConfig, msg, afterTestFn) {
    msg = msg || '';
    module("GeoTests" + msg);

    test("Save GeographyObjects", 19, function () {
        stop();

        (new $example.Context(providerConfig)).onReady(function (context) {

            var point = new $data.GeographyPoint([1, 5]);
            var lString = new $data.GeographyLineString([[1, 2], [3, -4.34], [-5, 6.15]]);
            var polygon = new $data.GeographyPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]);
            var polygonWithHole = new $data.GeographyPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
            ]);
            var mPoint = new $data.GeographyMultiPoint([[100.0, 0.0], [101.0, 1.0]]);
            var mLineString = new $data.GeographyMultiLineString([
                  [[100.0, 0.0], [101.0, 1.0]],
                  [[102.0, 2.0], [103.0, 3.0]]
            ]);
            var mPolygon = new $data.GeographyMultiPolygon([
                [
                    [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
            ]);
            var collection = new $data.GeographyCollection({
                geometries: [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [[101.0, 0.0], [102.0, 1.0]]
                    }
                ]
            });

            var item = new $example.GeoTestEntity({
                Name: 'Item1Name',
                GeographyPoint: point,
                GeographyLineString: lString,
                GeographyPolygon: polygon,
                GeographyMultiPoint: mPoint,
                GeographyMultiLineString: mLineString,
                GeographyMultiPolygon: mPolygon,
                GeographyCollection: collection,
            });

            var item2 = new $example.GeoTestEntity({
                Name: 'Item2Name',
                GeographyPoint: point,
                GeographyLineString: lString,
                GeographyPolygon: polygonWithHole,
                GeographyMultiPoint: mPoint,
                GeographyMultiLineString: mLineString,
                GeographyMultiPolygon: mPolygon,
                GeographyCollection: collection,
            });

            context.GeoTestEntities.add(item);
            context.GeoTestEntities.add(item2);

            var itemsToSave = [item, item2];
            context.saveChanges(function () {
                context.GeoTestEntities.toArray(function (items) {

                    equal(items.length, 2, 'result length');
                    for (var i = 0; i < items.length; i++) {
                        var resItem = items[i];
                        var refItem = itemsToSave[i];

                        equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
                        equal(resItem.Name, 'Item' + (i + 1) + 'Name', 'itemName');

                        deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
                        deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
                        deepEqual(resItem.GeographyPolygon.coordinates, (i == 0 ? polygon : polygonWithHole).coordinates, 'GeographyPolygon data');
                        deepEqual(resItem.GeographyMultiPoint.coordinates, mPoint.coordinates, 'GeographyMultiPoint data');
                        deepEqual(resItem.GeographyMultiLineString.coordinates, mLineString.coordinates, 'GeographyMultiLineString data');
                        deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
                        deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

                    }

                    context.GeoTestEntities.remove(items[0]);
                    context.GeoTestEntities.remove(items[1]);
                    context.saveChanges(function () {
                        if (typeof afterTestFn === 'function') afterTestFn(context, start);
                        else start();
                    });
                });
            });

        });
    });
    test("Modify GeographyObjects", 20, function () {
        stop();

        (new $example.Context(providerConfig)).onReady(function (context) {

            var point = new $data.GeographyPoint([1, 5]);
            var lString = new $data.GeographyLineString([[1, 2], [3, -4.34], [-5, 6.15]]);
            var polygon = new $data.GeographyPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]);
            var polygonWithHole = new $data.GeographyPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
            ]);
            var mPoint = new $data.GeographyMultiPoint([[100.0, 0.0], [101.0, 1.0]]);
            var mLineString = new $data.GeographyMultiLineString([
                  [[100.0, 0.0], [101.0, 1.0]],
                  [[102.0, 2.0], [103.0, 3.0]]
            ]);
            var mPolygon = new $data.GeographyMultiPolygon([
                [
                    [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
            ]);
            var collection = new $data.GeographyCollection({
                geometries: [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [[101.0, 0.0], [102.0, 1.0]]
                    }
                ]
            });

            var item = new $example.GeoTestEntity({
                Name: 'ItemName',
                GeographyPoint: point,
                GeographyLineString: lString,
                GeographyPolygon: polygon,
                GeographyMultiPoint: null,
                GeographyMultiLineString: undefined,
                GeographyMultiPolygon: mPolygon,
                GeographyCollection: collection,
            });

            context.GeoTestEntities.add(item);

            context.saveChanges(function () {
                context.GeoTestEntities.toArray(function (items) {

                    equal(items.length, 1, 'result length');
                    var resItem = items[0];
                    var refItem = item;

                    equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
                    equal(resItem.Name, 'ItemName', 'itemName');

                    deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
                    deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
                    deepEqual(resItem.GeographyPolygon.coordinates, polygon.coordinates, 'GeographyPolygon data');
                    deepEqual(resItem.GeographyMultiPoint, null, 'GeographyMultiPoint data');
                    ok(!resItem.GeographyMultiLineString, 'GeographyMultiLineString data');
                    deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
                    deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

                    context.GeoTestEntities.attach(resItem);
                    resItem.Name = 'Item updated';
                    resItem.GeographyPolygon = polygonWithHole;
                    resItem.GeographyMultiPoint = mPoint;
                    resItem.GeographyMultiLineString = mLineString;

                    context.saveChanges(function () {
                        context.GeoTestEntities.toArray(function (itemsup) {

                            equal(itemsup.length, 1, 'result length');
                            var refItem = resItem;
                            var resItem = itemsup[0];

                            equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
                            equal(resItem.Name, 'Item updated', 'itemName updated');

                            deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
                            deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
                            deepEqual(resItem.GeographyPolygon.coordinates, polygonWithHole.coordinates, 'GeographyPolygon data');
                            deepEqual(resItem.GeographyMultiPoint.coordinates, mPoint.coordinates, 'GeographyMultiPoint data');
                            deepEqual(resItem.GeographyMultiLineString.coordinates, mLineString.coordinates, 'GeographyMultiLineString data');
                            deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
                            deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

                            context.GeoTestEntities.remove(resItem);
                            context.saveChanges(function () {
                                if (typeof afterTestFn === 'function') afterTestFn(context, start);
                                else start();
                            });
                        });
                    });
                });
            });
        });
    });

    test("Save GeometryObjects", 19, function () {
        stop();

        (new $example.Context(providerConfig)).onReady(function (context) {

            var point = new $data.GeometryPoint([1, 5]);
            var lString = new $data.GeometryLineString([[1, 2], [3, -4.34], [-5, 6.15]]);
            var polygon = new $data.GeometryPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]);
            var polygonWithHole = new $data.GeometryPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
            ]);
            var mPoint = new $data.GeometryMultiPoint([[100.0, 0.0], [101.0, 1.0]]);
            var mLineString = new $data.GeometryMultiLineString([
                  [[100.0, 0.0], [101.0, 1.0]],
                  [[102.0, 2.0], [103.0, 3.0]]
            ]);
            var mPolygon = new $data.GeometryMultiPolygon([
                [
                    [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
            ]);
            var collection = new $data.GeometryCollection({
                geometries: [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [[101.0, 0.0], [102.0, 1.0]]
                    }
                ]
            });

            var item = new $example.GeometryTestEntity({
                Name: 'Item1Name',
                GeometryPoint: point,
                GeometryLineString: lString,
                GeometryPolygon: polygon,
                GeometryMultiPoint: mPoint,
                GeometryMultiLineString: mLineString,
                GeometryMultiPolygon: mPolygon,
                GeometryCollection: collection,
            });

            var item2 = new $example.GeometryTestEntity({
                Name: 'Item2Name',
                GeometryPoint: point,
                GeometryLineString: lString,
                GeometryPolygon: polygonWithHole,
                GeometryMultiPoint: mPoint,
                GeometryMultiLineString: mLineString,
                GeometryMultiPolygon: mPolygon,
                GeometryCollection: collection,
            });

            context.GeometryTestEntities.add(item);
            context.GeometryTestEntities.add(item2);

            var itemsToSave = [item, item2];
            context.saveChanges(function () {
                context.GeometryTestEntities.toArray(function (items) {

                    equal(items.length, 2, 'result length');
                    for (var i = 0; i < items.length; i++) {
                        var resItem = items[i];
                        var refItem = itemsToSave[i];

                        equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
                        equal(resItem.Name, 'Item' + (i + 1) + 'Name', 'itemName');

                        deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
                        deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
                        deepEqual(resItem.GeometryPolygon.coordinates, (i == 0 ? polygon : polygonWithHole).coordinates, 'GeometryPolygon data');
                        deepEqual(resItem.GeometryMultiPoint.coordinates, mPoint.coordinates, 'GeometryMultiPoint data');
                        deepEqual(resItem.GeometryMultiLineString.coordinates, mLineString.coordinates, 'GeometryMultiLineString data');
                        deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
                        deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

                    }

                    context.GeometryTestEntities.remove(items[0]);
                    context.GeometryTestEntities.remove(items[1]);
                    context.saveChanges(function () {
                        if (typeof afterTestFn === 'function') afterTestFn(context, start);
                        else start();
                    });
                });
            });

        });
    });

    test("Modify GeometryObjects", 20, function () {
        stop();

        (new $example.Context(providerConfig)).onReady(function (context) {

            var point = new $data.GeometryPoint([1, 5]);
            var lString = new $data.GeometryLineString([[1, 2], [3, -4.34], [-5, 6.15]]);
            var polygon = new $data.GeometryPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]]
            ]);
            var polygonWithHole = new $data.GeometryPolygon([
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
            ]);
            var mPoint = new $data.GeometryMultiPoint([[100.0, 0.0], [101.0, 1.0]]);
            var mLineString = new $data.GeometryMultiLineString([
                  [[100.0, 0.0], [101.0, 1.0]],
                  [[102.0, 2.0], [103.0, 3.0]]
            ]);
            var mPolygon = new $data.GeometryMultiPolygon([
                [
                    [[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]
                ],
                [
                    [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
                    [[100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2]]
                ]
            ]);
            var collection = new $data.GeometryCollection({
                geometries: [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [[101.0, 0.0], [102.0, 1.0]]
                    }
                ]
            });

            var item = new $example.GeometryTestEntity({
                Name: 'ItemName',
                GeometryPoint: point,
                GeometryLineString: lString,
                GeometryPolygon: polygon,
                GeometryMultiPoint: null,
                GeometryMultiLineString: undefined,
                GeometryMultiPolygon: mPolygon,
                GeometryCollection: collection,
            });

            context.GeometryTestEntities.add(item);

            context.saveChanges(function () {
                context.GeometryTestEntities.toArray(function (items) {

                    equal(items.length, 1, 'result length');
                    var resItem = items[0];
                    var refItem = item;

                    equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
                    equal(resItem.Name, 'ItemName', 'itemName');

                    deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
                    deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
                    deepEqual(resItem.GeometryPolygon.coordinates, polygon.coordinates, 'GeometryPolygon data');
                    deepEqual(resItem.GeometryMultiPoint, null, 'GeometryMultiPoint data');
                    ok(!resItem.GeometryMultiLineString, 'GeometryMultiLineString data');
                    deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
                    deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

                    context.GeometryTestEntities.attach(resItem);
                    resItem.Name = 'Item updated';
                    resItem.GeometryPolygon = polygonWithHole;
                    resItem.GeometryMultiPoint = mPoint;
                    resItem.GeometryMultiLineString = mLineString;

                    context.saveChanges(function () {
                        context.GeometryTestEntities.toArray(function (itemsup) {

                            equal(itemsup.length, 1, 'result length');
                            var refItem = resItem;
                            var resItem = itemsup[0];

                            equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
                            equal(resItem.Name, 'Item updated', 'itemName updated');

                            deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
                            deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
                            deepEqual(resItem.GeometryPolygon.coordinates, polygonWithHole.coordinates, 'GeometryPolygon data');
                            deepEqual(resItem.GeometryMultiPoint.coordinates, mPoint.coordinates, 'GeometryMultiPoint data');
                            deepEqual(resItem.GeometryMultiLineString.coordinates, mLineString.coordinates, 'GeometryMultiLineString data');
                            deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
                            deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

                            context.GeometryTestEntities.remove(resItem);
                            context.saveChanges(function () {
                                if (typeof afterTestFn === 'function') afterTestFn(context, start);
                                else start();
                            });
                        });
                    });
                });
            });
        });
    });
}

function GuidTests(providerConfig, msg, afterTestFn) {
    msg = msg || '';
    module("GuidTests" + msg);

    test("Guid key with 'in' structure", 6, function () {
        stop();

        (new $example.Context(providerConfig)).onReady(function (context) {

            for (var i = 0; i < 5; i++) {
                context.GuidTestEntities.add(new $example.GuidTestEntity({
                    Id: $data.createGuid().toString(),
                    Title: 'Title_test_' + i
                }));
            }

            context.saveChanges(function(){
                context.GuidTestEntities.map('it.Id').take(2).toArray(function (res) {
                    equal(res.length, 2, 'result count');
                    equal(typeof res[0], 'string', 'item 0 is string');
                    equal(typeof res[1], 'string', 'item 1 is string');

                    context.GuidTestEntities.filter(function (it) { return it.Id in this.keys }, { keys: res }).toArray(function (typedRes) {
                        equal(res.length, 2, 'result count');

                        for (var i = 0; i < 2; i++) {
                            ok(res.indexOf(typedRes[i].Id >= 0), "key '" + typedRes[i].Id + "' in result");
                        }


                        if (typeof afterTestFn === 'function') afterTestFn(context, start);
                        else start();
                    });
                });
            });
        });
    });

};


function GeoTestsFuncCompile(providerConfig, msg) {
    test("Geo functions compile", 1, function () {
        if (providerConfig.name != "oData") { ok(true, "Not supported"); return; }
        expect(5);
        (new $example.Context(providerConfig)).onReady(function (context) {

            var q = context.GeoTestEntities.filter(function (it) { it.GeographyPoint.distance(this.location) < 50.16 }, { location: new $data.GeographyPoint(1, 5) }).toTraceString();
            equal(q.queryText, "/GeoTestEntities?$filter=(geo.distance(GeographyPoint,geography'POINT(1 5)') lt 50.16)");
            q = context.GeoTestEntities.filter(function (it) { 50.16 > it.GeographyPoint.distance(this.location) }, { location: new $data.GeographyPoint(1, 5) }).toTraceString();
            equal(q.queryText, "/GeoTestEntities?$filter=(50.16 gt geo.distance(GeographyPoint,geography'POINT(1 5)'))");

            var polygon = new $data.GeographyPolygon([
                    [[100.0, -0.5], [101.0, 0.0], [101.0, 1.0], [100.5, 1.5], [100.0, -0.5]]
            ]);
            q = context.GeoTestEntities.filter(function (it) { it.GeographyPoint.intersects(this.polygon) }, { polygon: polygon }).toTraceString();
            equal(q.queryText, "/GeoTestEntities?$filter=geo.intersects(GeographyPoint,geography'POLYGON((100 -0.5,101 0,101 1,100.5 1.5,100 -0.5))')");


            q = context.GeoTestEntities.filter(function (it) { it.GeographyLineString.length() > 50.36 }).toTraceString();
            equal(q.queryText, "/GeoTestEntities?$filter=(geo.length(GeographyLineString) gt 50.36)");
            q = context.GeoTestEntities.filter(function (it) { 50.36 < it.GeographyLineString.length() }).toTraceString();
            equal(q.queryText, "/GeoTestEntities?$filter=(50.36 lt geo.length(GeographyLineString))");

        });
    });
}
