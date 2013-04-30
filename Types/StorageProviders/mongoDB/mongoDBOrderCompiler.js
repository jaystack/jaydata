$C('$data.storageProviders.mongoDB.mongoDBOrderCompiler', $data.storageProviders.mongoDB.mongoDBFilterCompiler, null, {
    constructor: function (provider, lambdaPrefix, compiler) {
        this.provider = provider;
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitOrderExpression: function (expression, context) {
        context.data = '';
        this.Visit(expression.selector, context);
        if (!(context.include || context).options.sort) (context.include || context).options.sort = {};
        (context.include || context).options.sort[context.includeSort || context.data] = expression.nodeType == $data.Expressions.ExpressionType.OrderByDescending ? -1 : 1;
        delete context.data;
        delete context.include;
        delete context.includeSort;
        delete context.includeOptions;
    },
    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
    },
    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        if (context.data) context.data += '.';
        this.Visit(expression.selector, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.source, context);
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
                    if (!context.include.options.sort) context.include.options.sort = {};
                    context.includeSort += includeFragment[i];
                }
                if (inc.length) {
                    context.includeOptions = inc[0].options;
                    context.include = inc[0];
                    context.includeSort = tempData;
                }else{
                    var inc = { name: tempData, type: association.ToType, from: association.FromType, query: {}, options: {}, mapped: false };
                    context.includeOptions = inc.options;
                    context.include = inc;
                    context.includeSort = tempData;
                    this.includes.push(inc);
                }
            }
            else {
                Guard.raise(new Exception("The given include path is invalid: " + expression.associationInfo.FromPropertyName + ", invalid point: " + tempData));
            }
            storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(association.ToType);
        }
    },
    VisitEntityExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitMemberInfoExpression: function (expression, context) {
        if (context.includeSort !== undefined){
            if (context.includeSort) context.includeSort += '.';
            context.includeSort += expression.memberDefinition.computed ? '_id' : expression.memberName;
        }else{
            if (context.data) context.data += '.';
            context.data += expression.memberDefinition.computed ? '_id' : expression.memberName;
        }
    }
});
