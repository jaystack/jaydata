$data.Class.define('$data.oDataParser.EntityExpressionBuilder', null, null, {
    constructor: function (scopeContext, entitySetName) {
        Guard.requireValue("scopeContext", scopeContext);
        this.scopeContext = scopeContext;
        this.entitySetName = entitySetName;
        this.lambdaTypes = [];

    },
    supportedParameters: {
        value: [
            { name: 'expand', expType: $data.Expressions.IncludeExpression },
            { name: 'filter', expType: $data.Expressions.FilterExpression },
            { name: 'inlinecount', expType: $data.Expressions.InlineCountExpression },
            { name: 'orderby', expType: $data.Expressions.OrderExpression },
            { name: 'select', expType: $data.Expressions.ProjectionExpression },
            { name: 'skip', expType: $data.Expressions.PagingExpression },
            { name: 'top', expType: $data.Expressions.PagingExpression }
        ]
    },
    parse: function (queryParams) {
        ///<param name="queryParams" type="Object">{ filter: expression, orderby: [{}] }</param>

        var req = new $data.oDataParser.QueryRequest();
        req = $data.typeSystem.extend(req, queryParams);
        var parser = new $data.oDataParser.RequestParser();
        parser.parse(req);

        return { expression: this.buildExpression(req) };
    },
    buildExpression: function (req) {
        var expression = this.createRootExpression(this.entitySetName);

        for (var i = 0; i < this.supportedParameters.length; i++) {
            var paramName = this.supportedParameters[i].name;
            var funcName = paramName + 'Converter';
            if (typeof this[funcName] === 'function' && req[paramName]) {
                expression = this[funcName].call(this, req[paramName], expression, req);
            }
        }

        if (req.frame) {
            expression = Container['create' + req.frame + 'Expression'](expression);
        } else {
            expression = Container.createToArrayExpression(expression);
        }

        return expression;
    },
    createRootExpression: function (setName) {
        var ec = Container.createEntityContextExpression(this.scopeContext);
        var memberdef = this.scopeContext.getType().getMemberDefinition(setName);
        var es = Container.createEntitySetExpression(ec,
            Container.createMemberInfoExpression(memberdef), null,
            this.scopeContext[setName]);

        this.lambdaTypes.push(es);
        return es;
    },
    filterConverter: function (expr, rootExpr) {
        var pqExp = this._buildParametricQueryExpression(expr, $data.Expressions.FilterExpression);
        var expression = new $data.Expressions.FilterExpression(rootExpr, pqExp);
        return expression;
    },
    orderbyConverter: function (exprObjArray, rootExpr) {
        for (var i = 0; i < exprObjArray.length; i++) {
            var expConf = exprObjArray[i];

            var pqExp = this._buildParametricQueryExpression(expConf.expression, $data.Expressions.OrderExpression);
            rootExpr = new $data.Expressions.OrderExpression(rootExpr, pqExp, $data.Expressions.ExpressionType[expConf.nodeType]);
        }
        return rootExpr;
    },
    selectConverter: function (exprObjArray, rootExpr) {
        //var objectFields = [];
        //for (var i = 0; i < exprObjArray.length; i++) {
        //    var expr = exprObjArray[i];
        //    var ofExpr = new $data.Expressions.ObjectFieldExpression(this.findMemberPathBaseName(expr), expr);
        //    objectFields.push(ofExpr);
        //}

        //var objectLiteralExpr = new $data.Expressions.ObjectLiteralExpression(objectFields);

        var objectLiteralExpr = new $data.Expressions.ObjectLiteralExpression([]);
        var objectLiteralBuilder = new $data.oDataParser.ObjectLiteralBuilderVisitor();
        for (var i = 0; i < exprObjArray.length; i++) {
            var expr = exprObjArray[i];
            objectLiteralBuilder.Visit(expr, objectLiteralExpr);
        }

        var pqExp = this._buildParametricQueryExpression(objectLiteralExpr, $data.Expressions.ProjectionExpression);
        var expression = new $data.Expressions.ProjectionExpression(rootExpr, pqExp);
        return expression;
    },
    findMemberPathBaseName: function (expr) {
        if (expr.expression instanceof $data.Expressions.PropertyExpression)
            return this.findMemberPathBaseName(expr.expression);
        else
            return expr.member.value;
    },
    skipConverter: function (expr, rootExpr) {
        var expression = new $data.Expressions.PagingExpression(rootExpr, expr, $data.Expressions.ExpressionType.Skip);
        return expression;
    },
    topConverter: function (expr, rootExpr) {
        var expression = new $data.Expressions.PagingExpression(rootExpr, expr, $data.Expressions.ExpressionType.Take);
        return expression;
    },
    inlinecountConverter: function(expr, rootExpr){
        return new $data.Expressions.InlineCountExpression(rootExpr, expr);
    },
    expandConverter: function (exprObjArray, rootExpr) {
        if (exprObjArray.length > 0) {
            var included = [];
            for (var i = 0; i < exprObjArray.length; i++) {
                var exprChain = [];
                var path = this._getMemberPath(exprObjArray[i]).split('.');
                var p = path.shift();
                
                //console.log('path', p);
                if (included.indexOf(p) < 0){
                    included.push(p);
                    if (!this.includes) this.includes = [];
                    if (this.includes.indexOf(p) < 0) this.includes.push(p);
                    exprChain.push(new $data.Expressions.ConstantExpression(p, 'string'));
                    //rootExpr = new $data.Expressions.IncludeExpression(rootExpr, new $data.Expressions.ConstantExpression(p, 'string'));
                }
                
                while (path.length){
                    p += '.' + path.shift();
                    //console.log('deep path', p);
                    if (included.indexOf(p) < 0){
                        included.push(p);
                        if (!this.includes) this.includes = [];
                        if (this.includes.indexOf(p) < 0) this.includes.push(p);
                        exprChain.push(new $data.Expressions.ConstantExpression(p, 'string'));
                        //rootExpr = new $data.Expressions.IncludeExpression(rootExpr, new $data.Expressions.ConstantExpression(p, 'string'));
                    }
                }
                
                //console.log(included);
                
                while (exprChain.length){
                    rootExpr = new $data.Expressions.IncludeExpression(rootExpr, exprChain.pop());
                }
            }
        }
        return rootExpr;
    },
    _getMemberPath: function (expr) {
        var ret;
        if (expr.expression && expr.expression instanceof $data.Expressions.PropertyExpression){
            ret = this._getMemberPath(expr.expression) + '.' + expr.member.value;
        }else if (expr.member){
            ret = expr.member.value;
        }else if (expr.value){
            ret = expr.value;
        }
        return ret;
        /*if (expr.expression instanceof $data.Expressions.PropertyExpression){
            var ret = this._getMemberPath(expr.expression) + '.' + expr.member.value;
            return ret;
        }else{
            return expr.member.value;
        }*/
    },
    _buildParametricQueryExpression: function (expression, frameType) {
        //var frameVisitor = new $data.FrameOperationVisitor(this.scopeContext);
        //expression = frameVisitor.Visit(expression);
        
        var constantResolver = Container.createConstantValueResolver(undefined, window, this.scopeContext);
        var parameterProcessor = Container.createParameterResolverVisitor();

        var exp = parameterProcessor.Visit(expression, constantResolver);

        var converter = Container.createCodeToEntityConverter(this.scopeContext);

        var entityExpressionTree = converter.Visit(exp, { queryParameters: undefined, lambdaParameters: this.lambdaTypes, frameType: frameType });

        return Container.createParametricQueryExpression(entityExpressionTree, converter.parameters);

    }
});

$data.Expressions.EntityExpressionVisitor.extend('$data.FrameOperationVisitor', {
    constructor: function(scopeContext){
        this.scopeContext = scopeContext;
    },
    VisitPropertyExpression: function(expression, context){
        return this.Visit(expression.member, context);
    },
    VisitConstantExpression: function(expression, context){
        var value = expression.value;
        if (value.type && (value.type === $data.Expressions.SomeExpression || value.type === $data.Expressions.EveryExpression)){
            var defaultType = this.scopeContext[value.entitySet];
            var converter = Container.createCodeToEntityConverter(this.scopeContext);
            
            var ec = Container.createEntityContextExpression(this.scopeContext);
            var memberdef = this.scopeContext.getType().getMemberDefinition(value.entitySet);
            var es = Container.createEntitySetExpression(ec, Container.createMemberInfoExpression(memberdef), null, this.scopeContext[value.entitySet]);

            var r = converter.Visit(value.expression, { lambdaParameters: [es], frameType: $data.Expressions.FilterExpression });
            
            r = new $data.Expressions.ParametricQueryExpression(r);
            r = new $data.Expressions.FilterExpression(es, r);
            r = new value.type(r);
            r = new $data.Queryable(defaultType, r);
            
            return new $data.Expressions.CallExpression(expression.expression, new $data.Expressions.ConstantExpression(value.type === $data.Expressions.SomeExpression ? 'some' : 'every', 'string'), [new $data.Expressions.ConstantExpression(r, r.getType())]);
        }
    }
});
