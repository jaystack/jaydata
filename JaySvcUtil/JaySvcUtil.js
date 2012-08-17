
$data.Class.define('$data.MetadataLoaderClass', null, null, {
    load: function (metadataUri, callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        if (typeof metadataUri === 'string') {
            metadataUri = {
                url: metadataUri
            };
        }
        this.config = $data.typeSystem.extend({
            EntityBaseClass: '$data.Entity',
            ContextBaseClass: '$data.EntityContext',
            AutoCreateContext: true,
            ContextInstanceName: 'context',
            EntitySetBaseClass: '$data.EntitySet',
            CollectionBaseClass: 'Array',
            user: undefined,
            password: undefined
        }, metadataUri);

        var metadataUri;
        if (this.config.url) {
            this.config.SerivceUri = this.config.url.replace('/$metadata', '');
            if (this.config.url.indexOf('/$metadata') === -1) {
                metadataUri = this.config.url.replace(/\/+$/, '') + '/$metadata';
            } else {
                metadataUri = this.config.url;
            }
        } else {
            callBack.error('metadata url is missing');
        }

        var self = this;
        self._loadXMLDoc(metadataUri, this.config.user, this.config.password, function (xml) {
            var versionInfo = self._findVersion(xml);
            if (self.xsltRepoUrl) {
                console.log('XSLT: ' + self.xsltRepoUrl + self._supportedODataVersionXSLT[versionInfo.version])
                self._loadXMLDoc(self.xsltRepoUrl + self._supportedODataVersionXSLT[versionInfo.version], undefined, undefined, function (xsl) {
                    self._transform(callBack, versionInfo, xml, xsl);
                });
            } else {
                self._transform(callBack, versionInfo, xml);
            }

        });
    },
    debugMode: { type: 'bool', value: false },
    xsltRepoUrl: { type: 'string', value: '' },

    createFactoryFunc: function (ctxType) {
        var self = this;
        return function () {
            if (ctxType) {
                return new ctxType({
                    name: 'oData',
                    oDataServiceHost: self.config.SerivceUri,
                    //maxDataServiceVersion: '',
                    user: self.config.user,
                    password: self.config.password
                });
            } else {
                return null;
            }
        }
    },

    _transform: function (callBack, versionInfo, xml, xsl) {
        var self = this;
        var codeText = self._processResults(self.config.url, versionInfo, xml, xsl);
        eval(codeText);
        var ctxType = $data.generatedContexts.pop();
        if (self.debugMode)
            callBack.success(self.createFactoryFunc(ctxType), ctxType, codeText);
        else
            callBack.success(self.createFactoryFunc(ctxType), ctxType);
    },
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
    _processResults: function (metadataUri, versionInfo, metadata, xsl) {
        var transformXslt = this.getCurrentXSLTVersion(versionInfo, metadata);

        if (window.ActiveXObject) {
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

                    xslproc.addParameter('SerivceUri', this.config.SerivceUri);
                    xslproc.addParameter('EntityBaseClass', this.config.EntityBaseClass);
                    xslproc.addParameter('ContextBaseClass', this.config.ContextBaseClass);
                    xslproc.addParameter('AutoCreateContext', this.config.AutoCreateContext);
                    xslproc.addParameter('ContextInstanceName', this.config.ContextInstanceName);
                    xslproc.addParameter('EntitySetBaseClass', this.config.EntitySetBaseClass);
                    xslproc.addParameter('CollectionBaseClass', this.config.CollectionBaseClass);

                    xslproc.transform();
                    return xslproc.output;
                }
            }
            return '';
        } else if (document.implementation && document.implementation.createDocument) {
            var xsltStylesheet;
            if (xsl) {
                xsltStylesheet = xsl;
            } else {
                var parser = new DOMParser();
                xsltStylesheet = parser.parseFromString(transformXslt, "text/xml");
            }

            var xsltProcessor = new XSLTProcessor();
            xsltProcessor.importStylesheet(xsltStylesheet);
            xsltProcessor.setParameter(null, 'SerivceUri', this.config.SerivceUri);
            xsltProcessor.setParameter(null, 'EntityBaseClass', this.config.EntityBaseClass);
            xsltProcessor.setParameter(null, 'ContextBaseClass', this.config.ContextBaseClass);
            xsltProcessor.setParameter(null, 'AutoCreateContext', this.config.AutoCreateContext);
            xsltProcessor.setParameter(null, 'ContextInstanceName', this.config.ContextInstanceName);
            xsltProcessor.setParameter(null, 'EntitySetBaseClass', this.config.EntitySetBaseClass);
            xsltProcessor.setParameter(null, 'CollectionBaseClass', this.config.CollectionBaseClass);
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
        return {
            ns: version,
            version: versionNum || 'unknown'
        };
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
            "V1": 'JayDataContextGen$my.contexterator_OData_V1.xslt',
            "V2": 'JayDataContextGenerator_OData_V2.xslt',
            "V3": 'JayDataContextGenerator_OData_V3.xslt',
            "V11": 'JayDataContextGenerator_OData_V11.xslt'
        }
    },
    getCurrentXSLTVersion: function (versionInfo, metadata) {
        return this._metadataConverterXSLT.replace('@@VERSIONNS@@', versionInfo.ns).replace('@@VERSION@@', versionInfo.version);
    },
    _metadataConverterXSLT: {
        type: 'string',
        value:
"<xsl:stylesheet version=\"1.0\" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\" \r\n" +
"                xmlns:edm=\"@@VERSIONNS@@\" \r\n" +
"                xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\" \r\n" +
"                xmlns:annot=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\" \r\n" +
"                xmlns:exsl=\"http://exslt.org/common\" \r\n" +
"                xmlns:msxsl=\"urn:schemas-microsoft-com:xslt\" exclude-result-prefixes=\"msxsl\">\r\n" +
"  <xsl:key name=\"entityType\" match=\"edm:EntityType\" use=\"concat(string(../@Namespace),'.', string(@Name))\"/>\r\n" +
"  <xsl:key name=\"associations\" match=\"edm:Association\" use=\"concat(string(../@Namespace),'.', string(@Name))\"/>\r\n" +
"  <xsl:strip-space elements=\"property item unprocessed\"/>\r\n" +
"  <xsl:output method=\"text\" indent=\"no\"  />\r\n" +
"  <xsl:param name=\"contextNamespace\" />\r\n" +
"  <xsl:param name=\"SerivceUri\" />\r\n" +
"  <xsl:param name=\"EntityBaseClass\"/>\r\n" +
"  <xsl:param name=\"ContextBaseClass\"/>\r\n" +
"  <xsl:param name=\"AutoCreateContext\"/>\r\n" +
"  <xsl:param name=\"ContextInstanceName\"/>\r\n" +
"  <xsl:param name=\"EntitySetBaseClass\"/>\r\n" +
"  <xsl:param name=\"CollectionBaseClass\"/>\r\n" +
"  <xsl:template match=\"/\">\r\n" +
"/*//////////////////////////////////////////////////////////////////////////////////////\r\n" +
"////// Autogenerated by JaySvcUtil.exe http://JayData.org for more info        /////////\r\n" +
"//////                             oData @@VERSION@@                                    /////////\r\n" +
"//////////////////////////////////////////////////////////////////////////////////////*/\r\n" +
"(function(global, $data, undefined) {\r\n" +
"  <xsl:variable name=\"EdmJayTypeMapping\">\r\n" +
"    <map from=\"Edm.Boolean\" to=\"$data.Boolean\" />\r\n" +
"    <map from=\"Edm.Binary\" to=\"$data.Blob\" />\r\n" +
"    <map from=\"Edm.DateTime\" to=\"$data.Date\" />\r\n" +
"    <map from=\"Edm.DateTimeOffset\" to=\"$data.Integer\" />\r\n" +
"    <map from=\"Edm.Time\" to=\"$data.Integer\" />\r\n" +
"    <map from=\"Edm.Decimal\" to=\"$data.Number\" />\r\n" +
"    <map from=\"Edm.Single\" to=\"$data.Number\" />\r\n" +
"    <map from=\"Edm.Double\" to=\"$data.Number\" />\r\n" +
"    <map from=\"Edm.Guid\" to=\"$data.String\" />\r\n" +
"    <map from=\"Edm.Int16\" to=\"$data.Integer\" />\r\n" +
"    <map from=\"Edm.Int32\" to=\"$data.Integer\" />\r\n" +
"    <map from=\"Edm.Int64\" to=\"$data.Integer\" />\r\n" +
"    <map from=\"Edm.Byte\" to=\"$data.Integer\" />\r\n" +
"    <map from=\"Edm.String\" to=\"$data.String\" />\r\n" +
"    <map from=\"Edm.GeographyPoint\" to=\"$data.Blob\" />\r\n" +
"  </xsl:variable>\r\n" +
"  function registerEdmTypes() { <xsl:choose>\r\n" +
"    <xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
"      <xsl:for-each select=\"msxsl:node-set($EdmJayTypeMapping)/*\">\r\n" +
"        function <xsl:value-of select=\"translate(@from,'.','_')\" />() { };\r\n" +
"        $data.Container.registerType('<xsl:value-of select=\"@from\"/>', <xsl:value-of select=\"translate(@from,'.','_')\"/>);\r\n" +
"        $data.Container.mapType(<xsl:value-of select=\"translate(@from,'.','_')\" />, <xsl:value-of select=\"@to\" />);\r\n" +
"      </xsl:for-each>\r\n" +
"    </xsl:when>\r\n" +
"    <xsl:otherwise>\r\n" +
"      <xsl:for-each select=\"exsl:node-set($EdmJayTypeMapping)/*\">\r\n" +
"        function <xsl:value-of select=\"translate(@from,'.','_')\" />() { };\r\n" +
"        $data.Container.registerType('<xsl:value-of select=\"@from\"/>', <xsl:value-of select=\"translate(@from,'.','_')\"/>);\r\n" +
"        $data.Container.mapType(<xsl:value-of select=\"translate(@from,'.','_')\" />, <xsl:value-of select=\"@to\" />);\r\n" +
"      </xsl:for-each>\r\n" +
"    </xsl:otherwise>\r\n" +
"  </xsl:choose>\r\n" +
"  };\r\n" +
"  registerEdmTypes();\r\n" +
"<xsl:for-each select=\"//edm:EntityType | //edm:ComplexType\" xml:space=\"default\">\r\n" +
"  <xsl:message terminate=\"no\">Info: generating type <xsl:value-of select=\"concat(../@Namespace, '.', @Name)\"/>\r\n" +
"</xsl:message>\r\n" +
"  <xsl:variable name=\"props\">\r\n" +
"    <xsl:apply-templates select=\"*\" />\r\n" +
"  </xsl:variable>\r\n" +
"  <xsl:text xml:space=\"preserve\">  </xsl:text><xsl:value-of select=\"$EntityBaseClass\"  />.extend('<xsl:value-of select=\"../@Namespace\"/>.<xsl:value-of select=\"@Name\"/>', {\r\n" +
"    <xsl:choose><xsl:when test=\"function-available('msxsl:node-set')\">\r\n" +
"    <xsl:for-each select=\"msxsl:node-set($props)/*\">\r\n" +
"      <xsl:value-of select=\".\"/><xsl:if test=\"position() != last()\">,\r\n" +
"    </xsl:if></xsl:for-each>\r\n" +
"  </xsl:when>\r\n" +
"  <xsl:otherwise>\r\n" +
"    <xsl:for-each select=\"exsl:node-set($props)/*\">\r\n" +
"      <xsl:value-of select=\".\"/><xsl:if test=\"position() != last()\">,\r\n" +
"    </xsl:if></xsl:for-each>\r\n" +
"    </xsl:otherwise>\r\n" +
"    </xsl:choose>\r\n" +
"  });\r\n" +
"  \r\n" +
"</xsl:for-each>\r\n" +
"<xsl:for-each select=\"//edm:EntityContainer\">\r\n" +
"  <xsl:text xml:space=\"preserve\">  </xsl:text><xsl:value-of select=\"$ContextBaseClass\"  />.extend('<xsl:value-of select=\"concat(../@Namespace, '.', @Name)\"/>', {\r\n" +
"    <xsl:for-each select=\"edm:EntitySet | edm:FunctionImport\">\r\n" +
"      <xsl:apply-templates select=\".\"></xsl:apply-templates><xsl:if test=\"position() != last()\">,\r\n" +
"    </xsl:if>\r\n" +
"    </xsl:for-each>\r\n" +
"  });\r\n" +
"  $data.generatedContexts = $data.generatedContexts || [];\r\n" +
"  $data.generatedContexts.push(<xsl:value-of select=\"concat(../@Namespace, '.', @Name)\" />);\r\n" +
"  <xsl:if test=\"$AutoCreateContext = 'true'\">\r\n" +
"  /*Context Instance*/\r\n" +
"  <xsl:value-of select=\"../@Namespace\"/>.<xsl:value-of select=\"$ContextInstanceName\" /> = new <xsl:value-of select=\"concat(../@Namespace, '.', @Name)\" />( { name:'oData', oDataServiceHost: '<xsl:value-of select=\"$SerivceUri\" />' });\r\n" +
"</xsl:if>\r\n" +
"</xsl:for-each>\r\n" +
"      \r\n" +
"})(window, $data);\r\n" +
"      \r\n" +
"    </xsl:template>\r\n" +
"  <xsl:template match=\"edm:Key\"></xsl:template>\r\n" +
"  <xsl:template match=\"edm:FunctionImport\">'<xsl:value-of select=\"@Name\"/>': $data.EntityContext.generateServiceOperation({ serviceName:'<xsl:value-of select=\"@Name\"/>', returnType: <xsl:apply-templates select=\".\" mode=\"render-return-config\" />, <xsl:apply-templates select=\".\" mode=\"render-elementType-config\" />params: [<xsl:for-each select=\"edm:Parameter\">{ <xsl:value-of select=\"@Name\"/>: '<xsl:value-of select=\"@Type\"/>' }<xsl:if test=\"position() != last()\">,</xsl:if>\r\n" +
"    </xsl:for-each>], method: '<xsl:value-of select=\"@m:HttpMethod\"/>' })</xsl:template>\r\n" +
"  <xsl:template match=\"edm:FunctionImport\" mode=\"render-return-config\">\r\n" +
"    <xsl:choose>\r\n" +
"      <xsl:when test=\"not(@ReturnType)\">null</xsl:when>\r\n" +
"      <xsl:when test=\"starts-with(@ReturnType, 'Collection')\">$data.Queryable</xsl:when>\r\n" +
"      <xsl:otherwise> '<xsl:value-of select=\"@ReturnType\"/>' </xsl:otherwise>\r\n" +
"    </xsl:choose>\r\n" +
"  </xsl:template>\r\n" +
"  <xsl:template match=\"edm:FunctionImport\" mode=\"render-elementType-config\">\r\n" +
"    <xsl:if test=\"starts-with(@ReturnType, 'Collection')\">\r\n" +
"      <xsl:variable name=\"len\" select=\"string-length(@ReturnType)-12\"/>elementType: '<xsl:value-of select=\"substring(@ReturnType,12,$len)\"/>', </xsl:if>\r\n" +
"  </xsl:template>\r\n" +
"  <xsl:template match=\"edm:EntitySet\">'<xsl:value-of select=\"@Name\"/>': { type: <xsl:value-of select=\"$EntitySetBaseClass\"  />, elementType: <xsl:value-of select=\"@EntityType\"/> }</xsl:template>\r\n" +
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
"  <xsl:template match=\"@Type\" mode=\"render-field\">\r\n" +
"    <xsl:choose>\r\n" +
"      <xsl:when test=\"starts-with(., 'Collection')\">\r\n" +
"        <attribute name=\"type\">'Array'</attribute>\r\n" +
"        <xsl:variable name=\"len\" select=\"string-length(.)-12\"/>\r\n" +
"        <attribute name=\"elementType\">'<xsl:value-of select=\"substring(.,12,$len)\" />'</attribute>\r\n" +
"      </xsl:when>\r\n" +
"      <xsl:otherwise>\r\n" +
"        <attribute name=\"type\">'<xsl:value-of select=\".\"/>'</attribute>\r\n" +
"      </xsl:otherwise>\r\n" +
"    </xsl:choose>\r\n" +
"  </xsl:template>\r\n" +
"  <xsl:template match=\"@ConcurrencyMode\" mode=\"render-field\">\r\n" +
"    <attribute name=\"concurrencyMode\">$data.ConcurrencyMode.<xsl:value-of select=\".\"/></attribute>\r\n" +
"  </xsl:template>\r\n" +
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
"  <xsl:template match=\"@annot:StoreGeneratedPattern\" mode=\"render-field\">\r\n" +
"    <xsl:if test=\". != 'None'\"><attribute name=\"computed\">true</attribute></xsl:if>    \r\n" +
"  </xsl:template>\r\n" +
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
"        <attribute name=\"elementType\">'\"<xsl:value-of select=\"$relation/@Type\"/>'</attribute>\r\n" +
"        <xsl:if test=\"not($otherProp/@Name)\">\r\n" +
"          <attribute name=\"inverseProperty\">'$$unbound'\"</attribute></xsl:if>\r\n" +
"        <xsl:if test=\"$otherProp/@Name\">\r\n" +
"          <attribute name=\"inverseProperty\">'<xsl:value-of select=\"$otherProp/@Name\"/>'</attribute></xsl:if>\r\n" +
"      </xsl:when>\r\n" +
"      <xsl:when test=\"$m = '0..1'\">\r\n" +
"        <attribute name=\"type\">'<xsl:value-of select=\"$relation/@Type\"/>'</attribute>\r\n" +
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
"        <attribute name=\"type\">'<xsl:value-of select=\"$relation/@Type\"/>'</attribute>\r\n" +
"        <attribute name=\"required\">true\"</attribute>\r\n" +
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
"  <xsl:template match=\"@FromRole | @ToRole\" mode=\"render-field\"></xsl:template>\r\n" +
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
