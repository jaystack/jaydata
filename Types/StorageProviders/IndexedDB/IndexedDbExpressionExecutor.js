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
        var self = this;
        var idx = 0;
        var indexname = null;
        var createIndexId = null;

        //find index name, and suggest id of filter for new index
        while (expression.filters[idx] && !indexname) {
            var filter = expression.filters[idx];
            if (this.objectStore.indexNames.contains(filter.left.selector.memberName)) {
                var c = {};
                var c1 = {};
                this.Visit(filter.left, c);
                this.Visit(filter.right, c1);
                filter.constValue = c.value || c1.value;
                if (filter.constValue) {
                    indexname = filter.left.selector.memberName;
                }
                else {
                    idx++;
                }
            } else {
                if (filter.nodeType !== "notEqual" && filter.nodeType !== "notEqualTyped") {
                    var c = {};
                    var c1 = {};
                    this.Visit(filter.left, c);
                    this.Visit(filter.right, c1);
                    filter.constValue = c.value || c1.value;
                    if (filter.constValue) {
                        createIndexId = idx;
                    }
                }
                idx++;
            }
        }
        var f = function () {
            var cursor;
            if (indexname) {
                var keyRange = undefined;
                switch (expression.filters[idx].nodeType) {
                    case "equal":
                        keyRange = self.provider.IDBKeyRange.only(expression.filters[idx].constValue);
                        break;
                    case "equalTyped":
                        keyRange = self.provider.IDBKeyRange.only(expression.filters[idx].constValue);
                        break;
                    case "greaterThan":
                        keyRange = self.provider.IDBKeyRange.upperBound(expression.filters[idx].constValue, true);
                        break;
                    case "greaterThanOrEqual":
                        keyRange = self.provider.IDBKeyRange.upperBound(expression.filters[idx].constValue, false);
                        break;
                    case "lessThan":
                        keyRange = self.provider.IDBKeyRange.lowerBound(expression.filters[idx].constValue, true);
                        break;
                    case "lessThenOrEqual":
                        keyRange = self.provider.IDBKeyRange.lowerBound(expression.filters[idx].constValue, false);
                        break;
                    default:
                        alert("filter nodetype:" + filter.nodeType);
                        break;
                }
                expression.filters.splice(idx, 1);
                cursor = self.objectStore.index(indexname).openCursor(keyRange);
            } else {
                cursor = self.objectStore.openCursor();
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
                        expression.resultSet.push({ pk: c.primaryKey, value: c.value });
                    }
                    c.continue();
                }
                else {
                    context.callback.success();
                }
            }
        }
        //TODO: create index if needed, 2nd params need to update provider config
        if (!indexname && true) {
            idx = createIndexId;
            this.provider.db.close();
            var newVersion = this.provider.db.version || 0;
            this.provider.indexedDB.open(this.provider.providerConfiguration.databaseName, ++newVersion).setCallbacks({
                onupgradeneeded: function (event) {
                    //var db = event.target.result;
                    var writeTran = event.target.transaction;// db.transaction([self.entitySet.tableName], self.provider.IDBTransactionType.READ_WRITE);
                    writeObjectStore = writeTran.objectStore(self.entitySet.tableName);
                    writeObjectStore.createIndex(expression.filters[idx].left.selector.memberName, expression.filters[idx].left.selector.memberName, { unique: false });
                    writeTran.db.close();
                    self.provider.indexedDB.open(self.provider.providerConfiguration.databaseName).onsuccess = function (e) {
                        indexname = expression.filters[idx].left.selector.memberName;
                        self.provider.db = e.target.result;
                        f();
                    }


                }
            });
        } else {
            f();
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