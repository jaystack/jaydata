(function(contextTypes){

var connect = require("connect");

var app53999 = connect();
app53999.use($data.JayService.Middleware.appID());
app53999.use($data.JayService.Middleware.currentDatabase());
app53999.use($data.JayService.Middleware.databaseConnections({
    "NewsReader": [
        {
            "address": "127.0.0.1",
            "port": 27017
        }
    ]
}));
app53999.use(function (req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, MERGE");
    if (req.method === "OPTIONS") res.end(); else next();
});
app53999.use(connect.query());
app53999.use(connect.bodyParser());
app53999.use($data.JayService.OData.BatchProcessor.connectBodyReader);
$data.Class.defineEx("newsreader", [contextTypes["NewsReader"], $data.ServiceBase]);
app53999.use("/newsreader", $data.JayService.createAdapter(newsreader, function(req, res){
    return req.getCurrentDatabase(newsreader, "NewsReader");
}));
app53999.use(connect.errorHandler());

app53999.listen(53999, "127.0.0.1");

})(require("/home/lazarv/project/jaydata/JayService/context.js").contextTypes);