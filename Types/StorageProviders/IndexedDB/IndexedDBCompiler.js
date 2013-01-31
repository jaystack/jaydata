$C('$data.storageProviders.IndexedDB.IndexedDBCompiler', $data.Expressions.EntityExpressionVisitor, null, {
    compile: function (query) {
        this.subqueryIndex = 0;
        var ctx = {};
        var newExpression = this.Visit(query.expression, ctx);
        console.log("Context ", ctx, newExpression.source.selector.expression);
        return {context: query.context, defaultType: query.defaultType, expression: newExpression};
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