import $data, { $C, Guard, Container, Exception, MemberDefinition } from 'jaydata/core';

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

        if (query.defaultType) {
            this.mainEntitySet = query.context.getEntitySetFromElementType(query.defaultType);
        }

        var queryFragments = { urlText: "" };

        this.Visit(query.expression, queryFragments);
        if(queryFragments.$expand){
            queryFragments.$expand = queryFragments.$expand.toString();
        }
        

        query.modelBinderConfig = {};
        var modelBinder = Container.createModelBinderConfigCompiler(query, this.includes, true);
        modelBinder.Visit(query.expression);


        var queryText = queryFragments.urlText;
        var addAmp = false;
        
        if(queryFragments.$funcParams){
            queryText += "(" + queryFragments.$funcParams + ")"
        }
        
        for (var name in queryFragments) {
            if (name != "urlText" && name != "actionPack" && name != "data" && name != "lambda" && name != "method" && name != "postData" &&
                name != "_isBatchExecuteQuery" && name != "_subQueries" && name != "$funcParams" && queryFragments[name] != "") {

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
        var result =  {
            queryText: queryText,
            withInlineCount: '$inlinecount' in queryFragments || '$count' in queryFragments,
            method: queryFragments.method || 'GET',
            postData: queryFragments.postData,
            isBatchExecuteQuery: queryFragments._isBatchExecuteQuery,
            subQueries: queryFragments._subQueries,
            params: []
        };

        query._getComplitedData = function () {
            return result;
        }

        return result;
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

        var includeCompiler = Container.createoDataIncludeCompiler(this.provider);
        this.includes = this.includes || []
        var includeContext = { data: context["$expand"], includes: this.includes }
        includeCompiler.compile(expression.selector, includeContext);
        context["$expand"] = includeContext.data;
    },
    VisitFindExpression: function (expression, context) {
        this.Visit(expression.source, context);

        if (expression.subMember) {
            context.urlText += "/" + expression.subMember.memberName;
        }

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

        var projectionCompiler = Container.createoDataProjectionCompiler(this.provider);
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
        if (this.provider.providerConfiguration.maxDataServiceVersion === "4.0") {
            context["$count"] = expression.selector.value === 'allpages';
        } else {
            context["$inlinecount"] = expression.selector.value;
        }
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
        context.urlText += "/" + (expression.cfg.namespace ? (expression.cfg.namespace + "." + expression.cfg.serviceName) : expression.cfg.serviceName);
        context.method = context.method || expression.cfg.method;

        //this.logicalType = expression.returnType;
        if (expression.params) {
            context.serviceConfig = expression.cfg
            for (var i = 0; i < expression.params.length; i++) {
                this.Visit(expression.params[i], context);
            }
            delete context.serviceConfig;
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
        var value = converter ? converter(expression.value, expression) : expression.value;


        if (context.method === 'GET' || !context.method) {
            converter = this.provider.fieldConverter.escape[typeName];
            value = converter ? converter(value, expression) : value;
            if (value !== undefined) {
                var serviceConfig = context.serviceConfig || {};
                var paramConfig = (serviceConfig && serviceConfig.params.filter(p => p.name == expression.name)[0]) || {}
                
                var useAlias = serviceConfig.namespace && 
                    (paramConfig.useAlias || 
                     serviceConfig.useAlias || 
                     this.provider.providerConfiguration.useParameterAlias || 
                     $data.defaults.OData.useParameterAlias);
                     
                var paramValue = useAlias ? "@" + expression.name : value;
                var paramName = (useAlias ? "@" : "") + expression.name; 
                
                if (serviceConfig.namespace) {
                    if (context['$funcParams']) { context['$funcParams'] += ','; } else { context['$funcParams'] = ''; }
                        context['$funcParams'] += expression.name + '=' + paramValue;
                }
                
                if (!serviceConfig.namespace || useAlias) {
                    if (context['$urlParams']) { context['$urlParams'] += '&'; } else { context['$urlParams'] = ''; }
                        context['$urlParams'] += paramName + '=' + value;
                }
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
    },

    VisitBatchExecuteQueryExpression: function (expression, context) {
        context.urlText += '/$batch'
        context.method = 'POST';
        context.postData = { __batchRequests: [] };
        context._isBatchExecuteQuery = true;
        context._subQueries = expression.members;

        for (var i = 0; i < expression.members.length; i++) {
            var queryable = expression.members[i];
            var compiler = new $data.storageProviders.oData.oDataCompiler();
            var compiled = compiler.compile(queryable);
            context.postData.__batchRequests.push({
                requestUri: this.provider.providerConfiguration.oDataServiceHost + compiled.queryText,
                method: compiled.method,
                data: compiled.data,
                headers: compiled.headers
            });
        }
    }
}, {});
