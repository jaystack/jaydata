require('jaydata');
var xslt = require('node_xslt');
var libxml = require('libxmljs');
var fs = require('fs');

xslt = require('node_xslt');
XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

$data.Class.define('$data.MetadataLoaderClass', null, null, {

    load: function (serviceUri, username, password, callBack) {


        if (arguments.length < 4) {
            callBack = username;
            username = undefined;
            password = undefined;
        }

        var xsl = fs.readFileSync(__dirname + '/JayDataContextGenerator_OData.xslt.template','UTF-8');
        //console.log("xslt template loaded");


        callBack = $data.typeSystem.createCallbackSetting(callBack);

        var self = this;

        var _getSchemaNamespace = function(schemaXml) {

            var schemaNamespace;

            var parserEvents = {
                startElementNS: function() {
                    if ('Schema' === arguments[0]){
                        schemaNamespace = arguments[3];
                    }
                }
            };

            var parser = new libxml.SaxParser(parserEvents);
            parser.parseString(schemaXml);
            return schemaNamespace;
        };

        self._loadXMLDoc(serviceUri, username, password, function (xml) {
            var schemaNS = _getSchemaNamespace(xml);
            var doc = xslt.readXmlString(xml);
            xsl = xsl.replace('%%EDM_NAMESPACE%%', schemaNS);
            xsl = xslt.readXsltString(xsl);
            var result = xslt.transform(xsl, doc, ['SerivceUri', "'" + serviceUri + "'"]);
            
            callBack.success(result);
            //console.log(result);
        });
    },
    debugMode: { type: 'bool', value: false },
    xsltRepoUrl: {type: 'string', value: '' },

    _loadXMLDoc: function (serviceUri, u, p, callback) {
        var xhttp = new XMLHttpRequest();

        //console.log(dname);
        xhttp.open("GET", serviceUri + '/$metadata', true, u, p);
        xhttp.onreadystatechange = function () {
            //console.log(xhttp.readyState);
            if (xhttp.readyState === 4) {
                callback(xhttp.responseText);
            }
        };
        xhttp.send("");
    },

    _processResults: function (metadataUri, metadata, xsl) {
        if (window.ActiveXObject) {
            return metadata.transformNode(xsl);
        } else if (document.implementation && document.implementation.createDocument) {
            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsl);
            xsltProcessor.setParameter(null, 'SerivceUri', metadataUri.replace('/$metadata',''));
            resultDocument = xsltProcessor.transformToFragment(metadata, document);

            return resultDocument.textContent;
        }
    },

    _findVersion: function (metadata) {
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

        var versionNum = this._supportedODataVersions[version];
        return versionNum
    },

    _supportedODataVersions: {
        value: {
            "http://schemas.microsoft.com/ado/2006/04/edm": "V1",
            "http://schemas.microsoft.com/ado/2008/09/edm": "V2",
            "http://schemas.microsoft.com/ado/2009/11/edm": "V3",
            "http://schemas.microsoft.com/ado/2007/05/edm": "V11"
        }
    },

    _supportedODataVersionXSLT: {
        value: {
            "V1": 'JayDataContextGenerator_OData_V1.xslt',
            "V2": 'JayDataContextGenerator_OData_V2.xslt',
            "V3": 'JayDataContextGenerator_OData_V3.xslt',
            "V11": 'JayDataContextGenerator_OData_V11.xslt'
        }
    }

});

$data.MetadataLoader = new $data.MetadataLoaderClass();
