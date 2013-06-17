$(document).ready(function () {
    //ModelBinderTests({ name: "sqLite", databaseName: 'ModelBinderTest', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
    //ModelBinderTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');


    T4_CrossProviderTests();
    EntityContextTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');
    T3({ name: "oData", databaseName: 'T1', oDataServiceHost: "/Services/emptyNewsReader.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');
    T3_oDataV3({ name: "oData", databaseName: 'T1', maxDataServiceVersion: '3.0', oDataServiceHost: "/Services/emptyNewsReaderV3.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');

    //T3 tests in V3 service
    EntityContextTests({ name: "oData", databaseName: 'T1', maxDataServiceVersion: '3.0', oDataServiceHost: "/Services/emptyNewsReaderV3.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oDataV3');
    T3({ name: "oData", databaseName: 'T1', maxDataServiceVersion: '3.0', oDataServiceHost: "/Services/emptyNewsReaderV3.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oDataV3');
    T3_oDataV3({ name: "oData", databaseName: 'T1', maxDataServiceVersion: '3.0', oDataServiceHost: "/Services/emptyNewsReaderV3.svc", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oDataV3');
    T3WebapiBugfix({ name: "oData", databaseName: 'T1', maxDataServiceVersion: '3.0', oDataServiceHost: "/odata", serviceUrl: '/Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oDataV3');

    if ($data.StorageProviderLoader.isSupported('sqLite')) {
		EntityContextTests({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
		T3({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');

		GeoTests({ name: "sqLite", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
		GuidTests({ name: "sqLite", databaseName: 'GuidTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
		TypeTests({ name: 'sqLite', databaseName: 'TypeTests_T2' }, 'sqLite');
		CollectionTests({ name: 'sqLite', databaseName: 'CollectionTests_T2' }, 'sqLite');
		LocalContextTests({ name: 'sqLite', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'sqLite');
    }

    if ($data.StorageProviderLoader.isSupported('indexedDb')) {
        GeoTests({ name: "indexedDb", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_indexedDb',
            function (context, start) {
                context.storageProvider.db.close();
                start();
            }
        );
        GuidTests({ name: "indexedDb", databaseName: 'GuidTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_indexedDb',
            function (context, start) {
                context.storageProvider.db.close();
                start();
            }
        );
        TypeTests({ name: 'indexedDb', databaseName: 'TypeTests_T2' }, 'indexedDb');
        CollectionTests({ name: 'indexedDb', databaseName: 'CollectionTests_T2' }, 'indexedDb');
        LocalContextTests({ name: 'indexedDb', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'indexedDb');
    }

    GeoTests({ name: "InMemory", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_InMemory');
    GeoTests({ name: "LocalStore", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_LocalStore');
    GeoTestsFuncCompile({ name: "oData", maxDataServiceVersion: '3.0', oDataServiceHost: "/api" }, '_oData');
    GuidTests({ name: "InMemory", databaseName: 'GuidTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_InMemory');
    GuidTests({ name: "LocalStore", databaseName: 'GuidTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_LocalStore');

    dataServiceVersionTest({ name: "oData", oDataServiceHost: "Services/emptyNewsReader.svc", serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oData');
    dataServiceVersionTest({ name: "oData", oDataServiceHost: "Services/emptyNewsReaderV3.svc", maxDataServiceVersion: '3.0', serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oDataV3');
    dataServiceVersionTest({ name: "oData", oDataServiceHost: "Services/emptyNewsReaderV3.svc", maxDataServiceVersion: '1.0', serviceUrl: 'Services/oDataDbDelete.asmx', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_oDataV1');


    TypeTests({ name: 'oData', oDataServiceHost: "/Services/emptyNewsReader.svc" }, 'oData');
    TypeTests({ name: 'oData', oDataServiceHost: "/Services/emptyNewsReaderV3.svc", maxDataServiceVersion: '3.0' }, 'oDataV3');
    TypeTests({ name: 'oData', oDataServiceHost: "/odataprim", maxDataServiceVersion: '3.0', noBatch: true, noCount: true }, 'oDataWebApi');
    TypeTests({ name: 'webApi', apiUrl: "/api/TestItemTypesWebApi", noBatch: true, noCount: true }, 'webApi');
    TypeTests({ name: 'LocalStore', databaseName: 'TypeTests_T2' }, 'LocalStore');

    CollectionTests({ name: 'oData', oDataServiceHost: "/odatacoll", maxDataServiceVersion: '3.0', noCreate: true }, 'oDataWebApi');
    CollectionTests({ name: 'webApi', apiUrl: "/api/CollectionPropsWebApi", noCreate: true }, 'webApi');
    CollectionTests({ name: 'LocalStore', databaseName: 'CollectionTests_T2' }, 'LocalStore');

    LocalContextTests({ name: 'LocalStore', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'LocalStore');

});