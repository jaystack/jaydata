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

/*$data.JSONResult.extend('$data.oDataJSONResult', {
    constructor: function(data, builderCfg){
        var builder = new $data.oDataServer.oDataResponseDataBuilder(builderCfg);
        this.data = builder.convertToResponse(data);
    }
});*/

$data.ServiceResult.extend('$data.oDataResult', {
    constructor: function (data, builderCfg) {
        var request = builderCfg.request;
        var acceptHeader = request.headers['Accept'] || request.headers['accept'] || '';
        var version = builderCfg.version;

        if ((version === 'V3' && acceptHeader.indexOf('application/json;odata=verbose') >= 0) || (version !== 'V3' && acceptHeader.indexOf('application/json') >= 0) ||
            (request.query && this.jsonFormats.indexOf(request.query.$format) >= 0) ||
            //method xml result not implemented
            builderCfg.methodConfig) {
            this.contentType = 'application/json';
            var builder = new $data.oDataServer.oDataResponseDataBuilder(builderCfg);
            this.data = builder.convertToResponse(data);
        } else {
            this.contentType = 'text/xml';
            builderCfg.headers = request.headers;
            var transf = new $data.oDataServer.EntityXmlTransform(builderCfg.context, builderCfg.baseUrl, builderCfg);
            this.data = transf.convertToResponse(data, builderCfg.collectionName, builderCfg.selectedFields, builderCfg.includes);
        }
    },
    toString: function () {
        return typeof this.data === 'string' ? this.data : JSON.stringify(this.data);
    },
    jsonFormats: {
        value: [
            'json',
            'verbose',
            'lightweight'
        ]
    }
});

$data.ServiceResult.extend('$data.EmptyServiceResult', {
    constructor: function () {
    },
    contentType: { value: '' },
    toString: function () {
    }
});
