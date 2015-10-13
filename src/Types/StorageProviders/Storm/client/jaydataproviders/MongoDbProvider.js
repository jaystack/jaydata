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
$C('$data.modelBinder.mongoDBModelBinderConfigCompiler', $data.modelBinder.ModelBinderConfigCompiler, null, {
    _addPropertyToModelBinderConfig: function (elementType, builder) {
        var storageModel = this._query.context._storageModel.getStorageModel(elementType);
        if (elementType.memberDefinitions) {
            elementType.memberDefinitions.getPublicMappedProperties().forEach(function (prop) {
                if ((!storageModel) || (storageModel && !storageModel.Associations[prop.name] && !storageModel.ComplexTypes[prop.name])) {

                    if (!storageModel && this._query.context.storageProvider.supportedDataTypes.indexOf(Container.resolveType(prop.dataType)) < 0) {
                        //complex type
                        builder.selectModelBinderProperty(prop.name);
                        builder.modelBinderConfig['$type'] = Container.resolveType(prop.dataType);
                        if (this._isoDataProvider) {
                            builder.modelBinderConfig['$selector'] = ['json:' + prop.name + '.results', 'json:' + prop.name];
                        } else {
                            builder.modelBinderConfig['$selector'] = 'json:' + prop.name;
                        }
                        this._addPropertyToModelBinderConfig(Container.resolveType(prop.dataType), builder);
                        builder.popModelBinderProperty();
                    } else {
                        if (prop.key) {
                            builder.addKeyField(prop.computed ? '_id' : prop.name);
                        }
                        if (prop.concurrencyMode === $data.ConcurrencyMode.Fixed) {
                            builder.modelBinderConfig[prop.name] = { $selector: 'json:__metadata', $source: 'etag' }
                        } else {
                            builder.modelBinderConfig[prop.name] = prop.computed ? '_id' : prop.name;
                        }
                    }
                }
            }, this);
        } else {
            builder._binderConfig.$item = {};
            builder.modelBinderConfig = builder._binderConfig.$item;
        }
        if (storageModel) {
            this._addComplexTypeProperties(storageModel.ComplexTypes, builder);
        }
    },
    VisitMemberInfoExpression: function (expression, builder) {
        builder.modelBinderConfig['$type'] = expression.memberDefinition.type;
        if (expression.memberDefinition.storageModel && expression.memberName in expression.memberDefinition.storageModel.ComplexTypes) {
            this._addPropertyToModelBinderConfig(Container.resolveType(expression.memberDefinition.type), builder);
        } else {
            builder.modelBinderConfig['$source'] = expression.memberDefinition.computed ? '_id' : expression.memberName;
        }
    }
});

$C('$data.storageProviders.mongoDB.mongoDBProjectionCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function () {
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
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
    },
    VisitMemberInfoExpression: function (expression, context) {
        if (!context.options.fields) context.options.fields = { _id: 1 };
        if (!context.options.fields[expression.memberName]) context.options.fields[expression.memberName] = 1;
    },
    VisitConstantExpression: function (expression, context) {
    }
});

$C('$data.storageProviders.mongoDB.mongoDBWhereCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider, lambdaPrefix) {
        this.provider = provider;
        this.lambdaPrefix = lambdaPrefix;
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },

    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
    },

    VisitUnaryExpression: function (expression, context) {
        context.unary = expression.nodeType;
        this.Visit(expression.operand, context);
    },

    VisitSimpleBinaryExpression: function (expression, context) {
        if (!context.cursor){
            context.query = {};
            context.cursor = context.query;
        }
        
        var cursor = context.cursor;
        
        switch (expression.nodeType){
            case $data.Expressions.ExpressionType.Or:
                if (context.cursor instanceof Array){
                    var or = { $or: [] };
                    context.cursor.push(or);
                    context.cursor = or.$or;
                }else{
                    context.cursor.$or = [];
                    context.cursor = context.cursor.$or;
                }
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.cursor = cursor;
                break;
            case $data.Expressions.ExpressionType.And:
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
                context.cursor = cursor;
                break;
            case $data.Expressions.ExpressionType.Equal:
            case $data.Expressions.ExpressionType.EqualTyped:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (context.entityType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.field).type))](v);
                else if (context.valueType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](v);
                context.value = v;
                if (context.cursor instanceof Array){
                    var o = {};
                    o[context.queryField] = context.value;
                    context.cursor.push(o);
                }else context.cursor[context.queryField] = context.value;
                break;
            case $data.Expressions.ExpressionType.In:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (v instanceof Array){
                    for (var i = 0; i < v.length; i++){
                        if (context.entityType)
                            v[i] = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.field).type))](v[i]);
                        else if (context.valueType)
                            v[i] = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](v[i]);
                    }
                }
                context.value = v;
                if (context.cursor instanceof Array){
                    var o = {};
                    o[context.queryField] = {};
                    o[context.queryField][context.unary === $data.Expressions.ExpressionType.Not ? '$nin' : expression.resolution.mapTo] = context.value;
                    context.cursor.push(o);
                }else{
                    context.cursor[context.queryField] = {};
                    context.cursor[context.queryField][context.unary === $data.Expressions.ExpressionType.Not ? '$nin' : expression.resolution.mapTo] = context.value;
                }
                if (context.unary === $data.Expressions.ExpressionType.Not) context.unary = undefined;
                break;
            default:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (context.entityType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.field).type))](v);
                else if (context.valueType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](v);
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
                break;
        }
        
        /*if (expression.nodeType == $data.Expressions.ExpressionType.Or) context.or = true;
        else if (expression.nodeType == $data.Expressions.ExpressionType.And) context.and = true;
        
        this.Visit(expression.left, context);
        this.Visit(expression.right, context);
        
        if (expression.nodeType == $data.Expressions.ExpressionType.Or && context.stackOr && context.stackOr.length){
            var or = [];
            while (context.stackOr.length){
                var field = context.stackOr.pop();
                var expr = {};
                
                expr[field.field] = field.query;
                or.push(expr);
                delete context.query[field.field];
            }
            if (or.length == 1){
                if (context.and){
                    if (!context.stackAnd) context.stackAnd = [];
                    context.stackAnd.push({ field: '$or', query: [or[0]] });
                }else context.query = or[0];
            }else{
                if (context.and){
                    if (!context.stackAnd) context.stackAnd = [];
                    context.stackAnd.push({ field: '$or', query: or });
                }else context.query.$or = or;
            }
            context.or = false;
        }else if (expression.nodeType == $data.Expressions.ExpressionType.And && context.stackAnd && context.stackAnd.length){
            var and = [];
            while (context.stackAnd.length){
                var field = context.stackAnd.pop();
                var expr = {};
                
                expr[field.field] = field.query;
                and.push(expr);
                delete context.query[field.field];
            }
            if (and.length == 1){
                if (context.or){
                    if (!context.stackOr) context.stackOr = [];
                    context.stackOr.push({ field: '$and', query: [and[0]] });
                }else context.query = and[0];
            }else{
                if (context.or){
                    if (!context.stackOr) context.stackOr = [];
                    context.stackOr.push({ field: '$and', query: and });
                }else context.query.$and = and;
            }
            context.and = false;
        }else if (expression.nodeType !== $data.Expressions.ExpressionType.And){
            if (expression.nodeType !== $data.Expressions.ExpressionType.Or){
                context.queryField = context.field;
                if (context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
            }
            if (expression.nodeType === $data.Expressions.ExpressionType.Equal || expression.nodeType === $data.Expressions.ExpressionType.EqualTyped){
                var v = context.value;
                if (context.entityType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.field).type))](v);
                else if (context.valueType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](v);
                context.query[context.queryField] = v;
            }else if (expression.nodeType == $data.Expressions.ExpressionType.In){
                var v = context.value;
                if (v instanceof Array){
                    for (var i = 0; i < v.length; i++){
                        if (context.entityType)
                            v[i] = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.field).type))](v[i]);
                        else if (context.valueType)
                            v[i] = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](v[i]);
                    }
                }
                if (!context.query[context.queryField]) context.query[context.queryField] = {};
                if (context.unary == $data.Expressions.ExpressionType.Not){
                    context.query[context.queryField].$nin = v;
                    context.unary = undefined;
                }else{
                    context.query[context.queryField][expression.resolution.mapTo] = v;
                }
            }else{
                if (!context.query[context.queryField]) context.query[context.queryField] = {};
                context.query[context.queryField][expression.resolution.mapTo] = context.value;
            }
            
            if (context.or){
                if (!context.stackOr) context.stackOr = [];
                context.stackOr.push({ field: context.queryField, query: context.query[context.queryField] });
            }else if (context.and){
                if (!context.stackAnd) context.stackAnd = [];
                context.stackAnd.push({ field: context.queryField, query: context.query[context.queryField] });
            }
            
            context.field = undefined;
            context.value = undefined;
        }*/
    },

    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },

    VisitAssociationInfoExpression: function (expression, context) {
        context.data += expression.associationInfo.FromPropertyName;
    },

    VisitMemberInfoExpression: function (expression, context) {
        //if (!context.query[expression.memberName]) context.query[expression.memberName] = null;
        context.field = expression.memberName;
    },

    VisitQueryParameterExpression: function (expression, context) {
        context.data += this.provider.fieldConverter.toDb[expression.type](expression.value);
    },

    VisitEntityFieldOperationExpression: function (expression, context) {
        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);
        
        this.Visit(expression.source.selector, context);

        //TODO refactor!
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
        
        if (!context.query[context.field]) context.query[context.field] = {};
        
        switch (opName){
            case 'contains':
                context.query[context.field].$regex = context.value;
                break;
            case 'startsWith':
                context.query[context.field].$regex = '^' + context.value;
                break;
            case 'endsWith':
                context.query[context.field].$regex = context.value + '$';
                break;
            default:
                break;
        }
    },

    VisitConstantExpression: function (expression, context) {
        var valueType = Container.getTypeName(expression.value);
        context.valueType = valueType;
        context.value = expression.value; //this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](expression.value);
    },

    VisitEntityExpression: function (expression, context) {
        context.entityType = expression.entityType;
        this.Visit(expression.source, context);
    },

    VisitEntitySetExpression: function (expression, context) {
        this.Visit(expression.source, context);
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
            context.data += "/";
        }
    },

    VisitFrameOperationExpression: function (expression, context) {
        this.Visit(expression.source, context);

        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);

        //TODO refactor!
        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;
        context.data += opName;
        context.data += "(";
        var paramCounter = 0;
        var params = opDef.parameters || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++]
            };
        });

        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg.value instanceof $data.Queryable) {
                var frameExpression = new opDef.frameType(arg.value.expression);
                var preparator = new $data.Expressions.QueryExpressionCreator(arg.value.entityContext);
                var prep_expression = preparator.Visit(frameExpression);

                var compiler = new $data.storageProviders.mongoDB.mongoDBWhereCompiler(this.provider, true);
                var frameContext = { data: "" };
                var compiled = compiler.compile(prep_expression, frameContext);

                context.data += (frameContext.lambda + ': ' + frameContext.data);
            };
        }
        context.data += ")";
    }
});

$C('$data.storageProviders.mongoDB.mongoDBOrderCompiler', $data.storageProviders.mongoDB.mongoDBWhereCompiler, null, {
    constructor: function (provider) {
        this.provider = provider;
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitOrderExpression: function (expression, context) {
        var orderContext = { data: '' };
        this.Visit(expression.selector, orderContext);
        if (!context.options.sort) context.options.sort = {};
        context.options.sort[orderContext.data] = expression.nodeType == $data.Expressions.ExpressionType.OrderByDescending ? -1 : 1;
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
        this.Visit(expression.selector, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.source, context);
            this.Visit(expression.selector, context);
        }
    },
    VisitAssociationInfoExpression: function (expression, context) {
    },
    VisitEntityExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitMemberInfoExpression: function (expression, context) {
        context.data += expression.memberName;
    }
});

$C('$data.storageProviders.mongoDB.mongoDBPagingCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitPagingExpression: function (expression, context) {
        var pagingContext = { data: 0 };
        this.Visit(expression.amount, pagingContext);
        switch (expression.nodeType) {
            case $data.Expressions.ExpressionType.Skip: context.options.skip = pagingContext.data; break;
            case $data.Expressions.ExpressionType.Take: context.options.limit = pagingContext.data; break;
            default: Guard.raise("Not supported nodeType"); break;
        }
    },
    VisitConstantExpression: function (expression, context) {
        context.data += expression.value;
    }
});

$C('$data.storageProviders.mongoDB.mongoDBCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function(){
        this.context = {};
        this.provider = {};
        this.includes = null;
        this.mainEntitySet = null;
    },
    compile: function(query){
        this.provider = query.context.storageProvider;
        this.context = query.context;
        this.mainEntitySet = query.context.getEntitySetFromElementType(query.defaultType);

        query.find = {
            query: {},
            options: {}
        };
        
        query.modelBinderConfig = {};
        var modelBinder = new $data.modelBinder.mongoDBModelBinderConfigCompiler(query, this.includes, false);
        modelBinder.Visit(query.expression);
        
        this.Visit(query.expression, query.find);
        
        delete query.find.field;
        delete query.find.value;
        delete query.find.data;
        delete query.find.stack;
        delete query.find.or;
        
        return query;
    },
    VisitOrderExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var orderCompiler = new $data.storageProviders.mongoDB.mongoDBOrderCompiler(this.provider);
        orderCompiler.compile(expression, context);
    },
    VisitPagingExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var pagingCompiler = new $data.storageProviders.mongoDB.mongoDBPagingCompiler();
        pagingCompiler.compile(expression, context);
    },
    VisitFilterExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var filterCompiler = new $data.storageProviders.mongoDB.mongoDBWhereCompiler(this.provider);
        context.data = "";
        filterCompiler.compile(expression.selector, context);
    },
    VisitProjectionExpression: function (expression, context) {
        this.Visit(expression.source, context);

        var projectionCompiler = new $data.storageProviders.mongoDB.mongoDBProjectionCompiler(this.context);
        projectionCompiler.compile(expression, context);
    }
});

$C('$data.storageProviders.mongoDB.mongoDBProvider', $data.StorageProviderBase, null,
{
    constructor: function(cfg, ctx){
        this.driver = $data.mongoDBDriver;
        this.context = ctx;
        this.providerConfiguration = $data.typeSystem.extend({
            dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged,
            address: '127.0.0.1',
            port: 27017,
            serverOptions: {},
            databaseName: 'test'
        }, cfg);
    },
    _getServer: function(){
        if (this.providerConfiguration.slave && this.providerConfiguration.slave.address && this.providerConfiguration.slave.port){
            return new this.driver.ReplSetServers([
                new this.driver.Server(this.providerConfiguration.address, this.providerConfiguration.port, this.providerConfiguration.serverOptions),
                new this.driver.Server(this.providerConfiguration.slave.address, this.providerConfiguration.slave.port, this.providerConfiguration.slave.serverOptions || {})
            ]);
        }else return this.driver.Server(this.providerConfiguration.address, this.providerConfiguration.port, this.providerConfiguration.serverOptions);
    },
    initializeStore: function(callBack){
        var self = this;
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        
        switch (this.providerConfiguration.dbCreation){
            case $data.storageProviders.DbCreationType.DropAllExistingTables:
                var server = this._getServer();
                new this.driver.Db(this.providerConfiguration.databaseName, server, {}).open(function(error, client){
                    if (error) callBack.error(error);
                    
                    var cnt = 0;
                    var collectionCount = 0;
                    var readyFn = function(client){
                        if (--cnt == 0){
                            callBack.success(self.context);
                            client.close();
                        }
                    };
                    
                    for (var i in self.context._entitySetReferences){
                        if (self.context._entitySetReferences.hasOwnProperty(i))
                            cnt++;
                    }
                    
                    collectionCount = cnt;
                    
                    for (var i in self.context._entitySetReferences){
                        if (self.context._entitySetReferences.hasOwnProperty(i)){
                            
                            client.dropCollection(self.context._entitySetReferences[i].tableName, function(error, result){
                                readyFn(client);
                            });
                        }
                    }
                });
                break;
            default:
                callBack.success(this.context);
                break;
        }
    },
    executeQuery: function(query, callBack){
        var self = this;
        
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        
        this.entitySet = query.context.getEntitySetFromElementType(query.defaultType);
        new $data.storageProviders.mongoDB.mongoDBCompiler().compile(query);
        
        var server = this._getServer();
        new this.driver.Db(this.providerConfiguration.databaseName, server, {}).open(function(error, client){
            if (error) callBack.error(error);
            
            var collection = new self.driver.Collection(client, self.entitySet.tableName);
            var find = query.find;
            
            var cb = function(error, results){
                if (error) callBack.error(error);
                
                query.rawDataList = results instanceof Array ? results : [{ cnt: results }];
                query.context = self.context;
                
                callBack.success(query);
                client.close();
            };
            switch (query.expression.nodeType){
                case $data.Expressions.ExpressionType.Count:
                    collection.find(find.query, find.options).count(cb);
                    break;
                default:
                    collection.find(find.query, find.options).toArray(cb);
                    break;
            }
        });
    },
    _saveCollections: function(callBack, collections){
        var self = this;
        var successItems = 0;
        var server = this._getServer();
        
        var counterState = 0;
        var counterFn = function(callback){
            if (--counterState == 0) callback();
        }
        
        var insertFn = function(client, c, collection){
            var docs = [];
            for (var i = 0; i < c.insertAll.length; i++){
                var d = c.insertAll[i];
                var props = Container.resolveType(d.type).memberDefinitions.getPublicMappedProperties();
                for (var j = 0; j < props.length; j++){
                    var p = props[j];
                    if (!p.computed){
                        d.data[p.name] = self.fieldConverter.toDb[Container.resolveName(Container.resolveType(p.type))](d.data[p.name]);
                    }
                }

                docs.push(d.data);
            }
        
            collection.insert(docs, { safe: true }, function(error, result){
                if (error) callBack.error(error);
                
                for (var k = 0; k < result.length; k++){
                    var it = result[k];
                    var d = c.insertAll[k];
                    var props = Container.resolveType(d.type).memberDefinitions.getPublicMappedProperties();
                    for (var j = 0; j < props.length; j++){
                        var p = props[j];
                        d.entity[p.name] = self.fieldConverter.fromDb[Container.resolveName(Container.resolveType(p.type))](it[p.computed ? '_id' : p.name]);
                    }
                }
                
                successItems += result.length;
                
                if (c.removeAll && c.removeAll.length){
                    removeFn(client, c, collection);
                }else{
                    if (c.updateAll && c.updateAll.length){
                        updateFn(client, c, collection);
                    }else{
                        callBack.success(successItems);
                        client.close();
                    }
                }
            });
        };
        
        var updateFn = function(client, c, collection){
            counterState = c.updateAll.length;
            for (var i = 0; i < c.updateAll.length; i++){
                var u = c.updateAll[i];
                var where = {};
                
                var keys = Container.resolveType(u.type).memberDefinitions.getKeyProperties();
                for (var j = 0; j < keys.length; j++){
                    var k = keys[j];
                    where[k.computed ? '_id' : k.name] = self.fieldConverter.toDb[Container.resolveName(Container.resolveType(k.type))](u.entity[k.name]);
                }
                
                var set = {};
                var props = Container.resolveType(u.type).memberDefinitions.getPublicMappedProperties();
                for (var j = 0; j < props.length; j++){
                    var p = props[j];
                    if (!p.computed){
                        set[p.name] = self.fieldConverter.toDb[Container.resolveName(Container.resolveType(p.type))](u.entity[p.name]);
                    }
                }
                
                collection.update(where, { $set: set }, { safe: true }, function(error, result){
                    if (error) callBack.error(error);
                    
                    successItems++;
                    counterFn(function(){
                        callBack.success(successItems);
                        client.close();
                    });
                });
            }
        };
        
        var removeFn = function(client, c, collection){
            counterState = c.removeAll.length;
            for (var i = 0; i < c.removeAll.length; i++){
                var r = c.removeAll[i];
                
                var keys = Container.resolveType(r.type).memberDefinitions.getKeyProperties();
                for (var j = 0; j < keys.length; j++){
                    var k = keys[j];
                    r.data[k.computed ? '_id' : k.name] = self.fieldConverter.toDb[Container.resolveName(Container.resolveType(k.type))](r.entity[k.name]);
                }
                
                var props = Container.resolveType(r.type).memberDefinitions.getPublicMappedProperties();
                for (var j = 0; j < props.length; j++){
                    var p = props[j];
                    if (!p.computed){
                        r.data[p.name] = self.fieldConverter.toDb[Container.resolveName(Container.resolveType(p.type))](r.data[p.name]);
                    }
                }
                
                collection.remove(r.data, { safe: true }, function(error, cnt){
                    if (error) callBack.error(error);
                    
                    successItems += cnt;
                    counterFn(function(){
                        if (c.updateAll && c.updateAll.length){
                            updateFn(client, c, collection);
                        }else{
                            callBack.success(successItems);
                            client.close();
                        }
                    });
                });
            }
        };
        
        new this.driver.Db(this.providerConfiguration.databaseName, server, {}).open(function(error, client){
            if (error) callBack.error(error);
            for (var es in collections){
                if (collections.hasOwnProperty(es)){
                    var c = collections[es];
                    var collection = new self.driver.Collection(client, es);
                    if (c.insertAll && c.insertAll.length){
                        insertFn(client, c, collection);
                    }else{
                        if (c.removeAll && c.removeAll.length){
                            removeFn(client, c, collection);
                        }else{
                            if (c.updateAll && c.updateAll.length){
                                updateFn(client, c, collection);
                            }else{
                                callBack.success(0);
                                client.close();
                            }
                        }
                    }
                }
            }
        });
    },
    saveChanges: function(callBack, changedItems){
        var self = this;
        if (changedItems.length){
            var independentBlocks = this.buildIndependentBlocks(changedItems);
            
            var convertedItems = [];
            var collections = {};
            for (var i = 0; i < independentBlocks.length; i++){
                for (var j = 0; j < independentBlocks[i].length; j++) {
                    convertedItems.push(independentBlocks[i][j].data);
                    
                    var es = collections[independentBlocks[i][j].entitySet.name];
                    if (!es){
                        es = {};
                        collections[independentBlocks[i][j].entitySet.name] = es;
                    }
                    
                    var initData = { entity: independentBlocks[i][j].data, data: this.save_getInitData(independentBlocks[i][j], convertedItems), type: Container.resolveName(independentBlocks[i][j].data.getType()) };
                    switch (independentBlocks[i][j].data.entityState){
                        case $data.EntityState.Unchanged: continue; break;
                        case $data.EntityState.Added:
                            if (!es.insertAll) es.insertAll = [];
                            es.insertAll.push(initData);
                            break;
                        case $data.EntityState.Modified:
                            if (!es.updateAll) es.updateAll = [];
                            es.updateAll.push(initData);
                            break;
                        case $data.EntityState.Deleted:
                            if (!es.removeAll) es.removeAll = [];
                            es.removeAll.push(initData);
                            break;
                        default: Guard.raise(new Exception("Not supported Entity state"));
                    }
                }
            }
            
            this._saveCollections(callBack, collections);
        }else{
            callBack.success(0);
        }
    },
    save_getInitData: function(item, convertedItems) {
        var self = this;
        item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
        var serializableObject = {}
        item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
            if (memdef.kind == $data.MemberTypes.navProperty || memdef.kind == $data.MemberTypes.complexProperty || (memdef.kind == $data.MemberTypes.property && !memdef.notMapped)) {
                serializableObject[memdef.computed ? '_id' : memdef.name] = item.physicalData[memdef.name];
            }
        }, this);
        return serializableObject;
    },
    
    supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date, $data.ObjectID], writable: false },
    
    supportedBinaryOperators: {
        value: {
            equal: { mapTo: ':', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },
            notEqual: { mapTo: '$ne', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },
            equalTyped: { mapTo: ':', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },
            notEqualTyped: { mapTo: '$ne', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },
            greaterThan: { mapTo: '$gt', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },
            greaterThanOrEqual: { mapTo: '$gte', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },

            lessThan: { mapTo: '$lt', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },
            lessThenOrEqual: { mapTo: '$lte', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },
            or: { mapTo: '$or', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },
            and: { mapTo: '$and', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression] },

            /*add: { mapTo: 'add', dataType: "number", allowedIn: [$data.Expressions.FilterExpression] },
            divide: { mapTo: 'div', allowedIn: [$data.Expressions.FilterExpression] },
            multiply: { mapTo: 'mul', allowedIn: [$data.Expressions.FilterExpression] },
            subtract: { mapTo: 'sub', allowedIn: [$data.Expressions.FilterExpression] },
            modulo: { mapTo: 'mod', allowedIn: [$data.Expressions.FilterExpression] },*/

            "in": { mapTo: "$in", allowedIn: [$data.Expressions.FilterExpression] }
        }
    },

    supportedUnaryOperators: {
        value: {
            not: { mapTo: '$nor' }
        }
    },

    supportedFieldOperations: {
        value: {
            /* string functions */

            contains: {
                dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "substring", dataType: "string" }]
            },

            startsWith: {
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            },

            endsWith: {
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            }/*,

            length: {
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },

            indexOf: {
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression],
                baseIndex: 1,
                parameters: [{ name: '@expression', dataType: "string" }, { name: 'strFragment', dataType: 'string' }]
            },

            replace: {
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: '@expression', dataType: "string" }, { name: 'strFrom', dataType: 'string' }, { name: 'strTo', dataType: 'string' }]
            },

            substr: {
                mapTo: "substring",
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "startFrom", dataType: "number" }, { name: "length", dataType: "number", optional: "true" }]
            },

            toLowerCase: {
                mapTo: "tolower",
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },

            toUpperCase: {
                mapTo: "toupper",
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "string" }]

            },

            trim: {
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },


            concat: {
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            },*/


            /* data functions */

            /*day: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            hour: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            minute: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            month: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            second: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            year: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },*/

            /* number functions */
            /*round: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            floor: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            ceiling: {
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            }*/
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
            /*some: {
                invokable: false,
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                mapTo: 'any',
                frameType: $data.Expressions.SomeExpression
            },
            every: {
                invokable: false,
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                mapTo: 'all',
                frameType: $data.Expressions.EveryExpression
            },*/
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {}/*,
            include: {}*/
        },
        enumerable: true,
        writable: true
    },
    fieldConverter: {
        value: {
            fromDb: {
                '$data.Integer': function (number) { return number; },
                '$data.Number': function (number) { return number; },
                '$data.Date': function (date) { return date ? new Date(date) : date; },
                '$data.String': function (text) { return text; },
                '$data.Boolean': function (bool) { return bool; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } return JSON.parse(o); },
                '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } return JSON.parse(o); },
                '$data.ObjectID': function(id){ return id ? new Buffer(id.toString(), 'ascii').toString('base64') : id; }
            },
            toDb: {
                '$data.Integer': function (number) { return number; },
                '$data.Number': function (number) { return number; },
                '$data.Date': function (date) { return date; },
                '$data.String': function (text) { return text; },
                '$data.Boolean': function (bool) { return typeof bool === 'string' ? (bool === 'true' ? true : false) : !!bool; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Object': function (o) { return JSON.stringify(o); },
                '$data.Array': function (o) { return JSON.stringify(o); },
                '$data.ObjectID': function(id){ return id && typeof id === 'string' ? new $data.mongoDBDriver.ObjectID.createFromHexString(new Buffer(id, 'base64').toString('ascii')) : id; }
            }
        }
    }
}, {
    isSupported: {
        get: function(){
            if (!$data.mongoDBDriver) return false;
            return true;
        },
        set: function(value){}
    }
});

if ($data.storageProviders.mongoDB.mongoDBProvider.isSupported){
    $data.StorageProviderBase.registerProvider('mongoDB', $data.storageProviders.mongoDB.mongoDBProvider);
}
