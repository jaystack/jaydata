import mock$data from '../core.js';
import $data from 'jaydata/core';
import oData from '../../src/Types/StorageProviders/oData'
import { expect } from 'chai';
import { asyncQTM } from './scripts/qunitToMocha.js';
$data.setModelContainer(global);
import newsReaderContext from './scripts/NewsReaderContext.js';

$data.defaults.OData.withReferenceMethods = true;
var exports = module.exports = {};
exports.EntityContextTests = function(providerConfig, msg) {
  msg = msg || '';

  describe(msg, function () {
    this.timeout(30 * 1000);
    asyncQTM.test('store token set after saveChanges', 4, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {

        var article = new db.Articles.elementType({ Title: 'Title', Lead: 'Lead', Body: 'Body' });
        db.Articles.add(article);
        asyncQTM.equal(article.storeToken, undefined, 'StoreToken is not avaliable after create');

        db.saveChanges(function () {
          db.Articles.toArray(function (res) {
            var rarticle = res[0];
            asyncQTM.equal(rarticle.Title, 'Title', 'Article Title');
            asyncQTM.equal(article.storeToken, db.storeToken, 'StoreToken is set');
            asyncQTM.equal(article.storeToken, rarticle.storeToken, 'StoreToken is same on loaded entity');

            start();
          });
        });
      });
    });

    asyncQTM.test('no attach Child entity at save', 3, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Articles.include('Category').first(undefined, undefined, function (article) {
            // console.log(article);
            db.Articles.attach(article);
            article.Title = 'Changed_Title';
            article.Category = article.Category;
            // console.log(article);
            article.Category.Title = 'Changed_Category_Title';

            db.saveChanges(function () {
              db.Articles.include('Category').filter('it.Id == this.id', { id: article.Id }).toArray(function (res) {
                var rarticle = res[0];
                asyncQTM.equal(rarticle.Title, 'Changed_Title', 'Article Title Changed');
                asyncQTM.equal(rarticle.Category.Id, article.Category.Id, 'Article.Category Id not Changed');
                asyncQTM.equal(rarticle.Category.Title, 'Changed_Category_Title', 'Article.Category Title Changed');

                start();
              });
            });
          });
        });
      });
    });

    asyncQTM.test('no attach Child entity at save 2', 3, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
          $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.include('Category').toArray(function (res) {
              var article = res[0];
              // console.log(article);
              db.Articles.attach(article);
              article.Category = article.Category;
              article.Category.Title = 'Changed_Category_Title';
              // console.log(article);
              db.saveChanges(function () {
                db.Articles.include('Category').filter('it.Id == this.id', { id: article.Id }).toArray(function (res) {
                  var rarticle = res[0];
                  asyncQTM.equal(rarticle.Title, article.Title, 'Article not Changed');
                  asyncQTM.equal(rarticle.Category.Id, article.Category.Id, 'Article.Category Id not Changed');
                  asyncQTM.equal(rarticle.Category.Title, 'Changed_Category_Title', 'Article.Category Title Changed');

                  start();
                });
              });
            });
          });
        });
      });
    });

    asyncQTM.test('no attach Child entity at save 3', 2, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Categories.include('Articles').toArray(function (res) {
            var category = res[0];
            db.Categories.attach(category);
            category.Title = 'Changed_Title';
            // console.log(category);
            category.Articles[0].Title = 'Changed_Articles[0]_Title';

            db.saveChanges(function () {
              db.Categories.include('Articles').filter('it.Id == this.id', { id: category.Id }).toArray(function (res) {
                var rcategory = res[0];
                asyncQTM.equal(rcategory.Title, 'Changed_Title', 'Category Title Changed');
                asyncQTM.equal(rcategory.Articles.filter(function (c) { return c.Title == rcategory.Articles[0].Title && c.Id == rcategory.Articles[0].Id }).length, 1, 'Article.Articles[0] Id not Changed')

                start();
              });
            });
          });
        });
      });
    });


    asyncQTM.test('no attach Child entity at save 4', 2, function (start) {
      asyncQTM.stop();
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Categories.include('Articles').toArray(function (res) {
            var category = res[0];
            db.Categories.attach(category);
            category.Articles[0].Title = 'Changed_Articles[0]_Title';

            db.saveChanges(function () {
              db.Categories.include('Articles').filter('it.Id == this.id', { id: category.Id }).toArray(function (res) {
                var rcategory = res[0];

                asyncQTM.equal(rcategory.Title, category.Title, 'Article not Changed');
                asyncQTM.equal(rcategory.Articles.filter(function (c) { return c.Title == rcategory.Articles[0].Title && c.Id == rcategory.Articles[0].Id }).length, 1, 'Article.Articles[0] Id not Changed')

                start();
              });
            });
          });
        });
      });
    });

    asyncQTM.test("Guid key with ' in ' structure", 6, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      asyncQTM.stop();

      (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

        for (var i = 0; i < 5; i++) {
          context.TestTable2.add(new $news.Types.TestItemGuid({
            Id: $data.createGuid().toString(),
            Title: 'Title_test_' + i
          }));
        }

        context.saveChanges(function () {
          context.TestTable2.map('it.Id').take(2).toArray(function (res) {
            asyncQTM.equal(res.length, 2, 'result count');
            asyncQTM.equal(typeof res[0], 'string', 'item 0 is string');
            asyncQTM.equal(typeof res[1], 'string', 'item 1 is string');

            context.TestTable2.filter(function (it) { return it.Id in this.keys }, { keys: res }).toArray(function (typedRes) {
              asyncQTM.equal(res.length, 2, 'result count');
              var promises = []
              for (var i = 0; i < 2; i++) {
                promises.push(asyncQTM.ok(res.indexOf(typedRes[i].Id >= 0), "key '" + typedRes[i].Id + "' in result"));
              }
              Promise.all(promises).then(function () { start() });
            });
          });
        });
      });

    });

    asyncQTM.test("Guid key delete", 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }


      asyncQTM.stop();

      (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

        var item = new $news.Types.TestItemGuid({
          Id: $data.createGuid().toString(),
          s0: 'Title_test'
        })

        context.TestTable2.add(item);

        context.saveChanges(function () {
          context.TestTable2.toArray(function (res) {

            asyncQTM.equal(res[0].Id, item.Id, 'keys');

            context.TestTable2.remove(res[0]);

            context.saveChanges(function () {
              context.TestTable2.toArray(function (res2) {
                asyncQTM.equal(res2.length, 0, 'table is clear');


                start();
              });
            });
          });
        });
      });
    });

    asyncQTM.test("Guid key update", 1, function (start) {

      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      asyncQTM.stop();

      (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

        var item = new $news.Types.TestItemGuid({
          Id: $data.createGuid().toString(),
          s0: 'Title_test'
        })

        context.TestTable2.add(item);

        context.saveChanges(function () {
          context.TestTable2.toArray(function (res) {

            asyncQTM.equal(res[0].Id, item.Id, 'keys');
            asyncQTM.equal(res[0].s0, item.s0, 'Title_test');

            context.TestTable2.attach(res[0]);
            res[0].s0 = 'Title_test2';


            context.saveChanges(function () {
              context.TestTable2.toArray(function (res2) {
                asyncQTM.equal(res2.length, 1, 'table is clear');
                asyncQTM.equal(res2[0].s0, 'Title_test2', 'Title_test2');

                start();
              });
            });
          });
        });
      });
    });

    asyncQTM.test('deep_include_fix', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); start(); return; }
      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var trace = db.Users.include('Articles.Category').include('Profile').toTraceString();
          var config = trace.modelBinderConfig;
          asyncQTM.ok(config.$item, 'no $item');
          asyncQTM.ok(config.$item.Articles, 'no Articles');
          asyncQTM.ok(config.$item.Articles.$item, 'no Articles.$item');
          asyncQTM.ok(config.$item.Articles.$item.Category, 'no Articles.Category');
          asyncQTM.ok(config.$item.Profile, 'no Profile');

          db.Users.include('Articles.Category').include('Profile').filter(function (it) { return it.LoginName == this.name; }, { name: 'Usr1' }).toArray(function (users) {
            asyncQTM.ok(users, 'no users');
            asyncQTM.ok(Array.isArray(users), 'not an Array');
            asyncQTM.ok(users[0], 'empty');
            asyncQTM.ok(users[0] instanceof $news.Types.User, 'not a User');
            asyncQTM.equal(users[0].Email, 'usr1@company.com', 'bad Email');
            asyncQTM.ok(Array.isArray(users[0].Articles), 'not an Array');
            asyncQTM.ok(users[0].Articles[0], 'empty');
            asyncQTM.ok(users[0].Articles[0] instanceof $news.Types.Article, 'not an Article');
            asyncQTM.ok(users[0].Articles[0].Category, 'bad Category');
            asyncQTM.ok(users[0].Articles[0].Category instanceof $news.Types.Category, 'not a Category');
            asyncQTM.ok(users[0].Profile, 'bad Profile');
            asyncQTM.ok(users[0].Profile instanceof $news.Types.UserProfile, 'not a UserProfile');
            asyncQTM.equal(users[0].Profile.Bio, 'Bio1', 'bad Profile.Bio');
            start();
          });
        });
      });
    });

    asyncQTM.test('remove navgation property value', 1, function (start) {
      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

          db.Articles.include('Category').toArray(function (items) {
            var item = items[0];
            db.Articles.attach(item);
            asyncQTM.notequal(item.Category, null, 'article category is not null');
            asyncQTM.equal(item.Category instanceof $news.Types.Category, true, 'article category is Category');

            item.Category = null;
            asyncQTM.equal(item.Category, null, 'article category set to null');

            db.saveChanges(function () {

              db.Articles.include('Category').filter('it.Id == id', { id: item.Id }).toArray(function (items2) {
                asyncQTM.equal(items2[0].Category, null, 'article has valid category value');

                start();
              });
            });
          });
        });
      });
    });

    asyncQTM.test('remove navgation property value without inclue', 1, function (start) {
      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

          db.Articles.toArray(function (items) {
            var item = items[0];
            db.Articles.attach(item);
            asyncQTM.ok(item.Category !== null, 'article category is not null');
            asyncQTM.equal(item.Category, undefined, 'article category is undefined');

            item.Category = null;
            asyncQTM.equal(item.Category, null, 'article category set to null');

            db.saveChanges(function () {

              db.Articles.include('Category').filter('it.Id == id', { id: item.Id }).toArray(function (items2) {
                asyncQTM.equal(items2[0].Category, null, 'article has valid category value');

                start();
              });
            });
          });
        });
      });
    });

    asyncQTM.test('load entity without include', 1, function (start) {
      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        //$news.Types.NewsContext.generateTestData(db, function () {

        db.Articles.add({ Title: 'TitleData', Lead: 'LeadData' });
        db.saveChanges(function () {

          db.Articles.length(function (c) {
            console.log("!!!!", c);
            db.Articles.single('it.Title == "TitleData"', null, function (item) {
              db.Articles.attach(item);
              asyncQTM.ok(item.Category === undefined, 'article category is undefined');
              asyncQTM.equal(item.Title, 'TitleData', 'item title');
              asyncQTM.equal(item.Lead, 'LeadData', 'item lead');

              start();
            });

          });
        });
        //});
      });
    });

    asyncQTM.test('load entity with include', 1, function (start) {
      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        //$news.Types.NewsContext.generateTestData(db, function () {

        db.Articles.add({ Title: 'TitleData', Lead: 'LeadData' });
        db.saveChanges(function () {


          db.Articles.include('Category').single('it.Title == "TitleData"', null, function (item) {
            db.Articles.attach(item);
            asyncQTM.ok(item.Category === null, 'article category is null');
            asyncQTM.equal(item.Title, 'TitleData', 'item title');
            asyncQTM.equal(item.Lead, 'LeadData', 'item lead');

            start();
          });
        });
        //});
      });
    });

    asyncQTM.test('date null value', 1, function (start) {
      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Articles.orderBy('it.Id').toArray(function (r) {
            var a1 = new db.Articles.elementType({ Title: '123', Lead: 'asd', CreateDate: null });
            db.Articles.add(a1);
            db.saveChanges({
              success: function () {
                db.Articles.filter('it.Title === "123" || it.Id === this.id', { id: r[0].Id }).toArray(function (res) {
                  if (res[0].CreateDate === null) {
                    asyncQTM.equal(res[0].CreateDate, null, 'CreateDate is null')
                    asyncQTM.notequal(res[1].CreateDate, null, 'CreateDate not null')
                  } else {
                    asyncQTM.equal(res[1].CreateDate, null, 'CreateDate is null')
                    asyncQTM.notequal(res[0].CreateDate, null, 'CreateDate not null')
                  }

                  start();
                });
              },
              error: function () {
                asyncQTM.ok(false, 'error called');
                start();
              }
            });
          })
        });
      });
    });
    asyncQTM.test('batch error handler called', 1, function (start) {
      if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); start(); return; }
      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

          var a1 = db.Articles.attachOrGet({ Id: 1 });
          a1.Title = 'changed2';

          var a2 = db.Articles.attachOrGet({ Id: 2 });
          a2.Title = 'changed2';

          db.saveChanges({
            success: function () {
              asyncQTM.ok(false, 'save success');
              start();
            },
            error: function () {
              asyncQTM.ok(true, 'error called');
              start();
            }
          });
        });
      });
    });
    asyncQTM.test('map as jaydata type', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Articles.orderBy('it.Id').map(function (a) { return { Id: a.Id, Lead: a.Lead, Body: a.Body, Category: a.Category }; }, null, $news.Types.Article).toArray(function (art) {
            asyncQTM.equal(art[1] instanceof $news.Types.Article, true, 'result is typed');

            asyncQTM.equal(typeof art[1].Id, 'number', 'result Id is typed');
            asyncQTM.equal(typeof art[1].Lead, 'string', 'result Lead is typed');
            asyncQTM.equal(typeof art[1].Body, 'string', 'result Body is typed');
            asyncQTM.equal(typeof art[1].CreateDate, 'undefined', 'result CreateDate is undefined');
            asyncQTM.equal(art[1].Category instanceof $news.Types.Category, true, 'art[1].Category is Array');

            start();
          });
        });

      });
    });
    asyncQTM.test('map as default', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Articles.orderBy('it.Id').map(function (a) { return { Id: a.Id, Lead: a.Lead, Body: a.Body, Category: a.Category }; }, null, 'default').toArray(function (art) {
            asyncQTM.equal(art[1] instanceof $news.Types.Article, true, 'result is typed');

            asyncQTM.equal(typeof art[1].Id, 'number', 'result Id is typed');
            asyncQTM.equal(typeof art[1].Lead, 'string', 'result Lead is typed');
            asyncQTM.equal(typeof art[1].Body, 'string', 'result Body is typed');
            asyncQTM.equal(typeof art[1].CreateDate, 'undefined', 'result CreateDate is undefined');
            asyncQTM.equal(art[1].Category instanceof $news.Types.Category, true, 'art[1].Category is Array');

            start();
          });
        });
      });
    });
    asyncQTM.test('sqLite 0..1 table generation not required', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(1);

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
              asyncQTM.ok('save success', 'save success');
              start();
            },
            error: function (ex) {
              asyncQTM.ok(false, ex.message);
              start();
            }
          });
        });
    });
    asyncQTM.test('sqLite 0..1 table generation required', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(1);

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
              asyncQTM.ok(false, 'required field failed');
              start();
            },
            error: function (ex) {
              asyncQTM.ok(ex.message.indexOf('constraint failed') >= 0, 'required side is required');
              start();
            }
          });
        });
    });

    asyncQTM.test('sqLite 0..1 table generation not required guid key', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(1);

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
              asyncQTM.ok('save success', 'save success');
              start();
            },
            error: function (ex) {
              asyncQTM.ok(false, ex.message);
              start();
            }
          });
        });
    });

    asyncQTM.test('sqLite 0..1 table generation required guid key', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(1);

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
              asyncQTM.ok(false, 'required field failed');
              start();
            },
            error: function (ex) {
              asyncQTM.ok(ex.message.indexOf('constraint failed') >= 0, 'required side is required');
              start();
            }
          });
        });
    });

    asyncQTM.test('navProperty many', 1, function (start) {
      //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Articles.map(function (a) { return { id: a.Id, catArticles: a.Category.Articles }; }).toArray(function (art) {
            console.log(art);
            asyncQTM.equal(art[0].catArticles instanceof Array, true, 'many nav property is array');
            asyncQTM.equal(art[1].catArticles instanceof Array, true, 'many nav property is array');

            asyncQTM.equal(art[1].catArticles[0] instanceof $news.Types.Article, true, 'item[1].catArticles[0] is $news.Types.Article');
            asyncQTM.equal(art[1].catArticles[0].Body, 'Body1', 'item[1].catArticles[0].Body has value');
            asyncQTM.equal(art[1].catArticles[0].Lead, 'Lead1', 'item[1].catArticles[0].Lead has value');
            start();
          });
        });

      });
    });

    asyncQTM.test('navProperty single', 1, function (start) {
      //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }


      asyncQTM.stop(1);

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Articles.map(function (a) { return { id: a.Id, category: a.Category }; }).toArray(function (art) {
            asyncQTM.equal(art[0].category instanceof $news.Types.Category, true, 'many nav property is $news.Types.Category');
            asyncQTM.equal(art[1].category instanceof $news.Types.Category, true, 'many nav property is $news.Types.Category');

            asyncQTM.equal(art[1].category.Title, 'Sport', 'art[1].category.Title has value');
            start();
          });
        });

      });
    });

    asyncQTM.test('guid key, navProperty', 1, function (start) {
      //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }


      asyncQTM.stop(1);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        var itemGrp = new $news.Types.TestItemGroup({ Id: $data.parseGuid('73304541-7f4f-4133-84a4-16ccc2ce600d'), Name: 'Group1' });
        asyncQTM.equal(itemGrp.Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', ' init guid value');
        var item = new $news.Types.TestItemGuid({ Id: $data.parseGuid('bb152892-3a48-4ffa-83cd-5f952e21c6eb'), i0: 0, b0: true, s0: '0', Group: itemGrp });

        //db.TestItemGroups.add(itemGrp);
        db.TestTable2.add(item);

        db.saveChanges(function () {
          db.TestItemGroups.toArray(function (res) {
            asyncQTM.equal(res[0].Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', 'res init guid value');
            db.TestTable2.toArray(function (res2) {
              asyncQTM.equal(res2[0].Id, 'bb152892-3a48-4ffa-83cd-5f952e21c6eb', 'res2 init guid value');


              db.TestItemGroups.attach(itemGrp);
              var item2 = new $news.Types.TestItemGuid({ Id: $data.parseGuid('03be7d99-5dc1-464b-b890-5b997c86a798'), i0: 1, b0: true, s0: '0', Group: itemGrp });
              db.TestTable2.add(item2);

              db.saveChanges(function () {
                db.TestItemGroups.toArray(function (res) {
                  asyncQTM.equal(res.length, 1, 'res length');
                  asyncQTM.equal(res[0].Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', 'res init guid value');
                  db.TestTable2.orderBy('it.i0').toArray(function (res2) {
                    asyncQTM.equal(res2.length, 2, 'res2 length');
                    asyncQTM.equal(res2[0].Id, 'bb152892-3a48-4ffa-83cd-5f952e21c6eb', 'res2 init guid value');
                    asyncQTM.equal(res2[1].Id, '03be7d99-5dc1-464b-b890-5b997c86a798', 'res2 init guid value');
                    start();
                  });
                });
              });

            })
          })
        });

      });
    });

    asyncQTM.test('concurrency test', 1, function (start) {
      if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); start(); return; }
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }


      asyncQTM.stop(1);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.toArray(function (a) {
              db.Articles.toArray(function (a2) {
                var article = a[0];
                var article2 = a2[0];
                asyncQTM.equal(article.Id, article2.Id, 'test items equal failed');
                asyncQTM.equal(article.RowVersion, article2.RowVersion, 'test items RowVersion equal failed');

                db.Articles.attach(article);
                article.Body += 'Changed body';
                db.saveChanges(function () {
                  asyncQTM.equal(article.Id, article2.Id, 'test items equal');
                  asyncQTM.notequal(article.RowVersion, article2.RowVersion, 'test items RowVersion notequal failed');

                  db.Articles.attach(article2);
                  article2.Body += 'Changed later';

                  db.saveChanges({
                    success: function () {
                      asyncQTM.ok(false, 'save success on invalid element failed');
                      start();
                    },
                    error: function () {
                      article2.RowVersion = '*';
                      db.saveChanges({
                        success: function () {
                          asyncQTM.equal(article.Id, article2.Id, 'test items equal');
                          asyncQTM.notequal(article.RowVersion, article2.RowVersion, 'test items RowVersion notequal failed');
                          db.Articles.filter(function (art) { return art.Id == this.Id }, { Id: article2.Id }).toArray(function (a3) {
                            asyncQTM.equal(a3[0].Id, article2.Id, 'test items equal failed');
                            asyncQTM.equal(a3[0].RowVersion, article2.RowVersion, 'test items RowVersion equal failed');
                            start();
                          });
                        },
                        error: function () {
                          asyncQTM.ok(false, 'save not success on valid element failed');
                          start();
                        }
                      });
                    }
                  })

                });
              });
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== concurrency test: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('OData provider - Filter by GUID field should be supported', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
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

        if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); start(); asyncQTM.ok(true, "Not supported"); start(); asyncQTM.ok(true, "Not supported"); start(); asyncQTM.ok(true, "Not supported"); start(); }
        else {
          asyncQTM.equal(q.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'ae22ffc7-8d96-488e-84f2-c04753242348')", 'param guid failed');
          asyncQTM.equal(q2.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'c22f0ecd-8cff-403c-89d7-8d18c457f1ef')", 'inline guid failed');
          asyncQTM.equal(q3.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'00000000-0000-0000-0000-000000000000')", 'empty guid failed');
          asyncQTM.equal(q4.toTraceString().queryText, "/TestTable?$filter=(g0 eq null)", 'null guid failed');
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
          var promises = [
            db.TestTable.toArray(function (items) {
              for (var i = 0; i < items.length; i++) {
                var item = items[i];
                switch (item.Id) {
                  case 42:
                    asyncQTM.equal(item.g0, 'ae22ffc7-8d96-488e-84f2-c04753242348', "Id:42, guid value failed");
                    break;
                  case 43:
                    asyncQTM.equal(item.g0, 'c22f0ecd-8cff-403c-89d7-8d18c457f1ef', "Id:43, guid value failed");
                    break;
                  case 44:
                    asyncQTM.equal(item.g0, '00000000-0000-0000-0000-000000000000', "Id:44, guid value failed");
                    break;
                  case 45:
                    asyncQTM.equal(item.g0, null, "Id:45, guid value failed");
                    break;
                  default:
                }
              }
            }),
            q.toArray(function (items) {
              asyncQTM.equal(items.length, 1, 'result count failed');
              asyncQTM.equal(items[0].g0.toString(), 'ae22ffc7-8d96-488e-84f2-c04753242348', "param guid value failed");
            }),
            q2.toArray(function (items) {
              asyncQTM.equal(items.length, 1, 'result count failed');
              asyncQTM.equal(items[0].g0.toString(), 'c22f0ecd-8cff-403c-89d7-8d18c457f1ef', "param inline value failed");
            }),
            q3.toArray(function (items) {
              asyncQTM.equal(items.length, 1, 'result count failed');
              asyncQTM.equal(items[0].g0.toString(), '00000000-0000-0000-0000-000000000000', "param empty value failed");
            }),
            q4.toArray(function (items) {
              asyncQTM.equal(items.length, 1, 'result count failed');
              asyncQTM.equal(items[0].g0, null, "param null value failed");
            }),
            db.TestTable.map(function (t) { return t.g0; }).toArray(function (items) {
              for (var i = 0; i < items.length; i++) {
                if (items[i]) {
                  asyncQTM.equal($data.parseGuid(items[i]) instanceof $data.Guid, true, 'guid map failed: ' + i);
                } else {
                  asyncQTM.equal(items[i], null, 'guid map failed: ' + i);
                }
              }
            })
          ];
          Promise.all(promises).then(function () {
            start();
          });
        });
      });
    });

    asyncQTM.test('EntityField == null or null == EntityField filter', 6, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.toArray(function (a) {
              var article = a[0];
              db.Articles.attach(article);
              article.Body = null;
              db.saveChanges(function () {
                var promises = [
                  db.Articles.filter(function (a) { return a.Body == null; }).toArray(function (a1) {
                    asyncQTM.equal(a1.length, 1, 'result count failed');
                    asyncQTM.equal(a1[0] instanceof $news.Types.Article, true, 'result type failed');
                    asyncQTM.equal(a1[0].Body, null, 'result type failed');
                  }),
                  db.Articles.filter(function (a) { return null == a.Body; }).toArray(function (a1) {
                    asyncQTM.equal(a1.length, 1, 'result count failed');
                    asyncQTM.equal(a1[0] instanceof $news.Types.Article, true, 'result type failed');
                    asyncQTM.equal(a1[0].Body, null, 'result type failed');
                  })
                ];
                Promise.all(promises).then(function () {
                  start();
                });
              });
            });
          });
        } catch (ex) {
          start();
          asyncQTM.ok(false, "Unhandled exception occured");
          console.log("--=== EntityField == null or null == EntityField filter filter: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });



    asyncQTM.test('EntityField != null or null != EntityField filter', 2, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.toArray(function (a) {
              var article = a[0];
              db.Articles.attach(article);
              article.Body = null;
              db.saveChanges(function () {
                var promises = [
                  db.Articles.filter(function (a) { return a.Body != null; }).toArray(function (a1) {
                    asyncQTM.equal(a1.length, a.length - 1, 'result count failed');;
                  }),
                  db.Articles.filter(function (a) { return null != a.Body; }).toArray(function (a1) {
                    asyncQTM.equal(a1.length, a.length - 1, 'result count failed');
                  })
                ];
                Promise.all(promises).then(function () {
                  start();
                });
              });
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== EntityField == null or null == EntityField filter filter: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1003_even if a simple field is projected an Article is returned', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q = db.Articles.map(function (a) { return a.Title });
            q.toArray(function (a) {
              asyncQTM.notequal(a[0] instanceof $news.Types.Article, true, 'result type failed');
              asyncQTM.equal(typeof a[0], 'string', 'result type failed');
              start();
            });
          });

        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1003_additional_test1', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q1 = db.Articles.map(function (a) { return { t: a.Title, i: a.Id }; });
            q1.toArray(function (a) {
              asyncQTM.notequal(a[0] instanceof $news.Types.Article, true, 'result type failed');
              asyncQTM.equal(a[0] instanceof Object, true, 'result type failed');
              asyncQTM.equal(typeof a[0].t, 'string', 'result type failed');
              asyncQTM.equal(typeof a[0].i, 'number', 'result type failed');
              start();
            });
          });

        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1003_additional_test2', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q2 = db.Articles.map(function (a) { return a.Author; });
            console.dir(q2.toTraceString());
            q2.toArray(function (a) {
              console.dir(a);
              asyncQTM.equal(a[0] instanceof $news.Types.User, true, 'result type failed');
              asyncQTM.equal(typeof a[0].LoginName, 'string', 'result type failed');
              asyncQTM.equal(typeof a[0].Id, 'number', 'result type failed');
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1003_additional_test3', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q3 = db.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author }; });
            q3.toArray(function (a) {
              asyncQTM.notequal(a[0] instanceof $news.Types.Article, true, 'result type failed');
              asyncQTM.notequal(a[0] instanceof $news.Types.User, true, 'result type failed');
              asyncQTM.equal(typeof a[0].Title, 'string', 'result type failed');
              asyncQTM.equal(a[0].Auth instanceof $news.Types.User, true, 'result type failed');
              asyncQTM.equal(typeof a[0].Auth.LoginName, 'string', 'result type faild');
              asyncQTM.notequal(a[0].Auth.LoginName.length, 0, 'login name not fill');
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1003_additional_test4', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q3 = db.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author, Prof: a.Author.Profile, Z: a.Author.Profile.Bio, k: a.Author.LoginName }; });

            q3.toArray(function (a) {
              asyncQTM.notequal(a[0] instanceof $news.Types.Article, true, 'result type failed');
              asyncQTM.notequal(a[0] instanceof $news.Types.User, true, 'result type failed');
              asyncQTM.equal(typeof a[0].Title, 'string', 'result type failed');
              asyncQTM.equal(a[0].Auth instanceof $news.Types.User, true, 'result type failed');
              asyncQTM.equal(typeof a[0].Auth.LoginName, 'string', 'result type faild');
              asyncQTM.notequal(a[0].Auth.LoginName.length, 0, 'login name not fill');
              asyncQTM.equal(a[0].Prof instanceof $news.Types.UserProfile, true, "result type faild");
              asyncQTM.equal(typeof a[0].Prof.Bio, 'string', 'result type faild');
              asyncQTM.equal(typeof a[0].Z, 'string', 'result type faild');
              asyncQTM.equal(a[0].Z, a[0].Prof.Bio, 'result type faild');
              asyncQTM.equal(typeof a[0].k, "string", "result type faild");
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1003_additional_test5', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q2 = db.Articles.map(function (a) { return a.Author.Profile; });
            q2.toArray(function (a) {
              asyncQTM.equal(a[0] instanceof $news.Types.UserProfile, true, 'result type failed');
              asyncQTM.equal(typeof a[0].Bio, 'string', 'result type failed');
              asyncQTM.equal(typeof a[0].Id, 'number', 'result type failed');
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1003_additional_test6', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q2 = db.Articles.filter(function (a) { return a.Category.Id == 1; }, null).map(function (a) { return { Title: a.Title, LoginName: a.Author.LoginName }; });
            q2.toArray(function (a) {
              asyncQTM.notequal(a[0] instanceof $news.Types.UserProfile, true, 'result type failed');
              asyncQTM.equal(typeof a[0].Title, 'string', 'Title filed type faild');
              asyncQTM.ok(a[0].Title.length > 0, 'Title field value error');
              asyncQTM.equal(typeof a[0].LoginName, 'string', 'LoginName filed type faild');
              asyncQTM.ok(a[0].LoginName.length > 0, 'LoginName field value error');
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1002_even if map is used with anon type an Article is returned', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.map(function (a) { return { T: a.Title } }).toArray(function (a) {
              asyncQTM.equal(a[0] instanceof $news.Types.Article, false, 'result type failed');
              asyncQTM.equal(typeof a[0], 'object', 'result type failed');
              asyncQTM.equal(typeof a[0].T, 'string', 'result type property failed');
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1002_even if map is used with anon type an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1001_Article CreateDate comes bac Invalid date', 2, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          var promises = [
            $news.Types.NewsContext.generateTestData(db, function () {
              db.Articles.toArray(function (a) {
                asyncQTM.equal(a[0] instanceof $news.Types.Article, true, 'result type failed');
                asyncQTM.notequal(a[0].CreateDate.valueOf(), NaN, 'datetime value failed');

              });
            })
          ];

          Promise.all(promises).then(function () {
            start();
          });

        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1001_Article CreateDate comes bac Invalid date: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1048_ODATA attach -> saveChanges error', 1, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var promises = [
              db.Articles.toArray(function (result) {
                if (result.length) {
                  var save = result[0];
                  db.Articles.attach(save);
                  save.Title = 'alma';
                  save.Lead = 'alma';
                  save.Body = 'alma';
                  //db.Articles.attach(save);
                  db.saveChanges(function (count) {
                    asyncQTM.equal(count, 1, "save error");
                  });
                }
              })
            ];
            Promise.all(promises).then(function () {
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1048_ODATA delete -> saveChanges error', 1, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            db.UserProfiles.toArray(function (result) {
              if (result.length) {
                var save = result[0];
                db.UserProfiles.remove(save);
                db.saveChanges(function (count) {
                  asyncQTM.equal(count, 1, "save error");
                  start();
                });
              }
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1038_Include complex type property', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
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

              console.dir(result);
              asyncQTM.ok(result, 'Query OK');
              asyncQTM.equal(result.length, 1, 'Result nnumber fiaild');

              asyncQTM.notequal(result[0].Author instanceof $news.Types.UserProfile, true, 'Author type loading faild');
              asyncQTM.equal(result[0].Author.Profile instanceof $news.Types.UserProfile, true, 'Author.Profile type loading faild');

              asyncQTM.equal(result[0].CmpType instanceof $news.Types.UserProfile, true, 'Profile type loading faild');
              asyncQTM.equal(result[0].CmpType.Location instanceof $news.Types.Location, true, 'Profile.Location type loading faild');
              start();
            });
            asyncQTM.ok(true);
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1038_additional_tests_1', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
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

              console.dir(result);
              asyncQTM.ok(result, 'Query OK');
              asyncQTM.equal(result.length, 1, 'Result nnumber fiaild');

              asyncQTM.equal(typeof result[0], "object", 'object structure build');
              asyncQTM.equal(typeof result[0].a, "object", 'object structure build (a)');
              asyncQTM.equal(typeof result[0].a.b, "object", 'object structure build (a.b)');
              asyncQTM.equal(typeof result[0].a.b.c, "object", 'object structure build (a.b.c)');
              asyncQTM.equal(typeof result[0].a.b.c.d, "string", 'object structure build (a.b.c.d)');
              asyncQTM.ok(result[0].a.b.c.d.length > 0, 'Complex type loading faild');
              start();

            });
          });

        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('978_create article with inline category fails', 3, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          //$news.Types.NewsContext.generateTestData(db, function () {
          var a = new $news.Types.Article({ Title: "asdads", Category: new $news.Types.Category({ Title: "CatX" }) });
          db.Articles.add(a);
          db.saveChanges(function (count) {
            asyncQTM.equal(count, 2, "Saved entity count faild");
            asyncQTM.equal(typeof a.Id, 'number', 'Article Id faild');
            asyncQTM.equal(typeof a.Category.Id, 'number', "category Id faild");
            start();
          });
          //});
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 978_create article with inline category fails: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('977_adding new articles with category ends up in error', 3, function (start) {
      asyncQTM.stop(4);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        asyncQTM.ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Categories.toArray(function (a) {
            var cat = a[0];
            asyncQTM.ok(cat instanceof $news.Types.Category, "Return value do not a category instance");
            db.Categories.attach(cat);
            for (var i = 0; i < 100; i++) {
              var art = new $news.Types.Article({ Title: 'Arti' + i, Category: cat });
              db.Articles.add(art);
            }
            db.saveChanges({
              success: function (count) {
                asyncQTM.equal(count, 100, "Saved item count faild");
                start();
              },
              error: function (error) {
                console.dir(error);
                start();
                asyncQTM.ok(false, error);
              }
            });
          });
        });
      });
    });

    asyncQTM.test('976_updating entity will result in cleared out fields in db', 7, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        asyncQTM.ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Articles.toArray(function (a) {
            var art = a[0];
            asyncQTM.ok(art instanceof $news.Types.Article, "Return value do not an article instance");
            asyncQTM.ok(art.Title.length > 0, "Article title faild");

            db.Articles.attach(art);
            art.Title = "zpace";
            var pin_ArticleInitData = JSON.parse(JSON.stringify(art.initData));
            db.saveChanges(function (count) {
              asyncQTM.equal(count, 1, "Saved item count faild");
              db.Articles.toArray(function (uArticles) {
                var uArticle = uArticles[0];
                asyncQTM.ok(uArticle instanceof $news.Types.Article, "Return value do not an article instance");

                if (providerConfig.name[0] === 'sqLite')//ETag
                {
                  asyncQTM.ok(true, 'sqLite ETag update not supported yet');
                } else {
                  asyncQTM.notequal(pin_ArticleInitData.RowVersion, uArticle.RowVersion, 'ETag update faild');
                  pin_ArticleInitData.RowVersion = uArticle.RowVersion;//asyncQTM.deepEqual helper
                }
                var pin_uArticleInitData = JSON.parse(JSON.stringify(uArticle.initData));
                asyncQTM.deepEqual(pin_uArticleInitData, pin_ArticleInitData, "Article saved faild");
                start();
              });
            });
          });
        });
      });
    });

    asyncQTM.test("974_Projection of Navigational property return a typed entity result but it's init data is empty", 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        asyncQTM.ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return { T: a.Title, A: a.Author } });
          q.toArray(function (articles) {
            asyncQTM.equal(articles.length, 26, "Article count faild");
            asyncQTM.ok(articles[0].T.length > 0, "Article1", "1st article title field faild");
            asyncQTM.ok(articles[0].A instanceof $news.Types.User, "1st article Author field faild");
            start();
          });

        });
      });
    });

    asyncQTM.test("975_Complex type projections - illegal instruction", 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        asyncQTM.ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return { T: a.Title, A: a.Author.Profile.Location } });
          q.toArray({
            success: function (articles) {
              asyncQTM.equal(articles.length, 26, "Article count faild");
              asyncQTM.ok(articles[0].T.length > 0, "Article1", "1st article title field faild");
              asyncQTM.ok(articles[0].A instanceof $news.Types.Location, "1st article Author field faild");
              start();
            },
            error: function (error) {
              console.dir(error);
              asyncQTM.ok(false, 'Query erroro!');
              start();
            }
          });
        });
      });
    });

    asyncQTM.test("write_boolean_property", 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        asyncQTM.ok(db, 'Databse generation faild');
        //$news.Types.NewsContext.generateTestData(db, function () {
        var item = new $news.Types.TestItem();
        item.b0 = true;
        db.TestTable.add(item);
        db.saveChanges(function () {
          db.TestTable.toArray(function (result) {
            asyncQTM.ok(result, 'query error');
            asyncQTM.ok(result[0].b0, 'boolean result error');
            start();
          });
        });
        //});
      });
    });
  
    // asyncQTM.test("XXX_Projection_scalar_with_function_call", 3, function (start) {
    //    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
    //        asyncQTM.ok(db, 'Databse generation faild');
    //        $news.Types.NewsContext.generateTestData(db, function () {
    //            var q = db.Articles.filter(function (a) { return a.Id == 1; }, null).map(function (a) { return a.Title.toLowerCase(); });
    //            q.toArray(function (articles) {
    //                console.dir(articles);
    //               asyncQTM.equal(articles.length, 1, "Article count faild");
    //               asyncQTM.equal(articles[0], "article1", "1st article title field faild");
    //                start();
    //            });

    //        });
    //    });
    // });
  
    asyncQTM.test('973_Complex types filter - illegal instruction exceptions', 3, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.alma = db;
        asyncQTM.ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.filter(function (a) { return a.Author.Profile.Location.Zip == 1115 });
          q.toArray(function (articles) {
            asyncQTM.ok(articles, 'Query run success');
            asyncQTM.equal(articles.length, 5, 'Faild query');
            start();
          });
        });
      });
    });

    asyncQTM.test('1012_websql provider - Projected Navigational properties are incorrect.', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.Articles.map(function (a) { return { T: a.Title, AuthorID: a.Author.Id, A: a.Author } });
            q.toArray(function (article) {
              console.dir(article);
              asyncQTM.equal(article.length, 26, 'Not all articles loaded');
              asyncQTM.equal(typeof article[0].T, 'string', "result type faild");
              asyncQTM.equal(typeof article[0].AuthorID, 'number', "category filed not loaded");
              asyncQTM.ok(article[0].A instanceof $news.Types.User, "category filed not loaded");
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1024_ODATA projection of complex type does not get values', 3, function (start) {
      if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported"); asyncQTM.ok(true, "Not supported"); asyncQTM.ok(true, "Not supported"); start(); return; }
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); asyncQTM.ok(true, "Not supported"); asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q = db.Articles.include("Author.Profile").map(function (a) { return a.Author.Profile.Location });
            q.toArray(function (article) {
              asyncQTM.equal(article[0] instanceof $news.Types.Location, true, "result type faild");
              asyncQTM.equal(typeof article[0].Zip, 'number', "result type faild");
              asyncQTM.equal(typeof article[0].City, 'string', "result type faild");
              start();
            });
          });

        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1023_OData include does not include', 1, function (start) {
      //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      
      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q = db.Articles.include("Category");
            q.toArray(function (article) {
              asyncQTM.equal(article[0] instanceof $news.Types.Article, true, "result type faild");
              asyncQTM.notequal(article[0].Category, undefined, "category filed not loaded");
              asyncQTM.equal(typeof article[0].Category.Title, 'string', 'Category title type faild');
              asyncQTM.ok(article[0].Category.Title.length > 0, 'Category title not loaded');
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1023_additional_test_1', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      
      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q = db.Articles.include("Author.Profile");
            q.toArray(function (article) {
              asyncQTM.equal(article[0] instanceof $news.Types.Article, true, "result type faild");
              asyncQTM.equal(article[0].Category, undefined, "category filed not loaded");

              asyncQTM.ok(article[0].Author !== undefined, "category filed not loaded");
              asyncQTM.ok(article[0].Author.Profile !== undefined, "category filed not loaded");

              asyncQTM.equal(typeof article[0].Author.Profile.Bio, 'string', 'Category title type faild');
              asyncQTM.ok(article[0].Author.Profile.Bio.length > 0, 'Category title type faild');
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1023_additional_test_2', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      
      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q = db.Articles.include("Author").include("Author.Profile").include("Reviewer.Profile");
            q.toArray(function (article) {
              asyncQTM.equal(article[0] instanceof $news.Types.Article, true, "result type faild");
              asyncQTM.ok(article[0].Category === undefined, "category filed not loaded");

              asyncQTM.equal(article[0].Author instanceof $news.Types.User, true, "result type faild");
              asyncQTM.ok(article[0].Author !== undefined, "category filed not loaded");
              asyncQTM.equal(article[0].Author.Profile instanceof $news.Types.UserProfile, true, "result type faild");
              asyncQTM.ok(article[0].Author.Profile !== undefined, "category filed not loaded");
              asyncQTM.equal(typeof article[0].Author.Profile.Bio, 'string', 'Category title type faild');
              asyncQTM.ok(article[0].Author.Profile.Bio.length > 0, 'Category title type faild');

              asyncQTM.ok(article[0].Reviewer !== undefined, "Reviewer filed not loaded");
              asyncQTM.equal(article[0].Reviewer instanceof $news.Types.User, true, "Reviewer type faild");
              asyncQTM.ok(article[0].Reviewer.Profile !== undefined, "Reviewer.Profile filed not loaded");
              asyncQTM.equal(article[0].Reviewer.Profile instanceof $news.Types.UserProfile, true, "Reviewer.Profile type faild");

              asyncQTM.equal(typeof article[0].Reviewer.Profile.Bio, 'string', 'Category title type faild');
              asyncQTM.ok(article[0].Reviewer.Profile.Bio.length > 0, 'Category title type faild');
              start();
            });
          });

        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1032_ODATA: order by complex type field', 2, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q = db.Users.orderBy(function (item) { return item.Profile.FullName; });
            q.toArray(function (article) {
              asyncQTM.equal(article[0] instanceof $news.Types.User, true, "result type faild");
              asyncQTM.ok(article[0].LoginName.length > 0, "category filed not loaded");
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1032_additional_test_1', 2, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q = db.Articles.orderBy(function (item) { return item.Author.Profile.FullName; });
            q.toArray(function (article) {
              asyncQTM.equal(article[0] instanceof $news.Types.Article, true, "result type faild");
              asyncQTM.ok(article[0].Title.length > 0, "category filed not loaded");
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1032_additional_test_2', 2, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
            var q = db.Articles.orderBy(function (item) { return item.Author.Profile.Location.City; });
            console.dir(q.toTraceString());
            q.toArray(function (article) {
              asyncQTM.equal(article[0] instanceof $news.Types.Article, true, "result type faild");
              asyncQTM.ok(article[0].Title.length > 0, "category filed not loaded");
              start();
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('1067_ID_field_not_write_back', 1, function (start) {
      //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      //
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Categories
            .toArray(function (result) {
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
                  var tags = 'temp'.split(',');
                  db.Tags
                    .filter(function (item) { return item.Title in this.tags; }, { tags: tags })
                    .toArray(function (result) {

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
                          asyncQTM.equal(typeof articleEntity.Id, 'number', 'Article Id faild');
                          start();
                          console.log('Article ID: ' + articleEntity.Id);
                        },
                        error: function (error) {
                          console.dir(error);
                          asyncQTM.ok(false, error);
                          star();
                        }
                      });
                    });
                },
                error: function (error) {
                  console.dir(error);
                  asyncQTM.ok(false, error);
                  start();
                }
              });
            });
        });
      });
    });

    asyncQTM.test('DANI_CategoryModify', 1, function (start) {
      //if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Categories.skip(4).first(null, null, function (cat) {
            db.Articles.skip(3).first(null, null, function (article) {
              db.Articles.attach(article);
              article.Title = "Some test data";
              db.Categories.attach(cat);
              article.Category = cat;
              db.saveChanges(function () {
                db.Articles.include('Category').skip(3).first(null, null, function (article2) {
                  asyncQTM.ok(article2.Category instanceof $news.Types.Category, 'faild');
                  start();
                });
              });
            });
          });
        });
      });
    });

    asyncQTM.test('get_mapped_custom', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        asyncQTM.ok(db, "Db create faild");
        try {
          $news.Types.NewsContext.generateTestData(db, function () {
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
                var m = r[0];
                asyncQTM.equal(typeof m.a, 'string', 'a');
                asyncQTM.equal(typeof m.Author, 'string', 'Author');
                asyncQTM.equal(m.Tags instanceof Object, true, 'Tags');
                asyncQTM.equal(typeof m.Tags.Title, 'string', 'Tags.Title');
                asyncQTM.equal(m.Reviewer instanceof $news.Types.UserProfile, true, 'Reviewer');
                asyncQTM.equal(typeof m.Reviewer.Id, 'number', 'Reviewer.Id');
                asyncQTM.equal(typeof m.Reviewer.FullName, 'string', 'Reviewer.FullName');
                asyncQTM.equal(typeof m.Reviewer.Bio, 'string', 'Reviewer.Bio');
                //equal(m.Reviewer.Avatar instanceof Object, true, 'Reviewer.Avatar');
                asyncQTM.equal(m.Reviewer.Location instanceof $news.Types.Location, true, 'Reviewer.Location');
                asyncQTM.equal(typeof m.Reviewer.Location.Address, 'string', 'Reviewer.Location.Address');
                asyncQTM.equal(typeof m.Reviewer.Location.City, 'string', 'Reviewer.Location.City');
                asyncQTM.equal(typeof m.Reviewer.Location.Zip, 'number', 'Reviewer.Location.Zip');
                asyncQTM.equal(typeof m.Reviewer.Location.Country, 'string', 'Reviewer.Location.Country');
                asyncQTM.equal(m.Reviewer.Birthday instanceof Date, true, 'Reviewer.Birthday');
                //equal(m.Reviewer.User instanceof $news.Types.User, true, 'Reviewer.User'); //TODO: not supported yet
                asyncQTM.equal(m.b instanceof Object, true, 'b');
                asyncQTM.equal(typeof m.b.a, 'string', 'b.a');
                asyncQTM.equal(typeof m.b.b, 'string', 'b.b');
                asyncQTM.equal(m.b.c instanceof $news.Types.Location, true, 'b.c');
                asyncQTM.equal(typeof m.b.c.Address, 'string', 'b.c.Address');
                asyncQTM.equal(typeof m.b.c.City, 'string', 'b.c.City');
                asyncQTM.equal(typeof m.b.c.Zip, 'number', 'b.c.Zip');
                asyncQTM.equal(typeof m.b.c.Country, 'string', 'b.c.Country');
                start();
              },
              error: function (error) { console.log("ERROR"); console.log(error); }
            });
          });
        } catch (ex) {
          asyncQTM.ok(false, "Unhandled exception occured");
          start();
          console.log("--=== get_mapped_custom is returned: ");
          console.dir(ex);
          console.log(" ===--");
        }
      });
    });

    asyncQTM.test('Include: indirect -> map scalar(string)', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return a.Category.Title });
          q.toArray({
            success: function (categoriesTitle) {
              asyncQTM.equal(categoriesTitle.length, 26, 'Article category error');
              categoriesTitle.forEach(function (ct, index) {
                asyncQTM.equal(typeof ct, 'string', 'data type error at ' + index + '. position');
                asyncQTM.ok(ct.length >= 4, 'data length error at ' + index + '. position');
              });
              start();
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> map scalar(int)', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return a.Category.Id });
          q.toArray({
            success: function (categoriesId) {
              asyncQTM.equal(categoriesId.length, 26, 'Article category error');
              categoriesId.forEach(function (ci, index) {
                asyncQTM.equal(typeof ci, 'number', 'data type error at ' + index + '. position');
                asyncQTM.ok(ci > 0, 'data min value error at ' + index + '. position');
                asyncQTM.ok(ci < 6, 'data max value error at ' + index + '. position');
                start();
              });
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> map object include scalar(string)', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return { t: a.Category.Title } });
          console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (categoriesTitle) {
              asyncQTM.equal(categoriesTitle.length, 26, 'Article category error');
              categoriesTitle.forEach(function (ct, index) {
                asyncQTM.equal(typeof ct, 'object', 'data type error at ' + index + '. position');
                asyncQTM.equal(typeof ct.t, 'string', 'data type error at ' + index + '. position');
                asyncQTM.ok(ct.t.length >= 4, 'data length error at ' + index + '. position');
                start();
              });
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> map object include scalar(int)', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return { t: a.Category.Id } });
          console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (categoriesId) {
              asyncQTM.equal(categoriesId.length, 26, 'Article category error');
              categoriesId.forEach(function (ci, index) {
                asyncQTM.equal(typeof ci, 'object', 'data type error at ' + index + '. position');
                asyncQTM.equal(typeof ci.t, 'number', 'data type error at ' + index + '. position');
                asyncQTM.ok(ci.t > 0, 'data min value error at ' + index + '. position');
                asyncQTM.ok(ci.t < 6, 'data max value error at ' + index + '. position');
              });
              start();
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> map Entity_', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return a.Category; });
          console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 26, 'Result number error');
              results.forEach(function (r, index) {
                asyncQTM.ok(r instanceof $news.Types.Category, 'data type error at ' + index + '. position');
                asyncQTM.ok(r.Id > 0, 'category Id min value error at ' + index + '. position');
                asyncQTM.ok(r.Id < 6, 'category Id max value error at ' + index + '. position');
                asyncQTM.ok(r.Title.length >= 4, 'category title error at ' + index + '. position');
              });
              start();
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });
  
    /*FIX: odata need expand*/
    asyncQTM.test('Include: indirect -> map EntitySet', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return a.Tags; });
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 26, 'Result number error');
              results.forEach(function (r, index) {
                asyncQTM.ok(r instanceof Array, 'data type error at ' + index + '. position');
                asyncQTM.equal(r.length, 2, "tagconnection number faild");
                r.forEach(function (tc) {
                  asyncQTM.ok(tc instanceof $news.Types.TagConnection, 'data type error at ' + index + '. position');
                  asyncQTM.ok(tc.Id > 0, 'TagConnection Id min value error at ' + index + '. position');
                  asyncQTM.ok(tc.Id < 53, 'TagConnection Id max value error at ' + index + '. position');
                });
                start();
              });
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> map ComplexType', 19, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.UserProfiles.map(function (up) { return up.Location });
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 6, 'Result number error');
              results.forEach(function (r, index) {
                asyncQTM.ok(r instanceof $news.Types.Location, 'data type error at ' + index + '. position');
                asyncQTM.ok(r.Address.length > 7, 'Location address value error at ' + index + '. position');
                asyncQTM.ok(r.City.length > 4, 'Location city value error at ' + index + '. position');
              });
              start();
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> map object include Entity', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return { r: a.Category }; });
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 26, 'Result number error');
              results.forEach(function (r, index) {
                asyncQTM.equal(typeof r, 'object', 'data type error at ' + index + '. position');
                asyncQTM.ok(r.r instanceof $news.Types.Category, 'data type error at ' + index + '. position');
                asyncQTM.ok(r.r.Id > 0, 'category Id min value error at ' + index + '. position');
                asyncQTM.ok(r.r.Id < 6, 'category Id max value error at ' + index + '. position');
                asyncQTM.ok(r.r.Title.length >= 4, 'category title error at ' + index + '. position');
              });
              start();
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> map object include EntitySet', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }
      //     asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.map(function (a) { return { r: a.Tags }; });
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 26, 'Result number error');
              results.forEach(function (r, index) {
                asyncQTM.equal(typeof r, 'object', 'data type error at ' + index + '. position');
                asyncQTM.ok(r.r instanceof Array, 'data type error at ' + index + '. position');
                asyncQTM.equal(r.r.length, 2, 'TagConnection number error');
                r.r.forEach(function (tc, index) {
                  asyncQTM.ok(tc instanceof $news.Types.TagConnection, 'data type error at ' + index + '. position');
                  asyncQTM.ok(tc.Id > 0, 'TagConnection Id min value error at ' + index + '. position');
                  asyncQTM.ok(tc.Id < 53, 'TagConnection Id max value error at ' + index + '. position');
                  asyncQTM.ok(index < 2, 'TagConnection number error');
                });
              });
              start();
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> map object include ComplexType', 25, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.UserProfiles.map(function (up) { return { r: up.Location } });
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 6, 'Result number error');
              results.forEach(function (r, index) {
                asyncQTM.equal(typeof r, 'object', 'data type error at ' + index + '. position');
                asyncQTM.ok(r.r instanceof $news.Types.Location, 'data type error at ' + index + '. position');
                asyncQTM.ok(r.r.Address.length > 7, 'Location address value error at ' + index + '. position');
                asyncQTM.ok(r.r.City.length > 4, 'Location city value error at ' + index + '. position');
              });
              start();
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> filter scalar(string)', 46, function (start) {
      var refDate = new Date();
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.filter(function (a) { return a.Category.Title == 'Sport' });
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 5, 'Article category error');
              var promises = []
              results.forEach(function (r, index) {
                promises.push(asyncQTM.ok(r instanceof $news.Types.Article, 'data type error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Title.length > 5, 'Title length error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Lead.length >= 5, 'Lead length error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Body.length >= 5, 'Body length error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.CreateDate instanceof Date, 'CreateDate data type error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.CreateDate >= refDate, 'CreateDate value error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Category === undefined, 'Category value error  at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Author === undefined, 'Author value error  at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Reviewer === undefined, 'Reviewer value error  at ' + index + '. position'));
              });
              Promise.all(promises).then(function () { start() });
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> filter scalar(int)', 91, function (start) {
      var refDate = new Date();
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          db.Categories.skip(2).first(null, null, function (cat) {
            var q = db.Articles.filter(function (a) { return a.Category.Id > this.id }, { id: cat.Id });
            //console.log('q: ', q.toTraceString());
            q.toArray({
              success: function (results) {
                asyncQTM.equal(results.length, 10, 'Article category error');
                var promises = [];
                results.forEach(function (r, index) {
                  promises.push(asyncQTM.ok(r instanceof $news.Types.Article, 'data type error at ' + index + '. position'));
                  promises.push(asyncQTM.ok(r.Title.length > 5, 'Title length error at ' + index + '. position'));
                  promises.push(asyncQTM.ok(r.Lead.length > 5, 'Lead length error at ' + index + '. position'));
                  promises.push(asyncQTM.ok(r.Body.length > 5, 'Body length error at ' + index + '. position'));
                  promises.push(asyncQTM.ok(r.CreateDate instanceof Date, 'CreateDate data type error at ' + index + '. position'));
                  promises.push(asyncQTM.ok(r.CreateDate >= refDate, 'CreateDate value error at ' + index + '. position'));
                  promises.push(asyncQTM.ok(r.Category === undefined, 'Category value error  at ' + index + '. position'));
                  promises.push(asyncQTM.ok(r.Author === undefined, 'Author value error  at ' + index + '. position'));
                  promises.push(asyncQTM.ok(r.Reviewer === undefined, 'Reviewer value error  at ' + index + '. position'));
                });

                Promise.all(promises).then(function () { start() });
              },
              error: function (error) {
                asyncQTM.ok(false, error);
                start();
              }
            });
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> filter ComplexType', 10, function (start) {
      var refDate = new Date(Date.parse("1976/02/01"));
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.UserProfiles.filter(function (up) { return up.Location.Zip == 1117 });
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 1, 'Article category error');
              var promises = [];
              results.forEach(function (r, index) {
                promises.push(asyncQTM.ok(r instanceof $news.Types.UserProfile, 'data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.FullName, 'Full Name', 'Title length error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Birthday instanceof Date, 'CreateDate data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Birthday.valueOf(), refDate.valueOf(), 'CreateDate value error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Location instanceof $news.Types.Location, 'Category value error  at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Location.Zip, 1117, 'Location.Zip value error  at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Location.City, 'City2', 'Location.City value error  at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Location.Address, 'Address7', 'Location.Address value error  at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Location.Country, 'Country2', 'Location.Country value error  at ' + index + '. position'));
              });
              Promise.all(promises).then(function () { start() });
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: indirect -> filter scalar(string) ComplexType', 10, function (start) {
      var refDate = new Date(Date.parse("1979/05/01"));
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.UserProfiles.filter(function (up) { return up.FullName == 'Full Name2' });
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (results) {
              asyncQTM.equal(results.length, 1, 'Article category error');
              var promises = [];
              results.forEach(function (r, index) {
                promises.push(asyncQTM.ok(r instanceof $news.Types.UserProfile, 'data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.FullName, 'Full Name2', 'FullName value error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Birthday instanceof Date, 'Birthday data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Birthday.valueOf(), refDate.valueOf(), 'Birthday value error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.Location instanceof $news.Types.Location, 'Location data type at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Location.Zip, 3451, 'Location.Zip value error  at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Location.City, 'City5', 'Location.City value error  at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Location.Address, 'Address0', 'Location.Address value error  at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Location.Country, 'Country5', 'Location.Country value error  at ' + index + '. position'));
              });
              Promise.all(promises).then(function () { start() });
            },
            error: function (error) {
              start();
              asyncQTM.ok(false, error);
            }
          });
        });
      });
    });

    asyncQTM.test('Include: mixed -> filter, map, include', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      var refDate = new Date(Date.parse("1979/05/01"));
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
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
              asyncQTM.equal(results.length, 1, 'Article category error');
              var promises = [];
              results.forEach(function (r, index) {
                promises.push(asyncQTM.ok(r instanceof Object, 'data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.name, 'Article25', 'name value error at ' + index + '. position'));

                promises.push(asyncQTM.ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position'));
                //p1 property
                promises.push(asyncQTM.ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position'));
                //p2 property
                promises.push(asyncQTM.ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position'));
                promises.push(asyncQTM.equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position'));
                //p2.Tags
                promises.push(asyncQTM.ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position'));
                r.People.p2.tags.forEach(function (t) {
                  promises.push(asyncQTM.ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position'));
                });
                //p2.adr
                promises.push(asyncQTM.equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position'));
                //p3.loc
                promises.push(asyncQTM.ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position'));
                promises.push(asyncQTM.ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position'));
                //r.Cat
                promises.push(asyncQTM.equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position'));
                //r.Articles
                promises.push(asyncQTM.ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position'));
                r.Articles.forEach(function (a) {
                  promises.push(asyncQTM.ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position'));
                  promises.push(asyncQTM.ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position'));
                });
              });
              Promise.all(promises).then(function () { start() });
            },
            error: function (error) {
              start();
              asyncQTM.ok(false, error);
            }
          });
        });
      });
    });

    asyncQTM.test('Include: mixed -> filter, map (without complex type property), include', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      var refDate = new Date(Date.parse("1979/05/01"));
      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start();
        $news.Types.NewsContext.generateTestData(db, function () {
          start();
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
              start();
              asyncQTM.equal(results.length, 1, 'Article category error');
              results.forEach(function (r, index) {
                asyncQTM.ok(r instanceof Object, 'data type error at ' + index + '. position');
                asyncQTM.equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                asyncQTM.equal(r.name, 'Article25', 'name value error at ' + index + '. position');

                asyncQTM.ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                //p1 property
                asyncQTM.ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                asyncQTM.equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                asyncQTM.equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                asyncQTM.ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                asyncQTM.equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                asyncQTM.ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                asyncQTM.equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                //p2 property
                asyncQTM.ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                asyncQTM.equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                asyncQTM.equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position');
                asyncQTM.equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                asyncQTM.equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position');
                //p2.Tags
                asyncQTM.ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                asyncQTM.equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                r.People.p2.tags.forEach(function (t) {
                  asyncQTM.ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                });
                //p2.adr
                //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                //p3.loc
                asyncQTM.ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                asyncQTM.ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                asyncQTM.equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                //r.Cat
                asyncQTM.equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                asyncQTM.equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position');
                //r.Articles
                asyncQTM.ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                asyncQTM.equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                r.Articles.forEach(function (a) {
                  asyncQTM.ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                  asyncQTM.ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                });
              });
            },
            error: function (error) {
              start();
              asyncQTM.ok(false, error);
            }
          });
        });
      });
    });

    asyncQTM.test('Include: many mixed -> filter, map (without complex type property), include', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      var refDate = new Date(Date.parse("1979/05/01"));
      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start();
        $news.Types.NewsContext.generateTestData(db, function () {
          start();
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
              start();
              asyncQTM.equal(results.length, 2, 'Article category error');

              var r = results[0];
              var index = 0;

              asyncQTM.ok(r instanceof Object, 'data type error at ' + index + '. position');
              asyncQTM.equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
              asyncQTM.equal(r.name, 'Article5', 'name value error at ' + index + '. position');

              asyncQTM.ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
              //p1 property
              asyncQTM.ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
              asyncQTM.equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
              asyncQTM.ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
              asyncQTM.ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
              //p2 property
              asyncQTM.ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
              asyncQTM.equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p2.name, 'Usr2', 'r.People.p2.name value error at ' + index + '. position');
              asyncQTM.equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p2.bio, 'Bio2', 'r.People.p2.bio value error at ' + index + '. position');
              //p2.Tags
              asyncQTM.ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
              asyncQTM.equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
              r.People.p2.tags.forEach(function (t) {
                asyncQTM.ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
              });
              //p2.adr
              //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
              //p3.loc
              asyncQTM.ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
              asyncQTM.ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
              //r.Cat
              asyncQTM.equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
              asyncQTM.equal(r.Cat, 'Sport', 'r.Cat value error at ' + index + '. position');
              //r.Articles
              asyncQTM.ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
              asyncQTM.equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
              r.Articles.forEach(function (a) {
                asyncQTM.ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                asyncQTM.ok(['Article1', 'Article2', 'Article5', 'Article3', 'Article4'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
              });

              r = results[1];
              index = 1;

              asyncQTM.ok(r instanceof Object, 'data type error at ' + index + '. position');
              asyncQTM.equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
              asyncQTM.equal(r.name, 'Article25', 'name value error at ' + index + '. position');

              asyncQTM.ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
              //p1 property
              asyncQTM.ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
              asyncQTM.equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
              asyncQTM.ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
              asyncQTM.ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
              //p2 property
              asyncQTM.ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
              asyncQTM.equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position');
              asyncQTM.equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position');
              //p2.Tags
              asyncQTM.ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
              asyncQTM.equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
              r.People.p2.tags.forEach(function (t) {
                asyncQTM.ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
              });
              //p2.adr
              //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
              //p3.loc
              asyncQTM.ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
              asyncQTM.ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
              asyncQTM.equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
              //r.Cat
              asyncQTM.equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
              asyncQTM.equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position');
              //r.Articles
              asyncQTM.ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
              asyncQTM.equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
              r.Articles.forEach(function (a) {
                asyncQTM.ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                asyncQTM.ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
              });
            },
            error: function (error) {
              start();
              asyncQTM.ok(false, error);
            }
          });
        });
      });
    });

    asyncQTM.test('Include: direct -> Entity', 105, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.include('Category');
          q.toArray({
            success: function (result) {
              asyncQTM.equal(result.length, 26, 'Article category error');
              var promises = [];
              result.forEach(function (article, index) {
                promises.push(asyncQTM.ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position'));
                promises.push(asyncQTM.ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position'));
                promises.push(asyncQTM.ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. osition'));
                promises.push(asyncQTM.ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position'));
              });
              Promise.all(promises).then(function () { start(); });
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: direct -> EntitySet', 209, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.include('Tags');
          q.toArray({
            success: function (result) {
              asyncQTM.equal(result.length, 26, 'Article category error');
              var promises = [];
              result.forEach(function (article, index) {
                promises.push(asyncQTM.ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position'));
                promises.push(asyncQTM.ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position'));
                promises.push(asyncQTM.ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position'));
                article.Tags.forEach(function (tag) {
                  promises.push(asyncQTM.ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position'));
                  promises.push(asyncQTM.equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position'));
                });
              });
              Promise.all(promises).then(function () { start(); });
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: direct -> Entity EntitySet', 261, function (start) {
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
          var q = db.Articles.include('Category').include('Tags');
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (result) {
              asyncQTM.equal(result.length, 26, 'Article category error');
              var promises = [];
              result.forEach(function (article, index) {
                promises.push(asyncQTM.ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position'));
                promises.push(asyncQTM.ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position'));
                promises.push(asyncQTM.ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. position'));
                promises.push(asyncQTM.ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position'));
                promises.push(asyncQTM.ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position'));
                promises.push(asyncQTM.equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position'));
                article.Tags.forEach(function (tag) {
                  promises.push(asyncQTM.ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position'));
                  promises.push(asyncQTM.equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position'));
                });

              });
              Promise.all(promises).then(function () { start(); });
            },
            error: function (error) {
              asyncQTM.ok(false, error);
              start();
            }
          });
        });
      });
    });

    asyncQTM.test('Include: direct -> deep Entity', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start();
        $news.Types.NewsContext.generateTestData(db, function () {
          start();
          var q = db.Articles.include('Author.Profile');
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (result) {
              start();
              asyncQTM.equal(result.length, 26, 'Article category error');
              result.forEach(function (article, index) {
                asyncQTM.ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                asyncQTM.ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                asyncQTM.ok(article.Author instanceof $news.Types.User, 'article.Author data type error at ' + index + '. position');
                asyncQTM.ok(article.Author.LoginName.length >= 4, 'article.Author.LoginName length error at ' + index + '. position');
                asyncQTM.ok(article.Author.Profile instanceof $news.Types.UserProfile, 'article.Author.Profile type error at ' + index + '. position');
                asyncQTM.ok(article.Author.Profile.Bio.length > 2, 'article.Author.Profile.Bio length number error at ' + index + '. position');

                asyncQTM.ok(article.Author.Profile.Location instanceof $news.Types.Location, 'article.Author.Profile.Location type error at ' + index + '. position');
                asyncQTM.ok(article.Author.Profile.Location.Address.length > 2, 'article.Author.Profile.Location.Address length number error at ' + index + '. position');


              });
            },
            error: function (error) {
              start();
              asyncQTM.ok(false, error);
            }
          });
        });
      });
    });

    asyncQTM.test('Include: direct -> mixed deep Entity, EntitySet', 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported"); start(); return; }

      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start();
        $news.Types.NewsContext.generateTestData(db, function () {
          start();
          var q = db.Articles.include('Author.Profile').include('Category').include('Tags');
          //console.log('q: ', q.toTraceString());
          q.toArray({
            success: function (result) {
              start();
              asyncQTM.equal(result.length, 26, 'Article category error');
              result.forEach(function (article, index) {
                asyncQTM.ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                asyncQTM.ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                asyncQTM.ok(article.Author instanceof $news.Types.User, 'article.Author data type error at ' + index + '. position');
                asyncQTM.ok(article.Author.LoginName.length >= 4, 'article.Author.LoginName length error at ' + index + '. position');
                asyncQTM.ok(article.Author.Profile instanceof $news.Types.UserProfile, 'article.Author.Profile type error at ' + index + '. position');
                asyncQTM.ok(article.Author.Profile.Bio.length > 2, 'article.Author.Profile.Bio length number error at ' + index + '. position');

                asyncQTM.ok(article.Author.Profile.Location instanceof $news.Types.Location, 'article.Author.Profile.Location type error at ' + index + '. position');
                asyncQTM.ok(article.Author.Profile.Location.Address.length > 2, 'article.Author.Profile.Location.Address length number error at ' + index + '. position');

                asyncQTM.ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. position');
                asyncQTM.ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position');
                asyncQTM.ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position');
                asyncQTM.equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position');
                article.Tags.forEach(function (tag) {
                  asyncQTM.ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position');
                  asyncQTM.equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position');
                });
              });
            },
            error: function (error) {
              start();
              asyncQTM.ok(false, error);
            }
          });
        });
      });
    });

    /*asyncQTM.test('sqlite_performace_issue', 0, function (start) {
        asyncQTM.stop(1);
  
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
            start();
        }
  
        $news.context = new $news.Types.NewsContext({ name: "sqLite", databaseName: "emptyNewsReader", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
        $news.context.onReady(addTestData);
  
        console.log('\nstarting...');
    });*/

  });
};
