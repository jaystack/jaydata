import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C('$data.Expressions.AssociationInfoExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (associationInfo) {
        this.associationInfo = associationInfo;
    },
    nodeType: { value: $data.Expressions.ExpressionType.AssociationInfo, enumerable: true }
});

export default $data
