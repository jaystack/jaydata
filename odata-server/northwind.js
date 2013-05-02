require('odata-server');

console.log('Starting Northwind OData server.');

$data.createODataServer({
    type: require('./northwind/context.js'),
    basicAuth: function(username, password){
        if (username == 'admin'){
            return password == 'admin';
        }else return true;
    },
    checkPermission: function(access, user, entitySets, callback){
        if (access & $data.Access.Read){
            callback.success();
        }else if (user == 'admin') callback.success();
        else callback.error('auth fail');
    }
}, '/Northwind.svc', 52999, 'localhost');

console.log('Northwind OData server listening on http://localhost:52999/Northwind.svc');
