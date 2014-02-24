// JayData 1.3.6
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki, Gábor Dolla
//
// More info: http://jaydata.org
(function ($data) {
    if (typeof jQuery !== 'undefined') {
        $data.Class.define('$data.Deferred', $data.PromiseHandlerBase, null, {
            constructor: function () {
                this.deferred = new $.Deferred();
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
                    },
                    notify: function () {
                        callBack.notify.apply(self.deferred, arguments);
                        self.deferred.notify.apply(self.deferred, arguments);
                    }
                };
            },
            getPromise: function () {
                return this.deferred.promise();
            }
        }, null);

        $data.PromiseHandler = $data.Deferred;
    }
})($data);
