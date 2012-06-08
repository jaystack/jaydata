$(document).ready(function () {
    //ModelBinderTests({ name: "sqLite", databaseName: 'ModelBinderTest', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_Web_SQL');
    //ModelBinderTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_oData');

    EntityContextTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "Services/emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_oData');
    T3({ name: "oData", databaseName: 'T1', oDataServiceHost: "Services/emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_oData');
    T3_oDataV3({ name: "oData", databaseName: 'T1', oDataServiceHost: "Services/emptyNewsReaderV3.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_oData');

    if ($data.storageProviders.sqLite.SqLiteStorageProvider.isSupported) {
		EntityContextTests({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_Web_SQL');
		T3({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_Web_SQL');
	}
});