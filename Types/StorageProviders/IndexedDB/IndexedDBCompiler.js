$C('$data.storageProviders.IndexedDB.IndexedDBCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (db) {
        this.db = db;
    },
    compile: function (query) {
        this.subqueryIndex = 0;
        var ctx = {};
        var newExpression = this.Visit(query.expression, ctx);
        console.log("Context ", ctx, newExpression.source.selector.expression);
        indexMonitor = Container.createPhysicalIndexSearch();
        newExpression = indexMonitor.Visit(newExpression, { db: this.db });
        return { context: query.context, defaultType: query.defaultType, expression: newExpression };
    },

    VisitSimpleBinaryExpression: function (expression, context) {
        console.log("operator: " + expression.operator);
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
        console.log(context);
    },
    VisitParametricQueryExpression: function (expression, context) {
        context.tran = context.db.transaction([context.objectStoresName], "readwrite");
        this.Visit(expression.expression, context);
    },
    VisitIndexedDBPhysicalAndFilterExpression: function (expression, context) {
        var suggestedIndex = null;
        var newIndex = null;
        context.objectStores = context.objectStores || {};
        var i = 0;
        var filter = expression.filters[i];
        while (!suggestedIndex || !filter) {
            var filterValue = { value: null };
            this.Visit(filter.left, filterValue);
            this.Visit(filter.right, filterValue);

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
        if (newIndex) {

        }
    },
    VisitEntityFieldExpression: function (expression, context) {
        context.field = context.field || { name: expression.selector.memberName, objectStoreName: expression.source.storageModel.TableName };
    },
    VisitConstantExpression: function (expression, context) {
        context.value = context.value || expression.value;
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