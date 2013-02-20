$data.Class.define('$data.dbClient.Transaction', null, null, {
    constructor: function () {
        this._objectId = (new Date()).getTime();
        $data.Trace.log("create: ", this._objectId);

        this.oncomplete = new $data.Event("oncomplete", this);
        this.onerror = new $data.Event("onerror", this);
        //this.onabort = new $data.Event("onabort", this);
    },
    abort: function () {
        Guard.raise(new Exception('Not Implemented', 'Not Implemented', arguments));
    },

    _objectId: { type: $data.Integer },
    transaction: { type: $data.Object },

    oncomplete: { type: $data.Event },
    onerror: { type: $data.Event },
    //onabort: { type: $data.Event }
}, null);