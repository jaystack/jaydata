$data.Entity.extend('User', {
    UserID: { type: 'ObjectID', computed: true, key: true },
    Username: { type: 'string' },
    Password: { type: 'string' },
    Roles: { type: 'string' }
});

$data.EntityContext.extend('UserContext', {
    UserTable: { type: $data.EntitySet, elementType: 'User' }
});

var context = new UserContext( { name:'mongoDB', databaseName: 'user', address: '192.168.1.111', port: 12345 });


