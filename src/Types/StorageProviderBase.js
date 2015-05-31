$data.storageProviders = {
    DbCreationType: {
        Merge: 10,
        DropTableIfChanged: 20,
        DropTableIfChange: 20,
        DropAllExistingTables: 30,
        ErrorIfChange: 40,
        DropDbIfChange: 50
    }
}

$data.ConcurrencyMode = { Fixed: 'fixed', None: 'none' };
$data.Class.define('$data.StorageProviderBase', null, null,
{
    constructor: function (schemaConfiguration, context) {
        this.providerConfiguration = schemaConfiguration || {};

        this.name = this.getType().name;
        if ($data.RegisteredStorageProviders) {
            var keys = Object.keys($data.RegisteredStorageProviders);
            for (var i = 0; i < keys.length; i++) {
                if (this instanceof $data.RegisteredStorageProviders[keys[i]]) {
                    this.name = keys[i];
                    break;
                }
            }
        }
    },
    providers: {},
    supportedDataTypes: { value: [], writable: false },
    initializeStore: function (callBack) {
        Guard.raise("Pure class");
    },

    executeQuery: function (queryable, callBack) {
        Guard.raise("Pure class");
    },
    loadRawData: function (tableName, callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        callBack.error(new Exception('loadRawData is not supported', 'Invalid Operation'));
    },

    buildIndependentBlocks: function (changedItems) {
        /// <summary>
        /// Build and processes a dependency graph from the changed items,
        /// and generates blocks that can be inserted to the database sequentially.
        /// </summary>
        /// <param name="changedItems">Array of changed items to build independent blocks from.</param>
        var edgesTo = [];
        var edgesFrom = [];

        function hasOwnProperty(obj) {
            /// <summary>
            /// Returns true if object has own property (used for 'hashset'-like objects)
            /// </summary>
            /// <param name="obj">Target object</param>
            /// <returns>True if the object has own property</returns>
            for (var p in obj) {
                if (obj.hasOwnProperty(p))
                    return true;
            }
            return false;
        }

        // Building edgesTo and edgesFrom arrays (containing only indeces of items in changedItems array.
        for (var i = 0; i < changedItems.length; i++) {
            var current = changedItems[i];
            if (!current.dependentOn || current.dependentOn.length == 0) {
                // This item is independent
                continue;
            }

            var to = null;
            // Iterating over items 'current' depends on
            for (var j = 0; j < current.dependentOn.length; j++) {
                var currentDependency = current.dependentOn[j];
                if (currentDependency.entityState == $data.EntityState.Unchanged) {
                    continue;
                }
                to = to || {};
                // Getting the index of current dependency
                var ixDependendOn = -1;
                for (var k = 0; k < changedItems.length; k++) {
                    if (changedItems[k].data == currentDependency) {
                        ixDependendOn = k;
                        break;
                    }
                }
                // Sanity check
                if (ixDependendOn == -1) {
                    Guard.raise(new Exception('Dependent object not found', 'ObjectNotFound', current.dependentOn[j]));
                }
                // Setting edge in 'to' array
                to[ixDependendOn] = true;
                // Setting edge in 'from' array
                from = edgesFrom[ixDependendOn] || {};
                from[i] = true;
                edgesFrom[ixDependendOn] = from;
            }
            // Persisting found edges in edgesTo array
            if (to !== null)
                edgesTo[i] = to;
        }

        // Array of sequentialyl independent blocks (containing objects, not just their id's)
        var independentBlocks = [];
        // Objects getting their dependency resolved in the current cycle.
        var currentBlock = [];
        // Filling currentBlock with initially independent objects.
        for (var x = 0; x < changedItems.length; x++) {
            if (!edgesTo.hasOwnProperty(x)) {
                currentBlock.push(x);
            }
        }
        while (currentBlock.length > 0) {
            // Shifting currentBlock to cbix,
            // and clearing currentBlock for next independent block
            var cbix = [].concat(currentBlock);
            currentBlock = [];
            // Iterating over previous independent block, to generate the new one
            for (var b = 0; b < cbix.length; b++) {
                var dependentNodes = edgesFrom[cbix[b]];
                if (typeof dependentNodes !== 'undefined') {
                    for (var d in dependentNodes) {
                        // Removing edge from 'edgesTo'
                        delete edgesTo[d][cbix[b]];
                        // Check if has any more dependency
                        if (!hasOwnProperty(edgesTo[d])) {
                            // It doesn't, so let's clean up a bit
                            delete edgesTo[d];
                            // and push the item to 'currentBlock'
                            currentBlock.push(d);
                        }
                    }
                }
                // Clearing processed item from 'edgesFrom'
                delete edgesFrom[cbix[b]];
            }
            // Push cbix t to independentBlocks
            var cb = [];
            for (var c = 0; c < cbix.length; c++) {
                var item = changedItems[cbix[c]];
                if (item.data.entityState != $data.EntityState.Unchanged)
                    cb.push(item);
            }
            if (cb.length > 0)
                independentBlocks.push(cb);
        }
        return independentBlocks;
    },
    getTraceString: function (queryable) {
        Guard.raise("Pure class");
    },
    setContext: function (ctx) {
        this.context = ctx;
    },

    _buildContinuationFunction: function (context, query) {
        if (Array.isArray(query.result)) {
            query.result.next = this._buildPagingMethod(context, query, 'next');
            query.result.prev = this._buildPagingMethod(context, query, 'prev');
        }
    },
    _buildPagingMethod: function (context, query, mode) {
        return function (onResult_items) {
            var pHandler = new $data.PromiseHandler();
            var cbWrapper = pHandler.createCallback(onResult_items);

            var continuation = new $data.Expressions.ContinuationExpressionBuilder(mode);
            var continuationResult = continuation.compile(query);
            if (continuationResult.expression) {
                var queryable = Container.createQueryable(context, continuationResult.expression);
                queryable.defaultType = query.defaultType;
                context.executeQuery(queryable, cbWrapper);
            } else {
                cbWrapper.error(new Exception(continuationResult.message, 'Invalid Operation', continuationResult));
            }

            return pHandler.getPromise();
        }
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
        var buildDbType_createConstrain = function (foreignType, dataType, propertyName, prefix, keyPropertyName) {
            var constrain = new Object();
            constrain[foreignType.name] = propertyName;
            constrain[dataType.name] = keyPropertyName ? keyPropertyName : prefix + '__' + propertyName;
            return constrain;
        };

        if (storageModel.Associations) {
            storageModel.Associations.forEach(function (association) {
                var addToEntityDef = false;
                var foreignType = association.FromType;
                var dataType = association.ToType;
                var foreignPropName = association.ToPropertyName;

                var memDef = association.FromType.getMemberDefinition(association.FromPropertyName);
                var keyProperties = [];
                if (memDef && typeof memDef.keys === "string" && memDef.keys) {
                    keyProperties = [memDef.keys];
                } else if (memDef && Array.isArray(memDef.keys)) {
                    keyProperties = [].concat(memDef.keys);
                }

                association.ReferentialConstraint = association.ReferentialConstraint || [];

                if ((association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1") || (association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1")) {
                    foreignType = association.ToType;
                    dataType = association.FromType;
                    foreignPropName = association.FromPropertyName;
                    addToEntityDef = true;
                }

                foreignType.memberDefinitions.getPublicMappedProperties().filter(function (d) { return d.key }).forEach(function (d, i) {
                    var constraint = buildDbType_createConstrain(foreignType, dataType, d.name, foreignPropName, keyProperties[i]);
                    if (addToEntityDef) {
                        //instanceDefinition[foreignPropName + '__' + d.name] = buildDbType_copyPropertyDefinition(d, foreignPropName);
                        instanceDefinition[constraint[dataType.name]] = buildDbType_copyPropertyDefinition(d, foreignPropName);

                        var dependentMemDef = dataType.getMemberDefinition(keyProperties[i]);
                        if (dependentMemDef) {
                            dependentMemDef.isDependentProperty = true;
                            dependentMemDef.navigationPropertyName = association.FromPropertyName;
                        }
                    }
                    association.ReferentialConstraint.push(constraint);
                }, this);
            }, this);
        }
        //Copy complex type properties
        if (storageModel.ComplexTypes) {
            storageModel.ComplexTypes.forEach(function (complexType) {
                complexType.ReferentialConstraint = complexType.ReferentialConstraint || [];

                complexType.ToType.memberDefinitions.getPublicMappedProperties().forEach(function (d) {
                    instanceDefinition[complexType.FromPropertyName + '__' + d.name] = buildDbType_copyPropertyDefinition(d);
                    complexType.ReferentialConstraint.push(buildDbType_createConstrain(complexType.ToType, complexType.FromType, d.name, complexType.FromPropertyName));
                }, this);
            }, this);
        }
    },
    buildDbType_generateConvertToFunction: function (storageModel) {
        return function (logicalEntity) {
            var dbInstance = new storageModel.PhysicalType();
            dbInstance.entityState = logicalEntity.entityState;

            //logicalEntity.changedProperties.forEach(function(memberDef){
            //}, this);
            storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (property) {
                if (logicalEntity[property.name] !== undefined) {
                    dbInstance[property.name] = logicalEntity[property.name];
                }
            }, this);

            if (storageModel.Associations) {
                storageModel.Associations.forEach(function (association) {
                    if ((association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1") || (association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1")) {
                        var complexInstance = logicalEntity[association.FromPropertyName];
                        if (complexInstance !== undefined) {
                            association.ReferentialConstraint.forEach(function (constrain) {
                                if (complexInstance !== null) {
                                    dbInstance[constrain[association.From]] = complexInstance[constrain[association.To]];
                                } else {
                                    dbInstance[constrain[association.From]] = null;
                                }
                            }, this);
                        }
                    }
                }, this);
            }
            if (storageModel.ComplexTypes) {
                storageModel.ComplexTypes.forEach(function (cmpType) {
                    var complexInstance = logicalEntity[cmpType.FromPropertyName];
                    if (complexInstance !== undefined) {
                        cmpType.ReferentialConstraint.forEach(function (constrain) {
                            if (complexInstance !== null) {
                                dbInstance[constrain[cmpType.From]] = complexInstance[constrain[cmpType.To]];
                            } else {
                                dbInstance[constrain[cmpType.From]] = null;
                            }
                        }, this);
                    }
                }, this);
            }
            return dbInstance;
        };
    },

    bulkInsert: function (a, b, c, callback) {
        callback.error(new Exception('Not Implemented'));
    },

    supportedFieldOperations: {
        value: {
            length: { dataType: "number", allowedIn: "filter, map" },
            substr: { dataType: "string", allowedIn: "filter", parameters: [{ name: "startFrom", dataType: "number" }, { name: "length", dataType: "number" }] },
            toLowerCase: { dataType: "string" }
        },
        enumerable: true,
        writable: true
    },

    resolveFieldOperation: function (operationName, expression, frameType) {
        ///<summary></summary>
        var result = this.supportedFieldOperations[operationName];
        if (Array.isArray(result)) {
            var i = 0;
            for (; i < result.length; i++) {
                if (result[i].allowedType === 'default' || Container.resolveType(result[i].allowedType) === Container.resolveType(expression.selector.memberDefinition.type) &&
                    (frameType && result[i].allowedIn &&
                        (
                            (Array.isArray(result[i].allowedIn) && result[i].allowedIn.some(function(type){ return frameType === Container.resolveType(type); })) ||
                            (!Array.isArray(result[i].allowedIn) && (frameType === Container.resolveType(result[i].allowedIn)))
                        )
                    )
                    ) {
                    result = result[i];
                    break;
                }
            }
            if (i === result.length) {
                result = undefined;
            }
        }

        if (!result) {
            Guard.raise(new Exception("Field operation '" + operationName + "' is not supported by the provider"));
        };
        if (frameType && result.allowedIn) {
            if ((result.allowedIn instanceof Array && !result.allowedIn.some(function (type) { return frameType === Container.resolveType(type); })) ||
                        (!(result.allowedIn instanceof Array) && frameType !== Container.resolveType(result.allowedIn))) {
                Guard.raise(new Exception(operationName + " not supported in: " + frameType.name));
            }
        }
        result.name = operationName;
        return result;
    },

    supportedBinaryOperators: {
        value: {
            equal: { mapTo: 'eq', dataType: "boolean" }
        },
        enumerable: true,
        writable: true
    },

    resolveBinaryOperator: function (operator, expression, frameType) {
        var result = this.supportedBinaryOperators[operator];
        if (!result) {
            Guard.raise(new Exception("Binary operator '" + operator + "' is not supported by the provider"));
        };
        if (frameType && result.allowedIn) {
            if ((result.allowedIn instanceof Array && !result.allowedIn.some(function (type) { return frameType === Container.resolveType(type); })) ||
                        (!(result.allowedIn instanceof Array) && frameType !== Container.resolveType(result.allowedIn))) {
                Guard.raise(new Exception(operator + " not supported in: " + frameType.name));
            }
        }
        result.name = operator;
        return result;
    },

    supportedUnaryOperators: {
        value: {
            not: { mapTo: 'not' }
        },
        enumerable: true,
        writable: true
    },
    resolveUnaryOperator: function (operator, expression, frameType) {
        var result = this.supportedUnaryOperators[operator];
        if (!result) {
            Guard.raise(new Exception("Unary operator '" + operator + "' is not supported by the provider"));
        };
        if (frameType && result.allowedIn) {
            if ((result.allowedIn instanceof Array && !result.allowedIn.some(function (type) { return frameType === Container.resolveType(type); })) ||
                        (!(result.allowedIn instanceof Array) && frameType !== Container.resolveType(result.allowedIn))) {
                Guard.raise(new Exception(operator + " not supported in: " + frameType.name));
            }
        }
        result.name = operator;
        return result;
    },

    supportedSetOperations: {
        value: {
            toArray: { invokable: true, allowedIn: [] }
        },
        enumerable: true,
        writable: true
    },
    resolveSetOperations: function (operation, expression, frameType) {
        var result = this.supportedSetOperations[operation];
        if (!result) {
            Guard.raise(new Exception("Operation '" + operation + "' is not supported by the provider"));
        };
        var allowedIn = result.allowedIn || [];
        if (frameType && allowedIn) {
            if ((allowedIn instanceof Array && !allowedIn.some(function (type) { return frameType === Container.resolveType(type); })) ||
                        (!(allowedIn instanceof Array) && frameType !== Container.resolveType(allowedIn))) {
                Guard.raise(new Exception(operation + " not supported in: " + frameType.name));
            }
        }
        return result;
    },

    resolveTypeOperations: function (operation, expression, frameType) {
        Guard.raise(new Exception("Entity '" + expression.entityType.name + "' Operation '" + operation + "' is not supported by the provider"));
    },

    resolveContextOperations: function (operation, expression, frameType) {
        Guard.raise(new Exception("Context '" + expression.instance.getType().name + "' Operation '" + operation + "' is not supported by the provider"));
    },

    makePhysicalTypeDefinition: function (entityDefinition, association) {
    },

    _beginTran: function (tables, isWrite, callBack) {
        callBack.success(new $data.Transaction());
    },

    getFieldUrl: function () {
        return '#';
    },

    supportedAutoincrementKeys: {
        value: { }
    }
},
{
    onRegisterProvider: { value: new $data.Event() },
    registerProvider: function (name, provider) {
        this.onRegisterProvider.fire({ name: name, provider: provider }, this);
        $data.RegisteredStorageProviders = $data.RegisteredStorageProviders || [];
        $data.RegisteredStorageProviders[name] = provider;
    },
    getProvider: function (name) {
        var provider = $data.RegisteredStorageProviders[name];
        if (!provider)
            console.warn("Provider not found: '" + name + "'");
        return provider;
        /*var provider = $data.RegisteredStorageProviders[name];
        if (!provider)
            Guard.raise(new Exception("Provider not found: '" + name + "'", "Not Found"));
        return provider;*/
    },
    isSupported: {
        get: function () { return true; },
        set: function () { }
    }
});
