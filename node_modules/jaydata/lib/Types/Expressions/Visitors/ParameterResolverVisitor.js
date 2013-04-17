$C('$data.Expressions.ParameterResolverVisitor', $data.Expressions.ExpressionVisitor, null, {

    constructor: function (expression, resolver) {
    	/// <summary>
    	/// ParameterResolverVisitor traverses the JavaScript Code Expression tree and converts
        /// outer but otherwise execution local variable references into ConstantExpressions-t.
        /// for example: context.Persons.filter(function(p) { return p.Name == document.location.href })
        /// is transformed into a constant that has the current href as its value
    	/// </summary>
    	/// <param name="expression"></param>
    	/// <param name="resolver"></param>
        this.lambdaParamCache = {};
    },

    Visit: function (expression, resolver) {
        ///<param name="expression" type="$data.Expressions.ExpressionNode" />
        ///<param name="resolver" type="$data.Expressions.Resolver" />
        //TODO base call is just ugly
        return $data.Expressions.ExpressionVisitor.prototype.Visit.call(this, expression, resolver);

    },


    VisitArrayLiteral: function(eNode, context) {
        var self = this;
        var items = eNode.items.map(function (item) { return self.Visit(item, context); });
        var allLocal = items.every(function (item) {
            return item instanceof $data.Expressions.ConstantExpression;
        });

        if (allLocal) {
            items = items.map(function (item) { return item.value });
            return Container.createConstantExpression(items, "array");
        } else {
            return Container.createArrayLiteralExpression(items);
        }
    },

    VisitObjectLiteral: function(eNode, context) {
        var self = this;
        var members = eNode.members.map(function (item) { return self.Visit(item, context); });
        var allLocal = members.every(function (member) {
            return member.expression instanceof $data.Expressions.ConstantExpression;
        });

        if (allLocal) {
            var params = members.map(function (member) { return { name: member.fieldName, value: member.expression.value }; });
            var value = eNode.implementation(params);
            return Container.createConstantExpression(value, typeof value);
        } else {
            return Container.createObjectLiteralExpression(members);
        }
    },

    VisitThis: function(eNode, resolver) {
        return resolver.Visit(eNode, resolver);
    },

    VisitParameter: function(eNode, resolver) {
        ///<param name="eNode" type="$data.Expressions.ParameterExpression" />
        ///<param name="resovler" type="$data.Expressions.ParameterResolver" />
        ///<returns type="$data.Expressions.ParameterExpression" />

        var node;
        ///TODO let the resolver handle lambdaReferences if it wants to deal with it
        switch(eNode.nodeType){
            case $data.Expressions.ExpressionType.Parameter:
            case $data.Expressions.ExpressionType.LambdaParameter:
                node = resolver.Visit(eNode, resolver);
                if (node.nodeType == $data.Expressions.ExpressionType.LambdaParameter) {
                    this.lambdaParamCache[node.name] = node;
                }
                return node;
            case $data.Expressions.ExpressionType.LambdaParameterReference:
                var lambdaParam = this.lambdaParamCache[eNode.name];
                if (lambdaParam) {
                    node = Container.createParameterExpression(eNode.name,
                            lambdaParam.type,
                            $data.Expressions.ExpressionType.LambdaParameterReference);
                    node.paramIndex = eNode.paramIndex;
                    //node.typeName = lambdaParam.type.name || lambdaParam.type;
                    return node;
                }
                break;
            default:
                return eNode;

        }
            

        return eNode;
    },

    VisitConstant: function (eNode, context) {
        ///<param name="eNode" type="$data.Expressions.ParameterExpression" />
        ///<returns type="$data.Expressions.ParameterExpression" />
        return eNode;
    },

    VisitFunction: function(eNode, context) {
        ///<param name="eNode" type="$data.Expressions.FunctionExpression" />

        var self = this;
        var params = eNode.parameters.map(function (p, i) {
            var result = self.Visit(p, context);
            return result;
        });
        var body = self.Visit(eNode.body, context);
        var result = new $data.Expressions.FunctionExpression(eNode.name, params, body);

        return result;
    },

    VisitBinary: function (eNode, context) {
        ///<summary></summary>
        ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>
        ///<param name="context" type="Object"/>
        ///<return type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>

        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        var expr = $data.Expressions;

        if (left instanceof expr.ConstantExpression && right instanceof expr.ConstantExpression) 
        {
                var result = eNode.implementation(left.value, right.value);
                return Container.createConstantExpression(result, typeof result);
        }
        return new Container.createSimpleBinaryExpression(left, right, eNode.nodeType, eNode.operator, eNode.type);
    },

    VisitUnary: function (eNode, context) {
        ///<summary></summary>
        ///<param name="eNode" type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>
        ///<param name="context" type="Object"/>
        ///<return type="$data.Expressions.ExpressionNodeTypes.BinaryExpressionNode"/>

        var operand = this.Visit(eNode.operand, context);
        //var imp = $data.unaryOperators.getOperator(
        var expr = $data.Expressions;
        if (operand  instanceof expr.ConstantExpression)
        {
                var result = eNode.operator.implementation(operand.value);
                return Container.createConstantExpression(result, typeof result);
        }
        return new Container.createUnaryExpression(operand, eNode.operator, eNode.nodeType);
    },

    VisitProperty: function (eNode, context) {
        ///<param name="eNode" type="$data.Expressions.PropertyExpression" />
        var expression = this.Visit(eNode.expression, context);
        var member = this.Visit(eNode.member, context);
        var result;
        if (expression instanceof $data.Expressions.ConstantExpression &&
            member instanceof $data.Expressions.ConstantExpression) {
            ///TODO implement checking for the member, throw on error
            result = eNode.implementation(expression.value, member.value);

            //Method call processed before
            //if (typeof result === 'function') {
            //    return new $data.Expressions.ConstantExpression(
            //        function () { return result.apply(expression.value, arguments); });
            //}
            return Container.createConstantExpression(result, typeof result, expression.name + '$' + member.value);
        }
        if (expression === eNode.expression && member === eNode.member)
            return eNode;
  
        result = Container.createPropertyExpression(expression, member);
        return result;
    },

    VisitCall: function (eNode, context) {
        ///<param name="eNode" type="$data.Expressions.CallExpression" />
        function isExecutable(args, body, obj) {
            return body instanceof $data.Expressions.ConstantExpression &&
                //global methods will not have a this.
                (!obj || obj instanceof $data.Expressions.ConstantExpression) &&
                args.every(function(item) {
                    return item instanceof $data.Expressions.ConstantExpression;
                });
        }
        var call = $data.Expressions.ExpressionVisitor.prototype.VisitCall.apply(this, arguments);
        var obj = call.expression;
        var body  = call.member;
        var args = call.args;

        function convertToValue(arg) {
            if (arg instanceof $data.Expressions.ConstantExpression)
                return arg.value;
            return arg;
        };

        if (isExecutable(args, body, obj)) {
            var fn = body.value;
            if (typeof fn === 'string' && obj.value) {
                fn = obj.value[fn];
            }
            if (typeof fn !== 'function') {
                //TODO dig that name out from somewhere
                Guard.raise("Constant expression is not a method...");
            }
            var value = eNode.implementation(obj.value, fn, args.map(convertToValue));
            return new $data.Expressions.ConstantExpression(value, typeof value);
        }
        return call;
    }
}, {});
$C("$data.Expressions.AggregatedVisitor", $data.Expressions.ExpressionVisitor, null, {
    constructor: function (visitors) {
        ///<param name="resolver" type="Array" elementType="$data.Expression.ParameterResolver" />

        this.Visit = function (node, context) {
            for (var i = 0; i < visitors.length; i++) {
                var n = visitors[i].Visit(node, context);
                if (n !== node)
                    return n;
            }
            return node;
        };
    }

});
