
$C('$data.modelBinder.FindProjectionVisitor', $data.Expressions.EntityExpressionVisitor, null, {
    VisitProjectionExpression: function (expression) {
        this.projectionExpression = expression;
    }
});

$C('$data.modelBinder.ModelBinderConfigCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (query, includes, oDataProvider) {
        this._query = query;
        this._includes = includes;
        this._isoDataProvider = oDataProvider || false;
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
        var projVisitor = Container.createFindProjectionVisitor();
        projVisitor.Visit(expression);

        if (projVisitor.projectionExpression) {
            this.Visit(projVisitor.projectionExpression, builder);
        } else {
            this.DefaultSelection(builder, this._query.defaultType, this._includes);
        }
    },
    _defaultModelBinder: function (expression) {
        var builder = Container.createqueryBuilder();
        builder.modelBinderConfig['$type'] = $data.Array;
        if (this._isoDataProvider) {
            builder.modelBinderConfig['$selector'] = ['json:d.results', 'json:d', 'json:results'];
        }
        builder.modelBinderConfig['$item'] = {};
        builder.selectModelBinderProperty('$item');

        this.VisitExpression(expression, builder);

        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    _addPropertyToModelBinderConfig: function (elementType, builder) {
        var storageModel = this._query.context._storageModel.getStorageModel(elementType);
        if (elementType.memberDefinitions) {
            elementType.memberDefinitions.getPublicMappedProperties().forEach(function (prop) {
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
                            builder.modelBinderConfig[prop.name] = { $selector: 'json:__metadata', $source: 'etag' }
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
                            builder.modelBinderConfig[prop.name] = prop.name;
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
            builder._binderConfig.$item = builder._binderConfig.$item || {};
            builder.modelBinderConfig = builder._binderConfig.$item;


            
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
                    config = {
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
    DefaultSelection: function (builder, type, allIncludes) {
        //no projection, get all item from entitySet
        builder.modelBinderConfig['$type'] = type;

        var storageModel = this._query.context._storageModel.getStorageModel(type);
        this._addPropertyToModelBinderConfig(type, builder);
        if (allIncludes) {
            allIncludes.forEach(function (include) {
                var includes = include.name.split('.');
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
                    this._addPropertyToModelBinderConfig(include.type, builder);
                    builder.popModelBinderProperty();
                } else {
                    builder.modelBinderConfig['$type'] = include.type;
                    this._addPropertyToModelBinderConfig(include.type, builder);
                }

                for (var i = 0; i < includes.length + itemCount; i++) {
                    builder.popModelBinderProperty();
                }
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
        var includes;
        if (this.mapping && this._includes instanceof Array) {
            includes = this._includes.filter(function (inc) {
                return inc.name.indexOf(this.mapping + '.') === 0
            }, this);
            includes = includes.map(function (inc) {
                return { name: inc.name.replace(this.mapping + '.', ''), type: inc.type };
            }, this);

            if (includes.length > 0){
                this.DefaultSelection(builder, expression.expression.entityType, includes);
                //console.warn('WARN: include for mapped properties is not supported!');
            }
        }

        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.DefaultSelection(builder, expression.expression.entityType/*, includes*/)
        } else if (expression.expression instanceof $data.Expressions.EntitySetExpression) {
            builder.modelBinderConfig.$type = $data.Array;
            builder.modelBinderConfig.$item = {};
            builder.selectModelBinderProperty('$item');
            this.DefaultSelection(builder, expression.expression.elementType /*, includes*/)
            builder.popModelBinderProperty();
        }

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
