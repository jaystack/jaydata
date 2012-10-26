$data.Class.define('$data.dbClient.jayStorageClient.JayStorageConnection', $data.dbClient.DbConnection, null,
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
}, null);