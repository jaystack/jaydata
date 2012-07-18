
$C('$data.Expressions.SimpleBinaryExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (left, right, nodeType, operator, type, resolution) {
        ///<summary>Represents a bin operation with left and right operands and an operator///</summary>
        ///<param name="left" type="$data.Expression.ExpressionNode">The left element of the binary operation</param>
        ///<param name="right" type="$data.Expression.ExpressionNode">The right element of the binary operation</param>
        ///<field name="implementation" type="function" />
        this.left = left;
        this.right = right;
        this.nodeType = nodeType;
        this.operator = operator;
        this.type = type;
        this.resolution = resolution;
    },

    implementation: {
        get: function () {
            return $data.binaryOperators.getOperator(this.operator).implementation;
        },
        set: function () { }

    },
    //nodeType: { value: $data.Expressions.ExpressionType },
    type: { value: "number", writable: true }
});
