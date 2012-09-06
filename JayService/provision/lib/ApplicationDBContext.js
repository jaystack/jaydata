process.env.NODE_ENV = 'test';

function registerEdmTypes() {

    function Edm_Boolean() {

    }

    $data.Container.registerType('Edm.Boolean', Edm_Boolean);
    $data.Container.mapType(Edm_Boolean, $data.Boolean);

    function Edm_Binary() {

    }

    $data.Container.registerType('Edm.Binary', Edm_Binary);
    $data.Container.mapType(Edm_Binary, $data.Blob);

    function Edm_DateTime() { };
    $data.Container.registerType('Edm.DateTime', Edm_DateTime);
    $data.Container.mapType(Edm_DateTime, $data.Date);

    function Edm_DateTimeOffset() { };
    $data.Container.registerType('Edm.DateTimeOffset', Edm_DateTimeOffset);
    $data.Container.mapType(Edm_DateTimeOffset, $data.Integer);

    function Edm_Time() { };
    $data.Container.registerType('Edm.Time', Edm_Time);
    $data.Container.mapType(Edm_Time, $data.Integer);

    function Edm_Decimal() { };
    $data.Container.registerType('Edm.Decimal', Edm_Decimal);
    $data.Container.mapType(Edm_Decimal, $data.Number);

    function Edm_Single() { };
    $data.Container.registerType('Edm.Single', Edm_Single);
    $data.Container.mapType(Edm_Single, $data.Number);

    function Edm_Double() { };
    $data.Container.registerType('Edm.Double', Edm_Double);
    $data.Container.mapType(Edm_Double, $data.Number);

    function Edm_Guid() { };
    $data.Container.registerType('Edm.Guid', Edm_Guid);
    $data.Container.mapType(Edm_Guid, $data.String);

    function Edm_Int16() { };
    $data.Container.registerType('Edm.Int16', Edm_Int16);
    $data.Container.mapType(Edm_Int16, $data.Integer);

    function Edm_Int32() { };
    $data.Container.registerType('Edm.Int32', Edm_Int32);
    $data.Container.mapType(Edm_Int32, $data.Integer);

    function Edm_Int64() { };
    $data.Container.registerType('Edm.Int64', Edm_Int64);
    $data.Container.mapType(Edm_Int64, $data.Integer);

    function Edm_Byte() { };
    $data.Container.registerType('Edm.Byte', Edm_Byte);
    $data.Container.mapType(Edm_Byte, $data.Integer);

    function Edm_String() { };
    $data.Container.registerType('Edm.String', Edm_String);
    $data.Container.mapType(Edm_String, $data.String);

};

registerEdmTypes();

$data.Entity.extend('$data.JayStormAPI.IngressIPRule', {
    ID: { type: 'id', key: true, computed: true },
    ObjectID: { type: 'id' },
    SourceAddress: { type: 'string' },      //--> ipadd or network
    Port: { type: 'int' },
    SSL: { type: 'boolean' }
});

$data.Entity.extend('$data.JayStormAPI.IngressOriginRule', {
    ID: { type: 'id', key: true, computed: true },
    ObjectID: { type: 'id' },
    SourceOrigin: { type: 'string' },       //--> hostname or *
    Method: { type: 'Array', elementType: "string" }
});

$data.Entity.extend('$data.JayStormAPI.ApplicationMetadata', {
    ID: { type: 'id', key: true, computed: true },
    AppOwner: { type: 'string' },
    AppItems: { type: 'array', elementType: '$data.Object' }
});

$data.Entity.extend('$data.JayStormAPI.TypeTemplate', {
    'ID': { key: true, type: 'id', nullable: false, computed: true },
    Name: { type: 'string', required: true },
    Description: { type: 'string' },
    TypeName: { type: 'string' },
    TypeDescriptor: { type: '$data.Object' },
    HasElementType: { type: 'boolean' }
});


$data.Entity.extend('$data.JayStormAPI.EntityBase', {
    'Id': { key: true, type: 'id', nullable: false, computed: true },
    'creationDate': { type: 'date', $ui_visible: false },
    constructor: function () {
        this.creationDate = new Date();
    }
});

$data.Entity.extend('$data.JayStormAPI.ObjectPointer', {
    Collection: { type: 'id' },
    ID: { type: 'id' },
    Database: { type: 'string' }
});

$data.Entity.extend('$data.JayStormAPI.Permission', {
    PermissionID: { type: 'id', key: true, computed: true },
    DatabaseID: { type: 'id', required: true, $sourceTable: 'Databases', $sourceValue: 'DatabaseID', $sourceText: 'Name' },
    EntitySetID: { type: 'id', required: true, $sourceTable: 'EntitySets', $sourceValue: 'EntitySetID', $sourceText: 'Name' },
    GroupID: { type: 'id', required: true, $sourceTable: 'Groups', $sourceValue: 'GroupID', $sourceText: 'Name' },
    Read: { type: 'boolean' },
    Create: { type: 'boolean' },
    Update: { type: 'boolean' },
    Delete: { type: 'boolean' },
    DeleteBatch: { type: 'boolean' },
    Execute: { type: 'boolean' },
    Manage: { type: 'boolean' },
    CreationDate: { type: 'date' }
});

$data.Entity.extend('$data.JayStormAPI.Entity', {
    EntityID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true },
    FullName: { type: 'string', required: true },
    Namespace: { type: 'string' },
    DatabaseID: { type: 'id', required: true }
});


$data.JayStormAPI.Entity.extend('$data.JayStormAPI.ComplexType', {});

$data.Entity.extend('$data.JayStormAPI.EntityField', {
    EntityFieldID: { type: 'id', key: true, computed: true },
    EntityID: { type: 'id', required: true },
    Index: { type: 'number' },
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
    TypeTemplate: { type: 'string' },
    DatabaseID: { type: 'id', required: true } /* ?? */
});

$data.Entity.extend('$data.JayStormAPI.KeyValuePair', {
    Key: { type: 'string' },
    Value: { type: 'string' }
});

/*$data.Entity.extend('$data.JayStormAPI.ServiceOperationReturnType', {
    ReturnType: { type: 'string', required: true },
    ElementType: { type: 'string' }
});

$data.Entity.extend('$data.JayStormAPI.ServiceOperationParameter', {
    ParameterID: { type: 'id', key: true, computed: true },
    Rank: { type: 'int', required: true },
    Name: { type: 'string', required: true },
    Type: { type: 'string', required: true }
});

$data.Entity.extend('$data.JayStormAPI.ServiceOperation', {
    ServiceOperationID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true },
    Method: { type: 'string' },
    Returns: { type: '$data.JayStormAPI.ServiceOperationReturnType' },
    Promise: { type: 'bool' },
    Publish: { type: 'bool' }
});*/

$data.Entity.extend('$data.JayStormAPI.EventHandler', {
    EventHandlerID: { type: 'id', key: true, computed: true },
    Type: { type: 'string', required: true },
    Handler: { type: 'string', required: true },
    EntitySetID: { type: 'id', required: true, $sourceTable: 'EntitySets', $sourceValue: 'EntitySetID', $sourceDisplay: 'Name', $displayName: 'Table name' },
    DatabaseID: { type: 'id', required: true, $sourceTable: 'Databases', $sourceValue: 'DatabaseID', $sourceDisplay: 'Name', $displayName: 'Database' }
});


$data.Entity.extend('$data.JayStormAPI.Database', {
    DatabaseID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true },
    Namespace: { type: 'string', required: true },
    Publish: { type: 'bool' }
});

$data.Entity.extend('$data.JayStormAPI.EntitySet', {
    EntitySetID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true, $displayName: 'Table name' },
    ElementType: { type: 'string' },
    ElementTypeID: { type: 'id', required: true },
    TableName: { type: 'string' },
    Publish: { type: 'bool' },
    DatabaseID: { type: 'id', required: true }
});

$data.Entity.extend('$data.JayStormAPI.Service', {
    ServiceID: { type: 'id', key: true, computed: true },
    Name: { type: 'string', required: true, $displayName: 'Service name' },
    DatabaseID: { type: 'id', $sourceTable: 'Databases', $sourceKey: 'DatabaseID', $sourceDisplay: 'Name', $displayName: 'Database' },
    BaseServiceID: { type: 'id', $sourceTable: 'Services', $sourceKey: 'ServiceID', $sourceDisplay: 'Name', $displayName: 'Extends' },
    Sets: { type: 'array', elementType: 'string' },
    Published: { type: 'bool' },
    ServiceSourceType: { type: 'string', $displayName: 'Source type' },
    ServiceSource: { type: 'string', $displayName: 'Source' },
    AllowAnonymous: { type: 'boolean', $displayName: 'Allow anonymous' },
    AllowAllIPs: { type: 'boolean', $displayName: 'Allow all IPs' },
    AllowAllOrigins: { type: 'boolean', $displayName: 'Allow all origins' },
    UseDefaultPort: { type: 'boolean', $displayName: 'Use default port' },
    UseSSL: { type: 'boolean', $displayName: 'Use SSL' }
});

$data.Entity.extend('$data.JayStormAPI.EntitySetPublication', {
    EntitySetPublicationID: { type: 'id', key: true, computed: true },
    ServiceID: { type: 'id' },
    EntitySetID: { type: 'id' }
});

$data.Class.define('$data.JayStormAPI.User', $data.Entity, null, {
    UserID: { type: 'id', key: true, computed: true },
    Login: { type: 'Edm.String', required: true },
    FirstName: { type: 'Edm.String' },
    LastName: { type: 'Edm.String' },
    Enabled: { type: 'Edm.Boolean' },
    Password: { type: 'Edm.String' },
    Groups: { type: 'Array', elementType: 'id', $source: 'Groups', $field: 'GroupID' },
    CreationDate: { type: 'date' }
});

$data.Class.define('$data.JayStormAPI.Group', $data.Entity, null, {
    GroupID: { type: 'id', key: true, computed: true },
    Name: { type: 'Edm.String' }
});


$data.Class.define('$data.JayStormAPI.Test', $data.Entity, null, {
    _id: { type: 'string', key: true },
    Name: { type: 'Edm.String' }
});


$data.Class.defineEx('$data.JayStormAPI.Context', [$data.EntityContext, $data.ServiceBase], null, {

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
    //ServiceOperations: { type: $data.EntitySet, elementType: $data.JayStormAPI.ServiceOperation },
    TypeTemplates: { type: $data.EntitySet, elementType: $data.JayStormAPI.TypeTemplate },
    Users: { type: $data.EntitySet, elementType: $data.JayStormAPI.User },
    Groups: { type: $data.EntitySet, elementType: $data.JayStormAPI.Group },

    constructor: function () {
        var self = this;


        this.Databases.afterCreate = function (items) {

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var svc = this.Services.add({
                    DatabaseID: item.DatabaseID,
                    Name: item.Name,
                    Published: true
                });
            };
            this.saveChanges();
        };

        this.EntitySets.afterCreate = function (entitySets) {
            var itemsToCreate = [];
            var itemIds = [];
            var dbID = entitySets[0].DatabaseID;
            if (entitySets.length > 1) {
                for (var i = 0; i < entitySets.length; i++) {
                    if (entitySets[i].DatabaseID !== dbID) {
                        console.log("Batch create EntitySets for different DB-s are not allowed");
                        return false;
                    }
                };
            }

            return function (cb) {
                self.Services
                    .filter("it.DatabaseID == this.dbID", { dbID: dbID })
                    .forEach(function (service) {
                        entitySets.forEach(function (entitySet) {
                            self.EntitySetPublications.add({
                                ServiceID: service.ServiceID,
                                EntitySetID: entitySet.EntitySetID,
                                Name: entitySet.Name
                            });
                        })
                    })
                    .then(function () {
                        self.saveChanges(function () {
                            console.log('items saved');
                            cb(false);
                        })
                    });
            }
        };

        var bc = require('bcrypt');

        this.Users.beforeCreate = function (items) {
            for (var i = 0; i < items.length; i++) {
                var it = items[i];
                it.Password = bc.hashSync(it.Password || Math.random().toString(), 8);
            }
        };

    },

    SystemTypes: {
        value: [
            {
                Name: 'Object identifier',
                Description: 'A field that uniquely identifies an object',
                TypeName: 'id',
                TypeDescriptor: {
                    Type: 'id',
                    Key: true,
                    Computed: true
                }

            },
            {
                Name: 'Short string',
                Description: 'A line of text (max 200 letters)',
                TypeName: 'string',
                TypeDescriptor: {
                    Type: 'string',
                    MaxLength: 200
                }
            },
            {
                Name: 'Long string',
                Description: 'A large block of text million',
                TypeName: 'string',
                TypeDescriptor: {
                    Type: 'string'
                }
            },
            {
                Name: 'Reference',
                Description: 'A type to keep an id of another object',
                TypeName: 'id',
                TypeDescriptor: {
                    Type: 'id'
                }

            },
            {
                Name: 'International date',
                Description: 'A datetime value stored in Zulu',
                TypeName: 'date',
                TypeDescriptor: {
                    Type: 'date'
                }
            },

            {
                Name: 'Number',
                Description: 'A real number',
                TypeName: 'number',
                TypeDescriptor: {
                    Type: 'number'
                }
            },
            {
                Name: 'Boolean',
                Description: 'A boolean field',
                TypeName: 'boolean',
                TypeDescriptor: {
                    Type: 'boolean'
                }
            },
            {
                Name: 'Array',
                Description: 'A field for a collection of items of primitive and complex types',
                TypeName: 'Array',
                TypeDescriptor: {
                    Type: 'Array'
                },
                HasElementType: true
            }
        ]
    },


    loadTypes: $data.JayService
                    .serviceFunction()
                    .returnsArrayOf("$data.JayStormAPI.TypeTemplate")
                    (
                        function () {
                            return function (pass, fail) {
                                var self = this;
                                for (var i = 0; i < this.context.SystemTypes.length; i++) {
                                    var tp = this.context.SystemTypes[i];
                                    this.context.TypeTemplates.add(tp);
                                }

                                this.context.saveChanges(function () {
                                    self.context.TypeTemplates.toArray(function (a) {
                                        self.success(a);
                                    })

                                });


                            }
                        }
                    ),


    setPassword: $data.JayService.serviceFunction()
        .param("userID", "Edm.String")
        .param("password", "Edm.String")
        .returns("Edm.String")
        (
            function (userID, password) {
                var uid = eval(userID), passwd = eval(password);
                return function () {
                    var self = this, context = this.context
                    var u = new JayStormApplication.User({ Id: uid });
                    context.Users.attach(u);
                    u.password = passwd;
                    context.saveChanges(function () {
                        self.success("OK");
                    });

                }

            }
        ),
        
    getContext: function(db){
        ///<param name="db" type="string"/>
        ///<returns type="$data.Object"/>
        
        var self = this;
        
        return function(success, error){
            var q = require('q');
            
            var nsContext;
            var context = {};
            var entities = [];
            var entityIds = [];
            var entitySets = {};
            var sets = [self.Entities,
                        self.EntitySets,
                        self.Databases,
                        self.ComplexTypes];

            function setPreloader(sets) {
                var d = q.defer();
                var parray = [];
                var resultps = {};
                for(var i = 0; i < sets.length; i++) {
                    sets[sets[i].tableName] = sets[i];
                    parray.push(resultps[sets[i].tableName] = sets[i].toArray());
                }

                q.allResolved(parray).then(function() {
                    for(var key in resultps) {
                        resultps[key] =resultps[key].valueOf();
                        var keyField = sets[key].defaultType.memberDefinitions.getKeyProperties()[0].name;
                        for(var i = 0; i < resultps[key].length; i++) {
                            resultps[key][resultps[key][i][keyField]] = resultps[key][i];
                        }
                    }
                    d.resolve(resultps);
                });
                return d.promise;
            }

            var loadedSets = setPreloader(sets);

            q.when(loadedSets)
                .then(function(ls){
                    for(var key in ls) {
                        console.log(key + " " + ls[key].length);
                        console.dir(Object.keys(ls[key]));
                    }
                    loadedSets = ls;
                    
                    self.Databases.single(function(it){ return it.Name == this.db; }, { db: db }, function(db){
                        nsContext = db.Namespace + '.Context';
                        context.ContextName = nsContext;
                        self.EntitySets
                            .filter(function(it){ return it.DatabaseID == this.db; }, { db: db.DatabaseID })
                            .toArray({
                                success: function(result){
                                    var ret = {};
                                    for (var i = 0; i < result.length; i++){
                                        var r = result[i];
                                        ret[r.Name] = {
                                            type: '$data.EntitySet',
                                            elementType: loadedSets["Entities"][r.ElementTypeID].FullName
                                        };
                                        if (r.TableName) ret[r.Name].tableName = r.TableName;
                                        entitySets[r.EntitySetID] = ret[r.Name];
                                        //entities.push(r.ElementType);
                                    }
                                    context[nsContext] = ret;
                                    //console.log(entities);
                                },
                            error: error
                        }).then(function(){
                            self.Entities.filter(function(it){ return it.DatabaseID == this.db; }, { db: db.DatabaseID }) /*.filter(function(it){ return it.FullName in this.entities; }, { entities: entities })*/.toArray({
                                success: function(result){
                                    entities = result;
                                    self.ComplexTypes.filter(function(it){ return it.DatabaseID == this.db; }, { db: db.DatabaseID }).toArray(function(result){
                                        if (result.length) entities = entities.concat(result);
                                        entityIds = entities.map(function(it){ return it.EntityID; });
                                        /*for (var i = 0; i < result.length; i++){
                                            var r = result[i];
                                            //entityIds.push(r.EntityID);
                                            context[r.FullName] = {};
                                            
                                            for (var j = 0; j < r.Fields.length; j++){
                                                var rf = r.Fields[j];
                                                var f = {};
                                                        
                                                f.type = rf.Type;
                                                if (rf.ElementType) f.elementType = rf.ElementType;
                                                if (rf.InverseProperty) f.inverseProperty = rf.InverseProperty;
                                                if (rf.Key) f.key = true;
                                                if (rf.Computed) f.computed = true;
                                                if (rf.Nullable !== undefined && r.Nullable !== null) f.nullable = !!rf.Nullable;
                                                if (rf.Required) f.required = true;
                                                if (rf.CustomValidator) f.customValidator = rf.CustomValidator;
                                                if (rf.MinValue !== undefined && rf.MinValue !== null) f.minValue = rf.MinValue;
                                                if (rf.MaxValue !== undefined && rf.MaxValue !== null) f.maxValue = rf.MaxValue;
                                                if (rf.MinLength !== undefined && rf.MinLength !== null) f.minLength = rf.MinLength;
                                                if (rf.MaxLength !== undefined && rf.MaxLength !== null) f.maxLength = rf.MaxLength;
                                                if (rf.Length !== undefined && rf.Length !== null) f.length = rf.Length;
                                                if (rf.RegExp) f.regex = rf.RegExp;
                                                if (rf.ExtensionAttributes && rf.ExtensionAttributes.length){
                                                    for (var k = 0; k < rf.ExtensionAttributes.length; k++){
                                                        var kv = rf.ExtensionAttributes[k];
                                                        f[kv.Key] = kv.Value;
                                                    }
                                                }
                                                
                                                context[r.FullName][rf.Name] = f;
                                            }
                                        }
                                        
                                        self.success(context);*/
                                        
                                        self.EntityFields.filter(function(it){ return it.EntityID in this.entityid && it.DatabaseID == this.db; },
                                                    { db: db.DatabaseID, entityid: entityIds }).toArray({
                                            success: function(result){
                                                for (var i = 0; i < result.length; i++){
                                                    var r = result[i];
                                                    var e = entities.filter(function(it){ return it.EntityID === r.EntityID; })[0];
                                                    
                                                    var f = {};
                                                    if (!context[e.FullName || ((e.Namespace || db.Namespace) + e.Name)]) context[e.FullName || ((e.Namespace || db.Namespace) + e.Name)] = {};
                                                    
                                                    f.type = r.Type;
                                                    if (r.ElementType) f.elementType = r.ElementType;
                                                    if (r.InverseProperty) f.inverseProperty = r.InverseProperty;
                                                    if (r.Key) f.key = true;
                                                    if (r.Computed) f.computed = true;
                                                    if (r.Nullable !== undefined && r.Nullable !== null && r.Nullable) f.nullable = !!r.Nullable;
                                                    if (r.Required) f.required = true;
                                                    if (r.CustomValidator) f.customValidator = r.CustomValidator;
                                                    if (r.MinValue !== undefined && r.MinValue !== null) f.minValue = r.MinValue;
                                                    if (r.MaxValue !== undefined && r.MaxValue !== null) f.maxValue = r.MaxValue;
                                                    if (r.MinLength !== undefined && r.MinLength !== null) f.minLength = r.MinLength;
                                                    if (r.MaxLength !== undefined && r.MaxLength !== null) f.maxLength = r.MaxLength;
                                                    if (r.Length !== undefined && r.Length !== null) f.length = r.Length;
                                                    if (r.RegExp) f.regex = r.RegExp;
                                                    
                                                    context[e.FullName || ((e.Namespace || db.Namespace) + e.Name)][r.Name] = f;
                                                }
                                                
                                                self.EventHandlers.filter(function(it){ return it.DatabaseID == this.db; }, { db: db.DatabaseID }).toArray({
                                                    success: function(result){
                                                        for (var i = 0; i < result.length; i++){
                                                            var r = result[i];
                                                            entitySets[r.EntitySetID][r.Type] = r.Handler;
                                                        }
                                                        success(context);
                                                    },
                                                    error: error
                                                });
                                            },
                                            error: error
                                        });
                                    });
                                },
                                error: error
                            });
                        });
                    });
                //self.success({});
            }).fail(function(err) { error(err); });
        };
    },
    getContextJS: function(db){
        ///<param name="db" type="string"/>
        ///<returns type="string"/>
        
        var self = this;
        return function(success, error){
            self.getContext(db)(
                function(context){
                    var js = '';
                    var events = {
                        afterCreate: true,
                        afterRead: true,
                        afterUpdate: true,
                        afterDelete: true,
                        beforeCreate: true,
                        beforeRead: true,
                        beforeUpdate: true,
                        beforeDelete: true
                    };
                    for (var i in context){
                        var c = context[i];
                        if (i != context.ContextName && i != 'ContextName'){
                            js += '$data.Entity.extend("' + i + '", {\n';
                            var trim = false;
                            for (var prop in c){
                                var p = c[prop];
                                js += '    ' + prop + ': { ';
                                for (var attr in p){
                                    js += attr + ': ' + JSON.stringify(p[attr]) + ', ';
                                }
                                var lio = js.lastIndexOf(', ');
                                js = js.substring(0, lio);
                                js += ' },\n';
                                trim = true;
                            }
                            if (trim){
                                var lio = js.lastIndexOf(',');
                                js = js.substring(0, lio);
                            }
                            js += '\n});\n\n';
                        }
                    }
                    var c = context[context.ContextName];
                    js += '$data.EntityContext.extend("' + context.ContextName + '", {\n';
                    if (Object.keys(c).length){
                        for (var i in c){
                            var es = c[i];
                            js += '    ' + i + ': { type: $data.EntitySet, elementType: ' + es.elementType + (es.tableName ? ', tableName: "' + es.tableName + '" ' : '');
                            for (var e in events){
                                console.log(i, e, es[e]);
                                if (es[e]) js += (',\n        ' + e + ': ' + es[e]);
                            }
                            js += ' },\n';
                        }
                        var lio = js.lastIndexOf(',');
                        js = js.substring(0, lio);
                    }
                    js += '\n});';
                    console.log(js);
                    success(js);
                },
                error);
            };
    }

});

$data.JayStormAPI.Context.annotateFromVSDoc();
exports.serviceType = $data.JayStormAPI.Context;
