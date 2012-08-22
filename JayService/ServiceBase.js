$data.Class.define("$data.ServiceBase", null, null, {
    $metadata: (function () {
        var contextType = this.getType();
        if (!contextType.__metadataCache) {
            var meta = new $data.oDataServer.MetaDataGenerator({}, this.getType());
            contextType.__metadataCache = meta.generateMetadataXml();
        }
        return new $data.XmlResult(contextType.__metadataCache);

    }).toServiceOperation(),
    $batch: function () {
        ///<responseType type="multipart/mixed" />

        var processor = new $data.JayService.OData.BatchProcessor(this, this.request.fullRoute);
        return processor.process(this.executionContext.request, this.executionContext.response);
    }
}, {
    __metadataCache: { type: 'string', value: null }
});



