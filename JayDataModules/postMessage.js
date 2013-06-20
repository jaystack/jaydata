(function ($data, window, undefined) {
    var odata = window.OData;

    odata.originalHttpClient = odata.defaultHttpClient;
    $data.postMessageODataHandler = {
        postMessageHttpClient: {
            targetIframe: undefined,
            request: function (request, success, error) {
                var targetIframe = request.targetIframe || $data.postMessageODataHandler.postMessageHttpClient.targetIframe;
                var targetOrigin = request.targetOrigin || $data.postMessageODataHandler.postMessageHttpClient.targetOrigin || '*';

                if (targetIframe) {
                    var listener = function (event) {
                        $data.Trace.log('in listener');
                        window.removeEventListener('message', listener);
                        var statusCode = event.data.statusCode;
                        if (statusCode >= 200 && statusCode <= 299) {
                            success(event.data);
                        } else {
                            error(event.data);
                        }
                    };
                    window.addEventListener('message', listener, false);
                    $data.Trace.log('before post', targetIframe);
                    targetIframe.postMessage(request, targetOrigin);
                } else {
                    return odata.originalHttpClient.request(request, success, error);
                }
            }
        },
        requestProxy: function (request, success, error) {
            success = request.success || success;
            error = request.error || error;

            delete request.success;
            delete request.error;

            var targetIframe = request.targetIframe || $data.postMessageODataHandler.postMessageHttpClient.targetIframe;
            var targetOrigin = request.targetOrigin || $data.postMessageODataHandler.postMessageHttpClient.targetOrigin || '*';


            if (targetIframe) {
                request.requestProxy = true;
                var listener = function (event) {
                    $data.Trace.log('in listener');
                    window.removeEventListener('message', listener);
                    var statusCode = event.data.statusCode;
                    if (statusCode >= 200 && statusCode <= 299) {
                        success(event.data);
                    } else {
                        error(event.data);
                    }
                };
                window.addEventListener('message', listener, false);
                $data.Trace.log('before post', targetIframe);
                targetIframe.postMessage(request, targetOrigin);
            } else {
                error({ message: "No iframe detected", request: request, response: undefined });
            }
        }
    };
    odata.defaultHttpClient = $data.postMessageODataHandler.postMessageHttpClient;

})($data, window);
