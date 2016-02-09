import $data, { $C, Guard, Container, Exception } from '../../../TypeSystem/index.js';

$C("$data.Expressions.GlobalContextProcessor", $data.Expressions.ParameterProcessor, null, {
    constructor: function (global) {
        ///<param name="global" type="object" />
        this.global = global;
    },

    canResolve: function (paramExpression) {
        ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
        return (paramExpression.nodeType == $data.Expressions.ExpressionType.Parameter || ($data.defaults.parameterResolutionCompatibility && paramExpression.nodeType == $data.Expressions.ExpressionType.ParameterReference)) && 
               this.global && typeof this.global === 'object' &&
               paramExpression.name in this.global;
    },

    resolve: function (paramExpression) {
        ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
        ///<returns type="$data.Expressions.ExpressionNode" />
        var resultValue = this.global[paramExpression.name];
        var expression = Container.createConstantExpression(resultValue, typeof resultValue, paramExpression.name);
        return expression;
    }

});



$C("$data.Expressions.ConstantValueResolver", $data.Expressions.ParameterProcessor, null, {
    constructor: function (paramsObject, global, scopeContext) {
        ///<param name="global" type="object" />
        this.globalResolver = Container.createGlobalContextProcessor(global);
        this.paramResolver = Container.createGlobalContextProcessor(paramsObject);
        this.paramsObject = paramsObject;
        this.scopeContext = scopeContext;
    },

    canResolve: function (paramExpression) {
        ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
        if($data.defaults.parameterResolutionCompatibility){
            return (paramExpression.name === '$context') || (paramExpression.nodeType == $data.Expressions.ExpressionType.This && this.paramsObject)
                    ? true : (this.paramResolver.canResolve(paramExpression) || this.globalResolver.canResolve(paramExpression));
        }
        return (paramExpression.name === '$context') ? true : this.paramResolver.canResolve(paramExpression);
    },

    resolve: function (paramExpression) {
        ///<param name="paramExpression" type="$data.Expressions.ParameterExpression" />
        ///<returns type="$data.Expressions.ExpressionNode" />
        if (paramExpression.name === '$context') {
            return Container.createEntityContextExpression(this.scopeContext);
        }
        if ($data.defaults.parameterResolutionCompatibility) {
            if (paramExpression.nodeType == $data.Expressions.ExpressionType.This) {
                return Container.createConstantExpression(this.paramsObject, typeof this.paramsObject, 'this');
            }
            return this.paramResolver.canResolve(paramExpression) ? this.paramResolver.resolve(paramExpression) : this.globalResolver.resolve(paramExpression);
        }
        return this.paramResolver.resolve(paramExpression);
    }

});

export default $data
