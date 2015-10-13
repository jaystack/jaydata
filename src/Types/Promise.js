$data.Class.define('$data.Promise', null, null, {
    always: function () { Guard.raise(new Exception('$data.Promise.always', 'Not implemented!')); },
    done: function () { Guard.raise(new Exception('$data.Promise.done', 'Not implemented!')); },
    fail: function () { Guard.raise(new Exception('$data.Promise.fail', 'Not implemented!')); },
    isRejected: function () { Guard.raise(new Exception('$data.Promise.isRejected', 'Not implemented!')); },
    isResolved: function () { Guard.raise(new Exception('$data.Promise.isResolved', 'Not implemented!')); },
    //notify: function () { Guard.raise(new Exception('$data.Promise.notify', 'Not implemented!')); },
    //notifyWith: function () { Guard.raise(new Exception('$data.Promise.notifyWith', 'Not implemented!')); },
    pipe: function () { Guard.raise(new Exception('$data.Promise.pipe', 'Not implemented!')); },
    progress: function () { Guard.raise(new Exception('$data.Promise.progress', 'Not implemented!')); },
    promise: function () { Guard.raise(new Exception('$data.Promise.promise', 'Not implemented!')); },
    //reject: function () { Guard.raise(new Exception('$data.Promise.reject', 'Not implemented!')); },
    //rejectWith: function () { Guard.raise(new Exception('$data.Promise.rejectWith', 'Not implemented!')); },
    //resolve: function () { Guard.raise(new Exception('$data.Promise.resolve', 'Not implemented!')); },
    //resolveWith: function () { Guard.raise(new Exception('$data.Promise.resolveWith', 'Not implemented!')); },
    state: function () { Guard.raise(new Exception('$data.Promise.state', 'Not implemented!')); },
    then: function () { Guard.raise(new Exception('$data.Promise.then', 'Not implemented!')); }
}, null);

$data.Class.define('$data.PromiseHandlerBase', null, null, {
    constructor: function () { },
    createCallback: function (callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        return cbWrapper = {
            success: callBack.success,
            error: callBack.error,
            notify: callBack.notify
        };
    },
    getPromise: function () {
        return new $data.Promise();
    }
}, null);

$data.PromiseHandler = $data.PromiseHandlerBase;
