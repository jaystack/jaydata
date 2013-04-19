try { if (typeof navigator === 'undefined') navigator = window.navigator = require('navigator'); }catch(err){}

$data.Class.define('$data.storageProviders.mongoDB.mongoDBProvider.ClientObjectID', null, null, {
    constructor: function(){
        var time = Math.floor(new Date().getTime() / 1000).toString(16);
        
        var b64ua = btoa(navigator ? navigator.userAgent : 'nodejs');
        var machine = (b64ua.charCodeAt(0) + b64ua.charCodeAt(1)).toString(16) + (b64ua.charCodeAt(2) + b64ua.charCodeAt(3)).toString(16) + (b64ua.charCodeAt(4) + b64ua.charCodeAt(5)).toString(16);
        
        var pid = ('0000' + Math.floor(Math.random() * 0xffff).toString(16)).slice(-4);
        var inc = ('000000' + (++$data.storageProviders.mongoDB.mongoDBProvider.ClientObjectID.idSeed).toString(16)).slice(-6);
        
        this.toString = this.toLocaleString = this.valueOf = function(){ return btoa(time + machine + pid + inc); };
    },
    value: { value: null }
}, {
    idSeed: { value: Math.floor(Math.random() * 0xff) }
});
