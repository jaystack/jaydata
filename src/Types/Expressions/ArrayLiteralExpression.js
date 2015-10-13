$C('$data.Expressions.ArrayLiteralExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (items) {
        ///<param name="name" type="string" />
        ///<field name="name" type="string" />
        ///<field name="items" type="Array" elementType="$data.Expression.ExpressionNode" />
        this.items = items || [];
    },
    nodeType: { value: $data.Expressions.ExpressionType.ArrayLiteral, writable: true },

    items: { value: undefined, dataType: Array, elementType: $data.Expressions.ExpressionNode },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        ///<var nam
        var result = "[" + this.items.map(function (item) { return item.toString(); }).join(",") + "]";
        return result;
    }
}, null);

