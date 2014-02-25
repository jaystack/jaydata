// JayData 1.3.6
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki, Gábor Dolla
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
    executeNonQuery: function (callback, tran, isWrite) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error, tran, isWrite);
    },
    executeQuery: function (callback, tran, isWrite) {
        callback = $data.typeSystem.createCallbackSetting(callback);
        this.exec(this.query, this.parameters, callback.success, callback.error, tran, isWrite);
    },
    exec: function (query, parameters, callback, errorhandler, transaction, isWrite) {
        // suspicious code
        /*if (console) {
            //console.log(query);
        }*/
        this.connection.open({
            error: errorhandler,
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
                        callback(single ? results[0] : results, transaction);
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
                                } catch (e) {}
                                if (typeof r.insertId !== 'number') {
                                    // If insertId is present, no rows are returned
                                    r.rowsAffected = result.rowsAffected;
                                    var maxItem = result.rows.length;
                                    for (var j = 0; j < maxItem; j++) {
                                        r.rows.push(result.rows.item(j));
                                    }
                                }
                                results[i] = r;
                                decClb(trx);
                            },
                            function (trx, err) {
                                var _q = q;
                                var _i = i;

                                if (errorhandler)
                                    errorhandler(err);

                                return true;
                            }
                        );
                    } else {
                        results[i] = null;
                        decClb();
                    }
                });
            }
        }, transaction, isWrite);
    }
}, null);$data.Class.define('$data.dbClient.openDatabaseClient.OpenDbConnection', $data.dbClient.DbConnection, null,
{
    constructor: function (params) {
        this.connectionParams = params;
    },
    isOpen: function () {
        return this.database !== null && this.database !== undefined && this.transaction !== null && this.transaction !== undefined;
    },
    open: function (callBack, tran, isWrite) {
        if (isWrite === undefined)
            isWrite = true;

        callBack.oncomplete = callBack.oncomplete || function () { };
        if (tran) {
            callBack.success(tran.transaction);
        } else if (this.database) {
            if (isWrite) {
                this.database.transaction(function (tran) { callBack.success(tran); }, callBack.error, callBack.oncomplete);
            } else {
                this.database.readTransaction(function (tran) { callBack.success(tran); }, callBack.error, callBack.oncomplete);
            }
        } else {
            var p = this.connectionParams;
            var con = this;
            this.database = openDatabase(p.fileName, p.version, p.displayName, p.maxSize);
            if (!this.database.readTransaction) {
                this.database.readTransaction = function () {
                    con.database.transaction.apply(con.database, arguments);
                }
            }

            if (isWrite) {
                this.database.transaction(function (tran) { callBack.success(tran); }, callBack.error, callBack.oncomplete);
            } else {
                this.database.readTransaction(function (tran) { callBack.success(tran); }, callBack.error, callBack.oncomplete);
            }
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
}, null);
$data.Class.define('$data.dbClient.jayStorageClient.JayStorageCommand', $data.dbClient.DbCommand, null,
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
}, null);$data.SqLiteConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        "$data.Integer": $data.Container.proxyConverter,
        "$data.Int32": $data.Container.proxyConverter,
        "$data.Number": $data.Container.proxyConverter,
        "$data.Date": function (dbData) { return dbData != null ? new Date(dbData) : dbData; },
        "$data.DateTimeOffset": function (dbData) { return dbData != null ? new Date(dbData) : dbData; },
        "$data.Time": $data.Container.proxyConverter,
        "$data.String": $data.Container.proxyConverter,
        "$data.Boolean": function (b) { return b === 1 ? true : false; },
        "$data.Blob": function(b){ return b ? $data.Container.convertTo(atob(b), $data.Blob) : b; },
        "$data.Array": function () {
            if (arguments.length == 0) return [];
            return arguments[0] ? JSON.parse(arguments[0]) : undefined;
        },
        "$data.Guid": function (g) { return g ? $data.parseGuid(g).toString() : g; },
        '$data.GeographyPoint': function (g) { if (g) { return new $data.GeographyPoint(JSON.parse(g)); } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return new $data.GeographyLineString(JSON.parse(g)); } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return new $data.GeographyPolygon(JSON.parse(g)); } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return new $data.GeographyMultiPoint(JSON.parse(g)); } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return new $data.GeographyMultiLineString(JSON.parse(g)); } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return new $data.GeographyMultiPolygon(JSON.parse(g)); } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return new $data.GeographyCollection(JSON.parse(g)); } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return new $data.GeometryPoint(JSON.parse(g)); } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return new $data.GeometryLineString(JSON.parse(g)); } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return new $data.GeometryPolygon(JSON.parse(g)); } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return new $data.GeometryMultiPoint(JSON.parse(g)); } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return new $data.GeometryMultiLineString(JSON.parse(g)); } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return new $data.GeometryMultiPolygon(JSON.parse(g)); } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return new $data.GeometryCollection(JSON.parse(g)); } return g; }
    },
    toDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        "$data.Integer": $data.Container.proxyConverter,
        "$data.Int32": $data.Container.proxyConverter,
        "$data.Number": $data.Container.proxyConverter,
        "$data.Date": function (date) { return date ? date.valueOf() : null; },
        "$data.DateTimeOffset": function (date) { return date ? date.valueOf() : null; },
        "$data.Time": $data.Container.proxyConverter,
        "$data.String": $data.Container.proxyConverter,
        "$data.Boolean": function (b) { return b ? 1 : 0; },
        "$data.Blob": function(b){ return b ? $data.Blob.toBase64(b) : b; },
        "$data.Array": function (arr) { return arr ? JSON.stringify(arr) : arr; },
        "$data.Guid": function (g) { return g ? g.toString() : g; },
        "$data.Object": function (value) { if (value === null) { return null; } throw 'Not supported exception'; },
        '$data.GeographyPoint': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return JSON.stringify(g); } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return JSON.stringify(g); } return g; }
    }
};

$data.SqLiteFieldMapping = {
    '$data.Byte': "INTEGER",
    '$data.SByte': "INTEGER",
    '$data.Decimal': "TEXT",
    '$data.Float': "REAL",
    '$data.Int16': "INTEGER",
    '$data.Int64': "TEXT",
    "$data.Integer": "INTEGER",
    "$data.Int32": "INTEGER",
    "$data.Number": "REAL",
    "$data.Date": "REAL",
    "$data.Time": "TEXT",
    "$data.DateTimeOffset": "REAL",
    "$data.String": "TEXT",
    "$data.Boolean": "INTEGER",
    "$data.Blob": "BLOB",
    "$data.Array": "TEXT",
    "$data.Guid": "TEXT",
    "$data.Object": "TEXT",
    '$data.GeographyPoint': "TEXT",
    '$data.GeographyLineString': "TEXT",
    '$data.GeographyPolygon': "TEXT",
    '$data.GeographyMultiPoint': "TEXT",
    '$data.GeographyMultiLineString': "TEXT",
    '$data.GeographyMultiPolygon': "TEXT",
    '$data.GeographyCollection': "TEXT",
    '$data.GeometryPoint': "TEXT",
    '$data.GeometryLineString': "TEXT",
    '$data.GeometryPolygon': "TEXT",
    '$data.GeometryMultiPoint': "TEXT",
    '$data.GeometryMultiLineString': "TEXT",
    '$data.GeometryMultiPolygon': "TEXT",
    '$data.GeometryCollection': "TEXT"
};
$data.Class.define('$data.storageProviders.sqLite.SqLiteStorageProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg, context) {
        this.SqlCommands = [];
        this.context = context;
        this.providerConfiguration = $data.typeSystem.extend({
            databaseName: $data.defaults.defaultDatabaseName,
            version: "",
            displayName: "JayData default db",
            maxSize: 1024 * 1024,
            dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged
        }, cfg);
        
        this.providerName = '';
        for (var i in $data.RegisteredStorageProviders) {
            if ($data.RegisteredStorageProviders[i] === this.getType()) {
                this.providerName = i;
            }
        }
        
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
    //$data.Array, 
    supportedDataTypes: {
        value: [$data.Array, $data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date, $data.Guid, $data.GeographyPoint,
            $data.GeographyLineString, $data.GeographyPolygon, $data.GeographyMultiPoint, $data.GeographyMultiLineString, $data.GeographyMultiPolygon, $data.GeographyCollection,
            $data.GeometryPoint, $data.GeometryLineString, $data.GeometryPolygon, $data.GeometryMultiPoint, $data.GeometryMultiLineString, $data.GeometryMultiPolygon, $data.GeometryCollection,
            $data.Byte, $data.SByte, $data.Decimal, $data.Float, $data.Int16, $data.Int32, $data.Int64, $data.Time, $data.DateTimeOffset],
        writable: false
    },
    fieldConverter: { value: $data.SqLiteConverter },

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
            equal: { mapTo: '=', dataType: "boolean", nullMap: ' is null' },
            notEqual: { mapTo: '!=', dataType: "boolean", nullMap: ' is not null' },
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

    supportedAutoincrementKeys: {
        value:{
            '$data.Integer': true,
            '$data.Int32': true,
            '$data.Guid': function () { return $data.createGuid(); }
        }       
    },

    initializeStore: function (callBack) {
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
                            var regEx = new RegExp('^CREATE TABLE IF NOT EXISTS ([^ ]*) (\\(.*\\))', 'g');
                            var data = regEx.exec(that.SqlCommands[i]);
                            if (data) {
                                var tableName = data[1];
                                var tableDef = data[2];
                                if (existObjectInDB[tableName.slice(1, tableName.length - 1)]) {
                                    var regex = new RegExp('\\(.*\\)', 'g');
                                    var existsRegExMatches = existObjectInDB[tableName.slice(1, tableName.length - 1)].sql.match(regex);

                                    if (!existsRegExMatches || tableDef.toLowerCase() != existsRegExMatches[0].toLowerCase()) {
                                        deleteCmd.push("DROP TABLE IF EXISTS [" + existObjectInDB[tableName.slice(1, tableName.length - 1)].tbl_name + "];");
                                    }
                                }
                            }
                            else {
                                //console.dir(regEx);
                                //console.dir(that.SqlCommands[i]);
                            }
                        }
                        that.SqlCommands = that.SqlCommands.concat(deleteCmd);
                        //console.log(deleteCmd);
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
            try {
                provider.saveIndependentItems(convertedItems, sqlConnection, {
                    success: function () {
                        provider.postProcessItems(convertedItems);
                        saveNextIndependentBlock();
                    },
                    error: callback.error
                });
            } catch (e) {
                callback.error(e);
            }
            
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
        var deleteSqlString = "DELETE FROM [" + item.entitySet.tableName + "] WHERE(";
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
                    var logicalFieldDef = item.data.getType().memberDefinitions.getMember(fieldDef.name);
                    if (logicalFieldDef && logicalFieldDef.converter && logicalFieldDef.converter[this.providerName] && typeof logicalFieldDef.converter[this.providerName].toDb == 'function'){
                        deleteParam.push(logicalFieldDef.converter[this.providerName].toDb(item.data[logicalFieldDef.name], logicalFieldDef, this.context, logicalFieldDef.dataType));
                    }else{
                        deleteParam.push(this.fieldConverter.toDb[Container.resolveName(fieldDef.dataType)](item.data[fieldDef.name]));
                    }
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
                    var logicalFieldDef = item.data.getType().memberDefinitions.getMember(fieldDef.name);
                    if (logicalFieldDef && logicalFieldDef.converter && logicalFieldDef.converter[this.providerName] && typeof logicalFieldDef.converter[this.providerName].toDb == 'function'){
                        whereParam.push(logicalFieldDef.converter[this.providerName].toDb(item.physicalData[logicalFieldDef.name], fieldDef, this.context, logicalFieldDef.dataType));
                    }else{
                        whereParam.push(this.fieldConverter.toDb[Container.resolveName(fieldDef.dataType)](item.physicalData[fieldDef.name]));
                    }
                    hasCondition = true;
                }
                else {
                    setSection += "[" + fieldDef.name + "] = ?";
                    var logicalFieldDef = item.data.getType().memberDefinitions.getMember(fieldDef.name);
                    if (logicalFieldDef && logicalFieldDef.converter && logicalFieldDef.converter[this.providerName] && typeof logicalFieldDef.converter[this.providerName].toDb == 'function'){
                        setParam.push(fieldDef.converter[this.providerName].toDb(item.physicalData[logicalFieldDef.name], logicalFieldDef, this.context, logicalFieldDef.dataType));
                    }else{
                        setParam.push(this.fieldConverter.toDb[Container.resolveName(fieldDef.dataType)](item.physicalData[fieldDef.name]));
                    }
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
            if (fieldDef.key && !fieldDef.computed && Object.isNullOrUndefined(item.physicalData[fieldDef.name])) {
                Guard.raise(new Exception('Key is not set', 'Value exception', item));
                return;
            }
            if (fieldDef.key && fieldDef.computed && Object.isNullOrUndefined(item.physicalData[fieldDef.name])) {
                var typeName = Container.resolveName(fieldDef.type);
                if (typeof this.supportedAutoincrementKeys[typeName] === 'function') {
                    item.physicalData[fieldDef.name] = this.supportedAutoincrementKeys[typeName]();
                }
            }

            if (fieldList.length > 0 && fieldList[fieldList.length - 1] != ",") { fieldList += ","; fieldValue += ","; }
            var fieldName = fieldDef.name;
            if (/*item.physicalData[fieldName] !== null && */item.physicalData[fieldName] !== undefined) {
                if (fieldDef.dataType && (!fieldDef.dataType.isAssignableTo || (fieldDef.dataType.isAssignableTo && !fieldDef.dataType.isAssignableTo($data.EntitySet)))) {
                    fieldValue += '?';
                    fieldList += "[" + fieldName + "]";
                    var logicalFieldDef = item.data.getType().memberDefinitions.getMember(fieldDef.name);
                    if (logicalFieldDef && logicalFieldDef.converter && logicalFieldDef.converter[this.providerName] && typeof logicalFieldDef.converter[this.providerName].toDb == 'function'){
                        fieldParam.push(logicalFieldDef.converter[this.providerName].toDb(item.physicalData[fieldName], logicalFieldDef, this.context, logicalFieldDef.dataType));
                    }else{
                        fieldParam.push(this.fieldConverter.toDb[Container.resolveName(fieldDef.dataType)](item.physicalData[fieldName]));
                    }
                }
            }

        }, this);
        if (fieldParam.length < 1) {
            insertSqlString = "INSERT INTO [" + item.entitySet.tableName + "] Default values";
        } else {
            if (fieldList[fieldList.length - 1] == ",") { fieldList = fieldList.slice(0, fieldList.length - 1); }
            if (fieldValue[fieldValue.length - 1] == ",") { fieldValue = fieldValue.slice(0, fieldValue.length - 1); }
            insertSqlString += fieldList + ") VALUES(" + fieldValue + ");";
        }
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
        
        memberDef.PhysicalType.memberDefinitions.getKeyProperties().forEach(function (item, index) {
            var typeName = Container.resolveName(item.type);
            if (item.computed && !(typeName in this.supportedAutoincrementKeys)) {
                console.log("WARRNING! '" + typeName + "' not supported as computed Key!");
            }
        }, this);

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

            var typeName = Container.resolveName(this.fld.dataType);
            var mapping = $data.SqLiteFieldMapping[typeName];

            if (mapping) {
                this.buildFieldNameAndType(mapping);
            } else {
                this.buildRelations();
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

                var typeName = Container.resolveName(this.fld.dataType);
                if (this.provider.supportedAutoincrementKeys[typeName] === true) {
                    this.buildAutoIncrement();
                }
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
        var sqlBuilder = $data.sqLite.SqlBuilder.create(this.sets, this.entityContext);
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
        var filterCompiler = $data.sqLite.SqlFilterCompiler.create();
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
        var orderCompiler = $data.sqLite.SqlOrderCompiler.create();
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
        var pagingCompiler = $data.sqLite.SqlPagingCompiler.create();
        pagingCompiler.Visit(expression, sqlBuilder);
        return expression;
    },
    VisitProjectionExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('projection');
        this.hasProjection = true;
        sqlBuilder.addText(SqlStatementBlocks.select);
        var projectonCompiler = $data.sqLite.SqlProjectionCompiler.create();
        projectonCompiler.Visit(expression, sqlBuilder);
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
                    if(index > 0){
                        sqlBuilder.addText(" AND ");
                    }
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
        var needAlias = this.infos.filter(function (i) { return i.IsMapped; }).length > 1;
        if (sqlBuilder.sets.length > 1) {
            sqlBuilder.addText(SqlStatementBlocks.select);
            sqlBuilder.sets.forEach(function (set, masterIndex) {

                if (this.infos[masterIndex].IsMapped) {
                    var alias = sqlBuilder.getExpressionAlias(set);
                    set.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberDef, index) {
                        if (index > 0 || masterIndex > 0) {
                            sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                        }
                        sqlBuilder.addText(alias + ".");
                        sqlBuilder.addText(memberDef.name);
                        if (needAlias) {
                            sqlBuilder.addText(SqlStatementBlocks.as);
                            sqlBuilder.addText(alias + "__" + memberDef.name);
                        }
                    }, this);
                }

            }, this);

        }
        else {
            sqlBuilder.addText("SELECT *");
        }
    }
});

$data.Expressions.ExpressionNode.prototype.monitor = function (monitorDefinition, context) {
    var m = $data.sqLite.SqlExpressionMonitor.create(monitorDefinition);
    return m.Visit(this, context);
};

$C('$data.storageProviders.sqLite.SQLiteCompiler', null, null, {
    compile: function (query) {
        /// <param name="query" type="$data.Query" />
        var expression = query.expression;
        var context = { sets: [], infos: [], entityContext: query.context };

        var optimizedIncludeExpression = expression.monitor({
            MonitorEntitySetExpression: function (expression, context) {
                if (expression.source instanceof $data.Expressions.EntityContextExpression && context.sets.indexOf(expression) == -1) {
                    this.backupEntitySetExpression = expression;
                }
            },
            VisitCountExpression: function (expression, context) {
                context.hasCountFrameOperator = true;
                return expression;
            },
            MutateIncludeExpression: function (expression, context) {
                var result = null;
                if (context.hasCountFrameOperator) {
                    result = expression.source;
                }
                else {
                    var origSelector = expression.selector.value;
                    Container.createCodeExpression("function(it){return it." + origSelector + ";}", null);

                    var jsCodeTree = Container.createCodeParser(this.backupEntitySetExpression.source.instance).createExpression("function(it){return it." + origSelector + ";}");
                    var code2entity = Container.createCodeToEntityConverter(this.backupEntitySetExpression.source.instance);
                    var includeSelector = code2entity.Visit(jsCodeTree, { queryParameters: undefined, lambdaParameters: [this.backupEntitySetExpression] });

                    result = Container.createIncludeExpression(expression.source, includeSelector);
                }
                return result;
            }
        }, context);

        var optimizedExpression = optimizedIncludeExpression.monitor({
            MonitorEntitySetExpression: function (expression, context) {
                if (expression.source instanceof $data.Expressions.EntityContextExpression && context.sets.indexOf(expression) == -1) {
                    context.sets.push(expression);
                    context.infos.push({ AliasNumber: 0, Association: null, FromType: null, FromPropertyName: null, IsMapped: true });
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
                var memberDefinitions = this.backupContextExpression.instance.getType().memberDefinitions.getMember(expression.storageModel.ItemName);
                if (!memberDefinitions) {
                    Guard.raise("Context schema error");
                }
                var mi = Container.createMemberInfoExpression(memberDefinitions);
                var result = Container.createEntitySetExpression(this.backupContextExpression, mi);
                result.instance = this.backupContextExpression.instance[expression.storageModel.ItemName];
                var aliasNum = context.sets.push(result);
                context.infos.push({
                    AliasNumber: aliasNum - 1,
                    Association: expression.selector,
                    NavigationPath: this.path,
                    IsMapped: this.isMapped
                });
                return result;
            }
        }, context);

        var compiler = $data.sqLite.SqlCompiler.create(optimizedExpression, context);
        compiler.compile();

        var sqlBuilder = $data.sqLite.SqlBuilder.create(this.sets, this.entityContext);

        query.modelBinderConfig = {};
        var modelBinder = $data.sqLite.sqLite_ModelBinderCompiler.create(query, context);
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
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + SqlStatementBlocks.rowIdName + ", ");
            this.VisitEntityExpressionAsProjection(expression, sqlBuilder);
        }
        else if (expression.expression instanceof $data.Expressions.EntitySetExpression) {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + SqlStatementBlocks.rowIdName + ", ");
            this.anonymFiledPrefix = sqlBuilder.getExpressionAlias(expression.expression) + '__'
            this.MappedFullEntitySet(expression.expression, sqlBuilder);
        }
        else if (expression.expression instanceof $data.Expressions.ObjectLiteralExpression) {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + SqlStatementBlocks.rowIdName + ", ");
            this.Visit(expression.expression, sqlBuilder);
        } else {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid");
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(SqlStatementBlocks.rowIdName);
            sqlBuilder.addText(', ');
            sqlBuilder.addKeyField(SqlStatementBlocks.rowIdName);
            this.Visit(expression.expression, sqlBuilder);
            if (!(expression.expression instanceof $data.Expressions.ComplexTypeExpression)) {
                sqlBuilder.addText(SqlStatementBlocks.as);
                sqlBuilder.addText(SqlStatementBlocks.scalarFieldName);
            }
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
            var builder = $data.sqLite.SqlBuilder.create();
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
        if (expression.source instanceof $data.Expressions.ComplexTypeExpression) {
            var alias = sqlBuilder.getExpressionAlias(expression.source.source.source);
            var storageModel = expression.source.source.storageModel.ComplexTypes[expression.source.selector.memberName];
            var member = storageModel.ReferentialConstraint.filter(function (item) { return item[expression.source.selector.memberName] == expression.selector.memberName; })[0];
            if (!member) { Guard.raise(new Exception('Compiler error! ComplexType does not contain ' + expression.source.selector.memberName + ' property!')); return;}

            sqlBuilder.addText(alias);
            sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(member[storageModel.From]);
        }
        else {
            this.Visit(expression.source, sqlBuilder);
            this.Visit(expression.selector, sqlBuilder);
        }
        
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
        var membersNumber = expression.members.length;
        for (var i = 0; i < membersNumber; i++) {
            if (i != 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }
            this.Visit(expression.members[i], sqlBuilder);
        }
    },
    MappedFullEntitySet: function (expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression);
        var properties = expression.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties();
        properties.forEach(function (prop, index) {
            if (!prop.association) {
                if (index > 0) {
                    sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                }
                sqlBuilder.addText(alias);
                sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
                sqlBuilder.addText(prop.name);
                sqlBuilder.addText(SqlStatementBlocks.as);
                sqlBuilder.addText(this.anonymFiledPrefix + prop.name);
            }
        }, this);
        //ToDo: complex type
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

            if (expression.expression instanceof $data.Expressions.EntitySetExpression) {
                this.MappedFullEntitySet(expression.expression, sqlBuilder);
            } else {
                this.Visit(expression.expression, sqlBuilder);
            }

            this.anonymFiledPrefix = tmpPrefix;

            if (!(expression.expression instanceof $data.Expressions.ObjectLiteralExpression) && !(expression.expression instanceof $data.Expressions.ComplexTypeExpression) && !(expression.expression instanceof $data.Expressions.EntitySetExpression)) {
                sqlBuilder.addText(SqlStatementBlocks.as);
                sqlBuilder.addText(this.anonymFiledPrefix + expression.fieldName);
            }
        }
        this.currentObjectLiteralName = tempObjectLiteralName;
    }

}, null);$C('$data.sqLite.SqlExpressionMonitor', $data.Expressions.ExpressionMonitor, null, {
    constructor: function (monitorDefinition) {
        this.VisitIncludeExpression = function (expression, context) {
            var newSourceExpression = this.Visit(expression.source, context);
            monitorDefinition.isMapped = true;
            var newSelectorExpresion = this.Visit(expression.selector, context);
            monitorDefinition.isMapped = false;

            if (newSourceExpression !== expression.source || newSelectorExpresion !== expression.selector) {
                return Container.createIncludeExpression(newSourceExpression, newSelectorExpresion);
            }
            return expression;
        };
        this.VisitProjectionExpression = function (expression, context) {
            var source = this.Visit(expression.source, context);
            monitorDefinition.isMapped = true;
            var selector = this.Visit(expression.selector, context);
            monitorDefinition.isMapped = false;
            if (source !== expression.source || selector !== expression.selector) {
                var expr = Container.createProjectionExpression(source, selector, expression.params, expression.instance);
                expr.projectionAs = expression.projectionAs;
                return expr;
            }
            return expression;
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

            //check null filter
            if (expression.left instanceof $data.Expressions.EntityFieldExpression && expression.right instanceof $data.Expressions.ConstantExpression && expression.right.value === null) {
                this.Visit(expression.left, sqlBuilder);
                sqlBuilder.addText(expression.resolution.nullMap);
            } else if (expression.right instanceof $data.Expressions.EntityFieldExpression && expression.left instanceof $data.Expressions.ConstantExpression && expression.left.value === null) {
                this.Visit(expression.right, sqlBuilder);
                sqlBuilder.addText(expression.resolution.nullMap);
            } else {
                this.Visit(expression.left, sqlBuilder);
                sqlBuilder.addText(" " + expression.resolution.mapTo + " ");

                if (expression.nodeType == "in") {
                    //TODO: refactor and generalize
                    Guard.requireType("expression.right", expression.right, $data.Expressions.ConstantExpression);
                    var set = expression.right.value;
                    if (set instanceof Array) {
                        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
                        set.forEach(function (item, i) {
                            if (i > 0) sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                            self.Visit(item, sqlBuilder);
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
            var builder = $data.sqLite.SqlBuilder.create([], sqlBuilder.entityContext);
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
        //var typeNameHintFromValue = Container.getTypeName(expression.value);
        var value = sqlBuilder.entityContext.storageProvider.fieldConverter.toDb[Container.resolveName(Container.resolveType(expression.type))](expression.value);;
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
    constructor: function (query, context) {
        this._query = query;
        this.sqlContext = context;
        this._sqlBuilder = $data.sqLite.SqlBuilder.create(context.sets, context.entityContext);
    },
    VisitSingleExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitSomeExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitFindExpression: function (expression) {
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
        
        var needPrefix = this.sqlContext.infos.filter(function (i) { return i.IsMapped; }).length > 1;
        if (needPrefix) {
            this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(this.sqlContext.sets[0]);
        }
        this._addPropertyToModelBinderConfig(this._query.defaultType, builder);
        this.sqlContext.infos.forEach(function (info, infoIndex) {
            if (infoIndex > 0 && info.IsMapped) {
                var pathFragments = info.NavigationPath.split('.');
                pathFragments.shift();
                pathFragments.forEach(function (pathFragment, index) {
                    if (!pathFragment) { return; }
                    if (!builder.modelBinderConfig[pathFragment]) {
                        builder.selectModelBinderProperty(pathFragment);
                        var isArray = false;
                        if (info.Association.associationInfo.ToMultiplicity === '*' && pathFragments.length - 1 === index) {
                            builder.modelBinderConfig['$type'] = $data.Array;
                            builder.selectModelBinderProperty('$item');
                            isArray = true;
                        }

                        builder.modelBinderConfig['$type'] = this.sqlContext.sets[infoIndex].elementType;
                        this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(this.sqlContext.sets[infoIndex]);
                        this._addPropertyToModelBinderConfig(this.sqlContext.sets[infoIndex].elementType, builder);
                        if (isArray) { builder.popModelBinderProperty(); }
                    } else {
                        builder.selectModelBinderProperty(pathFragment);
                    }
                }, this);
                for (var i = 0; i < pathFragments.length; i++) {
                    builder.popModelBinderProperty();
                }
            }
        }, this);
    },
    VisitProjectionExpression: function (expression, builder) {
        this.hasProjection = true;
        this.Visit(expression.selector, builder);

        if (expression.selector && expression.selector.expression instanceof $data.Expressions.ObjectLiteralExpression) {
            builder.modelBinderConfig['$type'] = expression.projectionAs || builder.modelBinderConfig['$type'] || $data.Object;
        }
    },
    VisitParametricQueryExpression: function (expression, builder) {
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
            builder.modelBinderConfig['$keys'].unshift('rowid$$');
        } else if (expression.expression instanceof $data.Expressions.EntitySetExpression) {
            this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(expression.expression);
            this.VisitEntitySetAsProjection(expression.expression, builder);
            builder.modelBinderConfig['$keys'] = ['rowid$$'];
        } else if (expression.expression instanceof $data.Expressions.ComplexTypeExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else {
            builder.modelBinderConfig['$keys'] = ['rowid$$'];
            this.Visit(expression.expression, builder);
            if (expression.expression instanceof $data.Expressions.EntityFieldExpression) {
                builder.modelBinderConfig['$source'] = 'd';
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
    VisitEntitySetAsProjection: function (expression, builder) {
        builder.modelBinderConfig['$type'] = $data.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = expression.elementType;
        this._addPropertyToModelBinderConfig(expression.elementType, builder);
        builder.popModelBinderProperty();
    },
    VisitComplexTypeExpression: function (expression, builder) {
        return expression;
    },
    VisitEntityFieldExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);
    },
    VisitMemberInfoExpression: function (expression, builder) {
        if (expression.memberDefinition instanceof $data.MemberDefinition) {
            builder.modelBinderConfig['$type'] = expression.memberDefinition.type;
            if (expression.memberDefinition.storageModel && expression.memberName in expression.memberDefinition.storageModel.ComplexTypes) {
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

        if (expression.expression instanceof $data.Expressions.EntityExpression || expression.expression instanceof $data.Expressions.ComplexTypeExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else if(expression.expression instanceof $data.Expressions.EntitySetExpression){
            this.VisitEntitySetAsProjection(expression.expression, builder);
        }
        else {
            this.Visit(expression.expression, builder);
        }

        this.currentObjectFieldName = tempFieldName;

        builder.popModelBinderProperty();
    }
});