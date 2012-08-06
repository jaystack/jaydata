$data.Entity.extend('test.User', {
    Id: { type: 'id', computed: true, key: true },
    Name: { type: 'string' },
    Age: { type: 'int' }/*,
    Roles: { type: '$data.Array', elementType: 'string' }*/
});

$data.EntityContext.extend('test.Context', {
    Tests: { type: $data.EntitySet, elementType: test.User }
});
