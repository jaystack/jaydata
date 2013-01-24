$data.Class.define('$data.StorageProviderLoaderBase', null, null, {
    isSupported: function (providerName) {
        console.log('Detecting ' + providerName + ' provider support');
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
        console.log(providerName + ' provider is ' + (supported ? '' : 'not') + ' supported');
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
        console.log('Loading provider(s): ' + providerList);
        callback = $data.typeSystem.createCallbackSetting(callback);
        var currentProvider = providerList.shift();

        while (currentProvider && !this.isSupported(currentProvider)) {
            currentProvider = providerList.shift();
        }
        
        console.log('First supported provider is ' + currentProvider);

        if (!currentProvider){
            console.log('Provider fallback failed');
            callback.error();
        }

        if ($data.RegisteredStorageProviders) {
            console.log('Is the ' + currentProvider + ' provider already registered?');
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (provider) {
                console.log(currentProvider + ' provider registered');
                callback.success(provider)
                return;
            }else{
                console.log(currentProvider + ' provider not registered');
            }
        }

        if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
            // NodeJS
            console.log('node.js detected trying to load NPM module');
            this.loadNpmModule(currentProvider, providerList, callback);
        } else {
            console.log('Browser detected trying to load provider');
            this.loadProvider(currentProvider, providerList, callback);
        }
    },
    loadProvider: function (currentProvider, providerList, callback) {
        var self = this;
        var mappedName = $data.StorageProviderLoader.ProviderNames[currentProvider] || currentProvider;
        console.log(currentProvider + ' provider is mapped to name ' + mappedName + 'Provider');
        if (mappedName) {
            var url = this.getUrl(mappedName);
            console.log(currentProvider + ' provider from URL: ' + url);

            var loader = this.loadScript;
            if (document && document.createElement) {
                console.log('document and document.createElement detected, using script element loader method');
                loader = this.loadScriptElement;
            }

            loader.call(this, url, currentProvider, function (successful) {
                var provider = $data.RegisteredStorageProviders[currentProvider];
                if (successful && provider) {
                    console.log(currentProvider + ' provider successfully registered');
                    callback.success(provider);
                } else if (providerList.length > 0) {
                    console.log(currentProvider + ' provider failed to load, trying to fallback to ' + providerList + ' provider(s)');
                    self.load(providerList, callback);
                } else {
                    console.log(currentProvider + ' provider failed to load');
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
            else if (window.ActiveXObject)
                return new ActiveXObject("MsXml2.XmlHttp");
            else{
                console.log('XMLHttpRequest or MsXml2.XmlHttp ActiveXObject not found');
                callback(false);
                return;
            }
        }

        var oXmlHttp = getHttpRequest();
        oXmlHttp.onreadystatechange = function () {
            console.log('HTTP request is in state: ' + oXmlHttp.readyState);
            if (oXmlHttp.readyState == 4) {
                if (oXmlHttp.status == 200 || oXmlHttp.status == 304) {
                    console.log('HTTP request succeeded');
                    console.log('HTTP request response text: ' + oXmlHttp.responseText);
                    eval.call(window, oXmlHttp.responseText);
                    if (typeof callback === 'function')
                        callback(true);
                    else console.log('Callback function is undefined');
                } else {
                    console.log('HTTP request status: ', oXmlHttp.status);
                    if (typeof callback === 'function')
                        callback(false);
                    else console.log('Callback function is undefined');
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
        console.log('Appending child ' + script + ' to ' + head);
        head.appendChild(script);

        var loadInterval = this.scriptLoadInterval || 50;
        var iteration = Math.ceiling(this.scriptLoadTimeout / loadInterval);
        console.log('Script element watcher iterating ' + iteration + ' times');
        function watcher() {
            console.log('Script element watcher iteration ' + iteration);
            var provider = $data.RegisteredStorageProviders[currentProvider];
            if (provider) {
                console.log(currentProvider + ' provider registered');
                callback(true);
            } else {
                iteration--;
                if (iteration > 0) {
                    console.log('Script element watcher next iteration');
                    setTimeout(watcher, loadInterval);
                } else {
                    console.log('Script element loader failed');
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
            console.log('NPM module loader successfully registered ' + currentProvider + ' provider');
        } catch (e) {
            console.log('NPM module loader failed for ' + currentProvider + ' provider');
        }

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
