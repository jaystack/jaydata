$C('$data.Expressions.QueryExpressionCreator', $data.Expressions.EntityExpressionVisitor, null, {
    constructor: function (scopeContext) {
        ///<param name="scopeContext" type="$data.Expressions.EntityContext" />
        Guard.requireValue("scopeContext", scopeContext);
        this.scopeContext = scopeContext;
    },
    VisitEntitySetExpression: function (expression, context) {
        if (expression.source instanceof $data.Expressions.EntityContextExpression) {
            this.lambdaTypes.push(expression);
        }
        return expression;
    },

    VisitServiceOperationExpression: function (expression, context) {
        if (expression.source instanceof $data.Expressions.EntityContextExpression) {
            this.lambdaTypes.push(expression);
        }
        return expression;
    },

    VisitCodeExpression: function (expression, context) {
        ///<summary>Converts the CodeExpression into an EntityExpression</summary>
        ///<param name="expression" type="$data.Expressions.CodeExpression" />
        var source = expression.source.toString();
        var jsCodeTree = Container.createCodeParser(this.scopeContext).createExpression(source);
        this.scopeContext.log({ event: "JSCodeExpression", data: jsCodeTree });

        //TODO rename classes to reflex variable names
        //TODO engage localValueResolver here
        //var globalVariableResolver = Container.createGlobalContextProcessor(window);
        var constantResolver = Container.createConstantValueResolver(expression.parameters, window, this.scopeContext);
        var parameterProcessor = Container.createParameterResolverVisitor();

        jsCodeTree = parameterProcessor.Visit(jsCodeTree, constantResolver);

        this.scopeContext.log({ event: "JSCodeExpressionResolved", data: jsCodeTree });
        var code2entity = Container.createCodeToEntityConverter(this.scopeContext);

        ///user provided query parameter object (specified as thisArg earlier) is passed in
        var entityExpression = code2entity.Visit(jsCodeTree, {  queryParameters: expression.parameters, lambdaParameters: this.lambdaTypes, frameType: context.frameType });

        ///parameters are referenced, ordered and named, also collected in a flat list of name value pairs
        var result = Container.createParametricQueryExpression(entityExpression, code2entity.parameters);
        this.scopeContext.log({ event: "EntityExpression", data: entityExpression });

        return result;
    },


    VisitFilterExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        context = context || {};
        context.frameType = expression.getType();
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createFilterExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitInlineCountExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        context = context || {};
        context.frameType = expression.getType();
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createInlineCountExpression(source, selector, expression.params, expression.instance);
        }
        return expression;
    },

    VisitProjectionExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        context = context || {};
        context.frameType = expression.getType();
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            var expr = Container.createProjectionExpression(source, selector, expression.params, expression.instance);
            expr.projectionAs = expression.projectionAs;
            return expr;
        }
        return expression;
    },

    VisitOrderExpression: function (expression, context) {
        var source = this.Visit(expression.source, context);
        context = context || {};
        context.frameType = expression.getType();
        var selector = this.Visit(expression.selector, context);
        if (source !== expression.source || selector !== expression.selector) {
            return Container.createOrderExpression(source, selector, expression.nodeType);
        }
        return expression;
    }
});