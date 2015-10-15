import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C('$data.Expressions.QueryParameterExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (name, index, value, type) {
        this.name = name;
        this.index = index;
        this.value = value;
        //TODO
        this.type = Container.getTypeName(value);
    },

    nodeType: { value: $data.Expressions.ExpressionType.QueryParameter, writable: false }
});

export default $data
