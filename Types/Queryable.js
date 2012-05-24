/*
    code comment:

    - constructor:  * nem tartalmazhat <signature> -t
                    * a <description> tag az egesz osztaly leirasa
    - egyeb: ha van <signature>, akkor azon kivul nem lehet <example>
*/

$data.Class.define('$data.Queryable', null, null,
{
    constructor: function (source, rootExpression) {
        /// <description>
        /// class description
        /// </description>
        /// <summary>
        /// Provides a base class for classes supporting JavaScript Language Query
        /// </summary>
        /// <param name="source" type="xxx"></param>
        /// <param name="rootExpression" type="expression"></param>
        ///<param name="source" type="$data.EntitySet" />
        ///<field name="entitySet" type="$data.EntitySet" />
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
        ///<summary>Filters a set of entities using a boolean expression.</summary>
        ///<param name="predicate" type="Function">A boolean query expression</param>
        ///<param name="thisArg" type="Object">The query parameters</param>
        ///<returns type="$data.Queryable" />
        ///<signature>
        ///<summary>Filters a set of entities using a boolean expression formulated as string.</summary>
        ///<param name="predicate" type="string">
        ///The expression body of the predicate function in string. &#10;
        ///To reference the lambda parameter use the 'it' context variable. &#10;
        ///Example: filter("it.Title == 'Hello'")
        ///</param>
        ///<param name="thisArg" type="Object" />
        ///<returns type="$data.Queryable" />
        ///</signature>
        ///<signature>
        ///<summary>Filters a set of entities using a bool expression formulated as a JavaScript function.</summary>
        ///<param name="predicate" type="Function">
        ///<signature>
        ///<summary>ezzel vajh mi lesz?</summary>
        ///<param name="entity" type="$data.Entity" />
        ///<returns type="boolean" />
        ///</signature>
        ///</param>
        ///<param name="thisArg" type="Object" optional="true">
        ///Contains the predicate parameters
        ///</param>
        ///<returns type="$data.Queryable" />
        ///<example>
        ///Filtering a set of entities with a predicate function&#10;
        ///var males = Persons.filter( function( person ) { return person.Gender == 'Male' } );
        ///</example>
        ///<example>
        ///Filtering a set of entities with a predicate function and parameters&#10;
        ///var draftables = Persons.filter( function( person ) {
        ///     return person.Gender == this.gender &amp;&amp; person.Age &gt; this.age
        /// }, { gender: 'Male',  age: 21 });
        ///</example>
        ///<example>
        ///Filtering a set of entities with a predicate as a string and parameters&#10;
        ///var draftables = Persons.filter("it.Gender == this.gender &amp;&amp;  it.Age &gt; this.age",
        /// { gender: 'Male',  age: 21 });
        ///</example>
        ///</signature>

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
        var codeExpression = Container.createCodeExpression(projection, thisArg);
        var exp = Container.createProjectionExpression(this.expression, codeExpression);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    select: function (projection, thisArg) {
        return this.map(projection, thisArg);
    },

    length: function (onResult) {
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
        var pHandler = new $data.PromiseHandler();
        function iteratorFunc(items) { items.forEach(iterator); }
        var cbWrapper = pHandler.createCallback(iteratorFunc);

        var forEachExpression = Container.createForEachExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entitySet.entityContext);
        try {
            var expression = preparator.Visit(forEachExpression);
            this.entitySet.entityContext.log({ event: "EntityExpression", data: expression });

            this.entitySet.executeQuery(Container.createQueryable(this, expression), cbWrapper);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    toArray: function (onResult_items) {
        if (onResult_items instanceof $data.Array)
        {
            return this.forEach(function (item, idx) {
                if (idx === 0)
                    onResult_items.length = 0;

                onResult_items.push(item);
            });
        }


        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult_items);

        var toArrayExpression = Container.createToArrayExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entitySet.entityContext);
        try {
            var expression = preparator.Visit(toArrayExpression);
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
        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, ExpressionType.Take);
        return Container.createQueryable(this, takeExp);
    },
    skip: function (amount) {
        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, ExpressionType.Skip);
        return Container.createQueryable(this, takeExp);
    },

    orderBy: function (selector, thisArg) {
        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, ExpressionType.OrderBy);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    orderByDescending: function (selector, thisArg) {
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
        var constExp = Container.createConstantExpression(selector, "string");
        var takeExp = Container.createIncludeExpression(this.expression, constExp);
        return Container.createQueryable(this, takeExp);
    },

    toTraceString: function (name) {
        var expression = this.expression;

        if (name) {
            expression = Container['create' + name + 'Expression'](expression);
        } else {
            expression = Container.createToArrayExpression(expression);
        }

        var preparator = Container.createQueryExpressionCreator(this.entitySet.entityContext);
        expression = preparator.Visit(expression);

        //this.expression = expression;
        var q = Container.createQueryable(this, expression)
        return q.entitySet.getTraceString(q);
    }

}, null);