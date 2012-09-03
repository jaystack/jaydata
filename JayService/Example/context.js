$data.Class.define('$example.Person', $data.Entity, null, {
    Id: { type: 'string', key: true, computed: true },
    Name: { type: 'string' },
    Description: { type: 'string' },
    Age: { type: 'int' },
    //Orders: { type: 'Array', elementType: '$example.Order', inverseProperty: 'Person' }
});

$data.Class.define('$example.Order', $data.Entity, null, {
    Id: { type: 'string', key: true, computed: true },
    Value: { type: 'int' },
    Date: { type: 'date' },
    Completed: { type: 'bool' },
    //Person: { type: '$example.Person', inverseProperty: 'Orders' }
});

$data.Class.define('$example.Context', $data.EntityContext, null, {
    People: { type: $data.EntitySet, elementType: $example.Person },
    Orders: { type: $data.EntitySet, elementType: $example.Order }
});