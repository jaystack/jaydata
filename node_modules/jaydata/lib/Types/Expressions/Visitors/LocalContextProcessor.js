$C("$data.Expressions.LocalContextProcessor", $data.Expressions.GlobalContextProcessor, null, {
    constructor: function (evalMethod) {
        ///<param name="global" type="object" />
        this.canResolve = function (paramExpression) {
            ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
            return paramExpression.nodeType == $data.Expressions.ExpressionType.Parameter &&
                (evalMethod("typeof " + paramExpression.name) !== 'undefined');
        };
        this.resolve = function(paramExpression) {
            ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
            ///<returns type="$data.Expressions.ExpressionNode" />
            var resultValue = evalMethod(paramExpression.name);
            var expression = Container.createConstantExpression(resultValue, typeof resultValue);
            return expression;
        };

    }
    });
