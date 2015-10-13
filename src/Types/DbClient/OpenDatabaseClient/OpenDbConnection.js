$data.Class.define('$data.dbClient.openDatabaseClient.OpenDbConnection', $data.dbClient.DbConnection, null,
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
