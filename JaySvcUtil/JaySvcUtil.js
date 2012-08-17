
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
            username: undefined,
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
        self._loadXMLDoc(metadataUri, this.config.username, this.config.password, function (xml) {
            var codeText = self._processResults(self.config.url, xml);
            eval(codeText);
            var ctx = $data.generatedContexts.pop();
            ctx.onReady(function () {
                if (self.debugMode)
                    callBack.success(ctx, codeText);
                else
                    callBack.success(ctx);
            });
        });
    },
    debugMode: { type: 'bool', value: false },
    xsltRepoUrl: { type: 'string', value: '' },

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
    _processResults: function (metadataUri, metadata) {
        var transformXslt = this.getCurrentXSLTVersion(metadata);

        if (window.ActiveXObject) {
            var xslt = new ActiveXObject("Msxml2.XSLTemplate.6.0");
            var xsldoc = new ActiveXObject("Msxml2.FreeThreadedDOMDocument.6.0");
            var xslproc;
            xsldoc.async = false;
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
            var parser = new DOMParser();
            var xsltStylesheet = parser.parseFromString(transformXslt, "text/xml");

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
    getCurrentXSLTVersion: function (metadata) {
        var versionInfo = this._findVersion(metadata);

        return this._metadataConverterXSLT.replace('@@VERSIONNS@@', versionInfo.ns).replace('@@VERSION@@', versionInfo.version);
    },
    _metadataConverterXSLT: {
        type: 'string',
        value:
"<xsl:stylesheet version=\"1.0\" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\"" +
"                xmlns:edm=\"@@VERSIONNS@@\"" +
"                xmlns:m=\"http://schemas.microsoft.com/ado/2007/08/dataservices/metadata\"" +
"                xmlns:annot=\"http://schemas.microsoft.com/ado/2009/02/edm/annotation\"" +
"                xmlns:exsl=\"http://exslt.org/common\"" +
"                xmlns:msxsl=\"urn:schemas-microsoft-com:xslt\" exclude-result-prefixes=\"msxsl\">" +
"  <xsl:key name=\"entityType\" match=\"edm:EntityType\" use=\"concat(string(../@Namespace),'.', string(@Name))\"/>" +
"  <xsl:key name=\"associations\" match=\"edm:Association\" use=\"concat(string(../@Namespace),'.', string(@Name))\"/>" +
"  <xsl:strip-space elements=\"property item unprocessed\"/>" +
"  <xsl:output method=\"text\" indent=\"no\"  />" +
"  <xsl:param name=\"contextNamespace\" />" +
"  <xsl:param name=\"SerivceUri\" />" +
"  <xsl:param name=\"EntityBaseClass\"/>" +
"  <xsl:param name=\"ContextBaseClass\"/>" +
"  <xsl:param name=\"AutoCreateContext\"/>" +
"  <xsl:param name=\"ContextInstanceName\"/>" +
"  <xsl:param name=\"EntitySetBaseClass\"/>" +
"  <xsl:param name=\"CollectionBaseClass\"/>" +
"  <!--<xsl:variable name=\"EntityBaseClass\">$data.Entity</xsl:variable>" +
"  <xsl:variable name=\"ContextBaseClass\">$data.EntityContext</xsl:variable>" +
"  <xsl:variable name=\"AutoCreateContext\">true</xsl:variable>" +
"  <xsl:variable name=\"ContextInstanceName\">context</xsl:variable>" +
"  <xsl:variable name=\"EntitySetBaseClass\">$data.EntitySet</xsl:variable>" +
"  <xsl:variable name=\"CollectionBaseClass\">Array</xsl:variable>-->" +
"    <xsl:template match=\"/\">" +
"/*//////////////////////////////////////////////////////////////////////////////////////" +
"////// Autogenerated by JaySvcUtil.exe http://JayData.org for more info        /////////" +
"//////                             oData @@VERSION@@                                    /////////" +
"//////////////////////////////////////////////////////////////////////////////////////*/" +
"(function(global, $data, undefined) {" +
"  <xsl:variable name=\"EdmJayTypeMapping\">" +
"    <map from=\"Edm.Boolean\" to=\"$data.Boolean\" />" +
"    <map from=\"Edm.Binary\" to=\"$data.Blob\" />" +
"    <map from=\"Edm.DateTime\" to=\"$data.Date\" />" +
"    <map from=\"Edm.DateTimeOffset\" to=\"$data.Integer\" />" +
"    <map from=\"Edm.Time\" to=\"$data.Integer\" />" +
"    <map from=\"Edm.Decimal\" to=\"$data.Number\" />" +
"    <map from=\"Edm.Single\" to=\"$data.Number\" />" +
"    <map from=\"Edm.Double\" to=\"$data.Number\" />" +
"    <map from=\"Edm.Guid\" to=\"$data.String\" />" +
"    <map from=\"Edm.Int16\" to=\"$data.Integer\" />" +
"    <map from=\"Edm.Int32\" to=\"$data.Integer\" />" +
"    <map from=\"Edm.Int64\" to=\"$data.Integer\" />" +
"    <map from=\"Edm.Byte\" to=\"$data.Integer\" />" +
"    <map from=\"Edm.String\" to=\"$data.String\" />" +
"    <map from=\"Edm.GeographyPoint\" to=\"$data.Blob\" />" +
"  </xsl:variable>" +
"  function registerEdmTypes() { <xsl:choose>" +
"    <xsl:when test=\"function-available('msxsl:node-set')\">" +
"      <xsl:for-each select=\"msxsl:node-set($EdmJayTypeMapping)/*\">" +
"        function <xsl:value-of select=\"translate(@from,'.','_')\" />() { };" +
"        $data.Container.registerType('<xsl:value-of select=\"@from\"/>', <xsl:value-of select=\"translate(@from,'.','_')\"/>);" +
"        $data.Container.mapType(<xsl:value-of select=\"translate(@from,'.','_')\" />, <xsl:value-of select=\"@to\" />);" +
"      </xsl:for-each>" +
"    </xsl:when>" +
"    <xsl:otherwise>" +
"      <xsl:for-each select=\"exsl:node-set($EdmJayTypeMapping)/*\">" +
"        function <xsl:value-of select=\"translate(@from,'.','_')\" />() { };" +
"        $data.Container.registerType('<xsl:value-of select=\"@from\"/>', <xsl:value-of select=\"translate(@from,'.','_')\"/>);" +
"        $data.Container.mapType(<xsl:value-of select=\"translate(@from,'.','_')\" />, <xsl:value-of select=\"@to\" />);" +
"      </xsl:for-each>" +
"    </xsl:otherwise>" +
"  </xsl:choose>" +
"  };" +
"  registerEdmTypes();" +
"<xsl:for-each select=\"//edm:EntityType | //edm:ComplexType\" xml:space=\"default\">" +
"  <xsl:message terminate=\"no\">Info: generating type <xsl:value-of select=\"concat(../@Namespace, '.', @Name)\"/>" +
"</xsl:message>" +
"  <xsl:variable name=\"props\">" +
"    <xsl:apply-templates select=\"*\" />" +
"  </xsl:variable>" +
"  <xsl:text xml:space=\"preserve\">  </xsl:text><xsl:value-of select=\"$EntityBaseClass\"  />.extend('<xsl:value-of select=\"../@Namespace\"/>.<xsl:value-of select=\"@Name\"/>', {" +
"    <xsl:choose><xsl:when test=\"function-available('msxsl:node-set')\">" +
"    <xsl:for-each select=\"msxsl:node-set($props)/*\">" +
"      <xsl:value-of select=\".\"/><xsl:if test=\"position() != last()\">," +
"    </xsl:if></xsl:for-each>" +
"  </xsl:when>" +
"  <xsl:otherwise>" +
"    <xsl:for-each select=\"exsl:node-set($props)/*\">" +
"      <xsl:value-of select=\".\"/><xsl:if test=\"position() != last()\">," +
"    </xsl:if></xsl:for-each>" +
"    </xsl:otherwise>" +
"    </xsl:choose>" +
"  });" +
"  " +
"</xsl:for-each>" +
"<xsl:for-each select=\"//edm:EntityContainer\">" +
"  <xsl:text xml:space=\"preserve\">  </xsl:text><xsl:value-of select=\"$ContextBaseClass\"  />.extend('<xsl:value-of select=\"concat(../@Namespace, '.', @Name)\"/>', {" +
"    <xsl:for-each select=\"edm:EntitySet | edm:FunctionImport\">" +
"      <xsl:apply-templates select=\".\"></xsl:apply-templates><xsl:if test=\"position() != last()\">," +
"    </xsl:if>" +
"    </xsl:for-each>" +
"  });" +
"  " +
"<xsl:if test=\"$AutoCreateContext = 'true'\">" +
"  /*Context Instance*/" +
"  <xsl:value-of select=\"../@Namespace\"/>.<xsl:value-of select=\"$ContextInstanceName\" /> = new <xsl:value-of select=\"concat(../@Namespace, '.', @Name)\" />( { name:'oData', oDataServiceHost: '<xsl:value-of select=\"$SerivceUri\" />' });" +
"  $data.generatedContexts = $data.generatedContexts || [];" +
"  $data.generatedContexts.push(<xsl:value-of select=\"../@Namespace\"/>.<xsl:value-of select=\"$ContextInstanceName\" />);" +
"</xsl:if>" +
"</xsl:for-each>" +
"      " +
"})(window, $data);" +
"      " +
"    </xsl:template>" +
"  <xsl:template match=\"edm:Key\"></xsl:template>" +
"  <xsl:template match=\"edm:FunctionImport\">'<xsl:value-of select=\"@Name\"/>': $data.EntityContext.generateServiceOperation({ serviceName:'<xsl:value-of select=\"@Name\"/>', returnType: <xsl:apply-templates select=\".\" mode=\"render-return-config\" />, <xsl:apply-templates select=\".\" mode=\"render-elementType-config\" />params: [<xsl:for-each select=\"edm:Parameter\">{ <xsl:value-of select=\"@Name\"/>: '<xsl:value-of select=\"@Type\"/>' }<xsl:if test=\"position() != last()\">,</xsl:if>" +
"    </xsl:for-each>], method: '<xsl:value-of select=\"@m:HttpMethod\"/>' })</xsl:template>" +
"  <xsl:template match=\"edm:FunctionImport\" mode=\"render-return-config\">" +
"    <xsl:choose>" +
"      <xsl:when test=\"not(@ReturnType)\">null</xsl:when>" +
"      <xsl:when test=\"starts-with(@ReturnType, 'Collection')\">$data.Queryable</xsl:when>" +
"      <xsl:otherwise> '<xsl:value-of select=\"@ReturnType\"/>' </xsl:otherwise>" +
"    </xsl:choose>" +
"  </xsl:template>" +
"  <xsl:template match=\"edm:FunctionImport\" mode=\"render-elementType-config\">" +
"    <xsl:if test=\"starts-with(@ReturnType, 'Collection')\">" +
"      <xsl:variable name=\"len\" select=\"string-length(@ReturnType)-12\"/>elementType: '<xsl:value-of select=\"substring(@ReturnType,12,$len)\"/>', </xsl:if>" +
"  </xsl:template>" +
"  <xsl:template match=\"edm:EntitySet\">'<xsl:value-of select=\"@Name\"/>': { type: <xsl:value-of select=\"$EntitySetBaseClass\"  />, elementType: <xsl:value-of select=\"@EntityType\"/> }</xsl:template>" +
"  " +
"  <xsl:template match=\"edm:Property | edm:NavigationProperty\">" +
"    <property>" +
"    <xsl:variable name=\"memberDefinition\">" +
"      <xsl:if test=\"parent::edm:EntityType/edm:Key/edm:PropertyRef[@Name = current()/@Name]\"><key>true</key></xsl:if>" +
"      <xsl:apply-templates select=\"@*[local-name() != 'Name']\" mode=\"render-field\" />" +
"    </xsl:variable>'<xsl:value-of select=\"@Name\"/>': { <xsl:choose><xsl:when test=\"function-available('msxsl:node-set')\"><xsl:for-each select=\"msxsl:node-set($memberDefinition)/*\">" +
"      <xsl:value-of select=\"name()\"/>:<xsl:value-of select=\".\"/>" +
"      <xsl:if test=\"position() != last()\">,<xsl:text> </xsl:text>" +
"    </xsl:if> </xsl:for-each></xsl:when>" +
"  <xsl:otherwise><xsl:for-each select=\"exsl:node-set($memberDefinition)/*\">" +
"      <xsl:value-of select=\"name()\"/>:<xsl:value-of select=\".\"/>" +
"      <xsl:if test=\"position() != last()\">,<xsl:text> </xsl:text>" +
"    </xsl:if> </xsl:for-each></xsl:otherwise>" +
"    </xsl:choose> }</property>" +
"</xsl:template>" +
"  " +
"  <xsl:template match=\"@Name\" mode=\"render-field\">" +
"  </xsl:template>" +
"  <xsl:template match=\"@Type\" mode=\"render-field\">" +
"    <type>'<xsl:value-of select=\".\"/>'</type>" +
"  </xsl:template>" +
"  <xsl:template match=\"@ConcurrencyMode\" mode=\"render-field\">" +
"    <concurrencyMode>$data.ConcurrencyMode.<xsl:value-of select=\".\"/></concurrencyMode>" +
"  </xsl:template>" +
"  <xsl:template match=\"@Nullable\" mode=\"render-field\">" +
"    <nullable><xsl:value-of select=\".\"/></nullable>" +
"    " +
"    <xsl:if test=\". = 'false'\">" +
"      <xsl:choose>" +
"        <xsl:when test=\"parent::edm:Property/@annot:StoreGeneratedPattern = 'Identity' or parent::edm:Property/@annot:StoreGeneratedPattern = 'Computed'\"></xsl:when>" +
"        <xsl:otherwise><required>true</required></xsl:otherwise>" +
"      </xsl:choose>" +
"    </xsl:if>" +
"  </xsl:template>" +
"  <xsl:template match=\"@annot:StoreGeneratedPattern\" mode=\"render-field\">" +
"    <xsl:if test=\". != 'None'\"><computed>true</computed></xsl:if>    " +
"  </xsl:template>" +
"  <xsl:template match=\"@MaxLength\" mode=\"render-field\">" +
"    <maxLength>" +
"      <xsl:choose>" +
"        <xsl:when test=\"string(.) = 'Max'\">Number.POSITIVE_INFINITY</xsl:when>" +
"        <xsl:otherwise>" +
"          <xsl:value-of select=\".\"/>" +
"        </xsl:otherwise>" +
"      </xsl:choose>" +
"      " +
"    </maxLength>" +
"  </xsl:template>" +
"  <xsl:template match=\"@FixedLength | @Unicode | @Precision | @Scale\" mode=\"render-field\">" +
"  </xsl:template>" +
"  <xsl:template match=\"@*\" mode=\"render-field\">" +
"    <xsl:variable name=\"nameProp\">" +
"      <xsl:choose>" +
"        <xsl:when test=\"substring-after(name(), ':') != ''\">" +
"          <xsl:value-of select=\"substring-after(name(), ':')\"/>" +
"        </xsl:when>" +
"        <xsl:otherwise>" +
"          <xsl:value-of select=\"name()\"/>" +
"        </xsl:otherwise>" +
"      </xsl:choose>" +
"    </xsl:variable>" +
"    <xsl:element name=\"{$nameProp}\">'<xsl:value-of select=\".\"/>'</xsl:element>" +
"  </xsl:template>" +
"  <xsl:template match=\"@Relationship\" mode=\"render-field\">" +
"    <xsl:variable name=\"relationName\" select=\"string(../@ToRole)\"/>" +
"    <xsl:variable name=\"relationshipName\" select=\"string(.)\" />" +
"    <xsl:variable name=\"relation\" select=\"key('associations',string(.))/edm:End[@Role = $relationName]\" />" +
"    <xsl:variable name=\"otherName\" select=\"../@FromRole\" />" +
"    <xsl:variable name=\"otherProp\" select=\"//edm:NavigationProperty[@ToRole = $otherName and @Relationship = $relationshipName]\" />" +
"    <xsl:variable name=\"m\" select=\"$relation/@Multiplicity\" />" +
"    <xsl:choose>" +
"      <xsl:when test=\"$m = '*'\">" +
"        <type>'<xsl:value-of select=\"$CollectionBaseClass\"/>'</type>" +
"        <elementType>'<xsl:value-of select=\"$relation/@Type\"/>'</elementType>" +
"        <xsl:if test=\"not($otherProp/@Name)\">" +
"          <inverseProperty>'$$unbound'</inverseProperty></xsl:if>" +
"        <xsl:if test=\"$otherProp/@Name\">" +
"          <inverseProperty>'<xsl:value-of select=\"$otherProp/@Name\"/>'</inverseProperty></xsl:if>" +
"      </xsl:when>" +
"      <xsl:when test=\"$m = '0..1'\">" +
"        <type>'<xsl:value-of select=\"$relation/@Type\"/>'</type>" +
"        <xsl:choose>" +
"          <xsl:when test=\"$otherProp\">" +
"            <inverseProperty>'<xsl:value-of select=\"$otherProp/@Name\"/>'</inverseProperty>" +
"          </xsl:when >" +
"          <xsl:otherwise>" +
"            <inverseProperty>'$$unbound'</inverseProperty>" +
"            <xsl:message terminate=\"no\">  Warning: inverseProperty other side missing: <xsl:value-of select=\".\"/>" +
"          </xsl:message>" +
"          </xsl:otherwise>" +
"        </xsl:choose>" +
"      </xsl:when>" +
"      <xsl:when test=\"$m = '1'\">" +
"        <type>'<xsl:value-of select=\"$relation/@Type\"/>'</type>" +
"        <required>true</required>" +
"        <xsl:choose>" +
"          <xsl:when test=\"$otherProp\">" +
"            <inverseProperty>'<xsl:value-of select=\"$otherProp/@Name\"/>'</inverseProperty>" +
"          </xsl:when >" +
"          <xsl:otherwise>" +
"            <inverseProperty>'$$unbound'</inverseProperty>" +
"            <xsl:message terminate=\"no\">" +
"              Warning: inverseProperty other side missing: <xsl:value-of select=\".\"/>" +
"            </xsl:message>" +
"          </xsl:otherwise>" +
"        </xsl:choose>" +
"      </xsl:when>" +
"    </xsl:choose>" +
"  </xsl:template>" +
"  <xsl:template match=\"@FromRole | @ToRole\" mode=\"render-field\"></xsl:template>" +
"  <xsl:template match=\"*\" mode=\"render-field\">" +
"    <!--<unprocessed>!!<xsl:value-of select=\"name()\"/>!!</unprocessed>-->" +
"    <xsl:message terminate=\"no\">  Warning: <xsl:value-of select=\"../../@Name\"/>.<xsl:value-of select=\"../@Name\"/>:<xsl:value-of select=\"name()\"/> is an unknown/unprocessed attribued</xsl:message>" +
"  </xsl:template>" +
"  <!--<xsl:template match=\"*\">" +
"    !<xsl:value-of select=\"name()\"/>!" +
"  </xsl:template>-->" +
"</xsl:stylesheet>"
    }

});

$data.MetadataLoader = new $data.MetadataLoaderClass();
