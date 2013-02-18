$data.Class.define('$data.storageProviders.IndexedDB.IndexedDBTransaction', $data.dbClient.Transaction, null, {
    abort: function () {
        console.log("tranWrapper onabort: ", self._objectId);
        this.transaction.abort();
    }
}, null);