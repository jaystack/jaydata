(function(contextTypes){

var connect = require("connect");

var app_0 = connect();
$data.Class.defineEx("newsreader", [contextTypes["NewsReader"], $data.ServiceBase]);
app_0.use("/newsreader", $data.JayService.createAdapter(newsreader, function(){
    return new newsreader({ name: "mongoDB", databaseName: "NewsReader" });
}));
app_0.listen(53999);


})(require("./context.js").contextTypes);