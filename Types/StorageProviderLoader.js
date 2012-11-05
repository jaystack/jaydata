$data.Class.define('$data.StorageProviderLoaderBase', null, null, {
    isSupported: function (providerName) {
        switch (providerName) {
            case 'indexedDb':
                return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            case 'storm':
                return 'XMLHttpRequest' in window;
            case 'webSql':
            case 'sqLite':
                return 'openDatabase' in window;
            case 'LocalStore':
                return 'localStorage' in window;
            case 'sqLite':
                return 'openDatabase' in window;
            case 'mongoDB':
                return $data.mongoDBDriver;
            default:
                return true;
        }
    },
    scriptLoadTimeout: { type: 'int', value: 1000 },
    scriptLoadInterval: { type: 'int', value: 50 },
    npmModules: {
        value: {
            'indexedDb': 'jaydata-indexeddb',
            'InMemory': 'jaydata-inmemory',
            'LocalStore': 'jaydata-inmemory',
            'mongoDB': 'jaydata-mongodb',
            'oData': 'jaydata-odata',
            'sqLite': 'jaydata-sqlite',
            'webSql': 'jaydata-sqlite',
            'storm': 'jaydata-storm'
        }
    },
    ProviderNames: {
        value: {
            'indexedDb': 'IndexedDb',
            'InMemory': 'InMemory',
            'LocalStore': 'InMemory',
            'oData': 'oData',
            'sqLite': 'SqLite',
            'webSql': 'SqLite',
            'storm': 'Storm'
        }
    },
    load: function (providerList, callback) {
        var currentProvider = providerList.shift();

        while (currentProvider && !this.isSupported(currentProvider)) {
            currentProvider = providerList.shift();
        }

        if (!currentProvider)
            callback.error();

        if ($data.RegisteredStorageProviders) {
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (provider) {
                callback.success(provider)
                return;
            }
        }

        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            // NodeJS
            this.loadNpmModule(currentProvider, providerList, callback);
        } else {
            this.loadProvider(currentProvider, providerList, callback);
        }
    },
    loadProvider: function (currentProvider, providerList, callback) {
        var self = this;
        var mappedName = $data.StorageProviderLoader.ProviderNames[currentProvider] || currentProvider;
        if (mappedName) {
            var url = this.getUrl(mappedName);

            var loader = this.loadScript;
            if (document && document.createElement) {
                loader = this.loadScriptElement;
            }

            loader.call(this, url, currentProvider, function (successful) {
                var provider = $data.RegisteredStorageProviders[currentProvider];
                if (successful && provider) {
                    callback.success(provider);
                } else if (providerList.length > 0) {
                    self.load(providerList, callback);
                } else {
                    callback.error();
                }
            });
        }
    },
    getUrl: function (providerName) {
        var jaydataScriptMin = document.querySelector('script[src$="jaydata.min.js"]');
        var jaydataScript = document.querySelector('script[src$="jaydata.js"]');
        if (jaydataScriptMin) return jaydataScriptMin.src.substring(0, jaydataScriptMin.src.lastIndexOf('/') + 1) + 'jaydataproviders/' + providerName + 'Provider.min.js';
        else if (jaydataScript) return jaydataScript.src.substring(0, jaydataScript.src.lastIndexOf('/') + 1) + 'jaydataproviders/' + providerName + 'Provider.js';
        else return 'jaydataproviders/' + providerName + 'Provider.js';
    },
    loadScript: function (url, currentProvider, callback) {
        if (!url)
            callback(false);

        function getHttpRequest() {
            if (window.XMLHttpRequest)
                return new XMLHttpRequest();
            else if (window.ActiveXObject)
                return new ActiveXObject("MsXml2.XmlHttp");
        }

        var oXmlHttp = getHttpRequest();
        oXmlHttp.onreadystatechange = function () {
            if (oXmlHttp.readyState == 4) {
                if (oXmlHttp.status == 200 || oXmlHttp.status == 304) {
                    eval.call(window, oXmlHttp.responseText);
                    if (typeof callback === 'function')
                        callback(true);
                } else {
                    if (typeof callback === 'function') {
                        callback(false);
                    }
                }
            }
        }
        oXmlHttp.open('GET', url, true);
        oXmlHttp.send(null);
    },
    loadScriptElement: function (url, currentProvider, callback) {
        var head = document.getElementsByTagName('head')[0] || document.documentElement;

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        head.appendChild(script);

        var loadInterval = this.scriptLoadInterval || 50;
        var iteration = this.scriptLoadTimeout / loadInterval;
        function watcher() {
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (provider) {
                callback(true);
            } else {
                iteration--;
                if (iteration > 0) {
                    setTimeout(watcher, loadInterval);
                } else {
                    callback(false);
                }
            }
        }
        setTimeout(watcher, loadInterval);
    },

    loadNpmModule: function (currentProvider, providerList, callback) {
        var provider = null;
        try {
            require(this.npmModules[currentProvider]);
            provider = $data.RegisteredStorageProviders[currentProvider];
        } catch (e) { }

        if (provider) {
            callback.success(provider);
        } else if (providerList.length > 0) {
            this.load(providerList, callback);
        } else {
            callback.error();
        }
    }
});

$data.StorageProviderLoader = new $data.StorageProviderLoaderBase();
