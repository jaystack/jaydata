import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

$data.service = function (serviceUri, config, cb) {
    var _url, _config, _callback;
    function getParam(paramValue) {
        switch (typeof paramValue) {
            case 'object':
                if (typeof paramValue.success === 'function' || typeof paramValue.error === 'function') {
                    _callback = paramValue;
                } else {
                    _config = paramValue;
                }
                break;
            case 'function':
                _callback = paramValue;
                break;
            default:
                break;
        }
    }
    getParam(config);
    getParam(cb);

    if (typeof serviceUri === 'object') {
        _config = $data.typeSystem.extend(serviceUri, _config);
    } else if (typeof serviceUri === "string") {
        _config = _config || {}
        _config.url = serviceUri;
    }

    var pHandler = new $data.PromiseHandler();
    _callback = pHandler.createCallback(_callback);


    var downloader = new $data.MetadataDownloader(_config)
    downloader.load({
        success: (factory) => {
            var type = factory.type;
            //register to local store
            if (_config) {
                var storeAlias = _config.serviceName || _config.storeAlias;
                if (storeAlias && 'addStore' in $data) {
                    $data.addStore(storeAlias, factory, _config.isDefault === undefined || _config.isDefault)
                }
            }

            _callback.success(factory, type);
        },
        error: _callback.error
    })

    return pHandler.getPromise();
};

$data.initService = function(serviceUri, config, cb){
    var _config, _callback;
    function getParam(paramValue) {
        switch (typeof paramValue) {
            case 'object':
                if (typeof paramValue.success === 'function' || typeof paramValue.error === 'function') {
                    _callback = paramValue;
                } else {
                    _config = paramValue;
                }
                break;
            case 'function':
                _callback = paramValue;
                break;
            default:
                break;
        }
    }
    getParam(config);
    getParam(cb);
    
    var d = new $data.PromiseHandler();
    var clb = d.createCallback(_callback);
    
    
    $data.service(serviceUri, _config, {
        success: function(factory){
            var ctx = factory()
            if(ctx){
                return ctx.onReady(clb)    
            }
            return clb.error(new Exception("Missing Context Type"))
        }, 
        error: clb.error
    })
    
    return d.getPromise();
}