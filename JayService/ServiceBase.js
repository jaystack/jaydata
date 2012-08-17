$data.Class.define("$data.ServiceBase", null, null, {
    $metadata: (function () {
        var contextType = this.context.getType();
        if (!contextType.__metadataCache) {
            var meta = new $data.oDataServer.MetaDataGenerator({}, this.context.getType());
            contextType.__metadataCache = meta.generateMetadataXml();
        }
        return new $data.XmlResult(contextType.__metadataCache);

    }).toServiceOperation(),
    $batch: function () {
        ///<responseType type="multipart/mixed" />

        var processor = new $data.JayService.OData.BatchProcessor(this.context, 'http://example.com');
        return processor.process(this.request, this.response);
    }
}, {
    __metadataCache: { type: 'string', value: null }
});



