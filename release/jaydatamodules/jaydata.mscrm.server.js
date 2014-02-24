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
