$C('$data.Expressions.CodeToEntityConverter', $data.Expressions.ExpressionVisitor, null, {
    constructor: function (scopeContext) {
        ///<summary>This visitor converts a JS language tree into a semantical Entity Expression Tree &#10;This visitor should be invoked on a CodeExpression</summary>
        ///<param name="context">context.thisArg contains parameters, context.lambdaParams should have an array value</param>
        this.scopeContext = scopeContext;
        this.parameters = [];

    },


    VisitBinary: function (expression, context) {
        var left = this.Visit(expression.left, context);
        var right = this.Visit(expression.right, context);

        if ((!(left instanceof $data.Expressions.ConstantExpression) && right instanceof $data.Expressions.ConstantExpression) ||
            (!(right instanceof $data.Expressions.ConstantExpression) && left instanceof $data.Expressions.ConstantExpression)) {

            var refExpression, constExpr;
            if (right instanceof $data.Expressions.ConstantExpression) {
                refExpression = left;
                constExpr = right;
            } else {
                refExpression = right;
                constExpr = left;
            }

            var memInfo;
            if ((memInfo = refExpression.selector) instanceof $data.Expressions.MemberInfoExpression ||
                (memInfo = refExpression.operation) instanceof $data.Expressions.MemberInfoExpression) {


                if (memInfo.memberDefinition && (memInfo.memberDefinition.type || memInfo.memberDefinition.dataType)) {
                    var fieldType = Container.resolveType(memInfo.memberDefinition.type || memInfo.memberDefinition.dataType);
                    var constExprType = Container.resolveType(constExpr.type);

                    if (fieldType !== constExprType) {

                        var value = constExpr.value;
                        if (expression.operator === $data.Expressions.ExpressionType.In) {
                            if (Array.isArray(value)) {
                                var resultExp = [];
                                for (var i = 0; i < value.length; i++) {
                                    resultExp.push(new $data.Expressions.ConstantExpression(value[i], fieldType));
                                }
                                value = resultExp;
                                fieldType = $data.Array;
                            } else {
                                fieldType = constExprType;
                            }
                        }

                        if (right === constExpr) {
                            right = new $data.Expressions.ConstantExpression(value, fieldType, right.name);
                        } else {
                            left = new $data.Expressions.ConstantExpression(value, fieldType, left.name);
                        }
                    }
                }
            }
        }

        var operatorResolution = this.scopeContext.resolveBinaryOperator(expression.nodeType, expression, context.frameType);
        var result = Container.createSimpleBinaryExpression(left, right, expression.nodeType, expression.operator, expression.type, operatorResolution);
        return result;
    },

    VisitUnary: function (expression, context) {
        var operand = this.Visit(expression.operand, context);
        var operatorResolution = this.scopeContext.resolveUnaryOperator(expression.nodeType, expression, context.frameType);
        var result = Container.createUnaryExpression(operand, expression.operator, expression.nodeType, operatorResolution);
        return result;
    },

    VisitParameter: function (expression, context) {
        Guard.requireValue("context", context);
        var et = $data.Expressions.ExpressionType;
        switch (expression.nodeType) {
            case et.LambdaParameterReference:
                var result = Container.createEntityExpression(context.lambdaParameters[expression.paramIndex], { lambda: expression.name });
                return result;
            case et.LambdaParameter:
                //TODO: throw descriptive exception or return a value
                break;
            default:
                Guard.raise("Global parameter " + expression.name + " not found. For query parameters use 'this.field' notation");
                break;
        }
    },

    VisitThis: function (expression, context) {
        ///<summary>converts the ThisExpression into a QueryParameterExpression tha't value will be evaluated and stored in this.parameters collection</summary>
        var index = this.parameters.push({ name: "", value: undefined }) - 1;
        var result = Container.createQueryParameterExpression("", index, context.queryParameters, undefined);
        return result;
    },

    VisitFunction: function (expression, context) {
        var result = $data.Expressions.ExpressionVisitor.prototype.VisitFunction.apply(this, arguments);
        return result.body;
    },

    VisitCall: function (expression, context) {
        //var exp = this.Visit(expression.expression);
        var self = this;
        var exp = this.Visit(expression.expression, context);
        var member = this.Visit(expression.member, context);
        var args = expression.args.map(function (arg) {
            return self.Visit(arg, context);
        });
        var result;

        ///filter=>function(p) { return p.Title == this.xyz.BogusFunction('asd','basd');}
        switch (true) {
            case exp instanceof $data.Expressions.QueryParameterExpression:
                var argValues = args.map(function (a) { return a.value; });
                result = expression.implementation(exp.value, member.value, argValues);
                //var args = expressions
                return Container.createQueryParameterExpression(exp.name + "$" + member.value, exp.index, result, typeof result);
            case exp instanceof $data.Expressions.EntityFieldExpression:

            case exp instanceof $data.Expressions.EntityFieldOperationExpression:
                var operation = this.scopeContext.resolveFieldOperation(member.value, exp, context.frameType);
                if (!operation) {
                    Guard.raise("Unknown entity field operation: " + member.getJSON());
                }
                member = Container.createMemberInfoExpression(operation);
                result = Container.createEntityFieldOperationExpression(exp, member, this._resolveFunctionArguments(args, operation.parameters));
                return result;

            case exp instanceof $data.Expressions.EntitySetExpression:
                var operation = this.scopeContext.resolveSetOperations(member.value, exp, context.frameType);
                if (!operation) {
                    Guard.raise("Unknown entity field operation: " + member.getJSON());
                }
                member = Container.createMemberInfoExpression(operation);
                result = Container.createFrameOperationExpression(exp, member, this._resolveFunctionArguments(args, operation.parameters));
                return result;
                
            case exp instanceof $data.Expressions.EntityExpression:
                var operation = this.scopeContext.resolveTypeOperations(member.value, exp, context.frameType);
                if (!operation) {
                    Guard.raise("Unknown entity function operation: " + member.getJSON());
                }

                member = Container.createMemberInfoExpression(operation);
                result = Container.createEntityFunctionOperationExpression(exp, member, this._resolveFunctionArguments(args, operation.method.params));
                return result;
                break;
            case exp instanceof $data.Expressions.EntityContextExpression:
                var operation = this.scopeContext.resolveContextOperations(member.value, exp, context.frameType);
                if (!operation) {
                    Guard.raise("Unknown entity function operation: " + member.getJSON());
                }

                member = Container.createMemberInfoExpression(operation);
                result = Container.createContextFunctionOperationExpression(exp, member, this._resolveFunctionArguments(args, operation.method.params));
                return result;
                break;
            default:
                Guard.raise("VisitCall: Only fields can have operations: " + expression.getType().name);
                //TODO we must not alter the visited tree
        }

    },
    _resolveFunctionArguments: function (args, params) {
        if (params) // remove current field poz
            params = params.filter(function (p, i) { return p.name !== '@expression'; });

        //objectArgs
        if (args.length === 1 && args[0] instanceof $data.Expressions.ConstantExpression && typeof args[0].value === 'object' && args[0].value && params && params[0] &&
            args[0].value.constructor === $data.Object && params.some(function (param) { return param.name in args[0].value })) {

            return params.map(function (p) {
                var type = p.type || p.dataType || args[0].type;
                return new $data.Expressions.ConstantExpression(args[0].value[p.name], Container.resolveType(type), p.name);
            });

        } else {
            return args.map(function (expr, i) {
                if (expr instanceof $data.Expressions.ConstantExpression && params && params[i]) {
                    var type = params[i].type || params[i].dataType || expr.type;
                    return new $data.Expressions.ConstantExpression(expr.value, Container.resolveType(type), params[i].name);
                } else {
                    return expr;
                }
            });
        }
    },

    VisitProperty: function (expression, context) {
        ///<param name="expression" type="$data.Expressions.PropertyExpression" />
        var exp = this.Visit(expression.expression, context);
        var member = this.Visit(expression.member, context);

        //Guard.requireType("member", member, $data.Expressions.ConstantExpression);
        Guard.requireType("member", member, $data.Expressions.ConstantExpression);

        function isPrimitiveType(memberDefinitionArg) {

            var t = memberDefinitionArg.dataType;
            if (typeof t === 'function') { return false; }

			// suspicious code
            /*switch (t) {
                //TODO: implement this
            }*/
        }

        switch (exp.expressionType) {
            case $data.Expressions.EntityExpression:
                var memberDefinition = exp.getMemberDefinition(member.value);
                if (!memberDefinition) {
                    Guard.raise(new Exception("Unknown member: " + member.value, "MemberNotFound"));
                }
                //var storageMemberDefinition =
                var storageField = memberDefinition.storageModel
                                                   .PhysicalType.memberDefinitions.getMember(memberDefinition.name);
                var res;
                var memberDefinitionExp;
                switch (storageField.kind) {
                    case "property":
                        memberDefinitionExp = Container.createMemberInfoExpression(memberDefinition);
                        res = Container.createEntityFieldExpression(exp, memberDefinitionExp);
                        return res;
                    case "navProperty":
                        var assocInfo = memberDefinition.storageModel.Associations[memberDefinition.name];
                        var setExpression = Container.createEntitySetExpression(exp, Container.createAssociationInfoExpression(assocInfo));
                        if (assocInfo.ToMultiplicity !== "*") {
                            var ee = Container.createEntityExpression(setExpression, {});
                            return ee;
                        }/* else {
                            context.lambdaParameters.push(setExpression);
                        }*/
                        return setExpression;
                    case "complexProperty":
                        memberDefinitionExp = Container.createMemberInfoExpression(memberDefinition);
                        res = Container.createComplexTypeExpression(exp, memberDefinitionExp);
                        return res;
                        //TODO: missing default case
                }

                //s/switch => property or navigationproperty
            case $data.Expressions.ComplexTypeExpression:
                var memDef = exp.getMemberDefinition(member.value);
                if (!(memDef)) {
                    Guard.raise("Unknown member " + member.value + " on " + exp.entityType.name);
                }
                var memDefExp = Container.createMemberInfoExpression(memDef);
                var result;
                //TODO!!!!
                if (Container.isPrimitiveType(Container.resolveType(memDef.dataType))) {
                    result = Container.createEntityFieldExpression(exp, memDefExp);
                    return result;
                }
                result = Container.createComplexTypeExpression(exp, memDefExp);
                return result;
            case $data.Expressions.QueryParameterExpression:
                var value = expression.implementation(exp.value, member.value);
                this.parameters[exp.index].name += "$" + member.value;
                this.parameters[exp.index].value = value;
                return Container.createQueryParameterExpression(exp.name + "$" + member.value, exp.index, value, Container.getTypeName(value));
            case $data.Expressions.EntityFieldExpression:
            case $data.Expressions.EntityFieldOperationExpression:
                var operation = this.scopeContext.resolveFieldOperation(member.value, exp, context.frameType);
                if (!operation) {
                    Guard.raise("Unknown entity field operation: " + member.getJSON());
                }
                member = Container.createMemberInfoExpression(operation);
                result = Container.createEntityFieldOperationExpression(exp, member, []);

                return result;
            default:
                Guard.raise("Unknown expression type to handle: " + exp.expressionType.name);
        }
    }
});