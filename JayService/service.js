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
app60080.use($data.JayService.Middleware.superadmin());
app60080.use($data.JayService.Middleware.currentDatabase());
app60080.use($data.JayService.Middleware.databaseConnections({
    "ApplicationDB": [
        {
            "address": "127.0.0.1",
            "port": 27017
        }
    ]
}));
app60080.use($data.JayService.Middleware.cache());
app60080.use(passport.initialize());
app60080.use("/ApplicationDB/logout", function(req, res){
    if (req.logOut){
        req.logOut();
        res.statusCode = 401;
        res.setHeader("WWW-Authenticate", "Basic realm=\"ApplicationDB\"");
        res.write("Logout was successful.");
    }else res.write("Logout failed.");
    res.end();
});
app60080.use($data.JayService.Middleware.authentication());
app60080.use($data.JayService.Middleware.authenticationErrorHandler);
app60080.use($data.JayService.Middleware.ensureAuthenticated({ message: 'JayStorm API' }));
app60080.use($data.JayService.Middleware.authorization({ databaseName: "ApplicationDB" }));
app60080.use(express.query());
app60080.use(express.bodyParser());
app60080.use($data.JayService.OData.Utils.simpleBodyReader());
$data.Class.defineEx("ApplicationDB", [contextTypes["ApplicationDB"], $data.ServiceBase]);
if (typeof ApplicationDB !== "function") $data.Class.defineEx("ApplicationDB", [$data.ServiceBase]);
app60080.use("/ApplicationDB", express.static(__dirname + "/files/ApplicationDB"));
app60080.use("/ApplicationDB", $data.JayService.createAdapter(ApplicationDB, function(req, res){
    return req.getCurrentDatabase(ApplicationDB, "ApplicationDB");
}));
app60080.use(express.errorHandler());

express.errorHandler.title = "JayStorm API";
app60080.listen(60080, "127.0.0.1");

})(require("/home/lazarv/project/jaydata/JayService/context.js").contextTypes);
