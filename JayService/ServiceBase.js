$data.Class.define("$data.ServiceBase", null, null, {
    constructor: function () {
        ///	<signature>
        ///     <summary>Class for extend $data.EntityContext with special OData standard functions</summary>
        ///     <description>Class for extend $data.EntityContext with special OData standard functions</description>
        /// </signature>

    },
    $metadata: function () {
        ///<summary>Generate OData standard metadata from current EntityContext</summary>
        ///<description>Generate OData standard metadata from current EntityContext</description>
        ///<returns type="String"/>
        ///<method type="GET" />
        ///<resultType type="$data.XmlResult" />
        
        var contextType = this.getType();
        if (!contextType.__metadataCache) {
            var meta = new $data.oDataServer.MetaDataGenerator({}, this.getType());
            contextType.__metadataCache = meta.generateMetadataXml();
        }
        
        return contextType.__metadataCache;
    },
    $batch: function () {
        ///<summary>Process OData standard batch requests</summary>
        ///<description>Process OData standard batch requests</description>
        ///<returns type="function"/>
        ///<method type="POST" />
        ///<responseType type="multipart/mixed" />

        var processor = new $data.JayService.OData.BatchProcessor(this, this.executionContext.request.fullRoute);
        return processor.process(this.executionContext.request, this.executionContext.response);
    }
}, {
    __metadataCache: { type: 'string', value: null }
});

$data.ServiceBase.annotateFromVSDoc();
