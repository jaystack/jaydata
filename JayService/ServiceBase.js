$data.Class.define("$data.ServiceBase", null, null, {
    $metadata: (function(){
        var meta = new $data.oDataServer.MetaDataGenerator({}, this.context.getType());
        return new $data.XmlResult(meta.generateMetadataXml());
    }).toServiceOperation()
});
