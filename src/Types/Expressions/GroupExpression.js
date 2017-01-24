import $data, { $C, Guard, Container, Exception } from '../../TypeSystem/index.js';

$C('$data.Expressions.GroupExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function constructor(source, expression) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        //this.source = source;
        //this.selector = expression;
    },
    nodeType: { value: $data.Expressions.ExpressionType.GroupBy, enumerable: true },
    toString: function toString(debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);

export default $data