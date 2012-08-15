(function ($data, $) {

    $data.Class.define('$data.Deferred', $data.PromiseHandlerBase, null, {
        constructor: function () {
            this.deferred = new $.Deferred();
            console.log(this.deferred);
        },
        deferred: {},
        createCallback: function (callBack) {
            callBack = $data.typeSystem.createCallbackSetting(callBack);
            var self = this;

            return cbWrapper = {
                success: function () {
                    callBack.success.apply(this, arguments);

                    if (self.deferred.state() === "pending")
                        self.deferred.resolve.apply(this, arguments);

                },
                error: function () {
                    callBack.error.apply(this, arguments);

                    if (self.deferred.state() === "pending")
                        self.deferred.reject.apply(this, arguments);
                    
                },
                notify: function () {
                    callBack.notify.apply(this, arguments);

                    if (self.deferred.state() === "pending")
                        self.deferred.notify.apply(this, arguments);

                }
            };
        },
        getPromise: function () {
            return this.deferred.promise();
        }
    }, null);

    $data.PromiseHandler = $data.Deferred;

})($data, jQuery);
