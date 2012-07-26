$data.Class.define("$data.ServiceBase", null, null, {
    $metadata:$data.JayService.serviceFunction().returns("string")(
        function (a, b) {
            var meta = new $data.oDataServer.MetaDataGenerator({}, this.getType());
            return $data.JayService.resultAsXml(meta.generateMetadataXml());
        })
});