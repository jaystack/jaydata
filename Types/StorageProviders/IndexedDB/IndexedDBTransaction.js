$data.Class.define('$data.storageProviders.IndexedDB.IndexedDBTransaction', $data.dbClient.Transaction, null, {
    abort: function () {
        $data.Trace.log("onabort: ", this._objectId);
        this.transaction.abort();
    }
}, null);