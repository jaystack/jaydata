$C('$data.storageProviders.oData.oDataCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function () {
        this.context = {};
        this.provider = {};
        //this.logicalType = null;
        this.includes = null;
        this.mainEntitySet = null;
    },
    compile: function (query) {

        this.provider = query.context.storageProvider;
        this.context = query.context;
        this.mainEntitySet = query.context.getEntitySetFromElementType(query.defaultType);

        var queryFragments = { urlText: "" };
        
        this.Visit(query.expression, queryFragments);

        query.modelBinderConfig = {};
        var modelBinder = Container.createModelBinderConfigCompiler(query, this.includes, true);
        modelBinder.Visit(query.expression);


        var queryText = queryFragments.urlText;
        var addAmp = false;
        for (var name in queryFragments) {
            if (name != "urlText" && name != "actionPack" && name != "data" && name != "lambda" && name != "method" && name != "postData" && queryFragments[name] != "") {
                if (addAmp) { queryText += "&"; } else { queryText += "?"; }
                addAmp = true;
                if(name != "$urlParams"){
                    queryText += name + '=' + queryFragments[name];
                }else{
                    queryText += queryFragments[name];
                }
            }
        }
        query.queryText = queryText;
        query.postData = queryFragments.postData;
        
        return {
            queryText: queryText,
            withInlineCount: '$inlinecount' in queryFragments,
            method: queryFragments.method || 'GET',
            postData: queryFragments.postData,
            params: []
        };
    },
    VisitOrderExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var orderCompiler = Container.createoDataOrderCompiler(this.provider);
        orderCompiler.compile(expression, context);
    },
    VisitPagingExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var pagingCompiler = Container.createoDataPagingCompiler(this.provider);
        pagingCompiler.compile(expression, context);
    },
    VisitIncludeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        if (!context['$select']) {
            if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
            context['$expand'] += expression.selector.value.replace(/\./g, '/');

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
        }
    },
    VisitFindExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.urlText += '(';
        if (expression.params.length === 1) {
            var param = expression.params[0];
            var typeName = Container.resolveName(param.type);

            var converter = this.provider.fieldConverter.toDb[typeName];
            var value = converter ? converter(param.value) : param.value;

            converter = this.provider.fieldConverter.escape[typeName];
            value = converter ? converter(param.value) : param.value;
            context.urlText += value;
        } else {
            for (var i = 0; i < expression.params.length; i++) {
                var param = expression.params[i];
                var typeName = Container.resolveName(param.type);

                var converter = this.provider.fieldConverter.toDb[typeName];
                var value = converter ? converter(param.value) : param.value;

                converter = this.provider.fieldConverter.escape[typeName];
                value = converter ? converter(param.value) : param.value;

                if (i > 0) context.urlText += ',';
                context.urlText += param.name + '=' + value;
            }
        }
        context.urlText += ')';
    },
    VisitProjectionExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var projectionCompiler = Container.createoDataProjectionCompiler(this.context);
        projectionCompiler.compile(expression, context);
    },
    VisitFilterExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.FilterExpression" />

        this.Visit(expression.source, context);

        var filterCompiler = Container.createoDataWhereCompiler(this.provider);
        context.data = "";
        filterCompiler.compile(expression.selector, context);
        context["$filter"] = context.data;
        context.data = "";

    },
    VisitInlineCountExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context["$inlinecount"] = expression.selector.value;
    },
    VisitEntitySetExpression: function (expression, context) {
        context.urlText += "/" + expression.instance.tableName;
        //this.logicalType = expression.instance.elementType;
        if (expression.params) {
            for (var i = 0; i < expression.params.length; i++) {
                this.Visit(expression.params[i], context);
            }
        }
    },
    VisitServiceOperationExpression: function (expression, context) {
        if (expression.boundItem) {
            context.urlText += "/" + expression.boundItem.entitySet.tableName;
            if (expression.boundItem.data instanceof $data.Entity) {
                context.urlText += '(' + this.provider.getEntityKeysValue(expression.boundItem) + ')';
            }
        }
        context.urlText += "/" + expression.cfg.serviceName;
        context.method = context.method || expression.cfg.method;

        //this.logicalType = expression.returnType;
        if (expression.params) {
            for (var i = 0; i < expression.params.length; i++) {
                this.Visit(expression.params[i], context);
            }
        }
    },
    VisitBatchDeleteExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.urlText += '/$batchDelete';
        context.method = 'DELETE';
    },

    VisitConstantExpression: function (expression, context) {
        var typeName = Container.resolveName(expression.type);
        if (expression.value instanceof $data.Entity)
            typeName = $data.Entity.fullName;

        var converter = this.provider.fieldConverter.toDb[typeName];
        var value = converter ? converter(expression.value) : expression.value;
        

        if (context.method === 'GET' || !context.method) {
            converter = this.provider.fieldConverter.escape[typeName];
            value = converter ? converter(value) : value;

            if (value !== undefined) {
                if (context['$urlParams']) { context['$urlParams'] += '&'; } else { context['$urlParams'] = ''; }
                context['$urlParams'] += expression.name + '=' + value;
            }
        } else {
            context.postData = context.postData || {};
            context.postData[expression.name] = value;
        }
    },
//    VisitConstantExpression: function (expression, context) {
//        if (context['$urlParams']) { context['$urlParams'] += '&'; } else { context['$urlParams'] = ''; }
//
//
//        var valueType = Container.getTypeName(expression.value);
//
//
//
//        context['$urlParams'] += expression.name + '=' + this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](expression.value);
//    },


    VisitCountExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.urlText += '/$count';       
    }
}, {});