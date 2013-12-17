
$data.Class.define('$data.MetadataLoaderClass', null, null, {
    load: function (metadataUri, callBack, config) {
        
        var cnf = {
            EntityBaseClass: '$data.Entity',
            ContextBaseClass: '$data.EntityContext',
            AutoCreateContext: false,
            DefaultNamespace: ('ns' + Math.random()).replace('.', '') + metadataUri.replace(/[^\w]/g, "_"),
            ContextInstanceName: 'context',
            EntitySetBaseClass: '$data.EntitySet',
            CollectionBaseClass: 'Array',
            url: metadataUri,
            user: undefined,
            password: undefined,
            withCredentials: undefined,
            httpHeaders: undefined,

            typeFilter: '',
            navigation: true,
            generateKeys: true,
            dependentRelationsOnly: false
        };

        $data.typeSystem.extend( cnf, config || {});

        if (cnf.DefaultNamespace && cnf.DefaultNamespace.lastIndexOf('.') !== (cnf.DefaultNamespace.length - 1))
            cnf.DefaultNamespace += '.';

        this.factoryCache = this.factoryCache || {};
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        if (metadataUri in this.factoryCache) {

            /*console.log("served from cache");
            console.dir(this.factoryCache[metadataUri]);*/
            callBack.success.apply({}, this.factoryCache[metadataUri]);
            return;
        }




        var metadataUri;
        if (cnf.url) {
            cnf.SerivceUri = cnf.url.replace('/$metadata', '');
            if (cnf.url.indexOf('/$metadata') === -1) {
                cnf.metadataUri = cnf.url.replace(/\/+$/, '') + '/$metadata';
            } else {
                cnf.metadataUri = cnf.url;
            }
        } else {
            callBack.error('metadata url is missing');
        }

        var self = this;
        self._loadXMLDoc(cnf, function (xml, response) {
            if (response.statusCode < 200 || response.statusCode > 299) {
                callBack.error(response);
                return;
            }

            var versionInfo = self._findVersion(xml);
            if (self.xsltRepoUrl) {
                console.log('XSLT: ' + self.xsltRepoUrl + self._supportedODataVersionXSLT)
                self._loadXMLDoc({ 
                    metadataUri: self.xsltRepoUrl + self._supportedODataVersionXSLT,
                    user: cnf.user,
                    password: cnf.password,
                    httpHeaders: cnf.httpHeaders
                }, function (xsl, response) {
                    if (response.statusCode < 200 || response.statusCode > 299) {
                        callBack.error(response);
                        return;
                    }
                    var text = response.responseText;
                    text = text.replace('xmlns:edm="@@VERSIONNS@@"', 'xmlns:edm="' + versionInfo.ns + '"');
                    text = text.replace('@@VERSION@@', versionInfo.version);

                    if (window.ActiveXObject === undefined) {
                        var parser = new DOMParser();
                        xsl = parser.parseFromString(text, "text/xml");
                    } else {
                        xsl = new ActiveXObject("Microsoft.XMLDOM");
                        xsl.async = false;
                        xsl.loadXML(text);
                    }

                    self._transform(callBack, versionInfo, xml, xsl, cnf);
                });
            } else {
                self._transform(callBack, versionInfo, xml, undefined, cnf);
            }

        });
    },
    debugMode: { type: 'bool', value: false },
    xsltRepoUrl: { type: 'string', value: '' },

    createFactoryFunc: function (ctxType, cnf, versionInfo) {
        var self = this;
        return function (config) {
            if (ctxType) {
                var cfg = $data.typeSystem.extend({
                    name: 'oData',
                    oDataServiceHost: cnf.SerivceUri,
                    //maxDataServiceVersion: '',
                    user: cnf.user,
                    password: cnf.password,
                    withCredentials: cnf.withCredentials,
                    maxDataServiceVersion: versionInfo.maxVersion || '3.0'
                }, config)


                return new ctxType(cfg);
            } else {
                return null;
            }
        }
    },

    _transform: function (callBack, versionInfo, xml, xsl, cnf) {
        var self = this;
        var codeText = self._processResults(cnf.url, versionInfo, xml, xsl, cnf);

        try {
            eval(codeText);
        } catch (e) {
            callBack.error(new Exception('SyntaxError', 'Unexpected model', [e, codeText]));
            return;
        }

        var ctxType;
        if (!$data.generatedContexts || !(ctxType = $data.generatedContexts.pop())) {
            callBack.error(new Exception('No context found in service', 'Not found', [cnf, codeText]));
            return;
        }

        var factoryFn = self.createFactoryFunc(ctxType, cnf, versionInfo);
        this.factoryCache[cnf.url] = [factoryFn, ctxType];

        factoryFn.type = ctxType;

        if (self.debugMode) {
            factoryFn.codeText = codeText;
            callBack.success(factoryFn, ctxType, codeText);
        }
        else {
            callBack.success(factoryFn, ctxType);
        }
    },
    _loadXMLDoc: function (cnf, callback) {
        var that = this;
        if ($data.postMessageODataHandler) {

            if (cnf.user && cnf.password && (!cnf.httpHeaders || (cnf.httpHeaders && !cnf.httpHeaders['Authorization']))) {
                httpHeader = httpHeader || {};
                httpHeader["Authorization"] = "Basic " + this.__encodeBase64(cnf.user + ":" + cnf.password);
            }

            $data.postMessageODataHandler.requestProxy({
                url: cnf.metadataUri,
                httpHeaders: cnf.httpHeaders,
                success: function (response) {
                    var doc;
                    if (typeof module !== 'undefined' && typeof require !== 'undefined') {
                        doc = response.responseText;
                    } else if (window.ActiveXObject) {
                        doc = new ActiveXObject('Microsoft.XMLDOM');
                        doc.async = 'false';
                        doc.loadXML(response.responseText);
                    } else {
                        var parser = new DOMParser();
                        doc = parser.parseFromString(response.responseText, 'text/xml');
                    }

                    callback(doc, response);
                },
                error: function (e) {
                    that._loadXHTTP_XMLDoc(cnf, callback);
                }

            });

        } else {
            this._loadXHTTP_XMLDoc(cnf, callback);
        }
    },
    _loadXHTTP_XMLDoc: function (cnf, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", cnf.metadataUri, true);
        if (cnf.httpHeaders) {
            Object.keys(cnf.httpHeaders).forEach(function (header) {
                xhttp.setRequestHeader(header, cnf.httpHeaders[header]);
            });
        }
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                var response = { requestUri: cnf.metadataUri, statusCode: xhttp.status, statusText: xhttp.statusText, responseText: xhttp.responseText };
                callback(xhttp.responseXML || xhttp.responseText, response);
            }
        };

        if (cnf.user && cnf.password && (!cnf.httpHeaders || (cnf.httpHeaders && !cnf.httpHeaders['Authorization'])))
            xhttp.setRequestHeader("Authorization", "Basic " + this.__encodeBase64(cnf.user + ":" + cnf.password));

        xhttp.send("");
    },
    _processResults: function (metadataUri, versionInfo, metadata, xsl, cnf) {
        var transformXslt = this.getCurrentXSLTVersion(versionInfo, metadata);
        cnf.typeFilter = this._prepareTypeFilter(metadata, versionInfo, cnf);

        if (window.ActiveXObject !== undefined) {
            var xslt = new ActiveXObject("Msxml2.XSLTemplate.6.0");
            var xsldoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.6.0");
            var xslproc;
            xsldoc.async = false;
            if (xsl)
                xsldoc.load(xsl);
            else
                xsldoc.loadXML(transformXslt);
            if (xsldoc.parseError.errorCode != 0) {
                var myErr = xsldoc.parseError;
            } else {
                xslt.stylesheet = xsldoc;
                var xmldoc = new ActiveXObject("Msxml2.DOMDocument.6.0");
                xmldoc.async = false;
                xmldoc.load(metadata);
                if (xmldoc.parseError.errorCode != 0) {
                    var myErr = xmldoc.parseError;
                } else {
                    xslproc = xslt.createProcessor();
                    xslproc.input = xmldoc;

                    xslproc.addParameter('SerivceUri', cnf.SerivceUri);
                    xslproc.addParameter('EntityBaseClass', cnf.EntityBaseClass);
                    xslproc.addParameter('ContextBaseClass', cnf.ContextBaseClass);
                    xslproc.addParameter('AutoCreateContext', cnf.AutoCreateContext);
                    xslproc.addParameter('ContextInstanceName', cnf.ContextInstanceName);
                    xslproc.addParameter('EntitySetBaseClass', cnf.EntitySetBaseClass);
                    xslproc.addParameter('CollectionBaseClass', cnf.CollectionBaseClass);
                    xslproc.addParameter('DefaultNamespace', cnf.DefaultNamespace);
                    xslproc.addParameter('MaxDataserviceVersion', versionInfo.maxVersion || '3.0');
                    xslproc.addParameter('AllowedTypesList', cnf.typeFilter);
                    xslproc.addParameter('GenerateNavigationProperties', cnf.navigation);

                    xslproc.transform();
                    return xslproc.output;
                }
            }
            return '';
        } else if (typeof document !== 'undefined' && document.implementation && document.implementation.createDocument) {
            var xsltStylesheet;
            if (xsl) {
                xsltStylesheet = xsl;
            } else {
                var parser = new DOMParser();
                xsltStylesheet = parser.parseFromString(transformXslt, "text/xml");
            }

            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsltStylesheet);
            xsltProcessor.setParameter(null, 'SerivceUri', cnf.SerivceUri);
            xsltProcessor.setParameter(null, 'EntityBaseClass', cnf.EntityBaseClass);
            xsltProcessor.setParameter(null, 'ContextBaseClass', cnf.ContextBaseClass);
            xsltProcessor.setParameter(null, 'AutoCreateContext', cnf.AutoCreateContext);
            xsltProcessor.setParameter(null, 'ContextInstanceName', cnf.ContextInstanceName);
            xsltProcessor.setParameter(null, 'EntitySetBaseClass', cnf.EntitySetBaseClass);
            xsltProcessor.setParameter(null, 'CollectionBaseClass', cnf.CollectionBaseClass);
            xsltProcessor.setParameter(null, 'DefaultNamespace', cnf.DefaultNamespace);
            xsltProcessor.setParameter(null, 'MaxDataserviceVersion', versionInfo.maxVersion || '3.0');
            xsltProcessor.setParameter(null, 'AllowedTypesList', cnf.typeFilter);
            xsltProcessor.setParameter(null, 'GenerateNavigationProperties', cnf.navigation);
            resultDocument = xsltProcessor.transformToFragment(metadata, document);

            return resultDocument.textContent;
        } else if (typeof module !== 'undefined' && typeof require !== 'undefined') {
            var xslt = require('node_xslt');

            return xslt.transform(xslt.readXsltString(transformXslt), xslt.readXmlString(metadata), [
                'SerivceUri', "'" + cnf.SerivceUri + "'",
                'EntityBaseClass', "'" + cnf.EntityBaseClass + "'",
                'ContextBaseClass', "'" + cnf.ContextBaseClass + "'",
                'AutoCreateContext', "'" + cnf.AutoCreateContext + "'",
                'ContextInstanceName', "'" + cnf.ContextInstanceName + "'",
                'EntitySetBaseClass', "'" + cnf.EntitySetBaseClass + "'",
                'CollectionBaseClass', "'" + cnf.CollectionBaseClass + "'",
                'DefaultNamespace', "'" + cnf.DefaultNamespace + "'",
                'MaxDataserviceVersion', "'" + (versionInfo.maxVersion || '3.0') + "'",
                'AllowedTypesList', "'" + cnf.typeFilter + "'",
                'GenerateNavigationProperties', "'" + cnf.navigation + "'"
            ]);
        }
    },
    _prepareTypeFilter: function (doc, versionInfo, cnf) {
        var result = '';
        if (!(typeof doc === 'object' && "querySelector" in doc && "querySelectorAll" in doc))
            return result;

        var config = [];
        if (typeof cnf.typeFilter === 'object' && cnf.typeFilter) {
            var types = Object.keys(cnf.typeFilter);
            for (var i = 0; i < types.length; i++) {
                var cfg = cnf.typeFilter[types[i]];
                var typeData = {};
                if (typeof cfg === 'object' && cfg) {
                    if (Array.isArray(cfg)) {
                        typeData.Name = types[i];
                        typeData.Fields = cfg;
                    } else {
                        typeData.Name = cfg.name || types[i];
                        typeData.Fields = cfg.members || [];
                    }
                } else if (cfg) {
                    typeData.Name = types[i];
                    typeData.Fields = [];
                } else {
                    continue;
                }

                var typeShortName = typeData.Name;
                var containerName = "";
                if (typeData.Name.lastIndexOf('.') > 0)
                {
                    containerName = typeData.Name.substring(0, typeData.Name.lastIndexOf('.'));
                    typeShortName = typeData.Name.substring(typeData.Name.lastIndexOf('.') + 1);
                }

                var conainers = doc.querySelectorAll("EntityContainer[Name = '" + containerName + "']");
                for (var j = 0; j < conainers.length; j++) {
                    var entitySetDef = conainers[j].querySelector("EntitySet[Name = '" + typeShortName + "']");
                    if (entitySetDef != null)
                    {
                        typeData.Name = entitySetDef.attributes["EntityType"].value;
                        break;
                    }

                }

                config.push(typeData);
            }

            var discoveredData;
            if (cnf.dependentRelationsOnly) {
                discoveredData = this._discoverProperyDependencies(config, doc, cnf.navigation, cnf.generateKeys);
            } else {
                discoveredData = this._discoverTypeDependencies(config, doc, cnf.navigation, cnf.generateKeys);
            }

            var complex = doc.querySelectorAll("ComplexType");
            for (var i = 0; i < complex.length; i++)
            {
                var cns = complex[i].parentNode.attributes["Namespace"].value;
                var data = !cns ? complex[i].attributes["Name"].value : (cns + "." + complex[i].attributes["Name"].value);
                discoveredData.push({ Name: data, Fields: [] });
            }

            for (var i = 0; i < discoveredData.length; i++)
            {
                var row = discoveredData[i];
                if (row.Fields.length > 0) {
                    result += row.Name + ":" + row.Fields.join(",") + ";";
                }
                else {
                    result += row.Name + ";";
                }
            }

        }

        return result;
    },
    _discoverTypeDependencies: function (types, doc, withNavPropertis, withKeys) {
        var allowedTypes = [];
        var allowedTypeNames = [];
        var collect = [];

        for (var i = 0; i < types.length; i++)
        {
            var idx = collect.indexOf(types[i].Name);
            if(idx >= 0){
                collect.splice(idx, 1);
            }
            this._discoverType(types[i], doc, allowedTypes, allowedTypeNames, withNavPropertis, withKeys, true, collect);
        }

        for (var i = 0; i < collect.length; i++)
        {
            this._discoverType({ Name: collect[i], Fields: [] }, doc, allowedTypes, allowedTypeNames, withNavPropertis, withKeys, false, []);
        }

        return allowedTypes;
    },
    _discoverType: function(typeData, doc, allowedTypes, allowedTypeNames, withNavPropertis, withKeys, collectTypes, collectedTypes) {
        var typeName = typeData.Name;

        if (allowedTypeNames.indexOf(typeName) >= 0)
        {
            return;
        }
        console.log("Discover: " + typeName);

        var typeShortName = typeName;
        var typeNamespace = '';
        if (typeName.lastIndexOf('.') > 0)
        {
            typeNamespace = typeName.substring(0, typeName.lastIndexOf('.'));
            typeShortName = typeName.substring(typeName.lastIndexOf('.') + 1);
        }

        var schemaNode = doc.querySelector("Schema[Namespace = '" + typeNamespace + "']");
        if (schemaNode != null)
        {
            var typeNode = schemaNode.querySelector("EntityType[Name = '" + typeShortName + "'], ComplexType[Name = '" + typeShortName + "']");
            if (typeNode != null)
            {
                allowedTypes.push(typeData);
                allowedTypeNames.push(typeName);

                if (withKeys && typeData.Fields.length > 0) {
                    var keys = typeNode.querySelectorAll("Key PropertyRef");
                    if (keys != null)
                    {
                        for (var j = 0; j < keys.length; j++)
                        {
                            var keyField = keys[j].attributes["Name"].value;
                            if (typeData.Fields.indexOf(keyField) < 0)
                                typeData.Fields.splice(j, 0, keyField);
                        }
                    }
                }

                if (withNavPropertis)
                {
                    var navPropNodes = typeNode.querySelectorAll("NavigationProperty");
                    for (var j = 0; j < navPropNodes.length; j++)
                    {
                        var navProp = navPropNodes[j];
                        if (typeData.Fields.length == 0 || typeData.Fields.indexOf(navProp.attributes["Name"].value) >=0)
                        {

                            var FromRole = navProp.attributes["FromRole"].value;
                            var ToRole = navProp.attributes["ToRole"].value;

                            var association = schemaNode.querySelector("Association End[Role = '" + FromRole + "']:not([Type = '" + typeName + "'])");
                            if (association == null)
                            {
                                association = schemaNode.querySelector("Association End[Role = '" + ToRole + "']:not([Type = '" + typeName + "'])");
                            }

                            if (association != null)
                            {
                                var nav_type = association.attributes["Type"].value;

                                if (collectTypes)
                                {
                                    if (collectedTypes.indexOf(nav_type) < 0 && allowedTypeNames.indexOf(nav_type) < 0)
                                        collectedTypes.push(nav_type);
                                }
                                else
                                {
                                    this._discoverType({ Name: nav_type, Fields: [] }, doc, allowedTypes, allowedTypeNames, withNavPropertis, withKeys, false, collectedTypes);
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    _discoverProperyDependencies: function (types, doc, withNavPropertis, withKeys) {
        var allowedTypes = [];
        var allowedTypeNames = types.map(function(t) { return t.Name; });

        for (var i = 0; i < types.length; i++)
        {
            this._discoverProperties(types[i], doc, allowedTypes, allowedTypeNames, withNavPropertis, withKeys);
        }

        return allowedTypes;
    },
    _discoverProperties: function(typeData, doc, allowedTypes, allowedTypeNames, withNavPropertis, withKeys) {
        var typeName = typeData.Name;
        console.log("Discover: " + typeName);

        var hasProperty = typeData.Fields.length != 0;
        var typeShortName = typeName;
        var typeNamespace = '';
        if (typeName.lastIndexOf('.') > 0)
        {
            typeNamespace = typeName.substring(0, typeName.lastIndexOf('.'));
            typeShortName = typeName.substring(typeName.lastIndexOf('.') + 1);
        }

        var schemaNode = doc.querySelector("Schema[Namespace = '" + typeNamespace + "']");
        if (schemaNode != null)
        {
            var typeNode = schemaNode.querySelector("EntityType[Name = '" + typeShortName + "'], ComplexType[Name = '" + typeShortName + "']");
            if (typeNode != null)
            {
                allowedTypes.push(typeData);

                if (!hasProperty)
                {
                    var properties = typeNode.querySelectorAll("Property");
                    if (properties != null)
                    {
                        for (var j = 0; j < properties.length; j++)
                        {
                            var field = properties[j].attributes["Name"].value;
                            typeData.Fields.push(field);
                        }
                    }

                    if (withNavPropertis)
                    {
                        var navPropNodes = typeNode.querySelectorAll("NavigationProperty");
                        for (var j = 0; j < navPropNodes.length; j++)
                        {
                            var navProp = navPropNodes[j];
                            var nav_name = navProp.attributes["Name"].value;
                            var types = [ navProp.attributes["FromRole"].value, navProp.attributes["ToRole"].value ];

                            var nav_type = '';
                            for (var t = 0; t < types.length; t++)
                            {
                                var association = schemaNode.querySelector("Association End[Role = '" + types[t] + "']");
                                if (association != null)
                                {
                                    nav_type = association.attributes["Type"].value;
                                    if (nav_type != typeName || t == 1)
                                        break;
                                }
                            }

                            if (allowedTypeNames.indexOf(nav_type) >= 0)
                            {
                                typeData.Fields.push(nav_name);
                            }
                        }
                    }
                }
                else if (withKeys)
                {
                    var keys = typeNode.querySelectorAll("Key PropertyRef");
                    if (keys != null)
                    {
                        for (var j = 0; j < keys.length; j++)
                        {
                            var keyField = keys[j].attributes["Name"].value;
                            if (typeData.Fields.indexOf(keyField) < 0)
                                typeData.Fields.splice(j, 0, keyField);
                        }
                    }
                }
            }
        }
    },

    _findVersion: function (metadata) {
        var maxDSVersion = '';

        if (typeof metadata === 'object' && "getElementsByTagName" in metadata){
            var version = 'http://schemas.microsoft.com/ado/2008/09/edm';
            var item = metadata.getElementsByTagName('Schema');
            if (item)
                item = item[0];
            if (item)
                item = item.attributes;
            if (item)
                item = item.getNamedItem('xmlns');
            if (item)
                version = item.value;

            var maxDSVersion = metadata.getElementsByTagName('edmx:DataServices')[0] || metadata.getElementsByTagName('DataServices')[0];
            if (maxDSVersion)
                maxDSVersion = maxDSVersion.attributes.getNamedItem('m:MaxDataServiceVersion');
            if (maxDSVersion && version)
                maxDSVersion = maxDSVersion.value;


            var versionNum = this._supportedODataVersions[version];
            return {
                ns: version,
                version: versionNum || 'unknown',
                maxVersion: maxDSVersion || this._maxDataServiceVersions[version || 'unknown']
            };
        }else if (typeof module !== 'undefined' && typeof require !== 'undefined'){
            var schemaXml = metadata;
            
            var schemaNamespace = 'http://schemas.microsoft.com/ado/2008/09/edm';
            var version = 'nodejs';
            for (var i in this._supportedODataVersions){
                if (schemaXml.search(new RegExp('<Schema.+xmlns=\"' + i + '\"', 'gi')) >= 0){
                    schemaNamespace = i;
                    version = this._supportedODataVersions[i];
                    break;
                }
            }

            return {
                ns: schemaNamespace,
                version: version,
                maxVersion: this._maxDataServiceVersions[version || 'unknown']
            }
        }
    },
    _supportedODataVersions: {
        value: {
            "http://schemas.microsoft.com/ado/2006/04/edm": "V1",
            "http://schemas.microsoft.com/ado/2008/09/edm": "V2",
            "http://schemas.microsoft.com/ado/2009/11/edm": "V3",
            "http://schemas.microsoft.com/ado/2007/05/edm": "V11",
            "http://schemas.microsoft.com/ado/2009/08/edm": "V22"
        }
    },
    _maxDataServiceVersions: {
        value: {
            "http://schemas.microsoft.com/ado/2006/04/edm": "2.0",
            "http://schemas.microsoft.com/ado/2008/09/edm": "2.0",
            "http://schemas.microsoft.com/ado/2009/11/edm": "3.0",
            "http://schemas.microsoft.com/ado/2007/05/edm": "2.0",
            "http://schemas.microsoft.com/ado/2009/08/edm": "2.0"
        }
    },
    _supportedODataVersionXSLT: {
        value: "JayDataContextGenerator.xslt"
    },
    getCurrentXSLTVersion: function (versionInfo, metadata) {
        return this._metadataConverterXSLT.replace('@@VERSIONNS@@', versionInfo.ns).replace('@@VERSION@@', versionInfo.version);
    },
    __encodeBase64: function (val) {
        var b64array = "ABCDEFGHIJKLMNOP" +
                           "QRSTUVWXYZabcdef" +
                           "ghijklmnopqrstuv" +
                           "wxyz0123456789+/" +
                           "=";

        var input = val;
        var base64 = "";
        var hex = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            base64 = base64 +
                        b64array.charAt(enc1) +
                        b64array.charAt(enc2) +
                        b64array.charAt(enc3) +
                        b64array.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return base64;
    },
    _metadataConverterXSLT: {
        type: 'string',
        value:
            "<xsl:stylesheet version=\"1.0\" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\" \r\n" +
            "                xmlns:edm=\"@@VERSIONNS@@\" \r\n" +
            "                xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" \r\n" +
            "                xmlns:metadata=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" \r\n" +
            "                xmlns:annot=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" \r\n" +
            "                xmlns:exsl=\"http://exslt.org/common\" \r\n" +
            "                xmlns:msxsl=\"urn:schemas-microsoft-com:xslt\" exclude-result-prefixes=\"msxsl\">\r\n" +
            "\r\n" +
            "  <xsl:key name=\"entityType\" match=\"edm:EntityType\" use=\"concat(string(../@Namespace),'.', string(@Name))\"/>\r\n" +
            "  <xsl:key name=\"associations\" match=\"edm:Association\" use=\"concat(string(../@Namespace),'.', string(@Name))\"/>\r\n" +
            "\r\n" +
            "  <xsl:strip-space elements=\"property item unprocessed\"/>\r\n" +
            "  <xsl:output method=\"text\" indent=\"no\"  />\r\n" +
            "  <xsl:param name=\"contextNamespace\" />\r\n" +
            "\r\n" +
            "  <xsl:param name=\"SerivceUri\" />\r\n" +
            "  <xsl:param name=\"EntityBaseClass\"/>\r\n" +
            "  <xsl:param name=\"ContextBaseClass\"/>\r\n" +
            "  <xsl:param name=\"AutoCreateContext\"/>\r\n" +
            "  <xsl:param name=\"ContextInstanceName\"/>\r\n" +
            "  <xsl:param name=\"EntitySetBaseClass\"/>\r\n" +
            "  <xsl:param name=\"CollectionBaseClass\"/>\r\n" +
            "  <xsl:param name=\"DefaultNamespace\"/>\r\n" +
            "  <xsl:param name=\"MaxDataserviceVersion\"/>\r\n" +
            "  <xsl:param name=\"AllowedTypesList\" />\r\n" +
            "  <xsl:param name=\"GenerateNavigationProperties\" />\r\n" +
            "\r\n" +
            "  <xsl:param name=\"AllowedTypesListX\">Microsoft.Crm.Sdk.Data.Services.Product;Microsoft.Crm.Sdk.Data.Services.LeadAddress:Telephone1,City,UTCOffset;</xsl:param>\r\n" +
            "\r\n" +
            "  <xsl:variable name=\"fullmetadata\" select=\"/\" />\r\n" +
            "  \r\n" +
            "  <xsl:template name=\"createFieldsList\">\r\n" +
            "    <xsl:param name=\"fields\" />\r\n" +
            "    <!--<xsl:message terminate=\"no\">\r\n" +
            "      create field: @<xsl:value-of select=\"$fields\"/>@\r\n" +
            "    </xsl:message>-->\r\n" +
            "      <xsl:variable name=\"thisField\">\r\n" +
            "        <xsl:choose>\r\n" +
            "          <xsl:when test=\"contains($fields,',')\">\r\n" +
            "            <xsl:value-of select=\"substring-before($fields, ',')\"/>\r\n" +
            "          </xsl:when>\r\n" +
            "          <xsl:otherwise>\r\n" +
            "            <xsl:value-of select=\"$fields\"/>\r\n" +
            "          </xsl:otherwise>\r\n" +
            "        </xsl:choose>\r\n" +
            "      </xsl:variable>\r\n" +
            "      <xsl:element name=\"field\">\r\n" +
            "        <xsl:attribute name=\"name\">\r\n" +
            "          <xsl:value-of select=\"$thisField\"/>\r\n" +
            "        </xsl:attribute> \r\n" +
            "      </xsl:element>\r\n" +
            "      <xsl:variable name=\"remaining\" select=\"substring($fields, string-length($thisField) + 2)\" />\r\n" +
            "      <xsl:if test=\"string-length($remaining) > 0\">\r\n" +
            "        <xsl:call-template name=\"createFieldsList\">\r\n" +
            "          <xsl:with-param name=\"fields\" select=\"$remaining\" />\r\n" +
            "        </xsl:call-template>\r\n" +
            "      </xsl:if>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template name=\"createType\">\r\n" +
            "    <xsl:param name=\"typeFull\" />\r\n" +
            "    <!--<xsl:message terminate=\"no\">\r\n" +
            "      create type: <xsl:value-of select=\"$typeFull\"/>\r\n" +
            "    </xsl:message>-->\r\n" +
            "    <xsl:variable name=\"typeName\">\r\n" +
            "      <xsl:choose>\r\n" +
            "        <xsl:when test=\"contains($typeFull,':')\">\r\n" +
            "          <xsl:value-of select=\"substring-before($typeFull, ':') \"/>\r\n" +
            "        </xsl:when>\r\n" +
            "        <xsl:otherwise>\r\n" +
            "          <xsl:value-of select=\"$typeFull\"/>\r\n" +
            "        </xsl:otherwise>\r\n" +
            "      </xsl:choose>\r\n" +
            "    </xsl:variable>\r\n" +
            "    <xsl:variable name=\"fields\" select=\"substring($typeFull, string-length($typeName) + 2)\" />\r\n" +
            "    <xsl:element name=\"type\">\r\n" +
            "      <xsl:attribute name=\"name\">\r\n" +
            "        <xsl:value-of select=\"$typeName\"/>\r\n" +
            "      </xsl:attribute>\r\n" +
            "      <xsl:if test=\"string-length($fields) > 0\">\r\n" +
            "        <xsl:call-template name=\"createFieldsList\">\r\n" +
            "          <xsl:with-param name=\"fields\" select=\"$fields\" />\r\n" +
            "        </xsl:call-template>\r\n" +
            "      </xsl:if>\r\n" +
            "    </xsl:element>\r\n" +
            "  </xsl:template>\r\n" +
            "  \r\n" +
            "  <xsl:template name=\"createTypeList\">\r\n" +
            "    <xsl:param name=\"types\" />\r\n" +
            "    <!--<xsl:message terminate=\"no\">\r\n" +
            "      createTypeList: <xsl:value-of select=\"$types\"/>\r\n" +
            "    </xsl:message>-->\r\n" +
            "        \r\n" +
            "    <xsl:variable name=\"thisTypeFull\">\r\n" +
            "      <xsl:choose>\r\n" +
            "        <xsl:when test=\"contains($types, ';')\">\r\n" +
            "          <xsl:value-of select=\"substring-before($types, ';')\"/>\r\n" +
            "        </xsl:when>\r\n" +
            "        <xsl:otherwise>\r\n" +
            "          <xsl:value-of select=\"$types\"/>\r\n" +
            "        </xsl:otherwise>\r\n" +
            "      </xsl:choose>\r\n" +
            "    </xsl:variable>\r\n" +
            "\r\n" +
            "    <xsl:if test=\"string-length($thisTypeFull) > 0\">\r\n" +
            "      <xsl:call-template name=\"createType\">\r\n" +
            "        <xsl:with-param name=\"typeFull\" select=\"$thisTypeFull\" />\r\n" +
            "      </xsl:call-template>\r\n" +
            "    </xsl:if>\r\n" +
            "    \r\n" +
            "    <xsl:variable name=\"remaining\" select=\"substring($types, string-length($thisTypeFull) + 2)\" />\r\n" +
            "    <!--<xsl:message terminate=\"no\">\r\n" +
            "      rem: @<xsl:value-of select=\"$remaining\"/>@  \r\n" +
            "    </xsl:message>-->\r\n" +
            "    \r\n" +
            "    <xsl:if test=\"string-length($remaining) > 0\">\r\n" +
            "      <xsl:call-template name=\"createTypeList\">\r\n" +
            "        <xsl:with-param name=\"types\" select=\"$remaining\" />\r\n" +
            "      </xsl:call-template>\r\n" +
            "    </xsl:if>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:variable name=\"allowedTypes\">\r\n" +
            "    <xsl:call-template name=\"createTypeList\">\r\n" +
            "      <xsl:with-param name=\"types\" select=\"$AllowedTypesList\" />\r\n" +
            "    </xsl:call-template>\r\n" +
            "  </xsl:variable>\r\n" +
            "  \r\n" +
            "\r\n" +
            "<!-- TODO EXSLT node-set -->\r\n" +
            "  <!--<xsl:variable name=\"hasTypeFilter\" select=\"boolean(count(msxsl:node-set($allowedTypes)/type) > 0)\"/>-->\r\n" +
            "  <xsl:variable name=\"hasTypeFilter\">\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"function-available('msxsl:node-set')\"><xsl:value-of select=\"boolean(count(msxsl:node-set($allowedTypes)/type) > 0)\"/></xsl:when>\r\n" +
            "      <xsl:otherwise><xsl:value-of select=\"boolean(count(exsl:node-set($allowedTypes)/type) > 0)\"/></xsl:otherwise>\r\n" +
            "    </xsl:choose>\r\n" +
            "  </xsl:variable>\r\n" +
            "  <xsl:template match=\"/\">\r\n" +
            "\r\n" +
            "/*//////////////////////////////////////////////////////////////////////////////////////\r\n" +
            "////// Autogenerated by JaySvcUtil.exe http://JayData.org for more info        /////////\r\n" +
            "//////                             oData @@VERSION@@                                    /////////\r\n" +
            "//////////////////////////////////////////////////////////////////////////////////////*/\r\n" +
            "(function(global, $data, undefined) {\r\n" +
            "\r\n" +
            "    \r\n" +
            "<xsl:for-each select=\"//edm:EntityType | //edm:ComplexType\" xml:space=\"default\">\r\n" +
            "  <xsl:variable name=\"thisName\" select=\"concat(../@Namespace, '.', @Name)\" />\r\n" +
            "  <!-- TODO EXSLT node-set-->\r\n" +
            "  <!--<xsl:variable name=\"thisTypeNode\" select=\"msxsl:node-set($allowedTypes)/type[@name = $thisName]\" />-->\r\n" +
            "  <xsl:variable name=\"thisTypeNode\">\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
            "        <xsl:copy-of select=\"msxsl:node-set($allowedTypes)/type[@name = $thisName]\"/>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:otherwise>\r\n" +
            "        <xsl:copy-of select=\"exsl:node-set($allowedTypes)/type[@name = $thisName]\"/>\r\n" +
            "      </xsl:otherwise>\r\n" +
            "    </xsl:choose>\r\n" +
            "  </xsl:variable>\r\n" +
            "  <xsl:variable name=\"thisTypeNodeExists\">\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
            "        <xsl:copy-of select=\"(count(msxsl:node-set($allowedTypes)/type[@name = $thisName]) > 0)\"/>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:otherwise>\r\n" +
            "        <xsl:copy-of select=\"(count(exsl:node-set($allowedTypes)/type[@name = $thisName]) > 0)\"/>\r\n" +
            "      </xsl:otherwise>\r\n" +
            "    </xsl:choose>\r\n" +
            "  </xsl:variable>\r\n" +
            "  <!--<xsl:variable name=\"filterFields\" select=\"(count($thisTypeNode/field) > 0)\" />-->\r\n" +
            "  <xsl:variable name=\"filterFields\">\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
            "        <xsl:copy-of select=\"(count(msxsl:node-set($thisTypeNode)/type/field) > 0)\"/>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:otherwise>\r\n" +
            "        <xsl:copy-of select=\"(count(exsl:node-set($thisTypeNode)/type/field) > 0)\"/>\r\n" +
            "      </xsl:otherwise>\r\n" +
            "    </xsl:choose>\r\n" +
            "  </xsl:variable>\r\n" +
            "  <xsl:if test=\"($hasTypeFilter = 'false') or ($thisTypeNodeExists = 'true')\">\r\n" +
            "\r\n" +
            "      <xsl:message terminate=\"no\">Info: generating type <xsl:value-of select=\"concat(../@Namespace, '.', @Name)\"/></xsl:message>\r\n" +
            "    \r\n" +
            "      <xsl:variable name=\"BaseType\">\r\n" +
            "        <xsl:choose>\r\n" +
            "          <xsl:when test=\"@BaseType\">\r\n" +
            "            <xsl:value-of select=\"concat($DefaultNamespace,@BaseType)\"/>\r\n" +
            "          </xsl:when>\r\n" +
            "          <xsl:otherwise>\r\n" +
            "            <xsl:value-of select=\"$EntityBaseClass\"  />\r\n" +
            "          </xsl:otherwise>\r\n" +
            "        </xsl:choose>\r\n" +
            "      </xsl:variable>\r\n" +
            "\r\n" +
            "\r\n" +
            "     <xsl:variable name=\"props\">\r\n" +
            "       <xsl:for-each select=\"*[local-name() != 'NavigationProperty' or ($GenerateNavigationProperties = 'true' and local-name() = 'NavigationProperty')]\">\r\n" +
            "         <xsl:variable name=\"fname\" select=\"@Name\" />\r\n" +
            "         <xsl:variable name=\"isAllowedField\">\r\n" +
            "           <xsl:choose>\r\n" +
            "             <xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
            "               <xsl:copy-of select=\"(count(msxsl:node-set($thisTypeNode)/type/field[@name = $fname]) > 0)\"/>\r\n" +
            "             </xsl:when>\r\n" +
            "             <xsl:otherwise>\r\n" +
            "               <xsl:copy-of select=\"(count(exsl:node-set($thisTypeNode)/type/field[@name = $fname]) > 0)\"/>\r\n" +
            "             </xsl:otherwise>\r\n" +
            "           </xsl:choose>\r\n" +
            "         </xsl:variable>\r\n" +
            "         <xsl:if test=\"($filterFields = 'false') or ($isAllowedField = 'true')\">\r\n" +
            "           <xsl:apply-templates select=\".\" />\r\n" +
            "         </xsl:if> \r\n" +
            "       </xsl:for-each>\r\n" +
            "      </xsl:variable>\r\n" +
            "    \r\n" +
            "      <xsl:text xml:space=\"preserve\">  </xsl:text><xsl:value-of select=\"$BaseType\"  />.extend('<xsl:value-of select=\"concat($DefaultNamespace,../@Namespace)\"/>.<xsl:value-of select=\"@Name\"/>', {\r\n" +
            "     <xsl:choose>\r\n" +
            "        <xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
            "          <xsl:for-each select=\"msxsl:node-set($props)/*\">\r\n" +
            "            <xsl:value-of select=\".\"/>\r\n" +
            "            <xsl:if test=\"position() != last()\">\r\n" +
            "            <xsl:text>,&#10;     </xsl:text>  \r\n" +
            "            </xsl:if>\r\n" +
            "          </xsl:for-each>\r\n" +
            "        </xsl:when>\r\n" +
            "        <xsl:otherwise>\r\n" +
            "          <xsl:for-each select=\"exsl:node-set($props)/*\">\r\n" +
            "            <xsl:value-of select=\".\"/>\r\n" +
            "            <xsl:if test=\"position() != last()\">,&#10;     </xsl:if>\r\n" +
            "          </xsl:for-each>\r\n" +
            "        </xsl:otherwise>\r\n" +
            "      </xsl:choose>\r\n" +
            "      <xsl:variable name=\"currentName\"><xsl:value-of select=\"concat(../@Namespace,'.',@Name)\"/></xsl:variable>\r\n" +
            "      <xsl:for-each select=\"//edm:FunctionImport[@IsBindable and edm:Parameter[1]/@Type = $currentName]\"><xsl:if test=\"position() = 1\">,\r\n" +
            "      </xsl:if>\r\n" +
            "        <xsl:apply-templates select=\".\"></xsl:apply-templates><xsl:if test=\"position() != last()\">,\r\n" +
            "      </xsl:if>\r\n" +
            "      </xsl:for-each>\r\n" +
            "  });\r\n" +
            "\r\n" +
            "</xsl:if>\r\n" +
            "</xsl:for-each>\r\n" +
            "\r\n" +
            "<xsl:for-each select=\"//edm:EntityContainer\">\r\n" +
            "  <xsl:text xml:space=\"preserve\">  </xsl:text><xsl:value-of select=\"$ContextBaseClass\"  />.extend('<xsl:value-of select=\"concat(concat($DefaultNamespace,../@Namespace), '.', @Name)\"/>', {\r\n" +
            "     <!--or (@IsBindable = 'true' and (@IsAlwaysBindable = 'false' or @m:IsAlwaysBindable = 'false' or @metadata:IsAlwaysBindable = 'false'))-->\r\n" +
            "\r\n" +
            "   <xsl:variable name=\"subset\">\r\n" +
            "    <xsl:for-each select=\"edm:EntitySet | edm:FunctionImport\">\r\n" +
            "      <xsl:choose>\r\n" +
            "        <xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
            "          <xsl:if test=\"($hasTypeFilter = 'false') or msxsl:node-set($allowedTypes)/type[@name = current()/@EntityType]\">\r\n" +
            "            <xsl:copy-of select=\".\"/>\r\n" +
            "          </xsl:if>\r\n" +
            "        </xsl:when>\r\n" +
            "        <xsl:otherwise>\r\n" +
            "          <xsl:if test=\"($hasTypeFilter = 'false') or exsl:node-set($allowedTypes)/type[@name = current()/@EntityType]\">\r\n" +
            "            <xsl:copy-of select=\".\"/>\r\n" +
            "          </xsl:if>\r\n" +
            "        </xsl:otherwise>\r\n" +
            "      </xsl:choose>\r\n" +
            "    </xsl:for-each>\r\n" +
            "  </xsl:variable>\r\n" +
            "\r\n" +
            "  \r\n" +
            "  <xsl:choose>\r\n" +
            "    <xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
            "      <xsl:for-each select=\"msxsl:node-set($subset)/*[local-name() != 'FunctionImport' or not(@IsBindable) or @IsBindable = 'false']\">\r\n" +
            "        <xsl:apply-templates select=\".\"></xsl:apply-templates>\r\n" +
            "        <xsl:if test=\"position() != last()\">,\r\n" +
            "     </xsl:if>\r\n" +
            "      </xsl:for-each>\r\n" +
            "    </xsl:when>\r\n" +
            "    <xsl:otherwise>\r\n" +
            "      <xsl:for-each select=\"exsl:node-set($subset)/*[local-name() != 'FunctionImport' or not(@IsBindable) or @IsBindable = 'false']\">\r\n" +
            "        <xsl:apply-templates select=\".\"></xsl:apply-templates>\r\n" +
            "        <xsl:if test=\"position() != last()\">,\r\n" +
            "     </xsl:if>\r\n" +
            "      </xsl:for-each>\r\n" +
            "    </xsl:otherwise>\r\n" +
            "  </xsl:choose>\r\n" +
            "  });\r\n" +
            "\r\n" +
            "  $data.generatedContexts = $data.generatedContexts || [];\r\n" +
            "  $data.generatedContexts.push(<xsl:value-of select=\"concat(concat($DefaultNamespace,../@Namespace), '.', @Name)\" />);\r\n" +
            "  <xsl:if test=\"$AutoCreateContext = 'true'\">\r\n" +
            "  /*Context Instance*/\r\n" +
            "  <xsl:value-of select=\"$DefaultNamespace\"/><xsl:value-of select=\"$ContextInstanceName\" /> = new <xsl:value-of select=\"concat(concat($DefaultNamespace,../@Namespace), '.', @Name)\" />({ name:'oData', oDataServiceHost: '<xsl:value-of select=\"$SerivceUri\" />', maxDataServiceVersion: '<xsl:value-of select=\"$MaxDataserviceVersion\" />' });\r\n" +
            "</xsl:if>\r\n" +
            "\r\n" +
            "</xsl:for-each>\r\n" +
            "      \r\n" +
            "})(window, $data);\r\n" +
            "      \r\n" +
            "    </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"edm:Key\"></xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"edm:FunctionImport\">\r\n" +
            "    <xsl:text>'</xsl:text>\r\n" +
            "    <xsl:value-of select=\"@Name\"/>\r\n" +
            "    <xsl:text>': { type: </xsl:text>\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"@IsBindable = 'true'\">\r\n" +
            "        <xsl:text>$data.ServiceAction</xsl:text>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:otherwise>\r\n" +
            "        <xsl:text>$data.ServiceOperation</xsl:text>\r\n" +
            "      </xsl:otherwise>\r\n" +
            "    </xsl:choose>\r\n" +
            "\r\n" +
            "    <xsl:apply-templates select=\"@*\" mode=\"FunctionImport-mode\"/>\r\n" +
            "\r\n" +
            "    <xsl:variable name=\"IsBindable\">\r\n" +
            "      <xsl:value-of select=\"@IsBindable\"/>\r\n" +
            "    </xsl:variable>\r\n" +
            "    <xsl:text>, params: [</xsl:text>\r\n" +
            "    <xsl:for-each select=\"edm:Parameter[($IsBindable = 'true' and position() > 1) or (($IsBindable = 'false' or $IsBindable = '') and position() > 0)]\">\r\n" +
            "      <xsl:text>{ name: '</xsl:text>\r\n" +
            "      <xsl:value-of select=\"@Name\"/>\r\n" +
            "      <xsl:text>', type: '</xsl:text>\r\n" +
            "      <xsl:variable name=\"curr\" select=\"@Type\"/>\r\n" +
            "      <xsl:choose>\r\n" +
            "        <xsl:when test=\"$fullmetadata//edm:Schema[starts-with($curr, @Namespace)]\">\r\n" +
            "          <xsl:value-of select=\"concat($DefaultNamespace,$curr)\" />\r\n" +
            "        </xsl:when>\r\n" +
            "        <xsl:otherwise>\r\n" +
            "          <xsl:value-of select=\"$curr\" />\r\n" +
            "        </xsl:otherwise>\r\n" +
            "      </xsl:choose>\r\n" +
            "      <xsl:text>' }</xsl:text>\r\n" +
            "      <xsl:if test=\"position() != last()\">, </xsl:if>\r\n" +
            "    </xsl:for-each>    \r\n" +
            "    <xsl:text>]</xsl:text>\r\n" +
            "\r\n" +
            "    <xsl:text> }</xsl:text>\r\n" +
            "  </xsl:template>\r\n" +
            "  \r\n" +
            "  <xsl:template match=\"@ReturnType\" mode=\"FunctionImport-mode\">\r\n" +
            "    <xsl:text>, returnType: </xsl:text>\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"not(.)\">null</xsl:when>\r\n" +
            "      <xsl:when test=\"starts-with(., 'Collection')\">$data.Queryable</xsl:when>\r\n" +
            "      <xsl:otherwise>\r\n" +
            "        <xsl:text>'</xsl:text>\r\n" +
            "        <xsl:variable name=\"curr\" select=\".\"/>\r\n" +
            "        <xsl:choose>\r\n" +
            "          <xsl:when test=\"$fullmetadata//edm:Schema[starts-with($curr, @Namespace)]\">\r\n" +
            "            <xsl:value-of select=\"concat($DefaultNamespace,$curr)\" />\r\n" +
            "          </xsl:when>\r\n" +
            "          <xsl:otherwise>\r\n" +
            "            <xsl:value-of select=\"$curr\" />\r\n" +
            "          </xsl:otherwise>\r\n" +
            "        </xsl:choose>\r\n" +
            "        <xsl:text>'</xsl:text>\r\n" +
            "      </xsl:otherwise>\r\n" +
            "    </xsl:choose>\r\n" +
            "\r\n" +
            "    <xsl:if test=\"starts-with(., 'Collection')\">\r\n" +
            "      <xsl:variable name=\"len\" select=\"string-length(.)-12\"/>\r\n" +
            "      <xsl:variable name=\"curr\" select=\"substring(.,12,$len)\"/>\r\n" +
            "      <xsl:variable name=\"ElementType\" >\r\n" +
            "        <xsl:choose>\r\n" +
            "          <xsl:when test=\"$fullmetadata//edm:Schema[starts-with($curr, @Namespace)]\">\r\n" +
            "            <xsl:value-of select=\"concat($DefaultNamespace,$curr)\" />\r\n" +
            "          </xsl:when>\r\n" +
            "          <xsl:otherwise>\r\n" +
            "            <xsl:value-of select=\"$curr\" />\r\n" +
            "          </xsl:otherwise>\r\n" +
            "        </xsl:choose>\r\n" +
            "      </xsl:variable>\r\n" +
            "      <xsl:text>, elementType: '</xsl:text>\r\n" +
            "      <xsl:value-of select=\"$ElementType\"/>\r\n" +
            "      <xsl:text>'</xsl:text>\r\n" +
            "    </xsl:if>\r\n" +
            "  </xsl:template>\r\n" +
            "  <xsl:template match=\"@Name\" mode=\"FunctionImport-mode\"></xsl:template>\r\n" +
            "  <xsl:template match=\"@m:HttpMethod\" mode=\"FunctionImport-mode\">\r\n" +
            "    <xsl:text>, method: '</xsl:text>\r\n" +
            "    <xsl:value-of select=\".\"/>\r\n" +
            "    <xsl:text>'</xsl:text>\r\n" +
            "  </xsl:template>\r\n" +
            "  <xsl:template match=\"@IsBindable | @IsSideEffecting | @IsAlwaysBindable | @m:IsAlwaysBindable | @metadata:IsAlwaysBindable | @IsComposable\" mode=\"FunctionImport-mode\">\r\n" +
            "    <xsl:text>, </xsl:text>\r\n" +
            "    <xsl:call-template name=\"GetAttributeName\">\r\n" +
            "      <xsl:with-param name=\"Name\" select=\"name()\" />\r\n" +
            "    </xsl:call-template>\r\n" +
            "    <xsl:text>: </xsl:text>\r\n" +
            "    <xsl:value-of select=\".\"/>\r\n" +
            "  </xsl:template>\r\n" +
            "  <xsl:template match=\"@*\" mode=\"FunctionImport-mode\">\r\n" +
            "    <xsl:text>, '</xsl:text>\r\n" +
            "    <xsl:call-template name=\"GetAttributeName\">\r\n" +
            "      <xsl:with-param name=\"Name\" select=\"name()\" />\r\n" +
            "    </xsl:call-template>\r\n" +
            "    <xsl:text>': '</xsl:text>\r\n" +
            "    <xsl:value-of select=\".\"/>        \r\n" +
            "    <xsl:text>'</xsl:text>\r\n" +
            "  </xsl:template>\r\n" +
            "  <xsl:template name=\"GetAttributeName\">\r\n" +
            "    <xsl:param name=\"Name\" />\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"contains($Name, ':')\">\r\n" +
            "        <xsl:value-of select=\"substring-after($Name, ':')\"/>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:otherwise>\r\n" +
            "        <xsl:value-of select=\"$Name\"/>\r\n" +
            "      </xsl:otherwise>\r\n" +
            "    </xsl:choose>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"edm:EntitySet\">'<xsl:value-of select=\"@Name\"/>': { type: <xsl:value-of select=\"$EntitySetBaseClass\"  />, elementType: <xsl:value-of select=\"concat($DefaultNamespace,@EntityType)\"/><xsl:text> </xsl:text><xsl:apply-templates select=\".\" mode=\"Collection-Actions\" />}</xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"edm:EntitySet\" mode=\"Collection-Actions\">\r\n" +
            "    <xsl:variable name=\"CollectionType\" select=\"concat('Collection(', @EntityType, ')')\" />\r\n" +
            "    <xsl:for-each select=\"//edm:FunctionImport[edm:Parameter[1]/@Type = $CollectionType]\">\r\n" +
            "      <xsl:if test=\"position() = 1\">\r\n" +
            "        <xsl:text>, actions: { \r\n" +
            "        </xsl:text>\r\n" +
            "      </xsl:if>\r\n" +
            "        <xsl:apply-templates select=\".\"></xsl:apply-templates><xsl:if test=\"position() != last()\">,\r\n" +
            "        </xsl:if>\r\n" +
            "      <xsl:if test=\"position() = last()\">\r\n" +
            "        <xsl:text>\r\n" +
            "      }</xsl:text>\r\n" +
            "      </xsl:if>\r\n" +
            "    </xsl:for-each>\r\n" +
            "  </xsl:template>\r\n" +
            "  \r\n" +
            "  <xsl:template match=\"edm:Property | edm:NavigationProperty\">\r\n" +
            "    <property>\r\n" +
            "    <xsl:variable name=\"memberDefinition\">\r\n" +
            "      <xsl:if test=\"parent::edm:EntityType/edm:Key/edm:PropertyRef[@Name = current()/@Name]\"><attribute name=\"key\">true</attribute></xsl:if>\r\n" +
            "      <xsl:apply-templates select=\"@*[local-name() != 'Name']\" mode=\"render-field\" />\r\n" +
            "    </xsl:variable>'<xsl:value-of select=\"@Name\"/>': { <xsl:choose><xsl:when test=\"function-available('msxsl:node-set')\"><xsl:for-each select=\"msxsl:node-set($memberDefinition)/*\">'<xsl:if test=\"@extended = 'true'\">$</xsl:if><xsl:value-of select=\"@name\"/>':<xsl:value-of select=\".\"/>\r\n" +
            "      <xsl:if test=\"position() != last()\">,<xsl:text> </xsl:text>\r\n" +
            "    </xsl:if> </xsl:for-each></xsl:when>\r\n" +
            "  <xsl:otherwise><xsl:for-each select=\"exsl:node-set($memberDefinition)/*\">'<xsl:if test=\"@extended = 'true'\">$</xsl:if><xsl:value-of select=\"@name\"/>':<xsl:value-of select=\".\"/>\r\n" +
            "      <xsl:if test=\"position() != last()\">,<xsl:text> </xsl:text>\r\n" +
            "    </xsl:if> </xsl:for-each></xsl:otherwise>\r\n" +
            "    </xsl:choose> }</property>\r\n" +
            "</xsl:template>\r\n" +
            "  \r\n" +
            "  <xsl:template match=\"@Name\" mode=\"render-field\">\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"@Type\" mode=\"render-field\">\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"starts-with(., 'Collection')\">\r\n" +
            "        <attribute name=\"type\">'Array'</attribute>\r\n" +
            "        <xsl:variable name=\"len\" select=\"string-length(.)-12\"/>\r\n" +
            "        <xsl:variable name=\"currType\" select=\"substring(.,12,$len)\"/>\r\n" +
            "        <xsl:choose>\r\n" +
            "          <xsl:when test=\"starts-with($currType, ../../../@Namespace)\">\r\n" +
            "            <attribute name=\"elementType\">'<xsl:value-of select=\"$DefaultNamespace\"/><xsl:value-of select=\"$currType\" />'</attribute>\r\n" +
            "          </xsl:when>\r\n" +
            "          <xsl:otherwise>\r\n" +
            "            <attribute name=\"elementType\">'<xsl:value-of select=\"$currType\" />'</attribute>\r\n" +
            "          </xsl:otherwise>\r\n" +
            "        </xsl:choose>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:when test=\"starts-with(., ../../../@Namespace)\">\r\n" +
            "        <attribute name=\"type\">'<xsl:value-of select=\"$DefaultNamespace\"/><xsl:value-of select=\".\"/>'</attribute>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:otherwise>\r\n" +
            "        <attribute name=\"type\">'<xsl:value-of select=\".\"/>'</attribute>\r\n" +
            "      </xsl:otherwise>\r\n" +
            "    </xsl:choose>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"@ConcurrencyMode\" mode=\"render-field\">\r\n" +
            "    <attribute name=\"concurrencyMode\">$data.ConcurrencyMode.<xsl:value-of select=\".\"/></attribute>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"@Nullable\" mode=\"render-field\">\r\n" +
            "    <attribute name=\"nullable\"><xsl:value-of select=\".\"/></attribute>\r\n" +
            "    \r\n" +
            "    <xsl:if test=\". = 'false'\">\r\n" +
            "      <xsl:choose>\r\n" +
            "        <xsl:when test=\"parent::edm:Property/@annot:StoreGeneratedPattern = 'Identity' or parent::edm:Property/@annot:StoreGeneratedPattern = 'Computed'\"></xsl:when>\r\n" +
            "        <xsl:otherwise><attribute name=\"required\">true</attribute></xsl:otherwise>\r\n" +
            "      </xsl:choose>\r\n" +
            "    </xsl:if>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"@annot:StoreGeneratedPattern\" mode=\"render-field\">\r\n" +
            "    <xsl:if test=\". != 'None'\"><attribute name=\"computed\">true</attribute></xsl:if>    \r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"@MaxLength\" mode=\"render-field\">\r\n" +
            "    <attribute name=\"maxLength\">\r\n" +
            "      <xsl:choose>\r\n" +
            "        <xsl:when test=\"string(.) = 'Max'\">Number.POSITIVE_INFINITY</xsl:when>\r\n" +
            "        <xsl:otherwise>\r\n" +
            "          <xsl:value-of select=\".\"/>\r\n" +
            "        </xsl:otherwise>\r\n" +
            "      </xsl:choose>\r\n" +
            "    </attribute>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"@FixedLength | @Unicode | @Precision | @Scale\" mode=\"render-field\">\r\n" +
            "  </xsl:template>\r\n" +
            "  <xsl:template match=\"@*\" mode=\"render-field\">\r\n" +
            "    <xsl:variable name=\"nameProp\">\r\n" +
            "      <xsl:choose>\r\n" +
            "        <xsl:when test=\"substring-after(name(), ':') != ''\">\r\n" +
            "          <xsl:value-of select=\"substring-after(name(), ':')\"/>\r\n" +
            "        </xsl:when>\r\n" +
            "        <xsl:otherwise>\r\n" +
            "          <xsl:value-of select=\"name()\"/>\r\n" +
            "        </xsl:otherwise>\r\n" +
            "      </xsl:choose>\r\n" +
            "    </xsl:variable>\r\n" +
            "    <xsl:element name=\"attribute\"><xsl:attribute name=\"extended\">true</xsl:attribute><xsl:attribute name=\"name\"><xsl:value-of select=\"$nameProp\"/></xsl:attribute>'<xsl:value-of select=\".\"/>'</xsl:element>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"@Relationship\" mode=\"render-field\">\r\n" +
            "    <xsl:variable name=\"relationName\" select=\"string(../@ToRole)\"/>\r\n" +
            "    <xsl:variable name=\"relationshipName\" select=\"string(.)\" />\r\n" +
            "    <xsl:variable name=\"relation\" select=\"key('associations',string(.))/edm:End[@Role = $relationName]\" />\r\n" +
            "    <xsl:variable name=\"otherName\" select=\"../@FromRole\" />\r\n" +
            "    <xsl:variable name=\"otherProp\" select=\"//edm:NavigationProperty[@ToRole = $otherName and @Relationship = $relationshipName]\" />\r\n" +
            "    <xsl:variable name=\"m\" select=\"$relation/@Multiplicity\" />\r\n" +
            "    <xsl:choose>\r\n" +
            "      <xsl:when test=\"$m = '*'\">\r\n" +
            "        <attribute name=\"type\">'<xsl:value-of select=\"$CollectionBaseClass\"/>'</attribute>\r\n" +
            "        <attribute name=\"elementType\">'<xsl:value-of select=\"$DefaultNamespace\"/><xsl:value-of select=\"$relation/@Type\"/>'</attribute>\r\n" +
            "        <xsl:if test=\"not($otherProp/@Name)\">\r\n" +
            "          <attribute name=\"inverseProperty\">'$$unbound'</attribute></xsl:if>\r\n" +
            "        <xsl:if test=\"$otherProp/@Name\">\r\n" +
            "          <attribute name=\"inverseProperty\">'<xsl:value-of select=\"$otherProp/@Name\"/>'</attribute></xsl:if>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:when test=\"$m = '0..1'\">\r\n" +
            "        <attribute name=\"type\">'<xsl:value-of select=\"$DefaultNamespace\"/><xsl:value-of select=\"$relation/@Type\"/>'</attribute>\r\n" +
            "        <xsl:choose>\r\n" +
            "          <xsl:when test=\"$otherProp\">\r\n" +
            "            <attribute name=\"inverseProperty\">'<xsl:value-of select=\"$otherProp/@Name\"/>'</attribute>\r\n" +
            "          </xsl:when >\r\n" +
            "          <xsl:otherwise>\r\n" +
            "            <attribute name=\"inverseProperty\">'$$unbound'</attribute>\r\n" +
            "            <xsl:message terminate=\"no\">  Warning: inverseProperty other side missing: <xsl:value-of select=\".\"/>\r\n" +
            "          </xsl:message>\r\n" +
            "          </xsl:otherwise>\r\n" +
            "        </xsl:choose>\r\n" +
            "      </xsl:when>\r\n" +
            "      <xsl:when test=\"$m = '1'\">\r\n" +
            "        <attribute name=\"type\">'<xsl:value-of select=\"$DefaultNamespace\"/><xsl:value-of select=\"$relation/@Type\"/>'</attribute>\r\n" +
            "        <attribute name=\"required\">true</attribute>\r\n" +
            "        <xsl:choose>\r\n" +
            "          <xsl:when test=\"$otherProp\">\r\n" +
            "            <attribute name=\"inverseProperty\">'<xsl:value-of select=\"$otherProp/@Name\"/>'</attribute>\r\n" +
            "          </xsl:when >\r\n" +
            "          <xsl:otherwise>\r\n" +
            "            <attribute name=\"inverseProperty\">'$$unbound'</attribute>\r\n" +
            "            <xsl:message terminate=\"no\">\r\n" +
            "              Warning: inverseProperty other side missing: <xsl:value-of select=\".\"/>\r\n" +
            "            </xsl:message>\r\n" +
            "          </xsl:otherwise>\r\n" +
            "        </xsl:choose>\r\n" +
            "      </xsl:when>\r\n" +
            "    </xsl:choose>\r\n" +
            "  </xsl:template>\r\n" +
            "\r\n" +
            "\r\n" +
            "  <xsl:template match=\"@FromRole | @ToRole\" mode=\"render-field\"></xsl:template>\r\n" +
            "\r\n" +
            "  <xsl:template match=\"*\" mode=\"render-field\">\r\n" +
            "    <!--<unprocessed>!!<xsl:value-of select=\"name()\"/>!!</unprocessed>-->\r\n" +
            "    <xsl:message terminate=\"no\">  Warning: <xsl:value-of select=\"../../@Name\"/>.<xsl:value-of select=\"../@Name\"/>:<xsl:value-of select=\"name()\"/> is an unknown/unprocessed attribued</xsl:message>\r\n" +
            "  </xsl:template>\r\n" +
            "  <!--<xsl:template match=\"*\">\r\n" +
            "    !<xsl:value-of select=\"name()\"/>!\r\n" +
            "  </xsl:template>-->\r\n" +
            "</xsl:stylesheet>\r\n"
    }

});

$data.MetadataLoader = new $data.MetadataLoaderClass();
$data.service = function (serviceUri, config, cb) {
    var _url, _config, _callback;
    function getParam(paramValue) {
        switch (typeof paramValue) {
            case 'object':
                if (typeof paramValue.success === 'function' || typeof paramValue.error === 'function') {
                    _callback = paramValue;
                } else {
                    _config = paramValue;
                }
                break;
            case 'function':
                _callback = paramValue;
                break;
            default:
                break;
        }
    }
    getParam(config);
    getParam(cb);

    if (typeof serviceUri === 'object') {
        _config = $data.typeSystem.extend(serviceUri, _config);
        serviceUri = serviceUri.url;
        delete _config.url;
    }

    var pHandler = new $data.PromiseHandler();
    _callback = pHandler.createCallback(_callback);

    $data.MetadataLoader.load(serviceUri, {
        success: function (factory) {
            var type = factory.type;
            //register to local store
            if (_config) {
                var storeAlias = _config.serviceName || _config.storeAlias;
                if (storeAlias && 'addStore' in $data) {
                    $data.addStore(storeAlias, factory, _config.isDefault === undefined || _config.isDefault)
                }
            }

            _callback.success(factory, type);
        },
        error: _callback.error
    }, _config);

    return pHandler.getPromise();
};
