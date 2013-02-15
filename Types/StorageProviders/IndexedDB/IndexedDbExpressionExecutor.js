$C('$data.storageProviders.IndexedDB.IndexedDBExpressionExecutor', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider, tran) {
        this.provider = provider;
        this.tran = tran.transaction;
    },
    runQuery: function (query, callback) {
        var start = new Date().getTime();
        this.entitySet = query.context.getEntitySetFromElementType(query.defaultType);
        //this.tran = query.transaction;// this.provider.db.transaction([this.entitySet.tableName], this.provider.IDBTransactionType.READ_ONLY);
        this.objectStore = this.tran.objectStore(this.entitySet.tableName);

        var ctx = {
            objectStore: this.objectStore,
            promises: [],
            callback: {}
        };
        ctx.callback.success = function (result) {
            ctx.result = result.objects || result;
            $data.Trace.log("Executor in milliseconds : ", new Date().getTime() - start);
            callback.success(ctx.result);
        };
        this.Visit(query.expression, ctx);
    },
    VisitToArrayExpression: function (expression, context) {
        this.Visit(expression.source, context);
    },
    VisitFilterExpression: function (expression, context) {
        this.Visit(expression.selector, context);
    },
    VisitParametricQueryExpression: function (expression, context) {
        var tmpCallback = context.callback;
        context.callback = {
            success: function (eResult) {
                //context.result = eResult || expression.expression.resultSet;
                //context.result = context.result ? context.result.objects : [];
                tmpCallback.success(eResult);
            }
        };
        this.Visit(expression.expression, context);
    },
    VisitProjectionExpression: function (expression, context) {
        this.Visit(expression.source, context);
    },
    VisitOrderExpression: function (expression, context) {
        var tmpCallback = context.callback;
        var self = this;
        context.callback = {
            success: function (result) {
                var f = function (a, b) {
                    var ctx = { instance: a };
                    self.Visit(expression.selector.expression, ctx);
                    var aValue = ctx.value;

                    ctx.instance = b;
                    self.Visit(expression.selector.expression, ctx);
                    var bValue = ctx.value;

                    var result = aValue == bValue ? 0 : aValue > bValue ? 1 : -1;
                    if (expression.nodeType === "OrderByDescending") {
                        result = result * -1;
                    }
                    return result;
                }
                var resultSet = { ids: [], objects: [] };
                resultSet.objects = result.objects.sort(f);

                tmpCallback.success(resultSet);
            }
        };
        this.Visit(expression.source, context);
    },
    VisitCountExpression: function (expression, context) {
        var tmpCallback = context.callback;
        context.callback = {
            success: function (result) {
                tmpCallback.success({ cnt: result.objects.length });
            }
        };
        this.Visit(expression.source, context);
    },
    VisitPagingExpression: function (expression, context) {
        var tmp = context.callback;
        var self = this;
        context.callback = {
            success: function (result) {
                var v = {};
                self.Visit(expression.amount, v);
                var resultSet = { ids: [], objects: [] };
                switch (expression.nodeType) {
                    case "Skip": resultSet.ids = result.ids.slice(v.value); resultSet.objects = result.objects.slice(v.value); break;
                    case "Take": resultSet.ids = result.ids.slice(0, v.value); resultSet.objects = result.objects.slice(0, v.value); break;
                }
                tmp.success(resultSet);
            }
        };
        this.Visit(expression.source, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        var resultSet = { ids: [], objects: [] };
        context.objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                resultSet.objects.push(cursor.value);
                resultSet.ids.push(JSON.stringify(cursor.primaryKey));
                cursor.continue();
            }
            else {
                context.callback.success(resultSet);
            }
        };
    },

    VisitIndexedDBLogicalAndFilterExpression: function (expression, context) {
        var tmpCalback = context.callback;
        context.callback = {};
        var self = this;
        context.callback.success = function (lResult) {
            context.callback = {
                success: function (rResult) {
                    var start = new Date().getTime();

                    var largeList = lResult.ids.length <= rResult.ids.length ? rResult : lResult;
                    var smallList = lResult.ids.length > rResult.ids.length ? rResult : lResult;
                    var resultList = { ids: [], objects: [] };
                    for (var i = 0; i < smallList.ids.length; i++) {

                        if (largeList.ids.indexOf(smallList.ids[i]) >= 0) {
                            resultList.objects.push(smallList.objects[i]);
                            resultList.ids.push(smallList.ids[i]);
                        }
                    }
                    $data.Trace.log("Logical and: ", new Date().getTime() - start);
                    tmpCalback.success(resultList);
                }
            }
            self.Visit(expression.right, context);
        }
        this.Visit(expression.left, context);
    },
    VisitIndexedDBLogicalOrFilterExpression: function (expression, context) {
        var tmpCalback = context.callback;
        context.callback = {};
        var self = this;
        context.callback.success = function (lResult) {
            context.callback = {
                success: function (rResult) {
                    var start = new Date().getTime();

                    var resultList = lResult.ids.length <= rResult.ids.length ? rResult : lResult;
                    var smallList = lResult.ids.length > rResult.ids.length ? rResult : lResult;
                    for (var i = 0; i < smallList.ids.length; i++) {

                        if (resultList.ids.indexOf(smallList.ids[i]) < 0) {
                            resultList.objects.push(smallList.objects[i]);
                            resultList.ids.push(smallList.ids[i]);
                        }
                    }
                    $data.Trace.log("Logical Or: ", new Date().getTime() - start);
                    tmpCalback.success(resultList);
                }
            }
            self.Visit(expression.right, context);
        }
        this.Visit(expression.left, context);
    },

    VisitIndexedDBPhysicalAndFilterExpression: function (expression, context) {
        var self = this;
        var cursor;
        var resultSet = { ids: [], objects: [] };
        if (expression.suggestedIndex) {
            var keyRange = undefined;
            switch (expression.suggestedIndex.nodeType) {
                case "equal":
                    keyRange = self.provider.IDBKeyRange.only(expression.suggestedIndex.value);
                    break;
                case "equalTyped":
                    keyRange = self.provider.IDBKeyRange.only(expression.suggestedIndex.value);
                    break;
                case "greaterThan":
                    keyRange = self.provider.IDBKeyRange.lowerBound(expression.suggestedIndex.value, true);
                    break;
                case "greaterThanOrEqual":
                    keyRange = self.provider.IDBKeyRange.lowerBound(expression.suggestedIndex.value, false);
                    break;
                case "lessThan":
                    keyRange = self.provider.IDBKeyRange.upperBound(expression.suggestedIndex.value, true);
                    break;
                case "lessThenOrEqual":
                    keyRange = self.provider.IDBKeyRange.upperBound(expression.suggestedIndex.value, false);
                    break;
                default:
                    alert("filter nodetype:" + expression.suggestedIndex.nodeType);
                    break;
            }
            expression.filters.splice(expression.suggestedIndex.index, 1);
            cursor = self.objectStore.index(expression.suggestedIndex.field.name).openCursor(keyRange);
        } else {
            cursor = self.objectStore.openCursor();
        }

        cursor.onsuccess = function (event) {
            var c = event.target.result;
            if (c) {
                var i = 0;
                var addToResultSet = true;
                while (expression.filters[i]) {
                    var filter = expression.filters[i++];

                    var filterCtx = { instance: c.value, value: undefined };
                    self.Visit(filter.left, filterCtx);
                    var lValue = filterCtx.value;

                    var filterCtx = { instance: c.value, value: undefined };
                    self.Visit(filter.right, filterCtx);
                    var rValue = filterCtx.value;
                    switch (filter.nodeType) {
                        case "equal":
                            addToResultSet &= lValue == rValue;
                            break;
                        case "notEqual":
                            addToResultSet &= lValue != rValue;
                            break;
                        case "equalTyped":
                            addToResultSet &= lValue === rValue;
                            break;
                        case "notEqualTyped":
                            addToResultSet &= lValue !== rValue;
                            break;
                        case "greaterThan":
                            addToResultSet &= lValue > rValue;
                            break;
                        case "greaterThanOrEqual":
                            addToResultSet &= lValue >= rValue;
                            break;
                        case "lessThan":
                            addToResultSet &= lValue < rValue;
                            break;
                        case "lessThenOrEqual":
                            addToResultSet &= lValue <= rValue;
                            break;
                        case "in":
                            if (rValue instanceof Array) {
                                addToResultSet &= rValue.indexOf(lValue) >= 0;
                            } else {
                                throw new Exception("Not supported");
                            }
                            break;
                        default:
                            alert("filter nodetype:" + filter.nodeType);
                            break;
                    }
                }
                if (addToResultSet) {
                    resultSet.objects.push(c.value);
                    resultSet.ids.push(JSON.stringify(c.primaryKey));
                }
                c.continue();
            }
            else {
                context.callback.success(resultSet);
            }
        }
    },
    VisitConstantExpression: function (expression, context) {
        context.value = expression.value;
    },
    VisitEntityFieldExpression: function (expression, context) {
        if (context.instance) {
            context.value = context.instance[expression.selector.memberName];
        }
    },
    VisitEntityFieldOperationExpression: function (expression, context) {
        var ctx = { instance: context.instance };
        this.Visit(expression.source, ctx);
        var item = ctx.value;

        var params = [];
        for (var i = 0; i < expression.parameters.length; i++) {
            ctx.value = null;
            this.Visit(expression.parameters[i], ctx);
            if (ctx.value !== null) {
                params.push(ctx.value);
            }
        }
        if (item === null || item === undefined) {
            context.value = item;
        }
        else {
            if (expression.compiledFn) {
                context.value = expression.compiledFn(item, params);
            } else {
                if (item.hasOwnProperty(expression.operation.memberDefinition.mapTo)) {
                    context.value = item[expression.operation.memberDefinition.mapTo];
                } else if (typeof item[expression.operation.memberDefinition.mapTo] === 'function') {
                    context.value = item[expression.operation.memberDefinition.mapTo].apply(item, params);
                } else {
                    var f = new Function("item", "params", "return " + expression.operation.memberDefinition.mapTo + ".apply(item,params);");
                    expression.compiledFn = f;
                    context.value = f(item, params);
                }
            }
        }
    }
});