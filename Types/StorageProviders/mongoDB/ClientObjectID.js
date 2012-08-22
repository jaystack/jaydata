$data.Class.define('$data.storageProviders.mongoDB.mongoDBProvider.ClientObjectID', null, null, {
    constructor: function(){
        var time = Math.floor(new Date().getTime() / 1000).toString(16);
        
        var b64ua = btoa(navigator.userAgent);
        var machine = (b64ua.charCodeAt(0) + b64ua.charCodeAt(1)).toString(16) + (b64ua.charCodeAt(2) + b64ua.charCodeAt(3)).toString(16) + (b64ua.charCodeAt(4) + b64ua.charCodeAt(5)).toString(16);
        
        var pid = ('0000' + Math.floor(Math.random() * 0xffff).toString(16)).slice(-4);
        var inc = ('000000' + (++$data.storageProviders.mongoDB.mongoDBProvider.ObjectID.idSeed).toString(16)).slice(-6);
        
        this.value = time + machine + pid + inc;
    },
    value: { value: null }
}, {
    valueOf: function(){
        return this.value;
    },
    toString: function(){
        return this.value;
    },
    toLocaleString: function(){
        return this.value;
    },
    idSeed: { value: Math.floor(Math.random() * 0xff) }
});
