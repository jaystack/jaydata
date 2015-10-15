import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C('$data.Expressions.EntityFieldOperationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, operation, parameters) {
        this.source = source;
        this.operation = operation;
        this.parameters = parameters;
    },
    nodeType: { value: $data.Expressions.ExpressionType.EntityFieldOperation }

});

export default $data
