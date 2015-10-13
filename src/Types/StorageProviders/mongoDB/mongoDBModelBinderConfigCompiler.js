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
