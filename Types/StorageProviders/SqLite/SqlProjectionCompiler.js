$C('$data.sqLite.SqlProjectionCompiler', $data.Expressions.EntityExpressionVisitor, null,
{
    constructor: function () {
        this.anonymFiledPrefix = "";
        this.currentConverterObject = {};
        this.currentObjectLiteralName = null;
        this.currentPropertyMapping = [];
        this.hasObjectLiteral = false;
    },
    VisitProjectionExpression: function (expression, sqlBuilder) {
        sqlBuilder.actions.push({ op: "buildType", context: sqlBuilder.entityContext, logicalType: null, tempObjectName: "d", propertyMapping: this.currentPropertyMapping });
        sqlBuilder.actions.push({ op: "copyToResult", tempObjectName: "d" });

        this.Visit(expression.selector, sqlBuilder);
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
            var builder = Container.createSqlBuilder();
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

    VisitParametricQueryExpression: function (expression, sqlBuilder) {
        if (!(expression.expression instanceof $data.Expressions.ObjectLiteralExpression)) {
            this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
            sqlBuilder.addText("rowid");
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(SqlStatementBlocks.rowIdName);
            sqlBuilder.addText(', ');
            this.currentConverterObject = { keys: [SqlStatementBlocks.rowIdName], mapping: {} };
            sqlBuilder.converter.push(this.currentConverterObject);
        }
        if (expression.expression instanceof $data.Expressions.EntityExpression) {
            sqlBuilder.converter.pop();
            this.VisitEntityExpressionAsProjection(expression, sqlBuilder);
        } else {
            this.Visit(expression.expression, sqlBuilder);
        }

        if (!(expression.expression instanceof $data.Expressions.ObjectLiteralExpression) && !(expression.expression instanceof $data.Expressions.EntityExpression)) {
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(SqlStatementBlocks.scalarFieldName);
            this.currentConverterObject.mapping[SqlStatementBlocks.scalarFieldName] = SqlStatementBlocks.scalarFieldName;
            if (expression.expression instanceof $data.Expressions.EntityFieldExpression &&
                    expression.expression.selector instanceof $data.Expressions.MemberInfoExpression) {
                        this.currentPropertyMapping.push({ from: SqlStatementBlocks.scalarFieldName, dataType: expression.expression.selector.memberDefinition.dataType });
                    } else {
                        this.currentPropertyMapping.push({ from: SqlStatementBlocks.scalarFieldName });
                    }
        }
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
        //this.VisitOperator(expression.operator, sqlBuilder, expression.nodeType);
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
        this.Visit(expression.source, sqlBuilder);
        this.Visit(expression.selector, sqlBuilder);
    },
    VisitEntitySetExpression: function (expression, sqlBuilder) {
        var alias = sqlBuilder.getExpressionAlias(expression);
        sqlBuilder.addText(alias);
        sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
    },

    VisitMemberInfoExpression: function (expression, sqlBuilder) {
        /// <param name="expression" type="$data.Expressions.MemberInfoExpression"></param>
        /// <param name="sqlBuilder" type="$data.sqLite.SqlBuilder"></param>
        sqlBuilder.addText(expression.memberName);
    },

    VisitObjectLiteralExpression: function (expression, sqlBuilder) {
        this.hasObjectLiteral = true;
        this.VisitEntitySetExpression(sqlBuilder.sets[0], sqlBuilder);
        sqlBuilder.addText("rowid AS " + this.anonymFiledPrefix + SqlStatementBlocks.rowIdName + ", ");
        var tempMapConverter = this.currentConverterObject;
        this.currentConverterObject = { keys: [this.anonymFiledPrefix + SqlStatementBlocks.rowIdName], propertyName: this.currentObjectLiteralName, mapping: {} };
        sqlBuilder.converter.push(this.currentConverterObject);

        var membersNumber = expression.members.length;
        for (var i = 0; i < membersNumber; i++) {
            if (i != 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }
            this.Visit(expression.members[i], sqlBuilder);
        }

        this.currentConverterObject = tempMapConverter;
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
            this.anonymFiledPrefix = expression.fieldName + "__";


            this.Visit(expression.expression, sqlBuilder);

            if (!(expression.expression instanceof $data.Expressions.ObjectLiteralExpression)) {
                sqlBuilder.addText(SqlStatementBlocks.as);
                sqlBuilder.addText(tmpPrefix + expression.fieldName);
                //this.currentConverterObject.propertyName = expression.fieldName;
                this.currentConverterObject.mapping[expression.fieldName] = tmpPrefix + expression.fieldName;
                if (expression.expression instanceof $data.Expressions.EntityFieldExpression &&
                    expression.expression.selector instanceof $data.Expressions.MemberInfoExpression) {
                        this.currentPropertyMapping.push({ from: this.currentObjectLiteralName, to: this.currentObjectLiteralName, dataType: expression.expression.selector.memberDefinition.dataType });
                    } else {
                        this.currentPropertyMapping.push({ from: this.currentObjectLiteralName, to: this.currentObjectLiteralName });
                    }
            }



            this.anonymFiledPrefix = tmpPrefix;
        }
        this.currentObjectLiteralName = tempObjectLiteralName;
    },
    VisitEntityExpressionAsProjection: function (expression, sqlBuilder) {
        var ee = expression.expression;
        var alias = sqlBuilder.getExpressionAlias(ee.source);

        var mappingIncludes = [];
        this.currentPropertyMapping.push({ from: this.currentObjectLiteralName, to: this.currentObjectLiteralName, type: ee.storageModel.LogicalType, includes: mappingIncludes });
        var localPrefix = this.anonymFiledPrefix + (expression.fieldName ? expression.fieldName : '');
        localPrefix = localPrefix ? localPrefix + '__' : '';
        //Todo array
        var convertObj = { keys: [localPrefix + SqlStatementBlocks.rowIdName], propertyName: this.currentObjectLiteralName, propertyType: 'object', mapping: {} };
        sqlBuilder.converter.push(convertObj);

        var complexTypeConverter = {};
        var complexTypeFields = {};
        var associationTypeFields = [];
        ee.storageModel.Associations.forEach(function (association) {
            association.ReferentialConstraint.forEach(function (constrain) {
                associationTypeFields.push(constrain[ee.storageModel.LogicalTypeName]);
            }, this);
        }, this);

        ee.storageModel.ComplexTypes.forEach(function (cmpType) {
            mappingIncludes.push({ name: cmpType.To, type: cmpType.ToType });

            complexTypeConverter[cmpType.To] = { keys: [localPrefix + cmpType.To + "__" + SqlStatementBlocks.rowIdName], propertyName: this.currentObjectLiteralName + "." + cmpType.To, mapping: {} };
            sqlBuilder.converter.push(complexTypeConverter[cmpType.To]);
            complexTypeFields[cmpType.To] = [];
            cmpType.ReferentialConstraint.forEach(function (constrain) {
                complexTypeFields[cmpType.To].push(constrain);
            }, this);
        }, this);

        ee.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberInfo, index) {
            if (index > 0) {
                sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
            }

            var fieldName = localPrefix + memberInfo.name;
            var isMapped = associationTypeFields.indexOf(memberInfo.name) > -1;
            if (!isMapped) {
                for (var key in complexTypeFields) {
                    complexTypeFields[key].forEach(function (o) {
                        if (o[ee.entityType.name] == memberInfo.name) {
                            isMapped = true;
                            complexTypeConverter[key].mapping[o[ee.storageModel.ComplexTypes[key].To]] = fieldName;
                        }
                    }, this);
                }
            }
            if (!isMapped) {
                convertObj.mapping[memberInfo.name] = fieldName;
            }
            sqlBuilder.addText(alias);
            sqlBuilder.addText(SqlStatementBlocks.nameSeparator);
            sqlBuilder.addText(memberInfo.name);
            sqlBuilder.addText(SqlStatementBlocks.as);
            sqlBuilder.addText(fieldName);

        }, this);


    }
}, null);