import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C('$data.Expressions.IncludeExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function (source, selector) {
    },
    nodeType: { value: $data.Expressions.ExpressionType.Include, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);

export default $data
