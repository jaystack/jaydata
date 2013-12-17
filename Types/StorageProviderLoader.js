$data.Class.define('$data.StorageProviderLoaderBase', null, null, {
    isSupported: function (providerName) {
        $data.Trace.log('Detecting ' + providerName + ' provider support');
        var supported = true;
        switch (providerName) {
            case 'indexedDb':
                supported = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || (window.msIndexedDB && !(/^file:/.test(window.location.href)));
                break;
            case 'storm':
                supported = 'XMLHttpRequest' in window;
                break;
            case 'webSql':
            case 'sqLite':
                supported = 'openDatabase' in window;
                break;
            case 'LocalStore':
                supported = 'localStorage' in window && window.localStorage ? true : false;
                break;
            case 'sqLite':
                supported = 'openDatabase' in window;
                break;
            case 'mongoDB':
                supported = $data.mongoDBDriver;
                break;
            default:
                break;
        }
        $data.Trace.log(providerName + ' provider is ' + (supported ? '' : 'not') + ' supported');
        return supported;
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
            'webApi': 'jaydata-webapi',
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
            'webApi': 'WebApi',
            'sqLite': 'SqLite',
            'webSql': 'SqLite',
            'storm': 'Storm'
        }
    },
    load: function (providerList, callback) {
        $data.RegisteredStorageProviders = $data.RegisteredStorageProviders || {};

        $data.Trace.log('Loading provider(s): ' + providerList);
        callback = $data.typeSystem.createCallbackSetting(callback);

        var self = this;
        var cacheKey = providerList.join(',');
        self._fallbackCache = self._fallbackCache || {};

        if (self._fallbackCache[cacheKey]) {
            callback.success(self._fallbackCache[cacheKey]);
        } else {
            this.find(providerList, {
                success: function (provider, selectedProvider) {
                    self._fallbackCache[cacheKey] = provider;
                    callback.success.call(this, provider);
                },
                error: callback.error
            });
        }
    },
    find: function (providerList, callback) {
        var currentProvider = providerList.shift();
        var currentProvider = this.getVirtual(currentProvider);
        if(Array.isArray(currentProvider)){
            providerList = currentProvider;
            currentProvider = providerList.shift();
        }

        while (currentProvider && !this.isSupported(currentProvider)) {
            currentProvider = providerList.shift();
        }
        
        $data.Trace.log('First supported provider is ' + currentProvider);

        if (!currentProvider){
            $data.Trace.log('Provider fallback failed');
            callback.error();
        }

        if ($data.RegisteredStorageProviders) {
            $data.Trace.log('Is the ' + currentProvider + ' provider already registered?');
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (provider) {
                $data.Trace.log(currentProvider + ' provider registered');
                callback.success(provider)
                return;
            }else{
                $data.Trace.log(currentProvider + ' provider not registered');
            }
        }

        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            // NodeJS
            $data.Trace.log('node.js detected trying to load NPM module');
            this.loadNpmModule(currentProvider, providerList, callback);
        } else {
            $data.Trace.log('Browser detected trying to load provider');
            this.loadProvider(currentProvider, providerList, callback);
        }
    },
    loadProvider: function (currentProvider, providerList, callback) {
        var self = this;
        var mappedName = $data.StorageProviderLoader.ProviderNames[currentProvider] || currentProvider;
        $data.Trace.log(currentProvider + ' provider is mapped to name ' + mappedName + 'Provider');
        if (mappedName) {
            var url = this.getUrl(mappedName);
            $data.Trace.log(currentProvider + ' provider from URL: ' + url);

            var loader = this.loadScript;
            if (document && document.createElement) {
                $data.Trace.log('document and document.createElement detected, using script element loader method');
                loader = this.loadScriptElement;
            }

            loader.call(this, url, currentProvider, function (successful) {
                var provider = $data.RegisteredStorageProviders[currentProvider];
                if (successful && provider) {
                    $data.Trace.log(currentProvider + ' provider successfully registered');
                    callback.success(provider);
                } else if (providerList.length > 0) {
                    $data.Trace.log(currentProvider + ' provider failed to load, trying to fallback to ' + providerList + ' provider(s)');
                    self.find(providerList, callback);
                } else {
                    $data.Trace.log(currentProvider + ' provider failed to load');
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
        if (!url){
            callback(false);
            return;
        }

        function getHttpRequest() {
            if (window.XMLHttpRequest)
                return new XMLHttpRequest();
            else if (window.ActiveXObject !== undefined)
                return new ActiveXObject("MsXml2.XmlHttp");
            else{
                $data.Trace.log('XMLHttpRequest or MsXml2.XmlHttp ActiveXObject not found');
                callback(false);
                return;
            }
        }

        var oXmlHttp = getHttpRequest();
        oXmlHttp.onreadystatechange = function () {
            $data.Trace.log('HTTP request is in state: ' + oXmlHttp.readyState);
            if (oXmlHttp.readyState == 4) {
                if (oXmlHttp.status == 200 || oXmlHttp.status == 304) {
                    $data.Trace.log('HTTP request succeeded');
                    $data.Trace.log('HTTP request response text: ' + oXmlHttp.responseText);
                    eval.call(window, oXmlHttp.responseText);
                    if (typeof callback === 'function')
                        callback(true);
                    else $data.Trace.log('Callback function is undefined');
                } else {
                    $data.Trace.log('HTTP request status: ', oXmlHttp.status);
                    if (typeof callback === 'function')
                        callback(false);
                    else $data.Trace.log('Callback function is undefined');
                }
            }
        };
        oXmlHttp.open('GET', url, true);
        oXmlHttp.send(null);
    },
    loadScriptElement: function (url, currentProvider, callback) {
        var head = document.getElementsByTagName('head')[0] || document.documentElement;

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        $data.Trace.log('Appending child ' + script + ' to ' + head);
        head.appendChild(script);

        var loadInterval = this.scriptLoadInterval || 50;
        var iteration = Math.ceil(this.scriptLoadTimeout / loadInterval);
        $data.Trace.log('Script element watcher iterating ' + iteration + ' times');
        function watcher() {
            $data.Trace.log('Script element watcher iteration ' + iteration);
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (provider) {
                $data.Trace.log(currentProvider + ' provider registered');
                callback(true);
            } else {
                iteration--;
                if (iteration > 0) {
                    $data.Trace.log('Script element watcher next iteration');
                    setTimeout(watcher, loadInterval);
                } else {
                    $data.Trace.log('Script element loader failed');
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
            $data.Trace.log('NPM module loader successfully registered ' + currentProvider + ' provider');
        } catch (e) {
            $data.Trace.log('NPM module loader failed for ' + currentProvider + ' provider');
        }

        if (provider) {
            callback.success(provider);
        } else if (providerList.length > 0) {
            this.find(providerList, callback);
        } else {
            callback.error();
        }
    },

    virtualProviders: {
        type: $data.Array,
        value: {
            local: {
                fallbacks: ['webSql', 'indexedDb', 'LocalStore']
            }
        }
    },
    getVirtual: function(name){
        if(this.virtualProviders[name])
            return [].concat(this.virtualProviders[name].fallbacks);

        return name;
    }
});

$data.StorageProviderLoader = new $data.StorageProviderLoaderBase();
