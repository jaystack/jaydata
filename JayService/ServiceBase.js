$data.Class.define("$data.ServiceBase", null, null, {
    $metadata: (function () {
        var meta = new $data.oDataServer.MetaDataGenerator({}, this.context.getType());
        return new $data.XmlResult(meta.generateMetadataXml());
    }).toServiceOperation(),
    $batch: function () {
        ///<responseType type="multipart/mixed" />

        var processor = new $data.JayService.OData.BatchProcessor(this.context, 'http://example.com');
        return processor.process(this.request, this.response);
    }
});



