var providerConfig = { name: "oData", databaseName: 'T1', oDataServiceHost: "Services/emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables };
module("Storage model tests");
test('Filter_noFilter_orderby', function () {

    stop(2);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        window['ctx'] = db;
        console.dir(db._storageModel);

        var item1 = Container.createTestItem({
            Id: 1,
            User: Container.createUser({ LoginName: 'User1', Email: 'email1@test.com' }),
            Tags: [
                Container.createTag({ Title: 'apple' }),
                Container.createTag({ Title: 'pear' })]
        });
        db.TestTable.add(item1);
        db.saveChanges(function () {
            start(1);
            ok(true);
        });
    });
});