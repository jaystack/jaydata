$data.StorageProviderLoader = {
    isSupported: function (providerName) {
        switch (providerName) {
            case 'indexedDb':
                return window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
            case 'storm':
                return 'XMLHttpRequest' in window;
            case 'webSql':
            case 'sqLite':
                return 'openDatabase' in window;
            default:
                return true;
        }
    },
    npmModules: {        
        'indexedDb': 'jaydata-indexeddb',
        'InMemory': 'jaydata-inmemory',
        'LocalStore': 'jaydata-inmemory',
        'mongoDB': 'jaydata-mongodb',
        'oData': 'jaydata-odata',
        'sqLite': 'jaydata-sqlite',
        'webSql': 'jaydata-sqlite',
        'storm': 'jaydata-storm'
    },
    load: function (providerList, callback) {
        function getUrl(providerName) {
            switch (providerName) {
                case 'storm':
                    providerName = 'Storm';
                    break;
            }
            var jaydataScriptMin = document.querySelector('script[src$="jaydata.min.js"]');
	    var jaydataScript = document.querySelector('script[src$="jaydata.js"]');
            if (jaydataScriptMin) return jaydataScriptMin.src.substring(0, jaydataScriptMin.src.lastIndexOf('/') + 1) + 'jaydataproviders/' + providerName + 'Provider.min.js';
            else if (jaydataScript) return jaydataScript.src.substring(0, jaydataScript.src.lastIndexOf('/') + 1) + 'jaydataproviders/' + providerName + 'Provider.js';
            else return 'jaydataproviders/' + providerName + 'Provider.js';
        };

        function loadScript(url, callback) {
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
        };


        var currentProvider = providerList.shift();

        if ($data.RegisteredStorageProviders) {
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (provider) {
                callback.success(provider)
                return;
            }
        }

        if (!this.isSupported(provider)) {
            this.load(providerList, callback);
            return;
        }

        if (typeof module !== 'undefined' && typeof require !== 'undefined') {
            // NodeJS
            var provider = null;
            try {
                require(this.npmModules[currentProvider]);
                provider = $data.RegisteredStorageProviders[currentProvider];
            } catch (e) {
            }
            if (provider) {
                var provider = $data.RegisteredStorageProviders[currentProvider];
                callback.success(provider);
            } else if (providerList.length > 0) {
                this.load(providerList, callback);
            } else {
                callback.error();
            }

            return;
        }

        var url = getUrl(currentProvider);

        loadScript(url, function (successful) {
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (successful && provider) {
                var provider = $data.RegisteredStorageProviders[currentProvider];
                callback.success(provider);
            } else if (providerList.length > 0) {
                this.load(providerList, callback);
            } else {
                callback.error();
            }
        });
    }
}
