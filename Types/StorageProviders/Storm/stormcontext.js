$data.Entity.extend('$test.Item', {
    Id: { type: 'string', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' }/*,
    Thing: { type: '$test.Thing', inverseProperty: 'Item' }*/
});

/*$data.Entity.extend('$test.Thing', {
    Id: { type: 'int', computed: true, key: true },
    Oh: { type: 'string' },
    Item: { type: '$test.Item', required: true }
});*/

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item }/*,
    Things: { type: $data.EntitySet, elementType: $test.Thing }*/
});
