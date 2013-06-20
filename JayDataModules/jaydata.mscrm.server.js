(function (window, undefined) {
    window.parent.postMessage({ MessageHandlerLoaded: true }, '*');
    window.addEventListener("message", function (e) {
        if (e.data.requestProxy) {
            var cnf = e.data;
            var xhttp = new XMLHttpRequest();
            xhttp.open("GET", cnf.url, true);
            if (cnf.httpHeaders) {
                Object.keys(cnf.httpHeaders).forEach(function (header) {
                    xhttp.setRequestHeader(header, cnf.httpHeaders[header]);
                });
            }
            xhttp.onreadystatechange = function () {
                if (xhttp.readyState === 4) {
                    var response = { requestUri: cnf.url, statusCode: xhttp.status, statusText: xhttp.statusText, responseText: xhttp.responseText };
                    xhttp = null;
                    e.source.postMessage(response, e.origin);
                }
            };

            xhttp.send("");
        } else {
            window.OData.request(e.data, function (data, response) {
                e.source.postMessage(response, e.origin);
            },
            function (error) {
                e.source.postMessage(error, e.origin);
            });
        }
    }, false);
})(window);
