/// <reference path="../Scripts/kendo.all.js" />
/// <reference path="../NewsReaderContext.js" />
/// <reference path="../Modules/kendo.js" />

$(document).ready(function () {
    if (!$data.StorageProviderLoader.isSupported('sqLite')) return;
    kendoTests({ name: "sqLite", databaseName: 'kendoTests', oDataServiceHost: "Services/newsReader.svc", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
});

function kendoTests(providerConfig) {
    module("kendo Tests");

    test("kendo observable entity", 5/*11*/, function () {
        var article = new $news.Types.Article();
        equal(typeof article.asKendoObservable, 'function', 'Entity observable convert function failed');

        var kendoArticle = article.asKendoObservable();
        //equal(Container.isTypeRegistered('$news.Types.ObservableArticle'), true, 'Observable article exists failed');
        //ok(article === kendoArticle.innerInstance, 'Inner instance reference failed');
        //equal(kendoArticle instanceof $news.Types.ObservableArticle, true, 'Observable type failed');
        equal(kendoArticle instanceof $data.Entity, false, 'Observable instance not subclass of $data.Entity failed');
        equal(kendoArticle instanceof kendo.data.Model, true, 'Observable instance subclass of kendo.data.Model failed');
        //equal(kendoArticle instanceof $data.EntityWrapper, true, 'Observable instance subclass of $data.EntityWrapper failed');

        equal(kendoArticle._Id, undefined, "JITed property not exists 1");
        //kendoArticle.Id;
        //equal(typeof kendoArticle._Id.subscribe, 'function', "JITed property exists 1");

        equal(kendoArticle._Title, undefined, "JITed property not exists 2");
        //kendoArticle.Title();
        //equal(typeof kendoArticle._Title.subscribe, 'function', "JITed property exists 2");

    });
    test("asKendoDataSource", 1/*10*/, function () {

        var task = $data.define("TTask", {
            Todo: String,
            Completed: Boolean
        });

        var dataSourceOptions = {};

        ds = task.asKendoDataSource();

        var item = ds.add({ Todo: 'x' });
        console.log(item);
        ds.sync();
        stop(1);
        ds.bind("change", function (e) {
            if (e.action === "sync") {
                start(1);
                ok("ok");
            }
        });



    });
    test("asKendoModel", 10, function () {
        
        var Address = $data.define("Address", {
            City: String,
            Street: String
        });

        kendoAddressType = Address.asKendoModel();
        var kendoObservable = new kendoAddressType({ City: "BP" });
        ok(kendoObservable instanceof kendo.data.Model, "observable is kendo type");
        equal(kendoObservable.get("City"), "BP");

        var Person = $data.define("Person", {
            Name: String,
            Address: Address
        });
        
        var kendoPersonType = Person.asKendoModel();
        kendoPerson = new kendoPersonType();
        ok(!kendoPerson.Address, "complex type is not built");

        var Person2 = $data.define("Person2", {
            Name: String,
            Address: { type: Address, nullable: false }
        });
        var kendoPersonType2 = Person2.asKendoModel();
        kendoPerson2 = new kendoPersonType2();
        ok(kendoPerson2.Address, "complex type is built");
        ok(kendoPerson2.Address instanceof kendo.data.Model, "ct is kendo model type");
        var addressType = Address.asKendoModel();
        ok(kendoPerson2.Address instanceof addressType, "ct is kendoAddressType");

        p3 = new kendoPersonType2({ Address: { City: "BP", Street: "Homorod" } });
        ok(p3.Address instanceof addressType, "ct is kendoAddressType");

        equal(p3.get("Address.City"), "BP");

        var Customer = $data.define("Customer", {
            CompanyName: String,
            Contact: {type: Person, nullable: false }
        });

        kendoCustomer = Customer.asKendoModel();
        kC = new kendoCustomer({ CompanyName: "ABC", Contact: { Name: "Mr John", Address: { City: "NY", Street: "XX" } } });
        equal(kC.CompanyName, "ABC", "simple field initialized");
        kC.set("Contact.Address.City", "BP");
        equal(kC.Contact.Address.City, "BP", "nested complext type changed all the way");

        

        //var jayInstance = kC.innerInstance();
        //equal(jayInstance.changedProperties[0].name, "Contact", "complex prop change is delegate to root entity");


        //kC.save();

    });

    test("kendo observable entity property types", 5/*10*/, function () {
        stop(1);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.toArray(function (articles) {
                    start();

                    var article = articles[0];
                    var kendoArticle = article.asKendoObservable();


                    //equal(typeof kendoArticle.Id.subscribe, 'function', 'int property has observable value');
                    equal(article.Id, kendoArticle.get('Id'), 'int property equal failed');

                    //equal(typeof kendoArticle.Title.subscribe, 'function', 'string property has observable value');
                    equal(article.Title, kendoArticle.get('Title'), 'string property equal failed');

                    //equal(typeof kendoArticle.CreateDate.subscribe, 'function', 'dateTime property has observable value');
                    equal(article.CreateDate, kendoArticle.get('CreateDate'), 'dateTime property equal failed');

                    //equal(typeof kendoArticle.Author.subscribe, 'function', 'navigational property has observable value');
                    ok(article.Author === kendoArticle.get('Author'), 'navigational property equal failed');

                    //equal(typeof kendoArticle.Tags.subscribe, 'function', true, 'array property has observable value');
                    equal(article.Tags, kendoArticle.get('Tags'), 'array property equal failed');

                });
            });
        });
    });

    /*test("kendo observable entity property changing number", 3, function () {
        var article = new $news.Types.Article();
        var kendoArticle = article.asKendoObservable();

        equal(article.Id, kendoArticle.get('Id'), 'int property equal failed');
        article.Id = 5;
        equal(article.Id, kendoArticle.get('Id'), 'int property change equal failed');
        kendoArticle.set('Id', 7);
        equal(article.Id, kendoArticle.get('Id'), 'int property kendo change equal failed');
    });*/

    /*test("kendo observable entity property changing string", 3, function () {
        var article = new $news.Types.Article();
        var kendoArticle = article.asKendoObservable();
        equal(article.Title, kendoArticle.Title(), 'string property equal failed');
        article.Title = 'hello world';
        equal(article.Title, kendoArticle.Title(), 'string property change equal failed');
        kendoArticle.Title('hello jaydata');
        equal(article.Title, kendoArticle.Title(), 'string property kendo change equal failed');
    });*/

    test("kendo observable entity update", 8/*14*/, function () {
        var article = new $news.Types.Article({ Title: 'a', Body: 'b', Lead: 'c' });
        var kendoArticle = article.asKendoObservable();
        kendoArticle.set('Title', 'hello world');
        equal(article.Title, 'hello world', 'string property equal failed');
        equal(article.changedProperties.length, 1, 'changedProperties.length equal failed');
        equal(article.changedProperties[0].name, 'Title', 'changedProperty name equal failed');
        kendoArticle.set('Title', 'newTitle');
        equal(article.Title, 'newTitle', 'string property equal failed');
        equal(article.changedProperties.length, 1/*0*/, 'changedProperties.length equal failed');

        /*var article2 = new $news.Types.Article({ Title: 'newTitle', Body: 'b', Lead: 'c' });
        article.Title = 'a';
        article.Body = 'a';
        equal(article.changedProperties.length, 2, 'changedProperties.length equal failed');
        kendoArticle.updateEntity(article2);
        equal(article.Title, 'newTitle', 'string property equal failed');
        equal(article.changedProperties.length, 0, 'changedProperties.length equal failed');*/

        kendoArticle.set('Title', 'hello world');
        kendoArticle.set('Body', 'hello world');
        equal(article.changedProperties.length, 2, 'changedProperties.length equal failed');
        equal(article.changedProperties[0].name, 'Title', 'changedProperty1 name equal failed');
        equal(article.changedProperties[1].name, 'Body', 'changedProperty2 name equal failed');
        /*kendoArticle.updateEntity({ Title: 'newTitle' });
        equal(article.Title, 'newTitle', 'string property equal failed');
        equal(article.changedProperties.length, 1, 'changedProperties.length equal failed');
        equal(article.changedProperties[0].name, 'Body', 'changedProperty0 name equal failed');*/
    });

    test("kendo observable entity property changing datetime", 3, function () {
        var article = new $news.Types.Article();
        var kendoArticle = article.asKendoObservable();
        equal(article.CreateDate, kendoArticle.get('CreateDate'), 'dateTime property equal failed');
        article.CreateDate = new Date();
        equal(article.CreateDate, kendoArticle.get('CreateDate'), 'dateTime property change equal failed');
        kendoArticle.set('CreateDate', new Date());
        equal(article.CreateDate, kendoArticle.get('CreateDate'), 'dateTime property kendo change equal failed');
    });

    test("kendo observable entity property changing array", 8/*12*/, function () {
        var article = new $news.Types.Article();
        var kendoArticle = article.asKendoObservable();
        equal(article.Tags, kendoArticle.get('Tags'), 'array property equal failed');
        article.Tags = [new $news.Types.TagConnection({ Id: 1, Title: 'hello' })];
        //deepEqual(article.Tags, kendoArticle.get('Tags'), 'array property change equal failed');
        equal(article.Tags[0].Id, kendoArticle.get('Tags')[0].Id, 'array property element kendo change equal failed');
        equal(article.Tags[0].Id, 1, 'array property element kendo change equal failed');
        kendoArticle.set('Tags', [new $news.Types.TagConnection({ Id: 2, Title: 'hello2' })]);
        //deepEqual(article.Tags, kendoArticle.get('Tags'), 'array property kendo change equal failed');
        equal(article.Tags[0].Id, kendoArticle.get('Tags')[0].Id, 'array property element kendo change equal failed');
        equal(article.Tags[0].Id, 2, 'array property element kendo change equal failed');

        article.Tags.push(new $news.Types.TagConnection({ Id: 3, Title: 'hello3' }));
        //deepEqual(article.Tags, kendoArticle.get('Tags'), 'array property push equal failed');
        equal(article.Tags.length, 2, 'array property length equal failed');
        //equal(article.Tags.length, kendoArticle.get('Tags').length, 'array property length equal failed');

        notEqual(kendoArticle.Tags.push, undefined, "Array property is kendoObservalble instead of kendoObservableArray!")
        kendoArticle.Tags.push(new $news.Types.TagConnection({ Id: 4, Title: 'hello4' }));
        //deepEqual(article.Tags, kendoArticle.get('Tags'), 'array property push equal failed');
        equal(article.Tags.length, kendoArticle.get('Tags').length, 'array property length equal failed');
    });

    test("kendo observable entity property changing jayData type", 3/*5*/, function () {
        var article = new $news.Types.Article();
        var kendoArticle = article.asKendoObservable();
        equal(article.Author, kendoArticle.get('Author'), 'type property equal failed');
        article.Author = new $news.Types.User({ Id: 1, Title: 'hello' });
        //deepEqual(article.Author, kendoArticle.Author(), 'type property change equal failed');
        equal(article.Author.Id, kendoArticle.get('Author').Id, 'type property value kendo change equal failed');
        kendoArticle.set('Author', new $news.Types.User({ Id: 2, Title: 'hello2' }));
        //deepEqual(article.Author, kendoArticle.Author(), 'type property kendo change equal failed');
        equal(article.Author.Id, kendoArticle.get('Author').Id, 'type property value kendo change equal failed');

    });

    /*test("kendo observable result", 23, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var length = 0;
                var resultArray = kendo.observable([5, 6, 7]);
                db.Articles.toArray(resultArray).then(function () {
                    start();

                    notEqual(resultArray()[0], 5, 'Result array clear failed');
                    length = resultArray().length;

                    var kendoArticle = resultArray()[0];
                    var article = kendoArticle.innerInstance;


                    equal(typeof kendoArticle.Id.subscribe, 'function', 'int property has observable value');
                    equal(article.Id, kendoArticle.Id(), 'int property equal failed');

                    equal(typeof kendoArticle.Title.subscribe, 'function', 'string property has observable value');
                    equal(article.Title, kendoArticle.Title(), 'string property equal failed');

                    equal(typeof kendoArticle.CreateDate.subscribe, 'function', 'dateTime property has observable value');
                    equal(article.CreateDate, kendoArticle.CreateDate(), 'dateTime property equal failed');

                    equal(typeof kendoArticle.Author.subscribe, 'function', 'navigational property has observable value');
                    ok(article.Author === kendoArticle.Author(), 'navigational property equal failed');

                    equal(typeof kendoArticle.Tags.subscribe, 'function', true, 'array property has observable value');
                    equal(article.Tags, kendoArticle.Tags(), 'array property equal failed');

                    db.Articles.toArray(resultArray).then(function () {
                        start();

                        equal(resultArray().length, length, 'Result array clear failed');
                    });

                });

                var result = kendo.observableArray();
                db.Articles.toArray(result).then(function () {
                    start();

                    notEqual(result()[0], 5, 'Result array clear failed');
                    length = result().length;

                    var kendoArticle = result()[0];
                    var article = kendoArticle.innerInstance;


                    equal(typeof kendoArticle.Id.subscribe, 'function', 'int property has observable value');
                    equal(article.Id, kendoArticle.Id(), 'int property equal failed');

                    equal(typeof kendoArticle.Title.subscribe, 'function', 'string property has observable value');
                    equal(article.Title, kendoArticle.Title(), 'string property equal failed');

                    equal(typeof kendoArticle.CreateDate.subscribe, 'function', 'dateTime property has observable value');
                    equal(article.CreateDate, kendoArticle.CreateDate(), 'dateTime property equal failed');

                    equal(typeof kendoArticle.Author.subscribe, 'function', 'navigational property has observable value');
                    ok(article.Author === kendoArticle.Author(), 'navigational property equal failed');

                    equal(typeof kendoArticle.Tags.subscribe, 'function', true, 'array property has observable value');
                    equal(article.Tags, kendoArticle.Tags(), 'array property equal failed');

                });
            });
        });
    });


    test("kendo observable query Int", 3, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var id = kendo.observable(1);
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

    test("kendo observable query string", 3, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var title = kendo.observable('Article1');
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

    test("kendo observable query date", 5, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var state = {};
                var dateValue = new Date();
                dateValue.setHours(dateValue.getHours() - 1);
                var date = kendo.observable(dateValue);
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

    test("kendo observable query take", 3, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var top = kendo.observable(5);
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

    test("kendo observable query multiple same observable fire once", 3, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var id = kendo.observable(1);
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

    test("kendo observable query Boolean expression", 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start();
                var title = kendo.observable("-");
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

    test("kendo observable query Boolean expression with empty string", 2, function () {
        stop(3);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {
                start();
                var title = kendo.observable("");
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

    test("kendo observable query Attach and save", 1, function () {
        stop(2);
        (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
            $news.Types.NewsContext.generateTestData(db, function () {

                var fired = 2;
                var result = kendo.observableArray();
                var id = kendo.observable(1);
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
    });*/
}
