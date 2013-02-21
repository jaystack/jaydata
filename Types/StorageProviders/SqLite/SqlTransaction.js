$data.Class.define('$data.sqLite.SqlTransaction', $data.dbClient.Transaction, null, {
    abort: function () {
        console.log("onabort: ", this._objectId);
        Guard.raise(new Exception('User Abort', 'Exception', arguments));
    }
}, null);