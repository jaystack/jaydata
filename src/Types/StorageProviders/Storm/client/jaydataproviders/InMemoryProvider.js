// JayData 1.1.1
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki
//
// More info: http://jaydata.org

$C('$data.storageProviders.InMemory.InMemoryProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg, ctx) {
        this.context = ctx;
        this.providerConfiguration = $data.typeSystem.extend({
            source: null
        }, cfg);
    },
    initializeStore: function (callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        this.providerConfiguration.source = this.providerConfiguration.source || {};
        var setKeys = Object.keys(this.context._entitySetReferences);
        for (var i = 0; i < setKeys.length; i++) {
            var set = this.context._entitySetReferences[setKeys[i]];
            if (!this.providerConfiguration.source[set.name]) {
                this.providerConfiguration.source[set.name] = [];
            } else {
                var sourceArray = this.providerConfiguration.source[set.name];
                for (var j = 0; j < sourceArray.length; j++) {
                    if (!(sourceArray[j] instanceof set.elementType))
                        Guard.raise(new Exception('Invalid element in source: \'' + setKeys[i]));
                }
            }
        }

        callBack.success(this.context);
    },
    executeQuery: function (query, callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        var sql;
        try {
            sql = this._compile(query);
        } catch (e) {
            callBack.error(e);
            return;
        }

        var sourceName = query.context.getEntitySetFromElementType(query.defaultType).name;
        var result = [].concat(this.providerConfiguration.source[sourceName] || []);
        if (sql.$filter && !sql.$every)
            result = result.filter(sql.$filter);

        if (sql.$map)
            result = result.map(sql.$map);

        if (sql.$take !== undefined && sql.$skip !== undefined) {
            result = result.slice(sql.$skip, sql.$skip + sql.$take);
        } else if (sql.$take !== undefined && result.length > sql.$take) {
            result = result.slice(0, sql.$take);
        } else if (sql.$skip) {
            result = result.slice(sql.$skip, result.length);
        }

        if (sql.$order && sql.$order.length > 0) {
            sql.$order.reverse();
            for (var i = 0, l = sql.$order.length; i < l; i++) {
                if (sql.$order[i].ASC)
                    result.sort(function (a, b) { return sql.$order[i](a) > sql.$order[i](b) });
                else
                    result.sort(function (a, b) { return sql.$order[i](a) < sql.$order[i](b) });
            }
        }

        if (sql.$some)
            result = [result.length > 0];

        //        if (sql.$every && sql.$filter)
        //            result = [result.every(sql.$filter)];

        if (sql.$length)
            result = [result.length];

        query.rawDataList = result;
        callBack.success(query);
    },
    _compile: function (query, params) {
        var compiler = new $data.storageProviders.InMemory.InMemoryCompiler(this);
        var compiled = compiler.compile(query);
        return compiled;
    },
    saveChanges: function (callBack, changedItems) {
        for (var i = 0; i < changedItems.length; i++) {
            var item = changedItems[i];
            switch (item.data.entityState) {
                case $data.EntityState.Added:
                    //todo: key, computedfields
                    this.providerConfiguration.source[item.entitySet.name].push(item.data);
                    break;
                case $data.EntityState.Deleted:
                    var idx = this.providerConfiguration.source[item.entitySet.name].indexOf(item.data);
                    this.providerConfiguration.source[item.entitySet.name].splice(idx, 1);
                    break;
                case $data.EntityState.Modified:
                    //todo: computedfields
                    break;
                default:
                    break;
            }
        }
        callBack.success();
    },
    getTraceString: function (queryable) {
        var compiled = this._compile(queryable);
        return compiled;
    },
    supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date, $data.Object], writable: false },

    supportedBinaryOperators: {
        value: {
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
        }
    },

    supportedUnaryOperators: {
        value: {
        }
    },

    supportedFieldOperations: {
        value: {

        },
        enumerable: true,
        writable: true
    },
    supportedSetOperations: {
        value: {
            filter: {},
            map: {},
            length: {},
            forEach: {},
            toArray: {},
            single: {},
            some: {},
            //every: {},
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {}
        },
        enumerable: true,
        writable: true
    },
    fieldConverter: {
        value: {
            fromDb: {
                '$data.Integer': function (number) { return number; },
                '$data.Number': function (number) { return number; },
                '$data.Date': function (dbData) { return dbData ? new Date(parseInt(dbData.substr(6))) : undefined; },
                '$data.String': function (text) { return text; },
                '$data.Boolean': function (bool) { return bool; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } return JSON.parse(o); },
                '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } return JSON.parse(o); }
            },
            toDb: {
                '$data.Integer': function (number) { return number; },
                '$data.Number': function (number) { return number % 1 == 0 ? number : number + 'm'; },
                '$data.Date': function (date) { return date ? "datetime'" + date.toISOString() + "'" : null; },
                '$data.String': function (text) { return "'" + text.replace(/'/g, "''") + "'"; },
                '$data.Boolean': function (bool) { return bool ? 'true' : 'false'; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Object': function (o) { return JSON.stringify(o); },
                '$data.Array': function (o) { return JSON.stringify(o); }
            }
        }
    }
}, null);

$data.StorageProviderBase.registerProvider("InMemory", $data.storageProviders.InMemory.InMemoryProvider);$C('$data.storageProviders.InMemory.InMemoryCompiler', $data.Expressions.EntityExpressionVisitor, null, {
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

$C('$data.storageProviders.InMemory.InMemoryFunctionCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },
    compile: function (expression, context) {
        this.Visit(expression, context);
    },

    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
    },
    VisitUnaryExpression: function (expression, context) {
        context.data += expression.resolution.mapTo;
        context.data += "(";
        this.Visit(expression.operand, context);
        context.data += ")";
    },
    VisitSimpleBinaryExpression: function (expression, context) {
        if (expression.resolution.reverse) {
            context.data += "(";
            var right = this.Visit(expression.right, context);
            context.data += expression.resolution.mapTo;
            var left = this.Visit(expression.left, context);
            if (expression.resolution.rightValue)
                context.data += expression.resolution.rightValue;
            context.data += ")";
        } else {
            context.data += "(";
            var left = this.Visit(expression.left, context);
            context.data += expression.resolution.mapTo;
            var right = this.Visit(expression.right, context);
            context.data += ")";
        }
    },

    VisitConstantExpression: function (expression, context) {
        var type = Container.resolveType(expression.type);
        var typeName = Container.resolveName(type);
        context.data += this.provider.fieldConverter.toDb[typeName](expression.value);
    },
    VisitMemberInfoExpression: function (expression, context) {
        context.data += expression.memberName;
    },

    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
        context.data += ".";
    },

    VisitEntityExpression: function (expression, context) {
        context.data += expression.selector.lambda + '.';
        context.lambda = expression.selector.lambda;
        this.Visit(expression.source, context);
    },
    VisitEntitySetExpression: function () { },
    VisitObjectLiteralExpression: function (expression, context) {
        context.data += '{ ';

        for (var i = 0; i < expression.members.length; i++) {
            var member = expression.members[i];

            if (i > 0)
                context.data += ', ';

            this.Visit(member, context);
        }

        context.data += ' }';
    },
    VisitObjectFieldExpression: function (expression, context) {
        context.data += expression.fieldName + ': ';
        this.Visit(expression.expression, context);
    }
});

