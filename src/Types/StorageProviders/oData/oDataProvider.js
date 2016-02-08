import $data, { $C, Guard, Container, Exception, MemberDefinition } from 'jaydata/core';
import * as odatajs from 'jaydata-odatajs';
import * as activities from './oDataRequestActivities.js'
import { strategy as emptySaveStrategy } from './SaveStrategies/empty'
import { strategy as singleSaveStrategy } from './SaveStrategies/single'
import { strategy as batchSaveStrategy } from './SaveStrategies/batch'


var OData = $data.__global['OData'];
var datajs = $data.__global['datajs'];

var datajsPatch;
datajsPatch = function (OData) {
    // just datajs-1.1.0
    if (OData && OData.jsonHandler && 'useJsonLight' in OData.jsonHandler && typeof datajs === 'object' && !datajs.version) {
        $data.Trace.log('!!!!!!! - patch datajs 1.1.0');
        var oldread = OData.defaultHandler.read;
        OData.defaultHandler.read = function (p, context) {
            delete context.contentType;
            delete context.dataServiceVersion;

            oldread.apply(this, arguments);
        };
        var oldwrite = OData.defaultHandler.write;
        OData.defaultHandler.write = function (p, context) {
            delete context.contentType;
            delete context.dataServiceVersion;

            oldwrite.apply(this, arguments);
        };
    }
    datajsPatch = function () { };
}

$data.defaults = $data.defaults || {};
$data.defaults.OData = $data.defaults.OData || {};
if(!("withReferenceMethods" in $data.defaults.OData)){
    $data.defaults.OData.withReferenceMethods = false;
}
if(!("disableBatch" in $data.defaults.OData)){
    $data.defaults.OData.disableBatch = false;
}
if(!("eTagAny" in $data.defaults.OData)){
    $data.defaults.OData.eTagAny = '*';
}
if(!("enableDeepSave" in $data.defaults.OData)){
    $data.defaults.OData.enableDeepSave = false;
}

var checkODataMode = function(context, functionName){
    if(typeof context.providerConfiguration[functionName] !== 'undefined'){
        return !!context.providerConfiguration[functionName];
    }
    return !!$data.defaults.OData[functionName];
}

$C('$data.storageProviders.oData.RequestManager', $data.Base, null, {
    constructor: function(){
        this._items = [];
        this._entities = [];
    },
    _items: { type: $data.Array },
    _entities: { type: $data.Array },
    add: function(changedItem, request, countable){
        var item = {
            data: changedItem,
            entity: changedItem.data,
            request: request,
            itemIndex: ++this.maxItemIndex,
            references: []
        };
        
        // request.headers = request.headers || {};
        // request.headers["content-Id"] = item.itemIndex; 
        request.add(new activities.SetHeaderProperty("content-Id", item.itemIndex))
        
        if(countable !== false){
            this.length++;
        }
        
        this._entities.push(item.entity)
        this._items.push(item);
        
        return item
    },
    addItemReference: function(entity, reference){
        var item = this.getItem(entity);
        if(item){
            item.references.push(reference);
        } 
    },
    getItemIndex: function(entity){
        if(!entity) return -1;
        var idx = this._entities.indexOf(entity);
        if(idx >= 0 && !this._items[idx].removed) {
            return this._items[idx].itemIndex;
        }
        return -1;
    },
    getItem: function(entity, onlyAvailable){
        if(!entity) return null;
        var idx = this._entities.indexOf(entity);
        if(idx >= 0 && (!onlyAvailable || !this._items[idx].removed)) {
            return this._items[idx];
        }
        return null;
    },
    remove: function(entity){
        var idx = this._entities.indexOf(entity);
        if(idx >= 0) {
            var item = this._items[idx];
            if(!item.removed) {
                this._items[idx].removed = true;
                this.length--;
                return true;
            }
        }
        return false;
    },
    getItems: function(){
        return this._items.filter(function(it){ return !it.removed })
    },
    getByResponse: function(response, i){
        //use response.headers['content-id']
        
        var idx = i;
        
        if(!this._indexCalculated){
            this._indexCalculated = true;
            this._dataForResult = this._items.filter(function(it){
                return !it.removed;
            });
        }
         
        var item = this._dataForResult[idx++];
        return item ? item.entity : null
    },
    setProcessed: function(entity){
        var idx = this._entities.indexOf(entity);
        if(idx >= 0) {
            var item = this._items[idx];
            if(!item.isProcessed){
                this._items[idx].isProcessed = true;
                return true;
            }
        }
        return false;
    },
    
    maxItemIndex: { value: 0 },
    length: { value: 0 }
});



$C('$data.storageProviders.oData.oDataProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg, ctx) {
        this.SqlCommands = [];
        this.context = ctx;
        this.providerConfiguration = $data.typeSystem.extend({
            dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged,
            oDataServiceHost: "/odata.svc",
            serviceUrl: "",
            maxDataServiceVersion: '4.0',
            dataServiceVersion: undefined,
            user: null,
            password: null,
            withCredentials: false,
            //enableJSONP: undefined,
            //useJsonLight: undefined
            //disableBatch: undefined
            //withReferenceMethods: undefined
            //enableDeepSave: undefined
            UpdateMethod: 'PATCH'
        }, cfg);

        if (this.providerConfiguration.maxDataServiceVersion === "4.0") {
            if (typeof odatajs === 'undefined' || typeof odatajs.oData === 'undefined') {
                Guard.raise(new Exception('odatajs is required', 'Not Found!'));
            } else {
                this.oData = odatajs.oData
            }
        } else {
            if (typeof OData === 'undefined') {
                Guard.raise(new Exception('datajs is required', 'Not Found!'));
            } else {
                this.oData = OData;
                datajsPatch(this.oData);
            }
        }

        //this.fixkDataServiceVersions(cfg);

        if (this.context && this.context._buildDbType_generateConvertToFunction && this.buildDbType_generateConvertToFunction) {
            this.context._buildDbType_generateConvertToFunction = this.buildDbType_generateConvertToFunction;
        }
        if (this.context && this.context._buildDbType_modifyInstanceDefinition && this.buildDbType_modifyInstanceDefinition) {
            this.context._buildDbType_modifyInstanceDefinition = this.buildDbType_modifyInstanceDefinition;
        }
    },
    fixkDataServiceVersions: function (cfg) {
        if (this.providerConfiguration.dataServiceVersion > this.providerConfiguration.maxDataServiceVersion) {
            this.providerConfiguration.dataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
        }

        if (this.providerConfiguration.setDataServiceVersionToMax === true) {
            this.providerConfiguration.dataServiceVersion = this.providerConfiguration.maxDataServiceVersion;
        }

        if ((cfg && !cfg.UpdateMethod && this.providerConfiguration.dataServiceVersion < '3.0') || !this.providerConfiguration.dataServiceVersion) {
            this.providerConfiguration.UpdateMethod = 'MERGE';
        }
    },
    initializeStore: function (callBack) {
        callBack = $data.PromiseHandlerBase.createCallbackSettings(callBack);
        switch (this.providerConfiguration.dbCreation) {
            case $data.storageProviders.DbCreationType.DropAllExistingTables:
                var that = this;
                if (this.providerConfiguration.serviceUrl) {

                    var requestData = [{
                        requestUri: that.providerConfiguration.serviceUrl + "/Delete",
                        method: 'POST'
                    }, function (d) {
                        //console.log("RESET oData database");
                        callBack.success(that.context);
                    }, function (error) {
                        callBack.success(that.context);
                    }];

                    this.appendBasicAuth(requestData[0], this.providerConfiguration.user, this.providerConfiguration.password, this.providerConfiguration.withCredentials);
                    //if (this.providerConfiguration.user) {
                    //    requestData[0].user = this.providerConfiguration.user;
                    //    requestData[0].password = this.providerConfiguration.password || "";
                    //}

                    this.context.prepareRequest.call(this, requestData);
                    this.oData.request.apply(this, requestData);
                } else {
                    callBack.success(that.context);
                }
                break;
            default:
                callBack.success(this.context);
                break;
        }
    },
    buildDbType_generateConvertToFunction: function (storageModel, context) {
        return function (logicalEntity, convertedItems) {
            var dbInstance = new storageModel.PhysicalType();
            dbInstance.entityState = logicalEntity.entityState;

            storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (property) {
                dbInstance.initData[property.name] = logicalEntity[property.name];
            }, this);

            if (storageModel.Associations) {
                storageModel.Associations.forEach(function (association) {
                    if ((association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1") ||
                        (association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1") ||
                        (association.FromMultiplicity == '$$unbound')) {
                        var refValue = logicalEntity[association.FromPropertyName];
                        if (/*refValue !== null &&*/ refValue !== undefined) {
                            if (refValue instanceof $data.Array) {
                                dbInstance.initData[association.FromPropertyName] = dbInstance[association.FromPropertyName] || [];
                                refValue.forEach(function (rv) {
                                    var item = convertedItems.getItem(rv, true)
                                    var contentId = item ? item.itemIndex : -1;
                                    if (rv.entityState == $data.EntityState.Modified || contentId < 0) {
                                        var sMod = context._storageModel.getStorageModel(rv.getType())
                                        var tblName = sMod.TableName;
                                        var pk = '(' + context.storageProvider.getEntityKeysValue({ data: rv, entitySet: context.getEntitySetFromElementType(rv.getType()) }) + ')';
                                        dbInstance.initData[association.FromPropertyName].push({ __metadata: { uri: tblName + pk } });
                                    } else {
                                        if (contentId < 0) { Guard.raise("Dependency graph error"); }
                                        //dbInstance.initData[association.FromPropertyName].push({ __metadata: { uri: "$" + (contentId) } });
                                        dbInstance.initData[association.FromPropertyName].push({ __convertedRefence: item });
                                    }
                                }, this);
                            } else if (refValue === null) {
                                dbInstance.initData[association.FromPropertyName] = null;
                            } else {
                                var item = convertedItems.getItem(refValue, true);
                                var contentId = item ? item.itemIndex : -1;
                                if (refValue.entityState == $data.EntityState.Modified || contentId < 0) {
                                    var sMod = context._storageModel.getStorageModel(refValue.getType())
                                    var tblName = sMod.TableName;
                                    var pk = '(' + context.storageProvider.getEntityKeysValue({ data: refValue, entitySet: context.getEntitySetFromElementType(refValue.getType()) }) + ')';
                                    dbInstance.initData[association.FromPropertyName] = { __metadata: { uri: tblName + pk } };
                                } else {
                                    if (contentId < 0) { Guard.raise("Dependency graph error"); }
                                    //dbInstance.initData[association.FromPropertyName] = { __metadata: { uri: "$" + (contentId) } };
                                    dbInstance.initData[association.FromPropertyName] = { __convertedRefence: item };
                                }
                            }
                        }
                    }
                }, this);
            }
            if (storageModel.ComplexTypes) {
                storageModel.ComplexTypes.forEach(function (cmpType) {
                    dbInstance.initData[cmpType.FromPropertyName] = logicalEntity[cmpType.FromPropertyName];
                }, this);
            }
            return dbInstance;
        };
    },
    buildDbType_modifyInstanceDefinition: function () { return; },
    executeQuery: function (query, callBack) {
        callBack = $data.PromiseHandlerBase.createCallbackSettings(callBack);

        var sql = {};
        try {
            sql = this._compile(query);
        } catch (e) {
            callBack.error(e);
            return;
        }
        var schema = this.context;

        var that = this;
        var countProperty = "@odata.count";

        var requestData = [
            {
                requestUri: this.providerConfiguration.oDataServiceHost + sql.queryText,
                method: sql.method,
                data: sql.postData,
                headers: {
                }
            },
            function (data, textStatus, jqXHR) {

                if (!data && textStatus.body && !sql.isBatchExecuteQuery) data = JSON.parse(textStatus.body);
                if (callBack.success) {
                    var processSuccess = function (query, data, sql) {
                        query.rawDataList = typeof data === 'string' ? [{ cnt: Container.convertTo(data, $data.Integer) }] : data;
                        if (sql.withInlineCount && typeof data === 'object' && (typeof data[countProperty] !== 'undefined' || ('d' in data && typeof data.d[countProperty] !== 'undefined'))) {
                            query.__count = new Number(typeof data[countProperty] !== 'undefined' ? data[countProperty] : data.d[countProperty]).valueOf();
                        }
                    }

                    if (sql.isBatchExecuteQuery) {
                        query.rawDataList = sql.subQueries;
                        for (var i = 0; i < data.__batchResponses.length; i++) {
                            var resp = data.__batchResponses[i];

                            if (!resp.data) {
                                if (resp.body) {
                                    resp.data = JSON.parse(resp.body);
                                } else {
                                    callBack.error(that.parseError(resp, arguments));
                                    return;
                                }
                            }

                            processSuccess(sql.subQueries[i], resp.data, sql.subQueries[i]._getComplitedData());
                        }
                    } else {
                        processSuccess(query, data, sql);
                    }

                    callBack.success(query);
                }
            },
            function (error) {
                callBack.error(that.parseError(error, arguments));
            },
            sql.isBatchExecuteQuery ? this.oData.batch.batchHandler : undefined
        ];

        if (typeof this.providerConfiguration.enableJSONP !== 'undefined') {
            requestData[0].enableJsonpCallback = this.providerConfiguration.enableJSONP;
        }
        if (typeof this.providerConfiguration.useJsonLight !== 'undefined') {
            requestData[0].useJsonLight = this.providerConfiguration.useJsonLight;
        }

        this.appendBasicAuth(requestData[0], this.providerConfiguration.user, this.providerConfiguration.password, this.providerConfiguration.withCredentials);
        //if (this.providerConfiguration.user) {
        //    requestData[0].user = this.providerConfiguration.user;
        //    requestData[0].password = this.providerConfiguration.password || "";
        //}

        this.context.prepareRequest.call(this, requestData);
        //$data.ajax(requestData);
        //OData.request(requestData, requestData.success, requestData.error);
        this.oData.request.apply(this, requestData);
    },
    _compile: function (queryable, params) {
        var compiler = new $data.storageProviders.oData.oDataCompiler();
        var compiled = compiler.compile(queryable);
        return compiled;
    },
    saveChanges: function (callBack, changedItems) {
        if (changedItems.length > 0) {
            this.saveInternal(changedItems, callBack);
        }
        else {
            callBack.success(0);
        }
    },
    saveInternal: function (changedItems, callBack) {
        var independentBlocks = this.buildIndependentBlocks(changedItems);
        if(checkODataMode(this, "enableDeepSave")){
            this._checkDeepSave(changedItems)
        }
        var convertedItems = this._buildSaveData(independentBlocks, changedItems)
        var actionMode = this.saveStrategySelector(convertedItems);
        if(actionMode){
            actionMode.save(this, convertedItems, callBack);
        } else {
            callBack.error(new Exception('Not Found', 'Save action not found'));
        }
    },
    saveStrategySelector: function(convertedItems){
        for(var i = 0; i < this.saveStrategies.length; i++){
            var saveAction = this.saveStrategies[i];
            if(saveAction.condition(this, convertedItems)){
                return saveAction;
            }
        }
        
        return null;
    },
    saveStrategies: {
        value: [
            batchSaveStrategy,
            singleSaveStrategy,
            emptySaveStrategy
        ]
    },
    
    _discoverSaveOrder: function(changedItems){
        var entityItems = changedItems.map(function(it){ return it.data });
        var entityInfo = changedItems.map(function(it){ return { path: [], visited: false, result: true } });
        var entityQueue = [];
        var discoveredEntities = [];
       
        var process = function(currentEntity){
            var index = entityItems.indexOf(currentEntity);
            var changedItem = changedItems[index];
            var info = entityInfo[index];
            
            if(info.visited) return info.result;
            if(info.visiting) return false;
            
            var references = [];
            if(changedItem.referredBy){
                references = references.concat(changedItem.referredBy);
            }
            if(changedItem.dependentOn){
                references = references.concat(changedItem.dependentOn);
            }
            
            for(var i = 0; i < references.length; i++){
                var ref = references[i];
                if(discoveredEntities.indexOf(ref) < 0){
                    entityQueue.push(ref);
                    discoveredEntities.push(ref);
                    var refIndex = entityItems.indexOf(ref);
                    changedItems[refIndex].deepParent = currentEntity;
                }
            }
        }
        
        
        for(var i = 0; i < changedItems.length; i++){
            var changedItem = changedItems[i];
            if(entityQueue.indexOf(changedItem.data) < 0){
                entityQueue.push(changedItem.data);
                discoveredEntities.push(changedItem.data);
                entityInfo[i].parent = null;
            }
            
            while(entityQueue.length){
                var currentItem = entityQueue.shift();
                process(currentItem);
            }
        }
    },
    
    _checkDeepSave: function(changedItems){
        var entityItems = changedItems.map(function(it){ return it.data });
        var entityInfo = changedItems.map(function(it){ return { path: [], visited: false, result: true } });
       
        var discover = function(changedItem, parent, index){
            var info = entityInfo[index];
            if(info.visited) return info.result;
            if(info.visiting) return false;
            
            var references = [];
            if(changedItem.referredBy){
                references = references.concat(changedItem.referredBy);
            }
            if(changedItem.dependentOn){
                references = references.concat(changedItem.dependentOn);
            }
            
            
            if(references.length === 0){
                info.visited = true;
                info.result = true;
            } else {
                info.visiting = true;
                
                for(var i = 0; i < references.length; i++){
                    var entity = references[i]
                    var idx = entityItems.indexOf(entity);
                    var innerChangeItem = changedItems[idx];
                    if(!innerChangeItem) return false; 
                    if(innerChangeItem === parent) continue;
                    
                    var result = discover(innerChangeItem, changedItem, idx);
                    info.result = info.result && changedItem.data.entityState === $data.EntityState.Added && (!changedItem.additionalDependentOn || changedItem.additionalDependentOn.length === 0) && result;
                }
                delete info.visiting;
                info.visited = true; 
            }
            
            changedItem.enableDeepSave = info.result;
            return info.result;
        }
        
        
        for(var i = 0; i < changedItems.length; i++){
            var changedItem = changedItems[i];
            discover(changedItem, null, i);
        }
        
        this._discoverSaveOrder(changedItems);
    },
    
    _buildSaveData: function(independentBlocks, changedItems) {
        var convertedItems = new $data.storageProviders.oData.RequestManager();
        for (var index = 0; index < independentBlocks.length; index++) {
            for (var i = 0; i < independentBlocks[index].length; i++) {
                var independentItem = independentBlocks[index][i];
                
                var request = null;
                var item = convertedItems.getItem(independentItem.data)
                if(!item){
                    request = new activities.RequestBuilder(this)
                    request.add(new activities.SetUrl(this.providerConfiguration.oDataServiceHost + '/'))
                    item = convertedItems.add(independentItem, request);
                }
                request = item.request;
                
                var entityState = independentItem.data.entityState;
                if(typeof this._buildRequestObject['EntityState_' + entityState] === 'function'){
                    this._buildRequestObject['EntityState_' + entityState](this, independentItem, convertedItems, request, changedItems)
                } else {
                    Guard.raise(new Exception("Not supported Entity state"));
                }
            }
        }
        
        return convertedItems;
    },
    _buildRequestObject: {
        value: {
            'EntityState_20': function(provider, item, convertedItem, request, changedItems){
                request.add(
                    new activities.SetMethod("POST"), 
                    new activities.AppendUrl(item.entitySet.tableName)
                )
                
                provider.save_getInitData(item, convertedItem, undefined, undefined, request, changedItems);
            },
            'EntityState_30': function(provider, item, convertedItem, request, changedItems){
                request.add(
                    new activities.SetMethod(provider.providerConfiguration.UpdateMethod),
                    new activities.AppendUrl(item.entitySet.tableName), 
                    new activities.AppendUrl("(" + provider.getEntityKeysValue(item) + ")")
                )
                
                provider.addETagHeader(item, request)
                
                provider.save_getInitData(item, convertedItem, undefined, undefined, request, changedItems);
            },
            'EntityState_40': function(provider, item, convertedItem, request, changedItems){
                request.add(
                    new activities.SetMethod("DELETE"),
                    new activities.ClearRequestData(),
                    new activities.AppendUrl(item.entitySet.tableName),
                    new activities.AppendUrl("(" + provider.getEntityKeysValue(item) + ")")
                )
                
                provider.addETagHeader(item, request)
            },
        }
    },
    reload_fromResponse: function (item, data, response) {
        var that = this;
        item.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            var propType = Container.resolveType(memDef.type);
            if (memDef.computed || memDef.key || !memDef.inverseProperty) {
                if (memDef.concurrencyMode === $data.ConcurrencyMode.Fixed) {
                    //unescape?
                    //item[memDef.name] = response.headers.ETag || response.headers.Etag || response.headers.etag;
                    item[memDef.name] = data['@odata.etag'];

                } else if (memDef.isAssignableTo) {
                    if (data[memDef.name]) {
                        item[memDef.name] = new propType(data[memDef.name], { converters: that.fieldConverter.fromDb });
                    } else {
                        item[memDef.name] = data[memDef.name]
                    }

                } else if (propType === $data.Array && memDef.elementType) {
                    var aeType = Container.resolveType(memDef.elementType);
                    if (data[memDef.name] && Array.isArray(data[memDef.name])) {
                        var arrayProperty = [];
                        for (var ap = 0; ap < data[memDef.name].length; ap++) {
                            var aitem = data[memDef.name][ap];
                            if (aeType.isAssignableTo && !Guard.isNullOrUndefined(aitem)) {
                                arrayProperty.push(new aeType(aitem, { converters: that.fieldConverter.fromDb }));
                            } else {
                                var etypeName = Container.resolveName(aeType);
                                var econverter = that.fieldConverter.fromDb[etypeName];

                                arrayProperty.push(econverter ? econverter(aitem) : aitem);
                            }
                        }
                        item[memDef.name] = arrayProperty;
                    } else if (!data[memDef.name]) {
                        item[memDef.name] = data[memDef.name]
                    }

                } else {
                    var typeName = Container.resolveName(memDef.type);
                    var converter = that.fieldConverter.fromDb[typeName];

                    item[memDef.name] = converter ? converter(data[memDef.name]) : data[memDef.name];
                }
            }
        }, this);
    },

    save_getInitData: function (item, convertedItems, isComplex, isDeep, request, changedItems) {
        var self = this;
        if (!isComplex) {
            item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
        } else {
            item.physicalData = item.data;
        }
        var hasSavedProperty = item.data.entityState === $data.EntityState.Added;
        item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
            hasSavedProperty = self.propertyConversationSelector(item, memdef, convertedItems, request, changedItems, isDeep) || hasSavedProperty;
        }, this);
        
        if(!hasSavedProperty && !isDeep){
            convertedItems.remove(item.data)
        }
    },
    propertyConversationSelector: function(item, memdef, convertedItems, request, changedItems, isDeep) {
        if (memdef.kind == $data.MemberTypes.complexProperty) {
            return this._complexPropertySelector.apply(this, arguments)
        }
        
        if (memdef.kind == $data.MemberTypes.property) {
            return this._propertySelector.apply(this, arguments);
        }
        
        if(memdef.kind == $data.MemberTypes.navProperty){
            return this._navigationPropertySelector.apply(this, arguments);
        }
        
        return false;
    },
    _complexPropertySelector: function(item, memdef, convertedItems, request, changedItems, isDeep){
        return this.propertyConversationStrategies["complex"].apply(this, arguments)
    },
    _propertySelector: function(item, memdef, convertedItems, request, changedItems, isDeep){
        if(typeof memdef.concurrencyMode === 'undefined') {
            switch (true){
                case memdef.notMapped: 
                    return false;
                case memdef.key === true:
                    this.propertyConversationStrategies["default"].apply(this, arguments)
                    return false;
                case isDeep:
                case item.data.entityState === $data.EntityState.Added:
                case this._propertyIsChanged(item.data, memdef):
                    return this.propertyConversationStrategies["default"].apply(this, arguments)
                default: return false;
            }
        }
        
        return false;
    },
    _navigationPropertySelector: function(item, memdef, convertedItems, request, changedItems, isDeep){
        if (isDeep || item.data.entityState === $data.EntityState.Added || this._propertyIsChanged(item.data, memdef)) {
            
            var navigationValue = item.data[memdef.name];
            if (checkODataMode(this, 'enableDeepSave') && navigationValue && item.data.entityState === $data.EntityState.Added) {
                var result = null;
                if (Array.isArray(navigationValue)) {
                    navigationValue.forEach((navItem, index) => {
                        this._processDeepSaveItems(item, memdef, convertedItems, request, changedItems, navItem, "deepSaveArray", index);
                        //update not supported here
                    })
                    return true; //item.data is new
                } else {
                    result = this._processDeepSaveItems(item, memdef, convertedItems, request, changedItems, navigationValue, "deepSave")
                }
                
                if(result !== null){
                    return result;
                }
            }
            

            return this._simpleNavigationPropertySelector.apply(this, arguments)
        }
        return false;
    },
    _simpleNavigationPropertySelector: function(item, memdef, convertedItems, request, changedItems, isDeep){
        if(checkODataMode(this, 'withReferenceMethods')){
            return this.propertyConversationStrategies["withReferenceMethods"].apply(this, arguments)
        } 
        
        return this.propertyConversationStrategies["navigation"].apply(this, arguments)
    },
    
    _processDeepSaveItems: function(item, memdef, convertedItems, request, changedItems, navigationEntity, strategy, index){
        var referencedItems = changedItems.filter(function(it){ return it.data == navigationEntity });
        
        if (referencedItems.length === 1 &&
            referencedItems[0].enableDeepSave &&
            navigationEntity.entityState === $data.EntityState.Added &&
            referencedItems[0].deepParent === item.data) 
        {
            var deepItem = convertedItems.getItem(referencedItems[0].data);
            if(!deepItem) {
                var referencedRequest = new activities.RequestBuilder(this)
                referencedRequest.add(new activities.SetUrl(this.providerConfiguration.oDataServiceHost + '/'))
                deepItem = convertedItems.add(referencedItems[0], referencedRequest)
            }
            
            convertedItems.addItemReference(item.data, deepItem);
            if(!deepItem.removed) {
                convertedItems.remove(referencedItems[0].data)
            }

            return this.propertyConversationStrategies[strategy].call(this, item, memdef, convertedItems, request, changedItems, index)
        }
        
        return null;
    },
    _propertyIsChanged: function(entity, memdef){
        return entity && entity.changedProperties && entity.changedProperties.some(function (def) { return def.name === memdef.name; })
    },
    propertyConversationStrategies: {
        value:{
            "default": function (item, memdef, convertedItems, request, changedItems) {
                var typeName = Container.resolveName(memdef.type);
                var converter = this.fieldConverter.toDb[typeName];
                request.add(new activities.SetProperty(memdef.name, converter ? converter(item.physicalData[memdef.name]) : item.physicalData[memdef.name]))
                return true;
            },
            "withReferenceMethods": function (item, memdef, convertedItems, request, changedItems) {
                var reqItem = convertedItems.getItem(item.data);
                if(reqItem && reqItem.removed) return false; //deep saved
                
                var additionalRequest = new activities.RequestBuilder(this)
                var value = item.physicalData[memdef.name];
                if(value){
                    additionalRequest.add(new activities.SetMethod('POST'))
                    if (value.__metadata) {
                        additionalRequest.add(new activities.SetProperty('@odata.id', this.providerConfiguration.oDataServiceHost + '/' + value.__metadata.uri))
                    } else if (value.__convertedRefence) {
                        additionalRequest.add(function(req, provider){
                            var targetItem = value.__convertedRefence;
                            req.data = req.data || {};
                            if(targetItem.isProcessed){
                                req.data["@odata.id"] = provider.getEntityUrlReference(targetItem.entity);
                            } else {
                                req.data["@odata.id"] = provider.providerConfiguration.oDataServiceHost + '/$' + targetItem.itemIndex
                            } 
                        })
                    }
                } else {
                    if(item.data.entityState === $data.EntityState.Added || value !== null) return
                    
                    additionalRequest.add(
                        new activities.SetUrl(this.providerConfiguration.oDataServiceHost + '/'),
                        new activities.AppendUrl(item.entitySet.tableName),
                        new activities.AppendUrl("(" + this.getEntityKeysValue(item) + ")"),
                        new activities.SetMethod('DELETE'),
                        new activities.ClearRequestData())
                }
                
                additionalRequest.add(function(req, provider){
                    if(reqItem.isProcessed || item.data.entityState !== $data.EntityState.Added){
                        req.requestUri = provider.providerConfiguration.oDataServiceHost + '/';
                        req.requestUri += item.entitySet.tableName;
                        req.requestUri += "(" + provider.getEntityKeysValue(item) + ")";
                        provider.addETagHeader(item, req)
                    } else {
                        req.requestUri = '$' + reqItem.itemIndex;
                        provider.addETagHeader(item, req, $data.defaults.OData.eTagAny)
                    } 
                    
                    req.requestUri += '/' + memdef.name + '/$ref';
                })
                
                var refItem = convertedItems.add(item, additionalRequest, false);
                convertedItems.addItemReference(item.data, refItem);
                return false;
            },
            "deepSave": function (item, memdef, convertedItems, request, changedItems) {
                var refItem = convertedItems.getItem(item.data[memdef.name])
                request.add(function(req, provider){
                        req.data[memdef.name] = refItem.request.build().get().data;
                })
                return true;
            },
            "deepSaveArray": function (item, memdef, convertedItems, request, changedItems, index) {
                var refItem = convertedItems.getItem(item.data[memdef.name][index])
                request.add(function(req, provider){
                        req.data[memdef.name] = req.data[memdef.name] || [];
                        req.data[memdef.name].push(refItem.request.build().get().data);
                })
                return true;
            },
            "navigation": function (item, memdef, convertedItems, request, changedItems) {
                
                request.add(function(req, provider){
                    req.data = req.data || {};
                    
                    if(item.physicalData[memdef.name] && item.physicalData[memdef.name].__metadata) {
                        req.data[memdef.name + "@odata.bind"] = item.physicalData[memdef.name].__metadata.uri;
                    } else if (item.physicalData[memdef.name] && item.physicalData[memdef.name].__convertedRefence) {
                        var targetItem = item.physicalData[memdef.name].__convertedRefence;
                        if(targetItem.isProcessed){
                            req.data[memdef.name + "@odata.bind"] = provider.getEntityUrlReference(targetItem.entity);
                        } else {
                            req.data[memdef.name + "@odata.bind"] = "$" + targetItem.itemIndex;
                        } 
                    } else if(item.physicalData[memdef.name] === null) {
                        req.data[memdef.name + "@odata.bind"] = null;
                    }
                })
                return true;
            },
            "complex": function(item, memdef, convertedItems, request, changedItems){
                if (item.physicalData[memdef.name]) {
                    var innerRequest = new activities.RequestBuilder(this);
                    this.save_getInitData({ data: item.physicalData[memdef.name] }, convertedItems, true, true, innerRequest);
                    request.add(function(req){
                        req.data = req.data || {}
                        req.data[memdef.name] = innerRequest.build().get().data;
                    })
                    return true;
                }
                return false;
            }
        }
    },
    
    addETagHeader: function(item, request, value){
        var property = item.data.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) { return memDef.concurrencyMode === $data.ConcurrencyMode.Fixed });
        if (property && property[0]) {
            var headerValue = (typeof value !== "undefined") ? value : item.data[property[0].name];
            if(request instanceof activities.RequestBuilder){
                request.add(new activities.SetHeaderProperty('If-Match', headerValue))
            } else {
                request.headers['If-Match'] = headerValue;
            }
        }
    },
    
    getTraceString: function (queryable) {
        var sqlText = this._compile(queryable);
        return queryable;
    },
    supportedDataTypes: {
        value: [$data.Array, $data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date, $data.Object, $data.GeographyPoint, $data.Guid,
            $data.GeographyLineString, $data.GeographyPolygon, $data.GeographyMultiPoint, $data.GeographyMultiLineString, $data.GeographyMultiPolygon, $data.GeographyCollection,
            $data.GeometryPoint, $data.GeometryLineString, $data.GeometryPolygon, $data.GeometryMultiPoint, $data.GeometryMultiLineString, $data.GeometryMultiPolygon, $data.GeometryCollection,
            $data.Byte, $data.SByte, $data.Decimal, $data.Float, $data.Int16, $data.Int32, $data.Int64, $data.Time, $data.Day, $data.DateTimeOffset, $data.Duration],
        writable: false
    },

    supportedBinaryOperators: {
        value: {
            equal: { mapTo: 'eq', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            notEqual: { mapTo: 'ne', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            equalTyped: { mapTo: 'eq', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            notEqualTyped: { mapTo: 'ne', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            greaterThan: { mapTo: 'gt', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            greaterThanOrEqual: { mapTo: 'ge', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },

            lessThan: { mapTo: 'lt', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            lessThenOrEqual: { mapTo: 'le', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            or: { mapTo: 'or', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            and: { mapTo: 'and', dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },

            add: { mapTo: 'add', dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            divide: { mapTo: 'div', allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            multiply: { mapTo: 'mul', allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            subtract: { mapTo: 'sub', allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },
            modulo: { mapTo: 'mod', allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] },

            "in": { mapTo: "in", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression] }
        }
    },

    supportedUnaryOperators: {
        value: {
            not: { mapTo: 'not' }
        }
    },

    supportedFieldOperations: {
        value: {
            /* string functions */

            contains: {
                mapTo: "substringof",
                dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "substring", dataType: "string" }, { name: "@expression" }]
            },

            startsWith: {
                mapTo: "startswith",
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            },

            endsWith: {
                mapTo: "endswith",
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            },

            length: [{
                allowedType: 'string',
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },
            {
                allowedType: 'GeographyLineString',
                mapTo: "geo.length",
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: ['GeographyLineString'] }],
                fixedDataType: 'decimal'
            },
            {
                allowedType: 'GeometryLineString',
                mapTo: "geo.length",
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeometryLineString' }],
                fixedDataType: 'decimal'
            }],

            strLength: {
                mapTo: "length",
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },

            indexOf: {
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                mapTo: "indexof",
                baseIndex: 1,
                parameters: [{ name: '@expression', dataType: "string" }, { name: 'strFragment', dataType: 'string' }]
            },

            replace: {
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: '@expression', dataType: "string" }, { name: 'strFrom', dataType: 'string' }, { name: 'strTo', dataType: 'string' }]
            },

            substr: {
                mapTo: "substring",
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "startFrom", dataType: "number" }, { name: "length", dataType: "number", optional: "true" }]
            },

            toLowerCase: {
                mapTo: "tolower",
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },

            toUpperCase: {
                mapTo: "toupper",
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }]

            },

            trim: {
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }]
            },


            concat: {
                dataType: "string", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "string" }, { name: "strFragment", dataType: "string" }]
            },


            /* data functions */

            day: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            hour: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            minute: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            month: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            second: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            year: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },

            /* number functions */
            round: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            floor: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },
            ceiling: {
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: "date" }]
            },


            /* geo functions */
            distance: [{
                allowedType: 'GeographyPoint',
                mapTo: "geo.distance",
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeographyPoint' }, { name: "to", dataType: 'GeographyPoint' }],
                fixedDataType: 'decimal'
            }, {
                allowedType: 'GeometryPoint',
                mapTo: "geo.distance",
                dataType: "number", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeometryPoint' }, { name: "to", dataType: 'GeometryPoint' }],
                fixedDataType: 'decimal'
            }],

            intersects: [{
                allowedType: 'GeographyPoint',
                mapTo: "geo.intersects",
                dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeographyPoint' }, { name: "in", dataType: 'GeographyPolygon' }]

            }, {
                allowedType: 'GeometryPoint',
                mapTo: "geo.intersects",
                dataType: "boolean", allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.OrderExpression],
                parameters: [{ name: "@expression", dataType: 'GeometryPoint' }, { name: "in", dataType: 'GeometryPolygon' }]

            }]
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
            some: {
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
            },
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {},
            include: {},
            batchDelete: {},
            withInlineCount: {},
            find: {}
        },
        enumerable: true,
        writable: true
    },
    supportedContextOperation: {
        value: {
            batchExecuteQuery: true
        },
        enumerable: true,
        writable: true
    },

    fieldConverter: { value: $data.oDataConverter },
    resolveTypeOperations: function (operation, expression, frameType) {
        var memDef = expression.entityType.getMemberDefinition(operation);
        if (!memDef ||
            !memDef.method ||
            memDef.method.IsSideEffecting !== false ||
            !memDef.method.returnType ||
            !(frameType === $data.Expressions.FilterExpression || frameType === $data.Expressions.OrderExpression))
        {
            Guard.raise(new Exception("Entity '" + expression.entityType.name + "' Operation '" + operation + "' is not supported by the provider"));
        }

        return memDef;
    },
    resolveSetOperations: function (operation, expression, frameType) {
        if (expression) {
            var esDef = expression.storageModel.ContextType.getMemberDefinition(expression.storageModel.ItemName);
            if (esDef && esDef.actions && esDef.actions[operation]) {
                var memDef = $data.MemberDefinition.translateDefinition(esDef.actions[operation], operation, this.getType());
                if (!memDef ||
                    !memDef.method ||
                    memDef.method.IsSideEffecting !== false ||
                    !memDef.method.returnType ||
                    !(frameType === $data.Expressions.FilterExpression || frameType === $data.Expressions.OrderExpression)) {

                    Guard.raise(new Exception("Collection '" + expression.storageModel.ItemName + "' Operation '" + operation + "' is not supported by the provider"));
                }

                return memDef;
            }
        }
        return $data.StorageProviderBase.prototype.resolveSetOperations.apply(this, arguments);

    },
    resolveContextOperations: function (operation, expression, frameType) {
        var memDef = this.context.getType().getMemberDefinition(operation);
        if (!memDef ||
            !memDef.method ||
            memDef.method.IsSideEffecting !== false ||
            !memDef.method.returnType ||
            !(frameType === $data.Expressions.FilterExpression || frameType === $data.Expressions.OrderExpression)) {
            Guard.raise(new Exception("Context '" + expression.instance.getType().name + "' Operation '" + operation + "' is not supported by the provider"));
        }
        return memDef;
    },
    
    getEntityUrlReference: function(entity){
        var sMod = this.context._storageModel.getStorageModel(entity.getType())
        var tblName = sMod.TableName;
        var pk = '(' + this.getEntityKeysValue({ data: entity, entitySet: this.context.getEntitySetFromElementType(entity.getType()) }) + ')';
        return this.providerConfiguration.oDataServiceHost + '/' + tblName + pk;
    },

    getEntityKeysValue: function (entity) {
        var result = [];
        var keyValue = undefined;
        var memDefs = entity.data.getType().memberDefinitions.getKeyProperties();
        for (var i = 0, l = memDefs.length; i < l; i++) {
            var field = memDefs[i];
            if (field.key) {
                keyValue = entity.data[field.name];
                var typeName = Container.resolveName(field.type);

                var converter = this.fieldConverter.toDb[typeName];
                keyValue = converter ? converter(keyValue) : keyValue;

                converter = this.fieldConverter.escape[typeName];
                keyValue = converter ? converter(keyValue) : keyValue;

                result.push(field.name + "=" + keyValue);
            }
        }
        if (result.length > 1) {
            return result.join(",");
        }
        return keyValue;
    },
    getFieldUrl: function (entity, fieldName, entitySet) {
        var keyPart = this.getEntityKeysValue({ data: entity });
        var servicehost = this.providerConfiguration.oDataServiceHost
        if (servicehost.lastIndexOf('/') === servicehost.length)
            servicehost = servicehost.substring(0, servicehost.length - 1);

        return servicehost + '/' + entitySet.tableName + '(' + keyPart + ')/' + fieldName + '/$value';
    },/*
    getServiceMetadata: function () {
        $data.ajax(this._setAjaxAuthHeader({
            url: this.providerConfiguration.oDataServiceHost + "/$metadata",
            dataType: "xml",
            success: function (d) {
                console.log("OK");
                console.dir(d);
                console.log(typeof d);
                window["s"] = d;
                window["k"] = this.nsResolver;
                //s.evaluate("edmx:Edmx/edmx:DataServices/Schema", s, $data.storageProviders.oData.oDataProvider.prototype.nsResolver, XPathResult.ANY_TYPE, null).iterateNext()

            },
            error: function (error) {
                console.log("error:");
                console.dir(error);
            }
        }));
    },
    nsResolver: function (sPrefix) {
        switch (sPrefix) {
            case "edmx":
                return "http://schemas.microsoft.com/ado/2007/06/edmx";
                break;
            case "m":
                return "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata";
                break;
            case "d":
                return "http://schemas.microsoft.com/ado/2007/08/dataservices";
                break;
            default:
                return "http://schemas.microsoft.com/ado/2008/09/edm";
                break;
        }
    }
    */
    parseError: function(error, data){

        var message = (error.response || error || {}).body || '';
        try {
            if(message.indexOf('{') === 0){
                var errorObj = JSON.parse(message);
                errorObj = errorObj['odata.error'] || errorObj.error || errorObj;
                if (errorObj.message) {
                    message = errorObj.message.value || errorObj.message;
                }
            }
        } catch (e) {}

        return new Exception(message, error.message, data || error);
    },
    appendBasicAuth: function (request, user, password, withCredentials) {
        request.headers = request.headers || {};
        if (!request.headers.Authorization && user && password) {
            request.headers.Authorization = "Basic " + this.__encodeBase64(user + ":" + password);
        }
        if (withCredentials){
            request.withCredentials = withCredentials;
        }
    },
    __encodeBase64: function (val) {
        var b64array = "ABCDEFGHIJKLMNOP" +
                           "QRSTUVWXYZabcdef" +
                           "ghijklmnopqrstuv" +
                           "wxyz0123456789+/" +
                           "=";

        var input = val;
        var base64 = "";
        var hex = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            base64 = base64 +
                        b64array.charAt(enc1) +
                        b64array.charAt(enc2) +
                        b64array.charAt(enc3) +
                        b64array.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return base64;
    }
}, null);

$data.StorageProviderBase.registerProvider("oData", $data.storageProviders.oData.oDataProvider);
