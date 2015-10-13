$C("$data.Expressions.LambdaParameterProcessor", $data.Expressions.ParameterProcessor, null, {
    constructor: function (lambdaParameterTypeInfos) {
        ///<param name="global" />
        ///<param name="evalMethod" />
        var paramIndices = {};
        var $idx = "name";

        this.canResolve = function (paramExpression, context) {
            if (paramExpression.nodeType == $data.Expressions.ExpressionType.LambdaParameter) {
                var fnParams = paramExpression.owningFunction.parameters;

                if (fnParams.length == 1 && paramExpression.name == fnParams[0].name) {
                    paramIndices[paramExpression.name] = lambdaParameterTypeInfos[0];
                    return true;
                }

                for (var j = 0; j < fnParams.length; j++) {
                    if (fnParams[j].name == paramExpression.name) {
                        paramIndices[paramExpression.name] = lambdaParameterTypeInfos[j];
                        return true;
                    }
                }
                return false;
            }
            return false;
        };

        this.resolve = function(paramExpression, context) {
            var lambdaParamType = paramIndices[paramExpression.name];
            var result = Container.createParameterExpression(paramExpression.name,
                lambdaParamType,
                $data.Expressions.ExpressionType.LambdaParameter);
            result.owningFunction = paramExpression.owningFunction;
            return result;
        };
    }

});
