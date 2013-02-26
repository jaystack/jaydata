$data.Class.define('$data.dbClient.openDatabaseClient.OpenDbConnection', $data.dbClient.DbConnection, null,
{
    constructor: function (params) {
        this.connectionParams = params;
    },
    isOpen: function () {
        return this.database !== null && this.database !== undefined && this.transaction !== null && this.transaction !== undefined;
    },
    open: function (callBack) {
		if (this.database){
		    this.database.transaction(function (tran) { callBack.success(tran); }, callBack.error);
        } else {
            var p = this.connectionParams;
            var con = this;
			this.database = openDatabase(p.fileName, p.version, p.displayName, p.maxSize);
			this.database.transaction(function (tran) { callBack.success(tran); }, callBack.error);
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