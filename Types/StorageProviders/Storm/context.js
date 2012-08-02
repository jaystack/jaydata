$data.Entity.extend('test.TestA', {
    Id: { type: 'id', computed: true, key: true },
    Name: { type: 'string' },
    Age: { type: 'int' },
    Roles: { type: '$data.Array' }
});

$data.EntityContext.extend('test.Context', {
    Tests: { type: $data.EntitySet, elementType: test.TestA }
});
