$C('$data.sqLite.sqLite_ModelBinderCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (query, context) {
        this._query = query;
        this.sqlContext = context;
        this._sqlBuilder = $data.sqLite.SqlBuilder.create(context.sets, context.entityContext);
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
    VisitCountExpression: function (expression) {
        var builder = Container.createqueryBuilder();
        
        builder.modelBinderConfig['$type'] = $data.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = $data.Integer;
        builder.modelBinderConfig['$source'] = 'cnt';
        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },

    VisitExpression: function (expression, builder) {
        var projVisitor = Container.createFindProjectionVisitor();
        projVisitor.Visit(expression);

        if (projVisitor.projectionExpression) {
            this.Visit(projVisitor.projectionExpression, builder);
        } else {
            this.DefaultSelection(builder);
        }
    },
    _defaultModelBinder: function (expression) {
        var builder = Container.createqueryBuilder();
        builder.modelBinderConfig['$type'] = $data.Array;
        builder.modelBinderConfig['$item'] = {};
        builder.selectModelBinderProperty('$item');

        this.VisitExpression(expression, builder);

        builder.resetModelBinderProperty();
        this._query.modelBinderConfig = builder.modelBinderConfig;
    },
    _addPropertyToModelBinderConfig: function (elementType, builder) {
        var storageModel = this._query.context._storageModel.getStorageModel(elementType);
        elementType.memberDefinitions.getPublicMappedProperties().forEach(function (prop) {
            if ((!storageModel) || (storageModel && !storageModel.Associations[prop.name] && !storageModel.ComplexTypes[prop.name])) {
                if (prop.key) {
                    if (this.currentObjectFieldName) {
                        builder.addKeyField(this.currentObjectFieldName + '__' + prop.name);
                    } else {
                        builder.addKeyField(prop.name);
                    }
                }
                if (this.currentObjectFieldName) {
                    builder.modelBinderConfig[prop.name] = this.currentObjectFieldName + '__' + prop.name;
                } else {
                    builder.modelBinderConfig[prop.name] = prop.name;
                }
            }
        }, this);
        if (storageModel) {
            this._addComplexTypeProperties(storageModel.ComplexTypes, builder);
        }
    },
    _addComplexTypeProperties: function (complexTypes, builder) {
        complexTypes.forEach(function (ct) {

            builder.selectModelBinderProperty(ct.FromPropertyName);
            builder.modelBinderConfig['$type'] = ct.ToType;
            var tmpPrefix = this.currentObjectFieldName;
            if (this.currentObjectFieldName) {
                this.currentObjectFieldName += '__';
            } else {
                this.currentObjectFieldName = '';
            }
            this.currentObjectFieldName += ct.FromPropertyName;
            //recursion
            this._addPropertyToModelBinderConfig(ct.ToType, builder);
            //reset model binder property
            builder.popModelBinderProperty();
            this.currentObjectFieldName = tmpPrefix;

        }, this);
    },
    DefaultSelection: function (builder) {
        //no projection, get all item from entitySet
        builder.modelBinderConfig['$type'] = this._query.defaultType;
        var storageModel = this._query.context._storageModel.getStorageModel(this._query.defaultType);
        
        var needPrefix = this.sqlContext.infos.filter(function (i) { return i.IsMapped; }).length > 1;
        if (needPrefix) {
            this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(this.sqlContext.sets[0]);
        }
        this._addPropertyToModelBinderConfig(this._query.defaultType, builder);
        this.sqlContext.infos.forEach(function (info, infoIndex) {
            if (infoIndex > 0 && info.IsMapped) {
                var pathFragments = info.NavigationPath.split('.');
                pathFragments.shift();
                pathFragments.forEach(function (pathFragment, index) {
                    if (!pathFragment) { return; }
                    if (!builder.modelBinderConfig[pathFragment]) {
                        builder.selectModelBinderProperty(pathFragment);
                        var isArray = false;
                        if (info.Association.associationInfo.ToMultiplicity === '*' && pathFragments.length - 1 === index) {
                            builder.modelBinderConfig['$type'] = $data.Array;
                            builder.selectModelBinderProperty('$item');
                            isArray = true;
                        }

                        builder.modelBinderConfig['$type'] = this.sqlContext.sets[infoIndex].elementType;
                        this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(this.sqlContext.sets[infoIndex]);
                        this._addPropertyToModelBinderConfig(this.sqlContext.sets[infoIndex].elementType, builder);
                        if (isArray) { builder.popModelBinderProperty(); }
                    } else {
                        builder.selectModelBinderProperty(pathFragment);
                    }
                }, this);
                for (var i = 0; i < pathFragments.length; i++) {
                    builder.popModelBinderProperty();
                }
            }
        }, this);
    },
    VisitProjectionExpression: function (expression, builder) {
        this.hasProjection = true;
        this.Visit(expression.selector, builder);

        if (expression.selector && expression.selector.expression instanceof $data.Expressions.ObjectLiteralExpression) {
            builder.modelBinderConfig['$type'] = expression.projectionAs || builder.modelBinderConfig['$type'] || $data.Object;
        }
    },
    VisitParametricQueryExpression: function (expression, builder) {
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
            builder.modelBinderConfig['$keys'].unshift('rowid$$');
        } else if (expression.expression instanceof $data.Expressions.EntitySetExpression) {
            this.currentObjectFieldName = this._sqlBuilder.getExpressionAlias(expression.expression);
            this.VisitEntitySetAsProjection(expression.expression, builder);
            builder.modelBinderConfig['$keys'] = ['rowid$$'];
        } else if (expression.expression instanceof $data.Expressions.ComplexTypeExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else {
            builder.modelBinderConfig['$keys'] = ['rowid$$'];
            this.Visit(expression.expression, builder);
            if (expression.expression instanceof $data.Expressions.EntityFieldExpression) {
                builder.modelBinderConfig['$source'] = 'd';
            }
        }
    },
    VisitConstantExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = expression.type;
        builder.modelBinderConfig['$source'] = this.currentObjectFieldName;
    },
    VisitEntityAsProjection: function (expression, builder) {
        this.Visit(expression.source, builder);
        builder.modelBinderConfig['$type'] = expression.entityType;
        this._addPropertyToModelBinderConfig(expression.entityType, builder);
    },
    VisitEntitySetAsProjection: function (expression, builder) {
        builder.modelBinderConfig['$type'] = $data.Array;
        builder.selectModelBinderProperty('$item');
        builder.modelBinderConfig['$type'] = expression.elementType;
        this._addPropertyToModelBinderConfig(expression.elementType, builder);
        builder.popModelBinderProperty();
    },
    VisitComplexTypeExpression: function (expression, builder) {
        return expression;
    },
    VisitEntityFieldExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);
    },
    VisitMemberInfoExpression: function (expression, builder) {
        if (expression.memberDefinition instanceof $data.MemberDefinition) {
            builder.modelBinderConfig['$type'] = expression.memberDefinition.type;
            if (expression.memberDefinition.storageModel && expression.memberName in expression.memberDefinition.storageModel.ComplexTypes) {
                this._addPropertyToModelBinderConfig(Container.resolveType(expression.memberDefinition.type), builder);
            } else {
                builder.modelBinderConfig['$source'] = this.currentObjectFieldName;
            }
        }
    },
    VisitEntitySetExpression: function (expression, builder) {
        if (expression.source instanceof $data.Expressions.EntityExpression) {
            this.Visit(expression.source, builder);
            this.Visit(expression.selector, builder);
        }

    },
    VisitEntityExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
    },
    VisitAssociationInfoExpression: function (expression, builder) {
        if (('$selector' in builder.modelBinderConfig) && (builder.modelBinderConfig.$selector.length > 0)) {
            builder.modelBinderConfig.$selector += '.';
        } else {
            builder.modelBinderConfig['$selector'] = 'json:';
        }
        builder.modelBinderConfig['$selector'] += expression.associationInfo.FromPropertyName;
    },
    VisitSimpleBinaryExpression: function (expression, builder) {
        this.Visit(expression.left, builder);
        this.Visit(expression.right, builder);
        builder.modelBinderConfig['$type'] = undefined;
    },
    VisitObjectLiteralExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = $data.Object;
        expression.members.forEach(function (of) {
            this.Visit(of, builder);
        }, this);
    },
    VisitObjectFieldExpression: function (expression, builder) {
        var tempFieldName = this.currentObjectFieldName;
        builder.selectModelBinderProperty(expression.fieldName);
        if (this.currentObjectFieldName) {
            this.currentObjectFieldName += '__';
        } else {
            this.currentObjectFieldName = '';
        }
        this.currentObjectFieldName += expression.fieldName;

        if (expression.expression instanceof $data.Expressions.EntityExpression || expression.expression instanceof $data.Expressions.ComplexTypeExpression) {
            this.VisitEntityAsProjection(expression.expression, builder);
        } else if(expression.expression instanceof $data.Expressions.EntitySetExpression){
            this.VisitEntitySetAsProjection(expression.expression, builder);
        }
        else {
            this.Visit(expression.expression, builder);
        }

        this.currentObjectFieldName = tempFieldName;

        builder.popModelBinderProperty();
    }
});