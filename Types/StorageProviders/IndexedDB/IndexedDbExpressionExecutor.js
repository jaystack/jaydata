$C('$data.storageProviders.IndexedDB.IndexedDBExpressionExecutor', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },
    runQuery: function (query, callback) {
        var start = new Date().getTime();
        this.entitySet = query.context.getEntitySetFromElementType(query.defaultType);
        this.tran = this.provider.db.transaction([this.entitySet.tableName], this.provider.IDBTransactionType.READ_ONLY);
        this.objectStore = this.tran.objectStore(this.entitySet.tableName);

        var ctx = {
            objectStore: this.objectStore,
            promises: [],
            callback: {}
        };
        ctx.callback.success = function (result) {
            console.log("Executor in milliseconds : ", new Date().getTime() - start);
            callback.success(ctx.result);
        };
        this.Visit(query.expression, ctx);
    },
    VisitProjectionExpression: function (expression, context) {
        this.Visit(expression.source, context);
    },
    VisitOrderExpression: function (expression, context) {
        var tmpCallback = context.callback;
        var self = this;
        context.callback = {
            success: function () {
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
                context.result = context.result.sort(f);
                tmpCallback.success();
            }
        };
        this.Visit(expression.source, context);
    },
    VisitCountExpression: function (expression, context) {
        var tmpCallback = context.callback;
        context.callback = {
            success: function () {
                context.result = { cnt: context.result.length };
                tmpCallback.success();
            }
        };
        this.Visit(expression.source, context);
    },
    VisitFilterExpression: function (expression, context) {
        this.Visit(expression.selector, context);
    },
    VisitToArrayExpression: function (expression, context) {
        this.Visit(expression.source, context);
    },
    VisitPagingExpression: function (expression, context) {
        var tmp = context.callback;
        var self = this;
        context.callback = {
            success: function () {
                var v = {};
                self.Visit(expression.amount, v);
                switch(expression.nodeType){
                    case "Skip": context.result = context.result.slice(v.value); break;
                    case "Take": context.result = context.result.slice(0, v.value); break;
                }
                tmp.success();
            }
        };
        this.Visit(expression.source, context);
    },
    VisitEntitySetExpression: function (expression, context) {
        context.result = context.result || [];
        context.objectStore.openCursor().onsuccess = function (event) {
            var cursor = event.target.result;
            if (cursor) {
                context.result.push(cursor.value);
                cursor.continue();
            }
            else {
                context.callback.success();
            }
        };
    },
    VisitParametricQueryExpression: function (expression, context) {
        var tmpCallback = context.callback;
        context.callback = {
            success: function (eResult) {
                context.result = eResult || expression.expression.resultSet;
                context.result = context.result ? context.result.objects : [];
                tmpCallback.success();
            }
        };
        this.Visit(expression.expression, context);
    },
    VisitIndexedDBPhysicalAndFilterExpression: function (expression, context) {
        var self = this;
        var cursor;
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

        expression.resultSet = { ids: [], objects: [] };
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
                        default:
                            alert("filter nodetype:" + filter.nodeType);
                            break;
                    }
                }
                if (addToResultSet) {
                    expression.resultSet.objects.push(c.value);
                    expression.resultSet.ids.push(c.primaryKey);
                }
                c.continue();
            }
            else {
                context.callback.success();
            }
        }
    },
    VisitIndexedDBLogicalAndFilterExpression: function (expression, context) {
        var tmpCalback = context.callback;
        context.callback = {};
        var self = this;
        context.callback.success = function (lResult) {
            context.callback = {
                success: function (rResult) {
                    var start = new Date().getTime();

                    var leftResult = lResult || expression.left.resultSet;
                    var rightResult = rResult || expression.right.resultSet;
                    var largeList = leftResult.ids.length <= rightResult.ids.length ? rightResult : leftResult;
                    var smallList = leftResult.ids.length > rightResult.ids.length ? rightResult : leftResult;
                    var resultList = { ids: [], objects: [] };
                    for (var i = 0; i < smallList.ids.length; i++) {

                        if (largeList.ids.indexOf(smallList.ids[i]) >= 0) {
                            resultList.objects.push(smallList.objects[i]);
                            resultList.ids.push(smallList.ids[i]);
                        }
                    }
                    console.log("Logical and: ", new Date().getTime() - start);
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

                    var leftResult = lResult || expression.left.resultSet;
                    var rightResult = rResult || expression.right.resultSet;
                    var resultList = leftResult.ids.length <= rightResult.ids.length ? rightResult : leftResult;
                    var smallList = leftResult.ids.length > rightResult.ids.length ? rightResult : leftResult;
                    for (var i = 0; i < smallList.ids.length; i++) {

                        if (resultList.ids.indexOf(smallList.ids[i]) < 0) {
                            resultList.objects.push(smallList.objects[i]);
                            resultList.ids.push(smallList.ids[i]);
                        }
                    }
                    console.log("Logical Or: ", new Date().getTime() - start);
                    tmpCalback.success(resultList);
                }
            }
            self.Visit(expression.right, context);
        }
        this.Visit(expression.left, context);
    },
    VisitConstantExpression: function (expression, context) {
        context.value = expression.value;
    },
    VisitEntityFieldExpression: function (expression, context) {
        if (context.instance) {
            context.value = context.instance[expression.selector.memberName];
        }
    }
});