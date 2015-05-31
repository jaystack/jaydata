$C('$data.Expressions.PagingExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, expression, nType) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        this.source = source;
        this.amount = expression;
        this.nodeType = nType;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Unknown, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    }
}, null);
