import mock$data from '../core.js';
import $data from 'jaydata/core';
import { expect } from 'chai';
import { asyncQTM } from './scripts/qunitToMocha.js';
$data.setModelContainer(global);
import newsReaderContext from './scripts/NewsReaderContext.js';

var exports = module.exports = {};
exports.T3 = function (providerConfig, msg) {
  msg = msg || '';

  describe(msg, function () {
    this.timeout(30 * 1000);

    asyncQTM.test('BreezeLikeAPI', 6, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Articles
            .filter("Id", "==", 1)
            .toArray(function (items) {
              start();
              asyncQTM.equal(items.length, 1, "one record found");
              asyncQTM.equal(items[0].Id, 1, "record is Id = 1");
            });

          db.Articles
            .filter("Id", "in", [1, 3, 5, 7])
            .toArray(function (items) {
              start();
              asyncQTM.equal(items.length, 4, "one record found");
              asyncQTM.equal(items[1].Id, 3, "record is Id = 3");
            });

          db.Articles
            .filter("Title", ".startsWith", "Article2")
            .filter("Title", ".contains", "25")
            .toArray(function (items) {
              start();
              asyncQTM.equal(items.length, 1, "one record found");
            });


          db.Articles
            .include("Author")
            .filter("Author.LoginName", ".startsWith", "Usr1")
            .filter("Id", ">", 10)
            .toArray(function (items) {
              start();
              asyncQTM.equal(items[0].Author.LoginName, 'Usr1', 'Author matches');
            });

        });
      });
    });

    // asyncQTM.test('paging - next - 5', 4, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.take(5).toArray(function (itt) {
    //         var s = itt[0].Id;
    //         asyncQTM.deepEqual(itt.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'item Id list');
    //         asyncQTM.equal(itt[0] instanceof $news.Types.Article, true, 'not anonymous type');

    //         itt.next().then(function (itt) {
    //           s += 5;
    //           asyncQTM.deepEqual(itt.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'next item Id list');
    //           asyncQTM.equal(itt[0] instanceof $news.Types.Article, true, 'not anonymous type');
    //           start();
    //         }).fail(function (ex) {
    //           asyncQTM.ok(false, 'Error: ' + ex);
    //           start();
    //         });
    //       })

    //     });
    //   });
    // });

    // asyncQTM.test('paging - next - 5 inside promise', 4, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.take(5).toArray().then(function (it) {
    //         var s = it[0].Id;
    //         asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'item Id list');
    //         asyncQTM.equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

    //         it.next().then(function (it) {
    //           s += 5;
    //           asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'next item Id list');
    //           asyncQTM.equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');
    //           start();
    //         }).fail(function (ex) {
    //           asyncQTM.ok(false, 'Error: ' + ex);
    //           start();
    //         });
    //       })

    //     });
    //   });
    // });

    // asyncQTM.test('paging - prev - 5', 4, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.take(5).skip(5).toArray(function (it) {
    //         var s = it[0].Id;
    //         asyncQTM.asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'item Id list');
    //         asyncQTM.equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

    //         it.prev().then(function (it) {
    //           s -= 5;
    //           asyncQTM.asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'prev item Id list');
    //           asyncQTM.equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');
    //           start();
    //         }).fail(function (ex) {
    //           asyncQTM.ok(false, 'Error: ' + ex);
    //           start();
    //         });
    //       })

    //     });
    //   });
    // });

    // asyncQTM.test('paging - prev - 5 from 3', 2, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.take(5).skip(3).toArray(function (it) {
    //         var s = it[0].Id;
    //         asyncQTM.asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'item Id list');

    //         it.prev().then(function (it) {
    //           s -= 3;
    //           asyncQTM.asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'prev item Id list');
    //           start();
    //         }).fail(function (ex) {
    //           asyncQTM.ok(false, 'Error: ' + ex);
    //           start();
    //         });
    //       })

    //     });
    //   });
    // });

    // asyncQTM.test('paging - prev - error - 5 from 0', 3, function (start) {


    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.take(5).toArray(function (it) {
    //         var s = it[0].Id;
    //         asyncQTM.asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'item Id list');

    //         it.prev().then(function (it) {
    //           asyncQTM.ok(false, 'invalid run, excepted fail way');
    //           start();
    //         }).fail(function (ex) {
    //           asyncQTM.equal(ex.message, 'Invalid skip value!', 'error message');
    //           asyncQTM.equal(ex.data.skip, -5, 'invalid skip value');

    //           start();
    //         });
    //       })

    //     });
    //   });
    // });

    // asyncQTM.test('paging - error - no take', 7, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.toArray(function (it) {
    //         asyncQTM.equal(it.length, 26, 'full result requested');

    //         it.next().then(function (it) {
    //           asyncQTM.ok(false, 'invalid run, excepted fail way');
    //           start();
    //         }).fail(function (ex) {
    //           asyncQTM.equal(ex.message, 'take expression not defined in the chain!', 'error message');
    //           asyncQTM.equal(typeof ex.data.skip, 'undefined', 'skip value');
    //           asyncQTM.equal(typeof ex.data.take, 'undefined', 'skip value');

    //           start();
    //         });


    //         it.prev().then(function (it) {
    //           asyncQTM.ok(false, 'invalid run, excepted fail way');
    //           start();
    //         }).fail(function (ex) {
    //           asyncQTM.equal(ex.message, 'take expression not defined in the chain!', 'error message');
    //           asyncQTM.equal(typeof ex.data.skip, 'undefined', 'skip value');
    //           asyncQTM.equal(typeof ex.data.take, 'undefined', 'skip value');

    //           start();
    //         });
    //       })

    //     });
    //   });
    // });

    // asyncQTM.test('paging deep - next-next-prev - 5', 4, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.take(5).toArray(function (it) {
    //         var s = it[0].Id;
    //         asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'item Id list');

    //         it.next().then(function (it) {
    //           s += 5;
    //           asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'next item Id list');

    //           it.next().then(function (it) {
    //             s += 5;
    //             asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'next2 item Id list');

    //             it.prev().then(function (it) {
    //               s -= 5;
    //               asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [s + 0, s + 1, s + 2, s + 3, s + 4], 'prev item Id list');
    //               start();
    //             }).fail(function (ex) {
    //               asyncQTM.ok(false, 'Error: ' + ex);
    //               start();
    //             });

    //           }).fail(function (ex) {
    //             asyncQTM.ok(false, 'Error: ' + ex);
    //             start();
    //           });

    //         }).fail(function (ex) {
    //           asyncQTM.ok(false, 'Error: ' + ex);
    //           start();
    //         });
    //       })

    //     });
    //   });
    // });

    asyncQTM.test('paging deep - next-next-prev - 5 with map', 6, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }


      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

          db.Articles.map(function (it) { return { Id: it.Id, Title: it.Title } }).take(5).toArray(function (it) {
            asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [1, 2, 3, 4, 5], 'item Id list');
            asyncQTM.equal(it[0] instanceof $news.Types.Article, false, 'anonymous type');

            it.next().then(function (it) {
              asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'next item Id list');
              asyncQTM.equal(it[0] instanceof $news.Types.Article, false, 'anonymous type');

              it.next().then(function (it) {
                asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [11, 12, 13, 14, 15], 'next2 item Id list');
                asyncQTM.equal(it[0] instanceof $news.Types.Article, false, 'anonymous type');

                it.prev().then(function (it) {
                  asyncQTM.deepEqual(it.map(function (i) { return i.Id; }), [6, 7, 8, 9, 10], 'prev item Id list');
                  asyncQTM.equal(it[0] instanceof $news.Types.Article, false, 'anonymous type');
                  start();
                }).fail(function (ex) {
                  asyncQTM.ok(false, 'Error: ' + ex);
                  start();
                });

              }).fail(function (ex) {
                asyncQTM.ok(false, 'Error: ' + ex);
                start();
              });

            }).fail(function (ex) {
              asyncQTM.ok(false, 'Error: ' + ex);
              start();
            });
          })

        });
      });
    });

    // asyncQTM.test('paging deep - next-next-prev - 2 with filter, order', 6, function (start) {
    //   if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }


    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.filter('it.Title.contains("1")').orderBy('it.Title').take(2).toArray(function (it) {
    //         asyncQTM.deepEqual(it.map(function (i) { return i.Title; }), ['Article1', 'Article21'], 'item Id list');
    //         asyncQTM.equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

    //         it.next().then(function (it) {
    //           asyncQTM.deepEqual(it.map(function (i) { return i.Title; }), ['Article31', 'Article41'], 'next item Id list');
    //           asyncQTM.equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

    //           it.next().then(function (it) {
    //             asyncQTM.deepEqual(it.map(function (i) { return i.Title; }), ['Article51'], 'next2 item Id list');
    //             asyncQTM.equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');

    //             it.prev().then(function (it) {
    //               asyncQTM.deepEqual(it.map(function (i) { return i.Title; }), ['Article31', 'Article41'], 'prev item Id list');
    //               asyncQTM.equal(it[0] instanceof $news.Types.Article, true, 'not anonymous type');
    //               start();
    //             }).fail(function (ex) {
    //               asyncQTM.ok(false, 'Error: ' + ex);
    //               start();
    //             });

    //           }).fail(function (ex) {
    //             asyncQTM.ok(false, 'Error: ' + ex);
    //             start();
    //           });

    //         }).fail(function (ex) {
    //           asyncQTM.ok(false, 'Error: ' + ex);
    //           start();
    //         });
    //       })

    //     });
    //   });
    // });

    // asyncQTM.test('inlineCount - array result', 6, function (start) {
    //   if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.withInlineCount().toArray(function (items) {
    //         asyncQTM.equal(items.totalCount, items.length, 'inline count without filter, take, skip');
    //         start(1);
    //       });
    //     });
    //   });
    // });

    // asyncQTM.test('Filter_noFilter', 6, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       var q = db.Tags;
    //       q.toArray(function (r) {
    //         start(1);
    //         asyncQTM.ok(r, "faild query");
    //         asyncQTM.equal(r.length, 5, 'Number of tags faild');
    //         for (var i = 0; i < r.length; i++) {
    //           asyncQTM.ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
    //         }
    //         asyncQTM.equal(typeof r[0].Id, 'number', 'Field type error: Id');
    //         asyncQTM.equal(typeof r[0].Title, 'string', 'Field type error: Id');
    //       });

    //     });
    //   });
    // });
    // asyncQTM.test('Filter_noFilter_orderby', 6, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       var q = db.Tags.orderBy(function (t) { return t.Title });
    //       q.toArray(function (r) {
    //         start(1);
    //         asyncQTM.ok(r, "faild query");
    //         asyncQTM.equal(r.length, 5, 'Number of tags faild');
    //         var preItem = null;
    //         for (var i = 0; i < r.length; i++) {
    //           asyncQTM.ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
    //           if (preItem) {
    //             asyncQTM.ok(preItem < r[i].Title, 'Order error at ' + i + ' position');
    //           }
    //           preItem = r[i].Title;
    //         }
    //         asyncQTM.equal(typeof r[0].Id, 'number', 'Field type error: Id');
    //         asyncQTM.equal(typeof r[0].Title, 'string', 'Field type error: Id');
    //       });

    //     });
    //   });
    // });
    // asyncQTM.test('Filter_noFilter_orderbyDesc', 6, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       var q = db.Tags.orderByDescending(function (t) { return t.Title });
    //       q.toArray(function (r) {
    //         start(1);
    //         asyncQTM.ok(r, "faild query");
    //         asyncQTM.equal(r.length, 5, 'Number of tags faild');
    //         var preItem = null;
    //         for (var i = 0; i < r.length; i++) {
    //           asyncQTM.ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
    //           if (preItem) {
    //             asyncQTM.ok(preItem > r[i].Title, 'Order error at ' + i + ' position');
    //           }
    //           preItem = r[i].Title;
    //         }
    //         asyncQTM.equal(typeof r[0].Id, 'number', 'Field type error: Id');
    //         asyncQTM.equal(typeof r[0].Title, 'string', 'Field type error: Id');
    //       });

    //     });
    //   });
    // });
    // asyncQTM.test('Filter_noFilter_multiple_orderby', 6, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       var q = db.UserProfiles.orderByDescending(function (t) { return t.FullName }).orderBy(function (t) { return t.Bio });
    //       q.toArray(function (r) {
    //         start(1); console.dir(r);
    //         asyncQTM.ok(r, "faild query");
    //         asyncQTM.equal(r.length, 6, 'Number of tags faild');
    //         var preItem = null;
    //         for (var i = 0; i < r.length; i++) {
    //           asyncQTM.ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
    //           if (preItem) {
    //             asyncQTM.ok((preItem.FullName > r[i].FullName) || ((preItem.FullName == r[i].FullName) && (preItem.Bio < r[i].Bio)), 'Order error at ' + i + ' position');
    //           }
    //           preItem = r[i];
    //         }
    //         asyncQTM.equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
    //         asyncQTM.equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

    //       });

    //     });
    //   });
    // });
    // asyncQTM.test('Filter_noFilter_multiple_orderby', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       var q = db.UserProfiles.orderBy(function (t) { return t.Bio }).skip(1).take(2);
    //       q.toArray(function (r) {
    //         start(1);
    //         asyncQTM.ok(r, "faild query");
    //         asyncQTM.equal(r.length, 2, 'Number of tags faild');
    //         var preItem = null;
    //         for (var i = 0; i < r.length; i++) {
    //           asyncQTM.ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
    //           if (preItem) {
    //             asyncQTM.ok(preItem.Bio < r[i].Bio, 'Order error at ' + i + ' position');
    //           }
    //           preItem = r[i];
    //         }
    //         asyncQTM.equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
    //         asyncQTM.equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

    //         asyncQTM.equal(r[0].Bio, 'Bio2', 'Data integrity error');
    //         asyncQTM.equal(r[1].Bio, 'Bio3', 'Data integrity error');
    //       });

    //     });
    //   });
    // });
    // asyncQTM.test('Filter_scalar_field_use_one_one_relation', 6, function start() {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       var q = db.Users.filter(function (u) { return u.Profile.Bio == "Bio3" });
    //       q.toArray(function (r) {
    //         start(1); console.dir(r);
    //         asyncQTM.ok(r, "faild query");
    //         asyncQTM.equal(r.length, 1, 'Number of tags faild');
    //         asyncQTM.ok(r[0] instanceof $news.Types.User, 'Data type error');
    //         asyncQTM.equal(typeof r[0].Id, 'number', 'Field type error: Id');
    //         asyncQTM.equal(typeof r[0].LoginName, 'string', 'Field type error: LoginName');
    //         asyncQTM.equal(typeof r[0].Email, 'string', 'Field type error: Email');

    //         asyncQTM.equal(typeof r[0].Id, 'number', 'Data integrity error');
    //         asyncQTM.equal(r[0].LoginName, 'Usr3', 'Data integrity error');
    //         asyncQTM.equal(r[0].Email, 'usr3@company.com', 'Data integrity error');
    //       });

    //     });
    //   });
    // });
    // asyncQTM.test('Filter_noFilter_multiple_orderby', 6, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       var q = db.UserProfiles.orderBy(function (t) { return t.Bio }).skip(1).take(2);
    //       q.toArray(function (r) {
    //         start(1);
    //         asyncQTM.ok(r, "faild query");
    //         asyncQTM.equal(r.length, 2, 'Number of tags faild');
    //         var preItem = null;
    //         for (var i = 0; i < r.length; i++) {
    //           asyncQTM.ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
    //           if (preItem) {
    //             asyncQTM.ok(preItem.Bio < r[i].Bio, 'Order error at ' + i + ' position');
    //           }
    //           preItem = r[i];
    //         }
    //         asyncQTM.equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
    //         asyncQTM.equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

    //         asyncQTM.equal(r[0].Bio, 'Bio2', 'Data integrity error');
    //         asyncQTM.equal(r[1].Bio, 'Bio3', 'Data integrity error');
    //       });

    //     });
    //   });
    // });
    // asyncQTM.test('Update_Articles_Title', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Articles.skip(2).take(1).toArray(function (result) {
    //         start(1);
    //         asyncQTM.ok(result, 'query failed');
    //         asyncQTM.equal(result.length, 1, 'not only 1 row in result set');
    //         var a = result[0];
    //         db.Articles.attach(a);
    //         a.Title = 'updatedArticleTitle';
    //         db.saveChanges(function () {
    //           start(1);
    //           db.Articles.filter(function (item) { return item.Id == this.id; }, { id: a.Id }).toArray(function (result) {
    //             start(1);
    //             asyncQTM.ok(result, 'query failed');
    //             asyncQTM.equal(result.length, 1, 'not only 1 row in result set');
    //             var a = result[0];
    //             asyncQTM.equal(a.Title, 'updatedArticleTitle', 'update failed');
    //           });
    //         });
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('Batch_Update_Articles', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Articles.toArray(function (result) {
    //         start(1);
    //         asyncQTM.ok(result, 'query failed');
    //         for (var i = 0; i < result.length; i++) {
    //           var a = result[i];
    //           db.Articles.attach(a);
    //           a.Title = 'updatedArticleTitle';
    //         }
    //         db.saveChanges(function () {
    //           db.Articles.toArray(function (result) {
    //             start(1);
    //             asyncQTM.ok(result, 'query failed');
    //             asyncQTM.equal(result.length, 26, 'not only 1 row in result set');
    //             for (var i = 0; i < result.length; i++) {
    //               var a = result[i];
    //               asyncQTM.equal(a.Title, 'updatedArticleTitle', 'update failed');
    //             }
    //           });
    //         });
    //       });
    //     });
    //   });
    // });

    // asyncQTM.test('Include_Articles_in_Category', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Categories.include('Articles').toArray(function (result) {
    //         start(1);
    //         asyncQTM.ok(result, 'query failed');
    //         var a = result[0];
    //         asyncQTM.equal(a.Articles instanceof Array, true, 'Articles is not an Array');
    //         asyncQTM.equal(a.Articles[0] instanceof $news.Types.Article, true, 'First element in articles is not a $news.Types.Article');
    //         asyncQTM.equal(typeof a.Articles[0].Title == 'string', true, 'Article.Title is not a string');
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('Include_Category_in_Article', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }

        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Articles.include('Category').toArray(function (result) {
    //         start(1);
    //         asyncQTM.ok(result, 'query failed');
    //         var a = result[0];
    //         asyncQTM.equal(a.Category instanceof $news.Types.Category, true, 'Category is not an Category');
    //         asyncQTM.equal(typeof a.Category.Title == 'string', true, 'Article.Title is not a string');
    //       });
    //     });
    //   });
    // });

    // asyncQTM.test('Update_Articles_and_add_new_TagConnection', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Articles.take(1).toArray(function (result) {
    //         start(1);
    //         asyncQTM.ok(result, 'query failed');
    //         asyncQTM.equal(result.length, 1, 'not only 1 row in result set');
    //         var a = result[0];
    //         db.Articles.attach(a);
    //         a.Title = 'updatedArticleTitle';
    //         db.saveChanges({
    //           success: function () {
    //             start(1);
    //             db.Articles.filter(function (item) { return item.Id == this.id; }, { id: a.Id }).toArray(function (result) {
    //               start(1);
    //               asyncQTM.ok(result, 'query failed');
    //               asyncQTM.equal(result.length, 1, 'not only 1 row in result set');
    //               var a = result[0];
    //               asyncQTM.equal(a.Title, 'updatedArticleTitle', 'update failed');
    //               db.Articles.attach(a);
    //               db.TagConnections.add(new $news.Types.TagConnection({ Article: a, Tag: new $news.Types.Tag({ Title: 'newtag' }) }));
    //               db.saveChanges({
    //                 success: function () {
    //                   start(1);
    //                   db.TagConnections.filter(function (item) { return item.Article.Id == this.id && item.Tag.Title == 'newtag'; }, { id: a.Id }).toArray(function (result) {
    //                     start(1);
    //                     asyncQTM.ok(result, 'query failed');
    //                     asyncQTM.equal(result.length, 1, 'not only 1 row in result set');
    //                   });
    //                 },
    //                 error: function (error) {
    //                   start(2);
    //                   console.dir(error);
    //                   asyncQTM.ok(false, error);
    //                 }
    //               });
    //             });
    //           },
    //           error: function (error) {
    //             start(4);
    //             console.dir(error);
    //             asyncQTM.ok(false, error);
    //           }
    //         });
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('full_table_length', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Articles.length({
    //         success: function (result) {
    //           start(1);
    //           asyncQTM.ok(result, 'query failed');
    //           asyncQTM.equal(result, 26, 'not only 1 row in result set');
    //           console.dir(result);
    //         },
    //         error: function (error) {
    //           start(1);
    //           console.dir(error);
    //           asyncQTM.ok(false, error);
    //         }
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('full_table_length_with_include', 3, function (start) {
    //   if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Categories.include("Articles").map(function (c) { return { i: c.Id } }).length({
    //         success: function (result) {
    //           start(1);
    //           asyncQTM.ok(result, 'query failed');
    //           asyncQTM.equal(result, 5, 'not only 1 row in result set');
    //           console.dir(result);
    //         },
    //         error: function (error) {
    //           start(1);
    //           console.dir(error);
    //           asyncQTM.ok(false, error);
    //         }
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('full_table_length_with_multiple_include', 3, function (start) {
    //   if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Categories.include("Articles").include("Articles.Author").map(function (c) { return { i: c.Id } }).length({
    //         success: function (result) {
    //           start(1);
    //           asyncQTM.ok(result, 'query failed');
    //           asyncQTM.equal(result, 5, 'not only 1 row in result set');
    //           console.dir(result);
    //         },
    //         error: function (error) {
    //           start(1);
    //           console.dir(error);
    //           asyncQTM.ok(false, error);
    //         }
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('full_table_single', 3, function (start) {
    //   if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Articles.single(function (a) { return a.Id == 1; }, null, {
    //         success: function (result) {
    //           start(1);
    //           asyncQTM.ok(result, 'query failed');
    //           asyncQTM.ok(result instanceof $news.Types.Article, 'Result faild');
    //         },
    //         error: function (error) {
    //           start(1);
    //           console.dir(error);
    //           asyncQTM.ok(false, error);
    //         }
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('full_table_single_faild', 3, function (start) {
    //   if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Articles.single(function (a) { return a.Id > 1; }, null, {
    //         success: function (result) {
    //           start(1);
    //           asyncQTM.ok(false, 'Single return more than 1 item');
    //         },
    //         error: function (error) {
    //           start(1);
    //           asyncQTM.ok(true, 'OK');
    //         }
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('delete_with_in_operator', 3, function (start) {
    //   if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }

        
    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);
    //       db.TagConnections.map(function (item) { return item.Tag.Id; }).toArray(function (ids) {
    //         start(1);
    //         db.Tags.filter(function (item) { return !(item.Id in this.tags); }, { tags: ids }).toArray(function (result) {
    //           start(1);
    //           asyncQTM.ok(result, 'query error');
    //           asyncQTM.equal(result.length, 2, 'query number faild');
    //         });
    //       });
    //     });
    //   });
    // });
    // asyncQTM.test('navigation_property_both_side', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
 
        
    //   var c = $data.createContainer();
    //   $data.Class.define("$navProp.Category", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     Title: { dataType: "string" },
    //     Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
    //   }, null);
    //   $data.Class.define("$navProp.Article", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     Title: { dataType: "string" },
    //     Category: { dataType: "$navProp.Category", inverseProperty: "Articles" },
    //     Author: { dataType: "$navProp.User", inverseProperty: "Articles" },
    //   }, null);
    //   $data.Class.define("$navProp.User", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     LoginName: { dataType: "string" },
    //     Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Author" },
    //     Profile: { dataType: "$navProp.UserProfile", inverseProperty: "User" },
    //   }, null);
    //   $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     FullName: { dataType: "string" },
    //     User: { dataType: "$navProp.User", inverseProperty: "Profile", required: true }
    //   }, null);
    //   $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
    //     Categories: { dataType: $data.EntitySet, elementType: c.$navProp.Category },
    //     Articles: { dataType: $data.EntitySet, elementType: c.$navProp.Article },
    //     Users: { dataType: $data.EntitySet, elementType: c.$navProp.User },
    //     UserProfiles: { dataType: $data.EntitySet, elementType: c.$navProp.UserProfile },
    //   }, null);
    //   var $navProp = c.$navProp;

    //   (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

    //     var storageModel = db._storageModel.getStorageModel($navProp.Category);
    //     var assoc = storageModel.Associations['Articles'];
    //     asyncQTM.equal(assoc.From, 'Category', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Article', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

    //     //////// Article
    //     storageModel = db._storageModel.getStorageModel($navProp.Article);
    //     assoc = storageModel.Associations['Category'];
    //     asyncQTM.equal(assoc.From, 'Article', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Category', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

    //     assoc = storageModel.Associations['Author'];
    //     asyncQTM.equal(assoc.From, 'Article', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'User', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


    //     ///////User
    //     storageModel = db._storageModel.getStorageModel($navProp.User);
    //     assoc = storageModel.Associations['Articles'];
    //     asyncQTM.equal(assoc.From, 'User', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Article', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

    //     assoc = storageModel.Associations['Profile'];
    //     asyncQTM.equal(assoc.From, 'User', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'UserProfile', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

    //     ///////UserProfile
    //     storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
    //     assoc = storageModel.Associations['User'];
    //     asyncQTM.equal(assoc.From, 'UserProfile', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'User', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
    //     start();
    //   });
    // });
    // asyncQTM.test('navigation_property_one_side', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
 
        
    //   var c = $data.createContainer();
    //   $data.Class.define("$navProp.Category", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     Title: { dataType: "string" },
    //     Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
    //   }, null);
    //   $data.Class.define("$navProp.Article", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     Title: { dataType: "string" },
    //     Category: { dataType: "$navProp.Category" },
    //     Author: { dataType: "$navProp.User" },
    //   }, null);
    //   $data.Class.define("$navProp.User", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     LoginName: { dataType: "string" },
    //     Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Author" },
    //     Profile: { dataType: "$navProp.UserProfile", inverseProperty: "User" },
    //   }, null);
    //   $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     FullName: { dataType: "string" },
    //     User: { dataType: "$navProp.User", required: true }
    //   }, null);
    //   $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
    //     Categories: { dataType: $data.EntitySet, elementType: c.$navProp.Category },
    //     Articles: { dataType: $data.EntitySet, elementType: c.$navProp.Article },
    //     Users: { dataType: $data.EntitySet, elementType: c.$navProp.User },
    //     UserProfiles: { dataType: $data.EntitySet, elementType: c.$navProp.UserProfile },
    //   }, null);
    //   var $navProp = c.$navProp;
    //   (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

    //     var storageModel = db._storageModel.getStorageModel($navProp.Category);
    //     var assoc = storageModel.Associations['Articles'];
    //     asyncQTM.equal(assoc.From, 'Category', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Article', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

    //     //////// Article
    //     storageModel = db._storageModel.getStorageModel($navProp.Article);
    //     assoc = storageModel.Associations['Category'];
    //     asyncQTM.equal(assoc.From, 'Article', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Category', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

    //     assoc = storageModel.Associations['Author'];
    //     asyncQTM.equal(assoc.From, 'Article', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'User', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


    //     ///////User
    //     storageModel = db._storageModel.getStorageModel($navProp.User);
    //     assoc = storageModel.Associations['Articles'];
    //     asyncQTM.equal(assoc.From, 'User', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Article', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

    //     assoc = storageModel.Associations['Profile'];
    //     asyncQTM.equal(assoc.From, 'User', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'UserProfile', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

    //     ///////UserProfile
    //     storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
    //     assoc = storageModel.Associations['User'];
    //     asyncQTM.equal(assoc.From, 'UserProfile', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'User', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
    //     start();
    //   });
    // });
    // asyncQTM.test('navigation_property_many_side', 3, function (start) {
    //   //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }
 
       
    //   var c = $data.createContainer();

    //   $data.Class.define("$navProp.Category", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     Title: { dataType: "string" },
    //     Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
    //   }, null);
    //   $data.Class.define("$navProp.Article", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     Title: { dataType: "string" },
    //     Category: { dataType: "$navProp.Category", inverseProperty: "Articles" },
    //     Author: { dataType: "$navProp.User", inverseProperty: "Articles" },
    //   }, null);
    //   $data.Class.define("$navProp.User", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     LoginName: { dataType: "string" },
    //     Articles: { dataType: "Array", elementType: c.$navProp.Article },
    //     Profile: { dataType: "$navProp.UserProfile" },
    //   }, null);
    //   $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
    //     Id: { dataType: "int", key: true, computed: true },
    //     FullName: { dataType: "string" },
    //     User: { dataType: "$navProp.User", inverseProperty: "Profile", required: true }
    //   }, null);
    //   var $navProp = c.$navProp;
    //   $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
    //     Categories: { dataType: $data.EntitySet, elementType: $navProp.Category },
    //     Articles: { dataType: $data.EntitySet, elementType: $navProp.Article },
    //     Users: { dataType: $data.EntitySet, elementType: $navProp.User },
    //     UserProfiles: { dataType: $data.EntitySet, elementType: $navProp.UserProfile },
    //   }, null);

    //   (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

    //     var storageModel = db._storageModel.getStorageModel($navProp.Category);
    //     var assoc = storageModel.Associations['Articles'];
    //     asyncQTM.equal(assoc.From, 'Category', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Article', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

    //     //////// Article
    //     storageModel = db._storageModel.getStorageModel($navProp.Article);
    //     assoc = storageModel.Associations['Category'];
    //     asyncQTM.equal(assoc.From, 'Article', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Category', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

    //     assoc = storageModel.Associations['Author'];
    //     asyncQTM.equal(assoc.From, 'Article', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'User', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


    //     ///////User
    //     storageModel = db._storageModel.getStorageModel($navProp.User);
    //     assoc = storageModel.Associations['Articles'];
    //     asyncQTM.equal(assoc.From, 'User', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'Article', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

    //     assoc = storageModel.Associations['Profile'];
    //     asyncQTM.equal(assoc.From, 'User', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'UserProfile', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

    //     ///////UserProfile
    //     storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
    //     assoc = storageModel.Associations['User'];
    //     asyncQTM.equal(assoc.From, 'UserProfile', 'From property value error');
    //     asyncQTM.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
    //     asyncQTM.equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
    //     strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
    //     asyncQTM.equal(assoc.To, 'User', 'To property value error');
    //     asyncQTM.equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
    //     asyncQTM.equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
    //     strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
    //     start();
    //   });
    // });

    // asyncQTM.test('Select with constant value', 3, function (start) {
    //   if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); return start(); }


    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start(1);
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       start(1);

    //       db.Articles.map(function (a) { return { title: a.Title, c: 5 } }).toArray({
    //         success: function (result) {
    //           //if (providerConfig.name != "sqLite") { asyncQTM.ok(false, "Not supported fail"); return start(); }
 
    //           start(1);
    //           asyncQTM.ok(result, 'query failed');
    //           var a = result[0];
    //           asyncQTM.equal(a.c, 5, 'result const value failed');
    //           asyncQTM.equal(typeof a.title === 'string', true, 'result field type failed');
    //         },
    //         error: function (e) {
    //           //if (providerConfig.name != "oData") { asyncQTM.ok(true, "Not supported fail"); return start(); }
 
    //           start(1);
    //           asyncQTM.ok(e, 'query failed');
    //           asyncQTM.equal(e.message, 'Constant value is not supported in Projection.', 'projection constant expression error failed');
    //         }
    //       });
    //     });
    //   });
    // });

    // asyncQTM.test('OrderBy_complex', 3, function (start) {
    //   if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }


    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     start();
    //     var q = db.Articles.orderBy(function (a) { return a.Id + 5; }).toTraceString();
    //     asyncQTM.equal(q.queryText, "/Articles?$orderby=(Id add 5)", 'complex order by failed');

    //     q = db.Articles.orderBy(function (a) { return a.Body.concat(a.Lead); }).toTraceString();
    //     asyncQTM.equal(q.queryText, "/Articles?$orderby=concat(Body,Lead)", 'complex order by failed');
    //   });
    // });

    // asyncQTM.test('Type beforeCreate in context', 9, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     //$news.Types.NewsContext.generateTestData(db, function () {

    //     var beforeCreate = function (sender, item) {
    //       asyncQTM.ok(sender === db.Articles.elementType, 'beforeCreate event sender');
    //       asyncQTM.ok(item === entity, 'beforeCreate event argument');

    //       asyncQTM.equal(item.Id, entity.Id, 'beforeCreate Lead property');
    //       asyncQTM.equal(item.Id, undefined, 'beforeCreate Lead property value');
    //       asyncQTM.equal(item.Title, entity.Title, 'beforeCreate Lead property');
    //       asyncQTM.equal(item.Title, 'hello', 'beforeCreate Lead property value');
    //       asyncQTM.equal(item.Lead, entity.Lead, 'beforeCreate Lead property');
    //       asyncQTM.equal(item.Lead, 'world', 'beforeCreate Lead property value');

    //       asyncQTM.equal(item.entityState, $data.EntityState.Added, 'beforeCreate EntityState property value');
    //       start();
    //     };

    //     db.Articles.elementType.addEventListener('beforeCreate', beforeCreate);

    //     var entity = new db.Articles.elementType({ Title: 'hello', Lead: 'world' });
    //     db.Articles.add(entity);
    //     db.saveChanges(function () {
    //       db.Articles.elementType.removeEventListener('beforeCreate', beforeCreate);

    //       db.Articles.add({ Title: 'hello2', Lead: 'world2' });
    //       db.saveChanges(function () {
    //         start();
    //       });
    //     });
    //     //});
    //   });
    // });

    // asyncQTM.test('Type beforeCreate cancel in context', 11, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     //$news.Types.NewsContext.generateTestData(db, function () {

    //     var beforeCreate = function (sender, item) {
    //       asyncQTM.ok(sender === db.Articles.elementType, 'beforeCreate event sender');
    //       asyncQTM.ok(item === entity, 'beforeCreate event argument');

    //       asyncQTM.equal(item.Id, entity.Id, 'beforeCreate Lead property');
    //       asyncQTM.equal(item.Id, undefined, 'beforeCreate Lead property value');
    //       asyncQTM.equal(item.Title, entity.Title, 'beforeCreate Lead property');
    //       asyncQTM.equal(item.Title, 'hello', 'beforeCreate Lead property value');
    //       asyncQTM.equal(item.Lead, entity.Lead, 'beforeCreate Lead property');
    //       asyncQTM.equal(item.Lead, 'world', 'beforeCreate Lead property value');

    //       asyncQTM.equal(item.entityState, $data.EntityState.Added, 'beforeCreate EntityState property value');
    //       start();
    //       return false;
    //     };

    //     db.Articles.elementType.addEventListener('beforeCreate', beforeCreate);

    //     var entity = new db.Articles.elementType({ Title: 'hello', Lead: 'world' });
    //     db.Articles.add(entity);
    //     db.saveChanges(function (cnt) {
    //       asyncQTM.equal(cnt, 0, 'added entity count');
    //       db.Articles.elementType.removeEventListener('beforeCreate', beforeCreate);

    //       db.Articles.add({ Title: 'hello2', Lead: 'world2' });
    //       db.Articles.filter('it.Title == "hello"').toArray().then(function (items) {
    //         asyncQTM.equal(items.length, 0, 'added entity count');

    //         start();
    //       });
    //     });
    //     //});
    //   });
    // });

    // asyncQTM.test('Type beforeCreate cancel one in context', 9, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     //$news.Types.NewsContext.generateTestData(db, function () {

    //     var beforeCreate = function (sender, item) {
    //       asyncQTM.ok(sender === db.Articles.elementType, 'beforeCreate event sender');

    //       asyncQTM.equal(item.entityState, $data.EntityState.Added, 'beforeCreate EntityState property value');
    //       start();
    //       return item.Title === 'hello' ? false : true;
    //     };

    //     db.Articles.elementType.addEventListener('beforeCreate', beforeCreate);

    //     var entity = new db.Articles.elementType({ Title: 'hello', Lead: 'world' });
    //     db.Articles.add(entity);
    //     db.Articles.add({ Title: 'hello2', Lead: 'world2' });
    //     db.saveChanges(function (cnt) {
    //       asyncQTM.equal(cnt, 1, 'added entity count');
    //       db.Articles.elementType.removeEventListener('beforeCreate', beforeCreate);

    //       db.Articles.add({ Title: 'hello2', Lead: 'world2' });
    //       db.Articles.filter('it.Title == "hello" || it.Title == "hello2"').toArray().then(function (items) {
    //         asyncQTM.equal(items.length, 1, 'added entity count');

    //         asyncQTM.equal(typeof items[0].Id, 'number', 'loaded Id property');
    //         asyncQTM.equal(items[0].Title, 'hello2', 'loaded Title property');
    //         asyncQTM.equal(items[0].Lead, 'world2', 'loaded Lead property');

    //         start();
    //       });
    //     });
    //     //});
    //   });
    // });

    // asyncQTM.test('Type afterCreate in context', 9, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     //$news.Types.NewsContext.generateTestData(db, function () {

    //     var afterCreate = function (sender, item) {
    //       asyncQTM.ok(sender === db.Articles.elementType, 'afterCreate event sender');
    //       asyncQTM.ok(item === entity, 'afterCreate event argument');

    //       asyncQTM.equal(item.Id, entity.Id, 'afterCreate Lead property');
    //       asyncQTM.equal(typeof item.Id, 'number', 'afterCreate Lead property value');
    //       asyncQTM.equal(item.Title, entity.Title, 'afterCreate Lead property');
    //       asyncQTM.equal(item.Title, 'hello', 'afterCreate Lead property value');
    //       asyncQTM.equal(item.Lead, entity.Lead, 'afterCreate Lead property');
    //       asyncQTM.equal(item.Lead, 'world', 'afterCreate Lead property value');

    //       asyncQTM.equal(item.entityState, $data.EntityState.Added, 'beforeCreate EntityState property value');
    //       start();
    //     };

    //     db.Articles.elementType.addEventListener('afterCreate', afterCreate);

    //     var entity = new db.Articles.elementType({ Title: 'hello', Lead: 'world' });
    //     db.Articles.add(entity);
    //     db.saveChanges(function () {
    //       db.Articles.elementType.removeEventListener('afterCreate', afterCreate);

    //       db.Articles.add({ Title: 'hello2', Lead: 'world2' });
    //       db.saveChanges(function () {
    //         start();
    //       });
    //     });
    //     //});
    //   });
    // });

    // asyncQTM.test('Type beforeUpdate in context', 9, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.first().then(function (entity) {
    //         var beforeUpdate = function (sender, item) {
    //           asyncQTM.ok(sender === db.Articles.elementType, 'beforeUpdate event sender');
    //           asyncQTM.ok(item === entity, 'beforeUpdate event argument');

    //           asyncQTM.equal(item.Id, entity.Id, 'beforeUpdate Lead property');
    //           asyncQTM.equal(typeof item.Id, 'number', 'beforeUpdate Lead property value');
    //           asyncQTM.equal(item.Title, entity.Title, 'beforeUpdate Lead property');
    //           asyncQTM.equal(item.Title, 'hello', 'beforeUpdate Lead property value');
    //           asyncQTM.equal(item.Lead, entity.Lead, 'beforeUpdate Lead property');
    //           asyncQTM.equal(item.Lead, 'world', 'beforeUpdate Lead property value');

    //           asyncQTM.equal(item.entityState, $data.EntityState.Modified, 'beforeCreate EntityState property value');
    //           start();
    //         };

    //         db.Articles.elementType.addEventListener('beforeUpdate', beforeUpdate);

    //         db.Articles.attach(entity);
    //         entity.Title = 'hello';
    //         entity.Lead = 'world';

    //         db.saveChanges(function () {
    //           db.Articles.elementType.removeEventListener('beforeUpdate', beforeUpdate);

    //           db.Articles.attach(entity);
    //           entity.Title = 'hello2';
    //           entity.Lead = 'world2';

    //           db.saveChanges(function () {
    //             start();
    //           });
    //         });
    //       }).fail($data.debug);
    //     });
    //   });
    // });

    // asyncQTM.test('Type beforeUpdate cancel in context', 11, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.Articles.first().then(function (entity) {
    //         var beforeUpdate = function (sender, item) {
    //           asyncQTM.ok(sender === db.Articles.elementType, 'beforeUpdate event sender');
    //           asyncQTM.ok(item === entity, 'beforeUpdate event argument');

    //           asyncQTM.equal(item.Id, entity.Id, 'beforeUpdate Lead property');
    //           asyncQTM.equal(typeof item.Id, 'number', 'beforeUpdate Lead property value');
    //           asyncQTM.equal(item.Title, entity.Title, 'beforeUpdate Lead property');
    //           asyncQTM.equal(item.Title, 'hello', 'beforeUpdate Lead property value');
    //           asyncQTM.equal(item.Lead, entity.Lead, 'beforeUpdate Lead property');
    //           asyncQTM.equal(item.Lead, 'world', 'beforeUpdate Lead property value');

    //           asyncQTM.equal(item.entityState, $data.EntityState.Modified, 'beforeCreate EntityState property value');
    //           start();

    //           return false;
    //         };

    //         db.Articles.elementType.addEventListener('beforeUpdate', beforeUpdate);

    //         db.Articles.attach(entity);
    //         entity.Title = 'hello';
    //         entity.Lead = 'world';

    //         db.saveChanges(function () {
    //           db.Articles.elementType.removeEventListener('beforeUpdate', beforeUpdate);

    //           db.Articles.single('it.Id == this.value', { value: entity.Id }).then(function (item) {
    //             asyncQTM.notEqual(item.Title, 'hello', 'beforeUpdate Lead property value');
    //             asyncQTM.notEqual(item.Lead, 'world', 'beforeUpdate Lead property value');
    //             start();
    //           }).fail(function (e) {
    //             asyncQTM.ok(false, e);
    //             start();
    //           });

    //         });
    //       }).fail($data.debug);
    //     });
    //   });
    // });

    // asyncQTM.test('Type afterUpdate in context', 9, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       db.Articles.first().then(function (entity) {
    //         var afterUpdate = function (sender, item) {
    //           asyncQTM.ok(sender === db.Articles.elementType, 'afterUpdate event sender');
    //           asyncQTM.ok(item === entity, 'afterUpdate event argument');

    //           asyncQTM.equal(item.Id, entity.Id, 'afterUpdate Lead property');
    //           asyncQTM.equal(typeof item.Id, 'number', 'afterUpdate Lead property value');
    //           asyncQTM.equal(item.Title, entity.Title, 'afterUpdate Lead property');
    //           asyncQTM.equal(item.Title, 'hello', 'afterUpdate Lead property value');
    //           asyncQTM.equal(item.Lead, entity.Lead, 'afterUpdate Lead property');
    //           asyncQTM.equal(item.Lead, 'world', 'afterUpdate Lead property value');

    //           asyncQTM.equal(item.entityState, $data.EntityState.Modified, 'beforeCreate EntityState property value');
    //           start();
    //         };

    //         db.Articles.elementType.addEventListener('afterUpdate', afterUpdate);

    //         db.Articles.attach(entity);
    //         entity.Title = 'hello';
    //         entity.Lead = 'world';

    //         db.saveChanges(function () {
    //           db.Articles.elementType.removeEventListener('afterUpdate', afterUpdate);

    //           db.Articles.attach(entity);
    //           entity.Title = 'hello2';
    //           entity.Lead = 'world2';

    //           db.saveChanges(function () {
    //             start();
    //           });
    //         });
    //       }).fail($data.debug);
    //     });
    //   });
    // });

    // asyncQTM.test('Type beforeDelete in context', 5, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.TagConnections.toArray().then(function (entities) {
    //         var entity = entities[0];

    //         var beforeDelete = function (sender, item) {
    //           asyncQTM.ok(sender === db.TagConnections.elementType, 'beforeDelete event sender');
    //           asyncQTM.ok(item === entity, 'beforeDelete event argument');

    //           asyncQTM.equal(item.Id, entity.Id, 'beforeDelete Id property');
    //           asyncQTM.equal(typeof item.Id, 'number', 'beforeDelete Id property value');

    //           asyncQTM.equal(item.entityState, $data.EntityState.Deleted, 'beforeCreate EntityState property value');
    //           start();
    //         };

    //         db.TagConnections.elementType.addEventListener('beforeDelete', beforeDelete);

    //         db.TagConnections.remove(entity);

    //         return db.saveChanges(function () {
    //           db.TagConnections.elementType.removeEventListener('beforeDelete', beforeDelete);

    //           db.TagConnections.remove(entities[1]);

    //           db.saveChanges(function () {
    //             start();
    //           });
    //         });
    //       }).fail($data.debug);
    //     });
    //   });
    // });

    // asyncQTM.test('Type beforeDelete cancel in context', 6, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {

    //       db.TagConnections.toArray().then(function (entities) {
    //         var entity = entities[0];

    //         var beforeDelete = function (sender, item) {
    //           asyncQTM.ok(sender === db.TagConnections.elementType, 'beforeDelete event sender');
    //           asyncQTM.ok(item === entity, 'beforeDelete event argument');

    //           asyncQTM.equal(item.Id, entity.Id, 'beforeDelete Id property');
    //           asyncQTM.equal(typeof item.Id, 'number', 'beforeDelete Id property value');

    //           asyncQTM.equal(item.entityState, $data.EntityState.Deleted, 'beforeCreate EntityState property value');
    //           start();
    //           return false;
    //         };

    //         db.TagConnections.elementType.addEventListener('beforeDelete', beforeDelete);

    //         db.TagConnections.remove(entity);

    //         return db.saveChanges(function () {
    //           db.TagConnections.elementType.removeEventListener('beforeDelete', beforeDelete);

    //           db.TagConnections.remove(entities[1]);

    //           db.TagConnections.single('it.Id == this.value', { value: entity.Id }).then(function (item) {
    //             asyncQTM.ok(true, 'not deleted');
    //             start();
    //           }).fail(function (e) {
    //             asyncQTM.ok(false, e);
    //             start();
    //           });
    //         });
    //       }).fail($data.debug);
    //     });
    //   });
    // });

    // asyncQTM.test('Type afterDelete in context', 5, function (start) {

    //   (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //     $news.Types.NewsContext.generateTestData(db, function () {
    //       db.TagConnections.toArray().then(function (entities) {
    //         var entity = entities[0];

    //         var afterDelete = function (sender, item) {
    //           asyncQTM.ok(sender === db.TagConnections.elementType, 'afterDelete event sender');
    //           asyncQTM.ok(item === entity, 'afterDelete event argument');

    //           asyncQTM.equal(item.Id, entity.Id, 'afterDelete Id property');
    //           asyncQTM.equal(typeof item.Id, 'number', 'afterDelete Id property value');

    //           asyncQTM.equal(item.entityState, $data.EntityState.Deleted, 'beforeCreate EntityState property value');
    //           start();
    //         };

    //         db.TagConnections.elementType.addEventListener('afterDelete', afterDelete);

    //         db.TagConnections.remove(entity);

    //         return db.saveChanges(function () {
    //           db.TagConnections.elementType.removeEventListener('afterDelete', afterDelete);

    //           db.TagConnections.remove(entities[1]);

    //           db.saveChanges(function () {
    //             start();
    //           });
    //         });
    //       }).fail($data.debug);
    //     });
    //   });
    // });
  });
}


function T3_oDataV3(providerConfig, msg) {
  msg = msg || '';
  module("DataTestsV3" + msg);


  asyncQTM.test("OData_Function_sub_frames", 3, function (start) {
    if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); return start(); }


    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
      $news.Types.NewsContext.generateTestData(db, function () {

        var q = db.Categories.filter(function (ctg) { return ctg.Articles.some(); });
        var c = q.toTraceString();
        asyncQTM.equal(c.queryText, "/Categories?$filter=Articles/any()", "A0: Invalid query string");

        q.toArray({
          success: function (result) {
            start();
            asyncQTM.equal(result.length, 5, 'A0: result length failed');
            asyncQTM.equal(result[0].Title, 'Sport', 'A0: result value failed');
          },
          error: function (e) {
            start();

            asyncQTM.ok(false, 'A0: Category some article, error: ' + e);
          }
        });

        var articleFilter = db.Articles.filter(function (art) { return art.Title == 'Article1'; });
        q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
        c = q.toTraceString();
        asyncQTM.equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Title eq 'Article1'))", "A1: Invalid query string");

        q.toArray({
          success: function (result) {
            start();
            asyncQTM.equal(result.length, 1, 'A1: result length failed');
            asyncQTM.equal(result[0].Title, 'Sport', 'A1: result value failed');
          },
          error: function (e) {
            start();

            asyncQTM.ok(false, 'A1: Category some article.Title == "Article1", error: ' + e);
          }
        });

        q = db.Categories.filter(function (ctg) { return ctg.Articles.every(this.filter); }, { filter: articleFilter });
        c = q.toTraceString();
        asyncQTM.equal(c.queryText, "/Categories?$filter=Articles/all(art: (art/Title eq 'Article1'))", "A2: Invalid query string");

        q.toArray({
          success: function (result) {
            start();
            asyncQTM.equal(result.length, 0, 'A2: result length failed');
          },
          error: function (e) {
            start();
            asyncQTM.ok(false, 'A2: Category every article.Title == "Article1", error: ' + e);
          }
        });

        articleFilter = db.Articles.filter(function (art) { return art.Author.Profile.FullName == 'Full Name2'; });
        q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
        c = q.toTraceString();
        asyncQTM.equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Author/Profile/FullName eq 'Full Name2'))", "A3: Invalid query string");

        q.toArray({
          success: function (result) {
            start();
            asyncQTM.equal(result.length, 5, 'A3: result length failed');
            asyncQTM.equal(result[0].Title, 'Sport', 'A3: result value failed');
          },
          error: function (e) {
            start();
            asyncQTM.ok(false, 'A3: Category some article Author.Profile.Fullname "Full Name2", error: ' + e);
          }
        });

        articleFilter = db.Articles.filter(function (art) { return art.Author.Profile.FullName == 'Starts With Test'; });
        q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
        c = q.toTraceString();
        asyncQTM.equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Author/Profile/FullName eq 'Starts With Test'))", "A4: Invalid query string");

        q.toArray({
          success: function (result) {
            start();
            asyncQTM.equal(result.length, 1, 'A4: result length failed');
            asyncQTM.equal(result[0].Title, 'Politics', 'A4: result value failed');
          },
          error: function (e) {
            start();
            asyncQTM.ok(false, 'A4: Category some article Author.Profile.Fullname "Starts With Test", error: ' + e);
          }
        });


        var tagFilter = db.TagConnections.filter(function (tagCon) { return tagCon.Tag.Title == 'Tag1'; });
        articleFilter = db.Articles.filter(function (art) { return art.Tags.some(this.filter); }, { filter: tagFilter });
        q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter })
        c = q.toTraceString();
        asyncQTM.equal(c.queryText, "/Categories?$filter=Articles/any(art: art/Tags/any(tagCon: (tagCon/Tag/Title eq 'Tag1')))", "A5: Invalid query string");

        q.toArray({
          success: function (result) {
            start();
            asyncQTM.equal(result.length, 5, 'A5: result length failed');
            asyncQTM.equal(result[0].Title, 'Sport', 'A5: result value failed');
          },
          error: function (e) {
            start();
            asyncQTM.ok(false, 'A5: Category some article Author.Profile.Fullname "Starts With Test", error: ' + e);
          }
        });

        tagFilter = db.TagConnections.filter(function (tagCon) { return tagCon.Tag.Title == 'Tag3'; });
        articleFilter = db.Articles.filter(function (art) { return art.Tags.some(this.filter) && art.Author.LoginName == 'Usr4'; }, { filter: tagFilter });
        q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter })
        c = q.toTraceString();
        asyncQTM.equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Tags/any(tagCon: (tagCon/Tag/Title eq 'Tag3')) and (art/Author/LoginName eq 'Usr4')))", "A6: Invalid query string");

        q.toArray({
          success: function (result) {
            start();
            asyncQTM.equal(result.length, 3, 'A6: result length failed');
            asyncQTM.equal(result[0].Title, 'World', 'A6: result value failed');
          },
          error: function (e) {
            start();
            asyncQTM.ok(false, 'A6: Category some article Author.Profile.Fullname "Starts With Test", error: ' + e);
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

  asyncQTM.test("Save GeographyObjects", 19, function () {


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

          asyncQTM.equal(items.length, 2, 'result length');
          for (var i = 0; i < items.length; i++) {
            var resItem = items[i];
            var refItem = itemsToSave[i];

            asyncQTM.equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
            asyncQTM.equal(resItem.Name, 'Item' + (i + 1) + 'Name', 'itemName');

            asyncQTM.deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
            asyncQTM.deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
            asyncQTM.deepEqual(resItem.GeographyPolygon.coordinates, (i == 0 ? polygon : polygonWithHole).coordinates, 'GeographyPolygon data');
            asyncQTM.deepEqual(resItem.GeographyMultiPoint.coordinates, mPoint.coordinates, 'GeographyMultiPoint data');
            asyncQTM.deepEqual(resItem.GeographyMultiLineString.coordinates, mLineString.coordinates, 'GeographyMultiLineString data');
            asyncQTM.deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
            asyncQTM.deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

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
  asyncQTM.test("Modify GeographyObjects", 20, function () {


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

          asyncQTM.equal(items.length, 1, 'result length');
          var resItem = items[0];
          var refItem = item;

          asyncQTM.equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
          asyncQTM.equal(resItem.Name, 'ItemName', 'itemName');

          asyncQTM.deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
          asyncQTM.deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
          asyncQTM.deepEqual(resItem.GeographyPolygon.coordinates, polygon.coordinates, 'GeographyPolygon data');
          asyncQTM.deepEqual(resItem.GeographyMultiPoint, null, 'GeographyMultiPoint data');
          asyncQTM.ok(!resItem.GeographyMultiLineString, 'GeographyMultiLineString data');
          asyncQTM.deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
          asyncQTM.deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

          context.GeoTestEntities.attach(resItem);
          resItem.Name = 'Item updated';
          resItem.GeographyPolygon = polygonWithHole;
          resItem.GeographyMultiPoint = mPoint;
          resItem.GeographyMultiLineString = mLineString;

          context.saveChanges(function () {
            context.GeoTestEntities.toArray(function (itemsup) {

              asyncQTM.equal(itemsup.length, 1, 'result length');
              var refItem = resItem;
              var resItem = itemsup[0];

              asyncQTM.equal(resItem instanceof $example.GeoTestEntity, true, 'item instance');
              asyncQTM.equal(resItem.Name, 'Item updated', 'itemName updated');

              asyncQTM.deepEqual(resItem.GeographyPoint.coordinates, point.coordinates, 'GeographyPoint data');
              asyncQTM.deepEqual(resItem.GeographyLineString.coordinates, lString.coordinates, 'GeographyLineString data');
              asyncQTM.deepEqual(resItem.GeographyPolygon.coordinates, polygonWithHole.coordinates, 'GeographyPolygon data');
              asyncQTM.deepEqual(resItem.GeographyMultiPoint.coordinates, mPoint.coordinates, 'GeographyMultiPoint data');
              asyncQTM.deepEqual(resItem.GeographyMultiLineString.coordinates, mLineString.coordinates, 'GeographyMultiLineString data');
              asyncQTM.deepEqual(resItem.GeographyMultiPolygon.coordinates, mPolygon.coordinates, 'GeographyMultiPolygon data');
              asyncQTM.deepEqual(resItem.GeographyCollection.geometries, collection.geometries, 'GeographyCollection data');

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

  asyncQTM.test("Save GeometryObjects", 19, function () {


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

          asyncQTM.equal(items.length, 2, 'result length');
          for (var i = 0; i < items.length; i++) {
            var resItem = items[i];
            var refItem = itemsToSave[i];

            asyncQTM.equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
            asyncQTM.equal(resItem.Name, 'Item' + (i + 1) + 'Name', 'itemName');

            asyncQTM.deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
            asyncQTM.deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
            asyncQTM.deepEqual(resItem.GeometryPolygon.coordinates, (i == 0 ? polygon : polygonWithHole).coordinates, 'GeometryPolygon data');
            asyncQTM.deepEqual(resItem.GeometryMultiPoint.coordinates, mPoint.coordinates, 'GeometryMultiPoint data');
            asyncQTM.deepEqual(resItem.GeometryMultiLineString.coordinates, mLineString.coordinates, 'GeometryMultiLineString data');
            asyncQTM.deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
            asyncQTM.deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

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

  asyncQTM.test("Modify GeometryObjects", 20, function () {


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

          asyncQTM.equal(items.length, 1, 'result length');
          var resItem = items[0];
          var refItem = item;

          asyncQTM.equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
          asyncQTM.equal(resItem.Name, 'ItemName', 'itemName');

          asyncQTM.deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
          asyncQTM.deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
          asyncQTM.deepEqual(resItem.GeometryPolygon.coordinates, polygon.coordinates, 'GeometryPolygon data');
          asyncQTM.deepEqual(resItem.GeometryMultiPoint, null, 'GeometryMultiPoint data');
          asyncQTM.ok(!resItem.GeometryMultiLineString, 'GeometryMultiLineString data');
          asyncQTM.deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
          asyncQTM.deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

          context.GeometryTestEntities.attach(resItem);
          resItem.Name = 'Item updated';
          resItem.GeometryPolygon = polygonWithHole;
          resItem.GeometryMultiPoint = mPoint;
          resItem.GeometryMultiLineString = mLineString;

          context.saveChanges(function () {
            context.GeometryTestEntities.toArray(function (itemsup) {

              asyncQTM.equal(itemsup.length, 1, 'result length');
              var refItem = resItem;
              var resItem = itemsup[0];

              asyncQTM.equal(resItem instanceof $example.GeometryTestEntity, true, 'item instance');
              asyncQTM.equal(resItem.Name, 'Item updated', 'itemName updated');

              asyncQTM.deepEqual(resItem.GeometryPoint.coordinates, point.coordinates, 'GeometryPoint data');
              asyncQTM.deepEqual(resItem.GeometryLineString.coordinates, lString.coordinates, 'GeometryLineString data');
              asyncQTM.deepEqual(resItem.GeometryPolygon.coordinates, polygonWithHole.coordinates, 'GeometryPolygon data');
              asyncQTM.deepEqual(resItem.GeometryMultiPoint.coordinates, mPoint.coordinates, 'GeometryMultiPoint data');
              asyncQTM.deepEqual(resItem.GeometryMultiLineString.coordinates, mLineString.coordinates, 'GeometryMultiLineString data');
              asyncQTM.deepEqual(resItem.GeometryMultiPolygon.coordinates, mPolygon.coordinates, 'GeometryMultiPolygon data');
              asyncQTM.deepEqual(resItem.GeometryCollection.geometries, collection.geometries, 'GeometryCollection data');

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

  asyncQTM.test("Guid key with 'in' structure", 6, function () {


    (new $example.Context(providerConfig)).onReady(function (context) {

      for (var i = 0; i < 5; i++) {
        context.GuidTestEntities.add(new $example.GuidTestEntity({
          Id: $data.createGuid().toString(),
          Title: 'Title_test_' + i
        }));
      }

      context.saveChanges(function () {
        context.GuidTestEntities.map('it.Id').take(2).toArray(function (res) {
          asyncQTM.equal(res.length, 2, 'result count');
          asyncQTM.equal(typeof res[0], 'string', 'item 0 is string');
          asyncQTM.equal(typeof res[1], 'string', 'item 1 is string');

          context.GuidTestEntities.filter(function (it) { return it.Id in this.keys }, { keys: res }).toArray(function (typedRes) {
            asyncQTM.equal(res.length, 2, 'result count');

            for (var i = 0; i < 2; i++) {
              asyncQTM.ok(res.indexOf(typedRes[i].Id >= 0), "key '" + typedRes[i].Id + "' in result");
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
  asyncQTM.test("Geo functions compile", 1, function () {
    if (providerConfig.name != "oData") { asyncQTM.ok(true, "Not supported"); return start(); }

    (new $example.Context(providerConfig)).onReady(function (context) {

      var q = context.GeoTestEntities.filter(function (it) { it.GeographyPoint.distance(this.location) < 50.16 }, { location: new $data.GeographyPoint(1, 5) }).toTraceString();
      asyncQTM.equal(q.queryText, "/GeoTestEntities?$filter=(geo.distance(GeographyPoint,geography'POINT(1 5)') lt 50.16)");
      q = context.GeoTestEntities.filter(function (it) { 50.16 > it.GeographyPoint.distance(this.location) }, { location: new $data.GeographyPoint(1, 5) }).toTraceString();
      asyncQTM.equal(q.queryText, "/GeoTestEntities?$filter=(50.16 gt geo.distance(GeographyPoint,geography'POINT(1 5)'))");

      var polygon = new $data.GeographyPolygon([
        [[100.0, -0.5], [101.0, 0.0], [101.0, 1.0], [100.5, 1.5], [100.0, -0.5]]
      ]);
      q = context.GeoTestEntities.filter(function (it) { it.GeographyPoint.intersects(this.polygon) }, { polygon: polygon }).toTraceString();
      asyncQTM.equal(q.queryText, "/GeoTestEntities?$filter=geo.intersects(GeographyPoint,geography'POLYGON((100 -0.5,101 0,101 1,100.5 1.5,100 -0.5))')");


      q = context.GeoTestEntities.filter(function (it) { it.GeographyLineString.length() > 50.36 }).toTraceString();
      asyncQTM.equal(q.queryText, "/GeoTestEntities?$filter=(geo.length(GeographyLineString) gt 50.36)");
      q = context.GeoTestEntities.filter(function (it) { 50.36 < it.GeographyLineString.length() }).toTraceString();
      asyncQTM.equal(q.queryText, "/GeoTestEntities?$filter=(50.36 lt geo.length(GeographyLineString))");

    });
  });
}
