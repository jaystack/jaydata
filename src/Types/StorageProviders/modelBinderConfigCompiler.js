import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

$C('$data.modelBinder.FindProjectionVisitor', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function(includes){
        this._includes = includes;
    },
    VisitProjectionExpression: function (expression, context) {
        this.projectionExpression = this.projectionExpression || expression;
        context && (context.projectionExpression = context.projectionExpression || expression);
        this.Visit(expression.source, context)
    },
    VisitIncludeExpression: function (expression, context) {
        this.Visit(expression.source, context)
        if(!(expression.selector instanceof $data.Expressions.ConstantExpression)) {
            var selectorContext = {};
            this.Visit(expression.selector.expression, selectorContext);
            
            if(selectorContext.hasIncludeProjectionExpression){
                var include = this._includes.filter(function(it){ return it.name === selectorContext.includePath; })[0];
                if(include){
                    include.projectionExpression = selectorContext.includeProjectionExpression
                }
                
                context && (context.hasIncludeProjectionExpression = true);
            }
        }
    },
    VisitFrameOperationExpression: function(expression, context){
        this.Visit(expression.source, context);
        
        var opDef = expression.operation.memberDefinition;
        if(opDef && opDef.frameType === $data.Expressions.ProjectionExpression){
            var paramCounter = 0;
            var params = opDef.parameters || [{ name: "@expression" }];
            
            var args = params.map(function (item, index) {
                if (item.name === "@expression") {
                    return expression.source;
                } else {
                    return expression.parameters[paramCounter++]
                };
            });
            
            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                
                if (arg instanceof $data.Expressions.ConstantExpression && arg.value instanceof $data.Queryable) {
                    var preparator = Container.createQueryExpressionCreator(arg.value.entityContext);
                    arg = preparator.Visit(arg.value.expression);
                    
                }
                
                var visitor = new $data.modelBinder.FindProjectionVisitor(this._inculdes);
                var visitorContext = { };
                var compiled = visitor.Visit(arg, visitorContext);
                
                if(context && visitorContext.projectionExpression){
                    context.hasIncludeProjectionExpression = true;
                    context.includeProjectionExpression = visitorContext.projectionExpression;
                }
            }
        }
    },
    VisitAssociationInfoExpression: function (expression, context) {
        var propName = expression.associationInfo.FromPropertyName;
        
        if(context) {
            context.includePath = context.includePath ? (context.includePath + '.') : "";
            context.includePath += propName;
        }
    }
});

$C('$data.modelBinder.ModelBinderConfigCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (query, includes, oDataProvider) {
        this._query = query;
        this._includes = includes;
        this._isoDataProvider = oDataProvider || false;
        this.depth = [];
    },
    VisitSingleExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitSomeExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitFindExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitEveryExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitToArrayExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitFirstExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitForEachExpression: function (expression) {
        this._defaultModelBinder(expression);
    },
    VisitServiceOperationExpression: function (expression) {
        if (expression.cfg.returnType) {
            var returnType = Container.resolveType(expression.cfg.returnType);
            if ((typeof returnType.isAssignableTo === 'function' && returnType.isAssignableTo($data.Queryable)) || returnType === $data.Array) {
                this._defaultModelBinder(expression);
            } else {
                var builder = Container.createqueryBuilder();
                builder.modelBinderConfig['$type'] = returnType;
                if (typeof returnType.isAssignableTo === 'function' && returnType.isAssignableTo($data.Entity)) {
                    builder.modelBinderConfig['$selector'] = ['json:' + expression.cfg.serviceName];
                } else {
                    builder.modelBinderConfig['$type'] = returnType;
                    builder.modelBinderConfig['$value'] = function (a, v) {
                        return (expression.cfg.serviceName in v) ? v[expression.cfg.serviceName] : v.value;
                    }
                }
                this.VisitExpression(expression, builder);
                builder.resetModelBinderProperty();
                this._query.modelBinderConfig = builder.modelBinderConfig;
            }
        }
    },
    VisitCountExpression: function (expression) {
        var builder = Container.createqueryBuilder();

        builder.modelBinderConfig['$type'] = $data.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = $data.Integer;
        builder.modelBinderConfig['$source'] = 'cnt';
        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    VisitBatchDeleteExpression: function (expression) {
        var builder = Container.createqueryBuilder();

        builder.modelBinderConfig['$type'] = $data.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = $data.Integer;
        builder.modelBinderConfig['$source'] = 'cnt';
        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    VisitConstantExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = expression.type;
        builder.modelBinderConfig['$value'] = expression.value;
    },

    VisitExpression: function (expression, builder) {
        var projVisitor = Container.createFindProjectionVisitor(this._includes);
        var projContext = {};
        projVisitor.Visit(expression, projContext);

        if (projContext.projectionExpression) {
            this.Visit(projContext.projectionExpression, builder);
        } else {
            this.DefaultSelection(builder, this._query.defaultType, this._includes, projContext.hasIncludeProjectionExpression);
        }
    },
    _defaultModelBinder: function (expression) {
        var builder = Container.createqueryBuilder();
        builder.modelBinderConfig['$type'] = $data.Array;
        if (this._isoDataProvider) {
            builder.modelBinderConfig['$selector'] = ['json:d.results', 'json:d', 'json:results', 'json:value'];
        }
        builder.modelBinderConfig['$item'] = {};
        builder.selectModelBinderProperty('$item');

        this.VisitExpression(expression, builder);

        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    _inheritanceMemberDefinitions: function(type, memdefs){
        var self = this;
        if (type.inheritedTo){
            type.inheritedTo.forEach(function(it){
                memdefs = self._inheritanceMemberDefinitions(it, memdefs.concat(it.memberDefinitions.getPublicMappedProperties()));
            });
        }
        return memdefs;
    },
    _addPropertyToModelBinderConfig: function (elementType, builder) {
        var storageModel = this._query.context._storageModel.getStorageModel(elementType);
        if (elementType.memberDefinitions) {
            var memberDefinitions = this._inheritanceMemberDefinitions(elementType, elementType.memberDefinitions.getPublicMappedProperties());
            memberDefinitions.forEach(function (prop) {
                if ((!storageModel) || (storageModel && !storageModel.Associations[prop.name] && !storageModel.ComplexTypes[prop.name])) {

                    var type = Container.resolveType(prop.dataType);
                    if (!storageModel && this._query.context.storageProvider.supportedDataTypes.indexOf(type) < 0) {
                        //complex type
                        builder.selectModelBinderProperty(prop.name);
                        builder.modelBinderConfig['$type'] = type;
                        if (this._isoDataProvider) {
                            builder.modelBinderConfig['$selector'] = ['json:' + prop.name + '.results', 'json:' + prop.name];
                        } else {
                            builder.modelBinderConfig['$selector'] = 'json:' + prop.name;
                        }
                        this._addPropertyToModelBinderConfig(type, builder);
                        builder.popModelBinderProperty();
                    } else {
                        if (prop.key) {
                            builder.addKeyField(prop.name);
                        }
                        if (prop.concurrencyMode === $data.ConcurrencyMode.Fixed) {
                            builder.modelBinderConfig[prop.name] = { $source: '@odata.etag' }
                        } else if (type === $data.Array && prop.elementType) {
                            builder.selectModelBinderProperty(prop.name);
                            builder.modelBinderConfig['$type'] = type;
                            if (this._isoDataProvider) {
                                builder.modelBinderConfig['$selector'] = ['json:' + prop.name + '.results', 'json:' + prop.name];
                            } else {
                                builder.modelBinderConfig['$selector'] = 'json:' + prop.name;
                            }
                            builder.selectModelBinderProperty('$item');
                            var arrayElementType = Container.resolveType(prop.elementType);
                            builder.modelBinderConfig['$type'] = arrayElementType;
                            this._addPropertyToModelBinderConfig(arrayElementType, builder);
                            builder.popModelBinderProperty();
                            builder.popModelBinderProperty();
                        } else {
                            builder.modelBinderConfig[prop.name] = {
                                $source: prop.name,
                                $type: prop.type
                            };
                        }
                    }
                }
            }, this);
        } else {
            /*builder._binderConfig = {
                $selector: ['json:results'],
                $type: $data.Array,
                $item:{
                    $type: elementType,
                    $value: function (meta, data) { return data; }
                }
            }*/
            if (builder._binderConfig.$type === $data.Array) {
                builder._binderConfig.$item = builder._binderConfig.$item || {};
                builder.modelBinderConfig = builder._binderConfig.$item;
            }


        }
        if (storageModel) {
            this._addComplexTypeProperties(storageModel.ComplexTypes, builder);
        }
    },
    _addComplexTypeProperties: function (complexTypes, builder) {
        complexTypes.forEach(function (ct) {
            if (ct.ToType !== $data.Array){
                builder.selectModelBinderProperty(ct.FromPropertyName);
                builder.modelBinderConfig['$type'] = ct.ToType;
                if (this._isoDataProvider) {
                    builder.modelBinderConfig['$selector'] = ['json:' + ct.FromPropertyName + '.results', 'json:' + ct.FromPropertyName];
                } else {
                    builder.modelBinderConfig['$selector'] = 'json:' + ct.FromPropertyName;
                }
                this._addPropertyToModelBinderConfig(ct.ToType, builder);

                builder.popModelBinderProperty();
            }else{
                var dt = ct.ToType;
                var et = Container.resolveType(ct.FromType.memberDefinitions.getMember(ct.FromPropertyName).elementType);
                if (dt === $data.Array && et && et.isAssignableTo && et.isAssignableTo($data.Entity)){
                    var config = {
                        $type: $data.Array,
                        $selector: 'json:' + ct.FromPropertyName,
                        $item: {
                            $type: et
                        }
                    };
                    var md = et.memberDefinitions.getPublicMappedProperties();
                    for (var i = 0; i < md.length; i++){
                        config.$item[md[i].name] = { $type: md[i].type, $source: md[i].name };
                    }
                    builder.modelBinderConfig[ct.FromPropertyName] = config;
                }else{
                    builder.modelBinderConfig[ct.FromPropertyName] = {
                        $type: ct.ToType,
                        $source: ct.FromPropertyName
                    };
                }
            }
        }, this);
    },
    DefaultSelection: function (builder, type, allIncludes, custom) {
        //no projection, get all item from entitySet
        builder.modelBinderConfig['$type'] = custom ? $data.Object : type;

        var storageModel = this._query.context._storageModel.getStorageModel(type);
        this._addPropertyToModelBinderConfig(type, builder);
        if (allIncludes) {
            let excludeDeepInclude = [];
            allIncludes.forEach(function (include) {
                if(excludeDeepInclude.some(function(incName){ return include.name.length > incName.length && include.name.substr(0, incName.length) === incName })) {
                    return;
                }
                this.depth.push(include.name);
                
                var includes = include.name.split('/').pop().split('.');
                var association = null;
                var tmpStorageModel = storageModel;
                var itemCount = 0;
                for (var i = 0; i < includes.length; i++) {
                    if (builder.modelBinderConfig.$item) {
                        builder.selectModelBinderProperty('$item');
                        itemCount++;
                    }
                    builder.selectModelBinderProperty(includes[i]);
                    association = tmpStorageModel.Associations[includes[i]];
                    tmpStorageModel = this._query.context._storageModel.getStorageModel(association.ToType);
                }
                if (this._isoDataProvider) {
                    builder.modelBinderConfig['$selector'] = ['json:' + includes[includes.length - 1] + '.results', 'json:' + includes[includes.length - 1]];
                } else {
                    builder.modelBinderConfig['$selector'] = 'json:' + includes[includes.length - 1];
                }
                if (association.ToMultiplicity === '*') {
                    builder.modelBinderConfig['$type'] = $data.Array;
                    builder.selectModelBinderProperty('$item');
                    builder.modelBinderConfig['$type'] = include.type;
                    if(include.projectionExpression){
                        excludeDeepInclude.push(include.name);
                        this.Visit(include.projectionExpression, builder);
                    } else {
                        this._addPropertyToModelBinderConfig(include.type, builder);
                    }
                    builder.popModelBinderProperty();
                } else {
                    builder.modelBinderConfig['$type'] = include.type;
                    if(include.projectionExpression){
                        excludeDeepInclude.push(include.name);
                        this.Visit(include.projectionExpression, builder);
                    } else {
                        this._addPropertyToModelBinderConfig(include.type, builder);
                    }
                }

                for (var i = 0; i < includes.length + itemCount; i++) {
                    builder.popModelBinderProperty();
                }
                this.depth.pop();
            }, this);
        }
    },
    VisitProjectionExpression: function (expression, builder) {
        this.hasProjection = true;
        this.Visit(expression.selector, builder);

        if (expression.selector && expression.selector.expression instanceof $data.Expressions.ObjectLiteralExpression) {
            builder.modelBinderConfig['$type'] = expression.projectionAs || builder.modelBinderConfig['$type'] || $data.Object;
        }
    },
    VisitParametricQueryExpression: function (expression, builder) {
        if (expression.expression instanceof $data.Expressions.EntityExpression || expression.expression instanceof $data.Expressions.EntitySetExpression) {
            this.VisitEntityAsProjection(expression, builder);
        } else {
            this.Visit(expression.expression, builder);
        }

    },
    VisitEntityAsProjection: function (expression, builder) {
        this.mapping = '';
        this.Visit(expression.expression, builder);
        this.depth.push(this.mapping);
        this.mapping = this.depth.join('.');
        
        var includes;
        var currentInclude;
        if (this.mapping && this._includes instanceof Array) {
            includes = this._includes.filter(function (inc) {
                return inc.name.indexOf(this.mapping + '.') === 0
            }, this);
            includes = includes.map(function (inc) {
                return { name: inc.name.replace(this.mapping + '.', ''), type: inc.type };
            }, this);

            // if (includes.length > 0){
            //     this.DefaultSelection(builder, expression.expression.entityType, includes);
            //     //console.warn('WARN: include for mapped properties is not supported!');
            // }
            
            currentInclude = this._includes.filter(function (inc) {
                return inc.name === this.mapping;
            }, this)[0];
        }
        
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            if(currentInclude && currentInclude.projectionExpression){
                let tmpIncludes = this._includes;
                this._includes = includes;
                let tmpDepth = this.depth;
                this.depth = [];
                this.Visit(currentInclude.projectionExpression, builder);
                this._includes = tmpIncludes;
                this.depth = tmpDepth;
            } else {
                this.DefaultSelection(builder, expression.expression.entityType, includes)
            }
        } else if (expression.expression instanceof $data.Expressions.EntitySetExpression) {
            builder.modelBinderConfig.$type = $data.Array;
            builder.modelBinderConfig.$item = {};
            builder.selectModelBinderProperty('$item');
            if(currentInclude && currentInclude.projectionExpression){
                let tmpIncludes = this._includes;
                this._includes = includes;
                let tmpDepth = this.depth;
                this.depth = [];
                this.Visit(currentInclude.projectionExpression, builder);
                this._includes = tmpIncludes;
                this.depth = tmpDepth;
            } else {
                this.DefaultSelection(builder, expression.expression.elementType, includes)
            }
            builder.popModelBinderProperty();
        }
        this.depth.pop();
    },

    VisitEntityFieldExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);
    },
    VisitMemberInfoExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = expression.memberDefinition.type;
        if (expression.memberDefinition.storageModel && expression.memberName in expression.memberDefinition.storageModel.ComplexTypes) {
            this._addPropertyToModelBinderConfig(Container.resolveType(expression.memberDefinition.type), builder);
        } else {
            if (!(builder.modelBinderConfig.$type && Container.resolveType(builder.modelBinderConfig.$type).isAssignableTo && Container.resolveType(builder.modelBinderConfig.$type).isAssignableTo($data.Entity)))
                builder.modelBinderConfig['$source'] = expression.memberName;
        }
    },
    VisitEntitySetExpression: function (expression, builder) {
        if (expression.source instanceof $data.Expressions.EntityExpression) {
            this.Visit(expression.source, builder);
            this.Visit(expression.selector, builder);
        }

    },
    VisitComplexTypeExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);


        if (('$selector' in builder.modelBinderConfig) && (builder.modelBinderConfig.$selector.length > 0)) {
            if (builder.modelBinderConfig.$selector instanceof $data.Array) {
                var temp = builder.modelBinderConfig.$selector[1];
                builder.modelBinderConfig.$selector[0] = temp + '.' + expression.selector.memberName + '.results';
                builder.modelBinderConfig.$selector[1] = temp + '.' + expression.selector.memberName;
            } else {
                builder.modelBinderConfig.$selector += '.' + expression.selector.memberName;
            }

        } else {
            if (this._isoDataProvider) {
                builder.modelBinderConfig['$selector'] = ['json:' + expression.selector.memberName + '.results', 'json:' + expression.selector.memberName];
            } else {
                builder.modelBinderConfig['$selector'] = 'json:' + expression.selector.memberName;
            }
        }
    },
    VisitEntityExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
    },
    VisitAssociationInfoExpression: function (expression, builder) {
        if (('$selector' in builder.modelBinderConfig) && (builder.modelBinderConfig.$selector.length > 0)) {
            if (builder.modelBinderConfig.$selector instanceof $data.Array) {
                var temp = builder.modelBinderConfig.$selector[1];
                builder.modelBinderConfig.$selector[0] = temp + '.' + expression.associationInfo.FromPropertyName + '.results';
                builder.modelBinderConfig.$selector[1] = temp + '.' + expression.associationInfo.FromPropertyName;
            } else {
                builder.modelBinderConfig.$selector += '.' + expression.associationInfo.FromPropertyName;
            }

        } else {
            if (this._isoDataProvider) {
                builder.modelBinderConfig['$selector'] = ['json:' + expression.associationInfo.FromPropertyName + '.results', 'json:' + expression.associationInfo.FromPropertyName];
            } else {
                builder.modelBinderConfig['$selector'] = 'json:' + expression.associationInfo.FromPropertyName;
            }
        }

        if (this.mapping && this.mapping.length > 0) { this.mapping += '.'; }
        this.mapping += expression.associationInfo.FromPropertyName;
    },
    VisitObjectLiteralExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = $data.Object;
        expression.members.forEach(function (of) {
            this.Visit(of, builder);
        }, this);
    },
    VisitObjectFieldExpression: function (expression, builder) {
        builder.selectModelBinderProperty(expression.fieldName);
        if (expression.expression instanceof $data.Expressions.EntityExpression || expression.expression instanceof $data.Expressions.EntitySetExpression) {
            this.VisitEntityAsProjection(expression, builder);
        } else {
            this.Visit(expression.expression, builder);
        }
        builder.popModelBinderProperty();
    }
});

export default $data
