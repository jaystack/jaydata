$data.Class.define("$data.ServiceBase", null, null, {
    $metadata: function () {
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
        ///<method type="POST" />
        ///<responseType type="multipart/mixed" />

        var processor = new $data.JayService.OData.BatchProcessor(this, this.executionContext.request.fullRoute);
        return processor.process(this.executionContext.request, this.executionContext.response);
    }
}, {
    __metadataCache: { type: 'string', value: null }
});

$data.ServiceBase.annotateFromVSDoc();
