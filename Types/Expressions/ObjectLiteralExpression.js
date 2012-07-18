$C('$data.Expressions.ObjectLiteralExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (members) {
        ///<summary>Represent an object initializer literal expression &#10;Ex: { prop: value}</summary>
        ///<param name="member" type="Array" elementType="$data.Expressions.ObjectFieldExpression" />
        this.members = members;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ObjectLiteral, writable: true },

    toString: function (debug) {
        //var result;
        //result = debug ? this.type + " " : "";
        //result = result + this.name;
        var result = "unimplemented";
        return result;
    },

    implementation: {
        get: function () {
            return function(namesAndValues) {
                var result = { };
                namesAndValues.forEach(function(item) {
                    result[item.name] = item.value;
                });
                return result;
            };
        },
        set: function () {
        }
    }

}, null);
