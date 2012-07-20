$(document).ready(function () {
    //ModelBinderTests({ name: "sqLite", databaseName: 'ModelBinderTest', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
    //ModelBinderTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');

    EntityContextTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "Services/emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');
    T3({ name: "oData", databaseName: 'T1', oDataServiceHost: "Services/emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');
    T3_oDataV3({ name: "oData", databaseName: 'T1', maxDataServiceVersion: '3.0', oDataServiceHost: "Services/emptyNewsReaderV3.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');

    if ($data.StorageProviderLoader.isSupported('sqLite')) {
		EntityContextTests({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
		T3({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
	}
});