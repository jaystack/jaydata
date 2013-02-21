$(document).ready(function () {
    //ModelBinderTests({ name: "sqLite", databaseName: 'ModelBinderTest', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
    //ModelBinderTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');

    EntityContextTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "Services/emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');
    T3({ name: "oData", databaseName: 'T1', oDataServiceHost: "Services/emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');
    T3_oDataV3({ name: "oData", databaseName: 'T1', maxDataServiceVersion: '3.0', oDataServiceHost: "Services/emptyNewsReaderV3.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');


    if ($data.StorageProviderLoader.isSupported('sqLite')) {
        TransactionTests({ name: "sqLite", databaseName: 'transactionTests', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
		EntityContextTests({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
		T3({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');

		GeoTests({ name: "sqLite", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
    }

    if ($data.StorageProviderLoader.isSupported('indexedDb')) {
        TransactionTests({ name: "indexedDb", databaseName: 'transactionTests', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_indexedDb');
        GeoTests({ name: "indexedDb", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_indexedDb',
            function (context, start) {
                context.storageProvider.db.close();
                start();
            }
        );
    }

    GeoTests({ name: "InMemory", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_InMemory');
    GeoTests({ name: "LocalStore", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_LocalStore');
    GeoTestsFuncCompile({ name: "oData", maxDataServiceVersion: '3.0', oDataServiceHost: "/api" }, '_oData');
});