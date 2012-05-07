(function ($data, $) {

    $data.Class.define('$data.Deferred', $data.PromiseHandlerBase, null, {
        constructor: function () {
            this.deferred = new $.Deferred();
        },
        deferred: {},
        createCallback: function (callBack) {
            callBack = $data.typeSystem.createCallbackSetting(callBack);
            //TODO
            /*if (typeof callBack == "function")
                this.deferred.then(callBack);
            else if (callBack && (callBack.success || callBack.error || callBack.notify))*/
                this.deferred.then(callBack.success, callBack.error, callBack.notify);

            return cbWrapper = {
                success: this.deferred.resolve,
                error: this.deferred.reject,
                notify: this.deferred.notify
            };
        },
        getPromise: function () {
            return this.deferred.promise();
        }
    }, null);

    $data.PromiseHandler = $data.Deferred;

})($data, jQuery);