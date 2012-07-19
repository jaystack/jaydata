$C('$data.sqLite.SqlOrderCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },
    compile: function (expression, sqlBuilder) {
        this.Visit(expression, sqlBuilder);
    },
    VisitEntitySetExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntitySetExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>

        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
    },
    VisitOrderExpression: function (expression, sqlBuilder) {
        this.Visit(expression.selector, sqlBuilder);
        if (expression.nodeType == $data.Expressions.ExpressionType.OrderByDescending) {
            sqlBuilder.addText(" DESC");
        } else {
            sqlBuilder.addText(" ASC");
        }
    },
    VisitParametricQueryExpression: function (expression, sqlBuilder) {
        this.Visit(expression.expression, sqlBuilder);
    },
    VisitEntityFieldExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
    },
    VisitMemberInfoExpression: function (expression, sqlBuilder) {
        sqlBuilder.addText(expression.memberName);
    },
    VisitComplexTypeExpression: function (expression, sqlBuilder) { 
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
        sqlBuilder.addText('__');
    }
});
