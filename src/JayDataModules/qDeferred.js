import $data, { $C, Guard, Container, Exception, MemberDefinition } from 'jaydata-core';
import * as q from 'q'

class Deferred extends $data.PromiseHandlerBase{
    constructor(){
        super();
        this.deferred = new q.defer();
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
            }
        };
    }
    getPromise(){
        return this.deferred.promise;
    }
}

$data.PromiseHandler = $data.Deferred = Deferred;
export default $data;
