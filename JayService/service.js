(function(contextTypes){

var windowBackup = window;
window = undefined;
var express = require("express");
var passport = require("passport");
window = windowBackup;

var app60080 = express();
app60080.use(express.cookieParser());
app60080.use(express.methodOverride());
app60080.use(express.session({ secret: "keyboard cat" }));
app60080.use($data.JayService.Middleware.appID());
app60080.use($data.JayService.Middleware.currentDatabase());
app60080.use($data.JayService.Middleware.databaseConnections({
    "db": [
        {
            "address": "127.0.0.1",
            "port": 27017
        }
    ]
}));
app60080.use($data.JayService.Middleware.cache());
app60080.use(passport.initialize());
app60080.use("/dbService/logout", function(req, res){
    if (req.logOut){
        req.logOut();
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", "Basic realm=\"dbService\"");
        res.write("Logout was successful.");
    }else res.write("Logout failed.");
    res.end();
});
app60080.use($data.JayService.Middleware.authentication());
app60080.use($data.JayService.Middleware.authenticationErrorHandler);
app60080.use($data.JayService.Middleware.authorization({ databaseName: "db" }));
app60080.use(express.query());
app60080.use(express.bodyParser());
app60080.use($data.JayService.OData.Utils.simpleBodyReader());
$data.Class.defineEx("dbService", [contextTypes["db"], $data.ServiceBase]);
if (typeof dbService !== "function") $data.Class.defineEx("dbService", [$data.ServiceBase]);
app60080.use("/dbService", express.static(__dirname + "/files/dbService"));
app60080.use("/dbService", $data.JayService.createAdapter(dbService, function(req, res){
    return req.getCurrentDatabase(dbService, "db");
}));
app60080.use(express.errorHandler());

express.errorHandler.title = "JayStorm API";
if (typeof bass !== "function") $data.Class.defineEx("bass", [$data.ServiceBase]);
app60080.use("/bass", express.static(__dirname + "/files/bass"));
app60080.use("/bass", $data.JayService.createAdapter(bass, function(req, res){
    return new bass();
}));
app60080.use(express.errorHandler());

express.errorHandler.title = "JayStorm API";
app60080.listen(60080, "127.0.0.1");

})(require("/home/lazarv/project/jaydata/JayService/context.js").contextTypes);