$C('$data.storageProviders.InMemory.InMemoryFunctionCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
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
        if (expression.resolution.reverse) {
            context.data += "(";
            var right = this.Visit(expression.right, context);
            context.data += expression.resolution.mapTo;
            var left = this.Visit(expression.left, context);
            if (expression.resolution.rightValue)
                context.data += expression.resolution.rightValue;
            context.data += ")";
        } else {
            context.data += "(";
            var left = this.Visit(expression.left, context);
            context.data += expression.resolution.mapTo;
            var right = this.Visit(expression.right, context);
            context.data += ")";
        }
    },

    VisitConstantExpression: function (expression, context) {
        var type = Container.resolveType(expression.type);
        var typeName = Container.resolveName(type);
        context.data += this.provider.fieldConverter.toDb[typeName](expression.value);
    },
    VisitMemberInfoExpression: function (expression, context) {
        context.data += expression.memberName;
    },

    VisitComplexTypeExpression: function (expression, context) {
        this.Visit(expression.source, context);
        this.Visit(expression.selector, context);
        context.data += ".";
    },

    VisitEntityExpression: function (expression, context) {
        context.data += expression.selector.lambda + '.';
        context.lambda = expression.selector.lambda;
        this.Visit(expression.source, context);
    },
    VisitEntitySetExpression: function () { },
    VisitObjectLiteralExpression: function (expression, context) {
        context.data += '{ ';

        for (var i = 0; i < expression.members.length; i++) {
            var member = expression.members[i];

            if (i > 0)
                context.data += ', ';

            this.Visit(member, context);
        }

        context.data += ' }';
    },
    VisitObjectFieldExpression: function (expression, context) {
        context.data += expression.fieldName + ': ';
        this.Visit(expression.expression, context);
    }
});