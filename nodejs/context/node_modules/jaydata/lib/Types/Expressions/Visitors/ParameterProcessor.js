$C("$data.Expressions.ParameterProcessor", $data.Expressions.ExpressionVisitor, null, {
    constructor: function () {
        ///<summary>Provides a base class for several ParameterProcessors like GlobalParameterProcessor or LambdaParameterProcessor</summary>
    },

    Visit: function (node, context) {
        if ((node instanceof $data.Expressions.ParameterExpression ||
            node instanceof $data.Expressions.ThisExpression)
            && this.canResolve(node)) {
            var result = this.resolve(node, context);
            if (result !== node)
                result["resolvedBy"] = this.constructor.name;
            return result;
        } else {
            return node;
        }
    },

    canResolve: function (paramExpression) {
        ///<returns type="boolean" />
        Guard.raise("Pure method");
    },
    resolve: function (paramExpression) {
        ///<returns type="XXX" />
        Guard.raise("Pure method");
    }
});