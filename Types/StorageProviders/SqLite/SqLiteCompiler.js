var SqlStatementBlocks = {
    beginGroup: "(",
    endGroup: ")",
    nameSeparator: ".",
    valueSeparator: ", ",
    select: "SELECT ",
    where: " WHERE ",
    from: " FROM ",
    skip: " OFFSET ",
    take: " LIMIT ",
    parameter: "?",
    order: " ORDER BY ",
    as: " AS ",
    scalarFieldName: 'd',
    rowIdName: 'rowid$$',
    count: 'select count(*) cnt from ('
};
$C('$data.sqLite.SqlBuilder', $data.queryBuilder, null, {
    constructor: function (sets, context) {
        this.sets = sets;
        this.entityContext = context;

    },
    getExpressionAlias: function (setExpression) {
        var idx = this.sets.indexOf(setExpression);
        if (idx == -1) {
            idx = this.sets.push(setExpression) - 1;
        }
        return "T" + idx;
    }
});

$C('$data.sqLite.SqlCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (queryExpression, context) {
        this.queryExpression = queryExpression;
        this.sets = context.sets;
        this.infos = context.infos;
        this.entityContext = context.entityContext;
        this.associations = [];
        this.filters = [];
        this.newFilters = {};
        this.sortedFilterPart = ['projection', 'from', 'filter', 'order', 'take', 'skip'];
    },
    compile: function () {
        var sqlBuilder = $data.sqLite.SqlBuilder.create(this.sets, this.entityContext);
        this.Visit(this.queryExpression, sqlBuilder);

        if (sqlBuilder.getTextPart('projection') === undefined) {
            this.VisitDefaultProjection(sqlBuilder);
        }
        sqlBuilder.selectTextPart("result");
        this.sortedFilterPart.forEach(function (part) {
            var part = sqlBuilder.getTextPart(part);
            if (part) {
                sqlBuilder.addText(part.text);
                sqlBuilder.selectedFragment.params = sqlBuilder.selectedFragment.params.concat(part.params);
            }
        }, this);
        var countPart = sqlBuilder.getTextPart('count');
        if (countPart !== undefined) {
            sqlBuilder.selectedFragment.text = countPart.text + sqlBuilder.selectedFragment.text;
            sqlBuilder.addText(SqlStatementBlocks.endGroup);
            sqlBuilder.selectedFragment.params = sqlBuilder.selectedFragment.params.concat(countPart.params);
        }
        sqlBuilder.resetModelBinderProperty();
        this.filters.push(sqlBuilder);
    },

    VisitToArrayExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
    },
    VisitCountExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('count');
        sqlBuilder.addText(SqlStatementBlocks.count);
    },
    VisitFilterExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('filter');
        sqlBuilder.addText(SqlStatementBlocks.where);
        var filterCompiler = $data.sqLite.SqlFilterCompiler.create();
        filterCompiler.Visit(expression.selector, sqlBuilder);
        return expression;
    },

    VisitOrderExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('order');
        if (this.addOrders) {
            sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
        } else {
            this.addOrders = true;
            sqlBuilder.addText(SqlStatementBlocks.order);
        }
        var orderCompiler = $data.sqLite.SqlOrderCompiler.create();
        orderCompiler.Visit(expression, sqlBuilder);

        return expression;
    },
    VisitPagingExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);

        switch (expression.nodeType) {
            case $data.Expressions.ExpressionType.Skip:
                sqlBuilder.selectTextPart('skip');
                sqlBuilder.addText(SqlStatementBlocks.skip); break;
            case $data.Expressions.ExpressionType.Take:
                sqlBuilder.selectTextPart('take');
                sqlBuilder.addText(SqlStatementBlocks.take); break;
            default: Guard.raise("Not supported nodeType"); break;
        }
        var pagingCompiler = $data.sqLite.SqlPagingCompiler.create();
        pagingCompiler.Visit(expression, sqlBuilder);
        return expression;
    },
    VisitProjectionExpression: function (expression, sqlBuilder) {
        this.Visit(expression.source, sqlBuilder);
        sqlBuilder.selectTextPart('projection');
        this.hasProjection = true;
        sqlBuilder.addText(SqlStatementBlocks.select);
        var projectonCompiler = $data.sqLite.SqlProjectionCompiler.create();
        projectonCompiler.Visit(expression, sqlBuilder);
    },
    VisitEntitySetExpression: function (expression, sqlBuilder) {
        sqlBuilder.selectTextPart('from');
        sqlBuilder.addText(SqlStatementBlocks.from);
        sqlBuilder.sets.forEach(function (es, setIndex) {

            if (setIndex > 0) {
                sqlBuilder.addText(" \n\tLEFT OUTER JOIN ");
            }

            var alias = sqlBuilder.getExpressionAlias(es);
            sqlBuilder.addText(es.instance.tableName + ' ');
            sqlBuilder.addText(alias);

            if (setIndex > 0) {
                sqlBuilder.addText(" ON (");
                var toSet = this.infos[setIndex];
                var toPrefix = "T" + toSet.AliasNumber;
                var fromSetName = toSet.NavigationPath.substring(0, toSet.NavigationPath.lastIndexOf('.'));
                var temp = this.infos.filter(function (inf) { return inf.NavigationPath == fromSetName; }, this);
                var fromPrefix = "T0";
                if (temp.length > 0) {
                    fromPrefix = "T" + temp[0].AliasNumber;
                }
                toSet.Association.associationInfo.ReferentialConstraint.forEach(function (constrain, index) {
                    if(index > 0){
                        sqlBuilder.addText(" AND ");
                    }
                    sqlBuilder.addText(fromPrefix + "." + constrain[toSet.Association.associationInfo.From]);
                    sqlBuilder.addText(" = ");
                    sqlBuilder.addText(toPrefix + "." + constrain[toSet.Association.associationInfo.To]);
                }, this);
                sqlBuilder.addText(")");
            }
        }, this);
    },
    VisitDefaultProjection: function (sqlBuilder) {
        sqlBuilder.selectTextPart('projection');
        var needAlias = this.infos.filter(function (i) { return i.IsMapped; }).length > 1;
        if (sqlBuilder.sets.length > 1) {
            sqlBuilder.addText(SqlStatementBlocks.select);
            sqlBuilder.sets.forEach(function (set, masterIndex) {

                if (this.infos[masterIndex].IsMapped) {
                    var alias = sqlBuilder.getExpressionAlias(set);
                    set.storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberDef, index) {
                        if (index > 0 || masterIndex > 0) {
                            sqlBuilder.addText(SqlStatementBlocks.valueSeparator);
                        }
                        sqlBuilder.addText(alias + ".");
                        sqlBuilder.addText(memberDef.name);
                        if (needAlias) {
                            sqlBuilder.addText(SqlStatementBlocks.as);
                            sqlBuilder.addText(alias + "__" + memberDef.name);
                        }
                    }, this);
                }

            }, this);

        }
        else {
            sqlBuilder.addText("SELECT *");
        }
    }
});

$data.Expressions.ExpressionNode.prototype.monitor = function (monitorDefinition, context) {
    var m = $data.sqLite.SqlExpressionMonitor.create(monitorDefinition);
    return m.Visit(this, context);
};

$C('$data.storageProviders.sqLite.SQLiteCompiler', null, null, {
    compile: function (query) {
        /// <param name="query" type="$data.Query" />
        var expression = query.expression;
        var context = { sets: [], infos: [], entityContext: query.context };

        var optimizedIncludeExpression = expression.monitor({
            MonitorEntitySetExpression: function (expression, context) {
                if (expression.source instanceof $data.Expressions.EntityContextExpression && context.sets.indexOf(expression) == -1) {
                    this.backupEntitySetExpression = expression;
                }
            },
            VisitCountExpression: function (expression, context) {
                context.hasCountFrameOperator = true;
                return expression;
            },
            MutateIncludeExpression: function (expression, context) {
                var result = null;
                if (context.hasCountFrameOperator) {
                    result = expression.source;
                }
                else {
                    var origSelector = expression.selector.value;
                    Container.createCodeExpression("function(it){return it." + origSelector + ";}", null);

                    var jsCodeTree = Container.createCodeParser(this.backupEntitySetExpression.source.instance).createExpression("function(it){return it." + origSelector + ";}");
                    var code2entity = Container.createCodeToEntityConverter(this.backupEntitySetExpression.source.instance);
                    var includeSelector = code2entity.Visit(jsCodeTree, { queryParameters: undefined, lambdaParameters: [this.backupEntitySetExpression] });

                    result = Container.createIncludeExpression(expression.source, includeSelector);
                }
                return result;
            }
        }, context);

        var optimizedExpression = optimizedIncludeExpression.monitor({
            MonitorEntitySetExpression: function (expression, context) {
                if (expression.source instanceof $data.Expressions.EntityContextExpression && context.sets.indexOf(expression) == -1) {
                    context.sets.push(expression);
                    context.infos.push({ AliasNumber: 0, Association: null, FromType: null, FromPropertyName: null, IsMapped: true });
                }
            },
            MutateEntitySetExpression: function (expression, context) {
                if (expression.source instanceof $data.Expressions.EntityContextExpression) {
                    this.backupContextExpression = expression.source;
                    this.path = "";
                    return expression;
                }
                if (expression.selector.associationInfo.FromMultiplicity == "0..1" && expression.selector.associationInfo.FromMultiplicity == "*") {
                    Guard.raise("Not supported query on this navigation property: " + expression.selector.associationInfo.From + " " + expression.selector.associationInfo.FromPropertyName);
                }

                this.path += '.' + expression.selector.associationInfo.FromPropertyName;
                var info = context.infos.filter(function (inf) {
                    return inf.NavigationPath == this.path;
                }, this);
                if (info.length > 0) {
                    return context.sets[info[0].AliasNumber];
                }
                var memberDefinitions = this.backupContextExpression.instance.getType().memberDefinitions.getMember(expression.storageModel.ItemName);
                if (!memberDefinitions) {
                    Guard.raise("Context schema error");
                }
                var mi = Container.createMemberInfoExpression(memberDefinitions);
                var result = Container.createEntitySetExpression(this.backupContextExpression, mi);
                result.instance = this.backupContextExpression.instance[expression.storageModel.ItemName];
                var aliasNum = context.sets.push(result);
                context.infos.push({
                    AliasNumber: aliasNum - 1,
                    Association: expression.selector,
                    NavigationPath: this.path,
                    IsMapped: this.isMapped
                });
                return result;
            }
        }, context);

        var compiler = $data.sqLite.SqlCompiler.create(optimizedExpression, context);
        compiler.compile();

        var sqlBuilder = $data.sqLite.SqlBuilder.create(this.sets, this.entityContext);

        query.modelBinderConfig = {};
        var modelBinder = $data.sqLite.sqLite_ModelBinderCompiler.create(query, context);
        modelBinder.Visit(optimizedExpression);

        var result = {
            sqlText: compiler.filters[0].selectedFragment.text,
            params: compiler.filters[0].selectedFragment.params,
            modelBinderConfig: query.modelBinderConfig
        };

        return result;
    }
}, null);
