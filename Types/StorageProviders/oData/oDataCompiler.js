$C('$data.storageProviders.oData.oDataCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function () {
        this.context = {};
        this.provider = {};
        this.logicalType = null;
        this.includes = null;
        this.mainEntitySet = null;
    },
    compile: function (query) {

        this.provider = query.entitySet.entityContext.storageProvider;
        this.context = query.context;
        this.mainEntitySet = query.entitySet;

        query.actionPack = query.actionPack || [];
        var queryFragments = { urlText: "", actionPack: [] };
        //queryFragments.actionPack = queryFragments.actionPack || [];

        this.Visit(query.expression, queryFragments);

        var queryText = queryFragments.urlText;
        var addAmp = false;
        for (var name in queryFragments) {
            if (name != "urlText" && name != "actionPack" && name != "data" && queryFragments[name] != "") {
                if (addAmp) { queryText += "&"; } else { queryText += "?"; }
                addAmp = true;
                queryText += name + '=' + queryFragments[name];
            }
        }
        query.actionPack = queryFragments.actionPack;
        query.queryText = queryText;

        if (query.actionPack.length < 1) {
            query.actionPack.push({ op: "buildType", context: this.context, logicalType: this.logicalType, tempObjectName: this.logicalType.name, propertyMapping: null, includes: this.includes });
            query.actionPack.push({ op: "copyToResult", tempObjectName: this.logicalType.name });
        }


        return {
            queryText: queryText,
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

        var pagingCompiler = Container.createoDataPagingCompiler();
        pagingCompiler.compile(expression, context);
    },
    VisitIncludeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        if (!context['$select']) {
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
        }
    },
    VisitProjectionExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var projectionCompiler = Container.createoDataProjectionCompiler(this.context);
        projectionCompiler.compile(expression, context);

        var modelBinder = Container.createoDataModelBinderCompiler();
        modelBinder.Visit(expression, context);
    },
    VisitFilterExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.FilterExpression" />

        this.Visit(expression.source, context);

        var filterCompiler = Container.createoDataWhereCompiler(this.provider);
        filterCompiler.compile(expression.selector, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        context.urlText += "/" + expression.instance.tableName;
        this.logicalType = expression.instance.elementType;
    },
    VisitCountExpression:function(expression, context){
        this.Visit(expression.source, context);
        context.urlText += '/$count';
        context.actionPack = [];
        context.actionPack.push({ op: "buildType", context: this.context, logicalType: null, tempObjectName: 'result', propertyMapping: [{ from: 'cnt', dataType: 'number' }] });
        context.actionPack.push({ op: "copyToResult", tempObjectName: 'result' });

        }
}, {});