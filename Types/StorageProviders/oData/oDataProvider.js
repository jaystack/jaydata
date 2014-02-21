
var datajsPatch;
datajsPatch = function () {
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

$C('$data.storageProviders.oData.oDataProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg, ctx) {
        if (typeof OData === 'undefined') {
            Guard.raise(new Exception('datajs is required', 'Not Found!'));
        }
        datajsPatch();

        this.SqlCommands = [];
        this.context = ctx;
        this.providerConfiguration = $data.typeSystem.extend({
            dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged,
            oDataServiceHost: "/odata.svc",
            serviceUrl: "",
            maxDataServiceVersion: '2.0',
            dataServiceVersion: undefined,
            setDataServiceVersionToMax: true,
            user: null,
            password: null,
            withCredentials: false,
            //enableJSONP: undefined,
            //useJsonLight: undefined
            //disableBatch: undefined
            UpdateMethod: 'PATCH'
        }, cfg);

        this.fixkDataServiceVersions(cfg);

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
        callBack = $data.typeSystem.createCallbackSetting(callBack);
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
                    OData.request.apply(this, requestData);
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
                                    if (rv.entityState == $data.EntityState.Modified || convertedItems.indexOf(rv) < 0) {
                                        var sMod = context._storageModel.getStorageModel(rv.getType())
                                        var tblName = sMod.TableName;
                                        var pk = '(' + context.storageProvider.getEntityKeysValue({ data: rv, entitySet: context.getEntitySetFromElementType(rv.getType()) }) + ')';
                                        dbInstance.initData[association.FromPropertyName].push({ __metadata: { uri: tblName + pk } });
                                    } else {
                                        var contentId = convertedItems.indexOf(rv);
                                        if (contentId < 0) { Guard.raise("Dependency graph error"); }
                                        dbInstance.initData[association.FromPropertyName].push({ __metadata: { uri: "$" + (contentId + 1) } });
                                    }
                                }, this);
                            } else if (refValue === null) {
                                dbInstance.initData[association.FromPropertyName] = null;
                            } else {
                                if (refValue.entityState == $data.EntityState.Modified || convertedItems.indexOf(refValue) < 0) {
                                    var sMod = context._storageModel.getStorageModel(refValue.getType())
                                    var tblName = sMod.TableName;
                                    var pk = '(' + context.storageProvider.getEntityKeysValue({ data: refValue, entitySet: context.getEntitySetFromElementType(refValue.getType()) }) + ')';
                                    dbInstance.initData[association.FromPropertyName] = { __metadata: { uri: tblName + pk } };
                                } else {
                                    var contentId = convertedItems.indexOf(refValue);
                                    if (contentId < 0) { Guard.raise("Dependency graph error"); }
                                    dbInstance.initData[association.FromPropertyName] = { __metadata: { uri: "$" + (contentId + 1) } };
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
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        var sql;
        try {
            sql = this._compile(query);
        } catch (e) {
            callBack.error(e);
            return;
        }
        var schema = this.context;

        var that = this;
        var requestData = [
            {
                requestUri: this.providerConfiguration.oDataServiceHost + sql.queryText,
                method: sql.method,
                data: sql.postData,
                headers: {
                    MaxDataServiceVersion: this.providerConfiguration.maxDataServiceVersion
                }
            },
            function (data, textStatus, jqXHR) {
                if (!data && textStatus.body) data = JSON.parse(textStatus.body);
                if (callBack.success) {
                    query.rawDataList = typeof data === 'string' ? [{ cnt: Container.convertTo(data, $data.Integer) }] : data;
                    if (sql.withInlineCount && typeof data === 'object' && (typeof data.__count !== 'undefined' || ('d' in data && typeof data.d.__count !== 'undefined'))) {
                        query.__count = new Number(typeof data.__count !== 'undefined' ? data.__count : data.d.__count).valueOf();
                    }

                    callBack.success(query);
                }
            },
            function (error) {
                callBack.error(that.parseError(error, arguments));
            }
        ];

        if (this.providerConfiguration.dataServiceVersion) {
            requestData[0].headers.DataServiceVersion = this.providerConfiguration.dataServiceVersion;
        }

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
        OData.request.apply(this, requestData);
    },
    _compile: function (queryable, params) {
        var compiler = new $data.storageProviders.oData.oDataCompiler();
        var compiled = compiler.compile(queryable);
        return compiled;
    },
    saveChanges: function (callBack, changedItems) {
        if (changedItems.length > 0) {
            var independentBlocks = this.buildIndependentBlocks(changedItems);
            this.saveInternal(independentBlocks, 0, callBack);
        }
        else {
            callBack.success(0);
        }
    },
    saveInternal: function (independentBlocks, index2, callBack) {
        if ((this.providerConfiguration.disableBatch === true || (typeof $data.defaults === 'object' && $data.defaults.disableBatch === true))
            && typeof this._saveRestMany === 'function')
        {
            this._saveRestMany(independentBlocks, index2, callBack);
        } else {
            if (independentBlocks.length > 1 || (independentBlocks.length == 1 && independentBlocks[0].length > 1)) {
                this._saveBatch(independentBlocks, index2, callBack);
            } else {
                this._saveRest(independentBlocks, index2, callBack);
            }
        }
    },
    _saveRest: function (independentBlocks, index2, callBack) {
        var batchRequests = [];
        var convertedItem = [];
        var request;
        for (var index = 0; index < independentBlocks.length; index++) {
            for (var i = 0; i < independentBlocks[index].length; i++) {
                convertedItem.push(independentBlocks[index][i].data);
                request = {
                    requestUri: this.providerConfiguration.oDataServiceHost + '/',
                    headers: {
                        MaxDataServiceVersion: this.providerConfiguration.maxDataServiceVersion
                    }
                };
                if (this.providerConfiguration.dataServiceVersion) {
                    request.headers.DataServiceVersion = this.providerConfiguration.dataServiceVersion;
                }
                if (typeof this.providerConfiguration.useJsonLight !== 'undefined') {
                    request.useJsonLight = this.providerConfiguration.useJsonLight;
                }

                //request.headers = { "Content-Id": convertedItem.length };
                switch (independentBlocks[index][i].data.entityState) {
                    case $data.EntityState.Unchanged: continue; break;
                    case $data.EntityState.Added:
                        request.method = "POST";
                        request.requestUri += independentBlocks[index][i].entitySet.tableName;
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case $data.EntityState.Modified:
                        request.method = this.providerConfiguration.UpdateMethod;
                        request.requestUri += independentBlocks[index][i].entitySet.tableName;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case $data.EntityState.Deleted:
                        request.method = "DELETE";
                        request.requestUri += independentBlocks[index][i].entitySet.tableName;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        break;
                    default: Guard.raise(new Exception("Not supported Entity state"));
                }
                //batchRequests.push(request);
            }
        }
        var that = this;

        var requestData = [request, function (data, response) {
            if (response.statusCode >= 200 && response.statusCode < 300) {
                var item = convertedItem[0];
                if (response.statusCode == 204) {
                    if (response.headers.ETag || response.headers.Etag || response.headers.etag) {
                        var property = item.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) { return memDef.concurrencyMode === $data.ConcurrencyMode.Fixed });
                        if (property && property[0]) {
                            item[property[0].name] = response.headers.ETag || response.headers.Etag || response.headers.etag;
                        }
                    }
                } else {
                    that.reload_fromResponse(item, data, response);
                }

                if (callBack.success) {
                    callBack.success(convertedItem.length);
                }
            } else {
                callBack.error(that.parseError(response));
            }

        }, function (e) {
            callBack.error(that.parseError(e));
        }];

        this.appendBasicAuth(requestData[0], this.providerConfiguration.user, this.providerConfiguration.password, this.providerConfiguration.withCredentials);
        //if (this.providerConfiguration.user) {
        //    requestData[0].user = this.providerConfiguration.user;
        //    requestData[0].password = this.providerConfiguration.password || "";
        //}

        this.context.prepareRequest.call(this, requestData);
        OData.request.apply(this, requestData);
    },
    _saveBatch: function (independentBlocks, index2, callBack) {
        var batchRequests = [];
        var convertedItem = [];
        for (var index = 0; index < independentBlocks.length; index++) {
            for (var i = 0; i < independentBlocks[index].length; i++) {
                convertedItem.push(independentBlocks[index][i].data);
                var request = {};
                request.headers = {
                    "Content-Id": convertedItem.length,
                    MaxDataServiceVersion: this.providerConfiguration.maxDataServiceVersion
                };
                switch (independentBlocks[index][i].data.entityState) {
                    case $data.EntityState.Unchanged: continue; break;
                    case $data.EntityState.Added:
                        request.method = "POST";
                        request.requestUri = independentBlocks[index][i].entitySet.tableName;
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case $data.EntityState.Modified:
                        request.method = this.providerConfiguration.UpdateMethod;
                        request.requestUri = independentBlocks[index][i].entitySet.tableName;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case $data.EntityState.Deleted:
                        request.method = "DELETE";
                        request.requestUri = independentBlocks[index][i].entitySet.tableName;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        break;
                    default: Guard.raise(new Exception("Not supported Entity state"));
                }

                if (this.providerConfiguration.dataServiceVersion) {
                    request.headers.DataServiceVersion = this.providerConfiguration.dataServiceVersion;
                }
                batchRequests.push(request);
            }
        }
        var that = this;

        var requestData = [{
            requestUri: this.providerConfiguration.oDataServiceHost + "/$batch",
            method: "POST",
            data: {
                __batchRequests: [{ __changeRequests: batchRequests }]
            },
            headers: {
                MaxDataServiceVersion: this.providerConfiguration.maxDataServiceVersion
            }
        }, function (data, response) {
            if (response.statusCode == 202) {
                var result = data.__batchResponses[0].__changeResponses;
                var errors = [];

                for (var i = 0; i < result.length; i++) {
                    if (result[i].statusCode >= 200 && result[i].statusCode < 300) {
                        var item = convertedItem[i];
                        if (result[i].statusCode == 204) {
                            if (result[i].headers.ETag || result[i].headers.Etag || result[i].headers.etag) {
                                var property = item.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) { return memDef.concurrencyMode === $data.ConcurrencyMode.Fixed });
                                if (property && property[0]) {
                                    item[property[0].name] = result[i].headers.ETag || result[i].headers.Etag || result[i].headers.etag;
                                }
                            }
                            continue;
                        }

                        that.reload_fromResponse(item, result[i].data, result[i]);
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
        }, OData.batchHandler];

        if (this.providerConfiguration.dataServiceVersion) {
            requestData[0].headers.DataServiceVersion = this.providerConfiguration.dataServiceVersion;
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
        OData.request.apply(this, requestData);
    },
    reload_fromResponse: function (item, data, response) {
        var that = this;
        item.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            var propType = Container.resolveType(memDef.type);
            if (memDef.computed || memDef.key || !memDef.inverseProperty) {
                if (memDef.concurrencyMode === $data.ConcurrencyMode.Fixed) {
                    //unescape?
                    item[memDef.name] = response.headers.ETag || response.headers.Etag || response.headers.etag;

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
                            if (aeType.isAssignableTo && !Object.isNullOrUndefined(aitem)) {
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

    save_getInitData: function (item, convertedItems) {
        var self = this;
        item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
        var serializableObject = {}
        item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
            if (memdef.kind == $data.MemberTypes.navProperty || memdef.kind == $data.MemberTypes.complexProperty || (memdef.kind == $data.MemberTypes.property && !memdef.notMapped)) {
                if (typeof memdef.concurrencyMode === 'undefined' && (memdef.key === true || item.data.entityState === $data.EntityState.Added || item.data.changedProperties.some(function (def) { return def.name === memdef.name; }))) {
                    var typeName = Container.resolveName(memdef.type);
                    var converter = self.fieldConverter.toDb[typeName];
                    serializableObject[memdef.name] = converter ? converter(item.physicalData[memdef.name]) : item.physicalData[memdef.name];
                }
            }
        }, this);
        return serializableObject;
    },
    save_addConcurrencyHeader: function (item, headers) {
        var property = item.data.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) { return memDef.concurrencyMode === $data.ConcurrencyMode.Fixed });
        if (property && property[0]) {
            headers['If-Match'] = item.data[property[0].name];
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
            $data.Byte, $data.SByte, $data.Decimal, $data.Float, $data.Int16, $data.Int32, $data.Int64, $data.Time, $data.DateTimeOffset],
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
