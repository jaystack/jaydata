$data.Class.define('$data.ServiceResult', null, null, {
    constructor: function(data){
        this.data = data;
    },
    data: { value: {} },
    contentType: { value: 'text/plain' },
    toString: function(){
        return this.data.toString();
    }
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

$data.JSONResult.extend('$data.oDataJSONResult', {
    constructor: function(data, builderCfg){
        var builder = new $data.oDataServer.oDataResponseDataBuilder(builderCfg);
        this.data = builder.convertToResponse(data);
    }
});
