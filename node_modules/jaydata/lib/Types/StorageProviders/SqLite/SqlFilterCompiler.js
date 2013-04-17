$C('$data.sqLite.SqlFilterCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    VisitParametricQueryExpression: function (expression, sqlBuilder) {
        this.Visit(expression.expression, sqlBuilder);
    },

    VisitUnaryExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
            sqlBuilder.addText(expression.resolution.mapTo);
            sqlBuilder.addText(SqlStatementBlocks.beginGroup);
            this.Visit(expression.operand, sqlBuilder);
            sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },

    VisitSimpleBinaryExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
        var self = this;

        if (expression.nodeType == "arrayIndex") {
            this.Visit(expression.left, sqlBuilder);
        } else {
            sqlBuilder.addText(SqlStatementBlocks.beginGroup);

            //check null filter
            if (expression.left instanceof $data.Expressions.EntityFieldExpression && expression.right instanceof $data.Expressions.ConstantExpression && expression.right.value === null) {
                this.Visit(expression.left, sqlBuilder);
                sqlBuilder.addText(expression.resolution.nullMap);
            } else if (expression.right instanceof $data.Expressions.EntityFieldExpression && expression.left instanceof $data.Expressions.ConstantExpression && expression.left.value === null) {
                this.Visit(expression.right, sqlBuilder);
                sqlBuilder.addText(expression.resolution.nullMap);
            } else {
                this.Visit(expression.left, sqlBuilder);
                sqlBuilder.addText(" " + expression.resolution.mapTo + " ");

                if (expression.nodeType == "in") {
                    //TODO: refactor and generalize
                    Guard.requireType("expression.right", expression.right, $data.Expressions.ConstantExpression);
                    var set = expression.right.value;
                    if (set instanceof Array) {
                        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
                        set.forEach(function (item, i) {
                            if (i > 0) sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                            self.Visit(item, sqlBuilder);
                        });
                        sqlBuilder.addText(SqlStatementBlocks.endGroup);
                    } else if (set instanceof $data.Queryable) {
                        sqlBuilder.addText("(SELECT d FROM (" + set.toTraceString().sqlText + "))");
                        //Guard.raise("Not yet... but coming!");
                    } else {
                        Guard.raise(new Exception("Only constant arrays and Queryables can be on the right side of 'in' operator", "UnsupportedType"));
                    };
                } else {
                    this.Visit(expression.right, sqlBuilder);
                }
            }
            
            sqlBuilder.addText(SqlStatementBlocks.endGroup);
        }
    },

    VisitEntitySetExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntitySetExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>

        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
    },
    VisitEntityFieldOperationExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntityFieldOperationExpression"></param>
        /// <param name="sqlBuilder"></param>

        //this.Visit(expression.operation);

        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);
        var opDefinition = expression.operation.memberDefinition;
        var opName = opDefinition.mapTo || opDefinition.name;

        sqlBuilder.addText(opName);
        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
        if (opName === "like") {
            var builder = $data.sqLite.SqlBuilder.create([], sqlBuilder.entityContext);
            builder.selectTextPart("fragment");
            this.Visit(expression.parameters[0], builder);
            var fragment = builder.getTextPart("fragment");
            fragment.params.forEach(function (p) {
                var v = p;
                var paramDef = opDefinition.parameters[0];
                var v = paramDef.prefix ? paramDef.prefix + v : v;
                v = paramDef.suffix ? v + paramDef.suffix : v;
                sqlBuilder.addParameter(v);
            });
            sqlBuilder.addText(fragment.text);
            sqlBuilder.addText(" , ");
            this.Visit(expression.source, sqlBuilder);
        } else {
            this.Visit(expression.source, sqlBuilder);
            expression.parameters.forEach(function (p) {
                sqlBuilder.addText(" , ");
                this.Visit(p, sqlBuilder);
            }, this);
        };

        sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },
    VisitMemberInfoExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.MemberInfoExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>

        sqlBuilder.addText(expression.memberName);
    },
    VisitQueryParameterExpression: function (expression, sqlBuilder) {
        var value = null;
        if (expression.type == "array") {
            value = expression.value[expression.index];
        } else {
            value = expression.value;
        }
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(SqlStatementBlocks.parameter);
    },

    VisitConstantExpression: function (expression, sqlBuilder) {
        //var typeNameHintFromValue = Container.getTypeName(expression.value);
        var value = sqlBuilder.entityContext.storageProvider.fieldConverter.toDb[Container.resolveName(Container.resolveType(expression.type))](expression.value);;
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(SqlStatementBlocks.parameter);
    },

    VisitEntityFieldExpression:function(expression, sqlBuilder){
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
    },
    VisitComplexTypeExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
        sqlBuilder.addText("__");
    }
});