(function ($data) {
    var q;
    if (typeof Q === 'undefined') {
        if (typeof exports !== 'undefined') {
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
                    callBack.error.apply(self.deferred, arguments);
                    self.deferred.reject.apply(self.deferred, arguments);
                }
            };
        },
        getPromise: function () {
            return this.deferred.promise;
        }
    }, null);

    $data.PromiseHandler = $data.Deferred;

})($data);