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
$data.YQLConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Number': function (value) { return typeof value === "number" ? value : parseInt(value); },
        '$data.Integer': function (value) { return typeof value === "number" ? value : parseFloat(value); },
        '$data.String': $data.Container.proxyConverter,
        '$data.Date': function (value) { return new Date(typeof value === "string" ? parseInt(value) : value); },
        '$data.Boolean': function (value) { return !!value },
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Array': function (value) { if (value === undefined) { return new $data.Array(); } return value; }
    },
    toDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int32': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
        '$data.String': function (value) { return "'" + value + "'"; },
        '$data.Date': function (value) { return value ? value.valueOf() : null; },
        '$data.Boolean': $data.Container.proxyConverter,
        '$data.Blob': $data.Container.proxyConverter,
        '$data.Array': function (value) { return '(' + value.join(', ') + ')'; }
    }
};
$data.Class.define('$data.storageProviders.YQL.YQLProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg) {
        var provider = this;
        this.SqlCommands = [];
        this.context = {};
        this.extendedCreateNew = [];
        this.providerConfiguration = $data.typeSystem.extend({
            YQLFormat: "format=json",
            YQLQueryUrl: "http://query.yahooapis.com/v1/public/yql?q=",
            YQLEnv: '',
            resultPath: ["query", "results"],
            resultSkipFirstLevel: true
        }, cfg);
        this.initializeStore = function (callBack) {
            callBack = $data.typeSystem.createCallbackSetting(callBack);
            callBack.success(this.context);
        };

    },
    AuthenticationProvider: { dataType: '$data.Authentication.AuthenticationBase', enumerable: false },
    supportedDataTypes: { value: [$data.Integer, $data.Number, $data.Date, $data.String, $data.Boolean, $data.Blob, $data.Array], writable: false },
    supportedFieldOperations: {
        value: {
            'contains': {
                dataType: $data.String,
                allowedIn: $data.Expressions.FilterExpression,
                mapTo: ' LIKE ',
                expressionInParameter: false,
                parameters: [{ name: 'inStatement', dataType: $data.String, prefix: '%', suffix: '%' }]
            },
            'startsWith': {
                dataType: $data.String,
                allowedIn: $data.Expressions.FilterExpression,
                mapTo: ' LIKE ',
                expressionInParameter: false,
                parameters: [{ name: 'inStatement', dataType: $data.String, suffix: '%' }]
            },
            'endsWith': {
                dataType: $data.String,
                allowedIn: $data.Expressions.FilterExpression,
                mapTo: ' LIKE ',
                expressionInParameter: false,
                parameters: [{ name: 'inStatement', dataType: $data.String, prefix: '%' }]
            }
        },
        enumerable: true,
        writable: true
    },
    supportedBinaryOperators: {
        value: {
            equal: { mapTo: ' = ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },
            notEqual: { mapTo: ' != ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },
            equalTyped: { mapTo: ' = ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },
            notEqualTyped: { mapTo: ' != ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },
            greaterThan: { mapTo: ' > ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },
            greaterThanOrEqual: { mapTo: ' >= ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },

            lessThan: { mapTo: ' < ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },
            lessThenOrEqual: { mapTo: ' <= ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },
            or: { mapTo: ' OR ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },
            and: { mapTo: ' AND ', dataType: $data.Boolean, allowedIn: $data.Expressions.FilterExpression },

            "in": { mapTo: " IN ", dataType: $data.Boolean, resolvableType: [$data.Array, $data.Queryable], allowedIn: $data.Expressions.FilterExpression }
        }
    },
    supportedUnaryOperators: {
        value: {}
    },
    supportedSetOperations: {
        value: {
            filter: {},
            map: {},
            forEach: {},
            toArray: {},
            single: {},
            take: {},
            skip: {},
            orderBy: {},
            orderByDescending: {},
            first: {}
        },
        enumerable: true,
        writable: true
    },
    fieldConverter: { value: $data.YQLConverter },
    executeQuery: function (query, callBack) {
        var self = this;
        callBack = $data.typeSystem.createCallbackSetting(callBack);
        var schema = query.defaultType;
        var entitSetDefinition = query.context.getType().memberDefinitions.asArray().filter(function (m) { return m.elementType == schema })[0] || {};
        var ctx = this.context;

        if (!this.AuthenticationProvider)
            this.AuthenticationProvider = new $data.Authentication.Anonymous({});

        var sql;
        try {
            sql = this._compile(query);
        } catch (e) {
            callBack.error(e);
            return;
        }

        var includes = [];
        var requestData = {
            url: this.providerConfiguration.YQLQueryUrl + encodeURIComponent(sql.queryText) + "&" + this.providerConfiguration.YQLFormat + (this.providerConfiguration.YQLEnv ? ("&env=" + this.providerConfiguration.YQLEnv) : ""),
            dataType: "JSON",
            success: function (data, textStatus, jqXHR) {
                var resultData = self._preProcessData(data, entitSetDefinition);
                if (resultData == false) {
                    callBack.success(query);
                    return;
                }

                query.rawDataList = resultData;
                if (entitSetDefinition.anonymousResult) {
                    query.rawDataList = resultData;
                    callBack.success(query);
                    return;
                } else {
                    var compiler = Container.createModelBinderConfigCompiler(query, []);
                    compiler.Visit(query.expression);
                }

                callBack.success(query);
            },
            error: function (jqXHR, textStatus, errorThrow) {
                var errorData = {};
                try {
                    errorData = JSON.parse(jqXHR.responseText).error;
                } catch (e) {
                    errorData = errorThrow + ': ' + jqXHR.responseText;
                }
                callBack.error(errorData);
            }
        };

        this.context.prepareRequest.call(this, requestData);
        this.AuthenticationProvider.CreateRequest(requestData);
    },
    _preProcessData: function (jsonResult, entityDef) {
        var resultData = jsonResult;
        var depths = entityDef.resultPath != undefined ? entityDef.resultPath : this.providerConfiguration.resultPath;
        for (var i = 0; i < depths.length; i++) {
            if (resultData[depths[i]])
                resultData = resultData[depths[i]];
            else {
                return false;
            }
        }

        var skipFirstLevel = entityDef.resultSkipFirstLevel != undefined ? entityDef.resultSkipFirstLevel : this.providerConfiguration.resultSkipFirstLevel;
        if (skipFirstLevel == true) {
            var keys = Object.keys(resultData);
            if (keys.length == 1 && (resultData[keys[0]] instanceof Array || !entityDef.anonymousResult))
                resultData = resultData[keys[0]];
        }

        if (resultData.length) {
            return resultData;
        }
        else
            return [resultData]
    },
    _compile: function (query) {
        var sqlText = Container.createYQLCompiler().compile(query);
        return sqlText;
    },
    getTraceString: function (query) {
        if (!this.AuthenticationProvider)
            this.AuthenticationProvider = new $data.Authentication.Anonymous({});

        var sqlText = this._compile(query);
        return sqlText;
    },
    setContext: function (ctx) {
        this.context = ctx;
    },
    saveChanges: function (callBack) {
        Guard.raise(new Exception("Not Implemented", "Not Implemented"));
    }
}, null);

$data.StorageProviderBase.registerProvider("YQL", $data.storageProviders.YQL.YQLProvider);
//"use strict" // suspicious code;

$C('$data.storageProviders.YQL.YQLCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function () {
        this.provider = {};
        this.cTypeCache = {};
    },

    compile: function (query) {
        this.provider = query.context.storageProvider;

        var context = {
            filterSql: { sql: '' },
            projectionSql: { sql: '' },
            orderSql: { sql: '' },
            skipSql: { sql: '' },
            takeSql: { sql: '' },
            tableName: ''
        };
        this.Visit(query.expression, context);

        if (context.projectionSql.sql == '')
            context.projectionSql.sql = "SELECT *";

        if (context.orderSql.sql)
            context.orderSql.sql = " | sort(" + context.orderSql.sql + ')';

        //special skip-take logic
        if (context.skipSql.value && context.takeSql.value) {
            var skipVal = context.skipSql.value;
            context.skipSql.value = context.takeSql.value;
            context.takeSql.value = context.takeSql.value + skipVal;
        }
        if (context.skipSql.value) context.skipSql.sql = context.skipSql.sqlPre + context.skipSql.value + context.skipSql.sqlSuf
        if (context.takeSql.value) context.takeSql.sql = context.takeSql.sqlPre + context.takeSql.value + context.takeSql.sqlSuf

        return {
            queryText: context.projectionSql.sql + ' FROM ' + context.tableName +
                context.filterSql.sql +
                context.orderSql.sql +
                context.takeSql.sql +
                (context.takeSql.sql ? context.skipSql.sql : ''),
            selectMapping: context.projectionSql.selectFields,
            params: []
        };

    },

    VisitFilterExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.FilterExpression" />
        this.Visit(expression.source, context);

        context.filterSql.type = expression.nodeType;
        if (context.filterSql.sql == '')
            context.filterSql.sql = ' WHERE ';
        else
            context.filterSql.sql += ' AND ';

        this.Visit(expression.selector, context.filterSql);
    },
    VisitProjectionExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.ProjectionExpression" />
        this.Visit(expression.source, context);

        context.projectionSql.type = expression.nodeType;
        if (context.projectionSql.sql == '')
            context.projectionSql.sql = 'SELECT ';
        else
            Guard.raise(new Exception('multiple select error'));

        this.Visit(expression.selector, context.projectionSql);
    },
    VisitOrderExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.OrderExpression" />
        this.Visit(expression.source, context);

        context.orderSql.type = expression.nodeType;

        var orderContext = { sql: '' };
        this.Visit(expression.selector, orderContext);
        context.orderSql.sql = "field='" + orderContext.sql + "', descending='" + (expression.nodeType == $data.Expressions.ExpressionType.OrderByDescending) + "'" +
            (context.orderSql.sql != '' ? (', ' + context.orderSql.sql) : '');
    },
    VisitPagingExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.PagingExpression" />
        this.Visit(expression.source, context);

        if (expression.nodeType == $data.Expressions.ExpressionType.Skip) {
            context.skipSql.type = expression.nodeType;
            context.skipSql.sqlPre = ' | tail(count=';
            this.Visit(expression.amount, context.skipSql);
            context.skipSql.sqlSuf = ')';
        }
        else if (expression.nodeType == $data.Expressions.ExpressionType.Take) {
            context.takeSql.type = expression.nodeType;
            context.takeSql.sqlPre = ' | truncate(count=';
            this.Visit(expression.amount, context.takeSql);
            context.takeSql.sqlSuf = ')';
        }
    },

    VisitSimpleBinaryExpression: function (expression, context) {
        context.sql += "(";
        var left = this.Visit(expression.left, context);
        context.sql += expression.resolution.mapTo;

        if (expression.resolution.resolvableType &&
            !Guard.requireType(expression.resolution.mapTo + ' expression.right.value', expression.right.value, expression.resolution.resolvableType)) {
                Guard.raise(new Exception(expression.right.type + " not allowed in '" + expression.resolution.mapTo + "' statement", "invalid operation"));
            }

        if (expression.resolution.name === 'in' && expression.right.value instanceof Array) {
            var self = this;
            context.sql += "(";
            expression.right.value.forEach(function (item, i) {
                if (i > 0) context.sql += ", ";
                self.Visit(item, context);
            });
            context.sql += ")";
        } else {
            var right = this.Visit(expression.right, context);
        }
        context.sql += ")";
    },

    VisitEntityFieldExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
    },
    VisitMemberInfoExpression: function (expression, context) {
        var memberName;
        if (context.wasComplex === true)
            context.sql += '.';
        context.sql += expression.memberName;

        if (context.isComplex == true) {
            context.complex += expression.memberName;
            context.wasComplex = true;
        }
        else {
            context.wasComplex = false;
            if (context.complex)
                memberName = context.complex + expression.memberName;
            else
                memberName = expression.memberName;

            context.complex = null;
            //context.sql += memberName;
            //context.fieldName = memberName;
            context.fieldData = { name: memberName, dataType: expression.memberDefinition.dataType };

            if (context.type == 'Projection' && !context.selectFields)
                context.selectFields = [{ from: memberName, dataType: expression.memberDefinition.dataType }];
        }
    },

    VisitConstantExpression: function (expression, context) {
        if (context.type == 'Projection')
            Guard.raise(new Exception('Constant value is not supported in Projection.', 'Not supported!'));

        this.VisitQueryParameterExpression(expression, context);
    },

    VisitQueryParameterExpression: function (expression, context) {
        context.value = expression.value;
        var expressionValueType = Container.resolveType(expression.type); //Container.resolveType(Container.getTypeName(expression.value));
        if (expression.value instanceof $data.Queryable) {
            context.sql += '(' + expression.value.toTraceString().queryText + ')';
        } else if (this.provider.supportedDataTypes.indexOf(expressionValueType) != -1)
            context.sql += this.provider.fieldConverter.toDb[Container.resolveName(expressionValueType)](expression.value);
        else {
            context.sql += "" + expression.value + "";
        }
    },

    VisitParametricQueryExpression: function (expression, context) {
        if (context.type == 'Projection') {
            this.Visit(expression.expression, context);
            if (expression.expression instanceof $data.Expressions.ComplexTypeExpression) {
                context.selectFields = context.selectFields || [];
                var type = expression.expression.entityType;
                var includes = this._getComplexTypeIncludes(type);
                context.selectFields.push({ from: context.complex, type: type, includes: includes });
            }

        } else {

            var exp = this.Visit(expression.expression, context);
            context.parameters = expression.parameters;
        }
    },

    VisitEntitySetExpression: function (expression, context) {
        if (context.type) {
            if (!context.complex)
                context.complex = '';
        }
        else {
            context.tableName = expression.instance.tableName;
        }

    },

    VisitObjectLiteralExpression: function (expression, context) {
        var self = this;
        context.selectFields = context.selectFields || [];
        expression.members.forEach(function (member) {
            if (member.expression instanceof $data.Expressions.ObjectLiteralExpression) {
                context.mappingPrefix = context.mappingPrefix || []
                context.mappingPrefix.push(member.fieldName);
                self.Visit(member, context);
                context.mappingPrefix.pop();
            }
            else {
                if (context.selectFields.length > 0)
                    context.sql += ', ';
                self.Visit(member, context);

                var mapping = { from: context.fieldData.name, to: (context.mappingPrefix instanceof Array ? context.mappingPrefix.join('.') + '.' + member.fieldName : member.fieldName) };
                if (context.selectType) {
                    mapping.type = context.selectType;
                    var includes = this._getComplexTypeIncludes(context.selectType);
                    mapping.includes = includes;
                } else {
                    mapping.dataType = context.fieldData.dataType;
                }
                context.selectFields.push(mapping);

                delete context.fieldData;
                delete context.selectType;
            }
        }, this);
    },
    VisitObjectFieldExpression: function (expression, context) {
        this.Visit(expression.expression, context);
        if (expression.expression instanceof $data.Expressions.ComplexTypeExpression) {
            context.fieldData = context.fieldData || {};
            context.fieldData.name = context.complex;
            context.selectType = expression.expression.entityType;
        }
    },
    VisitEntityFieldOperationExpression: function (expression, context) {
        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);

        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;

        context.sql += '(';

        if (opDef.expressionInParameter == false)
            this.Visit(expression.source, context);

        context.sql += opName;
        var paramCounter = 0;
        var params = opDef.parameters || [];

        var args = params.map(function (item, index) {
            var result = { dataType: item.dataType, prefix: item.prefix, suffix: item.suffix };
            if (item.value) {
                result.value = item.value;
            } else if (item.name === "@expression") {
                result.value = expression.source;
            } else {
                result.value = expression.parameters[paramCounter];
                result.itemType = expression.parameters[paramCounter++].type;
            };
            return result;
        });

        args.forEach(function (arg, index) {
            var itemType = arg.itemType ? Container.resolveType(arg.itemType) : null;
            if (!itemType || ((arg.dataType instanceof Array && arg.dataType.indexOf(itemType) != -1) || arg.dataType == itemType)) {
                if (index > 0) {
                    context.sql += ", ";
                };
                var funcContext = { sql: '' };
                this.Visit(arg.value, funcContext);

                if (opName == ' LIKE ') {
                    var valueType = Container.getTypeName(funcContext.value)
                    context.sql += valueType == 'string' ? "'" : "";
                    context.sql += (arg.prefix ? arg.prefix : '') + funcContext.value + (arg.suffix ? arg.suffix : '')
                    context.sql += valueType == 'string' ? "'" : "";
                } else {
                    context.sql += funcContext.sql;
                }

            } else
                Guard.raise(new Exception(parameter.type + " not allowed in '" + expression.operation.memberName + "' statement", "invalid operation"));
        }, this);

        if (opDef.rigthValue) context.sql += opDef.rigthValue;
        else context.sql += ""

        context.sql += ')';
    },

    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);

        context.isComplex = true;
        this.Visit(expression.selector, context);
        context.isComplex = false;

        if (context.complex != '' /*&& context.isComplex*/)
            context.complex += '.';

    },

    VisitEntityExpression: function (expression, context) {
        this.Visit(expression.source, context);
    },

    _findComplexType: function (type, result, depth) {
        type.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            var dataType = Container.resolveType(memDef.dataType)
            if (dataType.isAssignableTo && !dataType.isAssignableTo($data.EntitySet)) {
                var name = (depth ? depth + '.' + memDef.name : memDef.name);
                result.push({ name: name, type: dataType });
                this._findComplexType(dataType, result, name);
            }
        }, this);
    },
    _getComplexTypeIncludes: function (type) {
        if (!this.cTypeCache[type.name]) {
            var inc = [];
            this._findComplexType(type, inc);
            this.cTypeCache[type.name] = inc;
        }
        return this.cTypeCache[type.name];
    }

}, null);

$data.Class.define('$data.Yahoo.types.Geo.placeTypeNameCf', $data.Entity, null, {
    code: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.countryCf', $data.Entity, null, {
    code: { type: 'string' },
    type: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.adminCf', $data.Entity, null, {
    code: { type: 'string' },
    type: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.localityCf', $data.Entity, null, {
    code: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.centroidCf', $data.Entity, null, {
    latitude: { type: 'string' },
    longitude: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.postalCf', $data.Entity, null, {
    type: { type: 'string' },
    content: { type: 'string' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.boundingBoxCf', $data.Entity, null, {
    southWest: { type: 'centroidRef' },
    northEast: { type: 'centroidRef' }
}, null);

$data.Class.define('$data.Yahoo.types.Geo.PlaceMeta', null, null, {
    woeid: { type: 'int', key: true },
    name: { type: 'string' },
    uri: { type: 'string' },
    placeTypeName: { type: 'placeTypeNameRef' },
    lang: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.PlaceMetaFull', [{ type: null }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    country: { type: 'countryRef' },
    admin1: { type: 'adminRef' },
    admin2: { type: 'adminRef' },
    admin3: { type: 'adminRef' },
    locality1: { type: 'localityRef' },
    locality2: { type: 'localityRef' },
    postal: { type: 'postalRef' },
    centroid: { type: 'centroidRef' },
    boundingBox: { type: 'boundingBoxRef' },
    areaRank: { type: 'int' },
    popRank: { type: 'int' }
}, null);


$data.Class.define('$data.Yahoo.types.Geo.placetype', $data.Entity, null, {
    placeTypeDescription: { type: 'string' },
    uri: { type: 'string', key: true },
    placeTypeName: { type: 'placeTypeNameRef' },
    lang: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.sibling', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    sibling_woeid: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.parent', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    child_woeid: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.neighbor', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    neighbor_woeid: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.common', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    woeid1: { type: 'string' },
    woeid2: { type: 'string' },
    woeid3: { type: 'string' },
    woeid4: { type: 'string' },
    woeid5: { type: 'string' },
    woeid6: { type: 'string' },
    woeid7: { type: 'string' },
    woeid8: { type: 'string' },
    'long': { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.children', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    parent_woeid: { type: 'string' },
    placetype: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.belongto', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    member_woeid: { type: 'string' },
    placetype: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.ancestor', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    descendant_woeid: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.place', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMetaFull }], null, {
    text: { type: 'string' },
    focus: { type: 'string' },
    placetype: { type: 'string' }
}, null);

$data.Class.defineEx('$data.Yahoo.types.Geo.county', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.country', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.district', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.sea', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.state', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.continent', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' },
    view: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.ocean', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    place: { type: 'string' },
    view: { type: 'string' }
}, null);
$data.Class.defineEx('$data.Yahoo.types.Geo.descendant', [{ type: $data.Entity }, { type: $data.Yahoo.types.Geo.PlaceMeta }], null, {
    ancestor_woeid: { type: 'string' },
    placetype: { type: 'string' },
    degree: { type: 'string' },
    view: { type: 'string' }
}, null);

Container.registerType('placeTypeNameRef', $data.Yahoo.types.Geo.placeTypeNameCf);
Container.registerType('centroidRef', $data.Yahoo.types.Geo.centroidCf);
Container.registerType('countryRef', $data.Yahoo.types.Geo.countryCf);
Container.registerType('adminRef', $data.Yahoo.types.Geo.adminCf);
Container.registerType('localityRef', $data.Yahoo.types.Geo.localityCf);
Container.registerType('postalRef', $data.Yahoo.types.Geo.postalCf);
Container.registerType('boundingBoxRef', $data.Yahoo.types.Geo.boundingBoxCf);

$data.Class.define("$data.Yahoo.YQLContext", $data.EntityContext, null, {
    //Geo
    Continents: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.continent, tableName: 'geo.continents' },
    Counties: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.county, tableName: 'geo.counties' },
    Countries: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.country, tableName: 'geo.countries' },
    Districts: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.district, tableName: 'geo.districts' },
    Oceans: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.ocean, tableName: 'geo.oceans' },
    Places: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.place, tableName: 'geo.places' },
    PlaceTypes: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.placetype, tableName: 'geo.placetypes' },
    PlaceSiblings: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.sibling, tableName: 'geo.places.siblings' },
    PlaceParents: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.parent, tableName: 'geo.places.parent' },
    PlaceNeighbors: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.neighbor, tableName: 'geo.places.neighbors' },
    PlaceCommons: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.common, tableName: 'geo.places.common' },
    PlaceChildrens: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.children, tableName: 'geo.places.children' },
    PlaceBelongtos: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.belongto, tableName: 'geo.places.belongtos' },
    PlaceAncestors: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.ancestor, tableName: 'geo.places.ancestors' },
    Seas: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.sea, tableName: 'geo.seas' },
    States: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.state, tableName: 'geo.states' },
    PlaceDescendants: { type: $data.EntitySet, elementType: $data.Yahoo.types.Geo.descendant, tableName: 'geo.places.descendants' },

    placeTypeNameRef: { value: $data.Yahoo.types.Geo.placeTypeNameCf },
    centroidRef: { value: $data.Yahoo.types.Geo.centroidCf },
    countryRef: { value: $data.Yahoo.types.Geo.countryCf },
    adminRef: { value: $data.Yahoo.types.Geo.adminCf },
    localityRef: { value: $data.Yahoo.types.Geo.localityCf },
    postalRef: { value: $data.Yahoo.types.Geo.postalCf },
    boundingBoxRef: { value: $data.Yahoo.types.Geo.boundingBoxCf },

    //Data
    Atom: {
        anonymousResult: true,
        tableName: 'atom',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLAtom", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true }
        }, null)
    },
    Csv: {
        anonymousResult: true,
        tableName: 'csv',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLCsv", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            charset: { type: 'string', searchable: true },
            columns: { type: 'string', searchable: true }
        }, null)
    },
    DataUri: {
        anonymousResult: true,
        tableName: 'data.uri',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLDataUri", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true }
        }, null)
    },
    Feed: {
        anonymousResult: true,
        tableName: 'feed',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLFeed", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true }
        }, null)
    },
    FeedNormalizer: {
        anonymousResult: true,
        tableName: 'feednormalizer',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLFeedNormalizer", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            output: { type: 'string', searchable: true },
            prexslurl: { type: 'string', searchable: true },
            postxslurl: { type: 'string', searchable: true },
            timeout: { type: 'string', searchable: true }
        }, null)
    },
    Html: {
        anonymousResult: true,
        tableName: 'html',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLHtml", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            charset: { type: 'string', searchable: true },
            browser: { type: 'bool', searchable: true },
            xpath: { type: 'string', searchable: true },
            compat: { type: 'string', searchable: true, description: "valid values for compat is 'html5' and 'html4'" },
            Result: { type: 'string', searchable: true }
        }, null)
    },
    Json: {
        anonymousResult: true,
        tableName: 'json',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLJson", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            itemPath: { type: 'string', searchable: true }
        }, null)
    },
    Rss: {
        anonymousResult: false,
        tableName: 'rss',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLRss", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            guid: { type: 'GuidField' },
            title: { type: 'string' },
            description: { type: 'string' },
            link: { type: 'string' },
            pubDate: { type: 'string' }
        }, null)
    },
    GuidField: {
        type: $data.Class.define("GuidField", $data.Entity, null, {
            isPermaLink: { type: 'string' },
            content: { type: 'string' }
        }, null)
    },
    Xml: {
        anonymousResult: true,
        tableName: 'xml',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLXml", $data.Entity, null, {
            url: { type: 'string', required: true, searchable: true },
            itemPath: { type: 'string', searchable: true }
        }, null)
    },
    Xslt: {
        anonymousResult: true,
        tableName: 'xslt',
        resultPath: ["query", "results"],
        resultSkipFirstLevel: true,
        type: $data.EntitySet,
        elementType: $data.Class.define("$data.Yahoo.types.YQLXslt", $data.Entity, null, {
            url: { type: 'string', searchable: true },
            xml: { type: 'string', searchable: true },
            stylesheet: { type: 'string', searchable: true },
            stylesheetliteral: { type: 'string', searchable: true },
            wrapperelement: { type: 'string', searchable: true }
        }, null)
    }

}, null);