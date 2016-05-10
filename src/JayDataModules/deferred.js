import $data, { $C, Guard, Container, Exception } from 'jaydata/core';
import jQuery from 'jquery';

class Deferred extends $data.PromiseHandlerBase{
    constructor(){
        super();
        this.deferred = new jQuery.Deferred();
    }
    createCallback(callBack){
        callBack = $data.PromiseHandlerBase.createCallbackSettings(callBack);
        var self = this;

        return {
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
    }
    getPromise(){
        return this.deferred.promise();
    }
}

$data.PromiseHandler = $data.Deferred = Deferred;
export default $data;
