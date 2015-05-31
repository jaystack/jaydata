(function ($data) {
    var q;
    if (typeof Q === 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            q = require('q');
        } else {
            Guard.raise(new Exception('Q is not defined'));
            return;
        }
    } else {
        q = Q;
    }

    $data.Class.define('$data.Deferred', $data.PromiseHandlerBase, null, {
        constructor: function () {
            this.deferred = new q.defer();
        },
        deferred: {},
        createCallback: function (callBack) {
            callBack = $data.typeSystem.createCallbackSetting(callBack);
            var self = this;

            return cbWrapper = {
                success: function () {
                    callBack.success.apply(self.deferred, arguments);
                    self.deferred.resolve.apply(self.deferred, arguments);
                },
                error: function () {
                    Array.prototype.push.call(arguments, self.deferred);
                    callBack.error.apply(self.deferred, arguments);
                    /*self.deferred.reject.apply(self.deferred, arguments);
                    
                    var finalErr;
                    
                    try{
                        callBack.error.apply(self.deferred, arguments);
                        try{
                            self.deferred.reject.apply(self.deferred, arguments);
                        }catch(err){
                            finalErr = err;
                        }
                    }catch(err){
                        finalErr = arguments[0];
                        try{
                            self.deferred.reject.apply(self.deferred, arguments);
                        }catch(err){
                            finalErr = err;
                        }
                    }
                    
                    if (finalErr){
                        //throw finalErr;
                    }*/
                }
            };
        },
        getPromise: function () {
            return this.deferred.promise;
        }
    }, null);

    $data.PromiseHandler = $data.Deferred;

})($data);
