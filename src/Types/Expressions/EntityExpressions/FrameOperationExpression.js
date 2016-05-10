import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C('$data.Expressions.FrameOperationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, operation, parameters) {
        this.source = source;
        this.operation = operation;
        this.parameters = parameters;
        
        switch (true) {
            case this.source instanceof $data.Expressions.EntitySetExpression:
            case this.source instanceof $data.Expressions.FrameOperationExpression:
                this.elementType = this.source.elementType;
                this.storageModel = this.source.storageModel;
                break;
        }
    },
    nodeType: { value: $data.Expressions.ExpressionType.FrameOperation }

});

$C('$data.Expressions.EntityFunctionOperationExpression', $data.Expressions.FrameOperationExpression, null, {
    nodeType: { value: $data.Expressions.ExpressionType.EntityFunctionOperation }
});

$C('$data.Expressions.ContextFunctionOperationExpression', $data.Expressions.FrameOperationExpression, null, {
    nodeType: { value: $data.Expressions.ExpressionType.ContextFunctionOperation }
});

export default $data
