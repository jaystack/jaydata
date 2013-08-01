(function ($data) {

    $data.initService = function (apiKey, options) {
        var d = new $data.PromiseHandler();
        var cfg;

        if (typeof apiKey === 'object') {
            //appId, serviceName, ownerid, isSSL, port, license, url
            cfg = apiKey;
            var protocol = cfg.isSSL || cfg.isSSL === undefined ? 'https' : 'http';
            var port = cfg.port ? (':' + cfg.port) : '';

            if (typeof cfg.license === 'string' && cfg.license.toLowerCase() === 'business') {
                if (cfg.appId && cfg.serviceName) {
                    apiKey = protocol + '://' + cfg.appId + '.jaystack.net' + port + '/' + cfg.serviceName;
                } else {
                    apiKey = cfg.url;
                }
            } else {
                if (cfg.ownerId && cfg.appId && cfg.serviceName) {
                    apiKey = protocol + '://open.jaystack.net/' + cfg.ownerId + '/' + cfg.appId + '/api/' + cfg.serviceName;
                } else {
                    apiKey = cfg.url;
                }
            }

            delete cfg.url;
            cfg = $data.typeSystem.extend(cfg, options);
        } else {
            cfg = options;
        }

        $data.service(apiKey, cfg).then(function (factory) {
            var ctx = factory();
            return ctx.onReady()
                .then(function (context) {
                    context.serviceFactory = factory;
                    d.deferred.resolve(context, factory, factory.type);
                }).fail(function () {
                    d.deferred.reject.apply(d.deferred, arguments);
                });
        }).fail(function(){
            d.deferred.reject.apply(d.deferred, arguments);
        });

        return d.getPromise();
    };

})($data);
