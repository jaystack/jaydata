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
