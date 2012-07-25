var serviceFunc = require("./ServiceFunction.js");

$data.Class.define("$data.ServiceBase", null, null, {
    $metadata: serviceFunc.serviceFunction().returns("string")(
        function(a, b) {
            var meta = new $data.oDataServer.MetaDataGenerator({}, this.getType());
            return service.serviceResult.asXml(meta.generateMetadataXml());
        })
});