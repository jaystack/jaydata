
$data.Class.define('$data.MetadataLoaderClass', null, null, {
    load: function (metadataUri, username, password, callBack) {
        if (arguments.length < 4) {
            callBack = username;
            username = undefined;
            password = undefined;
        }
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        var self = this;
        self._loadXMLDoc(metadataUri, username, password, function (xml) {
            var version = self._findVersion(xml);
            self._loadXMLDoc(self.xsltRepoUrl + self._supportedODataVersionXSLT[version], undefined, undefined, function (xsl) {
                var codeText = self._processResults(metadataUri, xml, xsl);
                eval(codeText);
                if (self.debugMode)
                    callBack.success(codeText);
                else
                    callBack.success();
            });
        });
    },
    debugMode: { type: 'bool', value: false },
    xsltRepoUrl: {type: 'string', value: '' },

    _loadXMLDoc: function (dname, u, p, callback) {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", dname, true, u, p);
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === 4) {
                callback(xhttp.responseXML);
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
