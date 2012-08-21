$data.Entity.extend('$data.JayStormAPI.Entity', {
    DatabaseID: { type: 'id', required: true },
    EntityID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true },
    FullName: { type: 'string', required: true },
    Namespace: { type: 'string' }/*,
    Fields: { type: 'Array', elementType: '$data.JayStormAPI.EntityField' },
    Fields: { type: 'Array', elementType: '$data.JayStormAPI.EntityField' },
    EntitySets: { type: 'Array', elementType: '$data.JayStormAPI.EntitySet', inverseProperty: 'ElementType' }*/
});

$data.Entity.extend('$data.JayStormAPI.EntityField', {
    DatabaseID: { type: 'id', required: true },
    EntityFieldID: { type: 'id', key: true, computed: true },
    EntityID: { type: 'id', required: true },
    Name: { type: 'string', required: true },
    Type: { type: 'string', required: true },
    ElementType: { type: 'string' },
    InverseProperty: { type: 'string' },
    Key: { type: 'bool' },
    Computed: { type: 'bool' },
    Nullable: { type: 'bool' },
    Required: { type: 'bool' },
    CustomValidator: { type: 'string' },
    MinValue: { type: 'string' },
    MaxValue: { type: 'string' },
    MinLength: { type: 'int' },
    MaxLength: { type: 'int' },
    Length: { type: 'int' },
    RegExp: { type: 'string' },
    ExtensionAttributes: { type: 'Array', elementType: '$data.JayStormAPI.KeyValuePair' }/*,
    Entity: { type: '$data.JayStormAPI.Entity', required: true, inverseProperty: 'Fields' }*/
});

$data.JayStormAPI.Entity.extend('$data.JayStormAPI.ComplexType');

$data.Entity.extend('$data.JayStormAPI.KeyValuePair', {
    Key: { type: 'string' },
    Value: { type: 'string' }
});

$data.Entity.extend('$data.JayStormAPI.ServiceOperationReturnType', {
    ReturnType: { type: 'string', required: true },
    ElementType: { type: 'string' }
});

$data.Entity.extend('$data.JayStormAPI.ServiceOperationParameter', {
    ParameterID: { type: 'id', key: true, computed: true },
    Rank: { type: 'int', required: true },
    Name: { type: 'string', required: true },
    Type: { type: 'string', required: true }/*,
    ServiceOperation: { type: '$data.JayStormAPI.ServiceOperation', inverseProperty: 'Parameters', required: true }*/
});

$data.Entity.extend('$data.JayStormAPI.ServiceOperation', {
    ServiceOperationID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true },
    //Parameters: { type: 'Array', elementType: '$data.JayStormAPI.ServiceOperationParameter' },
    Method: { type: 'string' },
    Returns: { type: '$data.JayStormAPI.ServiceOperationReturnType' },
    Promise: { type: 'bool' },
    Publish: { type: 'bool' }
});

$data.Entity.extend('$data.JayStormAPI.EventHandler', {
    EventHandlerID: { type: 'id', key: true, computed: true },
    Type: { type: 'string', required: true },
    Handler: { type: 'string', required: true }/*,
    EntitySet: { type: '$data.JayStormAPI.EntitySet', inverseProperty: 'EventHandlers', required: true }*/
});

$data.Entity.extend('$data.JayStormAPI.EntitySet', {
    DatabaseID: { type: 'id', required: true },
    EntitySetID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true },
    ElementType: { type: 'string', required: true },
    //ElementTypeID: { type: 'id', required: true },
    TableName: { type: 'string' },
    //EventHandlers: { type: 'Array', elementType: '$data.JayStormAPI.EventHandler' },
    //ElementType: { type: '$data.JayStormAPI.Entity', required: true },
    Publish: { type: 'bool' }
});

/*$data.Entity.extend('$data.JayStormAPI.EntityContext', {
    EntityContextID: { type: 'id', key: true, computed: true },
    FullName: { type: 'string' },
    EntitySetID: { type: 'id' },
    EntitySet: { type: 'string' }
})*/

$data.Entity.extend('$data.JayStormAPI.Database', {
    DatabaseID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true },
    Namespace: { type: 'string', required: true }
})

$data.EntityContext.extend('$data.JayStormAPI.Context', {
    Databases: { type: $data.EntitySet, elementType: $data.JayStormAPI.Database },
    Entities: { type: $data.EntitySet, elementType: $data.JayStormAPI.Entity },
    ComplexTypes: { type: $data.EntitySet, elementType: $data.JayStormAPI.ComplexType },
    EntityFields: { type: $data.EntitySet, elementType: $data.JayStormAPI.EntityField },
    EventHandlers: { type: $data.EntitySet, elementType: $data.JayStormAPI.EventHandler },
    EntitySets: { type: $data.EntitySet, elementType: $data.JayStormAPI.EntitySet },
    ServiceParameters: { type: $data.EntitySet, elementType: $data.JayStormAPI.ServiceOperationParameter },
    ServiceOperations: { type: $data.EntitySet, elementType: $data.JayStormAPI.ServiceOperation }
    
});
