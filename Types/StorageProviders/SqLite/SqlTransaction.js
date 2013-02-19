$data.Class.define('$data.dbClient.Transaction', null, null, {
    abort: function () {
        console.log("onabort: ", this._objectId);
        this.aborted = true;
        Guard.raise(new Exception('User Abort', 'Exception', arguments));
    }
}, null);