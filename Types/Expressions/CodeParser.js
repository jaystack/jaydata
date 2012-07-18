$C('$data.Expressions.CodeParser', null, null, {

    constructor: function (scopeContext) {
        ///<signature>
        ///<param name="scopeContext" type="$data.Expressions.EntityContext" />
        ///</signature>
        ///<signature>
        ///</signature>
        this.scopeContext = scopeContext;
        this.lambdaParams = [];
    },

    log: function(logInfo) {
        if (this.scopeContext)
            this.scopeContext.log(logInfo);
    },

    parseExpression: function (code, resolver) {
        ///<signature>
        ///<summary>Parses the provided code and returns a parser result with parser information</summary>
        ///<param name="code" type="string">The JavaScript code to parse &#10;ex: "function (a,b,c) { return a + b /c }"</param>
        ///<param name="resolver" type="string">The ParameterResolver class that resolves vaiable and parameteres references</param>
        ///<returns type="$data.Expressions.ExpressionParserResult" />
        ///</signature>
        if (typeof code === 'object') { code = ''; }
        var result = {
            success: true,
            errorMessage: '',
            errorDetails: ''
        };
        ///<var name="AST" type="Date" />
        var AST = $data.ASTParser.parseCode(code);
        this.log({ event: "AST", data: AST });
        if (!AST.success) {
            return {
                success: false,
                error: "ASTParser error",
                errorMessage: (AST.errors) ? JSON.stringify(AST.errors) : "could not get code"
            };
        }
        var b = this.Build2(AST.tree.first[0]);
        result = { success: true, expression: b, errors: AST.errors };
        return result;
    },

    createExpression: function (code, resolver) {
        ///<signature>
        ///<summary>Parses the provided code and returns a JavaScript code expression tree</summary>
        ///<param name="code" type="string">The JavaScript code to parse &#10;ex: "a + b /c"</param>
        ///<param name="resolver" type="string">The ParameterResolver class that resolves vaiable and parameteres references</param>
        ///<returns type="$data.Expressions.ExpressionParserResult" />
        ///</signature>
        ///<signature>
        ///<summary>Parses the provided code and returns a JavaScript code expression tree</summary>
        ///<param name="code" type="Function">The JavaScript function to parse &#10;ex: "function (a,b,c) { return a + b /c }"</param>
        ///<param name="resolver" type="string">The ParameterResolver class that resolves vaiable and parameteres references</param>
        ///<returns type="$data.Expressions.ExpressionParserResult" />
        ///</signature>

        var result = this.parseExpression(code, resolver);
        if (!result.success) {
            Guard.raise("ExpressionParserError: " + result.errorMessage);
        }
        return result.expression;
    },

    Build2: function (node) {
        ///<param name="node" type="Lint" />
        ///<returns type="$data.Expressions.ExpressionNode" />
        var n;
        switch (node.arity) {
            case "number":
            case "string":
                n = this.BuildConstant(node);
                break;
            case "prefix":
                switch (node.value) {
                    case "{": 
                        n = this.BuildObjectLiteral(node);
                        break;
                    case "[":
                        n = this.BuildArrayLiteral(node);
                        break;
                    case $data.unaryOperators.resolve(node.value):
                        n = this.BuildUnary(node);
                        break;
                    //TODO: default case
                }
                break;
            case "suffix":
                switch (node.value) {
                    case $data.unaryOperators.resolve(node.value):
                        n = this.BuildUnary(node);
                        break;
                    default:
                        Guard.raise("Unknown suffix: " + node.value);
                }
                break;
            case "infix":
                switch (node.value) {
                    case "[":
                        n = this.BuildArray(node);
                        break;
                    case $data.binaryOperators.resolve(node.value):
                        n = this.BuildSimpleBinary(node);
                        break;
                    case "function":
                        Guard.raise("Unexpected function arity");
                    case "(":
                        n = this.BuildCall(node);
                        break;
                    case ".":
                        n = this.BuildProperty(node);
                        break;
                    default:
                        debugger;
                        //TODO: remove debugger, throw exception or break
                }
                break;
            case "statement":
                switch (node.value) {
                    case "function":
                        n = this.BuildFunction(node);
                        //TODO: consider adding break
                }
                break;
            default:
                switch (node.value) {
                    case "function":
                        n = this.BuildFunction(node);
                        break;
                    case "true":
                    case "false":
                    case "null":
                        n = this.BuildConstant(node);
                        break;
                    case "this":
                        n = this.BuildThis(node);
                        break;
                    default:
                        n = this.BuildParameter(node);
                        break;
                }
        }
        return n;
    },

    BuildThis: function (node) {
        var result = Container.createThisExpression();
        return result;
    },

    BuildConstant: function (node) {
        ///<param name="node" type="ConstantASTNode" />
        var value = node.value;
        var type = node.type;
        if (node.reserved === true) {
            switch (node.value) {
                case "true": value = true; type = typeof true; break;
                case "false": value = false; type = typeof false; break;
                case "null": value = null; type = typeof null; break;
                //TODO: missing default case
            }
        }
        var result = new $data.Expressions.ConstantExpression(value, type);
        return result;
    },

    BuildFunctionParameter: function (node) {

    },
    
    BuildArray: function (node) {
        switch (node.second.type) {
            case "string":
                return this.BuildProperty(node);
            case "number":
            default:
                return this.BuildSimpleBinary(node);
        }
    },

    BuildParameter: function (node) {
        ///<param name="node" type="ParameterASTNode" />
        ///<returns type="$data.Expressions.ParameterExpression" />
        var paramName = node.value;
        //TODO
        //var paramType = this.resolver.resolveParameterType(node);
        var nodeType = node.funct ? $data.Expressions.ExpressionType.LambdaParameter :
                                    this.lambdaParams.indexOf(node.value) > -1 ?
                                                $data.Expressions.ExpressionType.LambdaParameterReference : $data.Expressions.ExpressionType.Parameter;
        var result = new $data.Expressions.ParameterExpression(node.value, null, nodeType);

        if (nodeType == $data.Expressions.ExpressionType.LambdaParameterReference) {
            result.paramIndex = this.lambdaParams.indexOf(node.value);
        }

        return result;
    },

    BuildArrayLiteral: function(node) {
        var self = this;
        var items = node.first.map(function (item) { return self.Build2(item); });
        var result = new $data.Expressions.ArrayLiteralExpression(items);
        return result;
    },

    BuildObjectLiteral: function (node) {
        var self = this;
        var fields = node.first.map(function (item) {
            var eItem = self.Build2(item.first);
            var result = new $data.Expressions.ObjectFieldExpression(item.value, eItem);
            return result;
        });
        var result = new $data.Expressions.ObjectLiteralExpression(fields);
        return result;
    },

    BuildFunction: function (node) {
        ///<param name="node" type="FunctionASTNode"/>
        ///<returns type="$data.Expressions.FunctionExpression" />
        var self = this;
        var paramStack = [];
        var params = node.first && node.first.map(function (paramNode) {
            //paramStack.push(paramNode.value);
            this.lambdaParams.push(paramNode.value);
            return self.BuildParameter(paramNode);
        }, this);
        params = params || [];

        //skipping return for convenience
        //Possible we should raise an error as predicates and selectors can
        //not be code blocks just expressions

        var hasReturn = node.block.length == 0 ? false :
            node.block[0].value === "return" ? true : false;
        var body = (node.block.length > 0) ? this.Build2(hasReturn ? node.block[0].first : node.block[0]) : null;

        paramStack.forEach(function () { this.lambdaParams.pop(); }, this);

        var result = new $data.Expressions.FunctionExpression(node.value, params, body);
        params.forEach(function (param) {
            Object.defineProperty(param, "owningFunction", { value: result, enumerable: false });
        });

        //TODO place on prototyope
        result.name = node.name;
        return result;
    },

    BuildCall: function (node) {
        var self = this;
        var method = self.Build2(node.first);
        var args = node.second.map(function (exp) { return self.Build2(exp); });
        var member;
        var expression;
        switch(true){
            case method instanceof $data.Expressions.PropertyExpression:
                expression = method.expression;
                member = method.member;
                break;
            case method instanceof $data.Expressions.ParameterExpression:
                expression = Container.createConstantExpression(null, typeof null);  
                member = method;
                break;
            //TODO: missing default case
        }

        var result = Container.createCallExpression(expression, member, args);
        return result;
    },

    BuildProperty: function (node) {
        ///<summary>Builds a PropertyExpression from the AST node</summary>
        ///<param name="node" type="MemberAccessASTNode" />
        ///<returns type="$data.Expressions.PropertyExpression" />
        var expression = this.Build2(node.first);
        //TODO
        //var type = expression.type;
        //var member = type.getMemberDefinition()
        //TODO how to not if?????
        var member;
        if (node.second.identifier) {
            member = new $data.Expressions.ConstantExpression(node.second.value, "string");
        } else {
            member = this.Build2(node.second);
        }
        var result = new $data.Expressions.PropertyExpression(expression, member);
        return result;
    },


    BuildUnary: function(node) {
        var operator = $data.unaryOperators.getOperator(node.value, node.arity);
        var nodeType = operator.expressionType;
        var operand = this.Build2(node.first);
        var result = new $data.Expressions.UnaryExpression(operand, operator, nodeType);
        return result;
    },

    BuildSimpleBinary: function (node) {
        ///<param name="node" type="LintInflixNode" />

        var operator = $data.binaryOperators.getOperator(node.value);
        var nodeType = operator.expressionType;

        var left = this.Build2(node.first || node.left);
        var right = this.Build2(node.second || node.right);
        var result = new $data.Expressions.SimpleBinaryExpression(left, right, nodeType, node.value, operator.type);
        return result;
    }   

    //Build: function (node, expNode) {
    //    var n;
    //    switch (node.arity) {
    //        case "ternary":
    //            if (node.value == "?")
    //                n = this.BuildDecision(node, expNode);
    //            else
    //                Guard.raise("Value of ternary node isn't implemented: " + node.value);
    //            break;
    //        case null:
    //        default:
    //            Guard.raise("Arity isn't implemented: " + node.arity);
    //    }
    //    return n;
    //},

});

