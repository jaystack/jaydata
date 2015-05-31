$C('$data.storageProviders.mongoDB.mongoDBFilterCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider, lambdaPrefix, compiler) {
        this.provider = provider;
        this.lambdaPrefix = lambdaPrefix;
        if (compiler){
            this.compiler = compiler;
            this.includes = compiler.includes;
            this.mainEntitySet = compiler.mainEntitySet;
        }
    },

    compile: function (expression, context) {
        if (!context.cursor) {
            context.query = {};
            context.cursor = context.query;
        }
        this.Visit(expression, context);
        if (context.query.$and){
            var and = context.query.$and;
            var query = {};
            var valid = true;
            for (var i = 0; i < and.length; i++){
                var a = and[i];
                for (var p in a){
                    if (query[p]){
                        valid = false;
                        break;
                    }
                    query[p] = a[p];
                }
                if (!valid) break;
            }
            if (valid) context.query = query;
        }
        if (this.compiler){
            this.compiler.includes = this.includes;
        }
    },

    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
        if (expression.expression && expression.expression.nodeType === $data.Expressions.ExpressionType.Constant){
            context.value = expression.expression.value;
            context.queryField = context.field = $data.Guid.NewGuid();
            if (context.value === true) context.value = null;
            
            if (context.cursor instanceof Array){
                var o = {};
                o[context.queryField] = context.value;
                context.cursor.push(o);
            }else context.cursor[context.queryField] = context.value;
        }
    },

    VisitUnaryExpression: function (expression, context) {
        context.unary = expression.nodeType;
        this.Visit(expression.operand, context);
    },
    
    _constExpressionFilter: function(expression, context){
        if (expression.left && expression.left.nodeType === $data.Expressions.ExpressionType.Constant && expression.right && [$data.Expressions.ExpressionType.Or, $data.Expressions.ExpressionType.And].indexOf(expression.nodeType) >= 0){
            context.value = expression.left.value;
            context.queryField = context.field = $data.Guid.NewGuid();
            if (context.value === true) context.value = null;
            
            if (context.cursor instanceof Array){
                var o = {};
                o[context.queryField] = context.value;
                context.cursor.push(o);
            }else context.cursor[context.queryField] = context.value;
        }
    },

    VisitSimpleBinaryExpression: function (expression, context) {
     
        var cursor = context.cursor;
        
        switch (expression.nodeType){
            case $data.Expressions.ExpressionType.Or:
                var orCursor = context.cursor;
                
                if (context.cursor instanceof Array){
                    var or = context.unary === $data.Expressions.ExpressionType.Not ? { $nor: [] } : { $or: [] };
                    context.cursor.push(or);
                    context.cursor = or[context.unary === $data.Expressions.ExpressionType.Not ? '$nor' : '$or'];
                }else{
                    context.cursor[context.unary === $data.Expressions.ExpressionType.Not ? '$nor' : '$or'] = [];
                    context.cursor = context.cursor[context.unary === $data.Expressions.ExpressionType.Not ? '$nor' : '$or'];
                }
                if (context.unary === $data.Expressions.ExpressionType.Not) context.unary = undefined;
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                this._constExpressionFilter(expression, context);
                
                if (orCursor instanceof Array){
                    for (var i = 0; i < orCursor.length; i++){
                        var o = orCursor[i];
                        if (o.$or){
                            if (o.$or.length == 0){
                                delete o.$or;
                            }else if (o.$or.length == 1){
                                $data.typeSystem.extend(o, o.$or[0]);
                                delete o.$or;
                            }
                        }
                    }
                }else if (orCursor.$or){
                    if (orCursor.$or.length == 0){
                        delete orCursor.$or;
                    }else if (orCursor.$or.length == 1){
                        $data.typeSystem.extend(orCursor, orCursor.$or[0]);
                        delete orCursor.$or;
                    }
                }
                context.cursor = orCursor;
                break;
            case $data.Expressions.ExpressionType.And:
                var andCursor = context.cursor;
                
                if (context.cursor instanceof Array){
                    var and = { $and: [] };
                    context.cursor.push(and);
                    context.cursor = and.$and;
                }else{
                    context.cursor.$and = [];
                    context.cursor = context.cursor.$and;
                }
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                this._constExpressionFilter(expression, context);
                
                if (andCursor instanceof Array){
                    for (var i = 0; i < andCursor.length; i++){
                        var a = andCursor[i];
                        if (a.$and){
                            if (a.$and.length == 0){
                                delete a.$and;
                            }else if (a.$and.length == 1){
                                $data.typeSystem.extend(a, a.$and[0]);
                                delete a.$and;
                            }
                        }
                    }
                }else if (andCursor.$and){
                    if (andCursor.$and.length == 0){
                        delete andCursor.$and;
                    }else if (andCursor.$and.length == 1){
                        $data.typeSystem.extend(andCursor, andCursor.$and[0]);
                        delete andCursor.$and;
                    }
                }
                context.cursor = andCursor;
                break;
            case $data.Expressions.ExpressionType.Equal:
            case $data.Expressions.ExpressionType.EqualTyped:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (!context.complexType && context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (context.entityType && context.entityType.memberDefinitions)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.complexType ? context.lastField : context.field).type))](v);
                else if (context.valueType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.valueType))](v);
                context.value = v;
                if (context.fieldOperation){
                    if (context.unary === $data.Expressions.ExpressionType.Not){
                        var c = { $not: context.cursor[context.queryField] };
                        context.cursor[context.queryField] = c;
                    }
                }else{
                    if (context.cursor instanceof Array){
                        var o = {};
                        o[context.queryField] = context.unary === $data.Expressions.ExpressionType.Not ? { $ne: context.value } : context.value;
                        context.cursor.push(o);
                    }else context.cursor[context.queryField] = context.unary === $data.Expressions.ExpressionType.Not ? { $ne: context.value } : context.value;
                    if (context.options && context.options.fields) context.options.fields[context.queryField] = 1;
                    if (context.unary === $data.Expressions.ExpressionType.Not) context.unary = undefined;
                }
                break;
            case $data.Expressions.ExpressionType.In:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (!context.complexType && context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (v instanceof Array){
                    v = v.map(function (it) { return it.value; });
                    for (var i = 0; i < v.length; i++){
                        if (context.entityType && context.entityType.memberDefinitions)
                            v[i] = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.complexType ? context.lastField : context.field).type))](v[i]);
                        else if (context.valueType)
                            v[i] = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.valueType))](v[i]);
                    }
                }
                context.value = v;
                if (context.cursor instanceof Array){
                    var o = {};
                    o[context.queryField] = {};
                    if (context.entityType && context.entityType === $data.Array){
                        o[context.queryField] = context.unary === $data.Expressions.ExpressionType.Not ? { $not: context.value } : context.value;
                    }else{
                        o[context.queryField][context.unary === $data.Expressions.ExpressionType.Not ? '$nin' : expression.resolution.mapTo] = context.value;
                    }
                    context.cursor.push(o);
                }else{
                    context.cursor[context.queryField] = {};
                    if (context.entityType && context.entityType === $data.Array){
                        context.cursor[context.queryField] = context.unary === $data.Expressions.ExpressionType.Not ? { $not: context.value } : context.value;
                    }else{
                        context.cursor[context.queryField][context.unary === $data.Expressions.ExpressionType.Not ? '$nin' : expression.resolution.mapTo] = context.value;
                    }
                }
                if (context.options && context.options.fields) context.options.fields[context.queryField] = 1;
                if (context.unary === $data.Expressions.ExpressionType.Not) context.unary = undefined;
                break;
            default:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (Array.isArray(context.cursor) && context.cursor[0] && context.cursor[0][context.queryField] && (context.cursor[0][context.queryField].$near || context.cursor[0][context.queryField].$nearSphere || context.cursor[0][context.queryField].$within)){
                    context.query = context.cursor[0];
                    context.cursor = context.cursor[0];
                }
                var c = context.cursor[0] || context.cursor;
                if (c && c[context.queryField] && c[context.queryField].$within){
                    break;
                }
                if (!context.complexType && context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (context.entityType && context.entityType.memberDefinitions)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.complexType ? context.lastField : context.field).type))](v);
                else if (context.valueType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.valueType))](v);
                context.value = v;
                if (context.cursor instanceof Array){
                    var o = {};
                    o[context.queryField] = {};
                    o[context.queryField][expression.resolution.mapTo] = context.value;
                    context.cursor.push(o);
                }else{
                    context.cursor[context.queryField] = {};
                    context.cursor[context.queryField][expression.resolution.mapTo] = context.value;
                }
                if (context.options && context.options.fields) context.options.fields[context.queryField] = 1;
                break;
        }
        
        delete context.fieldOperation;
        delete context.complexType;
        delete context.association;
        delete context.field;
        delete context.value;
    },

    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },

    VisitAssociationInfoExpression: function (expression, context) {
        this.includes = this.includes || [];
        var from = context.include ? context.include.name + '.' + expression.associationInfo.FromPropertyName : expression.associationInfo.FromPropertyName;
        var includeFragment = from.split('.');
        var tempData = null;
        var storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(this.mainEntitySet.createNew);
        for (var i = 0; i < includeFragment.length; i++) {
            if (tempData) { tempData += '.' + includeFragment[i]; } else { tempData = includeFragment[i]; }
            var association = storageModel.Associations[includeFragment[i]];
            if (association) {
                var inc = this.includes.filter(function (include) { return include.name == tempData }, this);
                if (context.include && i < includeFragment.length - 1){
                    if (!context.include.options.fields) context.include.options.fields = { _id: 1 };
                    context.include.options.fields[includeFragment[i + 1]] = 1;
                }
                if (inc.length) {
                    context.includeOptions = inc[0].options;
                    context.include = inc[0];
                }else{
                    var inc = { name: tempData, type: association.ToType, from: association.FromType, query: {}, options: {}, mapped: false };
                    context.includeOptions = inc.options;
                    context.include = inc;
                    context.include.options.fields = { _id: 1 };
                    context.include.options.fields[association.ToPropertyName] = 1;
                    this.includes.push(inc);
                }
                if (!context.options.fields) context.options.fields = { _id: 1 };
                context.options.fields[includeFragment[0]] = 1;
                association.ReferentialConstraint.forEach(function(ref){
                    for (var p in ref){
                        context.options.fields[ref[p]] = 1;
                    }
                });
                context.full = true;
                context.mainCursor = context.cursor;
                context.cursor = context.include.query;
                context.entityType = association.ToType;
            }
            else {
                Guard.raise(new Exception("The given include path is invalid: " + expression.associationInfo.FromPropertyName + ", invalid point: " + tempData));
            }
            storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(association.ToType);
        }
    },

    VisitMemberInfoExpression: function (expression, context) {
        if ((context.complexType && context.field)){
            context.field = context.field + '.' + expression.memberName;
        }else{
            context.field = expression.memberName;
        }
        if (context.complexType) context.lastField = expression.memberName;
    },
    
    VisitComplexTypeExpression: function(expression, context){
        context.complexType = true;
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
        context.entityType = expression.entityType;
    },

    VisitQueryParameterExpression: function (expression, context) {
        context.data += this.provider.fieldConverter.toDb[expression.type](expression.value);
    },

    _fieldOperation: function(opName, context){
        context.fieldOperation = true;
        var opMapTo;
        var opValue;
        switch (opName){
            case 'contains':
                opMapTo = '$regex';
                opValue = context.value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                break;
            case 'startsWith':
                opMapTo = '$regex';
                opValue = '^' + context.value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                break;
            case 'endsWith':
                opMapTo = '$regex';
                opValue = context.value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1") + '$';
                break;
            default:
                break;
        }
        
        return { opMapTo: opMapTo, opValue: opValue };
    },
    
    VisitEntityFieldOperationExpression: function (expression, context) {
        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);
        
        this.Visit(expression.source, context);

        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;
        var paramCounter = 0;
        var params = opDef.parameters || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++]
            };
        });

        args.forEach(function (arg, index) {
            this.Visit(arg, context);
        }, this);
        
        var op = this._fieldOperation(opName, context);
        var opMapTo = op.opMapTo;
        var opValue = op.opValue;
        
        if (context.unary === $data.Expressions.ExpressionType.Not){
            opValue = '^((?!' + opValue + ').)*$';
        }
        
        if (context.options.fields) context.options.fields[context.field] = 1;
        
        if (!context.include && opMapTo && opValue){
            if (context.cursor instanceof Array){
                var o = {};
                o[context.field] = {};
                o[context.field][opMapTo] = opValue;
                context.cursor.push(o);
            }else{
                context.cursor[context.field] = {};
                context.cursor[context.field][opMapTo] = opValue;
            }
        }
        
        if (context.complexType){
            delete context.complexType;
            delete context.field;
        }
    },

    VisitConstantExpression: function (expression, context) {
        var valueType = Container.resolveName(expression.type);
        context.valueType = valueType;
        context.value = expression.value;
        var c = Array.isArray(context.cursor) ? context.cursor.filter(function(it){ return typeof it[context.field] !== 'undefined'; })[0] : context.cursor;
        if (c && c[context.field] && c[context.field].$within){
            c = c[context.field];
            if (c.$within.$center){
                c.$within.$center = [c.$within.$center, context.value];
            }else if (c.$within.$centerSphere){
                c.$within.$centerSphere = [c.$within.$centerSphere, context.value];
            }
        }
    },

    VisitEntityExpression: function (expression, context) {
        context.entityType = expression.entityType;
        if (context.mainCursor){
            context.cursor = context.mainCursor;
            delete context.include;
        }
        this.Visit(expression.source, context);
    },

    VisitEntitySetExpression: function (expression, context) {
        this.Visit(expression.source, context);
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
            context.data += "/";
        }
    },
    
    _frameOperation: function(opDef, args, expression, context, contextinclude){
        var self = this;
        var origInclude = contextinclude;
        var frames = [];
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg && arg.value instanceof $data.Queryable) {
                var frameExpression = new opDef.frameType(arg.value.expression);
                var preparator = new $data.Expressions.QueryExpressionCreator(arg.value.entityContext);
                var prep_expression = preparator.Visit(frameExpression);
                
                var fn = function(expression, context, contextinclude, indent){
                    if (expression._expressionType === $data.Expressions.AssociationInfoExpression){
                        contextinclude += '.' + expression.associationInfo.FromPropertyName;
                        var storageModel = context.entitySet.entityContext._storageModel.getStorageModel(context.defaultType);
                        var association = storageModel.Associations[expression.associationInfo.FromPropertyName];
                        if (association) {
                            var inc = context.includes.filter(function (include) { return include.name == contextinclude }, this);
                            if (inc.length == 0){
                                inc = { name: contextinclude, type: association.ToType, from: association.FromType, query: {}, options: {}, mapped: false };
                                inc.options.fields = { _id: 1 };
                                inc.options.fields[association.ToPropertyName] = 1;
                                context.includes.push(inc);
                            }
                            if (!context.context.options.fields) context.context.options.fields = { _id: 1 };
                            //context.context.options.fields[context.include] = 1;
                            association.ReferentialConstraint.forEach(function(ref){
                                for (var p in ref){
                                    //context.context.options.fields[ref[p]] = 1;
                                }
                            });
                        }else{
                            Guard.raise(new Exception("The given include path is invalid: " + expression.associationInfo.FromPropertyName + ", invalid point: " + contextinclude));
                        }
                        context.defaultType = association.ToType;
                    }else if (expression._expressionType === $data.Expressions.FrameOperationExpression){
                        frames.push(function(){
                            var opDef = expression.operation.memberDefinition;
                            var paramCounter = 0;
                            var params = opDef.parameters || [{ name: "@expression" }];

                            var args = params.map(function (item, index) {
                                if (item.name === "@expression") {
                                    return expression.source;
                                } else {
                                    return expression.parameters[paramCounter++]
                                };
                            });
                            
                            self._frameOperation(opDef, args, expression, {
                                entitySet: arg.value.entityContext._entitySetReferences[arg.value.expression.elementType.name],
                                defaultType: arg.value.expression.elementType,
                                context: context.context,
                                includes: self.includes/*,
                                include: { name: lastInclude }*/
                            }, contextinclude);
                        });
                    }else if (expression._expressionType === $data.Expressions.MemberInfoExpression){
                        contextinclude = origInclude;
                        context.defaultType = arg.value.expression.elementType;
                    }
                    
                    if (expression.source) contextinclude = fn(expression.source, context, contextinclude);
                    if (expression.selector) contextinclude = fn(expression.selector, context, contextinclude);
                    if (expression.expression) contextinclude = fn(expression.expression, context, contextinclude);
                    if (expression.left) contextinclude = fn(expression.left, context, contextinclude);
                    if (expression.right) contextinclude = fn(expression.right, context, contextinclude);
                    
                    return contextinclude;
                };
                
                var c = {
                    entitySet: arg.value.entityContext._entitySetReferences[arg.value.expression.elementType.name],
                    defaultType: arg.value.expression.elementType,
                    context: context.context ? context.context : context,
                    includes: this.includes
                };
                fn(prep_expression, c, contextinclude, 0);
            };
        }
        frames.forEach(function(it){ it(); });
    },

    VisitFrameOperationExpression: function (expression, context) {
        this.Visit(expression.source, context);

        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);

        var opDef = expression.operation.memberDefinition;
        var paramCounter = 0;
        var params = opDef.parameters || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++]
            };
        });

        this._frameOperation(opDef, args, expression, context, context.include.name);
    }
});
