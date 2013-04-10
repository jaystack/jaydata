$data.Class.define('$data.ServiceOperation', null, null, {}, {
    translateDefinition: function (propertyDef, name, definedBy) {
        propertyDef.serviceName = name;
        var memDef = new $data.MemberDefinition(this.generateServiceOperation(propertyDef), this);
        memDef.name = name;
        return memDef;
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
                var memberdef;

                var boundItem;
                if (this instanceof $data.Entity || this instanceof $data.EntitySet) {
                    var entitySet;
                    if (this instanceof $data.Entity) {
                        if (this.context) {
                            context = this.context;
                            entitySet = context.getEntitySetFromElementType(this.getType());
                        } else if (this.storeToken && typeof this.storeToken.factory === 'function') {
                            context = this.storeToken.factory();
                            entitySet = context.getEntitySetFromElementType(this.getType());
                        } else {
                            Guard.raise(new Exception("entity can't resolve context", 'Not Found!', this));
                            return;
                        }
                    } else if (this instanceof $data.EntitySet) {
                        context = this.entityContext;
                        entitySet = this;

                        var esDef = context.getType().getMemberDefinition(entitySet.name);
                        memberdef = $data.MemberDefinition.translateDefinition(esDef.actions[cfg.serviceName], cfg.serviceName, entitySet.getType());
                    }


                    boundItem = {
                        data: this,
                        entitySet: entitySet
                    };
                }

                var virtualEntitySet = cfg.elementType ? context.getEntitySetFromElementType(Container.resolveType(cfg.elementType)) : null;

                var paramConstExpression = null;
                if (cfg.params) {
                    paramConstExpression = [];
                    //object as parameter
                    if (arguments[0] && typeof arguments[0] === 'object' && arguments[0].constructor === $data.Object && cfg.params && cfg.params[0] && cfg.params[0].name in arguments[0]) {
                        var argObj = arguments[0];
                        for (var i = 0; i < cfg.params.length; i++) {
                            var paramConfig = cfg.params[i];
                            if (paramConfig.name && paramConfig.type && paramConfig.name in argObj) {
                                paramConstExpression.push(Container.createConstantExpression(argObj[paramConfig.name], Container.resolveType(paramConfig.type), paramConfig.name));
                            }
                        }
                    }
                    //arg params
                    else {
                        for (var i = 0; i < cfg.params.length; i++) {
                            if (typeof arguments[i] == 'function') break;

                            //TODO: check params type
                            var paramConfig = cfg.params[i];
                            if (paramConfig.name && paramConfig.type && arguments[i] !== undefined) {
                                paramConstExpression.push(Container.createConstantExpression(arguments[i], Container.resolveType(paramConfig.type), paramConfig.name));
                            }
                        }
                    }
                }

                var ec = Container.createEntityContextExpression(context);
                if (!memberdef) {
                    if (boundItem && boundItem.data) {
                        memberdef = boundItem.data.getType().getMemberDefinition(cfg.serviceName);
                    } else {
                        memberdef = context.getType().getMemberDefinition(cfg.serviceName);
                    }
                }
                var es = Container.createServiceOperationExpression(ec,
                        Container.createMemberInfoExpression(memberdef),
                        paramConstExpression,
                        cfg,
                        boundItem);

                //Get callback function
                var clb = arguments[arguments.length - 1];
                if (!(typeof clb === 'function' || (typeof clb === 'object' /*&& clb.constructor === $data.Object*/ && (typeof clb.success === 'function' || typeof clb.error === 'function')))) {
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

        var params = cfg.params || [];
        $data.typeSystem.extend(fn, cfg, { params: params });

        return fn;
    }
});

$data.Class.define('$data.ServiceAction', $data.ServiceOperation, null, {}, {
    generateServiceOperation: function (cfg) {
        if (!cfg.method) {
            cfg.method = 'POST'; //default Action method is POST
        }

        return $data.ServiceOperation.generateServiceOperation.apply(this, arguments);
    }
});