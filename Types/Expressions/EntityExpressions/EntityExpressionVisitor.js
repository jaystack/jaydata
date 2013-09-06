$C('$data.Expressions.EntityExpressionVisitor', null, null, {

    constructor: function () {
        this.lambdaTypes = [];
    },

    canVisit: function (expression) {
        return expression instanceof $data.Expressions.ExpressionNode;
    },

    Visit: function (expression, context) {
        if (!this.canVisit(expression))
            return expression;

        var visitorName = "Visit" + expression.getType().name;
        if (visitorName in this) {
            var fn = this[visitorName];
            var result = fn.call(this, expression, context);
            if (typeof result === 'undefined') {
                return expression;
            }
            return result;
        }
        //console.log("unhandled expression type:" + expression.getType().name);
        return expression;
    },
    VisitToArrayExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source) {
            return Container.createToArrayExpression(source);
        }
        return expression;
    },
    VisitForEachExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source) {
            return Container.createForEachExpression(source);
        }
        return expression;
    },
    VisitMemberInfoExpression: function (expression, context) {
        return expression;
    },

    VisitSingleExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createSingleExpression(source);
        return expression;
    },

    VisitFirstExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createFirstExpression(source);
        return expression;
    },

    VisitSomeExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createSomeExpression(source);
        return expression;
    },

    VisitFindExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createFindExpression(source);
        return expression;
    },

    VisitEveryExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createEveryExpression(source);
        return expression;
    },

    VisitCountExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source)
            return Container.createCountExpression(source);
        return expression;
    },

    VisitBatchDeleteExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        if (source !== expression.source) {
            return Container.createBatchDeleteExpression(source);
        }
        return expression;
    },

    VisitObjectLiteralExpression: function (expression, context) {
        var newValues = expression.members.map(function (ofe) {
            return this.Visit(ofe, context);
        }, this);
        var equal = true;
        for (var i = 0; i < expression.members.length; i++) {
            equal = equal && (expression.members[i] === newValues[i]);
        }
        if (!equal) {
            return Container.createObjectLiteralExpression(newValues);
        }
        return expression;
    },
    VisitObjectFieldExpression: function (expression, context) {
        var newExpression = this.Visit(expression.expression, context);
        if (expression.expression !== newExpression) {
            return Container.createObjectFieldExpression(expression.fieldName, newExpression);
        }
        return expression;
    },
    VisitIncludeExpression: function (expression, context) {
        var newExpression = this.Visit(expression.source, context);
        if (newExpression !== expression.source) {
            return Container.createIncludeExpression(newExpression, expression.selector);
        }
        return expression;
    },

    VisitUnaryExpression: function(expression, context) {

    	/// <param name="expression" type="$data.Expressions.UnaryExpression"></param>
    	/// <param name="context"></param>
        var operand = this.Visit(expression.operand, context);
        if (expression.operand !== operand) {
            return Container.createUnaryExpression(operand, expression.operator, expression.nodeType, expression.resolution);
        };
        return expression;
    },

    VisitSimpleBinaryExpression: function (expression, context) {
        ///<summary></summary>
        ///<param name="expression" type="$data.Expressions.SimpleBinaryExpression"/>
        ///<param name="context" type="Object"/>
        //<returns type="$data.Expressions.SimpleBinaryExpression"/>
        var left = this.Visit(expression.left, context);
        var right = this.Visit(expression.right, context);
        if (left !== expression.left || right !== expression.right) {
            return new $data.Expressions.SimpleBinaryExpression(left, right, expression.nodeType,
                expression.operator, expression.type, expression.resolution);
        }
        return expression;
    },

    VisitEntityContextExpression: function (expression, context) {
        return expression;
    },

    VisitCodeExpression: function (expression, context) {
        /// <param name="expression" type="$data.Expressions.CodeExpression"></param>
        /// <param name="context"></param>
        /// <returns type="$data.Expressions.CodeExpression"></returns>
        return expression;
    },

    VisitComplexTypeExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            var result = Container.createComplexTypeExpression(source, selector);
            return result;
        }
        return expression;
    },

    VisitEntityExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            var result = Container.createEntityExpression(source, selector);
            return result;
        }
        return expression;
    },

    VisitEntityFieldExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            var result = Container.createEntityFieldExpression(source, selector);
            return result;
        }
        return expression;
    },

    VisitEntityFieldOperationExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var operation = this.Visit(expression.operation, context);
        var parameters = expression.parameters.map(function (p) {
            return this.Visit(p);
        }, this);
        var result = Container.createEntityFieldOperationExpression(source, operation, parameters);
        return result;
    },

    VisitParametricQueryExpression: function (expression, context) {
        var exp = this.Visit(expression.expression, context);
        var args = expression.parameters.map(function (p) {
            return this.Visit(p);
        }, this);
        var result = Container.createParametricQueryExpression(exp, args);
        return result;
    },

    VisitEntitySetExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createEntitySetExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitInlineCountExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createInlineCountExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitFilterExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createFilterExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitProjectionExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            var expr = Container.createProjectionExpression(source, selector, expression.params, expression.instance);
            expr.projectionAs = expression.projectionAs;
            return expr;
        }
        return expression;
    },

    VisitOrderExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createOrderExpression(source, selector, expression.nodeType);
        }
        return expression;
    },
    VisitPagingExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        var amount = this.Visit(expression.amount, context);
        if (source !== expression.source || amount !== expression.amount) {
            return Container.createPagingExpression(source, amount, expression.nodeType);
        }
        return expression;
    }
});
