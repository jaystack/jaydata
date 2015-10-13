$C('$data.storageProviders.mongoDB.mongoDBCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function(){
        this.context = {};
        this.provider = {};
        this.includes = [];
        this.mainEntitySet = null;
    },
    compile: function(query){
        this.provider = query.context.storageProvider;
        this.context = query.context;
        this.mainEntitySet = query.context.getEntitySetFromElementType(query.defaultType);
        this.query = query;

        query.find = {
            query: {},
            options: {}
        };

        this.Visit(query.expression, query.find);

        query.includes = this.includes;
        
        query.modelBinderConfig = {};
        var modelBinder = new $data.modelBinder.mongoDBModelBinderConfigCompiler(query, this.includes.filter(function(it){ return it.mapped; }), true);
        modelBinder.Visit(query.expression);
        
        delete query.find.field;
        delete query.find.value;
        delete query.find.data;
        delete query.find.stack;
        delete query.find.or;
        
        return query;
    },
    VisitOrderExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var orderCompiler = new $data.storageProviders.mongoDB.mongoDBOrderCompiler(this.provider, null, this);
        orderCompiler.compile(expression, context);
    },
    VisitPagingExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var pagingCompiler = new $data.storageProviders.mongoDB.mongoDBPagingCompiler();
        pagingCompiler.compile(expression, context);
    },
    VisitFilterExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var self = this;
        var filterCompiler = new $data.storageProviders.mongoDB.mongoDBFilterCompiler(this.provider, null, self);
        context.data = "";
        filterCompiler.compile(expression.selector, context);
        
        if (this.includes && this.includes.length){
            context.data = "";
            context.lambda = "";
            var funcCompiler = new $data.storageProviders.mongoDB.mongoDBFunctionCompiler({
                supportedBinaryOperators: {
                    equal: { mapTo: ' == ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
                    notEqual: { mapTo: ' != ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
                    equalTyped: { mapTo: ' === ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
                    notEqualTyped: { mapTo: ' !== ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
                    greaterThan: { mapTo: ' > ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
                    greaterThanOrEqual: { mapTo: ' >= ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },

                    lessThan: { mapTo: ' < ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
                    lessThenOrEqual: { mapTo: ' <= ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
                    or: { mapTo: ' || ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
                    and: { mapTo: ' && ', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },

                    "in": { mapTo: ".indexOf(", allowedIn: [$data.Expressions.FilterExpression], rightValue: ') > -1', reverse: true }
                },

                supportedUnaryOperators: {
                    not: { mapTo: '!' }
                },

                supportedFieldOperations: {
                    contains: {
                        mapTo: "$data.StringFunctions.contains(",
                        rightValue: ")",
                        dataType: "boolean",
                        parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
                    },

                    startsWith: {
                        mapTo: "$data.StringFunctions.startsWith(",
                        rightValue: ")",
                        dataType: "boolean",
                        parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
                    },

                    endsWith: {
                        mapTo: "$data.StringFunctions.endsWith(",
                        rightValue: ")",
                        dataType: "boolean",
                        parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
                    }
                },
                
                fieldConverter: { toDb: $data.typeSystem.extend({
                    '$data.ObjectID': function(id){
                        return id ? 'atob("' + id.toString() + '")' : id;
                    }
                }, $data.InMemoryConverter.escape) }
            }, null, this);
            funcCompiler.compile(expression.selector, context);
            context.filter = new Function(context.lambda, 'return ' + context.data + ';');
            context.data = "";
            context.lambda = "";
        }
    },
    VisitProjectionExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var projectionCompiler = new $data.storageProviders.mongoDB.mongoDBProjectionCompiler(this.provider, null, this);
        projectionCompiler.compile(expression, context);
    },
    VisitIncludeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        
        this.includes = this.includes || [];
        var includeFragment = expression.selector.value.split('.');
        var tempData = null;
        var storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(this.mainEntitySet.createNew);
        for (var i = 0; i < includeFragment.length; i++) {
            if (tempData) { tempData += '.' + includeFragment[i]; } else { tempData = includeFragment[i]; }
            var association = storageModel.Associations[includeFragment[i]];
            if (association) {
                var inc = this.includes.filter(function (include) { return include.name == tempData }, this);
                if (inc.length) {
                    inc[0].mapped = true;
                }else{
                    this.includes.push({ name: tempData, type: association.ToType, from: association.FromType, query: {}, options: {}, mapped: true });
                }
            }
            else {
                Guard.raise(new Exception("The given include path is invalid: " + expression.selector.value + ", invalid point: " + tempData));
            }
            storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(association.ToType);
        }
    },
    VisitInlineCountExpression: function(expression, context){
        this.Visit(expression.source, context);
        this.query.withInlineCount = expression.selector == 'allpages' ? true : false;
    }
});
