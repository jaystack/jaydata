var $data = require('jaydata');
var news = require('./NewsReaderContext_server.js')
var connect = require("connect");
var app = connect();

var dbAddress = '127.0.0.1';
var dbName = 'oDataUnitTests';

app.use(connect.query());
app.use($data.JayService.OData.BatchProcessor.connectBodyReader);
app.use("/Services/emptyNewsReader.svc", $data.JayService.createAdapter( $news.Types.NewsContext, function() {
    console.log("===Query");
    return new  $news.Types.NewsContext({name: 'mongoDB', databaseName: dbName, address:dbAddress })
}))
    .use("/Services/oDataDbDelete.asmx/Delete", function(req, res){
        console.log("===Delete");
        var ctx = new  $news.Types.NewsContext({name: 'mongoDB', databaseName: dbName, address:dbAddress,dbCreation:$data.storageProviders.DbCreationType.DropAllExistingTables })
        ctx.onReady(function(){
            res.write("ok");
            res.end();
        });
    })
    .use(connect.static("/home/nochtap/GitRepo/jaydata"))
    .listen(80);