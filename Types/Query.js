$C('$data.Query', null, null,
{
    constructor: function (expression, entitySet, context) {
        ///<param name="context" type="$data.EntityContext" />
        ///<field name="expression" type="$data.Expressions.ExpressionNode" />
        ///<field name="context" type="$data.EntityContext" />
        Object.defineProperty(this, "expression", { value: expression, enumerable: true });
        Object.defineProperty(this, "context", { value: context, enumerable: true });
        //TODO: expressions get as JSON string?!
        
        this.expressions = expression;
        this.entitySet = entitySet;
        this.actionPack = [];
        this.result = [];
        this.rawDataList = [];
        this.context = context;
        this.sqlConvertMetadata = undefined;
    },
        
    rawDataList: { dataType: "Array" },
    actionPack: { dataType: "Array" },
    result: { dataType: "Array" },
    resultType: {},
    sqlConvertMetadata: { },
    buildResultSet: function (ctx) {
        if (this.sqlConvertMetadata) 
            this.convertRowsToJson();

        this.rawDataList.forEach(function (rawData) {
            var tempObjects = new Object();
            this.runActions(rawData, tempObjects);
        }, this);
    },
    runActions: function (rawData, tempObjects) {
        this.actionPack.forEach(function (action) {
            this[action.op](action, rawData, tempObjects);
        }, this);
    },
    bindTempObject: function (action, rawData, tempObjects) {
        if (action.isList) {
            tempObjects[action.parentObjectName][action.propertyName] = tempObjects[action.parentObjectName][action.propertyName] || [];
            tempObjects[action.parentObjectName][action.propertyName].push(tempObjects[action.childObjectName]);
        } else {
            tempObjects[action.parentObjectName][action.propertyName] = tempObjects[action.childObjectName];
        }
    },
    createType: function (action, rawData, tempObjects) {
        var ctx = action.context;
        var logicalTypeName = action.logicalTypeName;
        if (action.logicalTypeName) {
            tempObjects[action.tempObjectName] = new ctx[logicalTypeName]();
        } else {
            tempObjects[action.tempObjectName] = {};
        }
    },
    writeTypeProperties: function (action, rawData, tempObjects) {
        var tempObject = tempObjects[action.tempObjectName];
        var storageModel = action.context._storageModel.getStorageModel(action.logicalType.name);
        action.logicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            var simpleField = true;
            if (storageModel && storageModel.ComplexTypes) {
                var complexTypeDescriptors = storageModel.ComplexTypes.filter(function (complexTypeDescriptor) { return complexTypeDescriptor.FromPropertyName == memDef.name; }, this);
                if (complexTypeDescriptors.length == 1) {
                    simpleField = false;
                    tempObject[memDef.name] = new complexTypeDescriptors[0].ToType();
                    this.writeTypeProperties({ op: "writeTypeProperties", context: action.context, logicalType: complexTypeDescriptors[0].ToType, tempObjectName: "ComplexType", prefix: complexTypeDescriptors[0].To + "__" }, rawData, { ComplexType: tempObject[memDef.name] });
                }
            }
            if (simpleField && storageModel && storageModel.Associations) {
                var associations = storageModel.Associations.filter(function (association) { return association.FromPropertyName == memDef.name; });
                if (associations.length > 0) {
                    simpleField = false;
                }
            }
            if (simpleField) {
                tempObject[memDef.name] = action.context.storageProvider.fieldConverter.fromDb[Container.resolveName(memDef.dataType)](rawData[action.prefix + memDef.name]);
            }
        }, this);
    },
    writeResultSetProperties: function (action, rawData, tempObjects) {
        var tempObject = tempObjects[action.tempObjectName];
        for (var item in rawData) {
            tempObject[item] = rawData[item];
        }
    },
    storeIntoResultSet: function (action, rawData, tempObjects) {
        if (tempObjects[action.tempObjectName] instanceof $data.Entity)
            tempObjects[action.tempObjectName].entityState = $data.EntityState.Unchanged;
        if (!action.checkExists) {
            this.result.push(tempObjects[action.tempObjectName]);
            return;
        }
        var originalData = this.result.filter(function (item) {
            var result = true;
            var keyFields = item.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) { return memDef.key; });
            keyFields.forEach(function (key) {
                result = result && (item[key.name] == tempObjects[action.tempObjectName][key.name]);
            }, this);
            return result;
        });
        if (originalData.length > 0) {
            tempObjects[action.tempObjectName] = originalData[0];
        } else {
            this.result.push(tempObjects[action.tempObjectName]);
        }
    },
    createEntityHierarchyFromObject: function (action, rawData, tempObjects) {
        var ctx = action.context;
        var logicalTypeName = action.logicalTypeName;
    },

    //deep raw data
    copyToResult: function (action, rawData, tempObjects) {
        if (action.tempObjectName) {
            if (tempObjects[action.tempObjectName] instanceof $data.Entity)
                tempObjects[action.tempObjectName].entityState = $data.EntityState.Unchanged;

            this.result.push(tempObjects[action.tempObjectName]);

        } else {
            if (rawData instanceof $data.Entity)
                rawData.entityState = $data.EntityState.Unchanged;

            this.result.push(rawData);

        }
    },
    convertRowsToJson: function () {
        var converter = new $data.RowConverter();
        this.rawDataList = converter.toJSON(this.rawDataList, this.sqlConvertMetadata);
    },
    buildType: function(action, rawData, tempObjects){
        var ctx = action.context;
        if (!action.propertyMapping) {
            //typed object
            this.buildTypedObjects(action, rawData, tempObjects);
        } else {
            //Anonymous object
            tempObjects[action.tempObjectName] = {};
            action.propertyMapping.forEach(function (mapping) {
                var mappingPath = mapping.from.split('.');
                var lastPropname = mappingPath[mappingPath.length - 1];
                if (mapping.type) {
                    var obj = {};
                    var subAction = { tempObjectName: lastPropname, logicalType: mapping.type, includes: mapping.includes, context: action.context };
                    this.buildTypedObjects(subAction, this._deepWalk(rawData, mappingPath), obj);
                    this.mappingSetObject(tempObjects, action.tempObjectName, mapping, obj[lastPropname], action.context);
                } else {
                    this.mappingSetObject(tempObjects, action.tempObjectName, mapping, this._deepWalk(rawData, mappingPath), action.context);
                }
            }, this);
        }
    },
    buildTypedObjects: function (action, rawData, tempObjects) {
        //typed object
        if (!(rawData instanceof Array)) {
            this.writeProperty(tempObjects, action.tempObjectName, new action.logicalType());
            this.writeProperties(tempObjects[action.tempObjectName], rawData, action.context);

            if (action.includes) {// { name: 'a.b.c', type: t }
                action.includes.forEach(function (include) {
                    this.includeStep(tempObjects[action.tempObjectName], rawData, include.name.split('.'), include.type, action.context);
                }, this);
            }
        } else {
            rawData.forEach(function (raw) {
                this.writeProperty(tempObjects, action.tempObjectName, []);
                var item = new action.logicalType();
                this.writeProperties(item, raw, action.context);

                if (action.includes) {// { name: 'a.b.c', type: t }
                    action.includes.forEach(function (include) {
                        this.includeStep(item, raw, include.name.split('.'), include.type, action.context);
                    }, this);
                }
                tempObjects[action.tempObjectName].push(item);
            }, this);
        }
    },
    writeProperties: function (entity, data, context) {
        entity.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            var dataType = Container.resolveType(memDef.dataType);

            if (data[memDef.name] != undefined && !dataType.isAssignableTo && !memDef.inverseProperty) {
                var value = this._getTypedValue(data[memDef.name], memDef.dataType, context);
                this.writeProperty(entity, memDef.name, value);
            }

        },this);
    },
    writeProperty: function (entity, propertyName, value) {
        if (entity instanceof $data.Entity)
            entity.initData[propertyName] = value;
        else
            entity[propertyName] = value;
    },
    mappingSetObject: function (entity, property, mapping, value, context) {
        value = this._getTypedValue(value, mapping.dataType, context);
        if (mapping.to) {
            var props = mapping.to.split('.');
            var entityPart = this._deepWalk(entity[property], props, true);
            this.writeProperty(entityPart, props[props.length - 1], value);
        } else
            this.writeProperty(entity, property, value);
    },

    includeStep: function (entityPart, rawPart, steppes, type, context) {
        var step = steppes.shift();
        if (rawPart[step]) {
            if (rawPart[step] instanceof Array) {
                entityPart[step] = entityPart[step] || [];
                for (var i = 0; i < rawPart[step].length; i++) {
                    this.processInclude(entityPart[step], rawPart[step], steppes, type, i, context);
                }
            } else {
                this.processInclude(entityPart, rawPart, steppes, type, step, context);
            }
        }
    },
    processInclude: function (entityPart, rawPart, steppes, type, step, context) {
        if (steppes.length == 0) {
            this.writeProperty(entityPart, step, new type());
            this.writeProperties(entityPart[step], rawPart[step], context);
        } else {
            this.includeStep(entityPart[step], rawPart[step], steppes, type, context);
        }
    },
    _deepWalk: function (item, navArray, createDepths) {
        var resultData = item;
        for (var i = 0; i < navArray.length; i++) {
            if (resultData[navArray[i]] !== undefined)
                resultData = resultData[navArray[i]];
            else if (createDepths === true && i < (navArray.length - 1)) {
                resultData[navArray[i]] = {};
                resultData = resultData[navArray[i]];
            } else
                break;
        }
        return resultData;
    },
    _getTypedValue: function (value, dataType, context) {
        if (dataType) {
            var typeName = Container.resolveName(Container.resolveType(dataType));
            return context.storageProvider.fieldConverter.fromDb[typeName](value);
        } else {
            return value;
        }
    }

}, null);