// JayData 1.3.6
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki, Gábor Dolla
//
// More info: http://jaydata.org
$data.InMemoryConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': $data.Container.proxyConverter,
        '$data.DateTimeOffset': $data.Container.proxyConverter,
        '$data.Time': $data.Container.proxyConverter,
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } return o; },
        '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } return o; },
        '$data.Guid': function (guid) { return guid ? $data.parseGuid(guid).toString() : guid; },
        '$data.GeographyPoint': function (g) { if (g) { return new $data.GeographyPoint(g); } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return new $data.GeographyLineString(g); } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return new $data.GeographyPolygon(g); } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return new $data.GeographyMultiPoint(g); } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return new $data.GeographyMultiLineString(g); } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return new $data.GeographyMultiPolygon(g); } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return new $data.GeographyCollection(g); } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return new $data.GeometryPoint(g); } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return new $data.GeometryLineString(g); } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return new $data.GeometryPolygon(g); } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return new $data.GeometryMultiPoint(g); } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return new $data.GeometryMultiLineString(g); } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return new $data.GeometryMultiPolygon(g); } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return new $data.GeometryCollection(g); } return g; }
    },
    toDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': $data.Container.proxyConverter,
        '$data.DateTimeOffset': $data.Container.proxyConverter,
        '$data.Time': $data.Container.proxyConverter,
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Object': $data.Container.proxyConverter,
        '$data.Array': $data.Container.proxyConverter,
        '$data.Guid': function (guid) { return guid ? guid.toString() : guid; },
        '$data.GeographyPoint': function (g) { if (g) { return g; } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return g; } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return g; } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return g; } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return g; } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return g; } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return g; } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return g; } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return g; } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return g; } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return g; } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return g; } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return g; } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return g; } return g; }
    },
    escape: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': function (date) { return date ? "new Date(Date.parse('" + date.toISOString() + "'))" : date; },
        '$data.DateTimeOffset': function (date) { return date ? "new Date(Date.parse('" + date.toISOString() + "'))" : date; },
        '$data.Time': function (date) { return date ? "'" + date + "'" : date; },
        '$data.String': function (text) { return "'" + text.replace(/'/g, "''") + "'"; },
        '$data.Boolean': function (bool) { return bool ? 'true' : 'false'; },
        '$data.Blob': function (blob) { return "'" + $data.Blob.toString(blob) + "'"; },
        '$data.Object': function (o) { return JSON.stringify(o); },
        '$data.Array': function (o) { return JSON.stringify(o); },
        '$data.Guid': function (guid) { return guid ? "'" + guid.toString() + "'" : guid; }
    }
};
$data.mongoDBConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': function (date) { return date ? new Date(date) : date; },
        '$data.DateTimeOffset': function (date) { return date ? new Date(date) : date; },
        '$data.Time': function (date) { return date ? Container.convertTo(date, $data.Time) : date; },
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': function (v) { return v ? $data.Container.convertTo(typeof v === 'string' ? atob(v) : v.buffer || v, $data.Blob) : v; },
        '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } return o; },
        '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } return o; },
        '$data.ObjectID': function (id) { return id ? new Buffer(id.toString(), 'ascii').toString('base64') : id; },
        '$data.GeographyPoint': function (g) { if (g) { return new $data.GeographyPoint(g); } return g; },
        '$data.GeographyLineString': function (g) { if (g) { return new $data.GeographyLineString(g); } return g; },
        '$data.GeographyPolygon': function (g) { if (g) { return new $data.GeographyPolygon(g); } return g; },
        '$data.GeographyMultiPoint': function (g) { if (g) { return new $data.GeographyMultiPoint(g); } return g; },
        '$data.GeographyMultiLineString': function (g) { if (g) { return new $data.GeographyMultiLineString(g); } return g; },
        '$data.GeographyMultiPolygon': function (g) { if (g) { return new $data.GeographyMultiPolygon(g); } return g; },
        '$data.GeographyCollection': function (g) { if (g) { return new $data.GeographyCollection(g); } return g; },
        '$data.GeometryPoint': function (g) { if (g) { return new $data.GeometryPoint(g); } return g; },
        '$data.GeometryLineString': function (g) { if (g) { return new $data.GeometryLineString(g); } return g; },
        '$data.GeometryPolygon': function (g) { if (g) { return new $data.GeometryPolygon(g); } return g; },
        '$data.GeometryMultiPoint': function (g) { if (g) { return new $data.GeometryMultiPoint(g); } return g; },
        '$data.GeometryMultiLineString': function (g) { if (g) { return new $data.GeometryMultiLineString(g); } return g; },
        '$data.GeometryMultiPolygon': function (g) { if (g) { return new $data.GeometryMultiPolygon(g); } return g; },
        '$data.GeometryCollection': function (g) { if (g) { return new $data.GeometryCollection(g); } return g; },
        "$data.Guid": function (g) { return g ? $data.parseGuid(g).toString() : g; }
    },
    toDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Date': $data.Container.proxyConverter,
        '$data.DateTimeOffset': $data.Container.proxyConverter,
        '$data.Time': $data.Container.proxyConverter,
        '$data.String': $data.Container.proxyConverter,
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Object': $data.Container.proxyConverter,
        '$data.Array': $data.Container.proxyConverter,
        '$data.ObjectID': function (id) {
            if (id && typeof id === 'string') {
                try {
                    return new $data.ObjectID(id);
                } catch (e) {
                    try {
                        return new $data.ObjectID(new Buffer(id, 'base64').toString('ascii'));
                    } catch (e) {
                        console.log(e);
                        return id;
                    }
                }
            } else return id;
        },
        '$data.GeographyPoint': function (g) { return g ? g.coordinates : g; },
        '$data.GeographyLineString': $data.Container.proxyConverter,
        '$data.GeographyPolygon': $data.Container.proxyConverter,
        '$data.GeographyMultiPoint': $data.Container.proxyConverter,
        '$data.GeographyMultiLineString': $data.Container.proxyConverter,
        '$data.GeographyMultiPolygon': $data.Container.proxyConverter,
        '$data.GeographyCollection': $data.Container.proxyConverter,
        '$data.GeometryPoint': function (g) { return g ? g.coordinates : g; },
        '$data.GeometryLineString': $data.Container.proxyConverter,
        '$data.GeometryPolygon': $data.Container.proxyConverter,
        '$data.GeometryMultiPoint': $data.Container.proxyConverter,
        '$data.GeometryMultiLineString': $data.Container.proxyConverter,
        '$data.GeometryMultiPolygon': $data.Container.proxyConverter,
        '$data.GeometryCollection': $data.Container.proxyConverter,
        "$data.Guid": function (g) { return g ? g.toString() : g; }
    }
};
$C('$data.modelBinder.mongoDBModelBinderConfigCompiler', $data.modelBinder.ModelBinderConfigCompiler, null, {
    _addPropertyToModelBinderConfig: function (elementType, builder) {
        var storageModel = this._query.context._storageModel.getStorageModel(elementType);
        if (elementType.memberDefinitions) {
            elementType.memberDefinitions.getPublicMappedProperties().forEach(function (prop) {
                if ((!storageModel) || (storageModel && !storageModel.Associations[prop.name] && !storageModel.ComplexTypes[prop.name])) {

                    if (!storageModel && this._query.context.storageProvider.supportedDataTypes.indexOf(Container.resolveType(prop.dataType)) < 0) {
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
                            var dt = Container.resolveType(prop.dataType);
                            if (dt === $data.Array || dt === $data.Object){
                                builder.modelBinderConfig[prop.name] = {
                                    $type: dt,
                                    $source: prop.name
                                };
                            }else builder.modelBinderConfig[prop.name] = prop.computed ? '_id' : prop.name;
                        }
                    }
                }
            }, this);
        } else {
            builder._binderConfig.$item = builder._binderConfig.$item || {};
            builder.modelBinderConfig = builder._binderConfig.$item;
        }
        if (storageModel) {
            this._addComplexTypeProperties(storageModel.ComplexTypes, builder);
        }
    },
    _addComplexType: function(ct, builder){
        if (ct.ToType !== $data.Array){
            builder.modelBinderConfig['$type'] = ct.ToType;
            if (this._isoDataProvider) {
                builder.modelBinderConfig['$selector'] = ['json:' + ct.FromPropertyName + '.results', 'json:' + ct.FromPropertyName];
            } else {
                builder.modelBinderConfig['$selector'] = 'json:' + ct.FromPropertyName;
            }
            this._addPropertyToModelBinderConfig(ct.ToType, builder);
        }else{
            var dt = ct.ToType;
            var et = Container.resolveType(ct.FromType.memberDefinitions.getMember(ct.FromPropertyName).elementType);
            if (dt === $data.Array && et && et.isAssignableTo && et.isAssignableTo($data.Entity)){
                config = {
                    $type: $data.Array,
                    $selector: 'json:' + ct.FromPropertyName,
                    $item: {
                        $type: et
                    }
                };
                var md = et.memberDefinitions.getPublicMappedProperties();
                for (var i = 0; i < md.length; i++){
                    config.$item[md[i].name] = { $type: md[i].type, $source: md[i].name };
                }
                $data.typeSystem.extend(builder.modelBinderConfig, config);
            }else{
                if (dt === $data.Array && et === $data.ObjectID){
                    $data.typeSystem.extend(builder.modelBinderConfig, {
                        $type: $data.Array,
                        $selector: 'json:' + ct.FromPropertyName,
                        $item: {
                            $type: $data.ObjectID,
                            $value: function(meta, data){ return data; }
                        }
                    });
                }else{
                    $data.typeSystem.extend(builder.modelBinderConfig, {
                        $type: ct.ToType,
                        $source: ct.FromPropertyName
                    });
                }
            }
        }
    },
    _addComplexTypeProperties: function (complexTypes, builder) {
        var self = this;
        complexTypes.forEach(function (ct) {
            builder.selectModelBinderProperty(ct.FromPropertyName);
            self._addComplexType(ct, builder);
            builder.popModelBinderProperty();
        }, this);
    },
    VisitComplexTypeExpression: function (expression, builder) {
        this.Visit(expression.source, builder);
        this.Visit(expression.selector, builder);
        
        if (('$selector' in builder.modelBinderConfig) && (builder.modelBinderConfig.$selector.length > 0)) {
            if (builder.modelBinderConfig.$selector instanceof $data.Array) {
                var temp = builder.modelBinderConfig.$selector[1];
                builder.modelBinderConfig.$selector[0] = temp + '.' + expression.selector.memberName + '.results';
                builder.modelBinderConfig.$selector[1] = temp + '.' + expression.selector.memberName;
            } else {
                var type = Container.resolveType(expression.selector.memberDefinition.type);
                var elementType = type === $data.Array && expression.selector.memberDefinition.elementType ? Container.resolveType(expression.selector.memberDefinition.elementType) : type;
                if (elementType.memberDefinitions.getMember(expression.selector.memberName))
                    builder.modelBinderConfig.$selector += '.' + expression.selector.memberName;
            }

        } else {
            var type = Container.resolveType(expression.selector.memberDefinition.type);
            var elementType = type === $data.Array && expression.selector.memberDefinition.elementType ? Container.resolveType(expression.selector.memberDefinition.elementType) : undefined;
            if (type === $data.Array && elementType && elementType.isAssignableTo && elementType.isAssignableTo($data.Entity)){
                this._addComplexType(expression.selector.memberDefinition.storageModel.ComplexTypes[expression.selector.memberDefinition.name], builder);
            }else{
                builder.modelBinderConfig.$source = expression.selector.memberName;
                
                if (type !== $data.Array){
                    builder.modelBinderConfig.$selector = 'json:' + expression.selector.memberDefinition.name;
                }
                
                if (builder._binderConfig.$item === builder.modelBinderConfig &&
                    expression.selector.memberDefinition.storageModel &&
                    expression.selector.memberDefinition.storageModel.ComplexTypes[expression.selector.memberDefinition.name]){
                    builder.modelBinderConfig.$selectorMemberInfo = builder.modelBinderConfig.$selector;
                    delete builder.modelBinderConfig.$selector;
                }else{
                    delete builder.modelBinderConfig.$source;
                }
            }
        }
    },
    VisitMemberInfoExpression: function (expression, builder) {
        var type = Container.resolveType(expression.memberDefinition.type);
        var elementType = type === $data.Array && expression.memberDefinition.elementType ? Container.resolveType(expression.memberDefinition.elementType) : undefined;
        builder.modelBinderConfig['$type'] = type;
        
        if (type === $data.Array && elementType && elementType.isAssignableTo && elementType.isAssignableTo($data.Entity)){
            this._addComplexType(expression.memberDefinition.storageModel.ComplexTypes[expression.memberName], builder);
        }else{
            if (expression.memberDefinition.storageModel && expression.memberName in expression.memberDefinition.storageModel.ComplexTypes) {
                this._addPropertyToModelBinderConfig(Container.resolveType(expression.memberDefinition.type), builder);
            } else {
                if (builder._binderConfig.$item === builder.modelBinderConfig){
                    builder._binderConfig.$item = {
                        $type: builder.modelBinderConfig.$type,
                        $selector: builder.modelBinderConfig.$selectorMemberInfo || builder.modelBinderConfig.$selector,
                        $source: expression.memberDefinition.computed ? '_id' : expression.memberName
                    };
                }else{
                    builder.modelBinderConfig['$source'] = expression.memberDefinition.computed ? '_id' : expression.memberName;
                }
            }
        }
    }
});
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
$C('$data.storageProviders.mongoDB.mongoDBFilterCompiler', $data.Expressions.EntityExpressionVisitor, null, {
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
        if (!context.cursor) {
            context.query = {};
            context.cursor = context.query;
        }
        this.Visit(expression, context);
        if (context.query.$and){
            var and = context.query.$and;
            var query = {};
            var valid = true;
            for (var i = 0; i < and.length; i++){
                var a = and[i];
                for (var p in a){
                    if (query[p]){
                        valid = false;
                        break;
                    }
                    query[p] = a[p];
                }
                if (!valid) break;
            }
            if (valid) context.query = query;
        }
        if (this.compiler){
            this.compiler.includes = this.includes;
        }
    },

    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
        if (expression.expression && expression.expression.nodeType === $data.Expressions.ExpressionType.Constant){
            context.value = expression.expression.value;
            context.queryField = context.field = $data.Guid.NewGuid();
            if (context.value === true) context.value = null;
            
            if (context.cursor instanceof Array){
                var o = {};
                o[context.queryField] = context.value;
                context.cursor.push(o);
            }else context.cursor[context.queryField] = context.value;
        }
    },

    VisitUnaryExpression: function (expression, context) {
        context.unary = expression.nodeType;
        this.Visit(expression.operand, context);
    },
    
    _constExpressionFilter: function(expression, context){
        if (expression.left && expression.left.nodeType === $data.Expressions.ExpressionType.Constant && expression.right && [$data.Expressions.ExpressionType.Or, $data.Expressions.ExpressionType.And].indexOf(expression.nodeType) >= 0){
            context.value = expression.left.value;
            context.queryField = context.field = $data.Guid.NewGuid();
            if (context.value === true) context.value = null;
            
            if (context.cursor instanceof Array){
                var o = {};
                o[context.queryField] = context.value;
                context.cursor.push(o);
            }else context.cursor[context.queryField] = context.value;
        }
    },

    VisitSimpleBinaryExpression: function (expression, context) {
     
        var cursor = context.cursor;
        
        switch (expression.nodeType){
            case $data.Expressions.ExpressionType.Or:
                var orCursor = context.cursor;
                
                if (context.cursor instanceof Array){
                    var or = context.unary === $data.Expressions.ExpressionType.Not ? { $nor: [] } : { $or: [] };
                    context.cursor.push(or);
                    context.cursor = or[context.unary === $data.Expressions.ExpressionType.Not ? '$nor' : '$or'];
                }else{
                    context.cursor[context.unary === $data.Expressions.ExpressionType.Not ? '$nor' : '$or'] = [];
                    context.cursor = context.cursor[context.unary === $data.Expressions.ExpressionType.Not ? '$nor' : '$or'];
                }
                if (context.unary === $data.Expressions.ExpressionType.Not) context.unary = undefined;
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                this._constExpressionFilter(expression, context);
                
                if (orCursor instanceof Array){
                    for (var i = 0; i < orCursor.length; i++){
                        var o = orCursor[i];
                        if (o.$or){
                            if (o.$or.length == 0){
                                delete o.$or;
                            }else if (o.$or.length == 1){
                                $data.typeSystem.extend(o, o.$or[0]);
                                delete o.$or;
                            }
                        }
                    }
                }else if (orCursor.$or){
                    if (orCursor.$or.length == 0){
                        delete orCursor.$or;
                    }else if (orCursor.$or.length == 1){
                        $data.typeSystem.extend(orCursor, orCursor.$or[0]);
                        delete orCursor.$or;
                    }
                }
                context.cursor = orCursor;
                break;
            case $data.Expressions.ExpressionType.And:
                var andCursor = context.cursor;
                
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
                this._constExpressionFilter(expression, context);
                
                if (andCursor instanceof Array){
                    for (var i = 0; i < andCursor.length; i++){
                        var a = andCursor[i];
                        if (a.$and){
                            if (a.$and.length == 0){
                                delete a.$and;
                            }else if (a.$and.length == 1){
                                $data.typeSystem.extend(a, a.$and[0]);
                                delete a.$and;
                            }
                        }
                    }
                }else if (andCursor.$and){
                    if (andCursor.$and.length == 0){
                        delete andCursor.$and;
                    }else if (andCursor.$and.length == 1){
                        $data.typeSystem.extend(andCursor, andCursor.$and[0]);
                        delete andCursor.$and;
                    }
                }
                context.cursor = andCursor;
                break;
            case $data.Expressions.ExpressionType.Equal:
            case $data.Expressions.ExpressionType.EqualTyped:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (!context.complexType && context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (context.entityType && context.entityType.memberDefinitions)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.complexType ? context.lastField : context.field).type))](v);
                else if (context.valueType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.valueType))](v);
                context.value = v;
                if (context.fieldOperation){
                    if (context.unary === $data.Expressions.ExpressionType.Not){
                        var c = { $not: context.cursor[context.queryField] };
                        context.cursor[context.queryField] = c;
                    }
                }else{
                    if (context.cursor instanceof Array){
                        var o = {};
                        o[context.queryField] = context.unary === $data.Expressions.ExpressionType.Not ? { $ne: context.value } : context.value;
                        context.cursor.push(o);
                    }else context.cursor[context.queryField] = context.unary === $data.Expressions.ExpressionType.Not ? { $ne: context.value } : context.value;
                    if (context.options && context.options.fields) context.options.fields[context.queryField] = 1;
                    if (context.unary === $data.Expressions.ExpressionType.Not) context.unary = undefined;
                }
                break;
            case $data.Expressions.ExpressionType.In:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (!context.complexType && context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (v instanceof Array){
                    v = v.map(function (it) { return it.value; });
                    for (var i = 0; i < v.length; i++){
                        if (context.entityType && context.entityType.memberDefinitions)
                            v[i] = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.complexType ? context.lastField : context.field).type))](v[i]);
                        else if (context.valueType)
                            v[i] = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.valueType))](v[i]);
                    }
                }
                context.value = v;
                if (context.cursor instanceof Array){
                    var o = {};
                    o[context.queryField] = {};
                    if (context.entityType && context.entityType === $data.Array){
                        o[context.queryField] = context.unary === $data.Expressions.ExpressionType.Not ? { $not: context.value } : context.value;
                    }else{
                        o[context.queryField][context.unary === $data.Expressions.ExpressionType.Not ? '$nin' : expression.resolution.mapTo] = context.value;
                    }
                    context.cursor.push(o);
                }else{
                    context.cursor[context.queryField] = {};
                    if (context.entityType && context.entityType === $data.Array){
                        context.cursor[context.queryField] = context.unary === $data.Expressions.ExpressionType.Not ? { $not: context.value } : context.value;
                    }else{
                        context.cursor[context.queryField][context.unary === $data.Expressions.ExpressionType.Not ? '$nin' : expression.resolution.mapTo] = context.value;
                    }
                }
                if (context.options && context.options.fields) context.options.fields[context.queryField] = 1;
                if (context.unary === $data.Expressions.ExpressionType.Not) context.unary = undefined;
                break;
            default:
                this.Visit(expression.left, context);
                this.Visit(expression.right, context);
                context.queryField = context.field;
                if (Array.isArray(context.cursor) && context.cursor[0] && context.cursor[0][context.queryField] && (context.cursor[0][context.queryField].$near || context.cursor[0][context.queryField].$nearSphere || context.cursor[0][context.queryField].$within)){
                    context.query = context.cursor[0];
                    context.cursor = context.cursor[0];
                }
                var c = context.cursor[0] || context.cursor;
                if (c && c[context.queryField] && c[context.queryField].$within){
                    break;
                }
                if (!context.complexType && context.entityType && context.entityType.memberDefinitions.getMember(context.field).computed){
                    delete context.query[context.field];
                    context.queryField = '_id';
                }
                var v = context.value;
                if (context.entityType && context.entityType.memberDefinitions)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.entityType.memberDefinitions.getMember(context.complexType ? context.lastField : context.field).type))](v);
                else if (context.valueType)
                    v = this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(context.valueType))](v);
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
                if (context.options && context.options.fields) context.options.fields[context.queryField] = 1;
                break;
        }
        
        delete context.fieldOperation;
        delete context.complexType;
        delete context.association;
        delete context.field;
        delete context.value;
    },

    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
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
                }else{
                    var inc = { name: tempData, type: association.ToType, from: association.FromType, query: {}, options: {}, mapped: false };
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
                context.full = true;
                context.mainCursor = context.cursor;
                context.cursor = context.include.query;
                context.entityType = association.ToType;
            }
            else {
                Guard.raise(new Exception("The given include path is invalid: " + expression.associationInfo.FromPropertyName + ", invalid point: " + tempData));
            }
            storageModel = this.mainEntitySet.entityContext._storageModel.getStorageModel(association.ToType);
        }
    },

    VisitMemberInfoExpression: function (expression, context) {
        if ((context.complexType && context.field)){
            context.field = context.field + '.' + expression.memberName;
        }else{
            context.field = expression.memberName;
        }
        if (context.complexType) context.lastField = expression.memberName;
    },
    
    VisitComplexTypeExpression: function(expression, context){
        context.complexType = true;
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
        context.entityType = expression.entityType;
    },

    VisitQueryParameterExpression: function (expression, context) {
        context.data += this.provider.fieldConverter.toDb[expression.type](expression.value);
    },

    _fieldOperation: function(opName, context){
        context.fieldOperation = true;
        var opMapTo;
        var opValue;
        switch (opName){
            case 'contains':
                opMapTo = '$regex';
                opValue = context.value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                break;
            case 'startsWith':
                opMapTo = '$regex';
                opValue = '^' + context.value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                break;
            case 'endsWith':
                opMapTo = '$regex';
                opValue = context.value.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1") + '$';
                break;
            default:
                break;
        }
        
        return { opMapTo: opMapTo, opValue: opValue };
    },
    
    VisitEntityFieldOperationExpression: function (expression, context) {
        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);
        
        this.Visit(expression.source, context);

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
        
        var op = this._fieldOperation(opName, context);
        var opMapTo = op.opMapTo;
        var opValue = op.opValue;
        
        if (context.unary === $data.Expressions.ExpressionType.Not){
            opValue = '^((?!' + opValue + ').)*$';
        }
        
        if (context.options.fields) context.options.fields[context.field] = 1;
        
        if (!context.include && opMapTo && opValue){
            if (context.cursor instanceof Array){
                var o = {};
                o[context.field] = {};
                o[context.field][opMapTo] = opValue;
                context.cursor.push(o);
            }else{
                context.cursor[context.field] = {};
                context.cursor[context.field][opMapTo] = opValue;
            }
        }
        
        if (context.complexType){
            delete context.complexType;
            delete context.field;
        }
    },

    VisitConstantExpression: function (expression, context) {
        var valueType = Container.resolveName(expression.type);
        context.valueType = valueType;
        context.value = expression.value;
        var c = Array.isArray(context.cursor) ? context.cursor.filter(function(it){ return typeof it[context.field] !== 'undefined'; })[0] : context.cursor;
        if (c && c[context.field] && c[context.field].$within){
            c = c[context.field];
            if (c.$within.$center){
                c.$within.$center = [c.$within.$center, context.value];
            }else if (c.$within.$centerSphere){
                c.$within.$centerSphere = [c.$within.$centerSphere, context.value];
            }
        }
    },

    VisitEntityExpression: function (expression, context) {
        context.entityType = expression.entityType;
        if (context.mainCursor){
            context.cursor = context.mainCursor;
            delete context.include;
        }
        this.Visit(expression.source, context);
    },

    VisitEntitySetExpression: function (expression, context) {
        this.Visit(expression.source, context);
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
            context.data += "/";
        }
    },
    
    _frameOperation: function(opDef, args, expression, context, contextinclude){
        var self = this;
        var origInclude = contextinclude;
        var frames = [];
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg && arg.value instanceof $data.Queryable) {
                var frameExpression = new opDef.frameType(arg.value.expression);
                var preparator = new $data.Expressions.QueryExpressionCreator(arg.value.entityContext);
                var prep_expression = preparator.Visit(frameExpression);
                
                var fn = function(expression, context, contextinclude, indent){
                    if (expression._expressionType === $data.Expressions.AssociationInfoExpression){
                        contextinclude += '.' + expression.associationInfo.FromPropertyName;
                        var storageModel = context.entitySet.entityContext._storageModel.getStorageModel(context.defaultType);
                        var association = storageModel.Associations[expression.associationInfo.FromPropertyName];
                        if (association) {
                            var inc = context.includes.filter(function (include) { return include.name == contextinclude }, this);
                            if (inc.length == 0){
                                inc = { name: contextinclude, type: association.ToType, from: association.FromType, query: {}, options: {}, mapped: false };
                                inc.options.fields = { _id: 1 };
                                inc.options.fields[association.ToPropertyName] = 1;
                                context.includes.push(inc);
                            }
                            if (!context.context.options.fields) context.context.options.fields = { _id: 1 };
                            //context.context.options.fields[context.include] = 1;
                            association.ReferentialConstraint.forEach(function(ref){
                                for (var p in ref){
                                    //context.context.options.fields[ref[p]] = 1;
                                }
                            });
                        }else{
                            Guard.raise(new Exception("The given include path is invalid: " + expression.associationInfo.FromPropertyName + ", invalid point: " + contextinclude));
                        }
                        context.defaultType = association.ToType;
                    }else if (expression._expressionType === $data.Expressions.FrameOperationExpression){
                        frames.push(function(){
                            var opDef = expression.operation.memberDefinition;
                            var paramCounter = 0;
                            var params = opDef.parameters || [{ name: "@expression" }];

                            var args = params.map(function (item, index) {
                                if (item.name === "@expression") {
                                    return expression.source;
                                } else {
                                    return expression.parameters[paramCounter++]
                                };
                            });
                            
                            self._frameOperation(opDef, args, expression, {
                                entitySet: arg.value.entityContext._entitySetReferences[arg.value.expression.elementType.name],
                                defaultType: arg.value.expression.elementType,
                                context: context.context,
                                includes: self.includes/*,
                                include: { name: lastInclude }*/
                            }, contextinclude);
                        });
                    }else if (expression._expressionType === $data.Expressions.MemberInfoExpression){
                        contextinclude = origInclude;
                        context.defaultType = arg.value.expression.elementType;
                    }
                    
                    if (expression.source) contextinclude = fn(expression.source, context, contextinclude);
                    if (expression.selector) contextinclude = fn(expression.selector, context, contextinclude);
                    if (expression.expression) contextinclude = fn(expression.expression, context, contextinclude);
                    if (expression.left) contextinclude = fn(expression.left, context, contextinclude);
                    if (expression.right) contextinclude = fn(expression.right, context, contextinclude);
                    
                    return contextinclude;
                };
                
                var c = {
                    entitySet: arg.value.entityContext._entitySetReferences[arg.value.expression.elementType.name],
                    defaultType: arg.value.expression.elementType,
                    context: context.context ? context.context : context,
                    includes: this.includes
                };
                fn(prep_expression, c, contextinclude, 0);
            };
        }
        frames.forEach(function(it){ it(); });
    },

    VisitFrameOperationExpression: function (expression, context) {
        this.Visit(expression.source, context);

        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);

        var opDef = expression.operation.memberDefinition;
        var paramCounter = 0;
        var params = opDef.parameters || [{ name: "@expression" }];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++]
            };
        });

        this._frameOperation(opDef, args, expression, context, context.include.name);
    }
});
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
$C('$data.storageProviders.mongoDB.mongoDBFunctionCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider, lambdaPrefix, compiler) {
        this.provider = provider;
        if (compiler){
            this.compiler = compiler;
            this.includes = compiler.includes;
            this.mainEntitySet = compiler.mainEntitySet;
        }
    },
    compile: function (expression, context) {
        this.Visit(expression, context);
    },

    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
    },
    VisitUnaryExpression: function (expression, context) {
        context.data += this.provider.supportedBinaryOperators[expression.resolution.name].mapTo;
        context.data += "(";
        this.Visit(expression.operand, context);
        context.data += ")";
    },
    VisitSimpleBinaryExpression: function (expression, context) {
        if (expression.resolution.reverse) {
            context.data += "(";
            var right = this.Visit(expression.right, context);
            context.data += this.provider.supportedBinaryOperators[expression.resolution.name].mapTo;
            var left = this.Visit(expression.left, context);
            if (expression.resolution.rightValue)
                context.data += expression.resolution.rightValue;
            context.data += ")";
        } else {
            context.data += "(";
            var left = this.Visit(expression.left, context);
            context.data += this.provider.supportedBinaryOperators[expression.resolution.name].mapTo;
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
        var member = context.data.slice(context.data.lastIndexOf('(') + 1);
        if (Container.resolveType(expression.memberDefinition.type) == $data.ObjectID){
            context.data += expression.memberDefinition.computed
                ? '_id ? ' + member + '_id.toString() : ' + member + '_id)'
                : expression.memberName + ' ? ' + member + expression.memberName + '.toString() : ' + member + expression.memberName + ')';
        }else{
            context.data += expression.memberDefinition.computed ? '_id)' : expression.memberName + ')';
        }
    },

    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
        context.data += ".";
    },

    VisitEntityExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.entityType = expression.entityType;
        if (expression.selector.lambda){
            context.data += '(' + expression.selector.lambda + '.';
            context.lambda = expression.selector.lambda;
        }
    },
    VisitEntitySetExpression: function (expression, context) {
        this.Visit(expression.source, context);
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
        }
    },
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
    },
    VisitAssociationInfoExpression: function(expression, context){
        context.data += expression.associationInfo.FromPropertyName + '.';
    },
    VisitEntityFieldOperationExpression: function (expression, context) {
        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);

        var opDef = expression.operation.memberDefinition;
        opDef = this.provider.supportedFieldOperations[opDef.name];
        if (opDef.propertyFunction) {
            this.Visit(expression.source, context);
            context.data += '.';
        }

        var opName = opDef.mapTo || opDef.name;
        context.data += opName;
        var paramCounter = 0;
        var params = opDef.parameters || [];

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return expression.parameters[paramCounter++]
            };
        });

        args.forEach(function (arg, index) {
            if (arg) {
                if (index > 0) {
                    context.data += ",";
                };
                this.Visit(arg, context);
            }
        }, this);
        context.data += opDef.rightValue || "";
    },
    VisitFrameOperationExpression: function (expression, context) {
        var self = this;
        this.Visit(expression.source, context);

        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);

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
            if (arg && arg.value instanceof $data.Queryable) {
                var frameExpression = new opDef.frameType(arg.value.expression);
                var preparator = new $data.Expressions.QueryExpressionCreator(arg.value.entityContext);
                var prep_expression = preparator.Visit(frameExpression);

                var compiler = new (self.constructor)(this.provider, true);
                var frameContext = { data: "" };
                var compiled = compiler.compile(prep_expression, frameContext);

                context.data += ('function(' + frameContext.lambda + '){ return ' + frameContext.data + '; }');
            }else context.data += 'function(){ return true; }';
        }
        context.data += "))";
    }
});
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
        if (this.providerConfiguration.server){
            if (typeof this.providerConfiguration.server === 'string') this.providerConfiguration.server = [{ address: this.providerConfiguration.server.split(':')[0] || '127.0.0.1', port: this.providerConfiguration.server.split(':')[1] || 27017 }];
            if (!(this.providerConfiguration.server instanceof Array)) this.providerConfiguration.server = [this.providerConfiguration.server];
            if (this.providerConfiguration.server.length == 1){
                this.providerConfiguration.address = this.providerConfiguration.server[0].address || '127.0.0.1';
                this.providerConfiguration.port = this.providerConfiguration.server[0].port || 27017;
                delete this.providerConfiguration.server;
            }
        }
        if (this.context && this.context._buildDbType_generateConvertToFunction && this.buildDbType_generateConvertToFunction) {
            this.context._buildDbType_generateConvertToFunction = this.buildDbType_generateConvertToFunction;
        }
        if (this.context && this.context._buildDbType_modifyInstanceDefinition && this.buildDbType_modifyInstanceDefinition) {
            this.context._buildDbType_modifyInstanceDefinition = this.buildDbType_modifyInstanceDefinition;
        }
    },
    _getServer: function(){
        if (this.providerConfiguration.server){
            var replSet = [];
            for (var i = 0; i < this.providerConfiguration.server.length; i++){
                var s = this.providerConfiguration.server[i];
                replSet.push(new this.driver.Server(s.address, s.port, s.serverOptions));
            }
            
            return new this.driver.ReplSetServers(replSet);
        }else return this.driver.Server(this.providerConfiguration.address, this.providerConfiguration.port, this.providerConfiguration.serverOptions);
    },
    initializeStore: function(callBack){
        var self = this;
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        
        var server = this._getServer();
        new this.driver.Db(this.providerConfiguration.databaseName, server, { safe: false }).open(function(error, client){
            if (error){
                callBack.error(error);
                return;
            }
            
            var fn = function(error, client){
                var cnt = 0;
                var collectionCount = 0;
                var readyFn = function(client, entitySet){
                    var countFn = function(){
                        if (--cnt <= 0){
                            callBack.success(self.context);
                            client.close();
                        }
                    };

                    if (entitySet){
                        var entitySetIndices = self.context._storageModel.getStorageModel(entitySet.createNew).indices;
                        if (entitySetIndices && typeof self._createIndices === 'function'){
                            self._createIndices(client, entitySet, entitySetIndices, countFn);
                        }else countFn();
                    }else countFn();
                };
                
                for (var i in self.context._entitySetReferences){
                    if (self.context._entitySetReferences.hasOwnProperty(i))
                        cnt++;
                }
                
                collectionCount = cnt;
                var sets = Object.keys(self.context._entitySetReferences);
                if (!sets.length) return readyFn(client);
                sets.forEach(function(i){
                    if (self.context._entitySetReferences.hasOwnProperty(i)){
                        client.collectionNames({ namesOnly: true }, function(error, names){
                            names = names.map(function(it){ return it.slice(it.lastIndexOf('.') + 1); });
                            switch (self.providerConfiguration.dbCreation){
                                case $data.storageProviders.DbCreationType.DropAllExistingTables:
                                    if (names.indexOf(self.context._entitySetReferences[i].tableName) >= 0){
                                        client.dropCollection(self.context._entitySetReferences[i].tableName, function(error, result){
                                            if (error){
                                                callBack.error(error);
                                                return;
                                            }
                                            if (self.context._entitySetReferences[i].tableOptions){
                                                client.createCollection(self.context._entitySetReferences[i].tableName, self.context._entitySetReferences[i].tableOptions, function(error, result){
                                                    if (error){
                                                        callBack.error(error);
                                                        return;
                                                    }
                                                    readyFn(client, self.context._entitySetReferences[i]);
                                                });
                                            }else readyFn(client, self.context._entitySetReferences[i]);
                                        });
                                    }else if (names.indexOf(self.context._entitySetReferences[i].tableName) < 0 && self.context._entitySetReferences[i].tableOptions){
                                        client.createCollection(self.context._entitySetReferences[i].tableName, self.context._entitySetReferences[i].tableOptions, function(error, result){
                                            if (error){
                                                callBack.error(error);
                                                return;
                                            }
                                            readyFn(client, self.context._entitySetReferences[i]);
                                        });
                                    }else readyFn(client, self.context._entitySetReferences[i]);
                                    break;
                                default:
                                    if (names.indexOf(self.context._entitySetReferences[i].tableName) < 0 && self.context._entitySetReferences[i].tableOptions){
                                        client.createCollection(self.context._entitySetReferences[i].tableName, self.context._entitySetReferences[i].tableOptions, function(error, result){
                                            if (error){
                                                callBack.error(error);
                                                return;
                                            }
                                            readyFn(client, self.context._entitySetReferences[i]);
                                        });
                                    }else readyFn(client, self.context._entitySetReferences[i]);
                                    break;
                            }
                        });
                    }
                });
            };
            
            if (self.providerConfiguration.username){
                client.authenticate(self.providerConfiguration.username, self.providerConfiguration.password || '', function(error, result){
                    if (error){
                        callBack.error(error);
                        return;
                    }
                    
                    if (result){
                        fn(error, client);
                        return;
                    }
                });
            }else fn(error, client);
        });
    },
    _connected: function(oid, prop, prop2, it, association){
        var ret = false;
        association.ReferentialConstraint.forEach(function(ref){
            if (it && ref[prop2] && oid[ref[prop2]] != undefined) ret = JSON.stringify(oid[ref[prop2]]) == JSON.stringify(it[ref[prop]] != undefined ? it[ref[prop]] : it._id);
        });
        return ret;
    },
    _compile: function(query){
        return new $data.storageProviders.mongoDB.mongoDBCompiler().compile(query);
    },
    getTraceString: function (queryable) {
        return this._compile(queryable);
    },
    executeQuery: function(query, callBack){
        var self = this;
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        var entitySet = query.context.getEntitySetFromElementType(query.defaultType);
        this._compile(query);

        var server = this._getServer();
        new this.driver.Db(this.providerConfiguration.databaseName, server, { safe: false }).open(function(error, client){
            if (error){
                callBack.error(error);
                return;
            }
            
            var collection = new self.driver.Collection(client, entitySet.tableName);
            var includes = query.includes && query.includes.length ? query.includes.map(function(it){
                //if (it.full){
                    delete it.options.fields;
                //}
                return {
                    name: it.name,
                    type: it.type,
                    from: it.from,
                    collection: new self.driver.Collection(client, query.context.getEntitySetFromElementType(it.type).tableName),
                    query: it.query || {},
                    options: it.options || {}
                };
            }) : null;
            
            query.context = self.context;
            var find = query.find;
            
            var cb = function(error, results){
                if (error){
                    callBack.error(error);
                    return;
                }
                if (query.find.filter){
                    results = results.filter(query.find.filter);
                }

                if (query.expression.nodeType === $data.Expressions.ExpressionType.Count || query.expression.nodeType === $data.Expressions.ExpressionType.BatchDelete){
                    if (results instanceof Array){
                        query.rawDataList = [{ cnt: results.length }];
                    }else{
                        query.rawDataList = [{ cnt: results }];
                    }
                }else{
                    query.rawDataList = results;
                }
                
                callBack.success(query);
                client.close();
            };
            
            var fn = function(){
                switch (query.expression.nodeType){
                    case $data.Expressions.ExpressionType.BatchDelete:
                        collection.remove(find.query, { safe: true }, cb);
                        break;
                    case $data.Expressions.ExpressionType.Count:
                        if (!includes || !includes.length){
                            collection.find(find.query, find.options).count(cb);
                            break;
                        }
                    default:
                        if (find.full){
                            delete find.options.fields;
                        }
                        var defaultFn = function(){
                            collection.find(find.query, find.options).toArray(function(error, results){
                                if (error){
                                    callBack.error(error);
                                    return;
                                }
                                
                                var fn = function(include){
                                    include.collection.find({}, include.options).toArray(function(error, included){
                                        if (error){
                                            callBack.error(error);
                                            return;
                                        }
                                        
                                        var path = include.name.split('.');
                                        var prop = path[path.length - 1];
                                        var sm = self.context._storageModel.getStorageModel(include.from);
                                        
                                        var association = sm.Associations[prop];
                                        
                                        var conn = function(res){
                                            if (association.FromMultiplicity == '0..1' && association.ToMultiplicity == '*'){
                                                var r = included.filter(function(it){
                                                    return self._connected(it, association.ToPropertyName, association.To, res, association);
                                                });
                                                res[prop] = r;
                                            }else if (association.FromMultiplicity == '*' && association.ToMultiplicity == '0..1'){
                                                var r = included.filter(function(it){
                                                    if (res[association.FromPropertyName] === null) return false;
                                                    return self._connected(res, association.FromPropertyName, association.From, it, association);
                                                })[0];
                                                res[prop] = r || res[prop];
                                            }else if (association.FromMultiplicity == '1' && association.ToMultiplicity == '0..1'){
                                                var r = included.filter(function(it){
                                                    return self._connected(it, association.ToPropertyName, association.To, res, association);
                                                })[0];
                                                res[prop] = r || res[prop];
                                            }else if (association.FromMultiplicity == '0..1' && association.ToMultiplicity == '1'){
                                                var r = included.filter(function(it){
                                                    return self._connected(res, association.FromPropertyName, association.From, it, association);
                                                })[0];
                                                res[prop] = r || res[prop];
                                            }
                                        };
                                        
                                        var respath = function(res, path){
                                            var _conn = true;
                                            for (var j = 0; j < path.length; j++){
                                                if (typeof res[path[j]] !== 'undefined') res = res[path[j]];
                                                if (Array.isArray(res) && res.length){
                                                    _conn = false;
                                                    for (var k = 0; k < res.length; k++){
                                                        if (j < path.length - 1) respath(res[k], path.slice(j));
                                                        else conn(res[k]);
                                                    }
                                                }
                                                if (!_conn) break;
                                            }
                                            if (_conn){
                                                conn(res);
                                            }
                                        };
                                        
                                        for (var i = 0; i < results.length; i++){
                                            respath(results[i], path.slice(0, -1));
                                        }
                                        
                                        if (include.options.sort) {
                                            var order = Object.keys(include.options.sort);
                                            var cmp = order.map(function(it){
                                                return new Function('it', 'return it.' + it + ';');
                                            });
                                            results.sort(function (a, b) {
                                                var result;
                                                for (var i = 0, l = order.length; i < l; i++) {
                                                    result = 0;
                                                    var aVal = cmp[i](a);
                                                    var bVal = cmp[i](b);

                                                    if (include.options.sort[order[i]] == 1)
                                                        result = aVal === bVal ? 0 : (aVal > bVal || bVal === null ? 1 : -1);
                                                    else
                                                        result = aVal === bVal ? 0 : (aVal < bVal || aVal === null ? 1 : -1);

                                                    if (result !== 0) break;

                                                }
                                                return result;
                                            });
                                        }
                                        
                                        if (includes && includes.length){
                                            fn(includes.shift());
                                        }else{
                                            cb(error, results);
                                        }
                                    });
                                };
                                
                                if (includes && includes.length){
                                    fn(includes.shift());
                                }else{
                                    cb(error, results);
                                }
                            });
                        };
                        if (query.withInlineCount){
                            collection.find(find.query, {}).count(function(err, result){
                                if (error){
                                    callBack.error(error);
                                    return;
                                }
                                query.__count = result;
                                defaultFn();
                            });
                        }else defaultFn();
                        break;
                }
            };
            
            if (self.providerConfiguration.username){
                client.authenticate(self.providerConfiguration.username, self.providerConfiguration.password, function(error, result){
                    if (error){
                        callBack.error(error);
                        return;
                    }
                    
                    if (result) fn();
                    else callBack.error('Authentication failed');
                });
            }else fn();
        });
    },
    _typeFactory: function(type, value, converter){
        if ((value && value.$ref && value.$id) || value == null || value == undefined) return value;
        var type = Container.resolveName(type);
        var converterFn = converter ? converter[type] : undefined;
        return converter && converter[type] ? converter[type](value) : new (Container.resolveType(type))(value);
    },
    _saveCollections: function(callBack, collections){
        var self = this;
        var successItems = 0;
        var server = this._getServer();
        
        var counterState = 0;
        var counterFn = function(callback){
            if (--counterState <= 0) callback();
        }
        
        var insertFn = function(client, c, collection){
            var docs = [];
            for (var i = 0; i < c.insertAll.length; i++){
                var d = c.insertAll[i];
                var props = Container.resolveType(d.type).memberDefinitions.getPublicMappedProperties();
                for (var j = 0; j < props.length; j++){
                    var p = props[j];
                    if (p.concurrencyMode === $data.ConcurrencyMode.Fixed){
                        d.data[p.name] = 0;
                    }else if (!p.computed){
                        if (Container.resolveType(p.type) === $data.Array && p.elementType && Container.resolveType(p.elementType) === $data.ObjectID){
                            d.data[p.name] = self._typeFactory(p.type, d.data[p.name], self.fieldConverter.toDb);
                            var arr = d.data[p.name];
                            if (arr){
                                for (var k = 0; k < arr.length; k++){
                                    arr[k] = self._typeFactory(p.elementType, arr[k], self.fieldConverter.toDb);
                                }
                            }
                        }else{
                            d.data[p.name] = self._typeFactory(p.type, d.data[p.name], self.fieldConverter.toDb);
                            if (d.data[p.name] && d.data[p.name].initData) d.data[p.name] = d.data[p.name].initData;
                        }
                    }else{
                        d.data['_id'] = self._typeFactory(p.type, d.data._id, self.fieldConverter.toDb);
                    }
                }

                docs.push(d.data);
            }

            collection.insert(docs, { safe: true }, function(error, result){
                if (error){
                    callBack.error(error);
                    client.close();
                    return;
                }
                
                for (var k = 0; k < result.length; k++){
                    var it = result[k];
                    var d = c.insertAll[k];
                    var props = Container.resolveType(d.type).memberDefinitions.getPublicMappedProperties();
                    for (var j = 0; j < props.length; j++){
                        var p = props[j];
                        if (!p.inverseProperty){
                            d.entity[p.name] = self._typeFactory(p.type, it[p.computed ? '_id' : p.name], self.fieldConverter.fromDb);
                        }
                    }
                }
                
                successItems += result.length;
                
                if (c.removeAll && c.removeAll.length){
                    removeFn(client, c, collection);
                }else{
                    if (c.updateAll && c.updateAll.length){
                        updateFn(client, c, collection);
                    }else{
                        esFn(client, successItems);
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
                var props = Container.resolveType(u.entity.getType()).memberDefinitions.getPublicMappedProperties().concat(Container.resolveType(u.physicalData.getType()).memberDefinitions.getPublicMappedProperties());
                for (var j = 0; j < props.length; j++){
                    var p = props[j];
                    if (u.entity.changedProperties.indexOf(p) >= 0 || (u.physicalData.changedProperties && u.physicalData.changedProperties.indexOf(p) >= 0)){
                        if (p.concurrencyMode === $data.ConcurrencyMode.Fixed){
                            where[p.name] = self._typeFactory(p.type, u.data[p.name], self.fieldConverter.toDb);
                            if (!set.$inc) set.$inc = {};
                            set.$inc[p.name] = 1;
                        }else if (!p.computed){
                            if (typeof u.data[p.name] === 'undefined') continue;
                            if (Container.resolveType(p.type) === $data.Array && p.elementType && Container.resolveType(p.elementType) === $data.ObjectID){
                                set[p.name] = self._typeFactory(p.type, u.physicalData[p.name], self.fieldConverter.toDb);
                                var arr = set[p.name];
                                if (arr){
                                    for (var k = 0; k < arr.length; k++){
                                        arr[k] = self._typeFactory(p.elementType, arr[k], self.fieldConverter.toDb);
                                    }
                                }
                            }else{
                                set[p.name] = self._typeFactory(p.type, u.physicalData[p.name], self.fieldConverter.toDb);
                            }
                        }
                    }
                }
                
                var fn = function(u){
                    collection.update(where, { $set: set }, { safe: true }, function(error, result){
                        if (error){
                            callBack.error(error);
                            client.close();
                            return;
                        }
                        
                        if (result){
                            successItems++;
                            var props = Container.resolveType(u.type).memberDefinitions.getPublicMappedProperties();
                            for (var j = 0; j < props.length; j++){
                                var p = props[j];
                                if (p.concurrencyMode === $data.ConcurrencyMode.Fixed) u.entity[p.name]++;
                            }
                            
                            counterFn(function(){
                                esFn(client, successItems);
                            });
                        }else{
                            counterState--;
                            collection.find({ _id: where._id }, {}).toArray(function(error, result){
                                if (error){
                                    callBack.error(error);
                                    return;
                                }
                                
                                var it = result[0];
                                var props = Container.resolveType(u.type).memberDefinitions.getPublicMappedProperties();
                                for (var j = 0; j < props.length; j++){
                                    var p = props[j];
                                    u.entity[p.name] = self._typeFactory(p.type, it[p.computed ? '_id' : p.name], self.fieldConverter.fromDb);
                                }
                                
                                counterFn(function(){
                                    esFn(client, successItems);
                                });
                            });
                        }
                    });
                };
                
                fn(u);
            }
        };
        
        var removeFn = function(client, c, collection){
            counterState = c.removeAll.length;
            for (var i = 0; i < c.removeAll.length; i++){
                var r = c.removeAll[i];
                
                for (var j in r.data){
                    if (r.data[j] === undefined || r.data[j] === null){
                        delete r.data[j];
                    }
                }

                var keys = Container.resolveType(r.type).memberDefinitions.getKeyProperties();
                for (var j = 0; j < keys.length; j++){
                    var k = keys[j];
                    r.data[k.computed ? '_id' : k.name] = self.fieldConverter.toDb[Container.resolveName(Container.resolveType(k.type))](r.entity[k.name]);
                }
                
                var props = Container.resolveType(r.type).memberDefinitions.getPublicMappedProperties();
                for (var j = 0; j < props.length; j++){
                    var p = props[j];
                    if (!p.key) {
                        delete r.data[p.name];
                    }
                }
                
                collection.remove(r.data, { safe: true }, function(error, result){
                    if (error){
                        callBack.error(error);
                        client.close();
                        return;
                    }
                    
                    if (result) successItems++;
                    else counterState--;
                    
                    counterFn(function(){
                        if (c.updateAll && c.updateAll.length){
                            updateFn(client, c, collection);
                        }else esFn(client, successItems);
                    });
                });
            }
        };
        
        var keys = Object.keys(collections);
        var readyFn = function(client, value){
            callBack.success(value);
            client.close();
        };
        
        var esFn = function(client, value){
            if (keys.length){
                var es = keys.pop();
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
                                readyFn(client, 0);
                            }
                        }
                    }
                }
            }else readyFn(client, value);
        };
        
        new this.driver.Db(this.providerConfiguration.databaseName, server, { safe: false }).open(function(error, client){
            if (error){
                callBack.error(error);
                return;
            }
            
            if (self.providerConfiguration.username){
                client.authenticate(self.providerConfiguration.username, self.providerConfiguration.password, function(error, result){
                    if (error){
                        callBack.error(error);
                        return;
                    }
                    
                    if (result) esFn(client);
                });
            }else esFn(client);
        });
    },
    saveChanges: function(callBack, changedItems){
        var self = this;
        if (changedItems.length){
            var independentBlocks = this.buildIndependentBlocks(changedItems);
            var convertedItems = [];
            var successCount = 0;
            var fn = function(block){
                var collections = {};
                for (var i = 0; i < block.length; i++) {
                    convertedItems.push(block[i].data);
                    
                    var es = collections[block[i].entitySet.name];
                    if (!es){
                        es = {};
                        collections[block[i].entitySet.name] = es;
                    }
                    
                    var initData = { entity: block[i].data, data: self.save_getInitData(block[i], convertedItems), physicalData: block[i].physicalData, type: Container.resolveName(block[i].data.getType()) };
                    switch (block[i].data.entityState){
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
                
                self._saveCollections({
                    success: function(cnt){
                        successCount += cnt;
                        if (independentBlocks.length){
                            fn(independentBlocks.shift());
                        }else{
                            callBack.success(successCount);
                        }
                    },
                    error: callBack.error
                }, collections);
            };
            
            if (independentBlocks.length){
                fn(independentBlocks.shift());
            }
        }else{
            callBack.success(0);
        }
    },
    buildDbType_generateConvertToFunction: function (storageModel) {
        var self = this;
        return function (logicalEntity) {
            var dbInstance = new storageModel.PhysicalType();
            dbInstance.entityState = logicalEntity.entityState;

            storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (property) {
                dbInstance.initData[property.name] = logicalEntity[property.name];
            }, this);

            if (storageModel.Associations) {
                storageModel.Associations.forEach(function (association) {
                    if ((association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1") || (association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1")) {
                        var complexInstance = logicalEntity[association.FromPropertyName];
                        if (complexInstance !== undefined) {
                            association.ReferentialConstraint.forEach(function (constrain) {
                                if (complexInstance !== null) {
                                    dbInstance.initData[association.FromPropertyName] = {
                                        $ref: self._entitySetReferences[association.To].tableName,
                                        $id: self.storageProvider._typeFactory(complexInstance.getType().memberDefinitions.getMember(constrain[association.To]).type, complexInstance[constrain[association.To]], self.storageProvider.fieldConverter.toDb)
                                    };
                                    dbInstance.initData[constrain[association.From]] = self.storageProvider._typeFactory(complexInstance.getType().memberDefinitions.getMember(constrain[association.To]).type, complexInstance[constrain[association.To]], self.storageProvider.fieldConverter.toDb);
                                    dbInstance._setPropertyChanged(dbInstance.getType().memberDefinitions.getMember(constrain[association.From]));
                                } else {
                                    dbInstance.initData[association.FromPropertyName] = null;
                                    dbInstance.initData[constrain[association.From]] = null;
                                    dbInstance._setPropertyChanged(dbInstance.getType().memberDefinitions.getMember(constrain[association.From]));
                                }
                            }, this);
                        }
                    }
                }, this);
            }
            if (storageModel.ComplexTypes) {
                storageModel.ComplexTypes.forEach(function (cmpType) {
                    var complexInstance = logicalEntity[cmpType.FromPropertyName];
                    dbInstance.initData[cmpType.FromPropertyName] = self.storageProvider._typeFactory(cmpType.ToType, complexInstance, self.storageProvider.fieldConverter.toDb);
                }, this);
            }
            return dbInstance;
        };
    },
    buildDbType_modifyInstanceDefinition: function (instanceDefinition, storageModel) {
        var buildDbType_copyPropertyDefinition = function (propertyDefinition, refProp) {
            var cPropertyDef;
            if (refProp) {
                cPropertyDef = JSON.parse(JSON.stringify(instanceDefinition[refProp]));
                cPropertyDef.kind = propertyDefinition.kind;
                cPropertyDef.name = propertyDefinition.name;
                cPropertyDef.notMapped = false;
            } else {
                cPropertyDef = JSON.parse(JSON.stringify(propertyDefinition));
            }

            cPropertyDef.dataType = Container.resolveType(propertyDefinition.dataType);
            cPropertyDef.type = cPropertyDef.dataType;
            cPropertyDef.key = false;
            cPropertyDef.computed = false;
            return cPropertyDef;
        };
        var buildDbType_createConstrain = function (foreignType, dataType, propertyName, prefix) {
            var constrain = new Object();
            constrain[foreignType.name] = propertyName;
            constrain[dataType.name] = prefix + '__' + propertyName;
            return constrain;
        };

        if (storageModel.Associations) {
            storageModel.Associations.forEach(function (association) {
                var addToEntityDef = false;
                var foreignType = association.FromType;
                var dataType = association.ToType;
                var foreignPropName = association.ToPropertyName;

                association.ReferentialConstraint = association.ReferentialConstraint || [];

                if ((association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1") || (association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1")) {
                    foreignType = association.ToType;
                    dataType = association.FromType;
                    foreignPropName = association.FromPropertyName;
                    addToEntityDef = true;
                }

                foreignType.memberDefinitions.getPublicMappedProperties().filter(function (d) { return d.key }).forEach(function (d) {
                    if (addToEntityDef) {
                        instanceDefinition[foreignPropName + '__' + d.name] = buildDbType_copyPropertyDefinition(d, foreignPropName);
                    }
                    association.ReferentialConstraint.push(buildDbType_createConstrain(foreignType, dataType, d.name, foreignPropName));
                }, this);
            }, this);
        }
    },
    save_getInitData: function(item, convertedItems) {
        var self = this;
        item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
        var serializableObject = {};
        item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
            if (memdef.kind == $data.MemberTypes.navProperty || memdef.kind == $data.MemberTypes.complexProperty || (memdef.kind == $data.MemberTypes.property && !memdef.notMapped)) {
                serializableObject[memdef.computed ? '_id' : memdef.name] = item.physicalData[memdef.name];
            }
        }, this);
        return serializableObject;
    },
    
    supportedDataTypes: {
        value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date, $data.ObjectID, $data.Object, $data.GeographyPoint, $data.Guid,
            $data.GeographyLineString, $data.GeographyPolygon, $data.GeographyMultiPoint, $data.GeographyMultiLineString, $data.GeographyMultiPolygon, $data.GeographyCollection,
            $data.GeometryPoint, $data.GeometryLineString, $data.GeometryPolygon, $data.GeometryMultiPoint, $data.GeometryMultiLineString, $data.GeometryMultiPolygon, $data.GeometryCollection,
            $data.Byte, $data.SByte, $data.Decimal, $data.Float, $data.Int16, $data.Int32, $data.Int64, $data.Time, $data.DateTimeOffset],
        writable: false
    },
    
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
            }
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
            batchDelete: {},
            single: {},
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {},
            include: {},
            withInlineCount: {},
            some: {
                invokable: false,
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                mapTo: 'some',
                frameType: $data.Expressions.SomeExpression
            },
            every: {
                invokable: false,
                allowedIn: [$data.Expressions.FilterExpression],
                parameters: [{ name: "filter", dataType: "$data.Queryable" }],
                mapTo: 'every',
                frameType: $data.Expressions.EveryExpression
            }
        },
        enumerable: true,
        writable: true
    },
    fieldConverter: { value: $data.mongoDBConverter }
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
try { if (typeof navigator === 'undefined') navigator = window.navigator = require('navigator'); }catch(err){}

$data.Class.define('$data.storageProviders.mongoDB.mongoDBProvider.ClientObjectID', null, null, {
    constructor: function(){
        var time = Math.floor(new Date().getTime() / 1000).toString(16);
        
        var b64ua = btoa(navigator ? navigator.userAgent : 'nodejs');
        var machine = (b64ua.charCodeAt(0) + b64ua.charCodeAt(1)).toString(16) + (b64ua.charCodeAt(2) + b64ua.charCodeAt(3)).toString(16) + (b64ua.charCodeAt(4) + b64ua.charCodeAt(5)).toString(16);
        
        var pid = ('0000' + Math.floor(Math.random() * 0xffff).toString(16)).slice(-4);
        var inc = ('000000' + (++$data.storageProviders.mongoDB.mongoDBProvider.ClientObjectID.idSeed).toString(16)).slice(-6);
        
        this.toString = this.toLocaleString = this.valueOf = function(){ return btoa(time + machine + pid + inc); };
    },
    value: { value: null }
}, {
    idSeed: { value: Math.floor(Math.random() * 0xff) }
});
