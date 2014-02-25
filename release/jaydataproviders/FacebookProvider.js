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
$data.FacebookConverter = {
    fromDb: {
        '$data.Byte': $data.Container.proxyConverter,
        '$data.SByte': $data.Container.proxyConverter,
        '$data.Decimal': $data.Container.proxyConverter,
        '$data.Float': $data.Container.proxyConverter,
        '$data.Int16': $data.Container.proxyConverter,
        '$data.Int64': $data.Container.proxyConverter,
        '$data.Number': $data.Container.proxyConverter,
        '$data.Integer': $data.Container.proxyConverter,
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

$data.Class.define('$data.storageProviders.Facebook.FacebookProvider', $data.StorageProviderBase, null,
{
    constructor: function (cfg) {
        var provider = this;
        this.SqlCommands = [];
        this.context = {};
        this.providerConfiguration = $data.typeSystem.extend({
            FQLFormat: "format=json",
            FQLQueryUrl: "https://graph.facebook.com/fql?q=",
            Access_Token: ''
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
                mapTo: "strpos",
                parameters: [{ name: "@expression", dataType: $data.String }, { name: "strFragment", dataType: $data.String }],
                rigthValue: ') >= 0'
            },
            'startsWith': {
                dataType: $data.String,
                allowedIn: $data.Expressions.FilterExpression,
                mapTo: "strpos",
                parameters: [{ name: "@expression", dataType: $data.String }, { name: "strFragment", dataType: $data.String }],
                rigthValue: ') = 0'
            },
            'strpos': {
                dataType: $data.Integer,
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                mapTo: "strpos",
                parameters: [{ name: "@expression", dataType: $data.String }, { name: "strFragment", dataType: $data.String }]
            },
            'substr': {
                dataType: $data.String,
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                mapTo: "substr",
                parameters: [{ name: "@expression", dataType: $data.String }, { name: "startIdx", dataType: $data.Number }, { name: "length", dataType: $data.Number }]
            },
            'strlen': {
                dataType: $data.Integer,
                allowedIn: [$data.Expressions.FilterExpression, $data.Expressions.ProjectionExpression],
                mapTo: "strlen",
                parameters: [{ name: "@expression", dataType: $data.String }]
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
            and: { mapTo: ' AND ', dataType: $data.Booleanv },
            'in': { mapTo: ' IN ', dataType: $data.Boolean, resolvableType: [$data.Array, $data.Queryable], allowedIn: $data.Expressions.FilterExpression }
        }
    },
    supportedUnaryOperators: {
        value: {}
    },
    fieldConverter: { value: $data.FacebookConverter },
    supportedSetOperations: {
        value: {
            filter: {},
            length: {},
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
    executeQuery: function (query, callBack) {
        callBack = $data.typeSystem.createCallbackSetting(callBack);

        if (!this.AuthenticationProvider)
            this.AuthenticationProvider = new $data.Authentication.Anonymous({});

        var sql;
        try {
            sql = this._compile(query);
        } catch (e) {
            callBack.error(e);
            return;
        }

        var schema = query.defaultType;
        var ctx = this.context;

        var includes = [];
        if (!sql.selectMapping)
            this._discoverType('', schema, includes);

        var requestUrl = this.providerConfiguration.FQLQueryUrl + encodeURIComponent(sql.queryText) + "&" + this.providerConfiguration.FQLFormat;
        if (this.providerConfiguration.Access_Token) {
            requestUrl += '&access_token=' + this.providerConfiguration.Access_Token;
        }

        var requestData = {
            url: requestUrl,
            dataType: "JSON",
            success: function (data, textStatus, jqXHR) {
                query.rawDataList = data.data;
                var compiler = Container.createModelBinderConfigCompiler(query, []);
                compiler.Visit(query.expression);

                if (query.expression instanceof $data.Expressions.CountExpression) {
                    query.rawDataList = [{ cnt: data.data.length }];
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
    _discoverType: function (dept, type, result) {
        type.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            var type = Container.resolveType(memDef.dataType);

            if (type.isAssignableTo || type == Array) {
                var name = dept ? (dept + '.' + memDef.name) : memDef.name;

                if (type == Array || type.isAssignableTo($data.EntitySet)) {
                    if (memDef.inverseProperty)
                        type = Container.resolveType(memDef.elementType);
                    else
                        return;
                }

                result.push({ name: name, type: type })
                this._discoverType(name, type, result);
            }
        }, this);
    },
    _compile: function (query) {
        var sqlText = Container.createFacebookCompiler().compile(query);
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
        Guard.raise(new Exception("Not implemented", "Not implemented"));
    }
}, null);

$data.StorageProviderBase.registerProvider("Facebook", $data.storageProviders.Facebook.FacebookProvider);

//"use strict";	// suspicious code

$C('$data.storageProviders.Facebook.FacebookCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function () {
        this.provider = {};
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

        var autoGeneratedSelect = false;
        if (!context.projectionSql.sql) {
            context.projectionSql = this.autoGenerateProjection(query);
            autoGeneratedSelect = true;
        }

        if (context.filterSql.sql == '')
            Guard.raise(new Exception('Filter/where statement is required', 'invalid operation'));

        return {
            queryText: context.projectionSql.sql + ' FROM ' + context.tableName +
                context.filterSql.sql +
                context.orderSql.sql +
                context.takeSql.sql +
                (context.takeSql.sql ? context.skipSql.sql : ''),
            selectMapping: autoGeneratedSelect == false ? context.projectionSql.selectFields : null,
            params: []
        };

    },

    autoGenerateProjection: function (query) {
        var entitySet = query.context.getEntitySetFromElementType(query.defaultType);
        var newQueryable = new $data.Queryable(query.context, entitySet.expression);
        //newQueryable._checkRootExpression(entitySet.collectionName);
        var codeExpression = Container.createCodeExpression(this.generateProjectionFunc(query));
        var exp = Container.createProjectionExpression(newQueryable.expression, codeExpression);
        var q = Container.createQueryable(newQueryable, exp);

        var expression = q.expression;
        var preparator = Container.createQueryExpressionCreator(query.context);
        expression = preparator.Visit(expression);

        var databaseQuery = {
            projectionSql: { sql: '' }
        };
        this.Visit(expression, databaseQuery);

        return databaseQuery.projectionSql;
    },
    generateProjectionFunc: function (query) {
        var isAuthenticated = this.provider.AuthenticationProvider.Authenticated || this.provider.providerConfiguration.Access_Token;
        var publicMemberDefinitions = query.defaultType.memberDefinitions.getPublicMappedProperties();
        if (!isAuthenticated && publicMemberDefinitions.some(function (memDef) { return memDef.isPublic == true; })) {
            publicMemberDefinitions = publicMemberDefinitions.filter(function (memDef) { return memDef.isPublic == true; });
        }

        var selectStr = 'function (s){ return {';
        publicMemberDefinitions.forEach(function (memDef, i) {
            if (i != 0) selectStr += ', ';
            selectStr += memDef.name + ': s.' + memDef.name;
        });
        selectStr += '}; }';

        //var projectionFunc = null;
        //eval(selectStr);
        return selectStr;
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
            Guard.raise(new Exception('Multiple select error'));

        this.Visit(expression.selector, context.projectionSql);
    },
    VisitOrderExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.OrderExpression" />
        this.Visit(expression.source, context);

        context.orderSql.type = expression.nodeType;
        if (context.orderSql.sql == '')
            context.orderSql.sql = ' ORDER BY ';
        else
            Guard.raise(new Exception('Multiple sorting not supported', 'not supported'));

        this.Visit(expression.selector, context.orderSql);
        context.orderSql.sql += expression.nodeType == $data.Expressions.ExpressionType.OrderByDescending ? " DESC" : " ASC";
    },
    VisitPagingExpression: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.PagingExpression" />
        this.Visit(expression.source, context);

        if (expression.nodeType == $data.Expressions.ExpressionType.Skip) {
            context.skipSql.type = expression.nodeType;
            context.skipSql.sql = ' OFFSET ';
            this.Visit(expression.amount, context.skipSql);
        }
        else if (expression.nodeType == $data.Expressions.ExpressionType.Take) {
            context.takeSql.type = expression.nodeType;
            context.takeSql.sql = ' LIMIT ';
            this.Visit(expression.amount, context.takeSql);
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
        var source = this.Visit(expression.selector, context);
    },
    VisitMemberInfoExpression: function (expression, context) {
        var memberName = expression.memberName;
        context.sql += memberName;
        //context.fieldName = memberName;
        context.fieldData = { name: memberName, dataType: expression.memberDefinition.dataType };

        if (context.type == 'Projection' && !context.selectFields) {
            if (context.fieldOperation === true)
                context.selectFields = [{ from: 'anon' }];
            else
                context.selectFields = [{ from: memberName, dataType: expression.memberDefinition.dataType }];
        }
    },

    VisitConstantExpression: function (expression, context) {
        if (context.type == 'Projection')
            Guard.raise(new Exception('Constant value is not supported in Projection.', 'Not supported!'));

        this.VisitQueryParameterExpression(expression, context);
    },

    VisitQueryParameterExpression: function (expression, context) {
        if (expression.value instanceof $data.storageProviders.Facebook.EntitySets.Command) {
            context.sql += "" + expression.value + "";
        } else if (expression.value instanceof $data.Queryable) {
            context.sql += '(' + expression.value.toTraceString().queryText + ')';
        } else {
            var expressionValueType = Container.resolveType(expression.type);
            if (this.provider.supportedDataTypes.indexOf(expressionValueType) != -1)
                context.sql += this.provider.fieldConverter.toDb[Container.resolveName(expressionValueType)](expression.value);
            else {
              context.sql += "" + expression.value + "";
            }
        }
    },

    VisitParametricQueryExpression: function (expression, context) {
        var exp = this.Visit(expression.expression, context);
        context.parameters = expression.parameters;
    },

    VisitEntitySetExpression: function (expression, context) {
        context.tableName = expression.instance.tableName;
    },

    VisitObjectLiteralExpression: function (expression, context) {
        var self = this;
        context.selectFields = context.selectFields || [];
        expression.members.forEach(function (member) {
            if (member.expression instanceof $data.Expressions.ObjectLiteralExpression) {
                context.mappingPrefix = context.mappingPrefix || [];
                context.mappingPrefix.push(member.fieldName);
                self.Visit(member, context);
                context.mappingPrefix.pop();
            }
            else {
                if (context.selectFields.length > 0)
                    context.sql += ', ';

                self.Visit(member, context);
                var toProperty = context.mappingPrefix instanceof Array ? context.mappingPrefix.join('.') + '.' + member.fieldName : member.fieldName;
                context.selectFields.push({ from: context.fieldData.name, to: toProperty, dataType: context.fieldData.dataType });
            }
        });
    },
    VisitObjectFieldExpression: function (expression, context) {
        return this.Visit(expression.expression, context);
    },

    VisitEntityFieldOperationExpression: function (expression, context) {
        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);

        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;

        context.sql += '(';

        if (opDef.expressionInParameter == false)
            this.Visit(expression.source, context);

        context.sql += opName;
        context.sql += "(";
        var paramCounter = 0;
        var params = opDef.parameters || [];

        var args = params.map(function (item, index) {
            var result = { dataType: item.dataType };
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

                if (context.type == 'Projection')
                    context.fieldOperation = true;

                this.Visit(arg.value, context);

                if (context.type == 'Projection')
                    context.fieldOperation = undefined;

            } else
                Guard.raise(new Exception(arg.dataType + " not allowed in '" + expression.operation.memberName + "' statement", "invalid operation"));
        }, this);

        if (context.fieldData && context.fieldData.name)
            context.fieldData.name = 'anon';

        if (opDef.rigthValue) context.sql += opDef.rigthValue;
        else context.sql += ")";

        context.sql += ')';
    }
}, null);


$data.Class.define("$data.Facebook.types.FbUser", $data.Entity, null, {
    uid: { type: "number", key: true, isPublic: true, searchable: true },
    username: { type: "string", isPublic: true, searchable: true },
    first_name: { type: "string", isPublic: true },
    middle_name: { type: "string", isPublic: true },
    last_name: { type: "string", isPublic: true },
    name: { type: "string", isPublic: true, searchable: true },
    pic_small: { type: "string" },
    pic_big: { type: "string" },
    pic_square: { type: "string" },
    pic: { type: "string" },
    affiliations: { type: "Array", elementType: "Object" },
    profile_update_time: { type: "datetime" },
    timezone: { type: "number" },
    religion: { type: "string" },
    birthday: { type: "string" },
    birthday_date: { type: "string" },
    sex: { type: "string", isPublic: true },
    hometown_location: { type: "Array", elementType: "Object" },
    meeting_sex: { type: "Array", elementType: "Object" },
    meeting_for: { type: "Array", elementType: "Object" },
    relationship_status: { type: "string" },
    significant_other_id: { type: "number" /*uid*/ },
    political: { type: "string" },
    current_location: { type: "Array", elementType: "Object" },
    activities: { type: "string" },
    interests: { type: "string" },
    is_app_user: { type: "bool" },
    music: { type: "string" },
    tv: { type: "string" },
    movies: { type: "string" },
    books: { type: "string" },
    quotes: { type: "string" },
    about_me: { type: "string" },
    hs_info: { type: "Array", elementType: "Object" },
    education_history: { type: "Array", elementType: "Object" },
    work_history: { type: "Array", elementType: "Object" },
    notes_count: { type: "number" },
    wall_count: { type: "number" },
    status: { type: "string" },
    has_added_app: { type: "bool" },
    online_presence: { type: "string" },
    locale: { type: "string", isPublic: true },
    proxied_email: { type: "string" },
    profile_url: { type: "string" },
    email_hashes: { type: "Array", elementType: "Object" },
    pic_small_with_logo: { type: "string", isPublic: true },
    pic_big_with_logo: { type: "string", isPublic: true },
    pic_square_with_logo: { type: "string", isPublic: true },
    pic_with_logo: { type: "string", isPublic: true },
    allowed_restrictions: { type: "string" },
    verified: { type: "bool" },
    profile_blurb: { type: "string" },
    family: { type: "Array", elementType: "Object" },
    website: { type: "string" },
    is_blocked: { type: "bool" },
    contact_email: { type: "string" },
    email: { type: "string" },
    third_party_id: { type: "string", searchable: true },
    name_format: { type: "string" },
    video_upload_limits: { type: "Array", elementType: "Object" },
    games: { type: "string" },
    work: { type: "Array", elementType: "Object" },
    education: { type: "Array", elementType: "Object" },
    sports: { type: "Array", elementType: "Object" },
    favorite_athletes: { type: "Array", elementType: "Object" },
    favorite_teams: { type: "Array", elementType: "Object" },
    inspirational_people: { type: "Array", elementType: "Object" },
    languages: { type: "Array", elementType: "Object" },
    likes_count: { type: "number" },
    friend_count: { type: "number" },
    mutual_friend_count: { type: "number" },
    can_post: { type: "bool" }
}, null)

$data.Class.define("$data.Facebook.types.FbFriend", $data.Entity, null, {
    uid1: { type: "number", key: true, searchable: true },
    uid2: { type: "number", key: true, searchable: true }
}, null);
$data.Class.define("$data.Facebook.types.FbPage", $data.Entity, null, {
    page_id: { type: "number", key: true, isPublic: true, searchable: true },
    name: { type: "string", isPublic: true, searchable: true },
    username: { type: "string", isPublic: true, searchable: true },
    description: { type: "string", isPublic: true },
    categories: { type: "array", isPublic: true },	//array	The categories
    is_community_page: { type: "bool", isPublic: true },	//string	Indicates whether the Page is a community Page.
    pic_small: { type: "string", isPublic: true },
    pic_big: { type: "string", isPublic: true },
    pic_square: { type: "string", isPublic: true },
    pic: { type: "string", isPublic: true },
    pic_large: { type: "string", isPublic: true },
    pic_cover: { type: "object", isPublic: true },	//object	The JSON object containing three fields: cover_id (the ID of the cover photo), source (the URL for the cover photo), andoffset_y (indicating percentage offset from top [0-100])
    unread_notif_count: { type: "number", isPublic: false },
    new_like_count: { type: "number", isPublic: false },
    fan_count: { type: "number", isPublic: true },
    type: { type: "string", isPublic: true },
    website: { type: "string", isPublic: true },
    has_added_app: { type: "bool", isPublic: true },
    general_info: { type: "string", isPublic: true },
    can_post: { type: "bool", isPublic: true },
    checkins: { type: "number", isPublic: true },
    is_published: { type: "bool", isPublic: true },
    founded: { type: "string", isPublic: true },
    company_overview: { type: "string", isPublic: true },
    mission: { type: "string", isPublic: true },
    products: { type: "string", isPublic: true },
    location: { type: "object", isPublic: true }, //	array	Applicable to all Places.
    parking: { type: "object", isPublic: true }, //     array	Applicable to Businesses and Places. Can be one of street, lot orvalet
    hours: { type: "array", isPublic: true }, //	array	Applicable to Businesses and Places.
    pharma_safety_info: { type: "string", isPublic: true },
    public_transit: { type: "string", isPublic: true },
    attire: { type: "string", isPublic: true },
    payment_options: { type: "object", isPublic: true },	//array	Applicable to Restaurants or Nightlife.
    culinary_team: { type: "string", isPublic: true },
    general_manager: { type: "string", isPublic: true },
    price_range: { type: "string", isPublic: true },
    restaurant_services: { type: "object", isPublic: true },//	array	Applicable to Restaurants.
    restaurant_specialties: { type: "object", isPublic: true },//	array	Applicable to Restaurants.
    phone: { type: "string", isPublic: true },
    release_date: { type: "string", isPublic: true },
    genre: { type: "string", isPublic: true },
    starring: { type: "string", isPublic: true },
    screenplay_by: { type: "string", isPublic: true },
    directed_by: { type: "string", isPublic: true },
    produced_by: { type: "string", isPublic: true },
    studio: { type: "string", isPublic: true },
    awards: { type: "string", isPublic: true },
    plot_outline: { type: "string", isPublic: true },
    season: { type: "string", isPublic: true },
    network: { type: "string", isPublic: true },
    schedule: { type: "string", isPublic: true },
    written_by: { type: "string", isPublic: true },
    band_members: { type: "string", isPublic: true },
    hometown: { type: "string", isPublic: true },
    current_location: { type: "string", isPublic: true },
    record_label: { type: "string", isPublic: true },
    booking_agent: { type: "string", isPublic: true },
    press_contact: { type: "string", isPublic: true },
    artists_we_like: { type: "string", isPublic: true },
    influences: { type: "string", isPublic: true },
    band_interests: { type: "string", isPublic: true },
    bio: { type: "string", isPublic: true },
    affiliation: { type: "string", isPublic: true },
    birthday: { type: "string", isPublic: true },
    personal_info: { type: "string", isPublic: true },
    personal_interests: { type: "string", isPublic: true },
    built: { type: "string", isPublic: true },
    features: { type: "string", isPublic: true },
    mpg: { type: "string", isPublic: true }
}, null);

$data.Class.define('$data.storageProviders.Facebook.EntitySets.Command', null, null, {
    constructor: function (cfg) {
        this.Config = $data.typeSystem.extend({
            CommandValue: ""
        }, cfg);
    },
    toString: function () {
        return this.Config.CommandValue;
    },
    Config: {}
}, {
    'to$data.Integer': function (value) {
        return value;
    },
    'to$data.Number': function (value) {
        return value;
    }
});

$data.Class.define("$data.Facebook.FQLContext", $data.EntityContext, null, {
    constructor: function(){
        var friendsQuery = this.Friends
                .where(function (f) { return f.uid1 == this.me; }, { me: $data.Facebook.FQLCommands.me })
                .select(function (f) { return f.uid2; });

        this.MyFriends = this.Users
                .where(function (u) { return u.uid in this.friends; }, { friends: friendsQuery });
    },
    Users: {
        dataType: $data.EntitySet,
        tableName: 'user',
        elementType: $data.Facebook.types.FbUser
    },
    Friends: {
        dataType: $data.EntitySet,
        tableName: 'friend',
        elementType: $data.Facebook.types.FbFriend
    },
    Pages: {
        dataType: $data.EntitySet,
        tableName: 'page',
        elementType: $data.Facebook.types.FbPage
    }
}, null);

$data.Facebook.FQLCommands = {
    __namespace: true,
    me: new $data.storageProviders.Facebook.EntitySets.Command({ CommandValue: "me()" }),
    now: new $data.storageProviders.Facebook.EntitySets.Command({ CommandValue: "now()" })
};


