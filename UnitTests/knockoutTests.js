/// <reference path="../Scripts/knockout-2.1.0.js" />
/// <reference path="../NewsReaderContext.js" />
/// <reference path="../Modules/knockout.js" />

$(document).ready(function () {
	if (!$data.storageProviders.sqLite.SqLiteStorageProvider.isSupported) return;
    knockoutTests({ name: "sqLite", dataBaseName: 'knockoutTests', oDataServiceHost: "newsReader.svc", dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables });
});

function knockoutTests(providerConfig) {
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
        equal(koArticle instanceof $data.ObjectWrapper, true, 'Observable instance subclass of $data.ObjectWrapper failed');

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
        article.Tags = [new $news.Types.Tag({ Id: 1, Title: 'hello' })];
        deepEqual(article.Tags, koArticle.Tags(), 'array property change equal failed');
        equal(article.Tags[0].Id, koArticle.Tags()[0].Id, 'array property element ko change equal failed');
        equal(article.Tags[0].Id, 1, 'array property element ko change equal failed');
        koArticle.Tags([new $news.Types.Tag({ Id: 2, Title: 'hello2' })]);
        deepEqual(article.Tags, koArticle.Tags(), 'array property ko change equal failed');
        equal(article.Tags[0].Id, koArticle.Tags()[0].Id, 'array property element ko change equal failed');
        equal(article.Tags[0].Id, 2, 'array property element ko change equal failed');

        article.Tags.push(new $news.Types.Tag({ Id: 3, Title: 'hello3' }));
        deepEqual(article.Tags, koArticle.Tags(), 'array property push equal failed');
        equal(article.Tags.length, koArticle.Tags().length, 'array property length equal failed');

        equal(koArticle.Tags.push, undefined, "Array property is koObservalble instead of koObservableArray!")
        koArticle.Tags().push(new $news.Types.Tag({ Id: 4, Title: 'hello4' }));
        deepEqual(article.Tags, koArticle.Tags(), 'array property push equal failed');
        equal(article.Tags.length, koArticle.Tags().length, 'array property length equal failed');
    });

    test("knockout observable entity property changing jayData type", 5, function () {
        var article = new $news.Types.Article();
        var koArticle = article.asKoObservable();
        equal(article.Author, koArticle.Author(), 'type property equal failed');
        article.Author = new $news.Types.Tag({ Id: 1, Title: 'hello' });
        deepEqual(article.Author, koArticle.Author(), 'type property change equal failed');
        equal(article.Author.Id, koArticle.Author().Id, 'type property value ko change equal failed');
        koArticle.Author(new $news.Types.Tag({ Id: 2, Title: 'hello2' }));
        deepEqual(article.Author, koArticle.Author(), 'type property ko change equal failed');
        equal(article.Author.Id, koArticle.Author().Id, 'type property value ko change equal failed');

    });

    test("knockout observable result", 23, function () {
        stop(2);
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

                var result = ko.observable();
                db.Articles.toArray(result).then(function () {
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
                    
                });
            });
        });
    });
}