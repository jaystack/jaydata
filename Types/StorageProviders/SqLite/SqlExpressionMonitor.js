$C('$data.sqLite.SqlExpressionMonitor', $data.Expressions.ExpressionMonitor, null, {
    constructor: function (monitorDefinition) {
        this.VisitIncludeExpression = function (expression, context) {
            var newSourceExpression = this.Visit(expression.source, context);
            monitorDefinition.isMapped = true;
            var newSelectorExpresion = this.Visit(expression.selector, context);
            monitorDefinition.isMapped = false;

            if (newSourceExpression !== expression.source || newSelectorExpresion !== expression.selector) {
                return Container.createIncludeExpression(newSourceExpression, newSelectorExpresion);
            }
            return expression;
        };
        this.VisitProjectionExpression = function (expression, context) {
            var source = this.Visit(expression.source, context);
            monitorDefinition.isMapped = true;
            var selector = this.Visit(expression.selector, context);
            monitorDefinition.isMapped = false;
            if (source !== expression.source || selector !== expression.selector) {
                var expr = Container.createProjectionExpression(source, selector, expression.params, expression.instance);
                expr.projectionAs = expression.projectionAs;
                return expr;
            }
            return expression;
        };
    }

});