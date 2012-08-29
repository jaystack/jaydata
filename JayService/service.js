(function(contextTypes){

var windowBackup = window;
window = undefined;
var express = require("express");
var passport = require("passport");
window = windowBackup;

var app53999 = express();
app53999.use(express.cookieParser());
app53999.use(express.methodOverride());
app53999.use(express.session({ secret: "keyboard cat" }));
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
app53999.use($data.JayService.Middleware.cache());
app53999.use(passport.initialize());
app53999.use("/newsreader/logout", function(req, res){
    if (req.logOut){
        req.logOut();
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", "Basic realm=\"newsreader\"");
        res.write("Logout was successful.");    }else res.write("Logout failed.");
    res.end();
});
app53999.use($data.JayService.Middleware.authentication());
app53999.use($data.JayService.Middleware.authenticationErrorHandler);
app53999.use(express.query());
app53999.use(express.bodyParser());
app53999.use($data.JayService.OData.BatchProcessor.connectBodyReader);
$data.Class.defineEx("newsreader", [contextTypes["NewsReader"], $data.ServiceBase]);
app53999.use("/newsreader", $data.JayService.createAdapter(newsreader, function(req, res){
    return req.getCurrentDatabase(newsreader, "NewsReader");
}));
app53999.use(express.errorHandler());

express.errorHandler.title = "JayStorm API";
app53999.listen(53999, "127.0.0.1");

})(require("/home/lazarv/project/jaydata/JayService/context.js").contextTypes);