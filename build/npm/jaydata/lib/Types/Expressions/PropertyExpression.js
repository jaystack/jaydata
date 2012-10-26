$C('$data.Expressions.PropertyExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (expression, member) {
        ///<summary>Represents accessing a property or field of an object</summary>
        ///<param name="expression" type="$data.Expressions.ExpressionNode">The expression for the property owner object</param>
        ///<param name="member" type="$data.Expressions.ConstantExpression">The member descriptor</param>
        ///<field name="expression" type="$data.Expressions.ExpressionNode">The expression for the property owner object</field>
        ///<field name="member" type="$data.Expression.ConstantExpression">The member descriptor</field>

        this.expression = expression;
        this.member = member;

        this.type = member.dataType;
    },

    nodeType: {
        value: $data.Expressions.ExpressionType.MemberAccess
    },

    expression: {
        value: undefined,
        dataType: $data.Expressions.ExpressionNode,
        writable: true
    },

    implementation: {
        get: function () {
            return function (holder, memberName) {
                if (holder[memberName] === undefined)
                    Guard.raise(new Exception("Parameter '" + memberName + "' not found in context", 'Property not found!'));
                return holder[memberName];
            };
        },
        set: function () {
        }
    },

    member: {
        value: undefined,
        dataType: $data.MemberDefinition,
        writable: true
    },

    type: {
        value: undefined,
        writable: true
    },

    toString: function (debug) {
        return this.expression.toString() + "." + this.member.toString();
    }

});
