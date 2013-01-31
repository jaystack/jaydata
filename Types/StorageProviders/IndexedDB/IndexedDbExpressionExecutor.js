$C('$data.storageProviders.IndexedDB.IndexedDBExpressionExecutor', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.provider = provider;
    },
    runQuery: function (query) {
        this.entitySet = query.context.getEntitySetFromElementType(query.defaultType);
        this.tran = this.provider.db.transaction([this.entitySet.tableName], this.provider.IDBTransactionType.READ_ONLY);
        this.objectStore = this.tran.objectStore(this.entitySet.tableName);

        var ctx = {
            objectStore: this.objectStore,
            promises: [],
            callback: {}
        };
        ctx.callback.success = function (result) {
            console.log("OK: ", ctx, ctx.result);
        };
        this.Visit(query.expression, ctx);
    },
    VisitParametricQueryExpression: function (expression, context) {
        var tmpCallback = context.callback;
        context.callback = {
            success: function (eResult) {
                context.result = eResult || expression.expression.resultSet;
                tmpCallback.success();
            }
        };
        this.Visit(expression.expression, context);
    },
    VisitIndexedDBPhysicalAndFilterExpression: function (expression, context) {
        var idx = 0;
        var filter = expression.filters[idx++];
        var indexname = null
        while (filter || indexname) {
            if (context.objectStore.indexNames.contains(filter.left.selector.memberName)) {
                indexname = filter.left.selector.memberName;
            } else {
                filter = expression.filters[idx++];
            }
        }
        var cursor;
        if (indexname) {
            cursor = context.objectStore.index(indexname).openCursor();
        } else {
            //cursor = this.provider.db.transaction([this.entitySet.tableName], this.provider.IDBTransactionType.READ_ONLY).objectStore(this.entitySet.tableName).openCursor();
            cursor = this.objectStore.openCursor();
        }

        expression.resultSet = [];
        cursor.onsuccess = function (event) {
            var c = event.target.result;
            if (c) {
                //console.log("key: ", c.key, "value: ", c.value);
                var i = 0;
                var addToResultSet = true;
                while (expression.filters[i]) {
                    var filter = expression.filters[i++];
                    var memberName = filter.left.selector.memberName;
                    var value = filter.right.value;
                    switch (filter.nodeType) {
                        case "equal":
                            addToResultSet &= c.value[memberName] == value;
                            break;
                        case "notEqual":
                            addToResultSet &= c.value[memberName] != value;
                            break;
                        case "equalTyped":
                            addToResultSet &= c.value[memberName] === value;
                            break;
                        case "notEqualTyped":
                            addToResultSet &= c.value[memberName] !== value;
                            break;
                        case "greaterThan":
                            addToResultSet &= c.value[memberName] > value;
                            break;
                        case "greaterThanOrEqual":
                            addToResultSet &= c.value[memberName] >= value;
                            break;
                        case "lessThan":
                            addToResultSet &= c.value[memberName] < value;
                            break;
                        case "lessThenOrEqual":
                            addToResultSet &= c.value[memberName] <= value;
                            break;
                        default:
                            alert("filter nodetype:" + filter.nodeType);
                            break;
                    }
                }
                if (addToResultSet) {
                    expression.resultSet.push({ pk: c.primaryKey, value: c.value });
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
            console.log("logical and right");
            context.callback = {
                success: function (rResult) {
                    var leftResult = lResult || expression.left.resultSet;
                    var rightResult = rResult || expression.right.resultSet;

                    var largeList = leftResult.length < rightResult.length ? rightResult : leftResult;
                    var smallList = leftResult.length > rightResult.length ? rightResult : leftResult;
                    var resultList = [];

                    for (var i = 0; i < smallList.length; i++) {
                        if (largeList.some(function (item) {
                            return item.pk == smallList[i].pk;
                        })) {
                            resultList.push(smallList[i]);
                        }
                    }

                    console.log("run logical and ");
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
            console.log("logical or right");
            context.callback = {
                success: function (rResult) {
                    var leftResult = lResult || expression.left.resultSet;
                    var rightResult = rResult || expression.right.resultSet;
                    console.log("run logical or ");
                    tmpCalback.success(leftResult.concat(rightResult));
                }
            }
            self.Visit(expression.right, context);
        }
        this.Visit(expression.left, context);
    }
});