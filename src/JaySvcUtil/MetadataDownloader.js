import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';
import { Edm } from 'odata-metadata'
import { Metadata } from './Metadata.js'
import odatajs from 'odatajs';

export class MetadataDownloader {
    constructor(options) {
        this.options = options || {}
        this.prepareRequest = options.prepareRequest || function() { }
        
        if (typeof odatajs === 'undefined' || typeof odatajs.oData === 'undefined') {
            Guard.raise(new Exception('odatajs is required', 'Not Found!'));
        } else {
            this.oData = odatajs.oData
        }
        
    }
    
    load(callBack) {
        
        var pHandler = new $data.PromiseHandler();
        callBack = pHandler.createCallback(callBack);
        
        var serviceUrl = this.options.url.replace('/$metadata', '')
        var metadataUrl = serviceUrl.replace(/\/+$/, '') + '/$metadata'
        this.options.SerivceUri = serviceUrl
        
        
        var requestData = [
            {
                requestUri: metadataUrl,
                method: this.options.method || "GET",
                headers: this.options.headers || {}
            },
            (data) => {
                var edmMetadata = new Edm.Edmx(data)
                var metadata = new Metadata(this.options, edmMetadata);
                var types = metadata.processMetadata()
                
                var contextType = types.filter((t)=> t.isAssignableTo($data.EntityContext))[0]
                
                var factory = this._createFactoryFunc(contextType);
                factory.type = contextType;
                
                callBack.success(factory)
            }, 
            callBack.error,
            this.oData.metadataHandler
        ]
        
        this._appendBasicAuth(requestData[0], this.options.user, this.options.password, this.options.withCredentials);
        
        this.prepareRequest.call(this, requestData);
        
        this.oData.request.apply(this.oData, requestData);
        
        return pHandler.getPromise();
    }
    
    _createFactoryFunc(ctxType){
        return (config) => {
            if (ctxType) {
                var cfg = $data.typeSystem.extend({
                    name: 'oData',
                    oDataServiceHost: this.options.SerivceUri,
                    user: this.options.user,
                    password: this.options.password,
                    withCredentials: this.options.withCredentials,
                    maxDataServiceVersion: this.options.maxDataServiceVersion || '4.0'
                }, config)

                return new ctxType(cfg);
            } else {
                return null;
            }
        }
    }
    
    _appendBasicAuth(request, user, password, withCredentials) {
        request.headers = request.headers || {};
        if (!request.headers.Authorization && user && password) {
            request.headers.Authorization = "Basic " + this.__encodeBase64(user + ":" + password);
        }
        if (withCredentials){
            request.withCredentials = withCredentials;
        }
    }
    
    __encodeBase64 (val) {
        var b64array = "ABCDEFGHIJKLMNOP" +
                           "QRSTUVWXYZabcdef" +
                           "ghijklmnopqrstuv" +
                           "wxyz0123456789+/" +
                           "=";

        var input = val;
        var base64 = "";
        var hex = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            base64 = base64 +
                        b64array.charAt(enc1) +
                        b64array.charAt(enc2) +
                        b64array.charAt(enc3) +
                        b64array.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return base64;
    }
}

$data.MetadataDownloader = MetadataDownloader