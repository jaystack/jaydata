import mock$data from '../core.js';
import $data from 'jaydata/core';
import oData from '../../src/Types/StorageProviders/oData'
import { expect } from 'chai';
import { asyncQTM } from './scripts/qunitToMocha.js';
$data.setModelContainer(global);
import newsReaderContext from './scripts/NewsReaderContext.js';

$data.defaults.OData.withReferenceMethods = true;

function EntityContextTests(providerConfig, msg) {
  msg = msg || '';

  describe(msg, function() {
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
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported");start(); return; }
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

                      for (var i = 0; i < 2; i++) {
                          asyncQTM.ok(res.indexOf(typedRes[i].Id >= 0), "key '" + typedRes[i].Id + "' in result");
                      }


                      start();
                  });
              });
          });
      });

  });

  asyncQTM.test("Guid key delete", 1, function (start) {
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported");start(); return; }
      

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

      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported");start(); return; }
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
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported");start();return; }
      if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
      asyncQTM.stop(3);
      (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
          start(1);
          $news.Types.NewsContext.generateTestData(db, function () {
              start(1);
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
                  start(1);
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

                      db.Articles.include('Category').filter('it.Id == id', {id: item.Id}).toArray(function (items2) {
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

                      db.Articles.include('Category').filter('it.Id == id', {id: item.Id}).toArray(function (items2) {
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
              db.Articles.orderBy('it.Id').toArray(function(r){
                  var a1 = new db.Articles.elementType({ Title: '123', Lead: 'asd', CreateDate: null });
                  db.Articles.add(a1);
                  db.saveChanges({
                      success: function () {
                          db.Articles.filter('it.Title === "123" || it.Id === this.id', {id: r[0].Id}).toArray(function (res) {
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
      if (providerConfig.name == "sqLite") { asyncQTM.ok(true, "Not supported");start(); return; }
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
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported");start(); return; }
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
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported");start(); return; }
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
      if (providerConfig.name == "oData") { asyncQTM.ok(true, "Not supported");start(); return; }

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
          start(1);
      }

      $news.context = new $news.Types.NewsContext({ name: "sqLite", databaseName: "emptyNewsReader", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
      $news.context.onReady(addTestData);

      console.log('\nstarting...');
  });*/
  
  });
};


EntityContextTests(
  {
    name: 'oData',
    oDataServiceHost: "http://localhost:9000/odata",
    serviceUrl: 'http://localhost:9000/odata',
    dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables
  },
  'oDataV4'
  );