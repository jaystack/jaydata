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
    VisitIncludeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.$include = context.$include || [];
        if (context.$include.indexOf(expression.selector.value) < 0) context.$include.push(expression.selector.value);
        /*if (!context['$select']) {
            if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
            context['$expand'] += expression.selector.value.replace('.', '/');

            this.includes = this.includes || [];
            var includeFragment = expression.selector.value.split('.');
            var tempData = null;
            var storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(this.mainEntitySet.createNew);
            for (var i = 0; i < includeFragment.length; i++) {
                if (tempData) { tempData += '.' + includeFragment[i]; } else { tempData = includeFragment[i]; }
                var association = storageModel.Associations[includeFragment[i]];
                if (association) {
                    if (!this.includes.some(function (include) { return include.name == tempData }, this)) {
                        this.includes.push({ name: tempData, type: association.ToType });
                    }
                }
                else {
                    Guard.raise(new Exception("The given include path is invalid: " + expression.selector.value + ", invalid point: " + tempData));
                }
                storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(association.ToType);
            }
        }*/
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
    VisitServiceOperationExpression: function (expression, context) {
        context.$serviceOperation = { name: expression.cfg.serviceName, params: expression.params };
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

