$data.Class.define('$data.Queryable', null, null,
{
    constructor: function (source, rootExpression) {
        ///	<signature>
        /// <summary>Provides a base class for classes supporting JavaScript Language Query.</summary>
        /// <description>Provides a base class for classes supporting JavaScript Language Query.</description>
        /// <param name="source" type="$data.EntitySet" />
        /// <param name="rootExpression" type="$data.Expressions.ExpressionNode"></param>
        ///	</signature>
        ///	<signature>
        /// <summary>Provides a base class for classes supporting JavaScript Language Query.</summary>
        /// <description>Provides a base class for classes supporting JavaScript Language Query.</description>
        /// <param name="source" type="$data.EntityContext" />
        /// <param name="rootExpression" type="$data.Expressions.ExpressionNode"></param>
        ///	</signature>

        var context = source instanceof $data.EntityContext ? source : source.entityContext;
        this.defaultType = source instanceof $data.EntityContext ? null : source.defaultType;
        this.entityContext = context;
        this.expression = rootExpression;
    },

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
        if (arguments.length === 3) {
            predicate = "it." + arguments[0] + 
                (arguments[1][0] === "." ? (arguments[1] + "(param)") : (" " + arguments[1] + " param"));
            thisArg = { param : arguments[2] }
        }
        this._checkOperation('filter');
        var expression = Container.createCodeExpression(predicate, thisArg);
        var expressionSource = this.expression;
        if (this.expression instanceof $data.Expressions.FilterExpression) {
            expressionSource = this.expression.source;

            var operatorResolution = this.entityContext.storageProvider.resolveBinaryOperator("and");
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

    map: function (projection, thisArg, mappedTo) {
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

        this._checkOperation('map');
        var codeExpression = Container.createCodeExpression(projection, thisArg);
        var exp = Container.createProjectionExpression(this.expression, codeExpression);

        if (mappedTo === 'default')
            exp.projectionAs = this.defaultType;
        else if (mappedTo)
            exp.projectionAs = Container.resolveType(mappedTo);
        else
            exp.projectionAs = $data.Object;

        var q = Container.createQueryable(this, exp);
        return q;
    },
    select: function (projection, thisArg, mappedTo) {
		///<summary>Select is a convenience alias for C# developers. Use map instead.</summary>
		///<returns type="$data.Queryable" />
        return this.map(projection, thisArg, mappedTo);
    },

    length: function (onResult, transaction) {
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

        this._checkOperation('length');
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var countExpression = Container.createCountExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(countExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper, transaction);
        } catch (e) {
            cbWrapper.error(e);
        }
		
        return pHandler.getPromise();
    },
	count: function (onResult, transaction) {
		///<summary>Count is a convenience alias for C# developers. Use length instead.</summary>
		///<returns type="$data.Integer" />
	    return this.length(onResult, transaction);
    },

	forEach: function (iterator, transaction) {
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

        this._checkOperation('forEach');
        var pHandler = new $data.PromiseHandler();
        function iteratorFunc(items) { items.forEach(iterator); }
        var cbWrapper = pHandler.createCallback(iteratorFunc);

        var forEachExpression = Container.createForEachExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(forEachExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper, transaction);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

	toArray: function (onResult_items, transaction) {
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
            return this.toArray(function (results) {
                onResult_items.length = 0;
                results.forEach(function (item, idx) {
                    onResult_items.push(item);
                });
            });
        }

        this._checkOperation('toArray');
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult_items);

        var toArrayExpression = Container.createToArrayExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(toArrayExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper, transaction);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
	},
	toLiveArray: function (onResult, transaction) {
	    var self = this;
	    var result = [];

	    var doAction = function (action) {
	        return function (onResult) {
	            var pHandler = new $data.PromiseHandler();
	            var callback = pHandler.createCallback(onResult);

	            var successFunc = function (res) {
	                result.length = 0;

	                var data = res;
	                $data.typeSystem.extend(result, data);

	                result.prev = doAction(function (cb) {
	                    data.prev(cb);
	                });
	                result.next = doAction(function (cb) {
	                    data.next(cb);
	                });

	                callback.success.apply(this, [result].concat(Array.prototype.slice.call(arguments, 1)));
	            }

	            action({
	                success: successFunc,
	                error: callback.error
	            }, transaction);

	            var promise = pHandler.getPromise();
	            $data.typeSystem.extend(result, promise);

	            return result;
	        }
	    }

	    result.refresh = doAction(function (cb) {
	        self.toArray(cb);
	    });

	    return result.refresh.apply(result, arguments);
	},

	single: function (filterPredicate, thisArg, onResult, transaction) {
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

        this._checkOperation('single');
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(2);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var singleExpression = Container.createSingleExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entityContext);
        try {
            var expression = preparator.Visit(singleExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            q.entityContext.executeQuery(Container.createQueryable(q, expression), cbWrapper, transaction);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

	some: function (filterPredicate, thisArg, onResult, transaction) {
        ///	<summary>Filters a set of entities using a boolean expression and returns true if the query has any result element.</summary>
        ///	<param name="filterPredicate" type="Function">Filter function</param>
        ///	<param name="thisArg" type="Function">The query parameters for filter function</param>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns true if the query has any result element.</summary>
        ///		<param name="filterPredicate" type="string">
        ///			Same as in filter.
        ///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns true if the query has any result element.</summary>
        ///		<param name="filterPredicate" type="Function">
        ///			Same as in filter.
        ///		</param>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result, same as in toArray.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
        ///         Is there any person who's first name is "George"? &#10;
        ///			Persons.some( function( person ) { return person.FirstName == this.name; }, { name: "George" }, {&#10;
        ///				success: function ( result ){ ... },&#10;
        ///				error: function () { ... }
        ///			});
        ///		</example>
        ///	</signature>

        this._checkOperation('some');
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(1);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var someExpression = Container.createSomeExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entityContext);
        try {
            var expression = preparator.Visit(someExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            q.entityContext.executeQuery(Container.createQueryable(q, expression), cbWrapper, transaction);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

	every: function (filterPredicate, thisArg, onResult, transaction) {
        ///	<summary>Filters a set of entities using a boolean expression and returns true if all elements of the EntitySet is in the result set.</summary>
        ///	<param name="filterPredicate" type="Function">Filter function</param>
        ///	<param name="thisArg" type="Function">The query parameters for filter function</param>
        ///	<param name="onResult_items" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Filters a set of entities using a boolean expression and returns a </summary>
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
        ///			Result is true when all person are married. &#10;
        ///			Persons.every( function( person ) { return person.Married == true; }, null, {&#10;
        ///				success: function ( result ){ ... },&#10;
        ///				error: function () { ... }
        ///			});
        ///		</example>
        ///	</signature>

        this._checkOperation('every');
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(1);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var everyExpression = Container.createEveryExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entityContext);
        try {
            var expression = preparator.Visit(everyExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            q.entityContext.executeQuery(Container.createQueryable(q, expression), cbWrapper, transaction);
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

        this._checkOperation('take');
        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, $data.Expressions.ExpressionType.Take);
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

        this._checkOperation('skip');
        var constExp = Container.createConstantExpression(amount, "number");
        var takeExp = Container.createPagingExpression(this.expression, constExp, $data.Expressions.ExpressionType.Skip);
        return Container.createQueryable(this, takeExp);
    },

    order: function(selector) {
       if (selector === '' || selector === undefined || selector === null) {
           return this;
       }
       if(selector[0] === "-") {
           var orderString = "it." + selector.replace("-","");
           return this.orderByDescending(orderString);
       } else {
           return this.orderBy("it." + selector);
       }

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

        this._checkOperation('orderBy');
        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, $data.Expressions.ExpressionType.OrderBy);
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

        this._checkOperation('orderByDescending');
        var codeExpression = Container.createCodeExpression(selector, thisArg);
        var exp = Container.createOrderExpression(this.expression, codeExpression, $data.Expressions.ExpressionType.OrderByDescending);
        var q = Container.createQueryable(this, exp);
        return q;
    },

    first: function (filterPredicate, thisArg, onResult, transaction) {
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

        this._checkOperation('first');
        var q = this;
        if (filterPredicate) {
            q = this.filter(filterPredicate, thisArg);
        }
        q = q.take(1);

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var firstExpression = Container.createFirstExpression(q.expression);
        var preparator = Container.createQueryExpressionCreator(q.entityContext);
        try {
            var expression = preparator.Visit(firstExpression);
            q.entityContext.log({ event: "EntityExpression", data: expression });

            q.entityContext.executeQuery(Container.createQueryable(q, expression), cbWrapper, transaction);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },

    find: function (keyValue, onResult, transaction) {

        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var keys = this.defaultType.memberDefinitions.getKeyProperties();

        try {

            if (keys.length === 1 && typeof keyValue !== 'object') {
                var keyV = {};
                keyV[keys[0].name] = keyValue;
                keyValue = keyV;
            }

            if (typeof keyValue !== 'object') {
                throw new Exception('Key parameter is invalid');
            } else {


                var parameters = [];
                for (var i = 0; i < keys.length; i++) {
                    var keyProp = keys[i];
                    if (!(keyProp.name in keyValue)) {
                        throw new Exception('Key value missing');
                    }
                    parameters.push(Container.createConstantExpression(keyValue[keyProp.name], keyProp.type, keyProp.name));
                }

                var operation = this.entityContext.storageProvider.supportedSetOperations['find'];
                if (operation) {

                    var findExpression = Container.createFindExpression(this.expression, parameters);
                    var preparator = Container.createQueryExpressionCreator(this.entityContext);
                    try {
                        var expression = preparator.Visit(findExpression);
                        this.entityContext.log({ event: "EntityExpression", data: expression });

                        this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper, transaction);
                    } catch (e) {
                        cbWrapper.error(e);
                    }

                } else {
                    var predicate = '';
                    var params = {}
                    for (var i = 0; i < parameters.length; i++) {
                        var param = parameters[i];
                        params[param.name] = param.value;
                        if (i > 0) predicate += ' && ';
                        predicate += "it." + param.name + " == this." + param.name;
                    }

                    this.single(predicate, params, cbWrapper, transaction);
                }
            }
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

        this._checkOperation('include');
        var constExp = Container.createConstantExpression(selector, "string");
        var takeExp = Container.createIncludeExpression(this.expression, constExp);
        return Container.createQueryable(this, takeExp);
    },

    withInlineCount: function (selector) {
        this._checkOperation('withInlineCount');
        var constExp = Container.createConstantExpression(selector || 'allpages', "string");
        var inlineCountExp = Container.createInlineCountExpression(this.expression, constExp);
        return Container.createQueryable(this, inlineCountExp);
    },

    removeAll: function (onResult, transaction) {
        ///	<summary>Delete the query result and returns the number of deleted entities in a query as the callback parameter.</summary>
        ///	<param name="onResult" type="Function">A callback function</param>
        ///	<returns type="$data.Promise" />
        ///	<signature>
        ///		<summary>Delete the query result and returns the number of deleted entities in a query as the callback parameter.</summary>
        ///		<param name="onResult" type="Function">
        ///			The callback function to handle the result.
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///	</signature>
        ///	<signature>
        ///		<summary>Delete the query result and returns the number of deleted entities in a query as the callback parameter.</summary>
        ///		<param name="onResult" type="Object">
        ///			Object of callback functions to handle success and error. &#10;
        ///			Example: { success: function(result) { ... }, error: function() { alert("Something went wrong..."); } }
        ///		</param>
        ///		<returns type="$data.Promise" />
        ///		<example>
        ///			Delete all People who are younger than 18 years old. &#10;
        ///			Persons.filter( function( p ){ return p.Age &#60; 18; } ).removeAll( function( result ) { console.dir(result); } );
        ///		</example>
        ///	</signature>

        this._checkOperation('batchDelete');
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult);

        var batchDeleteExpression = Container.createBatchDeleteExpression(this.expression);
        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(batchDeleteExpression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper, transaction);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
    },


    _runQuery: function (onResult_items, transaction) {
        var pHandler = new $data.PromiseHandler();
        var cbWrapper = pHandler.createCallback(onResult_items);

        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        try {
            var expression = preparator.Visit(this.expression);
            this.entityContext.log({ event: "EntityExpression", data: expression });

            this.entityContext.executeQuery(Container.createQueryable(this, expression), cbWrapper, transaction);
        } catch (e) {
            cbWrapper.error(e);
        }

        return pHandler.getPromise();
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

        var preparator = Container.createQueryExpressionCreator(this.entityContext);
        expression = preparator.Visit(expression);

        //this.expression = expression;
        var q = Container.createQueryable(this, expression)
        return q.entityContext.getTraceString(q);
    },

    _checkOperation: function (name) {
        var operation = this.entityContext.resolveSetOperations(name);
        if (operation.invokable != undefined && !operation.invokable)
            Guard.raise(new Exception("Operation '" + name + "' is not invokable with the provider"));
    },
    defaultType: {}

}, null);
