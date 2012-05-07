$C('$data.oData.oDataModelBinderCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    VisitParametricQueryExpression: function (expression, context) {
        var ctx = {};
        this.Visit(expression.expression, ctx);
        context.actionPack = ctx.actionPack;
    },
    VisitEntityFieldExpression: function (expression, context) {
        var efCompiler = Container.createoDataEFModelBinderCompiler(expression, context);
        efCompiler.compile(expression, context);
    },
    VisitEntityExpression: function (expression, context) {
        var efCompiler = Container.createoDataEFModelBinderCompiler(expression, context);
        efCompiler.compile(expression, context);
    },
    VisitObjectLiteralExpression: function (expression, context) {
        var efCompiler = Container.createoDataOLModelBinderCompiler(expression, context);
        efCompiler.compile(expression, context);
    }
});