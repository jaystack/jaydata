(function(){

var contextTypes = {};

$data.Entity.extend("$data.JayStormAPI.Test", {
    _id: { type: "$data.String", key: true },
    Name: { type: "$data.String" }
});

$data.Entity.extend("$data.JayStormAPI.Permission", {
    PermissionID: { type: "$data.ObjectID", key: true, computed: true },
    DatabaseID: { type: "$data.ObjectID", required: true },
    EntitySetID: { type: "$data.ObjectID", required: true },
    GroupID: { type: "$data.ObjectID", required: true },
    Read: { type: "$data.Boolean" },
    Create: { type: "$data.Boolean" },
    Update: { type: "$data.Boolean" },
    Delete: { type: "$data.Boolean" },
    DeleteBatch: { type: "$data.Boolean" },
    Execute: { type: "$data.Boolean" },
    Manage: { type: "$data.Boolean" },
    CreationDate: { type: "$data.Date" }
});

$data.Entity.extend("$data.JayStormAPI.Database", {
    DatabaseID: { type: "$data.ObjectID", key: true, computed: true },
    Name: { type: "$data.String", required: true },
    Namespace: { type: "$data.String", required: true },
    Publish: { type: "$data.Boolean" }
});

$data.Entity.extend("$data.JayStormAPI.ComplexType", {
    EntityID: { type: "$data.ObjectID", key: true, computed: true },
    Name: { type: "$data.String", required: true },
    FullName: { type: "$data.String", required: true },
    Namespace: { type: "$data.String" },
    DatabaseID: { type: "$data.ObjectID", required: true }
});

$data.Entity.extend("$data.JayStormAPI.Entity", {
    EntityID: { type: "$data.ObjectID", key: true, computed: true },
    Name: { type: "$data.String", required: true },
    FullName: { type: "$data.String", required: true },
    Namespace: { type: "$data.String" },
    DatabaseID: { type: "$data.ObjectID", required: true }
});

$data.Entity.extend("$data.JayStormAPI.EntityField", {
    EntityFieldID: { type: "$data.ObjectID", key: true, computed: true },
    EntityID: { type: "$data.ObjectID", required: true },
    Index: { type: "$data.Number" },
    Name: { type: "$data.String", required: true },
    Type: { type: "$data.String", required: true },
    ElementType: { type: "$data.String" },
    InverseProperty: { type: "$data.String" },
    Key: { type: "$data.Boolean" },
    Computed: { type: "$data.Boolean" },
    Nullable: { type: "$data.Boolean" },
    Required: { type: "$data.Boolean" },
    CustomValidator: { type: "$data.String" },
    MinValue: { type: "$data.String" },
    MaxValue: { type: "$data.String" },
    MinLength: { type: "$data.Integer" },
    MaxLength: { type: "$data.Integer" },
    Length: { type: "$data.Integer" },
    RegExp: { type: "$data.String" },
    TypeTemplate: { type: "$data.String" },
    DatabaseID: { type: "$data.ObjectID", required: true }
});

$data.Entity.extend("$data.JayStormAPI.EntitySet", {
    EntitySetID: { type: "$data.ObjectID", key: true, computed: true },
    Name: { type: "$data.String", required: true },
    ElementType: { type: "$data.String" },
    ElementTypeID: { type: "$data.ObjectID", required: true },
    TableName: { type: "$data.String" },
    Publish: { type: "$data.Boolean" },
    DatabaseID: { type: "$data.ObjectID", required: true }
});

$data.Entity.extend("$data.JayStormAPI.EntitySetPublication", {
    EntitySetPublicationID: { type: "$data.ObjectID", key: true, computed: true },
    ServiceID: { type: "$data.ObjectID" },
    EntitySetID: { type: "$data.ObjectID" }
});

$data.Entity.extend("$data.JayStormAPI.EventHandler", {
    EventHandlerID: { type: "$data.ObjectID", key: true, computed: true },
    Type: { type: "$data.String", required: true },
    Handler: { type: "$data.String", required: true },
    EntitySetID: { type: "$data.ObjectID", required: true },
    DatabaseID: { type: "$data.ObjectID", required: true }
});

$data.Entity.extend("$data.JayStormAPI.IngressIPRule", {
    ID: { type: "$data.ObjectID", key: true, computed: true },
    ObjectID: { type: "$data.ObjectID" },
    SourceAddress: { type: "$data.String" },
    Port: { type: "$data.Integer" },
    SSL: { type: "$data.Boolean" }
});

$data.Entity.extend("$data.JayStormAPI.IngressOriginRule", {
    ID: { type: "$data.ObjectID", key: true, computed: true },
    ObjectID: { type: "$data.ObjectID" },
    SourceOrigin: { type: "$data.String" },
    Method: { type: "$data.Array", elementType: "$data.String" }
});

$data.Entity.extend("$data.JayStormAPI.Service", {
    ServiceID: { type: "$data.ObjectID", key: true, computed: true },
    Name: { type: "$data.String", required: true },
    DatabaseID: { type: "$data.ObjectID" },
    BaseServiceID: { type: "$data.ObjectID" },
    Sets: { type: "$data.Array", elementType: "$data.String" },
    Published: { type: "$data.Boolean" },
    ServiceSourceType: { type: "$data.String" },
    ServiceSource: { type: "$data.String" },
    AllowAnonymous: { type: "$data.Boolean" },
    AllowAllIPs: { type: "$data.Boolean" },
    AllowAllOrigins: { type: "$data.Boolean" },
    UseDefaultPort: { type: "$data.Boolean" },
    UseSSL: { type: "$data.Boolean" }
});

$data.Entity.extend("$data.JayStormAPI.TypeTemplate", {
    ID: { type: "$data.ObjectID", key: true, computed: true },
    Name: { type: "$data.String", required: true },
    Description: { type: "$data.String" },
    TypeName: { type: "$data.String" },
    TypeDescriptor: { type: "$data.Object" },
    HasElementType: { type: "$data.Boolean" }
});

$data.Entity.extend("$data.JayStormAPI.User", {
    UserID: { type: "$data.ObjectID", key: true, computed: true },
    Login: { type: "$data.String", required: true },
    FirstName: { type: "$data.String" },
    LastName: { type: "$data.String" },
    Enabled: { type: "$data.Boolean" },
    Password: { type: "$data.String" },
    Groups: { type: "$data.Array", elementType: "$data.ObjectID" },
    CreationDate: { type: "$data.Date" }
});

$data.Entity.extend("$data.JayStormAPI.Group", {
    GroupID: { type: "$data.ObjectID", key: true, computed: true },
    Name: { type: "$data.String" }
});

$data.EntityContext.extend("$data.JayStormAPI.Context", {
    Tests: { type: $data.EntitySet, elementType: $data.JayStormAPI.Test },
    Permissions: { type: $data.EntitySet, elementType: $data.JayStormAPI.Permission },
    Databases: { type: $data.EntitySet, elementType: $data.JayStormAPI.Database },
    ComplexTypes: { type: $data.EntitySet, elementType: $data.JayStormAPI.ComplexType },
    Entities: { type: $data.EntitySet, elementType: $data.JayStormAPI.Entity },
    EntityFields: { type: $data.EntitySet, elementType: $data.JayStormAPI.EntityField },
    EntitySets: { type: $data.EntitySet, elementType: $data.JayStormAPI.EntitySet },
    EntitySetPublications: { type: $data.EntitySet, elementType: $data.JayStormAPI.EntitySetPublication },
    EventHandlers: { type: $data.EntitySet, elementType: $data.JayStormAPI.EventHandler },
    IngressIPRules: { type: $data.EntitySet, elementType: $data.JayStormAPI.IngressIPRule },
    IngressOriginRules: { type: $data.EntitySet, elementType: $data.JayStormAPI.IngressOriginRule },
    Services: { type: $data.EntitySet, elementType: $data.JayStormAPI.Service },
    TypeTemplates: { type: $data.EntitySet, elementType: $data.JayStormAPI.TypeTemplate },
    Users: { type: $data.EntitySet, elementType: $data.JayStormAPI.User },
    Groups: { type: $data.EntitySet, elementType: $data.JayStormAPI.Group }
});

contextTypes["ApplicationDB"] = $data.JayStormAPI.Context;

exports = module.exports = { contextTypes: contextTypes };

})();