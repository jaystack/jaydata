$C('$data.Expressions.FrameOperationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, operation, parameters) {
        this.source = source;
        this.operation = operation;
        this.parameters = parameters;
    },
    nodeType: { value: $data.Expressions.ExpressionType.FrameOperation }

});

$C('$data.Expressions.EntityFunctionOperationExpression', $data.Expressions.FrameOperationExpression, null, {
    nodeType: { value: $data.Expressions.ExpressionType.EntityFunctionOperation }
});

$C('$data.Expressions.ContextFunctionOperationExpression', $data.Expressions.FrameOperationExpression, null, {
    nodeType: { value: $data.Expressions.ExpressionType.ContextFunctionOperation }
});