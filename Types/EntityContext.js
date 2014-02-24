(function () {

    $data.defaults = $data.defaults || {};
    $data.defaults.defaultDatabaseName = 'JayDataDefault';

})();


$data.Class.define('$data.StorageModel', null, null, {
    constructor: function () {
        ///<field name="LogicalType" type="$data.Entity">User defined type</field>
        this.ComplexTypes = [];
        this.Associations = [];
    },
    LogicalType: {},
    LogicalTypeName: {},
    PhysicalType: {},
    PhysicalTypeName: {},
    EventHandlers: {},
    TableName: {},
    TableOptions: { value: undefined },
    ComplexTypes: {},
    Associations: {},
    ContextType: {},
    Roles: {}
}, null);
$data.Class.define('$data.Association', null, null, {
    constructor: function (initParam) {
        if (initParam) {
            this.From = initParam.From;
            this.FromType = initParam.FromType;
            this.FromMultiplicity = initParam.FromMultiplicity;
            this.FromPropertyName = initParam.FromPropertyName;
            this.To = initParam.To;
            this.ToType = initParam.ToType;
            this.ToMultiplicity = initParam.ToMultiplicity;
            this.ToPropertyName = initParam.ToPropertyName;
        }
    },
    From: {},
    FromType: {},
    FromMultiplicity: {},
    FromPropertyName: {},
    To: {},
    ToType: {},
    ToMultiplicity: {},
    ToPropertyName: {},
    ReferentialConstraint: {}
}, null);
$data.Class.define('$data.ComplexType', $data.Association, null, {}, null);

$data.Class.define('$data.EntityContext', null, null,
{
    constructor: function (storageProviderCfg) {
        /// <description>Provides facilities for querying and working with entity data as objects.</description>
        ///<param name="storageProviderCfg" type="Object">Storage provider specific configuration object.</param>

        if ($data.ItemStore && 'ContextRegister' in $data.ItemStore)
            $data.ItemStore.ContextRegister.apply(this, arguments);

        if (storageProviderCfg.queryCache)
            this.queryCache = storageProviderCfg.queryCache;

        if ("string" === typeof storageProviderCfg) {
            if (0 === storageProviderCfg.indexOf("http")) {
                storageProviderCfg = {
                    name: "oData",
                    oDataServiceHost: storageProviderCfg
                }
            } else {
                storageProviderCfg = {
                    name: "local",
                    databaseName: storageProviderCfg
                }
            }
        }

        if ("provider" in storageProviderCfg) {
            storageProviderCfg.name = storageProviderCfg.provider;
        }

        //Initialize properties
        this.lazyLoad = false;
        this.trackChanges = false;
        this._entitySetReferences = {};
        this._storageModel = [];

        var ctx = this;
        ctx._isOK = false;

        var origSuccessInitProvider = this._successInitProvider;
        this._successInitProvider = function (errorOrContext) {
            if (errorOrContext instanceof $data.EntityContext) {
                origSuccessInitProvider(ctx);
            } else {
                origSuccessInitProvider(ctx, errorOrContext);
            }
        }

        this._storageModel.getStorageModel = function (typeName) {
            var name = Container.resolveName(typeName);
            return ctx._storageModel[name];
        };
        if (typeof storageProviderCfg.name === 'string') {
            var tmp = storageProviderCfg.name;
            storageProviderCfg.name = [tmp];
        }
        var i = 0, providerType;
        var providerList = [].concat(storageProviderCfg.name);
        var callBack = $data.typeSystem.createCallbackSetting({ success: this._successInitProvider, error: this._successInitProvider });

        this._initStorageModelSync();
        ctx._initializeEntitySets(ctx.getType());

        $data.StorageProviderLoader.load(providerList, {
            success: function (providerType) {
                ctx.storageProvider = new providerType(storageProviderCfg, ctx);
                ctx.storageProvider.setContext(ctx);
                ctx.stateManager = new $data.EntityStateManager(ctx);

                var contextType = ctx.getType();
                if (providerType.name in contextType._storageModelCache) {
                    ctx._storageModel = contextType._storageModelCache[providerType.name];
                } else {
                    ctx._initializeStorageModel();
                    contextType._storageModelCache[providerType.name] = ctx._storageModel;
                }

                //ctx._initializeEntitySets(contextType);
                if (storageProviderCfg && storageProviderCfg.user) Object.defineProperty(ctx, 'user', { value: storageProviderCfg.user, enumerable: true });
                if (storageProviderCfg && storageProviderCfg.checkPermission) Object.defineProperty(ctx, 'checkPermission', { value: storageProviderCfg.checkPermission, enumerable: true });

                //ctx._isOK = false;
                ctx._initializeStore(callBack);
            },
            error: function () {
                callBack.error('Provider fallback failed!');
            }
        });



        this.addEventListener = function (eventName, fn) {
            var delegateName = "on" + eventName;
            if (!(delegateName in this)) {
                this[delegateName] = new $data.Event(eventName, this);
            }
            this[delegateName].attach(fn);
        };

        this.removeEventListener = function (eventName, fn) {
            var delegateName = "on" + eventName;
            if (!(delegateName in this)) {
                return;
            }
            this[delegateName].detach(fn);
        };

        this.raiseEvent = function (eventName, data) {
            var delegateName = "on" + eventName;
            if (!(delegateName in this)) {
                return;
            }
            this[delegateName].fire(data);
        };


        this.ready = this.onReady({
            success: $data.defaultSuccessCallback,
            error: function () {
                if ($data.PromiseHandler !== $data.PromiseHandlerBase) {
                    $data.defaultErrorCallback.apply(this, arguments);
                } else {
                    $data.Trace.error(arguments);
                }
            }
        });
    },
    beginTransaction: function () {
        var tables = null;
        var callBack = null;
        var isWrite = false;

        function readParam(value) {
            if (Object.isNullOrUndefined(value)) return;

            if (typeof value === 'boolean') {
                isWrite = value;
            } else if (Array.isArray(value)) {
                tables = value;
            } else {
                callBack = value;
            }
        }

        readParam(arguments[0]);
        readParam(arguments[1]);
        readParam(arguments[2]);

        var pHandler = new $data.PromiseHandler();
        callBack = pHandler.createCallback(callBack);

        //callBack = $data.typeSystem.createCallbackSetting(callBack);
        this.storageProvider._beginTran(tables, isWrite, callBack);

        return pHandler.getPromise();
    },
    _isReturnTransaction: function (transaction) {
        return transaction instanceof $data.Base || transaction === 'returnTransaction';
    },
    _applyTransaction: function (scope, cb, args, transaction, isReturnTransaction) {
        if (isReturnTransaction === true) {
            if (transaction instanceof $data.Transaction) {
                Array.prototype.push.call(args, transaction);
                cb.apply(scope, args);
            } else {
                this.beginTransaction(function (tran) {
                    Array.prototype.push.call(args, tran);
                    cb.apply(scope, args);
                });
            }
        }
        else {
            cb.apply(scope, args);
        }
    },

    getDataType: function (dataType) {
        // Obsolate
        if (typeof dataType == "string") {
            var memDef_dataType = this[dataType];
            if (memDef_dataType === undefined || memDef_dataType === null) { memDef_dataType = eval(dataType); }
            return memDef_dataType;
        }
        return dataType;
    },
    _initializeEntitySets: function (ctor) {

        for (var i = 0, l = this._storageModel.length; i < l; i++){
            var storageModel = this._storageModel[i];
            this[storageModel.ItemName] = new $data.EntitySet(storageModel.LogicalType, this, storageModel.ItemName, storageModel.EventHandlers, storageModel.Roles);
            var sm = this[storageModel.ItemName];
            sm.name = storageModel.ItemName;
            sm.tableName = storageModel.TableName;
            sm.tableOptions = storageModel.TableOptions;
            sm.eventHandlers = storageModel.EventHandlers;
            this._entitySetReferences[storageModel.LogicalType.name] = sm;

            this._initializeActions(sm, ctor, ctor.getMemberDefinition(storageModel.ItemName));

        }

    },
    _initializeStore: function (callBack) {
        if (this.storageProvider) {
            this.storageProvider.initializeStore(callBack);
        }
    },

    _initStorageModelSync: function() {
        var _memDefArray = this.getType().memberDefinitions.asArray();


        for (var i = 0; i < _memDefArray.length; i++) {
            var item = _memDefArray[i];
            if ('dataType' in item) {
                var itemResolvedDataType = Container.resolveType(item.dataType);
                if (itemResolvedDataType && itemResolvedDataType.isAssignableTo && itemResolvedDataType.isAssignableTo($data.EntitySet)) {
                    var elementType = Container.resolveType(item.elementType);
                    var storageModel = new $data.StorageModel();
                    storageModel.TableName = item.tableName || item.name;
                    storageModel.TableOptions = item.tableOptions;
                    storageModel.ItemName = item.name;
                    storageModel.LogicalType = elementType;
                    storageModel.LogicalTypeName = elementType.name;
                    storageModel.PhysicalTypeName = $data.EntityContext._convertLogicalTypeNameToPhysical(storageModel.LogicalTypeName);
                    storageModel.ContextType = this.getType();
                    storageModel.Roles = item.roles;
		    if (item.indices) {
                        storageModel.indices = item.indices;
                    }
                    if (item.beforeCreate) {
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.beforeCreate = item.beforeCreate;
                    }
                    if (item.beforeRead) {
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.beforeRead = item.beforeRead;
                    }
                    if (item.beforeUpdate) {
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.beforeUpdate = item.beforeUpdate;
                    }
                    if (item.beforeDelete) {
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.beforeDelete = item.beforeDelete;
                    }
                    if (item.afterCreate) {
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.afterCreate = item.afterCreate;
                    }
                    if (item.afterRead) {
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.afterRead = item.afterRead;
                    }
                    if (item.afterUpdate) {
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.afterUpdate = item.afterUpdate;
                    }
                    if (item.afterDelete) {
                        if (!storageModel.EventHandlers) storageModel.EventHandlers = {};
                        storageModel.EventHandlers.afterDelete = item.afterDelete;
                    }
                    this._storageModel.push(storageModel);
                    var name = Container.resolveName(elementType);
                    this._storageModel[name] = storageModel;
                }
            }
        }

    },
    _initializeStorageModel: function () {

        
        var _memDefArray = this.getType().memberDefinitions.asArray();
        

        if (typeof intellisense !== 'undefined')
            return;

        
        for (var i = 0; i < this._storageModel.length; i++) {
            var storageModel = this._storageModel[i];

            ///<param name="storageModel" type="$data.StorageModel">Storage model item</param>
            var dbEntityInstanceDefinition = {};

            storageModel.Associations = storageModel.Associations || [];
            storageModel.ComplexTypes = storageModel.ComplexTypes || [];
            for (var j = 0; j < storageModel.LogicalType.memberDefinitions.getPublicMappedProperties().length; j++) {
                var memDef = storageModel.LogicalType.memberDefinitions.getPublicMappedProperties()[j];
                ///<param name="memDef" type="MemberDefinition">Member definition instance</param>

                var memDefResolvedDataType = Container.resolveType(memDef.dataType);

                if ((this.storageProvider.supportedDataTypes.indexOf(memDefResolvedDataType) > -1) && Object.isNullOrUndefined(memDef.inverseProperty)) {
                    //copy member definition
                    var t = JSON.parse(JSON.stringify(memDef));
                    //change datatype to resolved type
                    t.dataType = memDefResolvedDataType;
                    dbEntityInstanceDefinition[memDef.name] = t;
                    continue;
                }

                this._buildDbType_navigationPropertyComplite(memDef, memDefResolvedDataType, storageModel);

                //var memDef_dataType = this.getDataType(memDef.dataType);
                if ((memDefResolvedDataType === $data.Array || (memDefResolvedDataType.isAssignableTo && memDefResolvedDataType.isAssignableTo($data.EntitySet))) &&
                    (memDef.inverseProperty && memDef.inverseProperty !== '$$unbound')) {
                    this._buildDbType_Collection_OneManyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                } else {
                    if (memDef.inverseProperty) {
                        if (memDef.inverseProperty === '$$unbound') {
                            //member definition is navigation but not back reference
                            if (memDefResolvedDataType === $data.Array) {
                                this._buildDbType_Collection_OneManyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                            } else {
                                this._buildDbType_ElementType_OneManyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                            }
                        } else {
                            //member definition is navigation property one..one or one..many case
                            var fields = memDefResolvedDataType.memberDefinitions.getMember(memDef.inverseProperty);
                            if (fields) {
                                if (fields.elementType) {
                                    //member definition is one..many connection
                                    var referealResolvedType = Container.resolveType(fields.elementType);
                                    if (referealResolvedType === storageModel.LogicalType) {
                                        this._buildDbType_ElementType_OneManyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                                    } else {
                                        if (typeof intellisense === 'undefined') {
                                            Guard.raise(new Exception('Inverse property not valid, refereed item element type not match: ' + storageModel.LogicalTypeName, ', property: ' + memDef.name));
                                        }
                                    }
                                } else {
                                    //member definition is one..one connection
                                    this._buildDbType_ElementType_OneOneDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                                }
                            } else {
                                if (typeof intellisense === 'undefined') {
                                    Guard.raise(new Exception('Inverse property not valid'));
                                }
                            }
                        }
                    } else {
                        //member definition is a complex type
                        this._buildDbType_addComplexTypePropertyDefinition(dbEntityInstanceDefinition, storageModel, memDefResolvedDataType, memDef);
                    }
                }
            }
            this._buildDbType_modifyInstanceDefinition(dbEntityInstanceDefinition, storageModel, this);
            var dbEntityClassDefinition = {};
            dbEntityClassDefinition.convertTo = this._buildDbType_generateConvertToFunction(storageModel, this);
            this._buildDbType_modifyClassDefinition(dbEntityClassDefinition, storageModel, this);

            //create physical type
            //TODO
            storageModel.PhysicalType = $data.Class.define(storageModel.PhysicalTypeName, $data.Entity, storageModel.LogicalType.container, dbEntityInstanceDefinition, dbEntityClassDefinition);
        }
    },
    _initializeActions: function (es, ctor, esDef) {
        if (esDef && esDef.actions) {
            var actionKeys = Object.keys(esDef.actions);
            for (var i = 0; i < actionKeys.length; i++) {
                var actionName = actionKeys[i];
                var action = esDef.actions[actionName];
                if (typeof action === 'function') {
                    es[actionName] = action;
                } else {
                    var actionDef = $data.MemberDefinition.translateDefinition(action, actionName, ctor);
                    if (actionDef instanceof $data.MemberDefinition && actionDef.kind === $data.MemberTypes.method) {
                        es[actionName] = actionDef.method;
                    }
                }
            }
        }
    },
    _buildDbType_navigationPropertyComplite: function (memDef, memDefResolvedDataType, storageModel) {
        if (!memDef.inverseProperty) {
            var refMemDefs = null;
            if (memDefResolvedDataType === $data.Array || (memDefResolvedDataType.isAssignableTo && memDefResolvedDataType.isAssignableTo($data.EntitySet))) {
                var refStorageModel = this._storageModel.getStorageModel(Container.resolveType(memDef.elementType));
                if (refStorageModel) {
                    refMemDefs = [];
                    var pubDefs = refStorageModel.LogicalType.memberDefinitions.getPublicMappedProperties();
                    for (var i = 0; i < pubDefs.length; i++) {
                        var m = pubDefs[i];
                        if ((m.inverseProperty == memDef.name) && (Container.resolveType(m.dataType) === Container.resolveType(storageModel.LogicalType)))
                            refMemDefs.push(m);
                    }
                }
            } else {
                var refStorageModel = this._storageModel.getStorageModel(memDefResolvedDataType);
                if (refStorageModel) {
                    refMemDefs = [];
                    var pubDefs = refStorageModel.LogicalType.memberDefinitions.getPublicMappedProperties();
                    for (var i = 0; i < pubDefs.length; i++) {
                        var m = pubDefs[i];
                        if (m.elementType && ((m.inverseProperty == memDef.name) && (Container.resolveType(m.elementType) === storageModel.LogicalType)))
                            refMemDefs.push(m);
                        else if ((m.inverseProperty == memDef.name) && (Container.resolveType(m.dataType) === storageModel.LogicalType))
                            refMemDefs.push(m);
                    }
                }
            }
            if (refMemDefs) {
                if (refMemDefs.length > 1) {
                    if (typeof intellisense !== 'undefined') {
                        Guard.raise(new Exception('More than one inverse property refer to this member definition: ' + memDef.name + ', type: ' + Container.resolveName(storageModel.LogicalType)));
                    }
                }
                var refMemDef = refMemDefs.pop();
                if (refMemDef) {
                    memDef.inverseProperty = refMemDef.name;
                }
            }
        } else {
            var refStorageModel = null;
            if (memDefResolvedDataType === $data.Array || (memDefResolvedDataType.isAssignableTo && memDefResolvedDataType.isAssignableTo($data.EntitySet))) {
                refStorageModel = this._storageModel.getStorageModel(Container.resolveType(memDef.elementType));

            } else {
                refStorageModel = this._storageModel.getStorageModel(memDefResolvedDataType);
            }

            var p = refStorageModel.LogicalType.memberDefinitions.getMember(memDef.inverseProperty);
            if (p) {
                if (p.inverseProperty) {
                    if (p.inverseProperty != memDef.name) {
                        if (typeof intellisense === 'undefined') {
                            Guard.raise(new Exception('Inverse property mismatch'));
                        }
                    }
                } else {
                    p.inverseProperty = memDef.name;
                }
            }

        }
    },
    _buildDbType_generateConvertToFunction: function (storageModel) { return function (instance) { return instance; }; },
    _buildDbType_modifyInstanceDefinition: function (instanceDefinition, storageModel) { return; },
    _buildDbType_modifyClassDefinition: function (classDefinition, storageModel) { return; },
    _buildDbType_addComplexTypePropertyDefinition: function (dbEntityInstanceDefinition, storageModel, memDef_dataType, memDef) {
        this._addNavigationPropertyDefinition(dbEntityInstanceDefinition, memDef, memDef.name, $data.MemberTypes.complexProperty);
        var complexType = this._createComplexElement(storageModel.LogicalType, "", memDef.name, memDef_dataType, "", "");
        storageModel.ComplexTypes[memDef.name] = complexType;
        storageModel.ComplexTypes.push(complexType);
    },
    _buildDbType_Collection_OneManyDefinition: function (dbEntityInstanceDefinition, storageModel, memDef_dataType, memDef) {
        var refereedType = Container.resolveType(memDef.elementType);
        if (refereedType === undefined || refereedType === null) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("Element type definition error", "Field definition", memDef));
            }
        }
        var refereedStorageModel = this._storageModel.getStorageModel(refereedType);
        //var refereedStorageModel = this._storageModel.filter(function (s) { return s.LogicalType === refereedType; })[0];
        if (!refereedStorageModel) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("No EntitySet definition for the following element type", "Field definition", memDef));
            }
        }

        this._addNavigationPropertyDefinition(dbEntityInstanceDefinition, memDef, memDef.name);
        var associationType = memDef.inverseProperty === '$$unbound' ? '$$unbound' : '0..1';
        var association = this._addAssociationElement(storageModel.LogicalType, associationType, memDef.name, refereedStorageModel.LogicalType, "*", memDef.inverseProperty);
        storageModel.Associations[memDef.name] = association;
        storageModel.Associations.push(association);
    },
    _buildDbType_ElementType_OneManyDefinition: function (dbEntityInstanceDefinition, storageModel, memDef_dataType, memDef) {
        var refereedType = Container.resolveType(memDef.dataType);
        if (refereedType === undefined || refereedType === null) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("Element type definition error", "Field definition", memDef));
            }
        }
        var refereedStorageModel = this._storageModel.getStorageModel(refereedType);
        //var refereedStorageModel = this._storageModel.filter(function (s) { return s.LogicalType === refereedType; })[0];
        if (!refereedStorageModel) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("No EntitySet definition for the following element type", "Field definition", memDef));
            }
        }

        this._addNavigationPropertyDefinition(dbEntityInstanceDefinition, memDef, memDef.name);
        var associationType = memDef.inverseProperty === '$$unbound' ? '$$unbound' : '*';
        var association = this._addAssociationElement(storageModel.LogicalType, associationType, memDef.name, refereedStorageModel.LogicalType, "0..1", memDef.inverseProperty);
        storageModel.Associations[memDef.name] = association;
        storageModel.Associations.push(association);
    },
    _buildDbType_ElementType_OneOneDefinition: function (dbEntityInstanceDefinition, storageModel, memDef_dataType, memDef) {
        var refereedType = Container.resolveType(memDef.dataType);
        if (refereedType === undefined || refereedType === null) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("Element type definition error", "Field definition", memDef));
            }
        }
        var refereedStorageModel = this._storageModel.getStorageModel(refereedType);;
        //var refereedStorageModel = this._storageModel.filter(function (s) { return s.LogicalType === refereedType; })[0];
        if (!refereedStorageModel) {
            if (typeof intellisense === 'undefined') {
                Guard.raise(new Exception("No EntitySet definition following element type", "Field definition", memDef));
            }
        }

        var refereedMemberDefinition = refereedStorageModel.LogicalType.memberDefinitions.getMember(memDef.inverseProperty);
        if (!refereedMemberDefinition.required && !memDef.required) { if (typeof intellisense === 'undefined') { if (typeof intellisense === 'undefined') { Guard.raise(new Exception('In one to one connection, one side must required!', 'One to One connection', memDef)); } } }

        this._addNavigationPropertyDefinition(dbEntityInstanceDefinition, memDef, memDef.name);

        var association = this._addAssociationElement(storageModel.LogicalType,
                                                 memDef.required ? "0..1" : "1",
                                                 memDef.name,
                                                 refereedStorageModel.LogicalType,
                                                 memDef.required ? "1" : "0..1",
                                                 memDef.inverseProperty);
        storageModel.Associations[memDef.name] = association;
        storageModel.Associations.push(association);
    },
    _addNavigationPropertyDefinition: function (definition, member, associationName, kind) {
        var t = JSON.parse(JSON.stringify(member));
        t.dataType = $data.EntitySet;
        t.notMapped = true;
        t.kind = kind ? kind : $data.MemberTypes.navProperty;
        t.association = associationName;
        definition[member.name] = t;
    },
    _addAssociationElement: function (fromType, fromMultiplicity, fromPropName, toType, toMultiplicity, toPropName) {
        return new $data.Association({
            From: fromType.name,
            FromType: fromType,
            FromMultiplicity: fromMultiplicity,
            FromPropertyName: fromPropName,
            To: toType.name,
            ToType: toType,
            ToMultiplicity: toMultiplicity,
            ReferentialConstraint: [],
            ToPropertyName: toPropName
        });
    },
    _createComplexElement: function (fromType, fromMultiplicity, fromPropName, toType, toMultiplicity, toPropName) {
        return new $data.ComplexType({
            From: fromType.name,
            FromType: fromType,
            FromMultiplicity: fromMultiplicity,
            FromPropertyName: fromPropName,
            To: toType.name,
            ToType: toType,
            ToMultiplicity: toMultiplicity,
            ReferentialConstraint: [],
            ToPropertyName: toPropName
        });
    },

    _successInitProvider: function (context, error) {
        if (context instanceof $data.EntityContext && context._isOK !== undefined) {
            if (!error) {
                context._isOK = true;
                if (context.onReadyFunction) {
                    for (var i = 0; i < context.onReadyFunction.length; i++) {
                        context.onReadyFunction[i].success(context);
                    }
                    context.onReadyFunction = undefined;
                }
            } else {
                context._isOK = error;
                if (context.onReadyFunction) {
                    for (var i = 0; i < context.onReadyFunction.length; i++) {
                        context.onReadyFunction[i].error(error);
                    }
                    context.onReadyFunction = undefined;
                }
            }
        }
    },
    onReady: function (fn) {
        /// <signature>
        ///     <summary>
        ///         Sets the callback function to be called when the initialization of the EntityContext has successfully finished.
        ///     </summary>
        ///     <param name="successCallback" type="Function">
        ///         <summary>Success callback</summary>
        ///         <param name="entityContext" type="$data.EntityContext">Current entityContext object</param>
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>
        ///         Sets the callback functions to be called when the initialization of the EntityContext has finished.
        ///     </summary>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        var pHandler = new $data.PromiseHandler();
        var callBack = pHandler.createCallback(fn);
        if (this._isOK === true) {
            callBack.success(this);
        } else if (this._isOK !== false) {
            callBack.error(this._isOK);
        } else {
            this.onReadyFunction = this.onReadyFunction || [];
            this.onReadyFunction.push(callBack);
        }

        return pHandler.getPromise();
    },
    ready: { type: $data.Promise },
    getEntitySetFromElementType: function (elementType) {
        /// <signature>
        ///     <summary>Gets the matching EntitySet for an element type.</summary>
        ///     <param name="elementType" type="Function" />
        ///     <returns type="$data.EntitySet" />
        /// </signature>
        /// <signature>
        ///     <summary>Gets the matching EntitySet for an element type.</summary>
        ///     <param name="elementType" type="String" />
        ///     <returns type="$data.EntitySet" />
        /// </signature>
        var result = this._entitySetReferences[elementType];
        if (!result) {
            try {
                result = this._entitySetReferences[eval(elementType).name];
            } catch (ex) { }
        }
        return result;
    },
    executeQuery: function (queryable, callBack, transaction) {
        var query = new $data.Query(queryable.expression, queryable.defaultType, this);
        query.transaction = transaction instanceof $data.Transaction ? transaction : undefined;
        var returnTransaction = this._isReturnTransaction(transaction);

        callBack = $data.typeSystem.createCallbackSetting(callBack);
        var that = this;
        var clbWrapper = {};
        clbWrapper.success = function (query) {
            if ($data.QueryCache && $data.QueryCache.isCacheable(that, query)) {
                $data.QueryCache.addToCache(that, query);
            }

            query.buildResultSet(that);

            if ($data.ItemStore && 'QueryResultModifier' in $data.ItemStore)
                $data.ItemStore.QueryResultModifier.call(that, query);

            var successResult;

            if (query.expression.nodeType === $data.Expressions.ExpressionType.Single ||
                query.expression.nodeType === $data.Expressions.ExpressionType.Find ||
                query.expression.nodeType === $data.Expressions.ExpressionType.Count ||
                query.expression.nodeType === $data.Expressions.ExpressionType.BatchDelete ||
                query.expression.nodeType === $data.Expressions.ExpressionType.Some ||
                query.expression.nodeType === $data.Expressions.ExpressionType.Every) {
                if (query.result.length !== 1) {
                    callBack.error(new Exception('result count failed'));
                    return;
                }

                successResult = query.result[0];
            } else if (query.expression.nodeType === $data.Expressions.ExpressionType.First) {
                if (query.result.length === 0) {
                    callBack.error(new Exception('result count failed'));
                    return;
                }

                successResult = query.result[0];
            } else {
                if (typeof query.__count === 'number' && query.result)
                    query.result.totalCount = query.__count;

                that.storageProvider._buildContinuationFunction(that, query);

                successResult = query.result;
            }

            var readyFn = function () {
                that._applyTransaction(callBack, callBack.success, [successResult], query.transaction, returnTransaction);

                /*if (returnTransaction === true) {
                    if (query.transaction)
                        callBack.success(successResult, query.transaction);
                    else {
                        that.beginTransaction(function (tran) {
                            callBack.success(successResult, tran);
                        });
                    }
                }
                else
                    callBack.success(successResult);*/
            };

            var i = 0;
            var sets = query.getEntitySets();

            var callbackFn = function () {
                var es = sets[i];
                if (es.afterRead) {
                    i++;
                    var r = es.afterRead.call(this, successResult, sets, query);
                    if (typeof r === 'function') {
                        r.call(this, i < sets.length ? callbackFn : readyFn, successResult, sets, query);
                    } else {
                        if (i < sets.length) {
                            callbackFn();
                        } else readyFn();
                    }
                } else readyFn();
            }

            if (sets.length) callbackFn();
            else readyFn();
        };

        clbWrapper.error = function () {
            if(returnTransaction)
                callBack.error.apply(this, arguments);
            else
                callBack.error.apply(this, Array.prototype.filter.call(arguments, function (p) { return !(p instanceof $data.Transaction); }));
        };
        var sets = query.getEntitySets();

        var authorizedFn = function () {
            var ex = true;
            var wait = false;
            var ctx = that;

            var readyFn = function (cancel) {
                if (cancel === false) ex = false;

                if (ex) {
                    if (query.transaction) {
                        if ($data.QueryCache && $data.QueryCache.isInCache(that, query)) {
                            $data.QueryCache.executeQuery(that, query, clbWrapper);
                        } else {
                            ctx.storageProvider.executeQuery(query, clbWrapper);
                        }
                    } else {
                        ctx.beginTransaction(function (tran) {
                            query.transaction = tran;
                            if ($data.QueryCache && $data.QueryCache.isInCache(that, query)) {
                                $data.QueryCache.executeQuery(that, query, clbWrapper);
                            } else {
                                ctx.storageProvider.executeQuery(query, clbWrapper);
                            }
                        });
                    }
                } else {
                    query.rawDataList = [];
                    query.result = [];
                    clbWrapper.success(query);
                }
            };

            var i = 0;
            var callbackFn = function (cancel) {
                if (cancel === false) ex = false;

                var es = sets[i];
                if (es.beforeRead) {
                    i++;
                    var r = es.beforeRead.call(this, sets, query);
                    if (typeof r === 'function') {
                        r.call(this, (i < sets.length && ex) ? callbackFn : readyFn, sets, query);
                    } else {
                        if (r === false) ex = false;

                        if (i < sets.length && ex) {
                            callbackFn();
                        } else readyFn();
                    }
                } else readyFn();
            };

            if (sets.length) callbackFn();
            else readyFn();
        };

        if (this.user && this.checkPermission) {
            this.checkPermission(query.expression.nodeType === $data.Expressions.ExpressionType.BatchDelete ? $data.Access.DeleteBatch : $data.Access.Read, this.user, sets, {
                success: authorizedFn,
                error: clbWrapper.error
            });
        } else authorizedFn();
    },
    saveChanges: function (callback, transaction) {
        /// <signature>
        ///     <summary>
        ///         Saves the changes made to the context.
        ///     </summary>
        ///     <param name="successCallback" type="Function">
        ///         <summary>Success callback</summary>
        ///         <param name="entityContext" type="$data.EntityContext">Current entityContext object</param>
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>
        ///         Saves the changes made to the context.
        ///     </summary>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>

        if ($data.QueryCache) {
            $data.QueryCache.reset(this);
        }

        var changedEntities = [];
        var trackedEntities = this.stateManager.trackedEntities;
        var pHandler = new $data.PromiseHandler();
        var clbWrapper = pHandler.createCallback(callback);
        var pHandlerResult = pHandler.getPromise();
        var returnTransaction = this._isReturnTransaction(transaction);

        var skipItems = [];
        while (trackedEntities.length > 0) {
            var additionalEntities = [];
            //trackedEntities.forEach(function (entityCachedItem) {
            for (var i = 0; i < trackedEntities.length; i++) {
                var entityCachedItem = trackedEntities[i];

                var sModel = this._storageModel.getStorageModel(entityCachedItem.data.getType());
                if (entityCachedItem.data.entityState == $data.EntityState.Unchanged) {
                    entityCachedItem.skipSave = true;
                    skipItems.push(entityCachedItem.data);
                } else {
                    if (entityCachedItem.data.entityState == $data.EntityState.Modified) {
                        if (entityCachedItem.data.changedProperties) {
                            var changeStoredProperty = entityCachedItem.data.changedProperties.some(function (p) {
                                var pMemDef = sModel.PhysicalType.memberDefinitions.getMember(p.name);
                                if (pMemDef.kind == $data.MemberTypes.navProperty) {
                                    var a = sModel.Associations[pMemDef.association];
                                    var multiplicity = a.FromMultiplicity + a.ToMultiplicity;
                                    return ((multiplicity == '*0..1') || (multiplicity == '0..11'))
                                }
                                return true;
                            });
                            if (!changeStoredProperty) {
                                entityCachedItem.skipSave = true;
                                skipItems.push(entityCachedItem.data);
                            }
                        }
                    }
                }

                //type before events with items
                this.processEntityTypeBeforeEventHandler(skipItems, entityCachedItem);

                var navigationProperties = [];
                var smPhyMemDefs = sModel.PhysicalType.memberDefinitions.asArray();
                for (var ism = 0; ism < smPhyMemDefs.length; ism++) {
                    var p = smPhyMemDefs[ism];
                    if (p.kind == $data.MemberTypes.navProperty)
                        navigationProperties.push(p);
                }
                //var navigationProperties = sModel.PhysicalType.memberDefinitions.asArray().filter(function (p) { return p.kind == $data.MemberTypes.navProperty; });
                //navigationProperties.forEach(function (navProp) {
                for (var j = 0; j < navigationProperties.length; j++) {
                    var navProp = navigationProperties[j];

                    var association = sModel.Associations[navProp.name]; //eg.:"Profile"
                    var name = navProp.name; //eg.: "Profile"
                    var navPropertyName = association.ToPropertyName; //eg.: User

                    var connectedDataList = [].concat(entityCachedItem.data[name]);
                    //connectedDataList.forEach(function (data) {
                    for (var k = 0; k < connectedDataList.length; k++) {
                        var data = connectedDataList[k];

                        if (data) {
                            var value = data[navPropertyName];
                            var associationType = association.FromMultiplicity + association.ToMultiplicity;
                            if (association.FromMultiplicity === '$$unbound') {
                                if (data instanceof $data.Array) {
                                    entityCachedItem.dependentOn = entityCachedItem.dependentOn || [];
                                    //data.forEach(function (dataItem) {
                                    for (var l = 0; l < data.length; l++) {
                                        var dataItem = data[l];

                                        if ((entityCachedItem.dependentOn.indexOf(data) < 0) && (data.skipSave !== true)) {
                                            entityCachedItem.dependentOn.push(data);
                                        }
                                    }
                                    //}, this);
                                } else {
                                    entityCachedItem.dependentOn = entityCachedItem.dependentOn || [];
                                    if ((entityCachedItem.dependentOn.indexOf(data) < 0) && (data.skipSave !== true)) {
                                        entityCachedItem.dependentOn.push(data);
                                    }
                                }
                            } else {
                                switch (associationType) {
                                    case "*0..1": //Array
                                        if (value) {
                                            if (value instanceof Array) {
                                                if (value.indexOf(entityCachedItem.data) == -1) {
                                                    value.push(entityCachedItem.data);
                                                    data.initData[navPropertyName] = value;
                                                    data._setPropertyChanged(association.ToType.getMemberDefinition(navPropertyName));
                                                }
                                            } else {
                                                if (typeof intellisense === 'undefined') {
                                                    Guard.raise("Item must be array or subtype of array");
                                                }
                                            }
                                        } else {
                                            data.initData[navPropertyName] = [entityCachedItem.data];
                                            data._setPropertyChanged(association.ToType.getMemberDefinition(navPropertyName));
                                        }
                                        break;
                                    default: //Item
                                        if (value) {
                                            if (value !== entityCachedItem.data) {
                                                if (typeof intellisense === 'undefined') {
                                                    Guard.raise("Integrity check error! Item assigned to another entity!");
                                                }
                                            }
                                        } else {
                                            data.initData[navPropertyName] = entityCachedItem.data; //set back reference for live object
                                            data._setPropertyChanged(association.ToType.getMemberDefinition(navPropertyName));
                                        }
                                        break;
                                }
                                switch (associationType) {
                                    case "*0..1":
                                    case "0..11":
                                        entityCachedItem.dependentOn = entityCachedItem.dependentOn || [];
                                        if ((entityCachedItem.dependentOn.indexOf(data) < 0) && (data.skipSave !== true)) {
                                            entityCachedItem.dependentOn.push(data);
                                        }
                                        break;
                                }
                            }
                            if (!data.entityState) {
                                if (data.storeToken === this.storeToken) {
                                    data.entityState = $data.EntityState.Modified;
                                } else {
                                    data.entityState = $data.EntityState.Added;
                                }
                            }
                            if (additionalEntities.indexOf(data) == -1) {
                                additionalEntities.push(data);
                            }
                        }
                    }
                    //}, this);
                }
                //}, this);
            }
            //}, this);

            //trackedEntities.forEach(function (entity) {
            for (var i = 0; i < trackedEntities.length; i++) {
                var entity = trackedEntities[i];

                if (entity.skipSave !== true) { changedEntities.push(entity); }
            }
            //});

            trackedEntities = [];
            //additionalEntities.forEach(function (item) {
            for (var i = 0; i < additionalEntities.length; i++) {
                var item = additionalEntities[i];

                if (!skipItems.some(function (entity) { return entity == item; })) {
                    if (!changedEntities.some(function (entity) { return entity.data == item; })) {
                        trackedEntities.push({ data: item, entitySet: this.getEntitySetFromElementType(item.getType().name) });
                    }
                }
            }
            //}, this);
        }


        //changedEntities.forEach(function (d) {
        for (var j = 0; j < changedEntities.length; j++) {
            var d = changedEntities[j];

            if (d.dependentOn) {
                var temp = [];
                for (var i = 0; i < d.dependentOn.length; i++) {
                    if (skipItems.indexOf(d.dependentOn[i]) < 0) {
                        temp.push(d.dependentOn[i]);
                    }
                }
                d.dependentOn = temp;
            }
        }
        //});
        skipItems = null;
        var ctx = this;
        if (changedEntities.length == 0) {
            this.stateManager.trackedEntities.length = 0;
            ctx._applyTransaction(clbWrapper, clbWrapper.success, [0], transaction, returnTransaction);

            /*if (returnTransaction) {
                clbWrapper.success(0, transaction);
            } else {
                clbWrapper.success(0);
            }*/
            return pHandlerResult;
        }

        //validate entities
        var errors = [];
        //changedEntities.forEach(function (entity) {
        for (var i = 0; i < changedEntities.length; i++) {
            var entity = changedEntities[i];

            if (entity.data.entityState === $data.EntityState.Added) {
                //entity.data.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
                for (var j = 0; j < entity.data.getType().memberDefinitions.getPublicMappedProperties().length; j++) {
                    var memDef = entity.data.getType().memberDefinitions.getPublicMappedProperties()[j];

                    var memDefType = Container.resolveType(memDef.type);
                    if (memDef.required && !memDef.computed && !entity.data[memDef.name] && !memDef.isDependentProperty) {
                        switch (memDefType) {
                            case $data.String:
                            case $data.Number:
                            case $data.Float:
                            case $data.Decimal:
                            case $data.Integer:
                            case $data.Int16:
                            case $data.Int32:
                            case $data.Int64:
                            case $data.Byte:
                            case $data.SByte:
                            case $data.Date:
                            case $data.Boolean:
                                entity.data[memDef.name] = Container.getDefault(memDef.dataType);
                                break;
                            default:
                                break;
                        }
                    }
                }
                //}, this);
            }
            if ((entity.data.entityState === $data.EntityState.Added || entity.data.entityState === $data.EntityState.Modified)
                && !entity.data.isValid()) {
                errors.push({ item: entity.data, errors: entity.data.ValidationErrors });
            }
        }
        //});
        if (errors.length > 0) {
            clbWrapper.error(errors);
            return pHandlerResult;
        }

        var access = $data.Access.None;

        var eventData = {};
        var sets = [];
        for (var i = 0; i < changedEntities.length; i++) {
            var it = changedEntities[i];
            var n = it.entitySet.elementType.name;
            if (sets.indexOf(it.entitySet) < 0) sets.push(it.entitySet);
            var es = this._entitySetReferences[n];
            if (es.beforeCreate || es.beforeUpdate || es.beforeDelete || (this.user && this.checkPermission)) {
                if (!eventData[n]) eventData[n] = {};

                switch (it.data.entityState) {
                    case $data.EntityState.Added:
                        access |= $data.Access.Create;
                        if (es.beforeCreate) {
                            if (!eventData[n].createAll) eventData[n].createAll = [];
                            eventData[n].createAll.push(it);
                        }
                        break;
                    case $data.EntityState.Modified:
                        access |= $data.Access.Update;
                        if (es.beforeUpdate) {
                            if (!eventData[n].modifyAll) eventData[n].modifyAll = [];
                            eventData[n].modifyAll.push(it);
                        }
                        break;
                    case $data.EntityState.Deleted:
                        access |= $data.Access.Delete;
                        if (es.beforeDelete) {
                            if (!eventData[n].deleteAll) eventData[n].deleteAll = [];
                            eventData[n].deleteAll.push(it);
                        }
                        break;
                }
            }
        }

        var readyFn = function (cancel) {
            if (cancel === false) {
                cancelEvent = 'async';
                changedEntities.length = 0;
            }

            if (changedEntities.length) {
                //console.log('changedEntities: ', changedEntities.map(function(it){ return it.data.initData; }));

                var innerCallback = {
                    success: function (tran) {
                        ctx._postProcessSavedItems(clbWrapper, changedEntities, tran, returnTransaction);
                    },
                    error: function () {
                        //TODO remove trans from args;
                        if (returnTransaction)
                            clbWrapper.error.apply(this, arguments);
                        else
                            clbWrapper.error.apply(this, Array.prototype.filter.call(arguments, function (p) { return !(p instanceof $data.Transaction); }));
                    }
                };

                if (transaction instanceof $data.Transaction){
                    ctx.storageProvider.saveChanges(innerCallback, changedEntities, transaction);
                } else {
                    ctx.beginTransaction(true, function (tran) {
                        ctx.storageProvider.saveChanges(innerCallback, changedEntities, tran);
                    });
                }
            } else if (cancelEvent) {
                clbWrapper.error(new Exception('Cancelled event in ' + cancelEvent, 'CancelEvent'));
            } else {
                ctx._applyTransaction(clbWrapper, clbWrapper.success, [0], transaction, returnTransaction);

                /*if(returnTransaction)
                    clbWrapper.success(0, transaction);
                else
                    clbWrapper.success(0);*/
            };

            /*else if (cancelEvent) clbWrapper.error(new $data.Exception('saveChanges cancelled from event [' + cancelEvent + ']'));
            else Guard.raise('No changed entities');*/
        };

        var cancelEvent;
        var ies = Object.getOwnPropertyNames(eventData);
        var i = 0;
        var cmd = ['beforeUpdate', 'beforeDelete', 'beforeCreate'];
        var cmdAll = {
            beforeCreate: 'createAll',
            beforeDelete: 'deleteAll',
            beforeUpdate: 'modifyAll'
        };

        var callbackFn = function (cancel) {
            if (cancel === false) {
                cancelEvent = 'async';
                changedEntities.length = 0;

                readyFn(cancel);
                return;
            }

            var es = ctx._entitySetReferences[ies[i]];
            var c = cmd.pop();
            var ed = eventData[ies[i]];
            var all = ed[cmdAll[c]];

            if (all) {
                var m = [];
                for (var im = 0; im < all.length; im++) {
                    m.push(all[im].data);
                }
                //var m = all.map(function(it){ return it.data; });
                if (!cmd.length) {
                    cmd = ['beforeUpdate', 'beforeDelete', 'beforeCreate'];
                    i++;
                }

                var r = es[c].call(ctx, m);
                if (typeof r === 'function') {
                    r.call(ctx, (i < ies.length && !cancelEvent) ? callbackFn : readyFn, m);
                } else if (r === false) {
                    cancelEvent = (es.name + '.' + c);
                    //all.forEach(function (it) {
                    for (var index = 0; index < all.length; index++) {
                        var it = all[index];

                        var ix = changedEntities.indexOf(it);
                        changedEntities.splice(ix, 1);
                    }
                    //});

                    readyFn();
                } else {
                    if (i < ies.length && !cancelEvent) callbackFn();
                    else readyFn();
                }
            } else {
                if (!cmd.length) {
                    cmd = ['beforeUpdate', 'beforeDelete', 'beforeCreate'];
                    i++;
                }

                if (i < ies.length && !cancelEvent) callbackFn();
                else readyFn();
            }
        };

        if (this.user && this.checkPermission) {
            this.checkPermission(access, this.user, sets, {
                success: function () {
                    if (i < ies.length) callbackFn();
                    else readyFn();
                },
                error: clbWrapper.error
            });
        } else {
            if (i < ies.length) callbackFn();
            else readyFn();
        }

        return pHandlerResult;
    },

    processEntityTypeBeforeEventHandler: function (skipItems, entityCachedItem) {
        if (!entityCachedItem.skipSave) {
            var entity = entityCachedItem.data;
            var entityType = entity.getType();
            var state = entity.entityState;

            switch (true) {
                case state === $data.EntityState.Added && entityType.onbeforeCreate instanceof $data.Event:
                    if (entityType.onbeforeCreate.fireCancelAble(entity) === false) {
                        entityCachedItem.skipSave = true;
                        skipItems.push(entity);
                    }
                    break;
                case state === $data.EntityState.Modified && entityType.onbeforeUpdate instanceof $data.Event:
                    if (entityType.onbeforeUpdate.fireCancelAble(entity) === false) {
                        entityCachedItem.skipSave = true;
                        skipItems.push(entity);
                    }
                    break;
                case state === $data.EntityState.Deleted && entityType.onbeforeDelete instanceof $data.Event:
                    if (entityType.onbeforeDelete.fireCancelAble(entity) === false) {
                        entityCachedItem.skipSave = true;
                        skipItems.push(entity);
                    }
                    break;
                default:
                    break;
            }
        }
    },
    processEntityTypeAfterEventHandler: function (entityCachedItem) {
        var entity = entityCachedItem.data;
        var entityType = entity.getType();
        var state = entity.entityState;

        switch (true) {
            case state === $data.EntityState.Added && entityType.onafterCreate instanceof $data.Event:
                entityType.onafterCreate.fire(entity);
                break;
            case state === $data.EntityState.Modified && entityType.onafterUpdate instanceof $data.Event:
                entityType.onafterUpdate.fire(entity);
                break;
            case state === $data.EntityState.Deleted && entityType.onafterDelete instanceof $data.Event:
                entityType.onafterDelete.fire(entity);
                break;
            default:
                break;
        }
    },

    bulkInsert: function (entitySet, fields, datas, callback) {
        var pHandler = new $data.PromiseHandler();
        callback = pHandler.createCallback(callback);
        if (typeof entitySet === 'string') {
            var currentEntitySet;

            for (var entitySetName in this._entitySetReferences) {
                var actualEntitySet = this._entitySetReferences[entitySetName];
                if (actualEntitySet.tableName === entitySet) {
                    currentEntitySet = actualEntitySet;
                    break;
                }
            }

            if (!currentEntitySet)
                currentEntitySet = this[entitySet];

            entitySet = currentEntitySet;
        }
        if (entitySet) {
            this.storageProvider.bulkInsert(entitySet, fields, datas, callback);
        } else {
            callback.error(new Exception('EntitySet not found'));
        }
        return pHandler.getPromise();
    },

    prepareRequest: function () { },
    _postProcessSavedItems: function (callBack, changedEntities, transaction, returnTransaction) {
        if (this.ChangeCollector && this.ChangeCollector instanceof $data.Notifications.ChangeCollectorBase)
            this.ChangeCollector.processChangedData(changedEntities);

        var eventData = {};
        var ctx = this;
        //changedEntities.forEach(function (entity) {
        for (var i = 0; i < changedEntities.length; i++) {
            var entity = changedEntities[i];

            if (!entity.data.storeToken)
                entity.data.storeToken = ctx.storeToken;

            //type after events with items
            this.processEntityTypeAfterEventHandler(entity);

            var oes = entity.data.entityState;

            entity.data.entityState = $data.EntityState.Unchanged;
            entity.data.changedProperties = [];
            entity.physicalData = undefined;

            var n = entity.entitySet.elementType.name;
            var es = ctx._entitySetReferences[n];


            var eventName = undefined;
            switch (oes) {
                case $data.EntityState.Added:
                    eventName = 'added';
                    break;
                case $data.EntityState.Deleted:
                    eventName = 'deleted';
                    break;
                case $data.EntityState.Modified:
                    eventName = 'updated';
                    break;
            }
            if (eventName) {
                this.raiseEvent(eventName, entity);
            }

            if (es.afterCreate || es.afterUpdate || es.afterDelete) {
                if (!eventData[n]) eventData[n] = {};

                switch (oes) {
                    case $data.EntityState.Added:
                        if (es.afterCreate) {
                            if (!eventData[n].createAll) eventData[n].createAll = [];
                            eventData[n].createAll.push(entity);
                        }
                        break;
                    case $data.EntityState.Modified:
                        if (es.afterUpdate) {
                            if (!eventData[n].modifyAll) eventData[n].modifyAll = [];
                            eventData[n].modifyAll.push(entity);
                        }
                        break;
                    case $data.EntityState.Deleted:
                        if (es.afterDelete) {
                            if (!eventData[n].deleteAll) eventData[n].deleteAll = [];
                            eventData[n].deleteAll.push(entity);
                        }
                        break;
                }
            }
        }
        //});

        var ies = Object.getOwnPropertyNames(eventData);
        var i = 0;
        var ctx = this;
        var cmd = ['afterUpdate', 'afterDelete', 'afterCreate'];
        var cmdAll = {
            afterCreate: 'createAll',
            afterDelete: 'deleteAll',
            afterUpdate: 'modifyAll'
        };

        var readyFn = function () {
            if (!ctx.trackChanges) {
                ctx.stateManager.reset();
            }

            ctx._applyTransaction(callBack, callBack.success, [changedEntities.length], transaction, returnTransaction);

            /*if (returnTransaction)
                callBack.success(changedEntities.length, transaction);
            else
                callBack.success(changedEntities.length);*/
        };

        var callbackFn = function () {
            var es = ctx._entitySetReferences[ies[i]];
            var c = cmd.pop();
            var ed = eventData[ies[i]];
            var all = ed[cmdAll[c]];
            if (all) {
                var m = [];
                for (var im = 0; im < all.length; im++) {
                    m.push(all[im].data);
                }
                //var m = all.map(function(it){ return it.data; });
                if (!cmd.length) {
                    cmd = ['afterUpdate', 'afterDelete', 'afterCreate'];
                    i++;
                }

                var r = es[c].call(ctx, m);
                if (typeof r === 'function') {
                    r.call(ctx, i < ies.length ? callbackFn : readyFn, m);
                } else {
                    if (i < ies.length) callbackFn();
                    else readyFn();
                }
            } else {
                if (!cmd.length) {
                    cmd = ['afterUpdate', 'afterDelete', 'afterCreate'];
                    i++;
                }

                if (i < ies.length) callbackFn();
                else readyFn();
            }
        };

        if (i < ies.length) callbackFn();
        else readyFn();
    },
    forEachEntitySet: function (fn, ctx) {
        /// <summary>
        ///     Iterates over the entity sets' of current EntityContext.
        /// </summary>
        /// <param name="fn" type="Function">
        ///     <param name="entitySet" type="$data.EntitySet" />
        /// </param>
        /// <param name="ctx">'this' argument for the 'fn' function.</param>
        for (var entitySetName in this._entitySetReferences) {
            var actualEntitySet = this._entitySetReferences[entitySetName];
            fn.call(ctx, actualEntitySet);
        }
    },

    loadItemProperty: function (entity, property, callback, transaction) {
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="String">Property name</param>
        ///     <param name="callback" type="Function">
        ///         <summary>C  allback function</summary>
        ///         <param name="propertyValue" />
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="String">Property name</param>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="MemberDefinition">Property definition</param>
        ///     <param name="callback" type="Function">
        ///         <summary>Callback function</summary>
        ///         <param name="propertyValue" />
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        /// <signature>
        ///     <summary>Loads a property of the entity through the storage provider.</summary>
        ///     <param name="entity" type="$data.Entity">Entity object</param>
        ///     <param name="property" type="MemberDefinition">Property definition</param>
        ///     <param name="callbacks" type="Object">
        ///         Success and error callbacks definition.
        ///         Example: [code]{ success: function(db) { .. }, error: function() { .. } }[/code]
        ///     </param>
        ///     <returns type="$.Deferred" />
        /// </signature>
        Guard.requireType('entity', entity, $data.Entity);

        var memberDefinition = typeof property === 'string' ? entity.getType().memberDefinitions.getMember(property) : property;
        var returnTransaction = this._isReturnTransaction(transaction);

        if (entity[memberDefinition.name] != undefined) {

            var pHandler = new $data.PromiseHandler();
            callBack = pHandler.createCallback(callback);
            this._applyTransaction(callback, callback.success, [entity[memberDefinition.name]], transaction, returnTransaction);
            /*if (returnTransaction)
                callback.success(entity[memberDefinition.name], transaction);
            else
                callback.success(entity[memberDefinition.name]);*/
                
            return pHandler.getPromise();
        }

        var isSingleSide = true;
        var storageModel = this._storageModel.getStorageModel(entity.getType().fullName);
        var elementType = Container.resolveType(memberDefinition.dataType);
        if (elementType === $data.Array || (elementType.isAssignableTo && elementType.isAssignableTo($data.EntitySet))) {
            elementType = Container.resolveType(memberDefinition.elementType);

            isSingleSide = false;

        } else {
            var associations;
            for (var i = 0; i < storageModel.Associations.length; i++) {
                var assoc = storageModel.Associations[i];
                if (assoc.FromPropertyName == memberDefinition.name) {
                    associations = assoc;
                    break;
                }
            }
            //var associations = storageModel.Associations.filter(function (assoc) { return assoc.FromPropertyName == memberDefinition.name; })[0];
            if (associations && associations.FromMultiplicity === "0..1" && associations.ToMultiplicity === "1")
                isSingleSide = false;
        }

        var keyProp = storageModel.LogicalType.memberDefinitions.getKeyProperties();
        if (isSingleSide === true) {
            //singleSide

            var filterFunc = "function (e) { return";
            var filterParams = {};
            //storageModel.LogicalType.memberDefinitions.getKeyProperties().forEach(function (memDefKey, index) {
            for (var index = 0; index < keyProp.length; index++) {
                var memDefKey = keyProp[index];

                if (index > 0)
                    filterFunc += ' &&';
                filterFunc += " e." + memDefKey.name + " == this.key" + index;
                filterParams['key' + index] = entity[memDefKey.name];
            }
            //});
            filterFunc += "; }"

            var entitySet = this.getEntitySetFromElementType(entity.getType());
            return entitySet
                .map('function (e) { return e.' + memberDefinition.name + ' }')
                .single(filterFunc, filterParams, callback, transaction);
        } else {
            //multipleSide

            var filterFunc = "function (e) { return"
            var filterParams = {};
            //storageModel.LogicalType.memberDefinitions.getKeyProperties().forEach(function (memDefKey, index) {
            for (var index = 0; index < keyProp.length; index++) {
                var memDefKey = keyProp[index];

                if (index > 0)
                    filterFunc += ' &&';
                filterFunc += " e." + memberDefinition.inverseProperty + "." + memDefKey.name + " == this.key" + index;
                filterParams['key' + index] = entity[memDefKey.name];
            }
            //});
            filterFunc += "; }"

            var entitySet = this.getEntitySetFromElementType(elementType);
            return entitySet
                .filter(filterFunc, filterParams)
                .toArray(callback, transaction);
        }

    },

    getTraceString: function (queryable) {
        /// <summary>
        /// Returns a trace string. Used for debugging purposes!
        /// </summary>
        /// <param name="queryable" type="$data.Queryable" />
        /// <returns>Trace string</returns>
        var query = new $data.Query(queryable.expression, queryable.defaultType, this);
        return this.storageProvider.getTraceString(query);
    },
    log: function (logInfo) {
        //noop as do nothing
    },

    resolveBinaryOperator: function (operator, expression, frameType) {
        return this.storageProvider.resolveBinaryOperator(operator, expression, frameType);
    },
    resolveUnaryOperator: function (operator, expression, frameType) {
        return this.storageProvider.resolveUnaryOperator(operator, expression, frameType);
    },
    resolveFieldOperation: function (operation, expression, frameType) {
        return this.storageProvider.resolveFieldOperation(operation, expression, frameType);
    },
    resolveSetOperations: function (operation, expression, frameType) {
        return this.storageProvider.resolveSetOperations(operation, expression, frameType);
    },
    resolveTypeOperations: function (operation, expression, frameType) {
        return this.storageProvider.resolveTypeOperations(operation, expression, frameType);
    },
    resolveContextOperations: function (operation, expression, frameType) {
        return this.storageProvider.resolveContextOperations(operation, expression, frameType);
    },

    _generateServiceOperationQueryable: function (functionName, returnEntitySet, arg, parameters) {
        if (typeof console !== 'undefined' && console.log)
            console.log('Obsolate: _generateServiceOperationQueryable, $data.EntityContext');

        var params = [];
        for (var i = 0; i < parameters.length; i++) {
            var obj = {};
            obj[parameters[i]] = Container.resolveType(Container.getTypeName(arg[i]));
            params.push(obj);
        }

        var tempOperation = $data.EntityContext.generateServiceOperation({ serviceName: functionName, returnType: $data.Queryable, elementType: this[returnEntitySet].elementType, params: params });
        return tempOperation.apply(this, arg);
    },
    attach: function (entity, mode) {
        /// <summary>
        ///     Attaches an entity to its matching entity set.
        /// </summary>
        /// <param name="entity" type="$data.Entity" />
        /// <returns type="$data.Entity">Returns the attached entity.</returns>

        if (entity instanceof $data.EntityWrapper) {
            entity = entity.getEntity();
        }
        var entitySet = this.getEntitySetFromElementType(entity.getType());
        return entitySet.attach(entity, mode);
    },
    attachOrGet: function (entity, mode) {
        /// <summary>
        ///     Attaches an entity to its matching entity set, or returns if it's already attached.
        /// </summary>
        /// <param name="entity" type="$data.Entity" />
        /// <returns type="$data.Entity">Returns the entity.</returns>

        if (entity instanceof $data.EntityWrapper) {
            entity = entity.getEntity();
        }
        var entitySet = this.getEntitySetFromElementType(entity.getType());
        return entitySet.attachOrGet(entity, mode);
    },

    addMany: function (entities) {
        /// <summary>
        ///     Adds several entities to their matching entity set.
        /// </summary>
        /// <param name="entity" type="Array" />
        /// <returns type="Array">Returns the added entities.</returns>
        var self = this;
        entities.forEach(function (entity) {
            self.add(entity);
        });
        return entities;
    },

    add: function (entity) {
        /// <summary>
        ///     Adds a new entity to its matching entity set.
        /// </summary>
        /// <param name="entity" type="$data.Entity" />
        /// <returns type="$data.Entity">Returns the added entity.</returns>

        if (entity instanceof $data.EntityWrapper) {
            entity = entity.getEntity();
        }
        var entitySet = this.getEntitySetFromElementType(entity.getType());
        return entitySet.add(entity);
    },
    remove: function (entity) {
        /// <summary>
        ///     Removes an entity from its matching entity set.
        /// </summary>
        /// <param name="entity" type="$data.Entity" />
        /// <returns type="$data.Entity">Returns the removed entity.</returns>

        if (entity instanceof $data.EntityWrapper) {
            entity = entity.getEntity();
        }
        var entitySet = this.getEntitySetFromElementType(entity.getType());
        return entitySet.remove(entity);
    },
    storeToken: { type: Object },

    getFieldUrl: function (entity, member, collection) {
        try {
            var entitySet = typeof collection === 'string' ? this[collection] : collection;
            var fieldName = typeof member === 'string' ? member : member.name;
            if (entity instanceof $data.Entity) {
                entitySet = this.getEntitySetFromElementType(entity.getType());
            } else if (!Object.isNullOrUndefined(entity) && entity.constructor !== $data.Object) { //just a single key
                var keyDef = entitySet.elementType.memberDefinitions.getKeyProperties()[0];
                var key = {};
                key[keyDef.name] = entity;
                entity = key;
            }

            //key object
            if (!(entity instanceof $data.Entity)) {
                entity = new entitySet.elementType(entity);
            }

            return this.storageProvider.getFieldUrl(entity, fieldName, entitySet);
        } catch (e) {}
        return '#';
    }
}, {
    inheritedTypeProcessor: function(type) {
        if (type.resolveForwardDeclarations) {
            type.resolveForwardDeclarations();
        }
    },
    generateServiceOperation: function (cfg) {

        var fn;
        if (cfg.serviceMethod) {
            var returnType = cfg.returnType ? Container.resolveType(cfg.returnType) : {};
            if (returnType.isAssignableTo && returnType.isAssignableTo($data.Queryable)) {
                fn = cfg.serviceMethod;
            } else {
                fn = function () {
                    var lastParam = arguments[arguments.length - 1];

                    var pHandler = new $data.PromiseHandler();
                    var cbWrapper;

                    var args = arguments;
                    if (typeof lastParam === 'function') {
                        cbWrapper = pHandler.createCallback(lastParam);
                        arguments[arguments.length - 1] = cbWrapper;
                    } else {
                        cbWrapper = pHandler.createCallback();
                        arguments.push(cbWrapper);
                    }

                    try {
                        var result = cfg.serviceMethod.apply(this, arguments);
                        if (result !== undefined)
                            cbWrapper.success(result);
                    } catch (e) {
                        cbWrapper.error(e);
                    }

                    return pHandler.getPromise();
                }
            }

        } else {
            fn = function () {
                var context = this;

                var boundItem;
                if (this instanceof $data.Entity) {
                    if (!cfg.method) {
                        cfg.method = 'POST';
                    }

                    if (this.context) {
                        context = this.context;
                    } else {
                        Guard.raise('entity not attached into context');
                        return;
                    }

                    boundItem = {
                        data: this,
                        entitySet: context.getEntitySetFromElementType(this.getType())
                    };
                }

                var virtualEntitySet = cfg.elementType ? context.getEntitySetFromElementType(Container.resolveType(cfg.elementType)) : null;

                var paramConstExpression = null;
                if (cfg.params) {
                    paramConstExpression = [];
                    for (var i = 0; i < cfg.params.length; i++) {
                        //TODO: check params type
                        for (var name in cfg.params[i]) {
                            paramConstExpression.push(Container.createConstantExpression(arguments[i], Container.resolveType(cfg.params[i][name]), name));
                        }
                    }
                }

                var ec = Container.createEntityContextExpression(context);
                var memberdef = (boundItem ? boundItem.data : context).getType().getMemberDefinition(cfg.serviceName);
                var es = Container.createServiceOperationExpression(ec,
                        Container.createMemberInfoExpression(memberdef),
                        paramConstExpression,
                        cfg,
                        boundItem);

                //Get callback function
                var clb = arguments[arguments.length - 1];
                if (typeof clb !== 'function') {
                    clb = undefined;
                }

                if (virtualEntitySet) {
                    var q = Container.createQueryable(virtualEntitySet, es);
                    if (clb) {
                        es.isTerminated = true;
                        return q._runQuery(clb);
                    }
                    return q;
                }
                else {
                    var returnType = cfg.returnType ? Container.resolveType(cfg.returnType) : null;

                    var q = Container.createQueryable(context, es);
                    q.defaultType = returnType || $data.Object;

                    if (returnType === $data.Queryable) {
                        q.defaultType = Container.resolveType(cfg.elementType);
                        if (clb) {
                            es.isTerminated = true;
                            return q._runQuery(clb);
                        }
                        return q;
                    }
                    es.isTerminated = true;
                    return q._runQuery(clb);
                }
            };
        };

        var params = [];
        if (cfg.params) {
            for (var i = 0; i < cfg.params.length; i++) {
                var param = cfg.params[i];
                for (var name in param) {
                    params.push({
                        name: name,
                        type: param[name]
                    });
                }
            }
        }
        $data.typeSystem.extend(fn, cfg, { params: params });

        return fn;
    },
    _convertLogicalTypeNameToPhysical: function (name) {
        return name + '_$db$';
    },
    _storageModelCache: {
        get: function () {
            if (!this.__storageModelCache)
                this.__storageModelCache = {};
            return this.__storageModelCache;
        },
        set: function () {
            //todo exception
        }
    }
});
