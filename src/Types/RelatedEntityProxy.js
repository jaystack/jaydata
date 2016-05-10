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
    
    read: function (onResult) {
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);
        
        try {
            var proxyChains = this._chainToArray();
            var firstProxy = proxyChains[0];
            var context = firstProxy._context;
            if (!context) {
                var storeToken = firstProxy._parent instanceof $data.Entity ? firstProxy._parent.storeToken : firstProxy._type.storeToken;
                if (storeToken && typeof storeToken.factory === 'function') {
                    context = storeToken.factory();
                }
            }
            
            if (!context) throw new Exception('ContextNotExists');
            
            
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
                for (var j = 0; j < keys.length; j++) {
                    var keyProp = keys[j];
                    if (!(keyProp.name in item._entityKeyObject)) {
                        throw new Exception('Key value missing');
                    }
                    parameters.push(Container.createConstantExpression(item._entityKeyObject[keyProp.name], keyProp.type, keyProp.name));
                }
                
                
                var member = undefined;
                if (item._navigationProperty) {
                    member = Container.createMemberInfoExpression(item._navigationProperty)
                    returnType = item._navigationProperty.elementType;
                }
                expression = Container.createFindExpression(expression, parameters, member);
            }
            
            var preparator = Container.createQueryExpressionCreator(context);
            expression = preparator.Visit(expression);
            //context.log({ event: "EntityExpression", data: expression });
            
            var queryable = Container.createQueryable(entitySet , expression);
            queryable.defaultType = returnType || queryable.defaultType;
            context.executeQuery(queryable, cbWrapper);

        } catch (e) {
            cbWrapper.error(e);
        }
        
        return pHandler.getPromise();
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
