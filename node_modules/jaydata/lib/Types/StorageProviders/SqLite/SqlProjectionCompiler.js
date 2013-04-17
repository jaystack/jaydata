$C('$data.sqLite.SqlProjectionCompiler', $data.Expressions.EntityExpressionVisitor, null,
{
    constructor: function () {
        this.anonymFiledPrefix = "";
        this.currentObjectLiteralName = null;
    },
    VisitProjectionExpression: function (expression, sqlBuilder) {
        this.Visit(expression.selector, sqlBuilder);
    },

    VisitParametricQueryExpression: function (expression, sqlBuilder) {
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + SqlStatementBlocks.rowIdName + ", ");
            this.VisitEntityExpressionAsProjection(expression, sqlBuilder);
        }
        else if (expression.expression instanceof $data.Expressions.EntitySetExpression) {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + SqlStatementBlocks.rowIdName + ", ");
            this.anonymFiledPrefix = sqlBuilder.getExpressionAlias(expression.expression) + '__'
            this.MappedFullEntitySet(expression.expression, sqlBuilder);
        }
        else if (expression.expression instanceof $data.Expressions.ObjectLiteralExpression) {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + SqlStatementBlocks.rowIdName + ", ");
            this.Visit(expression.expression, sqlBuilder);
        } else {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid");
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(SqlStatementBlocks.rowIdName);
            sqlBuilder.addText(', ');
            sqlBuilder.addKeyField(SqlStatementBlocks.rowIdName);
            this.Visit(expression.expression, sqlBuilder);
            if (!(expression.expression instanceof $data.Expressions.ComplexTypeExpression)) {
                sqlBuilder.addText(SqlStatementBlocks.as);
                sqlBuilder.addText(SqlStatementBlocks.scalarFieldName);
            }
        }
    },

    VisitEntityExpressionAsProjection: function (expression, sqlBuilder) {
        var ee = expression.expression;
        var alias = sqlBuilder.getExpressionAlias(ee.source);

        var localPrefix = this.anonymFiledPrefix + (expression.fieldName ? expression.fieldName : '');
        localPrefix = localPrefix ? localPrefix + '__' : '';

        ee.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberInfo, index) {
            if (index > 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }

            var fieldName = localPrefix + memberInfo.name;

            sqlBuilder.addText(alias);
            sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(memberInfo.name);
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(fieldName);
        }, this);
    },

    VisitEntityFieldOperationExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.EntityFieldOperationExpression"></param>
        /// <param name="sqlBuilder"></param>

        Guard.requireType("expression.operation", expression.operation, $data.Expressions.MemberInfoExpression);
        var opDefinition = expression.operation.memberDefinition;
        var opName = opDefinition.mapTo || opDefinition.name;

        sqlBuilder.addText(opName);
        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
        if (opName === "like") {
            var builder = $data.sqLite.SqlBuilder.create();
            this.Visit(expression.parameters[0], builder);
            builder.params.forEach(function (p) {
                var v = p;
                var paramDef = opDefinition.parameters[0];
                var v = paramDef.prefix ? paramDef.prefix + v : v;
                v = paramDef.suffix ? v + paramDef.suffix : v;
                sqlBuilder.addParameter(v);
            });
            sqlBuilder.addText(builder.sql);
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

    VisitUnaryExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.SimpleBinaryExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
        sqlBuilder.addText(expression.resolution.mapTo);
        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
        this.Visit(expression.operand, sqlBuilder);
        sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },

    VisitSimpleBinaryExpression: function (expression, sqlBuilder) {
        sqlBuilder.addText(SqlStatementBlocks.beginGroup);
        this.Visit(expression.left, sqlBuilder);
        var self = this;
        sqlBuilder.addText(" " + expression.resolution.mapTo + " ");
        if (expression.nodeType == "in") {
            //TODO: refactor and generalize
            Guard.requireType("expression.right", expression.right, $data.Expressions.ConstantExpression);
            var set = expression.right.value;
            if (set instanceof Array) {
                sqlBuilder.addText(SqlStatementBlocks.beginGroup);
                set.forEach(function (item, i) {
                    if (i > 0) sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                    var c = Container.createConstantExpression(item);
                    self.Visit(c, sqlBuilder);
                });
                sqlBuilder.addText(SqlStatementBlocks.endGroup);
            } else if (set instanceof $data.Queryable) {
                Guard.raise("not yet... but coming");
            } else {
                Guard.raise(new Exception("Only constant arrays and Queryables can be on the right side of 'in' operator", "UnsupportedType"));
            };
        } else {
            this.Visit(expression.right, sqlBuilder);
        }
        sqlBuilder.addText(SqlStatementBlocks.endGroup);
    },

    VisitConstantExpression: function (expression, sqlBuilder) {
        var value = expression.value;
        sqlBuilder.addParameter(value);
        sqlBuilder.addText(SqlStatementBlocks.parameter);
    },

    VisitEntityFieldExpression: function (expression, sqlBuilder) {
        if (expression.source instanceof $data.Expressions.ComplexTypeExpression) {
            var alias = sqlBuilder.getExpressionAlias(expression.source.source.source);
            var storageModel = expression.source.source.storageModel.ComplexTypes[expression.source.selector.memberName];
            var member = storageModel.ReferentialConstraint.filter(function (item) { return item[expression.source.selector.memberName] == expression.selector.memberName; })[0];
            if (!member) { Guard.raise(new Exception('Compiler error! ComplexType does not contain ' + expression.source.selector.memberName + ' property!')); return;}

            sqlBuilder.addText(alias);
            sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(member[storageModel.From]);
        }
        else {
            this.Visit(expression.source, sqlBuilder);
            this.Visit(expression.selector, sqlBuilder);
        }
        
    },

    VisitEntitySetExpression: function (expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
    },

    VisitComplexTypeExpression: function (expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression.source.source);
        var storageModel = expression.source.storageModel.ComplexTypes[expression.selector.memberName];
        storageModel.ReferentialConstraint.forEach(function (constrain, index) {
            if (index > 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }
            sqlBuilder.addText(alias);
            sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(constrain[storageModel.From]);
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(this.anonymFiledPrefix + constrain[storageModel.To]);
        }, this);
    },

    VisitMemberInfoExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.MemberInfoExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
        sqlBuilder.addText(expression.memberName);
    },

    VisitObjectLiteralExpression: function (expression, sqlBuilder) {
        var membersNumber = expression.members.length;
        for (var i = 0; i < membersNumber; i++) {
            if (i != 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }
            this.Visit(expression.members[i], sqlBuilder);
        }
    },
    MappedFullEntitySet: function (expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression);
        var properties = expression.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties();
        properties.forEach(function (prop, index) {
            if (!prop.association) {
                if (index > 0) {
                    sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                }
                sqlBuilder.addText(alias);
                sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
                sqlBuilder.addText(prop.name);
                sqlBuilder.addText(SqlStatementBlocks.as);
                sqlBuilder.addText(this.anonymFiledPrefix + prop.name);
            }
        }, this);
        //ToDo: complex type
    },
    VisitObjectFieldExpression: function (expression, sqlBuilder) {

        var tempObjectLiteralName = this.currentObjectLiteralName;
        if (this.currentObjectLiteralName) {
            this.currentObjectLiteralName += '.' + expression.fieldName;
        } else {
            this.currentObjectLiteralName = expression.fieldName;
        }

        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            this.VisitEntityExpressionAsProjection(expression, sqlBuilder);
        } else {

            var tmpPrefix = this.anonymFiledPrefix;
            this.anonymFiledPrefix += expression.fieldName + "__";

            if (expression.expression instanceof $data.Expressions.EntitySetExpression) {
                this.MappedFullEntitySet(expression.expression, sqlBuilder);
            } else {
                this.Visit(expression.expression, sqlBuilder);
            }

            this.anonymFiledPrefix = tmpPrefix;

            if (!(expression.expression instanceof $data.Expressions.ObjectLiteralExpression) && !(expression.expression instanceof $data.Expressions.ComplexTypeExpression) && !(expression.expression instanceof $data.Expressions.EntitySetExpression)) {
                sqlBuilder.addText(SqlStatementBlocks.as);
                sqlBuilder.addText(this.anonymFiledPrefix + expression.fieldName);
            }
        }
        this.currentObjectLiteralName = tempObjectLiteralName;
    }

}, null);