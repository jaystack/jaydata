$C('$data.storageProviders.IndexedDB.IndexedDBCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (provider) {
        this.db = provider.db;
        this.provider = provider;
    },
    compile: function (query, callback) {
        var start = new Date().getTime();
        this.subqueryIndex = 0;
        var ctx = {};
        var newExpression = this.Visit(query.expression, ctx);

        //search new indexes
        var newIndexContext = { db: this.db };
        indexMonitor = Container.createPhysicalIndexSearch();
        newExpression = indexMonitor.Visit(newExpression, newIndexContext);

        //createIndexes
        this.createNewIndexes(newIndexContext, {
            success: function () {
                console.log("Compiler in milliseconds: ", new Date().getTime() - start);
                callback.success({ context: query.context, defaultType: query.defaultType, expression: newExpression });
            }
        });
    },
    createNewIndexes: function (ctx, callback) {
        //TODO: make safety
        if (false && ctx.newIndexes && ctx.newIndexes.length > 0) {
            var self = this;
            this.provider.db.close();
            var newVersion = this.provider.db.version || 0;
            //close db and reopen it with incrased version number
            this.provider.indexedDB.open(this.provider.providerConfiguration.databaseName, ++newVersion).setCallbacks({
                onupgradeneeded: function (event) {
                    var writeTran = event.target.transaction;
                    for (var i = 0; i < ctx.newIndexes.length; i++) {
                        var expression = ctx.newIndexes[i];
                        writeObjectStore = writeTran.objectStore(expression.newIndex.field.objectStoreName);
                        if (!writeObjectStore.indexNames.contains(expression.newIndex.field.name)) {
                            writeObjectStore.createIndex(expression.newIndex.field.name, expression.newIndex.field.name, { unique: false });
                        }
                        expression.suggestedIndex = expression.newIndex;
                        expression.newIndex = null;
                    }
                    writeTran.db.close();
                    self.provider.indexedDB.open(self.provider.providerConfiguration.databaseName).onsuccess = function (e) {
                        self.provider.db = e.target.result;
                        callback.success();
                    }
                }
            });
        } else {
            callback.success();
        }
    },

    VisitFilterExpression: function (expression, context) {
        var newSelector = this.Visit(expression.selector, context);
        return Container.createFilterExpression(expression.source, newSelector);
    },

    VisitParametricQueryExpression: function (expression, context) {
        var tempParentNodeType = context.parentNodeType;
        context.parentNodeType = null;
        var newExp = this.Visit(expression.expression, context);
        context.parentNodeType = tempParentNodeType;

        return Container.createParametricQueryExpression(newExp, expression.parameters);
    },
    VisitSimpleBinaryExpression: function (expression, context) {
        var origType = context.parentNodeType;

        context.parentNodeType = expression.nodeType;
        var nLeft = this.Visit(expression.left, context);
        var nRight = this.Visit(expression.right, context);
        context.parentNodeType = origType;

        switch (expression.nodeType) {
            case "and":
                if (nLeft instanceof Array && nRight instanceof Array) {
                    var filters = nLeft.concat(nRight);
                    if (context.parentNodeType == "and") {
                        return filters;
                    }
                    return Container.createIndexedDBPhysicalAndFilterExpression(filters);
                } else {
                    if (nLeft instanceof Array) {
                        nLeft = Container.createIndexedDBPhysicalAndFilterExpression(nLeft);
                    }
                    if (nRight instanceof Array) {
                        nRight = Container.createIndexedDBPhysicalAndFilterExpression(nRight);
                    }
                    return Container.createIndexedDBLogicalAndFilterExpression(nLeft, nRight);
                }
                break;
            case "or":
                if (nLeft instanceof Array) {
                    nLeft = Container.createIndexedDBPhysicalAndFilterExpression(nLeft);
                }
                if (nRight instanceof Array) {
                    nRight = Container.createIndexedDBPhysicalAndFilterExpression(nRight);
                }

                return Container.createIndexedDBLogicalOrFilterExpression(nLeft, nRight);
                break;
            default:
                if (!context.parentNodeType) {
                    return Container.createIndexedDBPhysicalAndFilterExpression([expression]);
                }
                return [expression];
                break;
        }

    }

}, {});

$C('$data.storageProviders.IndexedDB.PhysicalIndexSearch', $data.Expressions.EntityExpressionVisitor, null, {
    VisitEntitySetExpression: function (expression, context) {
        var tName = expression.storageModel.TableName;
        context.objectStoresName = context.objectStoresName || [];
        if (!context.objectStoresName.some(function (it) { return it == tName; })) {
            context.objectStoresName.push(tName);
        }
        //console.log(context);
    },
    VisitParametricQueryExpression: function (expression, context) {
        context.tran = context.db.transaction([context.objectStoresName], "readonly");
        this.Visit(expression.expression, context);
    },
    VisitIndexedDBPhysicalAndFilterExpression: function (expression, context) {
        var suggestedIndex = null;
        var newIndex = null;
        context.objectStores = context.objectStores || {};
        var i = 0;
        var filter = expression.filters[i];
        while (filter && !suggestedIndex) {
            var filterValue = { value: null };
            this.Visit(filter.left, filterValue);
            this.Visit(filter.right, filterValue);

            filterValue.nodeType = filter.nodeType;
            filterValue.index = i;
            filter.filterValue = filterValue;

            if (filterValue.field) {
                //get objectStore from transact
                var objectStore = context.objectStores[filterValue.field.objectStoreName];
                if (!objectStore) {
                    objectStore = context.tran.objectStore(filterValue.field.objectStoreName);
                    context.objectStores[filterValue.field.objectStoreName] = objectStore;
                }
                //check existing filter
                if (objectStore.indexNames.contains(filterValue.field.name)) {
                    suggestedIndex = filterValue;
                    newIndex = null;
                } else if (!newIndex && filterValue.value !== null) {
                    newIndex = filterValue;
                }
            }
            filter = expression.filters[++i];
        }
        expression.suggestedIndex = suggestedIndex;
        expression.newIndex = newIndex;
        if (newIndex && !suggestedIndex) {
            context.newIndexes = context.newIndexes || [];
            context.newIndexes.push(expression);
        }
    },
    VisitEntityFieldExpression: function (expression, context) {
        context.field = context.field || { name: expression.selector.memberName, objectStoreName: expression.source.storageModel.TableName };
    },
    VisitConstantExpression: function (expression, context) {
        if (context) {
            context.value = context.value || expression.value;
        }
    },
    VisitIndexedDBLogicalAndFilterExpression: function (expression, context) {
        this.Visit(expression.left, context);
        this.Visit(expression.right, context);
    },
    VisitIndexedDBLogicalOrFilterExpression: function (expression, context) {
        this.Visit(expression.left, context);
        this.Visit(expression.right, context);
    }
});