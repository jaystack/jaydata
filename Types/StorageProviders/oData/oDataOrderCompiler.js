$C('$data.storageProviders.oData.oDataOrderCompiler', $data.storageProviders.oData.oDataWhereCompiler, null, {
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
    VisitEntityFunctionOperationExpression: function (expression, context) {
        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);
        this.Visit(expression.source, context);

        //TODO refactor!
        var opDef = expression.operation.memberDefinition;
        var opName = opDef.mapTo || opDef.name;
        context.data += opName;
        context.data += "(";
        var paramCounter = 0;
        var params = opDef.method.params || [{ name: "@expression" }];

        var exprParams = [];
        var definedParams = expression.operation.memberDefinition.method.params;
        if (expression.parameters && expression.parameters[0] &&
            expression.parameters[0].value && typeof expression.parameters[0].value === 'object' && expression.parameters[0].value.constructor === $data.Object && definedParams && definedParams[0] &&
            (Container.resolveType(definedParams[0].type) !== $data.Object || definedParams[0].name in expression.parameters[0].value)) {

            if (expression.parameters[0] instanceof $data.Expressions.ObjectLiteralExpression) {
                exprParams = expression.parameters[0].members.map(function (ofe) { return ofe.expression });
                params = expression.parameters[0].members.map(function (ofe) { return { name: ofe.fieldName } });
            } else if (expression.parameters[0] instanceof $data.Expressions.ConstantExpression) {
                params.forEach(function (p) {
                    exprParams.push(Container.createConstantExpression(expression.parameters[0].value[p.name], Container.resolveType(p.type), p.name));
                });
            }
        } else {
            exprParams = expression.parameters;
        }

        var args = params.map(function (item, index) {
            if (item.name === "@expression") {
                return expression.source;
            } else {
                return exprParams[paramCounter++]
            };
        });

        var i = 0;
        args.forEach(function (arg, index) {
            if (arg === undefined || (arg instanceof $data.Expressions.ConstantExpression && typeof arg.value === 'undefined'))
                return;

            if (i > 0) {
                context.data += ",";
            };
            i++;
            context.data += params[index].name + '=';
            this.Visit(arg, context);
        }, this);
        context.data += ")";
    },
    VisitContextFunctionOperationExpression: function (expression, context) {
        return this.VisitEntityFunctionOperationExpression(expression, context);
    }
});
