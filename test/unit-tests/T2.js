import mock$data from '../core.js';
import $data from 'jaydata/core';
import { EntityContextTests } from './T1.js';


// T4_CrossProviderTests();

EntityContextTests({ name: 'oData', oDataServiceHost: "http://localhost:9000/odata", serviceUrl: 'http://localhost:9000/odata', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'oDataV4');
// T3({ name: 'oData', oDataServiceHost: "http://localhost:9000/odata", serviceUrl: 'http://localhost:9000/odata', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'oDataV4');
// T3_oDataV3({ name: 'oData', oDataServiceHost: "http://localhost:9000/odata", serviceUrl: 'http://localhost:9000/odata', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'oDataV4');
if ($data.StorageProviderLoader.isSupported('sqLite')) {
  EntityContextTests({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
  T3({ name: "sqLite", databaseName: 'T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
  GeoTests({ name: "sqLite", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
  GuidTests({ name: "sqLite", databaseName: 'GuidTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_Web_SQL');
  TypeTests({ name: 'sqLite', databaseName: 'TypeTests_T2' }, 'sqLite');
  CollectionTests({ name: 'sqLite', databaseName: 'CollectionTests_T2' }, 'sqLite');
  LocalContextTests({ name: 'sqLite', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, 'sqLite');
}

// GeoTests({ name: "InMemory", databaseName: 'GeoTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_InMemory');
// GuidTests({ name: "InMemory", databaseName: 'GuidTests_T1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }, '_InMemory');