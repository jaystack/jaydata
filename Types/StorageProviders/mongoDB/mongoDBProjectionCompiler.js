$C('$data.storageProviders.mongoDB.mongoDBProjectionCompiler', $data.Expressions.EntityExpressionVisitor, null, {
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
        this.Visit(expression, context);
        delete context.current;
        delete context.complexType;
    },
    VisitProjectionExpression: function (expression, context) {
        this.Visit(expression.selector, context);
    },
    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
    },
    VisitObjectLiteralExpression: function (expression, context) {
        var tempObjectLiteralPath = this.ObjectLiteralPath;
        this.hasObjectLiteral = true;
        expression.members.forEach(function (member, index) {
            this.Visit(member, context);
        }, this);
    },
    VisitObjectFieldExpression: function (expression, context) {
        this.Visit(expression.expression, context);
    },

    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    
    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitEntityExpression: function (expression, context) {
        if (context.includeOptions && !context.includeOptions.fields){
            context.include.full = true;
        }
        delete context.include;
        delete context.includeOptions;
        this.Visit(expression.source, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        if (expression.source instanceof $data.Expressions.EntityExpression) {
            this.Visit(expression.source, context);
        }
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
        }
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
                    inc[0].mapped = true;
                }else{
                    var inc = { name: tempData, type: association.ToType, from: association.FromType, query: {}, options: {}, mapped: true };
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
            }
            else {
                Guard.raise(new Exception("The given include path is invalid: " + expression.associationInfo.FromPropertyName + ", invalid point: " + tempData));
            }
            storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(association.ToType);
        }
    },
    VisitMemberInfoExpression: function (expression, context) {
        if (!(context.includeOptions || context.options).fields) (context.includeOptions || context.options).fields = { _id: 1 };
        context.current = expression.memberName;
        if (context.complexType){
            delete (context.includeOptions || context.options).fields[context.complexType];
            (context.includeOptions || context.options).fields[context.complexType + '.' + context.current] = 1;
            delete context.complexType;
        }else{
            if (!(context.includeOptions || context.options).fields[expression.memberName]) (context.includeOptions || context.options).fields[expression.memberName] = 1;
        }
        delete context.includeOptions;
        delete context.include;
    },
    VisitConstantExpression: function (expression, context) {
    }
});
