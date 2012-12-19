$C('$data.Expressions.ContinuationExpressionBuilder', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (mode) {
        this.mode = mode;
    },
    compile: function (query) {

        var findContext = { mode: "find", skipExists: false };
        this.Visit(query.expression, findContext);

        var result = {
            skip: findContext.skipSize,
            take: findContext.pageSize,
            message: ''
        }


        if ('pageSize' in findContext) {
            var expression;
            var context = { mode: this.mode, pageSize: findContext.pageSize };

            if (!findContext.skipExists && (findContext.pageSize)) {
                context.append = true;
                expression = this.Visit(query.expression, context);

            } else if (findContext.skipExists) {
                expression = this.Visit(query.expression, context)
            }

            if (!context.abort) {
                result.expression = expression
            }
            else {
                result.skip = (result.skip || 0) - result.take;
                result.message = 'Invalid skip value!';
            }
        }else{
            result.message = 'take expression not defined in the chain!';
        }

        return result;
    },
    VisitPagingExpression: function (expression, context) {

        switch (context.mode) {
            case 'find':
                if (expression.nodeType === $data.Expressions.ExpressionType.Take) {
                    context.pageSize = expression.amount.value;
                } else {
                    context.skipSize = expression.amount.value;
                    context.skipExists = true;
                }
                break;
            case 'prev':
                if (expression.nodeType === $data.Expressions.ExpressionType.Skip) {
                    var amount = expression.amount.value - context.pageSize;
                    context.abort = amount < 0 && expression.amount.value >= context.pageSize;

                    var constExp = Container.createConstantExpression(Math.max(amount, 0), "number");
                    return Container.createPagingExpression(expression.source, constExp, expression.nodeType);
                } else if (context.append) {
                    //no skip expression, skip: 0, no prev
                    context.abort = true;
                }
                break;
            case 'next':
                if (expression.nodeType === $data.Expressions.ExpressionType.Skip) {
                    var amount = context.pageSize + expression.amount.value;
                    var constExp = Container.createConstantExpression(amount, "number");
                    return Container.createPagingExpression(expression.source, constExp, expression.nodeType);
                } else if (context.append) {
                    //no skip expression, skip: 0
                    var constExp = Container.createConstantExpression(context.pageSize, "number");
                    return Container.createPagingExpression(expression, constExp, $data.Expressions.ExpressionType.Skip);
                }
                break;
            default:
        }

        this.Visit(expression.source, context);
    }
});