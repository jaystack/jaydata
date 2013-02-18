$data.Class.define('$data.dbClient.Transaction', null, null, {
    constructor: function () {
        this.create = (new Date()).getTime();
        console.log("create: ", this.create);

        this.oncomplete = new $data.Event("oncomplete", this);
        this.onerror = new $data.Event("onerror", this);
        this.onabort = new $data.Event("onabort", this);
    },
    create: { type: $data.Date },
    transaction: { type: $data.Object },

    oncomplete: { type: $data.Event },
    onerror: { type: $data.Event },
    onabort: { type: $data.Event }
}, null);