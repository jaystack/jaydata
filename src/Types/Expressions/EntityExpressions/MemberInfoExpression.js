import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C('$data.Expressions.MemberInfoExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (memberDefinition) {
        this.memberDefinition = memberDefinition;
        this.memberName = memberDefinition.name;
    },
    nodeType: { value: $data.Expressions.ExpressionType.MemberInfo, enumerable: true }

});

export default $data
