///EntitySet is responsible for
/// -creating and holding entityType through schema
/// - provide Add method
/// - provide Delete method
/// - provide Update method
/// - provide queryProvider for queryable

$data.EntitySchemaConfig = function EntitySchemaConfig() {
    this.Name = "";
};
$data.entitySetState = { created: 0, defined: 1, active: 2 };

$data.Class.defineEx('$data.EntitySet',
    [
        { type: $data.Queryable, params: [function () { return this; }] }
    ], null,
{
    constructor: function (elementType, context, collectionName) {
        ///<summary>Represents a typed entity set that is used to perform create, read, update, and delete operations</summary>
        ///<param name="entitySchema" type="$data.Entity" mayBeNull="false">The type that defines the set. The type must be derived from 'Entity' base type.</param>
        ///<param name="entityContext" type="$data.EntityContext" mayBeNull="false">An instance of 'EntityContext' which call the constructor.</param>
        this.createNew = this[elementType.name] = elementType;
        this.stateManager = new $data.EntityStateManager(this);
        Object.defineProperty(this, "entityContext", { value: context, writable: false, enumerable: true });
        Object.defineProperty(this, "elementType", { value: elementType, enumerable: true });
        Object.defineProperty(this, "collectionName", { value: collectionName, enumerable: true });
        return;
    },
    executeQuery: function (expression, on_ready) {
        //var compiledQuery = this.entityContext
        var callBack = $data.typeSystem.createCallbackSetting(on_ready);
        this.entityContext.executeQuery(expression, callBack);
    },
    getTraceString: function (expression) {
        return this.entityContext.getTraceString(expression);
    },
    setContext: function (entityContext) {
        this.entitySetState = $data.entitySetState.active;
        this.entityContext = entityContext;
        this.entityContext[this.schema.name] = this[this.schema.name];
    },
    _trackEntity: function (entity) {
        var trackedEntities = this.entityContext.stateManager.trackedEntities;
        for (var i = 0; i < trackedEntities.length; i++) {
            if (trackedEntities[i].data === entity)
                return;
        }
        trackedEntities.push({ entitySet: this, data: entity });
    },
    add: function (entity) {
        ///<signature>
        ///<summary>Creates a typed entity and adds to the context.</summary>
        ///<param name="entity" type="Object">The init parameters whish is based on Entity</param>
        ///</signature>
        ///<signature>
        ///<summary>Adds the given entity to the context.</summary>
        ///<param name="entity" type="$data.Entity">The entity to add</param>
        ///</signature>
        var data = entity;
        if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }
        data.entityState = $data.EntityState.Added;
        data.changedProperties = undefined;
        data.context = this.entityContext;
        this._trackEntity(data);
    },
    remove: function (entity) {
        ///<signature>
        ///<summary>Creates a typed entity and marks it as Deleted.</summary>
        ///<param name="entity" type="Object">The init parameters whish is based on Entity</param>
        ///</signature>
        ///<signature>
        ///<summary>Marks the given entity as Deleted.</summary>
        ///<param name="entity" type="$data.Entity">The entity to remove</param>
        ///</signature>
        var data = entity;
        if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }
        data.entityState = $data.EntityState.Deleted;
        data.changedProperties = undefined;
        this._trackEntity(data);
    },
    attach: function (entity) {
        ///<signature>
        ///<summary>Creates a typed entity and adds to the Context with Unchanged state.</summary>
        ///<param name="entity" type="Object">The init parameters whish is based on Entity</param>
        ///</signature>
        ///<signature>
        ///<summary>Adds to the context and sets state Unchanged.</summary>
        ///<param name="entity" type="$data.Entity">The entity to attach</param>
        ///</signature>
        var data = entity;
        if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }
        
        for (var i = 0; i < this.entityContext.stateManager.trackedEntities.length; i++) {
            var current = this.entityContext.stateManager.trackedEntities[i];
            if (current.data === entity)
                break;
            if (current.data.equals(entity)) {
                Guard.raise(new Exception("Context already contains this entity!!!"));
            }
        }

        data.entityState = $data.EntityState.Unchanged;
        data.changedProperties = undefined;
        data.context = this.entityContext;
        this._trackEntity(data);
    },
    attachOrGet: function (entity) {
        var data = entity;
        if (!(entity instanceof this.createNew)) {
            data = new this.createNew(entity);
        }

        var existsItem = this.entityContext.stateManager.trackedEntities.filter(function (i) { return i.data.equals(entity); }).pop();
        if (existsItem) {
            return existsItem.data;
        }

        data.entityState = $data.EntityState.Unchanged;
        data.changedProperties = undefined;
        data.context = this.entityContext;
        this._trackEntity(data);
        return data;
    },
    find: function (keys) {
        //todo global scope
        if (!this.entityKeys) {
            this.entityKeys = this.createNew.memberDefinition.filter(function (prop) { return prop.key; }, this);
        }
        this.entityContext.stateManager.trackedEntities.forEach(function (item) {
            if (item.entitySet == this) {
                var isOk = true;
                this.entityKeys.forEach(function (item, index) { isOK = isOk && (item.data[item.name] == keys[index]); }, this);
                if (isOk) {
                    return item.data;
                }
            }
        }, this);
        //TODO: db call
        return null;
    },
    loadItemProperty: function (entity, memberDefinition, callback) {
        return this.entityContext.loadItemProperty(entity, memberDefinition, callback);
    },
    Queryable: {}
}, null);

//TODO: remove "types" namespace
$data.EntitySet = $data.EntitySet;
