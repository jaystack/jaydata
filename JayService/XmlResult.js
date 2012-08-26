$data.Class.define('$data.ServiceResult', null, null, {
    constructor: function(data){
        this.data = data;
    },
    data: { },
    contentType: { value: 'text/plain' },
    toString: function(){
        return this.data.toString();
    }
});

$data.ServiceResult.extend('$data.JavaScriptResult', {
    contentType: { value: 'text/javascript' }
});

$data.ServiceResult.extend('$data.HtmlResult', {
    contentType: { value: 'text/html' }
});

$data.ServiceResult.extend('$data.JSONResult', {
    contentType: { value: 'application/json' },
    toString: function(){
        return JSON.stringify(this.data);
    }
});

$data.ServiceResult.extend('$data.XmlResult', {
    contentType: { value: 'text/xml' },
    toString: function(){
        return this.data.toString();
    }
});

$data.ServiceResult.extend('$data.MultiPartMixedResult', {
    constructor: function(data, boundary){
        this.contentType = this.contentType + '; boundary=' + boundary;
    },
    contentType: { value: 'multipart/mixed' },
    toString: function () {
        return this.data.toString();
    }
});

$data.JSONResult.extend('$data.oDataJSONResult', {
    constructor: function(data, builderCfg){
        var builder = new $data.oDataServer.oDataResponseDataBuilder(builderCfg);
        this.data = builder.convertToResponse(data);
    }
});

$data.ServiceResult.extend('$data.EmptyServiceResult', {
    constructor: function () {
    },
    contentType: { value: '' },
    toString: function () {
    }
});
