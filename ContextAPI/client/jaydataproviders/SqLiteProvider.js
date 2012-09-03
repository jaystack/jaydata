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
$data.Class.define('$data.dbClient.DbCommand', null, null,
{
    connection: {},
    parameters: {},
    execute: function (callback) {
        Guard.raise("Pure class");
    }
}, null);$data.Class.define('$data.dbClient.DbConnection', null, null,
{
    connectionParams: {},
    database: {},
    isOpen: function () {
        Guard.raise("Pure class");
    },
    open: function () {
        Guard.raise("Pure class");
    },
    close: function () {
        Guard.raise("Pure class");
    },
    createCommand: function () {
        Guard.raise("Pure class");
    }
}, null);$data.Class.define('$data.dbClient.openDatabaseClient.OpenDbCommand', $data.dbClient.DbCommand, null,
{
    constructor: function (con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function (callback) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    executeQuery: function (callback) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    exec: function (query, parameters, callback, errorhandler) {
		// suspicious code
        /*if (console) {
            //console.log(query);
        }*/
        this.connection.open({
            success: function (tran) {
                var single = false;
                if (!(query instanceof Array)) {
                    single = true;
                    query = [query];
                    parameters = [parameters];
                }
                
                var results = [];
                var remainingCommands = 0;

                function decClb() {
                    if (--remainingCommands == 0) {
                        callback(single ? results[0] : results);
                    }
                }

                query.forEach(function (q, i) {
                    remainingCommands++;
                    if (q) {
                        tran.executeSql(
                            query[i],
                            parameters[i],
                            function (trx, result) {
                                var r = { rows: [] };
                                try {
                                    r.insertId = result.insertId;
                                } catch (e) {
                                    // If insertId is present, no rows are returned
                                    r.rowsAffected = result.rowsAffected;
                                    var maxItem = result.rows.length;
                                    for (var j = 0; j < maxItem; j++) {
                                        r.rows.push(result.rows.item(j));
                                    }
                                }
                                results[i] = r;
                                decClb();
                            },
                            function (trx, err) {
                                if (errorhandler)
                                    errorhandler(err);
                            }
                        );
                    } else {
                        results[i] = null;
                        decClb();
                    }
                });
            }
        });
    }
}, null);$data.Class.define('$data.dbClient.openDatabaseClient.OpenDbConnection', $data.dbClient.DbConnection, null,
{
    constructor: function (params) {
        this.connectionParams = params;
    },
    isOpen: function () {
        return this.database !== null && this.database !== undefined && this.transaction !== null && this.transaction !== undefined;
    },
    open: function (callBack) {
		if (this.database){
			this.database.transaction(function (tran) { callBack.success(tran); });
        } else {
            var p = this.connectionParams;
            var con = this;
			this.database = openDatabase(p.fileName, p.version, p.displayName, p.maxSize);
			this.database.transaction(function (tran) { callBack.success(tran); });
        }
    },
    close: function () {
        this.transaction = undefined;
        this.database = undefined;
    },
    createCommand: function (queryStr, params) {
        var cmd = new $data.dbClient.openDatabaseClient.OpenDbCommand(this, queryStr, params);
        return cmd;
    }
}, null);$data.Class.define('$data.dbClient.jayStorageClient.JayStorageCommand', $data.dbClient.DbCommand, null,
{
    constructor: function (con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function (callback) {
        // TODO
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    executeQuery: function (callback) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    exec: function (query, parameters, callback, errorhandler) {
        if (parameters == null || parameters == undefined) {
            parameters = {};
        }
        var single = false;
        if (!(query instanceof Array)) {
            single = true;
            query = [query];
            parameters = [parameters];
        }

        var provider = this;
        var results = [];
        var remainingCommands = query.length;
        var decClb = function () {
            if (--remainingCommands == 0) {
                callback(single ? results[0] : results);
            }
        };

		query.forEach(function(q, i){
			if (q){
				$data.ajax({
					url: 'http' + (this.connection.connectionParams.storage.ssl ? 's' : '') + '://' + this.connection.connectionParams.storage.src.replace('http://', '').replace('https://', '') + '?db=' + this.connection.connectionParams.storage.key,
					type: 'POST',
					headers: {
						'X-PINGOTHER': 'pingpong'
					},
					data: { query: q, parameters: parameters[i] },
					dataType: 'json',
					contentType: 'application/json;charset=UTF-8',
					success: function(data){
						if (data && data.error){
							console.log('JayStorage error', data.error);
							errorhandler(data.error);
							return;
						}
						if (this.lastID){
							results[i] = { insertId: this.lastID, rows: (data || { rows: [] }).rows };
						}else results[i] = { rows: (data || { rows: [] }).rows };
 						decClb();
					}
				});
			}else{
				results[i] = null;
				decClb();
			}
		}, this);
    }
}, null);$data.Class.define('$data.dbClient.jayStorageClient.JayStorageConnection', $data.dbClient.DbConnection, null,
{
    constructor: function (params) {
        this.connectionParams = params;
    },
    isOpen: function () {
		return true;
        //return this.database !== null && this.database !== undefined;
    },
    open: function () {
        /*if (this.database == null) {
            var p = this.connectionParams;
            this.database = new sqLiteModule.Database(p.fileName);
        }*/
    },
    close: function () {
        //not supported yet (performance issue)
    },
    createCommand: function (queryStr, params) {
        var cmd = new $data.dbClient.jayStorageClient.JayStorageCommand(this, queryStr, params);
        return cmd;
    }
}, null);$data.Class.define('$data.dbClient.sqLiteNJClient.SqLiteNjCommand', $data.dbClient.DbCommand, null,
{
    constructor: function (con, queryStr, params) {
        this.query = queryStr;
        this.connection = con;
        this.parameters = params;
    },
    executeNonQuery: function (callback) {
        // TODO
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    executeQuery: function (callback) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error);
    },
    exec: function (query, parameters, callback, errorhandler) {
        if (!this.connection.isOpen()) {
            this.connection.open();
        }
        if (parameters == null || parameters == undefined) {
            parameters = {};
        }
        var single = false;
        if (!(query instanceof Array)) {
            single = true;
            query = [query];
            parameters = [parameters];
        }

        var provider = this;
        var results = [];
        var remainingCommands = 0;
        var decClb = function () {
            if (--remainingCommands == 0) {
                provider.connection.database.exec('COMMIT');
                callback(single ? results[0] : results);
            }
        };
        provider.connection.database.exec('BEGIN');
        query.forEach(function (q, i) {
            remainingCommands++;
            if (q) {
                var sqlClb = function (error, rows) {
                    if (error != null) {
                        errorhandler(error);
                        return;
                    }
                    if (this.lastID) {
                        results[i] = { insertId: this.lastID, rows: [] };
                    } else {
                        results[i] = { rows: rows };
                    }
                    decClb();
                };

                var stmt = provider.connection.database.prepare(q, parameters[i]);
                if (q.indexOf('SELECT') == 0) {
                    stmt.all(sqlClb);
                } else {
                    stmt.run(sqlClb);
                }
                stmt.finalize();
            } else {
                results[i] = null;
                decClb();
            }
        }, this);
    }
}, null);$data.Class.define('$data.dbClient.sqLiteNJClient.SqLiteNjConnection', $data.dbClient.DbConnection, null,
{
    constructor: function (params) {
        this.connectionParams = params;
    },
    isOpen: function () {
        return this.database !== null && this.database !== undefined;
    },
    open: function () {
        if (this.database == null) {
            var p = this.connectionParams;
            this.database = new sqLiteModule.Database(p.fileName);
        }
    },
    close: function () {
        //not supported yet (performance issue)
    },
    createCommand: function (queryStr, params) {
        var cmd = new $data.dbClient.sqLiteNJClient.SqLiteNjCommand(this, queryStr, params);
        return cmd;
    }
}, null);$data.Class.define('$data.storageProviders.sqLite.SqLiteStorageProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg, context) {
        this.SqlCommands = [];
        this.context = context;
        this.providerConfiguration = $data.typeSystem.extend({
            databaseName: "JayDataDemo",
            version: "",
            displayName: "JayData demo db",
            maxSize: 1024 * 1024,
            dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged
        }, cfg);

        if (this.context && this.context._buildDbType_generateConvertToFunction && this.buildDbType_generateConvertToFunction) {
            this.context._buildDbType_generateConvertToFunction = this.buildDbType_generateConvertToFunction;
        }
        if (this.context && this.context._buildDbType_modifyInstanceDefinition && this.buildDbType_modifyInstanceDefinition) {
            this.context._buildDbType_modifyInstanceDefinition = this.buildDbType_modifyInstanceDefinition;
        }
    },
    _createSqlConnection: function () {
        var ctorParm = {
            fileName: this.providerConfiguration.databaseName,
            version: "",
            displayName: this.providerConfiguration.displayName,
            maxSize: this.providerConfiguration.maxSize,
            storage: this.providerConfiguration.storage
        };

        if (this.connection) return this.connection;

        var connection = null;
        if (this.providerConfiguration.storage) {
            connection = new $data.dbClient.jayStorageClient.JayStorageConnection(ctorParm);
        } else if (typeof sqLiteModule !== 'undefined') {
            connection = new $data.dbClient.sqLiteNJClient.SqLiteNjConnection(ctorParm);
        } else {
            connection = new $data.dbClient.openDatabaseClient.OpenDbConnection(ctorParm);
        }

        this.connection = connection;

        return connection;
    },
    supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date], writable: false },
    fieldConverter: {
        value: {
            fromDb: {
                "$data.Integer": function (number) { return number; },
                "$data.Number": function (number) { return number; },
                "$data.Date": function (dbData) { return new Date(dbData); },
                "$data.String": function (text) { return text; },
                "$data.Boolean": function (b) { return b === 1 ? true : false; },
                "$data.Blob": function (blob) { return blob; }
            },
            toDb: {
                "$data.Integer": function (number) { return number; },
                "$data.Number": function (number) { return number; },
                "$data.Date": function (date) { return date ? date.valueOf() : null; },
                "$data.String": function (text) { return text; },
                "$data.Boolean": function (b) { return b ? 1 : 0; },
                "$data.Blob": function (blob) { return blob; }
            }
        }
    },

    supportedFieldOperations: {
        value: {
            length: {
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression]
            },
            substr: {
                dataType: "string",
                allowedIn: $data.Expressions.FilterExpression,
                parameters: [{ name: "startFrom", dataType: "number" }, { name: "length", dataType: "number" }]
            },
            toLowerCase: {
                dataType: "string", mapTo: "lower"
            },
            toUpperCase: {
                dataType: "string", mapTo: "upper"
            },
            contains: {
                mapTo: "like",
                dataType: "boolean",
                allowedIn: $data.Expressions.FilterExpression,
                parameters: [{ name: "strFragment", dataType: "string", prefix: "%", suffix: "%" }]
            },
            startsWith: {
                mapTo: "like",
                dataType: "boolean",
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                parameters: [{ name: "strFragment", dataType: "string", suffix: "%" }]
            },
            endsWith: {
                mapTo: "like",
                dataType: "boolean",
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                parameters: [{ name: "strFragment", dataType: "string", prefix: "%" }]
            },
            'trim': {
                dataType: $data.String,
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                mapTo: 'trim',
                parameters: [{ name: '@expression', dataType: $data.String }, { name: 'chars', dataType: $data.String }]
            },
            'ltrim': {
                dataType: $data.String,
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                mapTo: 'ltrim',
                parameters: [{ name: '@expression', dataType: $data.String }, { name: 'chars', dataType: $data.String }]
            },
            'rtrim': {
                dataType: $data.String,
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                mapTo: 'rtrim',
                parameters: [{ name: '@expression', dataType: $data.String }, { name: 'chars', dataType: $data.String }]
            }
        },
        enumerable: true,
        writable: true
    },

    supportedBinaryOperators: {
        value: {
            equal: { mapTo: '=', dataType: "boolean" },
            notEqual: { mapTo: '!=', dataType: "boolean" },
            equalTyped: { mapTo: '=', dataType: "boolean" },
            notEqualTyped: { mapTo: '!=', dataType: "boolean" },
            greaterThan: { mapTo: '>', dataType: "boolean" },
            greaterThanOrEqual: { mapTo: '>=', dataType: "boolean" },

            lessThan: { mapTo: '<', dataType: "boolean" },
            lessThenOrEqual: { mapTo: '<=', dataType: "boolean" },
            or: { mapTo: 'OR', dataType: "boolean" },
            and: { mapTo: 'AND', dataType: "boolean" },

            add: { mapTo: '+', dataType: "number" },
            divide: { mapTo: '/' },
            multiply: { mapTo: '*' },
            subtract: { mapTo: '-' },
            modulo: { mapTo: '%' },

            orBitwise: { maptTo: "|" },
            andBitwsise: { mapTo: "&" },

            "in": { mapTo: "in", dataType: "boolean" }
        }
    },

    supportedUnaryOperators: {
        value: {
            not: { mapTo: 'not' },
            positive: { mapTo: '+' },
            negative: { maptTo: '-' }
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
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {},
            include: {}
        },
        enumerable: true,
        writable: true
    },

    buildDbType_modifyInstanceDefinition: function (instanceDefinition, storageModel) {
        var buildDbType_copyPropertyDefinition = function (propertyDefinition) {
            var cPropertyDef = JSON.parse(JSON.stringify(propertyDefinition));
            cPropertyDef.dataType = Container.resolveType(propertyDefinition.dataType);
            cPropertyDef.key = false;
            cPropertyDef.computed = false;
            return cPropertyDef;
        };
        var buildDbType_createConstrain = function (foreignType, dataType, propertyName, prefix) {
            var constrain = new Object();
            constrain[foreignType.name] = propertyName;
            constrain[dataType.name] = prefix + '__' + propertyName;
            return constrain;
        };

        if (storageModel.Associations) {
            storageModel.Associations.forEach(function (association) {
                var addToEntityDef = false;
                var foreignType = association.FromType;
                var dataType = association.ToType;
                var foreignPropName = association.ToPropertyName;

                association.ReferentialConstraint = association.ReferentialConstraint || [];

                if ((association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1") || (association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1")) {
                    foreignType = association.ToType;
                    dataType = association.FromType;
                    foreignPropName = association.FromPropertyName;
                    addToEntityDef = true;
                }

                foreignType.memberDefinitions.getPublicMappedProperties().filter(function (d) { return d.key }).forEach(function (d) {
                    if (addToEntityDef) {
                        instanceDefinition[foreignPropName + '__' + d.name] = buildDbType_copyPropertyDefinition(d);
                    }
                    association.ReferentialConstraint.push(buildDbType_createConstrain(foreignType, dataType, d.name, foreignPropName));
                }, this);
            }, this);
        }
        //Copy complex type properties
        if (storageModel.ComplexTypes) {
            storageModel.ComplexTypes.forEach(function (complexType) {
                complexType.ReferentialConstraint = complexType.ReferentialConstraint || [];

                complexType.ToType.memberDefinitions.getPublicMappedProperties().forEach(function (d) {
                    instanceDefinition[complexType.FromPropertyName + '__' + d.name] = buildDbType_copyPropertyDefinition(d);
                    complexType.ReferentialConstraint.push(buildDbType_createConstrain(complexType.ToType, complexType.FromType, d.name, complexType.FromPropertyName));
                }, this);
            }, this);
        }
    },
    buildDbType_generateConvertToFunction: function (storageModel) {
        return function (logicalEntity) {
            var dbInstance = new storageModel.PhysicalType();
            dbInstance.entityState = logicalEntity.entityState;

            //logicalEntity.changedProperties.forEach(function(memberDef){
            //}, this);
            storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (property) {
                dbInstance[property.name] = logicalEntity[property.name];
            }, this);

            if (storageModel.Associations) {
                storageModel.Associations.forEach(function (association) {
                    if ((association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1") || (association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1")) {
                        var complexInstance = logicalEntity[association.FromPropertyName];
                        if (complexInstance !== undefined) {
                            association.ReferentialConstraint.forEach(function (constrain) {
                                if (complexInstance !== null) {
                                    dbInstance[constrain[association.From]] = complexInstance[constrain[association.To]];
                                } else {
                                    dbInstance[constrain[association.From]] = null;
                                }
                            }, this);
                        }
                    }
                }, this);
            }
            if (storageModel.ComplexTypes) {
                storageModel.ComplexTypes.forEach(function (cmpType) {
                    var complexInstance = logicalEntity[cmpType.FromPropertyName];
                    if (complexInstance !== undefined) {
                        cmpType.ReferentialConstraint.forEach(function (constrain) {
                            if (complexInstance !== null) {
                                dbInstance[constrain[cmpType.From]] = complexInstance[constrain[cmpType.To]];
                            } else {
                                dbInstance[constrain[cmpType.From]] = null;
                            }
                        }, this);
                    }
                }, this);
            }
            return dbInstance;
        };
    },
    initializeStore: function (callBack) {
        // callBack.success(this.context); return;



        callBack = $data.typeSystem.createCallbackSetting(callBack);
        this.context._storageModel.forEach(function (item, index) {
            this.SqlCommands.push(this.createSqlFromStorageModel(item) + " ");
        }, this);

        var sqlConnection = this._createSqlConnection();
        var cmd = sqlConnection.createCommand("SELECT * FROM sqlite_master WHERE type = 'table'", null);
        var that = this;

        cmd.executeQuery({
            success: function (result) {
                var existObjectInDB = {};
                for (var i = 0; i < result.rows.length; i++) {
                    var item = result.rows[i];
                    existObjectInDB[item.tbl_name] = item;
                }
                switch (that.providerConfiguration.dbCreation) {
                    case $data.storageProviders.DbCreationType.Merge:
                        Guard.raise(new Exception('Not supported db creation type'));
                        break;
                    case $data.storageProviders.DbCreationType.DropTableIfChanged:
                        var deleteCmd = [];
                        for (var i = 0; i < that.SqlCommands.length; i++) {
                            if (that.SqlCommands[i] == "") { continue; }
                            var regEx = /^CREATE TABLE IF NOT EXISTS ([^ ]*) (\(.*\))/g;
                            var data = regEx.exec(that.SqlCommands[i]);
                            if (data) {
                                var tableName = data[1];
                                var tableDef = data[2];
                                if (existObjectInDB[tableName.slice(1, tableName.length - 1)]) {
                                    var existsRegEx = /^CREATE TABLE ([^ ]*) (\(.*\))/g;
                                    var existTableDef = existsRegEx.exec(existObjectInDB[tableName.slice(1, tableName.length - 1)].sql)[2];
                                    if (tableDef.toLowerCase() != existTableDef.toLowerCase()) {
                                        deleteCmd.push("DROP TABLE IF EXISTS [" + existObjectInDB[tableName.slice(1, tableName.length - 1)].tbl_name + "];");
                                    }
                                }
                            }
                            else {
                                console.dir(regEx);
                                console.dir(that.SqlCommands[i]);
                            }
                        }
                        that.SqlCommands = that.SqlCommands.concat(deleteCmd);
                        console.log(deleteCmd);
                        break;
                    case $data.storageProviders.DbCreationType.DropAllExistingTables:
                        for (var objName in existObjectInDB) {
                            if (objName && !objName.match('^__') && !objName.match('^sqlite_')) {
                                that.SqlCommands.push("DROP TABLE IF EXISTS [" + existObjectInDB[objName].tbl_name + "];");
                            }
                        }
                        break;
                }
                that._runSqlCommands(sqlConnection, { success: callBack.success, error: callBack.error });
            },
            error: callBack.error
        });
    },
    executeQuery: function (query, callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        var sqlConnection = this._createSqlConnection();
        var sql = this._compile(query);
        query.actionPack = sql.actions;
        query.sqlConvertMetadata = sql.converter;
        query.modelBinderConfig = sql.modelBinderConfig;
        var sqlCommand = sqlConnection.createCommand(sql.sqlText, sql.params);
        var that = this;
        sqlCommand.executeQuery({
            success: function (sqlResult) {
                if (callBack.success) {
                    query.rawDataList = sqlResult.rows;
                    callBack.success(query);
                }
            },
            error: callBack.error
        });
    },
    _compile: function (query, params) {
        var compiler = new $data.storageProviders.sqLite.SQLiteCompiler();
        var compiled = compiler.compile(query);
        //console.dir(compiled);
        compiled.hasSelect = compiler.select != null;
        return compiled;
    },
    getTraceString: function (query) {
        var sqlText = this._compile(query);
        return sqlText;
    },
    _runSqlCommands: function (sqlConnection, callBack) {
        if (this.SqlCommands && this.SqlCommands.length > 0) {
            var cmdStr = this.SqlCommands.pop();
            var command = sqlConnection.createCommand(cmdStr, null);
            var that = this;
            var okFn = function (result) { that._runSqlCommands.apply(that, [sqlConnection, callBack]); };
            command.executeQuery({ success: okFn, error: callBack.error });
        } else {
            callBack.success(this.context);
        }
    },
    setContext: function (ctx) {
        this.context = ctx;
    },
    saveChanges: function (callback, changedItems) {
        var sqlConnection = this._createSqlConnection();
        var provider = this;
        var independentBlocks = this.buildIndependentBlocks(changedItems);
        this.saveIndependentBlocks(changedItems, independentBlocks, sqlConnection, callback);
    },
    saveIndependentBlocks: function (changedItems, independentBlocks, sqlConnection, callback) {
        /// <summary>
        /// Saves the sequentially independent items to the database.
        /// </summary>
        /// <param name="independentBlocks">Array of independent block of items.</param>
        /// <param name="sqlConnection">sqlConnection to use</param>
        /// <param name="callback">Callback on finish</param>
        var provider = this;
        var t = [].concat(independentBlocks);
        function saveNextIndependentBlock() {
            if (t.length === 0) {
                callback.success();
                return;
            }
            var currentBlock = t.shift();
            // Converting items to their physical equivalent (?)
            var convertedItems = currentBlock.map(function (item) {
                var dbType = provider.context._storageModel.getStorageModel(item.data.getType()).PhysicalType;
                item.physicalData = dbType.convertTo(item.data);
                return item;
            }, this);
            provider.saveIndependentItems(convertedItems, sqlConnection, {
                success: function () {
                    provider.postProcessItems(convertedItems);
                    saveNextIndependentBlock();
                },
                error: callback.error
            });
        }
        saveNextIndependentBlock();
    },

    saveIndependentItems: function (items, sqlConnection, callback) {
        var provider = this;
        var queries = items.map(function (item) {
            return provider.saveEntitySet(item);
        });
        queries = queries.filter(function (item) { return item; });
        if (queries.length === 0) {
            callback.success(items);
            return;
        }
        function toCmd(sqlConnection, queries) {
            var cmdParams = { query: [], param: [] };
            queries.forEach(function (item, i) {
                if (item) {
                    if (item.query)
                        cmdParams.query[i] = item.query;
                    if (item.param)
                        cmdParams.param[i] = item.param;
                }
            });
            return sqlConnection.createCommand(cmdParams.query, cmdParams.param);
        }
        var cmd = toCmd(sqlConnection, queries);
        cmd.executeQuery({
            success: function (results) {
                var reloadQueries = results.map(function (result, i) {
                    if (result && result.insertId) {
                        return provider.save_reloadSavedEntity(result.insertId, items[i].entitySet.tableName, sqlConnection);
                    } else {
                        return null;
                    }
                })
                var cmd = toCmd(sqlConnection, reloadQueries);
                if (cmd.query.length > 0) {
                    cmd.executeQuery(function (results) {
                        results.forEach(function (item, i) {
                            if (item && item.rows) {
                                items[i].physicalData.initData = item.rows[0];
                            }
                        });
                        callback.success(items);
                    });
                } else {
                    callback.success(0);//TODO Zenima: fixed this!
                }
            },
            error: callback.error
        });
    },
    postProcessItems: function (changedItems) {
        var pmpCache = {};
        function getPublicMappedProperties(type) {
            var key = type.name;
            if (pmpCache.hasOwnProperty(key))
                return pmpCache[key];
            else {
                var pmp = type.memberDefinitions.getPublicMappedProperties().filter(function (memDef) {
                    return memDef.computed;
                });
                return (pmpCache[key] = pmp);
            }

        }
        changedItems.forEach(function (item) {
            if (item.physicalData) {
                getPublicMappedProperties(item.data.getType()).forEach(function (memDef) {
                    item.data[memDef.name] = item.physicalData[memDef.name];
                }, this);
            }
        }, this);
    },

    saveEntitySet: function (item) {
        switch (item.data.entityState) {
            case $data.EntityState.Added: return this.save_NewEntity(item); break;
            case $data.EntityState.Deleted: return this.save_DeleteEntity(item); break;
            case $data.EntityState.Modified: return this.save_UpdateEntity(item); break;
            case $data.EntityState.Unchanged: return; break;
            default: Guard.raise(new Exception('Not supported entity state'));
        }
    },
    save_DeleteEntity: function (item) {
        ///DELETE FROM Posts WHERE Id=1;
        var deleteSqlString = "DELETE FROM [" + item.entitySet.name + "] WHERE(";
        var hasCondition = false;
        var addAllField = false;
        var deleteParam = [];
        while (!hasCondition) {
            item.physicalData.constructor.memberDefinitions.getPublicMappedProperties().forEach(function (fieldDef, i) {

                if (hasCondition && !deleteSqlString.match(" AND $")) {
                    deleteSqlString += " AND ";
                }
                if (fieldDef.key || addAllField) {
                    deleteSqlString += "([" + fieldDef.name + "] == ?)";
                    deleteParam.push(this.fieldConverter.toDb[Container.resolveName(fieldDef.dataType)](item.data[fieldDef.name]));
                    hasCondition = true;
                }

            }, this);
            if (!hasCondition) {
                addAllField = true;
            }
        }
        if (deleteSqlString.match(" AND $")) {
            deleteSqlString = deleteSqlString.slice(0, deleteSqlString.length - 5);
        }
        deleteSqlString += ");";
        return { query: deleteSqlString, param: deleteParam };
    },
    save_UpdateEntity: function (item) {
        var setSection = " SET ";
        var whereSection = "WHERE(";

        var fieldsMaxIndex = item.entitySet.createNew.memberDefinitions.length;
        var hasCondition = false;
        var addAllField = false;
        var whereParam = [];
        var setParam = [];
        item.physicalData.constructor.memberDefinitions.getPublicMappedProperties().forEach(function (fieldDef, i) {
            if (item.physicalData[fieldDef.name] !== undefined) {
                if (hasCondition && !whereSection.match(" AND $")) {
                    whereSection += " AND ";
                }
                if (setSection.length > 5 && !setSection.match(',$')) {
                    setSection += ',';
                }
                if (fieldDef.key) {
                    whereSection += '([' + fieldDef.name + '] == ?)';
                    whereParam.push(this.fieldConverter.toDb[Container.resolveName(fieldDef.dataType)](item.physicalData[fieldDef.name]));
                    hasCondition = true;
                }
                else {
                    setSection += "[" + fieldDef.name + "] = ?";
                    setParam.push(this.fieldConverter.toDb[Container.resolveName(fieldDef.dataType)](item.physicalData[fieldDef.name]));
                }
            }
        }, this);
        if (!hasCondition) {
            Guard.raise(new Exception('Not supported UPDATE function without primary key!'));
        }

        if (whereSection.match(" AND $")) { whereSection = whereSection.slice(0, whereSection.length - 5); }
        if (setSection.match(",$")) { setSection = setSection.slice(0, setSection.length - 1); }
        var updateSqlString = "UPDATE [" + item.entitySet.tableName + "]" + setSection + " " + whereSection + ");";
        return { query: updateSqlString, param: setParam.concat(whereParam) };
    },
    save_NewEntity: function (item) {
        var insertSqlString = "INSERT INTO [" + item.entitySet.tableName + "](";
        var fieldList = "";
        var fieldValue = "";
        var fieldParam = [];
        item.physicalData.constructor.memberDefinitions.getPublicMappedProperties().forEach(function (fieldDef, i) {
            if (fieldList.length > 0 && fieldList[fieldList.length - 1] != ",") { fieldList += ","; fieldValue += ","; }
            var fieldName = fieldDef.name;
            if (/*item.physicalData[fieldName] !== null && */item.physicalData[fieldName] !== undefined) {
                if (fieldDef.dataType && (!fieldDef.dataType.isAssignableTo || (fieldDef.dataType.isAssignableTo && !fieldDef.dataType.isAssignableTo($data.EntitySet)))) {
                    fieldValue += '?';
                    fieldList += "[" + fieldName + "]";
                    fieldParam.push(this.fieldConverter.toDb[Container.resolveName(fieldDef.dataType)](item.physicalData[fieldName]));
                }
            }

        }, this);
        if (fieldParam.length < 1) { Guard.raise(new Exception('None of the fields contain values in the entity to be saved.')); }
        if (fieldList[fieldList.length - 1] == ",") { fieldList = fieldList.slice(0, fieldList.length - 1); }
        if (fieldValue[fieldValue.length - 1] == ",") { fieldValue = fieldValue.slice(0, fieldValue.length - 1); }
        insertSqlString += fieldList + ") VALUES(" + fieldValue + ");";
        return { query: insertSqlString, param: fieldParam };
    },
    save_reloadSavedEntity: function (rowid, tableName) {
        return { query: "SELECT * FROM " + tableName + " WHERE rowid=?", param: [rowid] };
    },
    createSqlFromStorageModel: function (memberDef) {
        ///<param name="memberDef" type="$data.StorageModel">StorageModel object wich contains physical entity definition</param>
        if (memberDef === undefined || memberDef === null || memberDef.PhysicalType === undefined) { Guard.raise("StorageModel not contains physical entity definition"); }

        var keyFieldNumber = 0;
        var autoincrementFieldNumber = 0;

        memberDef.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (item, index) {

            if (item.key) { keyFieldNumber++; }
            if (item.computed) {
                //if (!item.key) {
                //    Guard.raise(new Exception('Only key field can be computed field!'));
                //}
                autoincrementFieldNumber++;
            }

        }, this);

        if (autoincrementFieldNumber === 1 && keyFieldNumber > 1) {
            Guard.raise(new Exception('Do not use computed field with multiple primary key!'));
        }
        if (autoincrementFieldNumber > 1 && keyFieldNumber > 1) {
            Guard.raise(new Exception('Do not use multiple computed field!'));
        }

        var sql = "CREATE TABLE IF NOT EXISTS [" + memberDef.TableName + "] (";
        var pkFragment = ',PRIMARY KEY (';

        memberDef.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (item, index) {

            if (index > 0 && !sql.match(', $') && !sql.match('\\($'))
                sql += ', ';
            //var field = memberDef.createNew.memberDefinitions[fieldIndex];
            sql += this.createSqlFragmentFromField(item, autoincrementFieldNumber === 1, memberDef);
            if (autoincrementFieldNumber === 0 && item.key) {
                if (pkFragment.length > 14 && !pkFragment.match(', $'))
                    pkFragment += ', ';
                pkFragment += "[" + item.name + "]";
            }

        }, this);

        if (sql.match(', $'))
            sql = sql.substr(0, sql.length - 2);
        if (autoincrementFieldNumber === 0 && pkFragment.length > 14) {
            sql += pkFragment + ')';
        }
        sql += ');';
        return sql;
    },
    createSqlFragmentFromField: function (field, parsePk, storageModelObject) {
        if (('schemaCreate' in field) && (field['schemaCreate']))
            return field.schemaCreate(field);

        var fldBuilder = new this.FieldTypeBuilder(field, this, parsePk, storageModelObject);
        return fldBuilder.build();
    },
    FieldTypeBuilder: function (field, prov, parseKey, storageModelObject) {
        this.fieldDef = "";
        this.fld = field;
        this.provider = prov;
        this.parsePk = parseKey;
        this.entitySet = storageModelObject;
        this.build = function () {

            switch (Container.resolveType(this.fld.dataType)) {
                case $data.String: case "text": case "string": this.buildFieldNameAndType("TEXT"); break;
                case $data.Boolean: case $data.Integer: case "bool": case "boolean": case "int": case "integer": this.buildFieldNameAndType("INTEGER"); break;
                case $data.Number: case $data.Date: case "number": case "datetime": case "date": this.buildFieldNameAndType("REAL"); break;
                case $data.Blob: case "blob": this.buildFieldNameAndType("BLOB"); break;
                default: this.buildRelations(); break;
            }

            return this.fieldDef;
        };
        this.buildFieldNameAndType = function (type) {
            this.fieldDef = "[" + this.fld.name + "] " + type;
            this.parsePk ? this.buildPrimaryKey() : this.buildNotNull();
        };
        this.buildPrimaryKey = function () {
            if (this.fld.key) {
                this.fieldDef += " PRIMARY KEY";
                this.buildAutoIncrement();
            }
            else {
                this.buildNotNull();
            }
        };
        this.buildNotNull = function () {
            if (this.fld.required)
                this.fieldDef += " NOT NULL";
        };
        this.buildAutoIncrement = function () {
            if (this.fld.computed)
                this.fieldDef += " AUTOINCREMENT";
        };
    }
}, {
    isSupported: {
        get: function () { return "openDatabase" in window; },
        set: function () { }
    }
});

if ($data.storageProviders.sqLite.SqLiteStorageProvider.isSupported) {
    $data.StorageProviderBase.registerProvider("webSql", $data.storageProviders.sqLite.SqLiteStorageProvider);
    $data.StorageProviderBase.registerProvider("sqLite", $data.storageProviders.sqLite.SqLiteStorageProvider);
    $data.webSqlProvider = $data.storageProviders.sqLite.SqLiteStorageProvider;
}
var SqlStatementBlocks = {
    beginGroup: "(",
    endGroup: ")",
    nameSeparator: ".",
    valueSeparator: ", ",
    select: "SELECT ",
    where: " WHERE ",
    from: " FROM ",
    skip: " OFFSET ",
    take: " LIMIT ",
    parameter: "?",
    order: " ORDER BY ",
    as: " AS ",
    scalarFieldName: 'd',
    rowIdName: 'rowid$$',
    count: 'select count(*) cnt from ('
};
$C('$data.sqLite.SqlBuilder', $data.queryBuilder, null, {
    constructor: function (sets, context) {
        this.sets = sets;
        this.entityContext = context;

    },
    getExpressionAlias: function (setExpression) {
        var idx = this.sets.indexOf(setExpression);
        if (idx == -1) {
            idx = this.sets.push(setExpression) - 1;
        }
        return "T" + idx;
    }
});

$C('$data.sqLite.SqlCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (queryExpression, context) {
        this.queryExpression = queryExpression;
        this.sets = context.sets;
        this.infos = context.infos;
        this.entityContext = context.entityContext;
        this.associations = [];
        this.filters = [];
        this.newFilters = {};
        this.sortedFilterPart = ['projection', 'from', 'filter', 'order', 'take', 'skip'];
    },
    compile: function () {
        var sqlBuilder = Container.createSqlBuilder(this.sets, this.entityContext);
        this.Visit(this.queryExpression, sqlBuilder);

        if (sqlBuilder.getTextPart('projection') === undefined) {
            this.VisitDefaultProjection(sqlBuilder);
        }
        sqlBuilder.selectTextPart("result");
        this.sortedFilterPart.forEach(function (part) {
            var part = sqlBuilder.getTextPart(part);
            if (part) {
                sqlBuilder.addText(part.text);
                sqlBuilder.selectedFragment.params = sqlBuilder.selectedFragment.params.concat(part.params);
            }
        }, this);
        var countPart = sqlBuilder.getTextPart('count');
        if (countPart !== undefined) {
            sqlBuilder.selectedFragment.text = countPart.text + sqlBuilder.selectedFragment.text;
            sqlBuilder.addText(SqlStatementBlocks.endGroup);
            sqlBuilder.selectedFragment.params = sqlBuilder.selectedFragment.params.concat(countPart.params);
        }
        sqlBuilder.resetModelBinderProperty();
        this.filters.push(sqlBuilder);
    },

    VisitToArrayExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
    },
    VisitCountExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('count');
        sqlBuilder.addText(SqlStatementBlocks.count);
    },
    VisitFilterExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('filter');
        sqlBuilder.addText(SqlStatementBlocks.where);
        var filterCompiler = Container.createSqlFilterCompiler();
        filterCompiler.Visit(expression.selector, sqlBuilder);
        return expression;
    },

    VisitOrderExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('order');
        if (this.addOrders) {
            sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
        } else {
            this.addOrders = true;
            sqlBuilder.addText(SqlStatementBlocks.order);
        }
        var orderCompiler = Container.createSqlOrderCompiler();
        orderCompiler.Visit(expression, sqlBuilder);

        return expression;
    },
    VisitPagingExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);

        switch (expression.nodeType) {
            case $data.Expressions.ExpressionType.Skip:
                sqlBuilder.selectTextPart('skip');
                sqlBuilder.addText(SqlStatementBlocks.skip); break;
            case $data.Expressions.ExpressionType.Take:
                sqlBuilder.selectTextPart('take');
                sqlBuilder.addText(SqlStatementBlocks.take); break;
            default: Guard.raise("Not supported nodeType"); break;
        }
        var pagingCompiler = Container.createSqlPagingCompiler();
        pagingCompiler.Visit(expression, sqlBuilder);
        return expression;
    },
    VisitProjectionExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('projection');
        this.hasProjection = true;
        sqlBuilder.addText(SqlStatementBlocks.select);
        var projectonCompiler = Container.createSqlProjectionCompiler();
        projectonCompiler.Visit(expression, sqlBuilder);
    },
    VisitIncludeExpression: function (expression) {
        var includeBuilder = Container.createSqlBuilder(this.sets, this.entityContext);
        this.Visit(expression.source, includeBuilder);

        this.newFilters['include'] = projectionBuilder;
    },
    VisitEntitySetExpression: function (expression, sqlBuilder) {
        sqlBuilder.selectTextPart('from');
        sqlBuilder.addText(SqlStatementBlocks.from);
        sqlBuilder.sets.forEach(function (es, setIndex) {

            if (setIndex > 0) {
                sqlBuilder.addText(" \n\tLEFT OUTER JOIN ");
            }

            var alias = sqlBuilder.getExpressionAlias(es);
            sqlBuilder.addText(es.instance.tableName + ' ');
            sqlBuilder.addText(alias);

            if (setIndex > 0) {
                sqlBuilder.addText(" ON (");
                var toSet = this.infos[setIndex];
                var toPrefix = "T" + toSet.AliasNumber;
                var fromSetName = toSet.NavigationPath.substring(0, toSet.NavigationPath.lastIndexOf('.'));
                var temp = this.infos.filter(function (inf) { return inf.NavigationPath == fromSetName; }, this);
                var fromPrefix = "T0";
                if (temp.length > 0) {
                    fromPrefix = "T" + temp[0].AliasNumber;
                }
                toSet.Association.associationInfo.ReferentialConstraint.forEach(function (constrain, index) {
                    sqlBuilder.addText(fromPrefix + "." + constrain[toSet.Association.associationInfo.From]);
                    sqlBuilder.addText(" = ");
                    sqlBuilder.addText(toPrefix + "." + constrain[toSet.Association.associationInfo.To]);
                }, this);
                sqlBuilder.addText(")");
            }
        }, this);
    },
    VisitDefaultProjection: function (sqlBuilder) {
        sqlBuilder.selectTextPart('projection');
        if (sqlBuilder.sets.length > 1) {
            sqlBuilder.addText(SqlStatementBlocks.select);
            sqlBuilder.sets[0].storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberDef, index) {
                if (index > 0) {
                    sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                }
                sqlBuilder.addText("T0.");
                sqlBuilder.addText(memberDef.name);
            }, this);
        }
        else {
            sqlBuilder.addText("SELECT *");
        }
    }
});

$data.Expressions.ExpressionNode.prototype.monitor = function (monitorDefinition, context) {
    var m = Container.createExpressionMonitor(monitorDefinition);
    return m.Visit(this, context);
};

$C('$data.storageProviders.sqLite.SQLiteCompiler', null, null, {
    compile: function (query) {
        /// <param name="query" type="$data.Query" />
        var expression = query.expression;
        var context = { sets: [], infos: [], entityContext: query.context };
        var optimizedExpression = expression.monitor({

            MonitorEntitySetExpression: function (expression, context) {
                if (expression.source instanceof $data.Expressions.EntityContextExpression && context.sets.indexOf(expression) == -1) {
                    context.sets.push(expression);
                    context.infos.push({ AliasNumber: 0, Association: null, FromType: null, FromPropertyName: null });
                }
            },

            MutateEntitySetExpression: function (expression, context) {
                if (expression.source instanceof $data.Expressions.EntityContextExpression) {
                    this.backupContextExpression = expression.source;
                    this.path = "";
                    return expression;
                }
                if (expression.selector.associationInfo.FromMultiplicity == "0..1" && expression.selector.associationInfo.FromMultiplicity == "*") {
                    Guard.raise("Not supported query on this navigation property: " + expression.selector.associationInfo.From + " " + expression.selector.associationInfo.FromPropertyName);
                }

                this.path += '.' + expression.selector.associationInfo.FromPropertyName;
                var info = context.infos.filter(function (inf) {
                    return inf.NavigationPath == this.path;
                }, this);
                if (info.length > 0) {
                    return context.sets[info[0].AliasNumber];
                }
                var memberDefinitions = this.backupContextExpression.instance.getType().memberDefinitions.getMember(expression.storageModel.EntitySetReference.name);
                if (!memberDefinitions) {
                    Guard.raise("Context schema error");
                }
                var mi = Container.createMemberInfoExpression(memberDefinitions);
                var result = Container.createEntitySetExpression(this.backupContextExpression, mi);
                result.instance = this.backupContextExpression.instance[expression.storageModel.EntitySetReference.name];
                var aliasNum = context.sets.push(result);
                context.infos.push({
                    AliasNumber: aliasNum - 1,
                    Association: expression.selector,
                    NavigationPath: this.path
                });
                return result;
            }
        }, context);

        var compiler = Container.createSqlCompiler(optimizedExpression, context);
        compiler.compile();

        var sqlBuilder = Container.createSqlBuilder(this.sets, this.entityContext);
        
        query.modelBinderConfig = {};
        var modelBinder = Container.createsqLite_ModelBinderCompiler(query, []);
        modelBinder.Visit(optimizedExpression);

        var result = {
            sqlText: compiler.filters[0].selectedFragment.text,
            params: compiler.filters[0].selectedFragment.params,
            modelBinderConfig: query.modelBinderConfig
        };

        return result;
    }
}, null);
$C('$data.sqLite.SqlPagingCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },
    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitPagingExpression: function (expression, sqlBuilder) {
        this.Visit(expression.amount, sqlBuilder);
    },
    VisitConstantExpression: function (expression, sqlBuilder) {
        sqlBuilder.addParameter(expression.value);
        sqlBuilder.addText(SqlStatementBlocks.parameter);
    }
});$C('$data.sqLite.SqlOrderCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },
    compile: function (expression, sqlBuilder) {
        this.Visit(expression, sqlBuilder);
    },
    VisitEntitySetExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntitySetExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>

        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
    },
    VisitOrderExpression: function (expression, sqlBuilder) {
        this.Visit(expression.selector, sqlBuilder);
        if (expression.nodeType == $data.Expressions.ExpressionType.OrderByDescending) {
            sqlBuilder.addText(" DESC");
        } else {
            sqlBuilder.addText(" ASC");
        }
    },
    VisitParametricQueryExpression: function (expression, sqlBuilder) {
        this.Visit(expression.expression, sqlBuilder);
    },
    VisitEntityFieldExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
    },
    VisitMemberInfoExpression: function (expression, sqlBuilder) {
        sqlBuilder.addText(expression.memberName);
    },
    VisitComplexTypeExpression: function (expression, sqlBuilder) { 
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
        sqlBuilder.addText('__');
    }
});
$C('$data.sqLite.SqlProjectionCompiler', $data.Expressions.EntityExpressionVisitor, null,
{
    constructor: function () {
        this.anonymFiledPrefix = "";
        this.currentObjectLiteralName = null;
    },
    VisitProjectionExpression: function (expression, sqlBuilder) {
        this.Visit(expression.selector, sqlBuilder);
    },

    VisitParametricQueryExpression: function (expression, sqlBuilder) {
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityExpressionAsProjection(expression, sqlBuilder);
        } else if (expression.expression instanceof $data.Expressions.ObjectLiteralExpression) {
            this.Visit(expression.expression, sqlBuilder);
        } else {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid");
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(SqlStatementBlocks.rowIdName);
            sqlBuilder.addText(', ');
            sqlBuilder.addKeyField(SqlStatementBlocks.rowIdName);
            this.Visit(expression.expression, sqlBuilder);
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(SqlStatementBlocks.scalarFieldName);
        }
    },

    VisitEntityExpressionAsProjection: function (expression, sqlBuilder) {
        var ee = expression.expression;
        var alias = sqlBuilder.getExpressionAlias(ee.source);

        var localPrefix = this.anonymFiledPrefix + (expression.fieldName ? expression.fieldName : '');
        localPrefix = localPrefix ? localPrefix + '__' : '';

        ee.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberInfo, index) {
            if (index > 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }

            var fieldName = localPrefix + memberInfo.name;

            sqlBuilder.addText(alias);
            sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(memberInfo.name);
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(fieldName);
        }, this);
    },

    VisitEntityFieldOperationExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntityFieldOperationExpression"></param>
        /// <param name="sqlBuilder"></param>

        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);
        var opDefinition = expression.operation.memberDefinition;
        var opName = opDefinition.mapTo || opDefinition.name;

        sqlBuilder.addText(opName);
        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
        if (opName === "like") {
            var builder = Container.createSqlBuilder();
            this.Visit(expression.parameters[0], builder);
            builder.params.forEach(function (p) {
                var v = p;
                var paramDef = opDefinition.parameters[0];
                var v = paramDef.prefix ? paramDef.prefix + v : v;
                v = paramDef.suffix ? v + paramDef.suffix : v;
                sqlBuilder.addParameter(v);
            });
            sqlBuilder.addText(builder.sql);
            sqlBuilder.addText(" , ");
            this.Visit(expression.source, sqlBuilder);
        } else {
            this.Visit(expression.source, sqlBuilder);
            expression.parameters.forEach(function (p) {
                sqlBuilder.addText(" , ");
                this.Visit(p, sqlBuilder);
            }, this);
        };

        sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },

    VisitUnaryExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
        sqlBuilder.addText(expression.resolution.mapTo);
        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
        this.Visit(expression.operand, sqlBuilder);
        sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },

    VisitSimpleBinaryExpression: function (expression, sqlBuilder) {
        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
        this.Visit(expression.left, sqlBuilder);
        var self = this;
        sqlBuilder.addText(" " + expression.resolution.mapTo + " ");
        if (expression.nodeType == "in") {
            //TODO: refactor and generalize
            Guard.requireType("expression.right", expression.right, $data.Expressions.ConstantExpression);
            var set = expression.right.value;
            if (set instanceof Array) {
                sqlBuilder.addText(SqlStatementBlocks.beginGroup);
                set.forEach(function (item, i) {
                    if (i > 0) sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                    var c = Container.createConstantExpression(item);
                    self.Visit(c, sqlBuilder);
                });
                sqlBuilder.addText(SqlStatementBlocks.endGroup);
            } else if (set instanceof $data.Queryable) {
                Guard.raise("not yet... but coming");
            } else {
                Guard.raise(new Exception("Only constant arrays and Queryables can be on the right side of 'in' operator", "UnsupportedType"));
            };
        } else {
            this.Visit(expression.right, sqlBuilder);
        }
        sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },

    VisitConstantExpression: function (expression, sqlBuilder) {
        var value = expression.value;
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(SqlStatementBlocks.parameter);
    },

    VisitEntityFieldExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
    },

    VisitEntitySetExpression: function (expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
    },

    VisitComplexTypeExpression: function (expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression.source.source);
        var storageModel = expression.source.storageModel.ComplexTypes[expression.selector.memberName];
        storageModel.ReferentialConstraint.forEach(function (constrain, index) {
            if (index > 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }
            sqlBuilder.addText(alias);
            sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(constrain[storageModel.From]);
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(this.anonymFiledPrefix + constrain[storageModel.To]);
        }, this);
    },

    VisitMemberInfoExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.MemberInfoExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
        sqlBuilder.addText(expression.memberName);
    },

    VisitObjectLiteralExpression: function (expression, sqlBuilder) {
        //this.hasObjectLiteral = true;
        this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
        sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + SqlStatementBlocks.rowIdName + ", ");

        var membersNumber = expression.members.length;
        for (var i = 0; i < membersNumber; i++) {
            if (i != 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }
            this.Visit(expression.members[i], sqlBuilder);
        }
    },

    VisitObjectFieldExpression: function (expression, sqlBuilder) {

        var tempObjectLiteralName = this.currentObjectLiteralName;
        if (this.currentObjectLiteralName) {
            this.currentObjectLiteralName += '.' + expression.fieldName;
        } else {
            this.currentObjectLiteralName = expression.fieldName;
        }

        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityExpressionAsProjection(expression, sqlBuilder);
        } else {

            var tmpPrefix = this.anonymFiledPrefix;
            this.anonymFiledPrefix += expression.fieldName + "__";


            this.Visit(expression.expression, sqlBuilder);

            this.anonymFiledPrefix = tmpPrefix;

            if (!(expression.expression instanceof $data.Expressions.ObjectLiteralExpression) && !(expression.expression instanceof $data.Expressions.ComplexTypeExpression)) {
                sqlBuilder.addText(SqlStatementBlocks.as);
                sqlBuilder.addText(this.anonymFiledPrefix + expression.fieldName);
            }
        }
        this.currentObjectLiteralName = tempObjectLiteralName;
    }

}, null);$C('$data.sqLite.ExpressionMonitor', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (monitorDefinition) {

        this.Visit = function (expression, context) {

            var result = expression;
            var methodName;
            if (this.canVisit(expression)) {

                //if (monitorDefinition.FilterExpressionNode) {
                            
                //};

                if (monitorDefinition.VisitExpressionNode) {
                    monitorDefinition.VisitExpressionNode.apply(monitorDefinition, arguments);
                };

                methodName = "Visit" + expression.getType().name;
                if (methodName in monitorDefinition) {
                    result = monitorDefinition[methodName].apply(monitorDefinition, arguments);
                }
            }


            //apply is about 3-4 times faster then call on webkit

            var args = arguments;
            if (result !== expression) args = [result, context];
            result = $data.Expressions.EntityExpressionVisitor.prototype.Visit.apply(this, args);

            args = [result, context];

            if (this.canVisit(result)) {
                var expressionTypeName = result.getType().name;
                if (monitorDefinition.MonitorExpressionNode) {
                    monitorDefinition.MonitorExpressionNode.apply(monitorDefinition, args);
                }
                methodName = "Monitor" + expressionTypeName;
                if (methodName in monitorDefinition) {
                    monitorDefinition[methodName].apply(monitorDefinition, args);
                }

                if (monitorDefinition.MutateExpressionNode) {
                    monitorDefinition.MutateExpressionNode.apply(monitorDefinition, args);
                }
                methodName = "Mutate" + expressionTypeName;
                if (methodName in monitorDefinition) {
                    result = monitorDefinition[methodName].apply(monitorDefinition, args);
                }

            }
            return result;
        };
    }

});$C('$data.sqLite.SqlFilterCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    VisitParametricQueryExpression: function (expression, sqlBuilder) {
        this.Visit(expression.expression, sqlBuilder);
    },

    VisitUnaryExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
            sqlBuilder.addText(expression.resolution.mapTo);
            sqlBuilder.addText(SqlStatementBlocks.beginGroup);
            this.Visit(expression.operand, sqlBuilder);
            sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },

    VisitSimpleBinaryExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
        var self = this;

        if (expression.nodeType == "arrayIndex") {
            this.Visit(expression.left, sqlBuilder);
        } else {
            sqlBuilder.addText(SqlStatementBlocks.beginGroup);
            this.Visit(expression.left, sqlBuilder);
            sqlBuilder.addText(" " + expression.resolution.mapTo + " ");

            if (expression.nodeType == "in") {
            //TODO: refactor and generalize
                Guard.requireType("expression.right", expression.right, $data.Expressions.ConstantExpression);
                var set = expression.right.value;
                if (set instanceof Array) {
                    sqlBuilder.addText(SqlStatementBlocks.beginGroup);
                    set.forEach(function(item, i) {
                        if (i > 0) sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                        var c = Container.createConstantExpression(item);
                        self.Visit(c, sqlBuilder);
                    });
                    sqlBuilder.addText(SqlStatementBlocks.endGroup);
                } else if (set instanceof $data.Queryable) {
					sqlBuilder.addText("(SELECT d FROM (" + set.toTraceString().sqlText + "))");
                    //Guard.raise("Not yet... but coming!");
                } else {
                    Guard.raise(new Exception("Only constant arrays and Queryables can be on the right side of 'in' operator", "UnsupportedType"));
                };
            } else {
                this.Visit(expression.right, sqlBuilder);
            }
            
            sqlBuilder.addText(SqlStatementBlocks.endGroup);
        }
    },

    VisitEntitySetExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntitySetExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>

        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
    },
    VisitEntityFieldOperationExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntityFieldOperationExpression"></param>
        /// <param name="sqlBuilder"></param>

        //this.Visit(expression.operation);

        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);
        var opDefinition = expression.operation.memberDefinition;
        var opName = opDefinition.mapTo || opDefinition.name;

        sqlBuilder.addText(opName);
        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
        if (opName === "like") {
            var builder = Container.createSqlBuilder([], sqlBuilder.entityContext);
            builder.selectTextPart("fragment");
            this.Visit(expression.parameters[0], builder);
            var fragment = builder.getTextPart("fragment");
            fragment.params.forEach(function (p) {
                var v = p;
                var paramDef = opDefinition.parameters[0];
                var v = paramDef.prefix ? paramDef.prefix + v : v;
                v = paramDef.suffix ? v + paramDef.suffix : v;
                sqlBuilder.addParameter(v);
            });
            sqlBuilder.addText(fragment.text);
            sqlBuilder.addText(" , ");
            this.Visit(expression.source, sqlBuilder);
        } else {
            this.Visit(expression.source, sqlBuilder);
            expression.parameters.forEach(function (p) {
                sqlBuilder.addText(" , ");
                this.Visit(p, sqlBuilder);
            }, this);
        };

        sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },
    VisitMemberInfoExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.MemberInfoExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>

        sqlBuilder.addText(expression.memberName);
    },
    VisitQueryParameterExpression: function (expression, sqlBuilder) {
        var value = null;
        if (expression.type == "array") {
            value = expression.value[expression.index];
        } else {
            value = expression.value;
        }
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(SqlStatementBlocks.parameter);
    },

    VisitConstantExpression: function (expression, sqlBuilder) {
        var typeNameHintFromValue = Container.getTypeName(expression.value);
        var value = sqlBuilder.entityContext.storageProvider.fieldConverter.toDb[Container.resolveName(Container.resolveType(typeNameHintFromValue))](expression.value);;
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(SqlStatementBlocks.parameter);
    },

    VisitEntityFieldExpression:function(expression, sqlBuilder){
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
    },
    VisitComplexTypeExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
        sqlBuilder.addText("__");
    }
});$C('$data.sqLite.sqLite_ModelBinderCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (query, includes) {
        this._query = query;
        this._includes = includes;
    },
    VisitSingleExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitSomeExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitEveryExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitToArrayExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitFirstExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitForEachExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitCountExpression: function (expression) {
        var builder = Container.createqueryBuilder();
        
        builder.modelBinderConfig['$type'] = $data.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = $data.Integer;
        builder.modelBinderConfig['$source'] = 'cnt';
        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },

    VisitExpression: function (expression, builder) {
        var projVisitor = Container.createFindProjectionVisitor();
        projVisitor.Visit(expression);

        if (projVisitor.projectionExpression) {
            this.Visit(projVisitor.projectionExpression, builder);
        } else {
            this.DefaultSelection(builder);
        }
    },
    _defaultModelBinder: function (expression) {
        var builder = Container.createqueryBuilder();
        builder.modelBinderConfig['$type'] = $data.Array;
        builder.modelBinderConfig['$item'] = {};
        builder.selectModelBinderProperty('$item');

        this.VisitExpression(expression, builder);

        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    _addPropertyToModelBinderConfig: function (elementType, builder) {
        var storageModel = this._query.context._storageModel.getStorageModel(elementType);
        elementType.memberDefinitions.getPublicMappedProperties().forEach(function (prop) {
            if ((!storageModel) || (storageModel && !storageModel.Associations[prop.name] && !storageModel.ComplexTypes[prop.name])) {
                if (prop.key) {
                    if (this.currentObjectFieldName) {
                        builder.addKeyField(this.currentObjectFieldName + '__' + prop.name);
                    } else {
                        builder.addKeyField(prop.name);
                    }
                }
                if (this.currentObjectFieldName) {
                    builder.modelBinderConfig[prop.name] = this.currentObjectFieldName + '__' + prop.name;
                } else {
                    builder.modelBinderConfig[prop.name] = prop.name;
                }
            }
        }, this);
        if (storageModel) {
            this._addComplexTypeProperties(storageModel.ComplexTypes, builder);
        }
    },
    _addComplexTypeProperties: function (complexTypes, builder) {
        complexTypes.forEach(function (ct) {

            builder.selectModelBinderProperty(ct.FromPropertyName);
            builder.modelBinderConfig['$type'] = ct.ToType;
            var tmpPrefix = this.currentObjectFieldName;
            if (this.currentObjectFieldName) {
                this.currentObjectFieldName += '__';
            } else {
                this.currentObjectFieldName = '';
            }
            this.currentObjectFieldName += ct.FromPropertyName;
            //recursion
            this._addPropertyToModelBinderConfig(ct.ToType, builder);
            //reset model binder property
            builder.popModelBinderProperty();
            this.currentObjectFieldName = tmpPrefix;

        }, this);
    },
    DefaultSelection: function (builder) {
        //no projection, get all item from entitySet
        builder.modelBinderConfig['$type'] = this._query.defaultType;
        var storageModel = this._query.context._storageModel.getStorageModel(this._query.defaultType);

        this._addPropertyToModelBinderConfig(this._query.defaultType, builder);
        if (this._includes) {
            this._includes.forEach(function (include) {
                var includes = include.name.split('.');
                var association = null;
                var tmpStorageModel = storageModel;
                for (var i = 0; i < includes.length; i++) {
                    builder.selectModelBinderProperty(includes[i]);
                    association = tmpStorageModel.Associations[includes[i]];
                    tmpStorageModel = this._query.context._storageModel.getStorageModel(association.ToType);
                }

                builder.modelBinderConfig['$selector'] = 'json:' + include.name;
                if (association.ToMultiplicity === '*') {
                    builder.modelBinderConfig['$type'] = $data.Array;
                    builder.selectModelBinderProperty('$item');
                    builder.modelBinderConfig['$type'] = include.type;
                    this._addPropertyToModelBinderConfig(include.type, builder);
                    builder.popModelBinderProperty();
                } else {
                    builder.modelBinderConfig['$type'] = include.type;
                    this._addPropertyToModelBinderConfig(include.type, builder);
                }

                for (var i = 0; i < includes.length; i++) {
                    builder.popModelBinderProperty();
                }
            }, this);
        }
    },
    VisitProjectionExpression: function (expression, builder) {
        this.hasProjection = true;
        this.Visit(expression.selector, builder);
    },
    VisitParametricQueryExpression: function (expression, builder) {
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else {
            this.Visit(expression.expression, builder);
            if (expression.expression instanceof $data.Expressions.EntityFieldExpression) {
                builder.modelBinderConfig['$source'] = 'd';
                builder.modelBinderConfig['$keys'] = ['rowid$$'];
            }
        }

    },
    VisitConstantExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = expression.type;
        builder.modelBinderConfig['$source'] = this.currentObjectFieldName;
    },
    VisitEntityAsProjection: function (expression, builder) {
        this.Visit(expression.source, builder);
        builder.modelBinderConfig['$type'] = expression.entityType;
        this._addPropertyToModelBinderConfig(expression.entityType, builder);
    },

    VisitEntityFieldExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);
    },
    VisitMemberInfoExpression: function (expression, builder) {
        if (expression.memberDefinition instanceof $data.MemberDefinition) {
            builder.modelBinderConfig['$type'] = expression.memberDefinition.type;
            if (expression.memberName in expression.memberDefinition.storageModel.ComplexTypes) {
                this._addPropertyToModelBinderConfig(Container.resolveType(expression.memberDefinition.type), builder);
            } else {
                builder.modelBinderConfig['$source'] = this.currentObjectFieldName;
            }
        }
    },
    VisitEntitySetExpression: function (expression, builder) {
        if (expression.source instanceof $data.Expressions.EntityExpression) {
            this.Visit(expression.source, builder);
            this.Visit(expression.selector, builder);
        }

    },
    VisitEntityExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
    },
    VisitAssociationInfoExpression: function (expression, builder) {
        if (('$selector' in builder.modelBinderConfig) && (builder.modelBinderConfig.$selector.length > 0)) {
            builder.modelBinderConfig.$selector += '.';
        } else {
            builder.modelBinderConfig['$selector'] = 'json:';
        }
        builder.modelBinderConfig['$selector'] += expression.associationInfo.FromPropertyName;
    },
    VisitSimpleBinaryExpression: function (expression, builder) {
        this.Visit(expression.left, builder);
        this.Visit(expression.right, builder);
        builder.modelBinderConfig['$type'] = undefined;
    },
    VisitObjectLiteralExpression: function (expression, builder) {
        if (this.currentObjectFieldName) {
            builder.modelBinderConfig['$keys'] = [this.currentObjectFieldName + '__rowid$$'];
        } else {
            builder.modelBinderConfig['$keys'] = ['rowid$$'];
        }
        builder.modelBinderConfig['$type'] = $data.Object;
        expression.members.forEach(function (of) {
            this.Visit(of, builder);
        }, this);
    },
    VisitObjectFieldExpression: function (expression, builder) {
        var tempFieldName = this.currentObjectFieldName;
        builder.selectModelBinderProperty(expression.fieldName);
        if (this.currentObjectFieldName) {
            this.currentObjectFieldName += '__';
        } else {
            this.currentObjectFieldName = '';
        }
        this.currentObjectFieldName += expression.fieldName;

        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else {
            this.Visit(expression.expression, builder);
        }

        this.currentObjectFieldName = tempFieldName;

        builder.popModelBinderProperty();
    }
});