import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

$C('$data.Expressions.DistinctExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function constructor(source, expression, nType) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        this.source = source;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Distinct },
    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);

export default $data