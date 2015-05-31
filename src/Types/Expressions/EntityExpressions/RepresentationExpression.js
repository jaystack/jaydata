$C('$data.Expressions.RepresentationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (kind) {
    },

    getMemberDefinition: function (name) {
        return this.entityType.getMemberDefinition(name);
    },

    nodeType: { value: $data.Expressions.ExpressionType.Entity }
});

