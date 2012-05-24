$data.Class.define('$data.Queryable', null, null,
{
    constructor: function (source, rootExpression) {
        /// <description>
        ///		Provides a base class for classes supporting JavaScript Language Query.
        /// </description>
        /// <summary>
        ///		Provides a base class for classes supporting JavaScript Language Query.
        /// </summary>
        /// <param name="source" type="$data.EntitySet" />
        /// <param name="rootExpression" type="$data.Expressions.ExpressionNode"></param>
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
        ///<summary>Where is a convenience alias for C# developers. Use filter instead.</summary>
		///<returns type="$data.Queryable" />
        return this.filter(predicate, params);
    },

    map: function (projection, thisArg) {
		///	<summary>Map specifies the shape or type of each returned element. You can specify whether your results will consist of complete Person objects, just one member, a subset of members, or some completely different result type based on a computation or new object creation. When map produces something other than a copy of the source element, the operation is called a projection. The use of projections to transform data is a powerful capability of JavaScript Language Query expressions.</summary>
        ///	<param name="projection" type="Function">A projection expression</param>
        ///	<param name="thisArg" type="Object">The query parameters</param>
        ///	<returns type="$data.Queryable" />
        ///	<signature>
        ///		<summary>Map specifies the shape or type of each returned element. You can specify whether your results will consist of complete Person objects, just one member, a subset of members, or some completely different result type based on a computation or new object creation. When map produces something other than a copy of the source element, the operation is called a projection. The use of projections to transform data is a powerful capability of JavaScript Language Query expressions.</summary>
        ///		<param name="projection" type="string">
        ///			The expression body of the projection function in string. &#10;
		///			To reference the lambda parameter use the 'it' context variable. &#10;
		///			Example: map("{ i: it.Id, t: it.Title }")
        ///		</param>
        ///		<param name="thisArg" type="Object" />
        ///		<returns type="$data.Queryable" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Map specifies the shape or type of each returned element. You can specify whether your results will consist of complete Person objects, just one member, a subset of members, or some completely different result type based on a computation or new object creation. When map produces something other than a copy of the source element, the operation is called a projection. The use of projections to transform data is a powerful capability of JavaScript Language Query expressions.</summary>
        ///		<param name="projection" type="Function">
        ///			Projection function to specify the shape or type of each returned element.
        ///		</param>
        ///		<param name="thisArg" type="Object" optional="true">
        ///			Contains the projection parameters.
        ///		</param>
        ///		<returns type="$data.Queryable" />
        ///		<example>
		///			Projection to get an array of the full name property of a set of Person entities&#10;
        ///			var personFullNames = Persons.map( function( person ) { return person.FullName; } );
        ///		</example>
        ///		<example>
		///			Projection to get an array of the required fields of Person entities in an anonymous type.&#10;
        ///			var custom = Persons.map( function( person ) {
        ///				return { FullName: person.FullName, Info: { Address: person.Location.Address, Phone: person.Phone } };
        ///			});
        ///		</example>
        ///	</signature>

        var codeExpression = Container.createCodeExpression(projection, thisArg);
        var exp = Container.createProjectionExpression(this.expression, codeExpression);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    select: function (projection, thisArg) {
		///<summary>Select is a convenience alias for C# developers. Use map instead.</summary>
		///<returns type="$data.Queryable" />
        return this.map(projection, thisArg);
    },

    length: function (onResult) {
		///	<summary>Returns the number of entities (or projected object) in a query as the callback parameter.</summary>
        ///	<param name="onResult" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Returns the number of entities (or projected object) in a query as the callback parameter.</summary>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Returns the number of entities (or projected object) in a query as the callback parameter.</summary>
        ///		<param name="onResult" type="Object">
        ///			Object of callback functions to handle success and error. &#10;
		///			Example: { success: function(cnt) { ... }, error: function() { alert("Something went wrong..."); } }
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
		///			Get the count of Person entities. &#10;
        ///			Persons.length( function( cnt ) { alert("There are " + cnt + " person(s) in the database."); } );
        ///		</example>
        ///	</signature>

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
	count: function (onResult) {
		///<summary>Count is a convenience alias for C# developers. Use length instead.</summary>
		///<returns type="$data.Integer" />
        return this.length(onResult);
    },

    forEach: function (iterator) {
		///	<summary>Calls the iterator function for all entity (or projected object) in the query.</summary>
        ///	<param name="iterator" type="Function">Iterator function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Calls the iterator function for all entity (or projected object) in the query.</summary>
        ///		<param name="iterator" type="Function">
        ///			Iterator function to handle the result elements.
        ///		</param>
        ///		<returns type="$data.Promise" />
		///		<example>
		///			Log the full name of each Person. &#10;
        ///			Persons.forEach( function( person ) { console.log(person.FullName; } );
        ///		</example>
        ///	</signature>

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
		///	<summary>Returns the query result as the callback parameter.</summary>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Returns the query result as the callback parameter.</summary>
        ///		<param name="onResult_items" type="Function">
        ///			The callback function to handle the result.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Returns the query result as the callback parameter.</summary>
        ///		<param name="onResult_items" type="Object">
        ///			Object of callback functions to handle success and error. &#10;
		///			Example: { success: function(result) { ... }, error: function() { alert("Something went wrong..."); } }
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
		///			Get all Person entities. &#10;
        ///			Persons.toArray( function( result ) { console.dir(result); } );
        ///		</example>
        ///	</signature>

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
		///	<summary>Filters a set of entities using a boolean expression and returns a single element or throws an error if more than one element is filtered.</summary>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
		///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns a single element or throws an error if more than one element is filtered.</summary>
		///		<param name="filterPredicate" type="string">
		///			Same as in filter.
		///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns a single element or throws an error if more than one element is filtered.</summary>
		///		<param name="filterPredicate" type="Function">
		///			Same as in filter.
		///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
		///			Get "George" from the Person entity set. &#10;
        ///			Persons.single( function( person ) { return person.FirstName == this.name; }, { name: "George" }, {&#10;
		///				success: function ( result ){ ... },&#10;
		///				error: function () { ... }
		///			});
        ///		</example>
        ///	</signature>

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
		///	<summary>Returns only a specified number of elements from the start of the result set.</summary>
        ///	<param name="amount" type="$data.Integer">The number of elements to return.</param>
        ///	<returns type="$data.Queryable" />
        ///	<signature>
        ///		<summary>Returns only a specified number of elements from the start of the result set.</summary>
        ///		<param name="amount" type="$data.Integer">
        ///			The number of elements to skip.
        ///		</param>
        ///		<returns type="$data.Queryable" />
		///		<example>
		///			Log the full name of each Person. &#10;
        ///			Persons.take(10).forEach( function( person ) { console.log(person.FullName; } );
        ///		</example>
        ///	</signature>

        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, ExpressionType.Take);
        return Container.createQueryable(this, takeExp);
    },
    skip: function (amount) {
		///	<summary>Skip a specified number of elements from the start of the result set.</summary>
        ///	<param name="amount" type="$data.Integer">The number of elements to skip.</param>
        ///	<returns type="$data.Queryable" />
        ///	<signature>
        ///		<summary>Skip a specified number of elements from the start of the result set.</summary>
        ///		<param name="amount" type="$data.Integer">
        ///			The number of elements to skip.
        ///		</param>
        ///		<returns type="$data.Queryable" />
		///		<example>
		///			Log the full name of each Person. &#10;
        ///			Persons.skip(1).take(5).forEach( function( person ) { console.log(person.FullName; } );
        ///		</example>
        ///	</signature>

        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, ExpressionType.Skip);
        return Container.createQueryable(this, takeExp);
    },

    orderBy: function (selector, thisArg) {
		///<summary>Order a set of entities using an expression.</summary>
        ///<param name="selector" type="Function">An order expression</param>
        ///<param name="thisArg" type="Object">The query parameters</param>
        ///<returns type="$data.Queryable" />
        ///<signature>
        ///<summary>Order a set of entities using an expression.</summary>
        ///<param name="selector" type="string">
        ///The expression body of the order function in string. &#10;
        ///To reference the lambda parameter use the 'it' context variable. &#10;
        ///Example: orderBy("it.Id")
        ///</param>
        ///<param name="thisArg" type="Object" />
        ///<returns type="$data.Queryable" />
        ///</signature>
        ///<signature>
        ///<summary>Order a set of entities using an expression.</summary>
        ///<param name="selector" type="Function">
        ///</param>
        ///<param name="thisArg" type="Object" optional="true">
        ///Contains the predicate parameters
        ///</param>
        ///<returns type="$data.Queryable" />
        ///<example>
        ///Ordering a set of entities with a predicate function&#10;
        ///var males = Persons.orderBy( function( person ) { return person.Id; } );
        ///</example>
        ///</signature>

        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, ExpressionType.OrderBy);
        var q = Container.createQueryable(this, exp);
        return q;
    },
    orderByDescending: function (selector, thisArg) {
		///<summary>Order a set of entities descending using an expression.</summary>
        ///<param name="selector" type="Function">An order expression</param>
        ///<param name="thisArg" type="Object">The query parameters</param>
        ///<returns type="$data.Queryable" />
        ///<signature>
        ///<summary>Order a set of entities descending using an expression.</summary>
        ///<param name="selector" type="string">
        ///The expression body of the order function in string. &#10;
        ///To reference the lambda parameter use the 'it' context variable. &#10;
        ///Example: orderBy("it.Id")
        ///</param>
        ///<param name="thisArg" type="Object" />
        ///<returns type="$data.Queryable" />
        ///</signature>
        ///<signature>
        ///<summary>Order a set of entities descending using an expression.</summary>
        ///<param name="selector" type="Function">
        ///</param>
        ///<param name="thisArg" type="Object" optional="true">
        ///Contains the predicate parameters
        ///</param>
        ///<returns type="$data.Queryable" />
        ///<example>
        ///Ordering a set of entities with a predicate function&#10;
        ///var males = Persons.orderByDescending( function( person ) { return person.Id; } );
        ///</example>
        ///</signature>

        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, ExpressionType.OrderByDescending);
        var q = Container.createQueryable(this, exp);
        return q;
    },

    first: function (filterPredicate, thisArg, onResult) {
		///	<summary>Filters a set of entities using a boolean expression and returns the first element.</summary>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
		///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns the first element.</summary>
		///		<param name="filterPredicate" type="string">
		///			Same as in filter.
		///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns the first element.</summary>
		///		<param name="filterPredicate" type="Function">
		///			Same as in filter.
		///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
		///			Get "George" from the Person entity set. &#10;
        ///			Persons.first( function( person ) { return person.FirstName == this.name; }, { name: "George" }, function ( result ){ ... });
        ///		</example>
        ///	</signature>

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
		///	<summary>Includes the given entity set in the query if it's an inverse property.</summary>
        ///	<param name="selector" type="$data.String">Entity set name</param>
        ///	<returns type="$data.Queryable" />
        ///	<signature>
        ///		<summary>Includes the given entity set in the query if it's an inverse property.</summary>
        ///		<param name="selector" type="$data.String">
        ///			The name of the entity set you want to include in the query.
        ///		</param>
        ///		<returns type="$data.Queryable" />
		///		<example>
		///			Include the Category on every Article. &#10;
        ///			Articles.include("Category");
        ///		</example>
        ///	</signature>

        var constExp = Container.createConstantExpression(selector, "string");
        var takeExp = Container.createIncludeExpression(this.expression, constExp);
        return Container.createQueryable(this, takeExp);
    },

    toTraceString: function (name) {
		///	<summary>Returns the trace string of the query.</summary>
        ///	<param name="name" type="$data.String">Name of the execution method (toArray, length, etc.).</param>
        ///	<returns type="$data.String" />
        ///	<signature>
        ///		<summary>Returns the trace string of the query.</summary>
        ///		<param name="name" type="$data.String">
        ///			Name of the execution method (toArray, length, etc.). Optional. Default value is "toArray".
        ///		</param>
        ///		<returns type="$data.String" />
		///		<example>
		///			Get the trace string for Articles.toArray() &#10;
        ///			Articles.toTraceString();
        ///		</example>
        ///	</signature>

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