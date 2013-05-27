$C('$data.Expressions.ParametricQueryExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (expression, parameters) {
        this.expression = expression;
        this.parameters = parameters || [];
    },
    nodeType: { value: $data.Expressions.ExpressionType.ParametricQuery, enumerable: true }
});