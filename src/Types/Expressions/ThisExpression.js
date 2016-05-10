import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

$C('$data.Expressions.ThisExpression', $data.Expressions.ExpressionNode, null, {
    nodeType: { value: $data.Expressions.ExpressionType.This }
});

export default $data
