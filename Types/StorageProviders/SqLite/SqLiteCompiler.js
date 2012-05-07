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

$C('$data.sqLite.SqlBuilder', null, null, {
    constructor: function (sets, context) {
        this.sql = '';
        this.params = [];
        this.sets = sets;
        this.actions = [];
        this.converter = [];
        this.entityContext = context;

    },
    addText: function (sqlParticle) {
        this.sql += sqlParticle;
    },
    addParameter: function (param) {
        this.params.push(param);
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
        var sqlBuilder = Container.createSqlBuilder(this.sets, this.entityContext);
        this.Visit(this.queryExpression, sqlBuilder);

        if (this.newFilters['projection'] === undefined) {
            this.VisitDefaultProjection();
        }

        this.sortedFilterPart.forEach(function (part) {
            if (this.newFilters[part]) {
                sqlBuilder.addText(this.newFilters[part].sql);
                sqlBuilder.params = sqlBuilder.params.concat(this.newFilters[part].params);
                sqlBuilder.actions = sqlBuilder.actions.concat(this.newFilters[part].actions);
                sqlBuilder.converter = sqlBuilder.converter.concat(this.newFilters[part].converter);
            }
        }, this);
        if (this.newFilters['count'] !== undefined) {
            sqlBuilder.sql = this.newFilters['count'].sql + sqlBuilder.sql;
            sqlBuilder.addText(SqlStatementBlocks.endGroup);
            sqlBuilder.params = sqlBuilder.params.concat(this.newFilters['count'].params);
            sqlBuilder.actions = this.newFilters['count'].actions;
            sqlBuilder.converter = this.newFilters['count'].converter;
        }

        this.filters.push(sqlBuilder);
    },

    VisitCountExpression: function (expression, sqlBuilder) {
        var countBuilder = Container.createSqlBuilder(this.sets, this.entityContext);

        this.Visit(expression.source, countBuilder);
        countBuilder.sql = SqlStatementBlocks.count;
        countBuilder.converter = [{ keys: ['cnt'], propertyType: 'object', mapping: { cnt: "cnt" } }];
        countBuilder.actions = [];
        countBuilder.actions.push({ op: "buildType", context: countBuilder.entityContext, logicalType: null, tempObjectName: 'result', propertyMapping: [{ from: 'cnt', dataType: 'number' }] });
        countBuilder.actions.push({ op: "copyToResult", tempObjectName: 'result' });
        
        this.newFilters['count'] = countBuilder;
    },
    VisitFilterExpression: function (expression) {
        var filterBuilder = Container.createSqlBuilder(this.sets, this.entityContext);

        this.Visit(expression.source, filterBuilder);

        filterBuilder.addText(SqlStatementBlocks.where);
        var filterCompiler = Container.createSqlFilterCompiler();
        filterCompiler.Visit(expression.selector, filterBuilder);

        this.newFilters['filter'] = filterBuilder;

        return expression;
    },
    VisitOrderExpression: function (expression) {
        if (this.newFilters['order'] === undefined) {
            this.newFilters['order'] = Container.createSqlBuilder(this.sets, this.entityContext);
        }

        this.Visit(expression.source, this.newFilters['order']);

        if (this.addOrders) {
            this.newFilters['order'].addText(SqlStatementBlocks.valueSeparator);
        } else {
            this.addOrders = true;
            this.newFilters['order'].addText(SqlStatementBlocks.order);
        }
        var orderCompiler = Container.createSqlOrderCompiler();
        orderCompiler.Visit(expression, this.newFilters['order']);

        return expression;
    },
    VisitPagingExpression: function (expression) {
        var pagingBuilder = Container.createSqlBuilder(this.sets, this.entityContext);

        this.Visit(expression.source, pagingBuilder);

        switch (expression.nodeType) {
            case ExpressionType.Skip: pagingBuilder.addText(SqlStatementBlocks.skip); break;
            case ExpressionType.Take: pagingBuilder.addText(SqlStatementBlocks.take); break;
            default: Guard.raise("Not supported nodeType"); break;
        }
        var pagingCompiler = Container.createSqlPagingCompiler();
        pagingCompiler.Visit(expression, pagingBuilder);

        switch (expression.nodeType) {
            case ExpressionType.Skip: this.newFilters['skip'] = pagingBuilder; break;
            case ExpressionType.Take: this.newFilters['take'] = pagingBuilder; break;
            default: Guard.raise("Not supported nodeType"); break;
        }
        return expression;
    },
    VisitProjectionExpression: function (expression) {
        var projectionBuilder = Container.createSqlBuilder(this.sets, this.entityContext);

        this.hasProjection = true;
        projectionBuilder.addText(SqlStatementBlocks.select);

        var projectonCompiler = Container.createSqlProjectionCompiler();
        projectonCompiler.Visit(expression, projectionBuilder);

        this.Visit(expression.source, projectionBuilder);

        this.newFilters['projection'] = projectionBuilder;
        //Model binder
        var mb = Container.createsqLiteModelBinderCompiler();
        mb.Visit(expression, projectionBuilder);
    },
    VisitIncludeExpression: function (expression) {
        var includeBuilder = Container.createSqlBuilder(this.sets, this.entityContext);
        this.Visit(expression.source, includeBuilder);

        //var projectonCompiler = Container.createSqlProjectionCompiler();
        //projectonCompiler.Visit(expression, includeBuilder);
        this.newFilters['include'] = projectionBuilder;
    },
    VisitEntitySetExpression: function (expression) {
        var fromBuilder = Container.createSqlBuilder(this.sets, this.entityContext);
        fromBuilder.addText(SqlStatementBlocks.from);
        fromBuilder.sets.forEach(function (es, setIndex) {

            if (setIndex > 0) {
                fromBuilder.addText(" \n\tLEFT OUTER JOIN ");
            }

            var alias = fromBuilder.getExpressionAlias(es);
            fromBuilder.addText(es.instance.tableName + ' ');
            fromBuilder.addText(alias);

            if (setIndex > 0) {
                fromBuilder.addText(" ON (");
                var toSet = this.infos[setIndex];
                var toPrefix = "T" + toSet.AliasNumber;
                var fromSetName = toSet.NavigationPath.substring(0, toSet.NavigationPath.lastIndexOf('.'));
                var temp = this.infos.filter(function (inf) { return inf.NavigationPath == fromSetName; }, this);
                var fromPrefix = "T0";
                if (temp.length > 0) {
                    fromPrefix = "T" + temp[0].AliasNumber;
                }
                toSet.Association.associationInfo.ReferentialConstraint.forEach(function (constrain, index) {
                    fromBuilder.addText(fromPrefix + "." + constrain[toSet.Association.associationInfo.From]);
                    fromBuilder.addText(" = ");
                    fromBuilder.addText(toPrefix + "." + constrain[toSet.Association.associationInfo.To]);
                }, this);
                fromBuilder.addText(")");
            }
        }, this);
        this.newFilters['from'] = fromBuilder;
    },
    VisitDefaultProjection: function () {
        var projectionBuilder = Container.createSqlBuilder(this.sets, this.entityContext);
        if (projectionBuilder.sets.length > 1) {
            projectionBuilder.addText(SqlStatementBlocks.select);
            projectionBuilder.sets[0].storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberDef, index) {
                if (index > 0) {
                    projectionBuilder.addText(SqlStatementBlocks.valueSeparator);
                }
                projectionBuilder.addText("T0.");
                projectionBuilder.addText(memberDef.name);
            }, this);
        }
        else {
            projectionBuilder.sql = "SELECT *";
        }

        //Create converter config object
        var converterItem = { keys: [], mapping: {} };
        projectionBuilder.sets[0].storageModel.PhysicalType.memberDefinitions.getPublicMappedProperties().forEach(function (memberDef, index) {
            if (memberDef.key) {
                converterItem.keys.push(memberDef.name);
            }
            converterItem.mapping[memberDef.name] = memberDef.name;
        });
        projectionBuilder.converter.push(converterItem);
        //create actionpack
        projectionBuilder.actions.push({ op: "buildType", context: projectionBuilder.entityContext, logicalType: projectionBuilder.sets[0].elementType, tempObjectName: projectionBuilder.sets[0].elementType.name, propertyMapping: null });
        projectionBuilder.actions.push({ op: "copyToResult", tempObjectName: projectionBuilder.sets[0].elementType.name });

        this.newFilters['projection'] = projectionBuilder;
    }
});

$data.Expressions.ExpressionNode.prototype.monitor = function (monitorDefinition, context) {
    var m = Container.createExpressionMonitor(monitorDefinition);
    return m.Visit(this, context);
};

$C('$data.storageProviders.sqLite.SQLiteCompiler', null, null, {
    compile: function (query) {
        /// <param name="query" type="$data.Query" />
        var expression = query.expression;
        var context = { sets: [], infos: [], entityContext: query.entitySet.entityContext };
        var optimizedExpression = expression.monitor({

            MonitorEntitySetExpression: function (expression, context) {
                if (expression.source instanceof $data.Expressions.EntityContextExpression && context.sets.indexOf(expression) == -1) {
                    context.sets.push(expression);
                    context.infos.push({ AliasNumber: 0, Association: null, FromType: null, FromPropertyName: null });
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
                var memberDefinitions = this.backupContextExpression.instance.getType().memberDefinitions.filter(function (item) { return item.name == expression.storageModel.EntitySetReference.name; });
                if (memberDefinitions.length != 1) {
                    Guard.raise("Context schema error");
                }
                var mi = Container.createMemberInfoExpression(memberDefinitions[0]);
                var result = Container.createEntitySetExpression(this.backupContextExpression, mi);
                result.instance = this.backupContextExpression.instance[expression.storageModel.EntitySetReference.name];
                var aliasNum = context.sets.push(result);
                context.infos.push({
                    AliasNumber: aliasNum - 1,
                    Association: expression.selector,
                    NavigationPath: this.path
                });
                return result;
            }
        }, context);

        var compiler = Container.createSqlCompiler(optimizedExpression, context);
        compiler.compile();
        var result = {
            sqlText: compiler.filters[0].sql,
            params: compiler.filters[0].params,
            actions: compiler.filters[0].actions,
            converter: compiler.filters[0].converter
        };

        return result;
    }
}, null);