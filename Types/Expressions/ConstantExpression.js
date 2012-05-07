$C('$data.Expressions.ConstantExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (value, type, name) {
        this.value = value;
        //TODO
        this.type = Container.getTypeName(value);
        this.name = name;
    },
    nodeType: { value: ExpressionType.Constant, enumerable: true },
    type: { value: Object, writable: true },
    value: { value: undefined, writable: true },
    toString: function (debug) {
        //return "[constant: " + this.value.toString() + "]";
        return this.value.toString();
    }
});


