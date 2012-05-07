$C('$data.sqLite.sqLiteModelBinderCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    VisitParametricQueryExpression: function (expression, context) {
        context.OldActions = context.actions;
        context.OldConverter = context.converter;
        context.converter = [];
        this.Visit(expression.expression, context);
        
        context.actions = context.actionPack;
    },
    VisitEntityFieldExpression: function (expression, context) {
        var efCompiler = Container.createsqLiteEFModelBinderCompiler(expression, context);
        efCompiler.compile(expression, context);
        console.log(context);
    },
    VisitEntityExpression: function (expression, context) {
        var efCompiler = Container.createsqLiteEFModelBinderCompiler(expression, context);
        efCompiler.compile(expression, context);
        console.log(context);
    },
    VisitObjectLiteralExpression: function (expression, context) {
        var efCompiler = Container.createsqLiteOLModelBinderCompiler(expression, context);
        efCompiler.compile(expression, context);
        console.log(context);
    }
});