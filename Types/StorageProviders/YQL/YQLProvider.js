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
