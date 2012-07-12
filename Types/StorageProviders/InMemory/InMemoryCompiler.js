$C('$data.storageProviders.InMemory.InMemoryCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },
    compile: function (query) {

        var queryFragments = { urlText: "" };

        this.Visit(query.expression, queryFragments);

        var compiled = {};
        for (var name in queryFragments) {
            if (name.indexOf('$') == 0) {
                compiled[name] = queryFragments[name];
            }
        }

        return compiled;
    },
    VisitOrderExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.data = "";
        context.lambda = "";
        var funcCompiler = Container.createInMemoryFunctionCompiler(this.provider);
        funcCompiler.compile(expression.selector, context);
        context['$order'] = context['$order'] || [];
        var sort = new Function(context.lambda, 'return ' + context.data + ';');
        sort.ASC = expression.nodeType == 'OrderBy';
        context['$order'].push(sort);
        context.data = "";
        context.lambda = "";
    },
    VisitPagingExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context['$' + expression.nodeType.toLowerCase()] = expression.amount.value;
    },
    VisitProjectionExpression: function (expression, context) {
        this.defaultFunctionCompiler(expression, context, '$map');
    },
    VisitFilterExpression: function (expression, context) {
        this.defaultFunctionCompiler(expression, context, '$filter');
    },
    VisitSomeExpression: function (expression, context) {
        this.defaultFunctionCompiler(expression, context, '$some');
    },
    VisitEveryExpression: function (expression, context) {
        this.defaultFunctionCompiler(expression, context, '$every');
    },
    VisitCountExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context['$length'] = true;
    },

    defaultFunctionCompiler: function (expression, context, type) {
        this.Visit(expression.source, context);
        context.data = "";
        context.lambda = "";
        var funcCompiler = Container.createInMemoryFunctionCompiler(this.provider);
        funcCompiler.compile(expression.selector, context);
        context[type] = new Function(context.lambda, 'return ' + context.data + ';');
        context.data = "";
        context.lambda = "";
    }

}, {});