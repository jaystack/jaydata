$C('$data.storageProviders.oData.oDataPagingCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },

    compile: function (expression, context) {
        this.Visit(expression, context);
    },
    VisitPagingExpression: function (expression, context) {
        var pagingContext = { data: "" };
        this.Visit(expression.amount, pagingContext);
        switch (expression.nodeType) {
            case $data.Expressions.ExpressionType.Skip: context['$skip'] = pagingContext.data; break;
            case $data.Expressions.ExpressionType.Take: context['$top'] = pagingContext.data; break;
            default: Guard.raise("Not supported nodeType"); break;
        }
    },
    VisitConstantExpression: function (expression, context) {
        var typeName = Container.resolveName(expression.type);
        var converter = this.provider.fieldConverter.escape[typeName];
        context.data += converter ? converter(expression.value) : expression.value;
    }
});
