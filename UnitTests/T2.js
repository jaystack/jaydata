﻿$(document).ready(function () {
    EntityContextTests({ name: "oData", databaseName: 'T1', oDataServiceHost: "emptyNewsReader.svc", serviceUrl: 'newsDB', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_oData');
    EntityContextTests({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_Web_SQL');

    T3({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_Web_SQL');
    T3({ name: "oData", databaseName: 'T1', oDataServiceHost: "emptyNewsReader.svc", serviceUrl: 'newsDB', dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables }, '_oData');
});