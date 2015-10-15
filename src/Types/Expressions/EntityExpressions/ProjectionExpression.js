import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C('$data.Expressions.ProjectionExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function (source, selector, params, instance) {

    },
    nodeType: { value: $data.Expressions.ExpressionType.Projection, enumerable: true }

});

export default $data
