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

$C('$data.storageProviders.oData.oDataProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg, ctx) {
        if (typeof OData === 'undefined') {
            Guard.raise(new Exception('datajs is required', 'Not Found!'));
        }

        this.SqlCommands = [];
        this.context = ctx;
        this.providerConfiguration = $data.typeSystem.extend({
            dbCreation: $data.storageProviders.DbCreationType.DropTableIfChanged,
            oDataServiceHost: "/odata.svc",
            serviceUrl: "",
            maxDataServiceVersion: '2.0',
            user: null,
            password: null
        }, cfg);
        if (this.context && this.context._buildDbType_generateConvertToFunction && this.buildDbType_generateConvertToFunction) {
            this.context._buildDbType_generateConvertToFunction = this.buildDbType_generateConvertToFunction;
        }
        if (this.context && this.context._buildDbType_modifyInstanceDefinition && this.buildDbType_modifyInstanceDefinition) {
            this.context._buildDbType_modifyInstanceDefinition = this.buildDbType_modifyInstanceDefinition;
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
                        console.log("RESET oData database");
                        callBack.success(that.context);
                    }, function (error) {
                        callBack.success(that.context);
                    }];

                    if (this.providerConfiguration.user) {
                        requestData[0].user = this.providerConfiguration.user;
                        requestData[0].password = this.providerConfiguration.password || "";
                    }

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
                dbInstance[property.name] = logicalEntity[property.name];
            }, this);

            if (storageModel.Associations) {
                storageModel.Associations.forEach(function (association) {
                    if ((association.FromMultiplicity == "*" && association.ToMultiplicity == "0..1") ||
                        (association.FromMultiplicity == "0..1" && association.ToMultiplicity == "1") ||
                        (association.FromMultiplicity == '$$unbound')) {
                        var refValue = logicalEntity[association.FromPropertyName];
                        if (refValue !== null && refValue !== undefined) {
                            if (refValue instanceof $data.Array) {
                                dbInstance[association.FromPropertyName] = dbInstance[association.FromPropertyName] || [];
                                refValue.forEach(function (rv) {
                                    var contentId = convertedItems.indexOf(rv);
                                    if (contentId < 0) { Guard.raise("Dependency graph error"); }
                                    dbInstance[association.FromPropertyName].push({ __metadata: { uri: "$" + (contentId + 1) } });
                                }, this);
                            } else {
                                if (refValue.entityState === $data.EntityState.Modified) {
                                    var tblName = context._storageModel.getStorageModel(refValue.getType()).TableName;
                                    var pk = '(';
                                    refValue.getType().memberDefinitions.getKeyProperties().forEach(function (k, index) {
                                        if (index > 0) { pk += ','; }
                                        pk += refValue[k.name];
                                    }, this);
                                    pk += ')';
                                    dbInstance[association.FromPropertyName] = { __metadata: { uri: tblName + pk } };
                                } else {
                                    var contentId = convertedItems.indexOf(refValue);
                                    if (contentId < 0) { Guard.raise("Dependency graph error"); }
                                    dbInstance[association.FromPropertyName] = { __metadata: { uri: "$" + (contentId + 1) } };
                                }
                            }
                        }
                    }
                }, this);
            }
            if (storageModel.ComplexTypes) {
                storageModel.ComplexTypes.forEach(function (cmpType) {
                    dbInstance[cmpType.FromPropertyName] = logicalEntity[cmpType.FromPropertyName];
                }, this);
            }
            return dbInstance;
        };
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
        var schema = this.context;

        var requestData = [
            {
                requestUri: this.providerConfiguration.oDataServiceHost + sql.queryText,
                headers: {
                    MaxDataServiceVersion: this.providerConfiguration.maxDataServiceVersion
                }
            },
            function (data, textStatus, jqXHR) {
                if (!data) data = JSON.parse(textStatus.body);
                if (callBack.success) {
                    query.rawDataList = typeof data === 'string' ? [{ cnt: data }] : data;
                    callBack.success(query);
                }
            },
            function (jqXHR, textStatus, errorThrow) {
                callBack.error(errorThrow);
            }
        ];

        if (this.providerConfiguration.user) {
            requestData[0].user = this.providerConfiguration.user;
            requestData[0].password = this.providerConfiguration.password || "";
        }

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
        batchRequests = [];
        convertedItem = [];
        for (var index = 0; index < independentBlocks.length; index++) {
            for (var i = 0; i < independentBlocks[index].length; i++) {
                convertedItem.push(independentBlocks[index][i].data);
                var request = {};
                request.headers = { "Content-Id": convertedItem.length };
                switch (independentBlocks[index][i].data.entityState) {
                    case $data.EntityState.Unchanged: continue; break;
                    case $data.EntityState.Added:
                        request.method = "POST";
                        request.requestUri = independentBlocks[index][i].entitySet.name;
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case $data.EntityState.Modified:
                        request.method = "MERGE";
                        request.requestUri = independentBlocks[index][i].entitySet.name;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        request.data = this.save_getInitData(independentBlocks[index][i], convertedItem);
                        break;
                    case $data.EntityState.Deleted:
                        request.method = "DELETE";
                        request.requestUri = independentBlocks[index][i].entitySet.name;
                        request.requestUri += "(" + this.getEntityKeysValue(independentBlocks[index][i]) + ")";
                        this.save_addConcurrencyHeader(independentBlocks[index][i], request.headers);
                        break;
                    default: Guard.raise(new Exception("Not supported Entity state"));
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
            }
        }, function (data, response) {
            if (response.statusCode == 202) {
                var result = data.__batchResponses[0].__changeResponses;
                var resultEntities = [];
                for (var i = 0; i < result.length; i++) {
                    var item = convertedItem[i];
                    if (result[i].statusCode == 204) {
                        if (result[i].headers.ETag) {
                            var property = item.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) { return memDef.concurrencyMode === $data.ConcurrencyMode.Fixed });
                            if (property && property[0]) {
                                item[property[0].name] = result[i].headers.ETag;
                            }
                        }
                        continue;
                    }

                    item.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
                        if (memDef.computed) {
                            if (memDef.concurrencyMode === $data.ConcurrencyMode.Fixed) {
                                item[memDef.name] = result[i].headers.ETag;
                            } else {
                                item[memDef.name] = result[i].data[memDef.name];
                            }
                        }
                    }, this);
                }
                if (callBack.success) {
                    callBack.success(convertedItem.length);
                }
            } else {
                callBack.error(response);
            }

        }, callBack.error, OData.batchHandler];

        if (this.providerConfiguration.user) {
            requestData[0].user = this.providerConfiguration.user;
            requestData[0].password = this.providerConfiguration.password || "";
        }

        this.context.prepareRequest.call(this, requestData);
        OData.request.apply(this, requestData);
    },
    save_getInitData: function (item, convertedItems) {
        item.physicalData = this.context._storageModel.getStorageModel(item.data.getType()).PhysicalType.convertTo(item.data, convertedItems);
        var serializableObject = {}
        item.physicalData.getType().memberDefinitions.asArray().forEach(function (memdef) {
            if (memdef.kind == $data.MemberTypes.navProperty || memdef.kind == $data.MemberTypes.complexProperty || (memdef.kind == $data.MemberTypes.property && !memdef.notMapped)) {
                serializableObject[memdef.name] = item.physicalData[memdef.name];
            }
        }, this);
        return serializableObject;
    },
    save_addConcurrencyHeader: function (item, headers) {
        var property = item.data.getType().memberDefinitions.getPublicMappedProperties().filter(function (memDef) { return memDef.concurrencyMode === $data.ConcurrencyMode.Fixed });
        if (property && property[0]) {
            headers['If-Match'] = item.data[property[0].name];
            item.data[property[0].name] = "";
        }
        //if (item.data.RowVersion || item.data.RowVersion === 0) {
        //    headers['If-Match'] = item.data.RowVersion.toString();
        //    item.data.RowVersion = "";
        //}
    },
    getTraceString: function (queryable) {
        var sqlText = this._compile(queryable);
        return queryable;
    },
    supportedDataTypes: { value: [$data.Integer, $data.String, $data.Number, $data.Blob, $data.Boolean, $data.Date], writable: false },

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

            length: {
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
            include: {}
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
                '$data.Object': function (o) { if (o === undefined) { return new $data.Object(); } else if (typeof o === 'string') { return JSON.parse(o); } return o; },
                '$data.Array': function (o) { if (o === undefined) { return new $data.Array(); } else if (o instanceof $data.Array) { return o; } return JSON.parse(o); }
            },
            toDb: {
                '$data.Integer': function (number) { return number; },
                '$data.Number': function (number) { return number % 1 == 0 ? number : number + 'm'; },
                '$data.Date': function (date) { return date ? "datetime'" + date.toISOString() + "'" : null; },
                '$data.String': function (text) { return "'" + text.replace(/'/g, "''") + "'"; },
                '$data.Boolean': function (bool) { return bool ? 'true' : 'false'; },
                '$data.Blob': function (blob) { return blob; },
                '$data.Object': function (o) { return JSON.stringify(o); },
                '$data.Array': function (o) { return JSON.stringify(o); }
            }
        }
    },
    getEntityKeysValue: function (entity) {
        var result = [];
        var keyValue = undefined;
        var memDefs = entity.entitySet.createNew.memberDefinitions.asArray();
        for (var i = 0, l = memDefs.length; i < l; i++) {
            var field = memDefs[i];
            if (field.key) {
                keyValue = entity.data[field.name];
                switch (field.dataType) {
                    case "Edm.Guid":
                        keyValue = ("guid'" + keyValue + "'");
                        break;
                    case "Edm.Binary":
                        keyValue = ("binary'" + keyValue + "'");
                        break;
                    case "Edm.Byte":
                        var hexDigits = '0123456789ABCDEF';
                        keyValue = (hexDigits[(i >> 4) & 15] + hexDigits[i & 15]);
                        break;
                    case "Edm.DateTime":
                        keyValue = ("datetime'" + keyValue.toISOString() + "'");
                        break;
                    case "Edm.Decimal":
                        keyValue = (keyValue + "M");
                        break;
                    case "Edm.Single":
                        keyValue = (keyValue + "f");
                        break;
                    case "Edm.Int64":
                        keyValue = (keyValue + "L");
                        break;
                    case 'Edm.String':
                    case "string":
                        keyValue = ("'" + keyValue + "'");
                        break;
                }
                result.push(field.name + "=" + keyValue);
            }
        }
        if (result.length > 1) {
            return result.join(",");
        }
        return keyValue;
    }/*,
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
}, null);

$data.StorageProviderBase.registerProvider("oData", $data.storageProviders.oData.oDataProvider);
$C('$data.storageProviders.oData.oDataCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function () {
        this.context = {};
        this.provider = {};
        //this.logicalType = null;
        this.includes = null;
        this.mainEntitySet = null;
    },
    compile: function (query) {

        this.provider = query.context.storageProvider;
        this.context = query.context;
        this.mainEntitySet = query.context.getEntitySetFromElementType(query.defaultType);

        var queryFragments = { urlText: "" };
        
        this.Visit(query.expression, queryFragments);

        query.modelBinderConfig = {};
        var modelBinder = Container.createModelBinderConfigCompiler(query, this.includes, true);
        modelBinder.Visit(query.expression);


        var queryText = queryFragments.urlText;
        var addAmp = false;
        for (var name in queryFragments) {
            if (name != "urlText" && name != "actionPack" && name != "data" && name != "lambda" && queryFragments[name] != "") {
                if (addAmp) { queryText += "&"; } else { queryText += "?"; }
                addAmp = true;
                if(name != "$urlParams"){
                    queryText += name + '=' + queryFragments[name];
                }else{
                    queryText += queryFragments[name];
                }
            }
        }
        query.queryText = queryText;
        
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
            context['$expand'] += expression.selector.value.replace(/\./g, '/');

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
    },
    VisitFilterExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.FilterExpression" />

        this.Visit(expression.source, context);

        var filterCompiler = Container.createoDataWhereCompiler(this.provider);
        context.data = "";
        filterCompiler.compile(expression.selector, context);
        context["$filter"] = context.data;
        context.data = "";

    },
    VisitEntitySetExpression: function (expression, context) {
        context.urlText += "/" + expression.instance.tableName;
        //this.logicalType = expression.instance.elementType;
        if (expression.params) {
            for (var i = 0; i < expression.params.length; i++) {
                this.Visit(expression.params[i], context);
            }
        }
    },
    VisitServiceOperationExpression: function (expression, context) {
        context.urlText += "/" + expression.cfg.serviceName;
        //this.logicalType = expression.returnType;
        if (expression.params) {
            for (var i = 0; i < expression.params.length; i++) {
                this.Visit(expression.params[i], context);
            }
        }
    },
    VisitConstantExpression: function (expression, context) {
        if (context['$urlParams']) { context['$urlParams'] += '&'; } else { context['$urlParams'] = ''; }

        var valueType = Container.getTypeName(expression.value);
        context['$urlParams'] += expression.name + '=' + this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](expression.value);
    },
    VisitCountExpression: function (expression, context) {
        this.Visit(expression.source, context);
        context.urlText += '/$count';       
    }
}, {});$C('$data.storageProviders.oData.oDataWhereCompiler', $data.Expressions.EntityExpressionVisitor, null, {
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
        context.data += expression.resolution.mapTo;
        context.data += "(";
        this.Visit(expression.operand, context);
        context.data += ")";
    },


    VisitSimpleBinaryExpression: function (expression, context) {
        context.data += "(";
        //TODO refactor!!!
        if (expression.nodeType == "in") {
            Guard.requireType("expression.right", expression.type, $data.Expressions.ConstantExpression);
            var paramValue = expression.right.value;
            if (!paramValue instanceof Array) { Guard.raise(new Exception("Right to the 'in' operator must be an array value")); }
            var result = null;
            var orResolution = { mapTo: "or", dataType: "boolean", name: "or" };
            var eqResolution = { mapTo: "eq", dataType: "boolean", name: "equal" };

            paramValue.forEach(function (item) {
                var idValue = Container.createConstantExpression(item);
                var idCheck = Container.createSimpleBinaryExpression(expression.left, idValue,
                    $data.Expressions.ExpressionType.Equal, "==", "boolean", eqResolution);
                if (result) {
                    result = Container.createSimpleBinaryExpression(result, idCheck,
                    $data.Expressions.ExpressionType.Or, "||", "boolean", orResolution);
                } else {
                    result = idCheck;
                };
            });
            var temp = context.data;
            context.data = '';
            this.Visit(result, context);
            context.data = temp + context.data.replace(/\(/g, '').replace(/\)/g, '');
        } else {
            this.Visit(expression.left, context);
            context.data += " ";
            context.data += expression.resolution.mapTo;
            context.data += " ";
            this.Visit(expression.right, context);
        };
        context.data += ")";

    },

    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },

    VisitAssociationInfoExpression: function (expression, context) {
        context.data += expression.associationInfo.FromPropertyName;
    },

    VisitMemberInfoExpression: function (expression, context) {
        context.data += expression.memberName;
    },

    VisitQueryParameterExpression: function (expression, context) {
        context.data += this.provider.fieldConverter.toDb[expression.type](expression.value);
    },

    VisitEntityFieldOperationExpression: function (expression, context) {
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

        args.forEach(function (arg, index) {
            if (index > 0) {
                context.data += ",";
            };
            this.Visit(arg, context);
        }, this);
        context.data += ")";
    },

    VisitConstantExpression: function (expression, context) {
        var valueType = Container.getTypeName(expression.value);
        context.data += this.provider.fieldConverter.toDb[Container.resolveName(Container.resolveType(valueType))](expression.value);
    },

    VisitEntityExpression: function (expression, context) {
        this.Visit(expression.source, context);

        if (this.lambdaPrefix && expression.selector.lambda) {
            context.lambda = expression.selector.lambda;
            context.data += (expression.selector.lambda + '/');
        }

        //if (expression.selector instanceof $data.Expressions.EntityExpression) {
        //    this.Visit(expression.selector, context);
        //}
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
            if (arg && arg.value instanceof $data.Queryable) {
                var frameExpression = new opDef.frameType(arg.value.expression);
                var preparator = Container.createQueryExpressionCreator(arg.value.entityContext);
                var prep_expression = preparator.Visit(frameExpression);

                var compiler = new $data.storageProviders.oData.oDataWhereCompiler(this.provider, true);
                var frameContext = { data: "" };
                var compiled = compiler.compile(prep_expression, frameContext);

                context.data += (frameContext.lambda + ': ' + frameContext.data);
            };
        }
        context.data += ")";
    }
});$C('$data.storageProviders.oData.oDataOrderCompiler', $data.storageProviders.oData.oDataWhereCompiler, null, {
    constructor: function (provider) {
        this.provider = provider;
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitOrderExpression: function (expression, context) {
        var orderContext = { data: "" };
        this.Visit(expression.selector, orderContext);
        if (context['$orderby']) { context['$orderby'] += ','; } else { context['$orderby'] = ''; }
        context['$orderby'] += orderContext.data
                           + (expression.nodeType == $data.Expressions.ExpressionType.OrderByDescending ? " desc" : "");
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
        context.data += "/";
    },
    VisitEntitySetExpression: function (expression, context) {
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.source, context);
            this.Visit(expression.selector, context);
        }
    },
    VisitAssociationInfoExpression: function (expression, context) {
        context.data += expression.associationInfo.FromPropertyName + '/';
    },
    VisitEntityExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitMemberInfoExpression: function (expression, context) {
        context.data += expression.memberName;
    }
});
$C('$data.storageProviders.oData.oDataPagingCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitPagingExpression: function (expression, context) {
        var pagingContext = { data: "" };
        this.Visit(expression.amount, pagingContext);
        switch (expression.nodeType) {
            case $data.Expressions.ExpressionType.Skip: context['$skip'] = pagingContext.data; break;
            case $data.Expressions.ExpressionType.Take: context['$top'] = pagingContext.data; break;
            default: Guard.raise("Not supported nodeType"); break;
        }
    },
    VisitConstantExpression: function (expression, context) {
        context.data += expression.value;
    }
});
$C('$data.storageProviders.oData.oDataProjectionCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (entityContext) {
        this.entityContext = entityContext;
        this.hasObjectLiteral = false;
        this.ObjectLiteralPath = "";
        this.modelBinderMapping = [];
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitProjectionExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.ProjectionExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        context.data = "";
        this.mapping = "";

        this.Visit(expression.selector, context);
        if (context['$select']) { context['$select'] += ','; } else { context['$select'] = ''; }
        context["$select"] += context.data;
        context.data = "";
    },
    VisitParametricQueryExpression: function (expression, context) {
        this.Visit(expression.expression, context);
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
            context['$expand'] += this.mapping.replace(/\./g, '/')
        } if (expression.expression instanceof $data.Expressions.ComplexTypeExpression) {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
                context['$expand'] += m.join('/');
            }
        } else {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
                context['$expand'] += m.join('/');
            }
        }
    },
    VisitObjectLiteralExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.ObjectLiteralExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        var tempObjectLiteralPath = this.ObjectLiteralPath;
        this.hasObjectLiteral = true;
        expression.members.forEach(function (member, index) {
            this.Visit(member, context);
            if (index < expression.members.length - 1) { context.data += ','; }
            this.mapping = '';
        }, this);
        this.ObjectLiteralPath = tempObjectLiteralPath;
    },
    VisitObjectFieldExpression: function (expression, context) {


        if (this.ObjectLiteralPath) { this.ObjectLiteralPath += '.' + expression.fieldName; } else { this.ObjectLiteralPath = expression.fieldName; }
        this.Visit(expression.expression, context);

        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
            context['$expand'] += this.mapping.replace(/\./g, '/')
        } else {
            var m = this.mapping.split('.');
            m.pop();
            if (m.length > 0) {
                if (context['$expand']) { context['$expand'] += ','; } else { context['$expand'] = ''; }
                context['$expand'] += m.join('/');
            }
        }
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
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.EntityExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        this.Visit(expression.source, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.EntitySetExpression" mayBeNull="false"></param>
        ///<param name="context" mayBeNull="false"></param>
        if (expression.source instanceof $data.Expressions.EntityExpression) {
            this.Visit(expression.source, context);
        }
        if (expression.selector instanceof $data.Expressions.AssociationInfoExpression) {
            this.Visit(expression.selector, context);
        }
    },
    VisitAssociationInfoExpression: function (expression, context) {
        if (context.data && context.data.length > 0 && context.data[context.data.length - 1] != ',') { context.data += '/'; }
        context.data += expression.associationInfo.FromPropertyName;
        if (this.mapping && this.mapping.length > 0) { this.mapping += '.'; }
        this.mapping += expression.associationInfo.FromPropertyName;
    },
    VisitMemberInfoExpression: function (expression, context) {
        if (context.data && context.data.length > 0 && context.data[context.data.length - 1] != ',') { context.data += '/'; }
        context.data += expression.memberName;
        if (this.mapping && this.mapping.length > 0) { this.mapping += '.'; }
        this.mapping += expression.memberName;
    },
    VisitConstantExpression: function (expression, context) {
        //Guard.raise(new Exception('Constant value is not supported in Projection.', 'Not supported!'));
        //context.data += expression.value;
		context.data = context.data.slice(0, context.data.length - 1);
    }
});