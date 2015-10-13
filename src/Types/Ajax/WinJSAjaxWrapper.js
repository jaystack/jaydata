if (typeof WinJS !== 'undefined' && WinJS.xhr) {
    $data.ajax = $data.ajax || function (options) {
        $data.typeSystem.extend(options, {
            dataType: 'json',
            headers: {}
        });
        var dataTypes = {
            'json': {
                accept: 'application/json, text/javascript',
                convert: JSON.parse
            },
            'text': {
                accept: 'text/plain',
                convert: function (e) { return e; }
            },
            'html': {
                accept: 'text/html',
                convert: function (e) { return e; }
            },
            'xml': {
                accept: 'application/xml, text/xml',
                convert: function (e) {
                    // TODO?
                    return e;
                }
            }
        }
        var dataTypeContext = dataTypes[options.dataType.toLowerCase()];

        options.headers.Accept = dataTypeContext.accept;

        var successClb = options.success || $data.defaultSuccessCallback;
        var errorClb = options.error || $data.defaultErrorCallback;
        var progressClb = options.progress;

        var success = function (r) {
            var result = dataTypeContext.convert(r.responseText);
            successClb(result);
        }
        var error = function (r) {
            var error = dataTypeContext.convert(r.responseText);
            errorClb(error);
        }
        var progress = progressClb;

        WinJS.xhr(options)
        .done(success, error, progress);
    }
}

