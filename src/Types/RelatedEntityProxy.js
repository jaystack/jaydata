import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

$data.Class.define("$data.RelatedEntityProxy", null, null, {
    constructor: function (entityKeyObject, navigationProperty, type, parent, context) {
        this._entityKeyObject = entityKeyObject;
        this._navigationProperty = navigationProperty;
        this._type = type;
        this._parent = parent;
        this._context = context;
    },
    _entityKeyObject: { type: $data.Object },
    _ctxFactory: {},
    _type: {},
    _navigationProperty: { type: $data.String },
    _parent: { type: '$data.RelatedEntityProxy' },
    _context: { type: '$data.EntityContext' },

    _getContext: function(proxyChains){
        proxyChains = proxyChains || this._chainToArray();
        var firstProxy = proxyChains[0];
        var context = firstProxy._context;
        if (!context) {
            var storeToken = firstProxy._parent instanceof $data.Entity ? firstProxy._parent.storeToken : firstProxy._type.storeToken;
            if (storeToken && typeof storeToken.factory === 'function') {
                context = storeToken.factory();
            }
        }

        if (!context) throw new Exception('ContextNotExists');
        return context;
    },
    _createQueryable: function(){
        var proxyChains = this._chainToArray();
        var firstProxy = proxyChains[0];
        var context = this._getContext(proxyChains);

        var entitySet = null;
        var expression = null;
        if (firstProxy._parent instanceof $data.Entity) {
            entitySet = context.getEntitySetFromElementType(firstProxy._parent.getType());

            var proxyClass = context._createRelatedEntityProxyClass(entitySet.elementType);
            proxyChains.unshift(new proxyClass(firstProxy._parent, undefined, entitySet.elementType));
        } else {
            entitySet = context.getEntitySetFromElementType(firstProxy._type);
        }

        expression = entitySet.expression;
        var returnType = null;

        for (var i = 0; i < proxyChains.length; i++) {
            var item = proxyChains[i];
            var keys = item._type.memberDefinitions.getKeyProperties();

            var parameters = [];
            var missingKeyCount = 0;
            for (var j = 0; j < keys.length; j++) {
                var keyProp = keys[j];
                if (!(keyProp.name in item._entityKeyObject) || typeof item._entityKeyObject[keyProp.name] == 'undefined') {
                    missingKeyCount++;
                }else parameters.push(Container.createConstantExpression(item._entityKeyObject[keyProp.name], keyProp.type, keyProp.name));
            }
            if (missingKeyCount > 0 && missingKeyCount < keys.length){
                throw new Exception('Key value missing');
            }

            var member = undefined;
            if (item._navigationProperty) {
                member = Container.createMemberInfoExpression(item._navigationProperty);
                returnType = item._navigationProperty.elementType;
            }
            if (missingKeyCount == 0){
                expression = Container.createFindExpression(expression, parameters, member);
                this._lastEntityKeys = item._entityKeyObject;
            }else{
                expression = Container.createEntitySetExpression(expression, member, null, context.getEntitySetFromElementType(returnType));
                expression = Container.createToArrayExpression(expression);
                this._lastEntityKeys = null;
            }
        }

        var preparator = Container.createQueryExpressionCreator(context);
        expression = preparator.Visit(expression);
        //context.log({ event: "EntityExpression", data: expression });

        var queryable = Container.createQueryable(entitySet, expression);
        queryable.defaultType = returnType || queryable.defaultType;

        return queryable;
    },
    _save: function(entity, method, onResult){
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);
        
        try {
            var queryable = this._createQueryable();
            var context = queryable.entityContext;
            var returnType = queryable.defaultType;
            if (entity instanceof $data.Entity){
                queryable.defaultType = returnType = entity.getType();
            }
            var odataContext = queryable.toTraceString().queryText;

            var originalEntity = entity;
            var originalInitData = entity.initData || entity;
            entity = new returnType();
            entity["@odata.context"] = odataContext;
            if (entity.getType().inheritsFrom != $data.Entity){
                entity["@odata.type"] = '#' + returnType.fullName;
            }
            /*if (this._lastEntityKeys){
                for (var key in this._lastEntityKeys){
                    entity[key] = this._lastEntityKeys[key];
                }
            }*/
            //console.log(entity);

            if (method == 'update'){
                context.attach(entity);
                for (var prop in originalInitData){
                    entity[prop] = originalInitData[prop];
                }
            }else if (method == 'create'){
                /*for (var prop in originalEntity){
                    entity[prop] = originalEntity[prop];
                }*/
                context.add(originalEntity);
            }else if (method == 'delete'){
                context.remove(entity);
            }
            context.saveChanges(cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },
    create: function(entity, onResult){
        return this._save(entity, 'create', onResult);
    },
    read: function read(onResult) {
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        try {
            this._getContext().executeQuery(this._createQueryable(), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }
        
        return pHandler.getPromise();
    },
    update: function(entity, onResult){
        this._save(entity, 'update', onResult);
    },
    delete: function(entity, onResult){
        if (typeof entity == 'function') onResult = entity;
        return this._save({}, 'delete', onResult);
    },
    _chainToArray: function (result) {
        result = result || [];
        if (this._parent instanceof $data.RelatedEntityProxy) {
            this._parent._chainToArray(result);
        }
        
        result.push(this);
        return result;
    }
}, {});

export default $data
