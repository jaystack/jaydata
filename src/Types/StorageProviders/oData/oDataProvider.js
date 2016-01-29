import $data, { $C, Guard, Container, Exception, MemberDefinition } from 'jaydata/core';
import * as odatajs from 'jaydata-odatajs';

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

var checkODataMode = function(context, functionName){
    return context.providerConfiguration[functionName] === true || $data.defaults.OData[functionName] === true;
}

$C('$data.storageProviders.oData.ItemContainer', $data.Base, null, {
    constructor: function(){
        this._items = [];
        this._entities = [];
    },
    _items: { type: $data.Array },
    _entities: { type: $data.Array },
    add: function(entity, request, countable){
        var item = {
            entity: entity,
            request: request,
            itemIndex: ++this.maxItemIndex,
            dependentSum: 0
        };
        
        request.headers = request.headers || {};
        request.headers["content-Id"] = item.itemIndex; 
        
        
        if(countable !== false){
            this.length++;
        }
        
        this._entities.push(entity)
        this._items.push(item);
        
        return item.itemIndex
    },
    getItemIndex: function(entity){
        if(!entity) return -1;
        var idx = this._entities.indexOf(entity);
        if(idx >= 0 && !this._items[idx].removed) {
            return this._items[idx].itemIndex;
        }
        return -1;
    },
    setDependency: function(itemIndex){
        var item = this._items[itemIndex];
        if(item && !item.removed) {
            item.dependentSum++;
            return true;
        }
        return false;
    },
    remove: function(entity){
        var idx = this._entities.indexOf(entity);
        if(idx >= 0) {
            var item = this._items[idx];
            if(!item.removed && item.dependentSum < 1){
                this._items[idx].removed = true;
                this.length--;
                return true;
            }
        }
        return false;
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
    _calculateResultIndex: function(){
         
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
                                    var contentId = convertedItems.getItemIndex(rv);
                                    if (rv.entityState == $data.EntityState.Modified || contentId < 0) {
                                        var sMod = context._storageModel.getStorageModel(rv.getType())
                                        var tblName = sMod.TableName;
                                        var pk = '(' + context.storageProvider.getEntityKeysValue({ data: rv, entitySet: context.getEntitySetFromElementType(rv.getType()) }) + ')';
                                        dbInstance.initData[association.FromPropertyName].push({ __metadata: { uri: tblName + pk } });
                                    } else {
                                        if (contentId < 0) { Guard.raise("Dependency graph error"); }
                                        dbInstance.initData[association.FromPropertyName].push({ __metadata: { uri: "$" + (contentId) } });
                                        convertedItems.setDependency(contentId);
                                    }
                                }, this);
                            } else if (refValue === null) {
                                dbInstance.initData[association.FromPropertyName] = null;
                            } else {
                                var contentId = convertedItems.getItemIndex(refValue);
                                if (refValue.entityState == $data.EntityState.Modified || contentId < 0) {
                                    var sMod = context._storageModel.getStorageModel(refValue.getType())
                                    var tblName = sMod.TableName;
                                    var pk = '(' + context.storageProvider.getEntityKeysValue({ data: refValue, entitySet: context.getEntitySetFromElementType(refValue.getType()) }) + ')';
                                    dbInstance.initData[association.FromPropertyName] = { __metadata: { uri: tblName + pk } };
                                } else {
                                    if (contentId < 0) { Guard.raise("Dependency graph error"); }
                                    dbInstance.initData[association.FromPropertyName] = { __metadata: { uri: "$" + (contentId) } };
                                    convertedItems.setDependency(contentId);
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
            var independentBlocks = this.buildIndependentBlocks(changedItems);
            this.saveInternal(independentBlocks, callBack);
        }
        else {
            callBack.success(0);
        }
    },
    saveInternal: function (independentBlocks, callBack) {
        if ((independentBlocks.length > 1 || (independentBlocks.length == 1 && independentBlocks[0].length > 1)) &&
            !checkODataMode(this, "disableBatch")) {
            this._saveBatch(independentBlocks, callBack);
        } else {
            this._saveRestMany(independentBlocks, callBack);
        }
    },
    _buildSaveData: function(independentBlocks, convertedItem, batch) {
        var requests = [];
        for (var index = 0; index < independentBlocks.length; index++) {
            var requestPart = []
            for (var i = 0; i < independentBlocks[index].length; i++) {
                var request = {
                    requestUri: batch ? '' : this.providerConfiguration.oDataServiceHost + '/'
                };
                convertedItem.add(independentBlocks[index][i].data, request);
                
                var entityState = independentBlocks[index][i].data.entityState;
                if(typeof this._buildRequestObject['EntityState_' + entityState] === 'function'){
                    var reqObjects = this._buildRequestObject['EntityState_' + entityState](this, independentBlocks[index][i], convertedItem, request)
                    if(reqObjects && reqObjects.length > 0){
                        requestPart.push(...reqObjects)
                    }
                    
                } else {
                    Guard.raise(new Exception("Not supported Entity state"));
                }
            }
            requests.push(requestPart);
        }
        
        return requests;
    },
    _buildRequestObject: {
        value: {
            'EntityState_10': function(provider, item, convertedItem, request){
                return []
            },
            'EntityState_20': function(provider, item, convertedItem, request){
                var additionalItems = [];
                request.method = "POST";
                request.requestUri += item.entitySet.tableName;
                request.data = provider.save_getInitData(item, convertedItem, undefined, undefined, additionalItems);
                
                return provider._calculateRestSaveItems(request, item, convertedItem, additionalItems, true)
            },
            'EntityState_30': function(provider, item, convertedItem, request){
                var additionalItems = [];
                request.method = provider.providerConfiguration.UpdateMethod;
                request.requestUri += item.entitySet.tableName;
                request.requestUri += "(" + provider.getEntityKeysValue(item) + ")";
                provider.save_addConcurrencyHeader(item, request.headers);
                request.data = provider.save_getInitData(item, convertedItem, undefined, undefined, additionalItems);
                
                return provider._calculateRestSaveItems(request, item, convertedItem, additionalItems, false)
            },
            'EntityState_40': function(provider, item, convertedItem, request){
                request.method = "DELETE";
                request.requestUri += item.entitySet.tableName;
                request.requestUri += "(" + provider.getEntityKeysValue(item) + ")";
                provider.save_addConcurrencyHeader(item, request.headers);
                
                return [request]
            },
            'ReferenceUpdate': function(provider, item, memdef){
                return function(isCreate, baseDataSaved, itemRequestIndex, convertedItem, request) {
                    var value = item.physicalData[memdef.name]; 
                    if(value && value.__metadata && value.__metadata.uri){
                        request.method = 'POST'
                        request.data = {
                            '@odata.id': provider.providerConfiguration.oDataServiceHost + '/' + value.__metadata.uri
                        }
                    } else {
                        if(isCreate || value !== null) return null;
                        
                        request.method = 'DELETE'
                    }
                    
                    return function(isBatch){
                        var contentId = convertedItem.getItemIndex(item.data)
                        if(isBatch && contentId && item.data.entityState === $data.EntityState.Added){
                            request.requestUri = '$' + contentId;
                        } else {
                            request.requestUri = provider.providerConfiguration.oDataServiceHost + '/';
                            request.requestUri += item.entitySet.tableName;
                            request.requestUri += "(" + provider.getEntityKeysValue(item) + ")";
                        }
                        request.requestUri += '/' + memdef.name + '/$ref';
                        
                        if(!isBatch || (!baseDataSaved && itemRequestIndex === 1)) {
                            provider.save_addConcurrencyHeader(item, request.headers);
                        } else {
                            provider.save_addConcurrencyHeader(item, request.headers, $data.defaults.OData.eTagAny);
                        }
                       
                        return request;
                    }
                }
            }
        }
    },
    _calculateRestSaveItems: function(request, item, convertedItem, additionalItems, isCreate) {
        var requests = [];
        var baseDataSaved = false;
        
        var keys = item.physicalData.getType().memberDefinitions.getKeyProperties();
        var dataProperties = Object.keys(request.data)
        if (isCreate || (dataProperties.length > keys.length)) {
            //all keys on data if update
            requests.push(request)
            baseDataSaved = true;
        } else {
            if(!convertedItem.remove(item.data)){
                requests.push(request)
                baseDataSaved = true;
            }
        }
        
        for (var i = 0; i < additionalItems.length; i++) {
            var additionalRequest = {};
            var newItem = additionalItems[i](isCreate, baseDataSaved, i, convertedItem, additionalRequest)
            if(newItem){
                requests.push(newItem)
                convertedItem.add(item.data, additionalRequest, false);
            }
        }
        
        return requests;
    },
    _saveRest: function (independentBlocks, convertedItem, clb) {
        var that = this;
        
        var sendRequests = function(requestObjects, index, callBack) {
            var request = requestObjects[index]
            if(!request) return callBack();
            
            if(typeof request === 'function'){ 
                request = request();
            }
            
            var requestData = [request, function (data, response) {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    //var item = convertedItem[index];
                    var item = convertedItem.getByResponse(response, index);
                    if(item instanceof $data.Entity && response.statusCode != 204){
                        that.reload_fromResponse(item, data, response);
                    }

                    sendRequests(requestObjects, ++index, callBack);
                } else {
                    callBack(response);
                }

            }, function (e) {
                callBack(e);
            }];

            that.appendBasicAuth(requestData[0], that.providerConfiguration.user, that.providerConfiguration.password, that.providerConfiguration.withCredentials);
            //if (that.providerConfiguration.user) {
            //    requestData[0].user = that.providerConfiguration.user;
            //    requestData[0].password = that.providerConfiguration.password || "";
            //}

            that.context.prepareRequest.call(that, requestData);
            that.oData.request.apply(that, requestData);
        }
        
        var items = [];
        for (var i = 0; i < independentBlocks.length; i++) {
            for (var j = 0; j < independentBlocks[i].length; j++) {
                items.push(independentBlocks[i][j]);
            }
        }
        
        sendRequests(items, 0, function(err){
            if(err) return clb.error(that.parseError(err))
            clb.success(convertedItem.length);
        })
    },
    _saveRestMany: function (independentBlocks, callBack) {
        var that = this;
        var errors = [];
        var items = [];

        for (var index = 0; index < independentBlocks.length; index++) {
            for (var i = 0; i < independentBlocks[index].length; i++) {
                items.push(independentBlocks[index][i]);
            }
        }

        var idx = 0;
        var doSave = function () {
            if (idx >= items.length) {
                if (errors.length === 0) {
                    callBack.success(items.length);
                } else {
                    callBack.error(errors);
                }
            } else {
                var convertedItem = new $data.storageProviders.oData.ItemContainer();
                var currentItems = that._buildSaveData([[items[idx]]], convertedItem)
                that._saveRest(currentItems, convertedItem, {
                    success: function () {
                        ++idx;
                        doSave();
                    },
                    error: function (error) {
                        errors.push(error);
                        ++idx;
                        doSave();
                    }
                });
            }
        }

        doSave();
    },
    _saveBatch: function (independentBlocks, callBack) {
        var convertedItem = new $data.storageProviders.oData.ItemContainer();
        var batchRequests = [];
        //var maxContentId = 0;
        
        var requestObjects = this._buildSaveData(independentBlocks, convertedItem, true)
        for (var index = 0; index < requestObjects.length; index++) {
            for (var i = 0; i < requestObjects[index].length; i++) {
                var request = requestObjects[index][i]
                if(typeof request === 'function'){ 
                    request = request(true);
                // } else {
                //     maxContentId = (request.headers && request.headers['Content-Id'] > maxContentId) ? request.headers['Content-Id'] : maxContentId
                }
                batchRequests.push(request);
            }
        }
        var that = this;
        // for(var i = 0; i < batchRequests.length; i++){
        //     if (batchRequests[i].headers && !batchRequests[i].headers['Content-Id']){
        //         batchRequests[i].headers['Content-Id'] = ++maxContentId
        //     }
        // }

        var requestData = [{
            requestUri: this.providerConfiguration.oDataServiceHost + "/$batch",
            method: "POST",
            data: {
                __batchRequests: [{ __changeRequests: batchRequests }]
            },
            headers: {
            }
        }, function (data, response) {
            if (response.statusCode == 200 || response.statusCode == 202) {
                var result = data.__batchResponses[0].__changeResponses;
                var errors = [];

                for (var i = 0; i < result.length; i++) {
                    if (result[i].statusCode >= 200 && result[i].statusCode < 300) {
                        var item = convertedItem.getByResponse(result[i], i);
                        if(item instanceof $data.Entity && result[i].statusCode != 204){
                            that.reload_fromResponse(item, result[i].data, result[i]);
                        }
                    } else {
                        errors.push(that.parseError(result[i]));
                    }
                }
                if (errors.length > 0) {
                    if (errors.length === 1) {
                        callBack.error(errors[0]);
                    } else {
                        callBack.error(new Exception('See inner exceptions', 'Batch failed', errors));
                    }
                } else if (callBack.success) {
                    callBack.success(convertedItem.length);
                }
            } else {
                callBack.error(that.parseError(response));
            }

        }, function (e) {
            callBack.error(that.parseError(e));
        }, this.oData.batch.batchHandler];

        if (typeof this.providerConfiguration.useJsonLight !== 'undefined') {
            requestData[0].useJsonLight = this.providerConfiguration.useJsonLight;
        }

        this.appendBasicAuth(requestData[0], this.providerConfiguration.user, this.providerConfiguration.password, this.providerConfiguration.withCredentials);
        //if (this.providerConfiguration.user) {
        //    requestData[0].user = this.providerConfiguration.user;
        //    requestData[0].password = this.providerConfiguration.password || "";
        //}

        this.context.prepareRequest.call(this, requestData);
        this.oData.request.apply(this, requestData);
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

    //save_getInitData: function (item, convertedItems) {
    //    var self = this;
    //    item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
    //    var serializableObject = {}
    //    item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
    //        if (memdef.kind == $data.MemberTypes.navProperty || memdef.kind == $data.MemberTypes.complexProperty || (memdef.kind == $data.MemberTypes.property && !memdef.notMapped)) {
    //            if (typeof memdef.concurrencyMode === 'undefined' && (memdef.key === true || item.data.entityState === $data.EntityState.Added || item.data.changedProperties.some(function (def) { return def.name === memdef.name; }))) {
    //                var typeName = Container.resolveName(memdef.type);
    //                var converter = self.fieldConverter.toDb[typeName];
    //                serializableObject[memdef.name] = converter ? converter(item.physicalData[memdef.name]) : item.physicalData[memdef.name];
    //            }
    //        }
    //    }, this);
    //    return serializableObject;
    //},
    save_getInitData: function (item, convertedItems, isComplex, isDeep, additionalItems) {
        additionalItems = additionalItems || []
        var self = this;
        if (!isComplex) {
        item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
        } else {
            item.physicalData = item.data;
        }
        var serializableObject = {}
        item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
            if (memdef.kind == $data.MemberTypes.complexProperty && item.physicalData[memdef.name]) {
                serializableObject[memdef.name] = self.save_getInitData({ data: item.physicalData[memdef.name] }, convertedItems, true, true, additionalItems);
            }
            else if (memdef.kind == $data.MemberTypes.navProperty || (memdef.kind == $data.MemberTypes.property && !memdef.notMapped)) {
                if (isDeep || typeof memdef.concurrencyMode === 'undefined' && (memdef.key === true || item.data.entityState === $data.EntityState.Added || (item.data.changedProperties && item.data.changedProperties.some(function (def) { return def.name === memdef.name; })))) {

                    if (memdef.kind == $data.MemberTypes.navProperty && this.providerConfiguration.maxDataServiceVersion === "4.0") {
                        if(checkODataMode(self, 'withReferenceMethods')){
                            var newItemFactory = self._buildRequestObject.ReferenceUpdate && self._buildRequestObject.ReferenceUpdate(self, item, memdef)
                            newItemFactory && additionalItems.push(newItemFactory)    
                        } else {
                            if(item.physicalData[memdef.name]) {
                                serializableObject[memdef.name + "@odata.bind"] = item.physicalData[memdef.name].__metadata.uri;
                            } else if(item.physicalData[memdef.name] == null) {
                                serializableObject[memdef.name + "@odata.bind"] = null;
                            }
                        }
                    } else {
                        var typeName = Container.resolveName(memdef.type);
                        var converter = self.fieldConverter.toDb[typeName];
                        serializableObject[memdef.name] = converter ? converter(item.physicalData[memdef.name]) : item.physicalData[memdef.name];
                    }
                }
            }
        }, this);
        return serializableObject;
    },
    save_addConcurrencyHeader: function (item, headers, value) {
        var property = item.data.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) { return memDef.concurrencyMode === $data.ConcurrencyMode.Fixed });
        if (property && property[0]) {
            headers['If-Match'] = (typeof value !== "undefined") ? value : item.data[property[0].name];
            //item.data[property[0].name] = "";
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
