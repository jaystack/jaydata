$C('$data.storageProviders.InMemory.InMemoryProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg, ctx) {
        this.context = ctx;
        this.providerConfiguration = $data.typeSystem.extend({
            source: null,
            persistentData: false,
            //obsolate
            localStoreName: 'JayData_InMemory_Provider',
            databaseName: 'JayData_InMemory_Provider'
        }, cfg);

        if (this.providerConfiguration.databaseName === 'JayData_InMemory_Provider')
            this.providerConfiguration.databaseName = this.providerConfiguration.localStoreName;
    },
    initializeStore: function (callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        var setKeys = [];
        for(var i in this.context._entitySetReferences){
            setKeys.push(this.context._entitySetReferences[i].tableName);
        }
        var localStorageData = null;
        if(this.providerConfiguration.persistentData && window.localStorage){
            var localStoreName = this.providerConfiguration.databaseName || "JayData_InMemory_Provider";
            var that = this;
            localStorageData = JSON.parse(window.localStorage.getItem(localStoreName),
                function(key, value){
                    if(setKeys.indexOf(key)>-1 && value.map){
                        return value.map(function(item){return new that.context[key].createNew(item);});
                    }
                    return value;
                });
        }

        var tempSource = localStorageData || this.providerConfiguration.source || {};

        //check data and crate sequence table if needed
        this.providerConfiguration.source = {'inmemory_sequence':{}};
        for(var index = 0;index<this.context._storageModel.length;index++){
            var storageModel = this.context._storageModel[index];
            //Create store for EntitySet
            this.providerConfiguration.source[storageModel.TableName] = [];
            //Check primary key
            var keys = storageModel.LogicalType.memberDefinitions.getKeyProperties();
            var computedKeys = keys.filter(function(key){return key.computed});
            if(computedKeys.length>1){
                Guard.raise(new Exception('More than one computed field not supported in ' + storageModel.TableName + ' entity set.'));
            }
            var isIntegerPk = false;
            if(computedKeys.length === 1){
                var resolvedType = Container.resolveType(computedKeys[0].type);
                if(resolvedType === $data.Integer){
                    this.providerConfiguration.source['inmemory_sequence'][storageModel.TableName] = 0;
                    isIntegerPk = true;
                }else if (resolvedType === $data.Guid){

                }else{
                    Guard.raise(new Exception('Not supported key field type. Computed pk field type are $data.Integer or $data.Guid!', 'ComputedKeyFieldError'));
                }
            }
            //validate init data
            if (tempSource[storageModel.TableName]) {
                for (var i = 0; i < tempSource[storageModel.TableName].length; i++) {
                    var entity = tempSource[storageModel.TableName][i];
                    if(entity instanceof storageModel.LogicalType){
                        if(isIntegerPk){
                            var keyValue = entity[computedKeys[0].name]
                            if (keyValue > this.providerConfiguration.source['inmemory_sequence'][storageModel.TableName]) {
                                this.providerConfiguration.source['inmemory_sequence'][storageModel.TableName] = keyValue;
                            }
                        }
                        this.providerConfiguration.source[storageModel.TableName].push(entity);
                    }else{
                        Guard.raise(new Exception('Invalid element in source: ' + storageModel.TableName));
                    }
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
        var sourceName = query.context.getEntitySetFromElementType(query.defaultType).tableName;
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
                    result.sort(function (a, b) {
                        var aVal = sql.$order[i](a);
                        var bVal = sql.$order[i](b);
                        return aVal === bVal ? 0 : (aVal > bVal ? 1 : -1);
                    });
                else
                    result.sort(function (a, b) {
                        var aVal = sql.$order[i](a);
                        var bVal = sql.$order[i](b);
                        return aVal === bVal ? 0 : (aVal < bVal ? 1 : -1);
                    });
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
                    this._save_add_processPk(item);
                    this.providerConfiguration.source[item.entitySet.tableName].push(item.data);
                    break;
                case $data.EntityState.Deleted:
                    var collection = this.providerConfiguration.source[item.entitySet.tableName];
                    var entity = this._save_getEntity(item, collection);
                    var idx = collection.indexOf(entity);
                    collection.splice(idx, 1);
                    break;
                case $data.EntityState.Modified:
                    if(item.data.changedProperties && item.data.changedProperties.length>0){
                        var collection = this.providerConfiguration.source[item.entitySet.tableName];
                        var entity = this._save_getEntity(item, collection);
                        for(var j=0;j<item.data.changedProperties.length;j++){
                            var field = item.data.changedProperties[j];
                            if(!field.key && item.entitySet.elementType.memberDefinitions.getPublicMappedPropertyNames().indexOf(field.name)>-1){
                                entity[field.name] = item.data[field.name];
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
        }
        if(this.providerConfiguration.persistentData && window.localStorage){
            var localStoreName = this.providerConfiguration.databaseName || "JayData_InMemory_Provider";
            localStorageData = window.localStorage.setItem(localStoreName, JSON.stringify(this.providerConfiguration.source));
        }
        callBack.success();
    },
    _save_add_processPk:function(item){
        var keys = item.entitySet.elementType.memberDefinitions.getKeyProperties();
        if(keys.length === 1 && keys[0].computed){
            var key = keys[0];
            var keyResolveType = Container.resolveType(key.type);
            if(keyResolveType === $data.Guid){
                item.data[key.name] = $data.Guid.NewGuid();
            } else if(keyResolveType === $data.Integer){
                var sequenceValue = this.providerConfiguration.source['inmemory_sequence'][item.entitySet.tableName];
                item.data[key.name] = sequenceValue+1;
                this.providerConfiguration.source['inmemory_sequence'][item.entitySet.tableName] = sequenceValue + 1;
            }else{
                Guard.raise(new Exception("Not supported data type!"))
            }
        }
        else{
            for(var j=0;j<keys.length;j++){
                if(item.data[keys[j].name] === null || item.data[keys[j].name] === undefined){
                    Guard.raise(new Exception('Key field must set value! Key field name without value: '+keys[j].name));
                }
            }
        }
    },
    _save_getEntity:function(item, collection){
        var keys = item.entitySet.elementType.memberDefinitions.getKeyProperties();
        entities = collection.filter(function(entity){
            var isEqual = true;
            for(var i = 0;i<keys.length;i++){
                isEqual = isEqual && entity[keys[i].name] === item.data[keys[i].name];
            }
            return isEqual;
        });
        if(entities>1){
            Guard.raise(new Exception("Inconsistent storage!"));
        }
        return entities[0];
    },
    getTraceString: function (queryable) {
        var compiled = this._compile(queryable);
        return compiled;
    },
    supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date, $data.Object, $data.Guid], writable: false },

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
            not: { mapTo: '!' }
        }
    },

    supportedFieldOperations: {
        value: {
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
            },
            length: {
                dataType: "number",
                propertyFunction: true
            },
            substr: {
                mapTo: "substr(",
                rightValue: ")",
                dataType: "string",
                parameters: [{ name: "startFrom", dataType: "number" }, { name: "length", dataType: "number" }],
                propertyFunction: true
            },
            toLowerCase: {
                dataType: "string", mapTo: "toLowerCase()",
                propertyFunction: true
            },
            toUpperCase: {
                dataType: "string", mapTo: "toUpperCase()",
                propertyFunction: true
            },
            'trim': {
                dataType: $data.String,
                mapTo: 'trim()',
                propertyFunction: true
            },
            'ltrim': {
                dataType: $data.String,
                mapTo: 'trimLeft()',
                propertyFunction: true
            },
            'rtrim': {
                dataType: $data.String,
                mapTo: 'trimRight()',
                propertyFunction: true
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
                '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } return JSON.parse(o); },
                '$data.Guid': function (guid) { return typeof guid === 'string' ? $data.parseGuid(guid) : guid; }
            },
            toDb: {
                '$data.Integer': function (number) { return number; },
                '$data.Number': function (number) { return number % 1 == 0 ? number : number + 'm'; },
                '$data.Date': function (date) { return date ? "datetime'" + date.toISOString() + "'" : null; },
                '$data.String': function (text) { return "'" + text.replace(/'/g, "''") + "'"; },
                '$data.Boolean': function (bool) { return bool ? 'true' : 'false'; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Object': function (o) { return JSON.stringify(o); },
                '$data.Array': function (o) { return JSON.stringify(o); },
                '$data.Guid': function (guid) { return guid; }
            }
        }
    }
}, null);
$C('$data.storageProviders.InMemory.LocalStorageProvider', $data.storageProviders.InMemory.InMemoryProvider, null,{
    constructor:function(cfg, ctx){
        this.providerConfiguration.persistentData = true;
    }
}, null);
$data.StorageProviderBase.registerProvider("InMemory", $data.storageProviders.InMemory.InMemoryProvider);
$data.StorageProviderBase.registerProvider("LocalStore", $data.storageProviders.InMemory.LocalStorageProvider);