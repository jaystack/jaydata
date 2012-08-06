// JayData 1.1.1
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki
//
// More info: http://jaydata.org
$data.Class.define('$data.storageProviders.indexedDb.IndexedDBStorageProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg) {
        // mapping IndexedDB types to browser invariant name
        this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        this.IDBRequest = window.IDBRequest || window.webkitIDBRequest || window.mozIDBRequest || window.msIDBRequest;
        this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction || window.msIDBTransaction;
        this.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange || window.msIDBKeyRange;
        this.IDBDatabaseException = window.IDBDatabaseException || window.webkitIDBDatabaseException || window.mozIDBDatabaseException || window.msIDBDatabaseException;
        this.IDBOpenDBRequest = window.IDBOpenDBRequest || window.webkitIDBOpenDBRequest || window.mozIDBOpenDBRequest || window.msIDBOpenDBRequest;
        this.newVersionAPI = !!(window.IDBFactory && IDBFactory.prototype.deleteDatabase);
        this.sequenceStore = '__jayData_sequence';
        this.SqlCommands = [];
        this.context = {};
        this.providerConfiguration = $data.typeSystem.extend({
            databaseName: 'JayDataDemo',
            version: 1,
            dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged
        }, cfg);
        this._setupExtensionMethods();
    },
    supportedBinaryOperators: {
        value: {
            equal: { mapTo: ' == ', dataType: $data.Boolean },
            notEqual: { mapTo: ' != ', dataType: $data.Boolean },
			equalTyped: { mapTo: ' == ', dataType: $data.Boolean },
            notEqualTyped: { mapTo: ' != ', dataType: $data.Boolean },
            greaterThan: { mapTo: ' > ', dataType: $data.Boolean },
            greaterThanOrEqual: { mapTo: ' >= ', dataType: $data.Boolean },

            lessThan: { mapTo: ' < ', dataType: $data.Boolean },
            lessThenOrEqual: { mapTo: ' <= ', dataType: $data.Boolean },
            or: { mapTo: ' || ', dataType: $data.Boolean },
            and: { mapTo: ' && ', dataType: $data.Boolean }
            //'in': { mapTo: ' in ', dataType: $data.Boolean, resolvableType: [$data.Array, $data.Queryable] }
        }
    },
    supportedSetOperations: {
        value: {
            length: {},
            toArray: {},
            forEach: {}
        },
        enumerable: true,
        writable: true
    },
    _setupExtensionMethods: function () {
        /// <summary>
        /// Sets the extension method 'setCallback' on IDBRequest, IDBOpenDBRequest, and IDBTransaction types
        /// </summary>
        var self = this;
        var idbRequest = this.IDBRequest;
        var idbTran = this.IDBTransaction;
        var idbOpenDBRequest = this.IDBOpenDBRequest;
        var setCallbacks = function (callbackSettings) {
            /// <summary>
            /// Sets the callbacks on the object.
            /// </summary>
            /// <param name="callbackSettings">Named value pairs of the callbacks</param>
            if (typeof callbackSettings !== 'object')
                Guard.raise(new Exception('Invalid callbackSettings', null, callbackSettings));
            for (var i in callbackSettings) {
                if (typeof this[i] === 'undefined' || typeof callbackSettings[i] !== 'function')
                    continue;
                this[i] = callbackSettings[i];
            }

            if (this.readyState == self.IDBRequest.DONE)
                console.log('WARNING: request finished before setCallbacks. Do not use breakpoints between creating the request object and finishing the setting of callbacks');
            return this;
        };
        if (typeof idbRequest.prototype.setCallbacks !== 'function')
            idbRequest.prototype.setCallbacks = setCallbacks;
        if (typeof idbTran.prototype.setCallbacks !== 'function')
            idbTran.prototype.setCallbacks = setCallbacks;
        if (idbOpenDBRequest && typeof idbOpenDBRequest.prototype.setCallbacks !== 'function')
            idbOpenDBRequest.prototype.setCallbacks = setCallbacks;
    },
    supportedDataTypes: {
        value: [$data.Integer, $data.Number, $data.Date, $data.String, $data.Boolean, $data.Blob, $data.Array, $data.Object],
        writable: false
    },
    fieldConverter: {
        value: {
            fromDb: {
                '$data.Integer': function (i) { return i; },
                '$data.Number': function (number) { return number; },
                '$data.Date': function (date) { return date; },
                '$data.String': function (string) { return string; },
                '$data.Boolean': function (b) { return b; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Array': function (arr) { if (arr === undefined) { return new $data.Array(); }return arr; },
                '$data.Object': function (obj) { return obj; }
            },
            toDb: {
                '$data.Integer': function (i) { return i; },
                '$data.Number': function (number) { return number; },
                '$data.Date': function (date) { return date; },
                '$data.String': function (string) { return string; },
                '$data.Boolean': function (b) { return b; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Array': function (arr) { return arr; },
                '$data.Object': function (obj) { return obj; }
            }
        }
    },
    initializeStore: function (callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        var self = this;
        var initDb = function (db) {
            db.onversionchange = function (event) {
                var ret = event.target.close();
                return ret;
            };
            var newSequences = [];
            self.context._storageModel.forEach(function (memDef) {
                function createStore() {
                    /// <summary>
                    /// Creates a store for 'memDef'
                    /// </summary>
                    var osParam = {};
                    var keySettings = self._getKeySettings(memDef);
                    if (self.newVersionAPI) {
                        if (keySettings.autoIncrement)
                            newSequences.push(memDef.TableName);
                    } else {
                        osParam.autoIncrement = keySettings.autoIncrement;
                    }
                    if (keySettings.keyPath !== undefined)
                        osParam.keyPath = keySettings.keyPath;
                    db.createObjectStore(memDef.TableName, osParam);
                }
                if (db.objectStoreNames.contains(memDef.TableName)) {
                    // ObjectStore already present.
                    if (self.providerConfiguration.dbCreation === $data.storageProviders.DbCreationType.DropAllExistingTables) {
                        // Force drop and recreate object store
                        db.deleteObjectStore(memDef.TableName);
                        createStore();
                    }
                } else {
                    // Store does not exists yet, we need to create it
                    createStore();
                }
            });
            if (newSequences.length > 0 && !db.objectStoreNames.contains(self.sequenceStore)) {
                // Sequence store does not exists yet, we create it
                db.createObjectStore(self.sequenceStore, { keyPath: 'store' });
                newSequences = [];
            }
            return newSequences;
        }
        var newSequences = null;
        // Creating openCallbacks settings for both type of db.open() method
        var openCallbacks = {
            onupgradeneeded: function (event) {
                newSequences = initDb(event.target.result);
            },
            onerror: callBack.error,
            onblocked: callBack.error,
            onsuccess: function (event) {
                self.db = event.target.result;
                self.db.onversionchange = function (event) {
                    event.target.close();
                }
                if (self.newVersionAPI) {
                    if (newSequences && newSequences.length > 0) {
                        var store = self.db.transaction([self.sequenceStore], self.IDBTransaction.READ_WRITE).setCallbacks({
                            onerror: callBack.error,
                            oncomplete: function () {
                                callBack.success(self.context);
                            }
                        }).objectStore(self.sequenceStore);
                        switch (self.providerConfiguration.dbCreation) {
                            case $data.storageProviders.DbCreationType.DropAllExistingTables:
                            case $data.storageProviders.DbCreationType.DropTableIfChanged:
                                // Clearing all data
                                store.clear();
                                break;
                            default:
                                // Removing data for newly created stores, if they previously existed
                                newSequences.forEach(function (item) {
                                    store['delete'](item);
                                });
                                break;
                        }
                    }
                    callBack.success(self.context);
                }
                else {
                    // Calling setVersion on webkit
                    self.db.setVersion(self.providerConfiguration.version).setCallbacks({
                        onerror: callBack.error,
                        onblocked: callBack.error,
                        onsuccess: function (event) {
                            initDb(self.db);
                            callBack.success(self.context);
                        }
                    });
                }
            }
        };
        // For Firefox we need to pass the version here
        if (self.newVersionAPI)
            self.indexedDB.open(self.providerConfiguration.databaseName, parseInt(self.providerConfiguration.version, 10)).setCallbacks(openCallbacks);
        else
            self.indexedDB.open(self.providerConfiguration.databaseName).setCallbacks(openCallbacks);
    },
    executeQuery: function (query, callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        var self = this;

        //var compiledQuery = self._compile(query);

        // Creating read only transaction for query. Results are passed in transaction's oncomplete event
        var entitySet = query.context.getEntitySetFromElementType(query.defaultType);
        var store = self.db.transaction([entitySet.tableName], self.IDBTransaction.READ_ONLY).setCallbacks({
            onerror: callBack.error,
            onabort: callBack.error,
            oncomplete: function (event) {
                callBack.success(query);
            }
        }).objectStore(entitySet.tableName);
        var modelBinderCompiler = Container.createModelBinderConfigCompiler(query, []);
        modelBinderCompiler.Visit(query.expression);
        switch (query.expression.nodeType) {
            case $data.Expressions.ExpressionType.Count:
                
                //query.actionPack.push({ op: 'buildType', context: self.context, tempObjectName: 'lulz', propertyMapping: [{ from: 'count', dataType: $data.Integer }] });
                //query.actionPack.push({ op: 'copyToResult', tempObjectName: 'lulz' });
                store.count().onsuccess = function (event) {
                    var count = event.target.result;
                    query.rawDataList.push({ cnt: count });
                }
                break;
            default:
                //query.actionPack.push({ op: 'buildType', context: self.context, logicalType: query.entitySet.createNew, tempObjectName: 'lulz' });
                //query.actionPack.push({ op: 'copyToResult', tempObjectName: 'lulz' });
                store.openCursor().onsuccess = function (event) {
                    // We currently support only toArray() so let's just dump all data
                    var cursor = event.target.result;
                    if (cursor) {
                        var value = cursor.value;
                        //if (!compiledQuery.filterFunc || compiledQuery.filterFunc(value))
                            query.rawDataList.push(cursor.value);
                        cursor['continue']();
                    }
                };
                break;
        }
    },
    _getKeySettings: function (memDef) {
        /// <summary>
        /// Gets key settings for item type's member definition
        /// </summary>
        /// <param name="memDef">memDef of item</param>
        /// <returns>KeySettings object</returns>
        var self = this;
        var settings = { autoIncrement: false };
        var keys = [];
        memDef.PhysicalType.memberDefinitions
            .getPublicMappedProperties().forEach(function (item) {
                if (item.key) {
                    // We found a key
                    keys.push(item.name);
                }
                if (item.computed) {
                    // AutoIncrement field, must be key
                    if (!item.key)
                        Guard.raise(new Exception('Only key field can be a computed field!'));
                    settings.autoIncrement = true;
                }
            });
        if (keys.length > 1) {
            if (settings.autoIncrement)
                Guard.raise(new Exception('Auto increment is only valid for a single key!'));
            // Setting key fields (composite key)
            settings.keys = keys;
        } else if (keys.length == 1) {
            // Simple key
            settings.keyPath = keys[0];
        } else {
            Guard.raise(new Exception('No valid key found!'));
        }
        return settings;
    },
    saveChanges: function (callBack, changedItems) {
        var self = this;
        // Building independent blocks and processing them sequentially
        var independentBlocks = self.buildIndependentBlocks(changedItems);
        function saveNextIndependentBlock() {
            /// <summary>
            /// Saves the next independent block
            /// </summary>
            if (independentBlocks.length === 0) {
                // No more blocks left, calling success callback
                callBack.success();
            } else {
                // 'Popping' next block
                var currentBlock = independentBlocks.shift();
                // Collecting stores of items for transaction initialize
                var storesObj = {};
                // Generating physicalData
                var convertedItems = currentBlock.map(function (item) {
                    storesObj[item.entitySet.tableName] = true;
                    item.physicalData = {};
                    self.context._storageModel.getStorageModel(item.data.getType())
                        .PhysicalType.memberDefinitions
                        .getPublicMappedProperties().forEach(function (memDef) {
                            if (memDef.key && memDef.computed && item.data[memDef.name] == undefined) {
                                // Autogenerated fields for new items should not be present in the physicalData
                                return;
                            }
                            item.physicalData[memDef.name] = item.data[memDef.name];
                        });
                    return item;
                });
                var stores = [];
                for (var i in storesObj) {
                    stores.push(i);
                }
                var tran = self.db.transaction(stores, self.IDBTransaction.READ_WRITE).setCallbacks({
                    onerror: function (event) {
                        // Only call the error callback when it's not because of an abort
                        // aborted cases should call the error callback there
                        if (event.target.errorCode !== self.IDBDatabaseException.ABORT_ERR)
                            callBack.error(event);
                    },
                    oncomplete: function (event) {
                        // Moving to next block
                        saveNextIndependentBlock();
                    }
                });
                function KeySettingsCache() {
                    /// <summary>
                    /// Simple cache for key settings of types
                    /// </summary>
                    var cache = {};
                    this.getSettingsForItem = function (item) {
                        var typeName = item.data.getType().fullName;
                        if (!cache.hasOwnProperty(typeName)) {
                            cache[typeName] = self._getKeySettings(self.context._storageModel.getStorageModel(item.data.getType()));
                        }
                        return cache[typeName]
                    }
                }
                var ksCache = new KeySettingsCache();
                convertedItems.forEach(function (item) {
                    // Getting store and keysettings for the current item
                    var store = tran.objectStore(item.entitySet.tableName);
                    var keySettings = ksCache.getSettingsForItem(item);
                    // Contains the keys that should be passed for create, update and delete (composite keys)
                    var itemKeys = keySettings.keys && keySettings.keys.map(function (key) { return item.physicalData[key]; }) || null;
                    try {
                        var cursorAction = function (action) {
                            /// <summary>
                            /// Find the current item in the store, and calls the action on it. Error raised when item was not found
                            /// </summary>
                            /// <param name="action">Action to call on the item</param>
                            var key = keySettings.keyPath ? item.physicalData[keySettings.keyPath] : itemKeys;
                            var data = item.physicalData;
                            store.openCursor(self.IDBKeyRange.only(key))
                                .onsuccess = function (event) {
                                    try {
                                        var cursor = event.target.result;
                                        if (cursor)
                                            action(cursor, key, data);
                                        else
                                            Guard.raise(new Exception('Object not found', null, item));
                                    } catch (ex) {
                                        tran.abort();
                                        callBack.error(ex);
                                    }
                                }
                        };
                        switch (item.data.entityState) {
                            case $data.EntityState.Added:
                                function setAutoIncrementId(item, callBack) {
                                    /// <summary>
                                    /// Sets the value of the autoIncremented key for the item, then calls the callBack
                                    /// </summary>
                                    /// <param name="item">Item to set the Id on</param>
                                    /// <param name="callBack">Callback to call</param>
                                    callBack = $data.typeSystem.createCallbackSetting(callBack);
                                    var record = null;
                                    var tran = self.db.transaction([self.sequenceStore], self.IDBTransaction.READ_WRITE)
                                        .setCallbacks({
                                            onerror: callBack.error,
                                            oncomplete: function (event) {
                                                item.physicalData[keySettings.keyPath] = record.lastInsertedId;
                                                callBack.success(item);
                                            }
                                        });
                                    // Gets the store
                                    var store = tran.objectStore(self.sequenceStore);
                                    // and tries to find the record for the item's store's sequenceId
                                    store.openCursor(self.IDBKeyRange.only(item.entitySet.tableName))
                                        .onsuccess = function (event) {
                                            var cursor = event.target.result;
                                            if (cursor) {
                                                // Record found
                                                record = cursor.value;
                                                var id = record.lastInsertedId;
                                                if (typeof id !== 'number')
                                                    Guard.raise(new Exception('Invalid field type! Must be number', null, id));
                                                // Increments the id
                                                ++record.lastInsertedId;
                                                // then persists it
                                                cursor.update(record);
                                            } else {
                                                // Record was not found, we need to add it
                                                store.add(record = { store: item.entitySet.tableName, lastInsertedId: 1 });
                                            }
                                        }
                                }
                                if (!keySettings.keyPath) {
                                    // Item needs explicit keys
                                    store.add(item.physicalData, itemKeys);
                                }
                                else {
                                    function addItem(item) {
                                        /// <summary>
                                        /// Adds the item to the database, and sets the generated key
                                        /// </summary>
                                        /// <param name="item">Item to save</param>
                                        store.add(item.physicalData)
                                            .onsuccess = function (event) {
                                                // Saves the generated key back to the entity
                                                item.data[keySettings.keyPath] = event.target.result;
                                            };
                                    }
                                    if (self.newVersionAPI && item.physicalData[keySettings.keyPath] === undefined) {
                                        // Firefox needs help with autoIncrement id generation
                                        setAutoIncrementId(item, {
                                            success: addItem,
                                            error: function (ex) {
                                                Guard.raise(new Exception('Can\'t generate new id', null, ex));
                                            }
                                        });
                                    } else {
                                        // Webkit, simply add the item
                                        addItem(item);
                                    }
                                }
                                break;
                            case $data.EntityState.Deleted:
                                // Deletes the item
                                cursorAction(function (cursor) {
                                    cursor['delete']();
                                });
                                break;
                            case $data.EntityState.Modified:
                                // Updates the item
                                cursorAction(function (cursor, key, data) {
                                    cursor.update(data);
                                });
                                break;
                            case $data.EntityState.Unchanged:
                                break;
                            default:
                                Guard.raise(new Exception('Not supported entity state', null, item));
                        }
                    } catch (ex) {
                        // Abort on exceptions
                        tran.abort();
                        callBack.error(ex);
                    }
                });
            }
        }
        saveNextIndependentBlock();
    },
    _compile: function (query) {
        var sqlText = Container.createIndexedDBCompiler().compile(query);
        return sqlText;
    }
}, {
	isSupported: {
        get: function () { return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB; },
        set: function () { }
    }
});

if ($data.storageProviders.indexedDb.IndexedDBStorageProvider.isSupported)
	$data.StorageProviderBase.registerProvider('indexedDb', $data.storageProviders.indexedDb.IndexedDBStorageProvider);