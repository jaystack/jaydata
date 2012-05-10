///Queryable
///Object that provides standard query methods like where, select, top, etc

$data.Class.define('$data.Queryable', null, null,
{
    constructor: function (source, rootExpression) {
        ///<param name="source" type="$data.EntitySet" />
        ///<field name="entitySet" type="$data.EntitySet" />
        ///source can be: array or an object that is IQueryProvider
        var es = source.entitySet instanceof $data.EntitySet ? source.entitySet : source;
        Object.defineProperty(this, "entitySet", { value: es, enumerable: true, writable: true });

        this.expression = rootExpression;
    },
    _checkRootExpression: function () {
        if (!this.expression) {
            var ec = Container.createEntityContextExpression(this.entitySet.entityContext);
            var name = this.entitySet.collectionName;
            var memberdef = this.entitySet.entityContext.getType().getMemberDefinition(name);
            var es = Container.createEntitySetExpression(ec,
                Container.createMemberInfoExpression(memberdef), null,
                this.entitySet);
            this.expression = es;
        }
    },

    entitySet: {},

    filter: function (predicate, thisArg) {
        /// <param name="predicate" type="Function">
        /// <signature>
        /// <param name="entity" type="$data.Entity" />
        /// <param name="thisArg" type="Object" optional="true" />
        /// </signature>
        /// </param>
        this._checkRootExpression();
        var expression = Container.createCodeExpression(predicate, thisArg);
        var expressionSource = this.expression;
        if (this.expression instanceof $data.Expressions.FilterExpression) {
            expressionSource = this.expression.source;

            var operatorResolution = this.entitySet.entityContext.storageProvider.resolveBinaryOperator("and");
            expression = Container.createSimpleBinaryExpression(this.expression.selector, expression, "and", "filter", "boolean", operatorResolution);
        }
        var exp = Container.createFilterExpression(expressionSource, expression);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    where: function (predicate, params) {
        ///<summary>where is a convenience alias for C# developers. use filter instead.</summary>
        return this.filter(predicate, params);
    },

    map: function (projection, thisArg) {
        this._checkRootExpression();
        var codeExpression = Container.createCodeExpression(projection, thisArg);
        var exp = Container.createProjectionExpression(this.expression, codeExpression);
        var q = Container.createQueryable(this, exp);
        return q;
    },

    select: function (projection, thisArg) {
        return this.map(projection, thisArg);
    },

    length: function (onResult) {
        this._checkRootExpression();
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var countExpression = Container.createCountExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entitySet.entityContext);
        try {
            var expression = preparator.Visit(countExpression);
            this.entitySet.entityContext.log({ event: "EntityExpression", data: expression });

            this.entitySet.executeQuery(Container.createQueryable(this, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }
        return pHandler.getPromise();

    },

    forEach: function (iterator) {
        this._checkRootExpression();
        var pHandler = new $data.PromiseHandler();
        function iteratorFunc(items) { items.forEach(iterator); }
        var cbWrapper = pHandler.createCallback(iteratorFunc);

        var preparator = Container.createQueryExpressionCreator(this.entitySet.entityContext);
        try {
            var expression = preparator.Visit(this.expression);
            this.entitySet.entityContext.log({ event: "EntityExpression", data: expression });

            this.entitySet.executeQuery(Container.createQueryable(this, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    toArray: function (onResult_items) {
        this._checkRootExpression();
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult_items);

        var preparator = Container.createQueryExpressionCreator(this.entitySet.entityContext);
        try {
            var expression = preparator.Visit(this.expression);
            this.entitySet.entityContext.log({ event: "EntityExpression", data: expression });

            this.entitySet.executeQuery(Container.createQueryable(this, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    single: function (filterPredicate, thisArg, onResult) {
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(2);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var singleExpression = Container.createSingleExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entitySet.entityContext);
        try {
            var expression = preparator.Visit(singleExpression);
            this.entitySet.entityContext.log({ event: "EntityExpression", data: expression });

            q.entitySet.executeQuery(Container.createQueryable(q, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },


    take: function (amount) {
        this._checkRootExpression();
        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, ExpressionType.Take);
        return Container.createQueryable(this, takeExp);
    },
    skip: function (amount) {
        this._checkRootExpression();
        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, ExpressionType.Skip);
        return Container.createQueryable(this, takeExp);
    },

    orderBy: function (selector, thisArg) {
        this._checkRootExpression();
        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, ExpressionType.OrderBy);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    orderByDescending: function (selector, thisArg) {
        this._checkRootExpression();
        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, ExpressionType.OrderByDescending);
        var q = Container.createQueryable(this, exp);
        return q;
    },

    first: function (filterPredicate, thisArg, onResult) {
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(1);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var firstExpression = Container.createFirstExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entitySet.entityContext);
        try {
            var expression = preparator.Visit(firstExpression);
            q.entitySet.entityContext.log({ event: "EntityExpression", data: expression });

            q.entitySet.executeQuery(Container.createQueryable(q, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },


    include: function (selector) {
        this._checkRootExpression();
        var constExp = Container.createConstantExpression(selector, "string");
        var takeExp = Container.createIncludeExpression(this.expression, constExp);
        return Container.createQueryable(this, takeExp);
    },

    _makeChain: function (fx, args) {
        var q = new $data.Queryable_old(this.entitySet);
        q.operation = { fx: fx, args: args };
        q.prev = this;
        /*q.entitySet = this.entitySet ? this.entitySet : this;*/
        return q;
    },
    _makeChain2: function (operation) { // {name, arity, fn, prm}
        var q = new $data.Queryable_old(this.entitySet);
        q.operation = operation;
        q.prev = this;
        /*q.entitySet = this.entitySet ? this.entitySet : this;*/
        return q;
    },


    toTraceString: function () {
        this._checkRootExpression();
        var expression = this.expression;
        var preparator = Container.createQueryExpressionCreator(this.entitySet.entityContext);
        expression = preparator.Visit(expression);
        this.expression = expression;
        return this.entitySet.getTraceString(this);
    },

    createExpression: function () {
        this.expressions = [];
        var step = this;
        var frame;
        while (frame = step.operation) {
            switch (frame.name) {
                case "orderBy":
                case "orderByDescending":
                case "where":
                case "select":
                    var exp = this._getTree(frame);
                    exp.name = frame.name;
                    this.expression.push(exp);
                    break;
                case "take":
                case "skip":
                case "include":
                    this.expression.push({
                        name: frame.name,
                        expression: $data.expressions.expressionNodeTypes.LiteralExpressionNode.create(false, "number", frame.amount),
                        lambdaParams: [],
                        paramContext: {}
                    });
                    break;
                default:
                    Guard.raise("Not implemented: frame.name = '" + frame.name + "'");
            }
            step = step.prev;
        }
        return this.expressions;
    },
    //================================================================ <gyeby>
    _getTree: function (operation) {
        window["idvalue"] = 15;

        // suspicious code
        /*if (operation.name == "where") {
            //TODO: fix this
        }*/

        //var result = {


        //codeParser.createExpression
        //return;

        var x = JSLINT(operation.fn.toString());
        var tree = JSLINT.tree;
        var err = JSLINT.errors;

        // #1: getting first function
        var n = tree.first[0]; // function
        if (!n)
            Guard.raise("Lambda function not found");

        // #2: building the context (lambdaParams & paramContext)
        var params = n.first.slice();
        if (params.length < operation.arity)
            Guard.raise(new Exception("Not enough lambda parameters. Expected: " + arity, "InvalidOperaion", {}));
        if (params.length > operation.arity + 1)
            Guard.raise(new Exception("Too many lambda parameters. Expected: " + arity, "InvalidOperaion", {}));

        var lambdaParams = new Array();
        for (var i = 0; i < operation.arity; i++)
            lambdaParams[i] = params[i].value;

        var context = { paramContext: (operation.prm ? operation.prm : {}), lambdaParams: lambdaParams, operation: operation.name };
        if (params.length > operation.arity)
            context.paramsName = params[operation.arity].value;

        // #3: skipping to expression after 'return'
        var lambdaBlock = n.block;
        if (!lambdaBlock)
            Guard.raise("Lambda function hasn't 'block'.");
        //console.assert(lambdaBlock.length == 1, "lambdaBlock is longer than 1");
        n = lambdaBlock[0];
        if (n.value == "return" && n.arity == "statement")
            n = n.first; //Guard.raise("Lambda function body is invalid. Expected: return [expression];");
        //-- check: JSON.stringify(tree, ["type", 'value', 'arity', 'name', 'first', 'second', 'third', 'block', 'else'], 4);

        // #4: building expression tree
        var t = new $data.expressions.ExpressionBuilder(context).Build(n);
        //-- check: JSON.stringify(t, ["type", "executable", "member", "object", "method", "args", "value", "valueType", "name", "operator", "left", "right", "operand", "suffix", "expression", "array", "index", "subType"], 4)

        // #5: setting executables
        var t1 = new $data.expressions.SetExecutableVisitor().Visit(t, context);

        // #6: executing executables
        var t2 = new $data.expressions.ExecutorVisitor().Visit(t1, context);

        context.expression = t2;
        return context;
    }
}, null);