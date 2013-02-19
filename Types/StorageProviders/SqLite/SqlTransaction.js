$data.Class.define('$data.sqLite.SqlTransaction', $data.dbClient.Transaction, null, {
    abort: function () {
        console.log("onabort: ", this._objectId);
        this.aborted = true;
        Guard.raise(new Exception('User Abort', 'Exception', arguments));
    }
}, null);