$data.Class.define('$data.storageProviders.indexedDb.IndexedDBStorageProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg, ctxInstance) {
        // mapping IndexedDB types to browser invariant name
        this.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
        this.IDBRequest = window.IDBRequest || window.webkitIDBRequest || window.mozIDBRequest || window.msIDBRequest;
        this.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction || window.msIDBTransaction;
        this.IDBTransactionType = { READ_ONLY: "readonly", READ_WRITE: "readwrite", VERSIONCHANGE: "versionchange" }
        if (this.IDBTransaction.READ_ONLY && this.IDBTransaction.READ_WRITE) {
            this.IDBTransactionType.READ_ONLY = this.IDBTransaction.READ_ONLY
            this.IDBTransactionType.READ_WRITE = this.IDBTransaction.READ_WRITE
        }

        this.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.mozIDBKeyRange || window.msIDBKeyRange;
        this.IDBDatabaseException = window.IDBDatabaseException || window.webkitIDBDatabaseException || window.mozIDBDatabaseException || window.msIDBDatabaseException;
        this.IDBOpenDBRequest = window.IDBOpenDBRequest || window.webkitIDBOpenDBRequest || window.mozIDBOpenDBRequest || window.msIDBOpenDBRequest;
        this.newVersionAPI = !!(window.IDBFactory && IDBFactory.prototype.deleteDatabase);
        this.sequenceStore = '__jayData_sequence';
        this.SqlCommands = [];
        this.context = ctxInstance;
        this.providerConfiguration = $data.typeSystem.extend({
            databaseName: 'JayDataDemo',
            version: 1,
            dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged,
            memoryOperations: true
        }, cfg);
        this._setupExtensionMethods();

        if (ctxInstance)
            this.originalContext = ctxInstance.getType();

        if (this.context && this.context._buildDbType_generateConvertToFunction && this.buildDbType_generateConvertToFunction) {
            this.context._buildDbType_generateConvertToFunction = this.buildDbType_generateConvertToFunction;
        }
        if (this.context && this.context._buildDbType_modifyInstanceDefinition && this.buildDbType_modifyInstanceDefinition) {
            this.context._buildDbType_modifyInstanceDefinition = this.buildDbType_modifyInstanceDefinition;
        }
    },
    supportedBinaryOperators: {
        value: {
            equal: { mapTo: ' == ', dataType: $data.Boolean },
            notEqual: { mapTo: ' != ', dataType: $data.Boolean },
            equalTyped: { mapTo: ' === ', dataType: $data.Boolean },
            notEqualTyped: { mapTo: ' !== ', dataType: $data.Boolean },
            greaterThan: { mapTo: ' > ', dataType: $data.Boolean },
            greaterThanOrEqual: { mapTo: ' >= ', dataType: $data.Boolean },
            lessThan: { mapTo: ' < ', dataType: $data.Boolean },
            lessThenOrEqual: { mapTo: ' <= ', dataType: $data.Boolean },

            or: { mapTo: ' || ', dataType: $data.Boolean },
            and: { mapTo: ' && ', dataType: $data.Boolean },
            'in': { mapTo: ' in ', dataType: $data.Boolean, resolvableType: [$data.Array] }
        }
    },
    supportedSetOperations: {
        value: {
            filter: {},
            map: {},
            length: {},
            forEach: {},
            toArray: {},
            single: {},
            some: {},
            every: {},
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {}
        },
        enumerable: true,
        writable: true
    },
    supportedFieldOperations: {
        value: {
            length: { mapTo: "length", dataType: 'number' },
            startsWith: { mapTo: "$data.StringFunctions.startsWith", dataType: $data.Boolean, parameters: [{ name: "p1", dataType: "string" }] },
            endsWith: { mapTo: "$data.StringFunctions.endsWith", dataType: $data.Boolean, parameters: [{ name: "p1", dataType: "string" }] },
            contains: { mapTo: "$data.StringFunctions.contains", dataType: $data.Boolean, parameters: [{ name: "p1", dataType: "string" }] },
            substr: { mapTo: "substr", dataType: $data.String, parameters: [{ name: "startFrom", dataType: "number" }, { name: "length", dataType: "number" }] },
            toLowerCase: { mapTo: "toLowerCase", dataType: $data.String },
            toUpperCase: { mapTo: "toUpperCase", dataType: $data.String },
            trim: { mapTo: 'trim', dataType: $data.String },
            ltrim: { mapTo: 'trimLeft', dataType: $data.String },
            rtrim: { mapTo: 'trimRight', dataType: $data.String }
        },
        enumerable: true,
        writable: true
    },
    supportedUnaryOperators: {
        value: {
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

            //if (this.readyState == self.IDBRequest.DONE)
            //    console.log('WARNING: request finished before setCallbacks. Do not use breakpoints between creating the request object and finishing the setting of callbacks');
            return this;
        };
        if (idbRequest && typeof idbRequest.prototype.setCallbacks !== 'function')
            idbRequest.prototype.setCallbacks = setCallbacks;
        if (idbTran && typeof idbTran.prototype.setCallbacks !== 'function')
            idbTran.prototype.setCallbacks = setCallbacks;
        if (idbOpenDBRequest && typeof idbOpenDBRequest.prototype.setCallbacks !== 'function')
            idbOpenDBRequest.prototype.setCallbacks = setCallbacks;
    },
    supportedDataTypes: {
        value: [$data.Integer, $data.Number, $data.Date, $data.String, $data.Boolean, $data.Blob, $data.Array, $data.Object, $data.Guid, $data.GeographyPoint,
            $data.GeographyLineString, $data.GeographyPolygon, $data.GeographyMultiPoint, $data.GeographyMultiLineString, $data.GeographyMultiPolygon, $data.GeographyCollection,
            $data.GeometryPoint, $data.GeometryLineString, $data.GeometryPolygon, $data.GeometryMultiPoint, $data.GeometryMultiLineString, $data.GeometryMultiPolygon, $data.GeometryCollection],
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
                '$data.Array': function (arr) { if (arr === undefined) { return new $data.Array(); } return arr; },
                '$data.Object': function (obj) { return obj; },
                "$data.Guid": function (g) { return g ? $data.parseGuid(g) : g; },
                '$data.GeographyPoint': function (g) { if (g) { return new $data.GeographyPoint(g); } return g; },
                '$data.GeographyLineString': function (g) { if (g) { return new $data.GeographyLineString(g); } return g; },
                '$data.GeographyPolygon': function (g) { if (g) { return new $data.GeographyPolygon(g); } return g; },
                '$data.GeographyMultiPoint': function (g) { if (g) { return new $data.GeographyMultiPoint(g); } return g; },
                '$data.GeographyMultiLineString': function (g) { if (g) { return new $data.GeographyMultiLineString(g); } return g; },
                '$data.GeographyMultiPolygon': function (g) { if (g) { return new $data.GeographyMultiPolygon(g); } return g; },
                '$data.GeographyCollection': function (g) { if (g) { return new $data.GeographyCollection(g); } return g; },
                '$data.GeometryPoint': function (g) { if (g) { return new $data.GeometryPoint(g); } return g; },
                '$data.GeometryLineString': function (g) { if (g) { return new $data.GeometryLineString(g); } return g; },
                '$data.GeometryPolygon': function (g) { if (g) { return new $data.GeometryPolygon(g); } return g; },
                '$data.GeometryMultiPoint': function (g) { if (g) { return new $data.GeometryMultiPoint(g); } return g; },
                '$data.GeometryMultiLineString': function (g) { if (g) { return new $data.GeometryMultiLineString(g); } return g; },
                '$data.GeometryMultiPolygon': function (g) { if (g) { return new $data.GeometryMultiPolygon(g); } return g; },
                '$data.GeometryCollection': function (g) { if (g) { return new $data.GeometryCollection(g); } return g; }
            },
            toDb: {
                '$data.Integer': function (i) { return i; },
                '$data.Number': function (number) { return number; },
                '$data.Date': function (date) { return date; },
                '$data.String': function (string) { return string; },
                '$data.Boolean': function (b) { return b; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Array': function (arr) { return arr; },
                '$data.Object': function (obj) { return obj; },
                "$data.Guid": function (g) { return g ? g.value : g; },
                '$data.GeographyPoint': function (g) { if (g) { return g; } return g; },
                '$data.GeographyLineString': function (g) { if (g) { return g; } return g; },
                '$data.GeographyPolygon': function (g) { if (g) { return g; } return g; },
                '$data.GeographyMultiPoint': function (g) { if (g) { return g; } return g; },
                '$data.GeographyMultiLineString': function (g) { if (g) { return g; } return g; },
                '$data.GeographyMultiPolygon': function (g) { if (g) { return g; } return g; },
                '$data.GeographyCollection': function (g) { if (g) { return g; } return g; },
                '$data.GeometryPoint': function (g) { if (g) { return g; } return g; },
                '$data.GeometryLineString': function (g) { if (g) { return g; } return g; },
                '$data.GeometryPolygon': function (g) { if (g) { return g; } return g; },
                '$data.GeometryMultiPoint': function (g) { if (g) { return g; } return g; },
                '$data.GeometryMultiLineString': function (g) { if (g) { return g; } return g; },
                '$data.GeometryMultiPolygon': function (g) { if (g) { return g; } return g; },
                '$data.GeometryCollection': function (g) { if (g) { return g; } return g; }
            }
        }
    },

    _getObjectStoreDefinition: function (setDefinition) {
        var contextStore = {
            storeName: setDefinition.TableName
        };
        var keyFields = setDefinition.PhysicalType.memberDefinitions.getKeyProperties();

        if (0 == keyFields.length) {
            var error = new Error("Entity must have a key field: " + contextStore.storeName);
            error.name = "KeyNotFoundError";
            throw error;
        }
        for (var i = 0; i < keyFields.length; i++) {

            if (keyFields[i].computed === true &&
                ("$data.Integer" !== Container.resolveName(keyFields[i].type))) {
                var error = new Error("Computed key field must be of integer type: " + contextStore.storeName);
                error.name = "ComputedKeyFieldError";
                throw error;
            }
            if (keyFields.length > 2 && keyFields[i].computed) {
                var error = new Error("With multiple keys the computed field is not allowed: " + contextStore.storeName);
                error.name = "MultipleComputedKeyFieldError";
                throw error;
            }
        }
        contextStore.indices = setDefinition.indices;
        contextStore.keyFields = keyFields;
        return contextStore;
    },
    _getObjectStoreDefinitions: function () {
        var objectStoreDefinitions = [];
        var self = this;
        self.context._storageModel.forEach(function (memDef) {
            var objectStoreDefinition = self._getObjectStoreDefinition(memDef);
            objectStoreDefinitions.push(objectStoreDefinition);
        });
        return objectStoreDefinitions;
    },

    _oldCreateDB: function (setVersionTran, definitions, onready) {
        var self = this;
        setVersionTran.db.onversionchange = function (event) {
            return event.target.close();
        };

        self._createDB(setVersionTran.db, definitions);
        setVersionTran.oncomplete = onready;
    },
    _createDB: function (db, definitions) {
        for (var i = 0; i < definitions.length; i++) {
            if (definitions[i].dropIfExists && db.objectStoreNames.contains(definitions[i].storeName)) {
                db.deleteObjectStore(definitions[i].storeName);
            }
        }
        for (var i = 0; i < definitions.length; i++) {
            var storeDef = definitions[i];

            if (!db.objectStoreNames.contains(storeDef.storeName)) {
                var settings = {};
                if (storeDef.keyFields.length == 1) {
                    settings = {
                        keyPath: storeDef.keyFields[0].name,
                        autoIncrement: storeDef.keyFields[0].computed
                    };
                } else {
                    settings.key = [];
                    for (var i = 0; i < storeDef.keyFields.length; i++) {
                        settings.key.push(storeDef.keyFields[i].name);
                    }
                }
                var objStore = db.createObjectStore(storeDef.storeName, settings);
                if (storeDef.indices && storeDef.indices.length > 0) {
                    for (var idx = 0; idx < storeDef.indices.length; idx++) {
                        var idx_name = storeDef.indices[idx].name;
                        var idx_keys = storeDef.indices[idx].keys;
                        var idx_unique = storeDef.indices[idx].unique;
                        if (!idx_keys || (idx_keys && idx_keys.length < 1)) { throw new Exception("Index create error: Keys field is required!"); }
                        if (typeof idx_keys[0] !== "string") { idx_keys = idx_keys.map(function (k) { return k.fieldName; }); }
                        if (typeof idx_keys[0] !== "string") { throw new Exception("Index create error: type of fieldName property must be string!"); }
                        objStore.createIndex(idx_name, idx_keys, { unique: idx_unique });
                    }
                }
            }
        }
    },
    _hasDbChanges: function (db, transaction, definitions, dropTabes) {
        var isOriginal = true;
        var tran = transaction;
        if (!tran) {
            tran = db.transaction(db.objectStoreNames, "readonly");
        }
        for (var i = 0; i < definitions.length; i++) {
            if (!dropTabes && db.objectStoreNames.contains(definitions[i].storeName)) {
                //check pk change

                var os = tran.objectStore(definitions[i].storeName);
                var keyPath = [].concat(os.keyPath).sort(function (a, b) { return a == b ? 0 : a > b ? 1 : -1; });
                var defKeyPath = definitions[i].keyFields.map(function (memDef) { return memDef.name; }).sort(function (a, b) { return a == b ? 0 : a > b ? 1 : -1; });
                if (keyPath.length === defKeyPath.length) {
                    for (var j = 0; j < keyPath.length; j++) {
                        isOriginal = isOriginal && (keyPath[j] === defKeyPath[j]);
                    }
                    definitions[i].changed = !isOriginal;
                } else {
                    isOriginal = false;
                    definitions[i].changed = true;
                }

                isOriginal = isOriginal && true;
            }
            else {

                isOriginal = false;
                definitions[i].changed = true;
                definitions[i].dropIfExists = dropTabes;
            }
        }

        return !isOriginal;
    },
    onupgradeneeded: function (objectStoreDefinitions) {
        var self = this;
        return function (e) {
            var db = e.target.result;
            db.onversionchange = function (event) {
                return event.target.close();
            };
            var hasTableChanges = self._hasDbChanges(db, e.target.transaction, objectStoreDefinitions, self.providerConfiguration.dbCreation == $data.storageProviders.DbCreationType.DropAllExistingTables);
            if (hasTableChanges)
                self._createDB(db, objectStoreDefinitions);
        }
    },

    initializeStore: function (callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        var self = this;

        var objectStoreDefinitions;
        try {
            objectStoreDefinitions = this._getObjectStoreDefinitions();
        } catch (e) {
            $data.Trace.log(objectStoreDefinitions);
            callBack.error(e);
            return;
        }
        this.indexedDB.open(this.providerConfiguration.databaseName).setCallbacks({
            onsuccess: function (e) {
                var db = e.target.result;
                db.onversionchange = function (event) {
                    return event.target.close();
                };

                var hasTableChanges = self._hasDbChanges(db, e.target.transaction, objectStoreDefinitions, self.providerConfiguration.dbCreation == $data.storageProviders.DbCreationType.DropAllExistingTables);
                //oldAPI
                if (db.setVersion) {
                    if (db.version === "" || hasTableChanges) {
                        db.setVersion((parseInt(db.version) || 0) + 1).setCallbacks({
                            onsuccess: function (e) {
                                var db = e.target.result
                                self._oldCreateDB(db /*setVerTran*/, objectStoreDefinitions, function (e) {
                                    self.db = e.target.db;
                                    callBack.success(self.context);
                                });
                            },
                            onerror: function () {
                                var v = arguments;
                            },
                            onblocked: function () {
                                var v = arguments;
                            }
                        });
                        return;
                    };
                } else if (hasTableChanges) {
                    //newVersionAPI
                    db.close();
                    var version = parseInt(db.version) + 1;
                    self.indexedDB.open(self.providerConfiguration.databaseName, version).setCallbacks({
                        onsuccess: function (e) {
                            self.db = e.target.result;
                            callBack.success(self.context);
                        },
                        onupgradeneeded: self.onupgradeneeded(objectStoreDefinitions),
                        onerror: callBack.error,
                        onabort: callBack.error
                        //onblocked: callBack.error
                    });
                    return;
                }

                self.db = db;
                callBack.success(self.context);
            },
            //newVersionAPI
            onupgradeneeded: this.onupgradeneeded(objectStoreDefinitions),
            onerror: callBack.error,
            onabort: callBack.error,
            //onblocked: callBack.error
        });
    },
    _compile: function (query, callback) {
        var compiler = Container.createIndexedDBCompiler(this);
        var compiledQuery = compiler.compile(query, {
            success: function (compiledQuery) {
                callback.success(compiledQuery);
            }
        });

        return compiledQuery;
    },
    getTraceString: function (query) {
        var compiledExpression = this._compile(query);
        var executor = Container.createIndexedDBExpressionExecutor(this);
        executor.runQuery(compiledExpression);
        return compiledExpression;
    },
    executeQuery: function (query, callBack) {
        var self = this;
        var start = new Date().getTime();
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        var doQuery = function () {
            self._compile(query, {
                success: function (expression) {
                    var executor = Container.createIndexedDBExpressionExecutor(self, query.transaction);
                    executor.runQuery(expression, {
                        success: function (result) {
                            var modelBinderCompiler = Container.createModelBinderConfigCompiler(query, []);
                            modelBinderCompiler.Visit(query.expression);
                            query.rawDataList = result;
                            $data.Trace.log("execute Query in milliseconds:", new Date().getTime() - start);
                            callBack.success(query);
                        }
                    });
                }
            });
        };

        if (!query.transaction) {
            this.context.beginTransaction(function (tran) {
                query.transaction = tran;
                doQuery();
            });
        }
        else {
            doQuery();
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

    _beginTran: function (tableList, isWrite, callBack) {
        var self = this;
        setTimeout(function () {
            callBack = $data.typeSystem.createCallbackSetting(callBack);
            try {
                var transaction = new $data.storageProviders.IndexedDB.IndexedDBTransaction();
                var tran = self.db.transaction(tableList ? tableList : self.db.objectStoreNames, isWrite ? self.IDBTransactionType.READ_WRITE : self.IDBTransactionType.READ_ONLY);

                tran.oncomplete = function () {
                    $data.Trace.log("oncomplete: ", transaction._objectId);
                    if (transaction.oncomplete) {
                        transaction.oncomplete.fire(arguments, transaction);
                    }
                };
                tran.onerror = function () {
                    $data.Trace.log("onerror: ", transaction._objectId);
                    transaction.aborted = true;
                    if (transaction.onerror) {
                        transaction.onerror.fire(arguments, transaction);
                    }
                };
                tran.onabort = function () {
                    $data.Trace.log("onabort: ", transaction._objectId);
                    if (!transaction.aborted) {
                        if (transaction.onerror) {
                            transaction.onerror.fire(arguments, transaction);
                        }
                    }
                };
                tran.onblocked = function () {
                    $data.Trace.log("onblocked: ", transaction._objectId);
                    if (transaction.onabort) {
                        transaction.onabort.fire(arguments, transaction);
                    }
                };

                transaction.transaction = tran;

                callBack.success(transaction);
            } catch (e) {
                callBack.error(e);
            }
        }, 0);
    },

    saveChanges: function (callBack, changedItems, tran) {
        var self = this;
        // Building independent blocks and processing them sequentially
        var independentBlocks = this.buildIndependentBlocks(changedItems);
        var objectStoreNames = [];
        for (var i = 0; i < independentBlocks.length; i++) {
            for (var j = 0; j < independentBlocks[i].length; j++) {
                if (objectStoreNames.indexOf(independentBlocks[i][j].entitySet.tableName) < 0) {
                    objectStoreNames.push(independentBlocks[i][j].entitySet.tableName);
                }
            }
        }
        if (objectStoreNames.length < 1) { callBack.success(tran); return; }

        if (tran) {
            this._saveChangesWithTran(callBack, independentBlocks, tran);
        } else {


            this.context.beginTransaction(objectStoreNames, true, function (transaction) {
                self._saveChangesWithTran(callBack, independentBlocks, transaction);
            });
        };
    },
    _saveChangesWithTran: function (callBack, independentBlocks, transaction) {
        var self = this;

        var doSave = function () {
            if (independentBlocks.length == 0) {
                transaction.onerror.detach(t1);
                //transaction.onabort.detach(t2);
                callBack.success(transaction);
            }
            else {
                var currentBlock = independentBlocks.shift();
                var itemCount = currentBlock.length;
                var hasError = false;
                self._saveIndependentBlock(currentBlock, transaction, {
                    success: function () {
                        if (--itemCount < 1 && !hasError) {
                            doSave();
                        }
                    },
                    error: function (error) {
                        hasError = false;
                        itemCount = 0;
                        transaction.hasError = true;
                        transaction.abort();
                    }
                });
            }
        }
        var t1 = null;
        var tranError = function (sender, event) {
            this.onerror.detach(t1);
            callBack.error(transaction);
        };
        t1 = tranError;
        transaction.onerror.attach(tranError);
        doSave();
    },
    _saveIndependentBlock: function (items, tran, callBack) {
        var self = this;
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        var saveItem = function (item) {
            //var item = items[i];
            var physicalType = self.context._storageModel.getStorageModel(item.data.getType()).PhysicalType;
            item.physicalData = physicalType.convertTo(item.data);
            var keyValues = physicalType.memberDefinitions.getKeyProperties().map(function (memDef) {
                var typeName = Container.resolveName(memDef.type);
                if (self.fieldConverter.toDb[typeName]) {
                    var convertedValue = self.fieldConverter.toDb[typeName](item.physicalData[memDef.name]);
                    if (convertedValue !== undefined) {
                        item.physicalData.initData[memDef.name] = convertedValue;
                    }
                    return item.physicalData.initData[memDef.name];
                } else {
                    console.log('WARN!!!');
                    return item.physicalData[memDef.name];
                }
            });
            if (keyValues.length == 1) { keyValues = keyValues[0]; }
            if (tran.hasError) {
                callBack.success();
                return;
            }
            try {
                var store = tran.transaction.objectStore(item.entitySet.tableName);
                switch (item.data.entityState) {
                    case $data.EntityState.Added:
                        var request = null;
                        if (keyValues instanceof $data.Array) {
                            request = store.add(item.physicalData.initData, keyValues);
                        } else {
                            request = store.add(item.physicalData.initData);
                        }
                        request.setCallbacks({
                            onerror: function (ex) {
                                callBack.error(ex);
                                return true;
                            },
                            onsuccess: function (event) {
                                var newKey = event.target.result;
                                if (newKey instanceof $data.Array) {
                                    physicalType.memberDefinitions.getKeyProperties().forEach(function (k, idx) {
                                        item.data[k.name] = newKey[idx];
                                    });
                                } else {
                                    item.data[physicalType.memberDefinitions.getKeyProperties()[0].name] = newKey;
                                }

                                callBack.success();
                            }
                        });
                        break;
                    case $data.EntityState.Deleted:
                        store.openCursor(self.IDBKeyRange.only(keyValues)).setCallbacks({
                            onerror: function (ex) {
                                callBack.error(ex);
                                return true;
                            },
                            onsuccess: function (event) {
                                var cursor = event.target.result;
                                if (cursor) {
                                    cursor.delete();
                                    callBack.success();
                                }
                                else {
                                    callBack.error(new Exception('Object not found'));
                                }
                            }
                        });
                        break;
                    case $data.EntityState.Modified:
                        store.openCursor(self.IDBKeyRange.only(keyValues)).setCallbacks({
                            onsuccess: function (ex) {
                                callBack.error(ex);
                                return true;
                            },
                            onsuccess: function (event) {
                                var cursor = event.target.result;
                                if (cursor) {
                                    cursor.update($data.typeSystem.extend(cursor.value, item.physicalData.initData));
                                    callBack.success();
                                }
                                else {
                                    callBack.error(new Exception('Object not found'));
                                }
                            }
                        });
                        break;
                    case $data.EntityState.Unchanged:
                        callBack.success();
                        break;
                    default:
                        Guard.raise(new Exception('Not supported entity state', null, item));
                }
            } catch (ex) {
                callBack.error(ex);
            }
        }
        for (var i = 0; i < items.length; i++) {
            saveItem(items[i]);
        }
    }
}, {
    isSupported: {
        get: function () {
            return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB ? true : false;
        },
        set: function () { }
    }
});

if ($data.storageProviders.indexedDb.IndexedDBStorageProvider.isSupported)
    $data.StorageProviderBase.registerProvider('indexedDb', $data.storageProviders.indexedDb.IndexedDBStorageProvider);