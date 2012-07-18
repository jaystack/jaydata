$C('$data.Expressions.ObjectFieldExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (fieldName, expression) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        this.fieldName = fieldName;
        this.expression = expression;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ObjectField, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);

