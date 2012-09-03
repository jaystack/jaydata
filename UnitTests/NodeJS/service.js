(function(contextTypes){

var connect = require("connect");

var app53999 = connect();
app53999.use(function (req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "X-PINGOTHER, Content-Type, MaxDataServiceVersion, DataServiceVersion");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, MERGE");
    if (req.method === "OPTIONS") res.end(); else next();
});
app53999.use(connect.query());
app53999.use($data.JayService.OData.BatchProcessor.connectBodyReader);
$data.Class.defineEx("newsreader", [contextTypes["NewsReader"], $data.ServiceBase]);
app53999.use("/newsreader", $data.JayService.createAdapter(newsreader, function(req, res){
    return new newsreader({ name: "mongoDB", databaseName: req.headers["X-AppId"] + "_NewsReader" });
}));

$data.Class.defineEx("newsreader2", [contextTypes["NewsReader"], ObjectIDFactory]);
app53999.use("/newsreader2", $data.JayService.createAdapter(newsreader2, function(req, res){
    return new newsreader2({ name: "mongoDB", databaseName: req.headers["X-AppId"] + "_NewsReader" });
}));

app53999.use("/ObjectIDFactory", $data.JayService.createAdapter(ObjectIDFactory, function(req, res){
    return new ObjectIDFactory();
}));

app53999.listen(53999);

})(require("./context.js").contextTypes);
