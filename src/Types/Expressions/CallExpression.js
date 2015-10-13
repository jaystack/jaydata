$C('$data.Expressions.CallExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (expression, member, args) {
        ///<summary>Represents a call to an object or global method</summary>
        ///<field name="object" type="$data.Expressions.ExpressionNode">The expression for object that has the method</field>
        ///<field name="member" type="$data.MemberDefinition">The member descriptor</field>
        this.expression = expression;
        this.member = member;
        this.args = args;
    },

    nodeType: {
        value: $data.Expressions.ExpressionType.Call
    },

    expression: {
        value: undefined,
        dataType: $data.Expressions.ExpressionNode,
        writable: true
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

    implementation: {
        get: function () {
            return function(thisObj, method, args) {
                if (typeof method !== 'function') {
                    method = thisObj[method];
                }
                Guard.requireType("method", method, Function);
                return method.apply(thisObj, args);
            };
        },
        set: function (value) { Guard.raise("Property can not be set"); }
    },

    toString: function (debug) {
        return this.object.toString() + "." + this.member.toString() + "(" + ")";
    }

});
