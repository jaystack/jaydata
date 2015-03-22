require('odata-server');

var contextType = require('./newsreader/context.js');
var context = new $news.Types.NewsContext({ name: 'mongoDB', databaseName: 'newsreader', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
context.onReady(function(db){
    contextType.generateTestData(db, function(count){
        console.log('Test data upload successful. ', count, 'items inserted.');
        console.log('Starting NewsReader OData server.');

        /*$data.createODataServer({
            type: contextType,
            database: 'newsreader',
        }, '/newsreader.svc', 52999, 'localhost');*/
        
        var connect = require('connect');
        var app = connect();
        
        app.use('/newsreader.svc', $data.ODataServer({
            type: contextType,
            CORS: true,
            database: 'newsreader',
            responseLimit: 100,
            basicAuth: function(username, password){
                if (username == 'admin'){
                    return password == 'admin';
                }else return true;
            },
            checkPermission: function(access, user, entitySets, callback){
                if (access & $data.Access.Create){
                    if (user == 'admin') callback.success();
                    else callback.error('Auth failed');
                }else callback.success();
            },
            provider: {
                howto: 'You can pass a customized JayData provider configuration in here.'
            }
        }));

        app.listen(52999);
        
        console.log('NewsReader OData server listening on http://localhost:52999/newsreader.svc');
    });
});
