var providerConfig = { name: "oData", databaseName: 'T1', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables };
module("Storage model tests");
test('Filter_noFilter_orderby', function () {

    stop(2);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        window['ctx'] = db;
        console.dir(db._storageModel);

        var usr1 = Container.createUser({ LoginName: 'User1', Email: 'email1@test.com' });
        var usr2 = Container.createUser({ LoginName: 'User1', Email: 'email1@test.com' });
        var apple = Container.createTag({ Title: 'apple' });
        var pear = Container.createTag({ Title: 'pear' });
        var banana = Container.createTag({ Title: 'banana' });
        var item1 = Container.createTestItem({ Id: 1, User: usr1, Tags: [apple, pear] });
        var item2 = Container.createTestItem({ Id: 3, User: usr1, Tags: [banana, pear] });
        db.TestTable.add(item1);
        db.TestTable.add(item2);
        db.saveChanges(function () {
            start(1);
            ok(true);
        });
    });
});