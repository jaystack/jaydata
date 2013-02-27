$data.Class.define('$data.sqLitePro.SqlTransaction', $data.Transaction, null, {
    abort: function () {
        console.log("onabort: ", this._objectId);
        Guard.raise(new Exception('User Abort', 'Exception', arguments));
    }
}, null);