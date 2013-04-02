$C('$data.Expressions.ConstantExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (value, type, name) {
        this.value = value;
        //TODO
        //this.type = Container.getTypeName(value);

        this.type = type;
        this.name = name;
        if (!Object.isNullOrUndefined(this.value) && Container.resolveType(Container.getTypeName(this.value)) !== Container.resolveType(this.type))
            this.value = Container.convertTo(value, this.type, true);
    },
    nodeType: { value: $data.Expressions.ExpressionType.Constant, enumerable: true },
    type: { value: Object, writable: true },
    value: { value: undefined, writable: true },
    toString: function (debug) {
        //return "[constant: " + this.value.toString() + "]";
        return this.value.toString();
    }
});


