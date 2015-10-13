/// <reference path="../Scripts/knockout-2.1.0.js" />
/// <reference path="../NewsReaderContext.js" />
/// <reference path="../Modules/knockout.js" />

$(document).ready(function () {
    if (!$data.StorageProviderLoader.isSupported('sqLite')) return;
    knockoutTests({ name: "sqLite", databaseName: 'knockoutTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
});

function knockoutTests(providerConfig) {
    //return;
    module("knockout Tests");

    test("knockout observable entity", 11, function () {
        var article = new $news.Types.Article();
        stop(1);
        equal(Container.isTypeRegistered('$news.Types.ObservableArticle'), false, 'Observable article not exists failed');
        start();
        equal(typeof article.asKoObservable, 'function', 'Entity observable convert function failed');

        var koArticle = article.asKoObservable();
        equal(Container.isTypeRegistered('$news.Types.ObservableArticle'), true, 'Observable article exists failed');
        ok(article === koArticle.innerInstance, 'Inner instance reference failed');
        equal(koArticle instanceof $news.Types.ObservableArticle, true, 'Observable type failed');
        equal(koArticle instanceof $data.Entity, false, 'Observable instance not subclass of $data.Entity failed');
        equal(koArticle instanceof $data.EntityWrapper, true, 'Observable instance subclass of $data.EntityWrapper failed');

        equal(koArticle._Id, undefined, "JITed property not exists 1");
        koArticle.Id;
        equal(typeof koArticle._Id.subscribe, 'function', "JITed property exists 1");

        equal(koArticle._Title, undefined, "JITed property not exists 2");
        koArticle.Title();
        equal(typeof koArticle._Title.subscribe, 'function', "JITed property exists 2");

    });

    test("knockout observable entity property types", 10, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.toArray(function (articles) {
                    start();

                    var article = articles[0];
                    var koArticle = article.asKoObservable();


                    equal(typeof koArticle.Id.subscribe, 'function', 'int property has observable value');
                    equal(article.Id, koArticle.Id(), 'int property equal failed');

                    equal(typeof koArticle.Title.subscribe, 'function', 'string property has observable value');
                    equal(article.Title, koArticle.Title(), 'string property equal failed');

                    equal(typeof koArticle.CreateDate.subscribe, 'function', 'dateTime property has observable value');
                    equal(article.CreateDate, koArticle.CreateDate(), 'dateTime property equal failed');

                    equal(typeof koArticle.Author.subscribe, 'function', 'navigational property has observable value');
                    ok(article.Author === koArticle.Author(), 'navigational property equal failed');

                    equal(typeof koArticle.Tags.subscribe, 'function', true, 'array property has observable value');
                    equal(article.Tags, koArticle.Tags(), 'array property equal failed');

                });
            });
        });
    });

    test("knockout observable entity property changing number", 3, function () {
        var article = new $news.Types.Article();
        var koArticle = article.asKoObservable();

        equal(article.Id, koArticle.Id(), 'int property equal failed');
        article.Id = 5;
        equal(article.Id, koArticle.Id(), 'int property change equal failed');
        koArticle.Id(7);
        equal(article.Id, koArticle.Id(), 'int property ko change equal failed');
    });

    test("knockout observable entity property changing string", 3, function () {
        var article = new $news.Types.Article();
        var koArticle = article.asKoObservable();
        equal(article.Title, koArticle.Title(), 'string property equal failed');
        article.Title = 'hello world';
        equal(article.Title, koArticle.Title(), 'string property change equal failed');
        koArticle.Title('hello jaydata');
        equal(article.Title, koArticle.Title(), 'string property ko change equal failed');
    });

    test("knockout observable entity update", 14, function () {
        var article = new $news.Types.Article({ Title: 'a', Body: 'b', Lead: 'c' });
        var koArticle = article.asKoObservable();
        koArticle.Title('hello world');
        equal(article.Title, 'hello world', 'string property equal failed');
        equal(article.changedProperties.length, 1, 'changedProperties.length equal failed');
        equal(article.changedProperties[0].name, 'Title', 'changedProperty name equal failed');
        koArticle.updateEntity({ Title: 'newTitle' });
        equal(article.Title, 'newTitle', 'string property equal failed');
        equal(article.changedProperties.length, 0, 'changedProperties.length equal failed');

        var article2 = new $news.Types.Article({ Title: 'newTitle', Body: 'b', Lead: 'c' });
        article.Title = 'a';
        article.Body = 'a';
        equal(article.changedProperties.length, 2, 'changedProperties.length equal failed');
        koArticle.updateEntity(article2);
        equal(article.Title, 'newTitle', 'string property equal failed');
        equal(article.changedProperties.length, 0, 'changedProperties.length equal failed');

        koArticle.Title('hello world');
        koArticle.Body('hello world');
        equal(article.changedProperties.length, 2, 'changedProperties.length equal failed');
        equal(article.changedProperties[0].name, 'Title', 'changedProperty1 name equal failed');
        equal(article.changedProperties[1].name, 'Body', 'changedProperty2 name equal failed');
        koArticle.updateEntity({ Title: 'newTitle' });
        equal(article.Title, 'newTitle', 'string property equal failed');
        equal(article.changedProperties.length, 1, 'changedProperties.length equal failed');
        equal(article.changedProperties[0].name, 'Body', 'changedProperty0 name equal failed');
    });

    test("knockout observable entity property changing datetime", 3, function () {
        var article = new $news.Types.Article();
        var koArticle = article.asKoObservable();
        equal(article.CreateDate, koArticle.CreateDate(), 'dateTime property equal failed');
        article.CreateDate = new Date();
        equal(article.CreateDate, koArticle.CreateDate(), 'dateTime property change equal failed');
        koArticle.CreateDate(new Date());
        equal(article.CreateDate, koArticle.CreateDate(), 'dateTime property ko change equal failed');
    });

    test("knockout observable entity property changing array", 12, function () {
        var article = new $news.Types.Article();
        var koArticle = article.asKoObservable();
        equal(article.Tags, koArticle.Tags(), 'array property equal failed');
        article.Tags = [new $news.Types.TagConnection({ Id: 1 })];
        deepEqual(article.Tags, koArticle.Tags(), 'array property change equal failed');
        equal(article.Tags[0].Id, koArticle.Tags()[0].Id, 'array property element ko change equal failed');
        equal(article.Tags[0].Id, 1, 'array property element ko change equal failed');
        koArticle.Tags([new $news.Types.TagConnection({ Id: 2, Title: 'hello2' })]);
        deepEqual(article.Tags, koArticle.Tags(), 'array property ko change equal failed');
        equal(article.Tags[0].Id, koArticle.Tags()[0].Id, 'array property element ko change equal failed');
        equal(article.Tags[0].Id, 2, 'array property element ko change equal failed');

        article.Tags.push(new $news.Types.TagConnection({ Id: 3, Title: 'hello3' }));
        deepEqual(article.Tags, koArticle.Tags(), 'array property push equal failed');
        equal(article.Tags.length, koArticle.Tags().length, 'array property length equal failed');

        equal(koArticle.Tags.push, undefined, "Array property is koObservalble instead of koObservableArray!")
        koArticle.Tags().push(new $news.Types.TagConnection({ Id: 4, Title: 'hello4' }));
        deepEqual(article.Tags, koArticle.Tags(), 'array property push equal failed');
        equal(article.Tags.length, koArticle.Tags().length, 'array property length equal failed');
    });

    test("knockout observable entity property changing jayData type", 5, function () {
        var article = new $news.Types.Article();
        var koArticle = article.asKoObservable();
        equal(article.Author, koArticle.Author(), 'type property equal failed');
        article.Author = new $news.Types.User({ Id: 1, Title: 'hello' });
        deepEqual(article.Author, koArticle.Author(), 'type property change equal failed');
        equal(article.Author.Id, koArticle.Author().Id, 'type property value ko change equal failed');
        koArticle.Author(new $news.Types.User({ Id: 2, Title: 'hello2' }));
        deepEqual(article.Author, koArticle.Author(), 'type property ko change equal failed');
        equal(article.Author.Id, koArticle.Author().Id, 'type property value ko change equal failed');

    });

    test("knockout observable result", 23, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var length = 0;
                var resultArray = ko.observableArray([5, 6, 7]);
                db.Articles.toArray(resultArray).then(function () {
                    start();

                    notEqual(resultArray()[0], 5, 'Result array clear failed');
                    length = resultArray().length;

                    var koArticle = resultArray()[0];
                    var article = koArticle.innerInstance;


                    equal(typeof koArticle.Id.subscribe, 'function', 'int property has observable value');
                    equal(article.Id, koArticle.Id(), 'int property equal failed');

                    equal(typeof koArticle.Title.subscribe, 'function', 'string property has observable value');
                    equal(article.Title, koArticle.Title(), 'string property equal failed');

                    equal(typeof koArticle.CreateDate.subscribe, 'function', 'dateTime property has observable value');
                    equal(article.CreateDate, koArticle.CreateDate(), 'dateTime property equal failed');

                    equal(typeof koArticle.Author.subscribe, 'function', 'navigational property has observable value');
                    ok(article.Author === koArticle.Author(), 'navigational property equal failed');

                    equal(typeof koArticle.Tags.subscribe, 'function', true, 'array property has observable value');
                    equal(article.Tags, koArticle.Tags(), 'array property equal failed');

                    db.Articles.toArray(resultArray).then(function () {
                        start();

                        equal(resultArray().length, length, 'Result array clear failed');
                    });

                });

                var result = ko.observableArray();
                db.Articles.toArray(result).then(function () {
                    start();

                    notEqual(result()[0], 5, 'Result array clear failed');
                    length = result().length;

                    var koArticle = result()[0];
                    var article = koArticle.innerInstance;


                    equal(typeof koArticle.Id.subscribe, 'function', 'int property has observable value');
                    equal(article.Id, koArticle.Id(), 'int property equal failed');

                    equal(typeof koArticle.Title.subscribe, 'function', 'string property has observable value');
                    equal(article.Title, koArticle.Title(), 'string property equal failed');

                    equal(typeof koArticle.CreateDate.subscribe, 'function', 'dateTime property has observable value');
                    equal(article.CreateDate, koArticle.CreateDate(), 'dateTime property equal failed');

                    equal(typeof koArticle.Author.subscribe, 'function', 'navigational property has observable value');
                    ok(article.Author === koArticle.Author(), 'navigational property equal failed');

                    equal(typeof koArticle.Tags.subscribe, 'function', true, 'array property has observable value');
                    equal(article.Tags, koArticle.Tags(), 'array property equal failed');

                });
            });
        });
    });


    test("knockout observable query Int", 3, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var id = ko.observable(1);
                var res = db.Articles.filter(function (article) { return article.Id == this.Id }, { Id: id }).toArray(function (r) {
                    fired--;
                    start();
                    ok(true, "logic fired failed");
                });

                res.then(function () {
                    ok(true, "then fired one time failed");
                });

                id(2);


            });
        });
    });

    test("knockout observable query string", 3, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var title = ko.observable('Article1');
                var res = db.Articles.filter(function (article) { return article.Title == this.Title }, { Title: title }).toArray(function (r) {
                    fired--;
                    start();
                    ok(true, "logic fired failed");
                });

                res.then(function () {
                    ok(true, "then fired one time failed");
                });

                title('Article2');


            });
        });
    });

    test("knockout observable query date", 5, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var state = {};
                var dateValue = new Date();
                dateValue.setHours(dateValue.getHours() - 1);
                var date = ko.observable(dateValue);
                var res = db.Articles.filter(function (article) { return article.CreateDate > this.CreateDate }, { CreateDate: date }).toArray(function (r) {
                    fired--;
                    start();
                    ok(true, "logic fired failed");

                    if (r.length in state) {
                        ok(false, 'result length equal with last failed');
                    } else {
                        ok(true, 'result length equal with last failed');
                        state[r.length] = true;
                    }
                });

                res.then(function () {
                    ok(true, "then fired one time failed");
                });

                var dateValue2 = new Date();
                dateValue2.setHours(dateValue2.getHours() + 1);
                date(dateValue2);


            });
        });
    });

    test("knockout observable query take", 3, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var top = ko.observable(5);
                var res = db.Articles.take(top).toArray(function (r) {
                    fired--;
                    start();
                    if (r.length === 5)
                        ok(r.length, 5, "result count failed");
                    else
                        ok(r.length, 2, "result count failed");
                });

                res.then(function () {
                    ok(true, "then fired one time failed");
                });

                top(2);


            });
        });
    });

    test("knockout observable query multiple same observable fire once", 3, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var id = ko.observable(1);
                var res = db.Articles.filter(function (article) { return article.Id == this.Id || article.Id > this.Id }, { Id: id }).toArray(function (r) {
                    start();
                    ok(true, "logic fired failed");
                });

                res.then(function () {
                    ok(true, "then fired one time failed");
                });

                id(2);


            });
        });
    });

    test("knockout observable query Boolean expression", 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start();
                var title = ko.observable("-");
                db.Articles.filter(function (article) { return this.Title == "-" || article.Title == this.Title }, { Title: title })
                    .toArray(function (result) {
                        //run two times
                        start();
                        if (title() === "-") {
                            ok(result.length > 1, 'many result failed');
                            title('Article1');
                        } else {
                            ok(result.length == 1, 'single result failed');
                        }
                    })

            });
        });
    });

    test("knockout observable query Boolean expression with empty string", 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start();
                var title = ko.observable("");
                db.Articles.filter(function (article) { return this.Title == "" || article.Title == this.Title }, { Title: title })
                    .toArray(function (result) {
                        //run two times
                        start();
                        if (title() === "") {
                            ok(result.length > 1, 'many result failed');
                            title('Article1');
                        } else {
                            ok(result.length == 1, 'single result failed');
                        }
                    })

            });
        });
    });

    test("knockout observable query Attach and save", 1, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var result = ko.observableArray();
                var id = ko.observable(1);
                var res = db.Articles.filter(function (article) { return article.Id == this.Id }, { Id: id }).toArray(result);
                res.then(function () {
                    start();

                    var article = result()[0];
                    db.Articles.attach(article);

                    article.Title('ModArticle');

                    db.saveChanges(function () {

                        var res = db.Articles.filter(function (article) { return article.Id == this.Id }, { Id: id }).toArray(result);
                        res.then(function () {
                            start();
                            var article = result()[0];

                            equal(article.Title(), "ModArticle", 'property change failed');

                        });

                    })

                });


            });
        });
    });
}