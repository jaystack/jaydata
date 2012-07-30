 $data.Class.define('$data.Expressions.ExpressionBuilder', null, null,
{
    constructor: function (context) {
        this.context = context;
    },
    _isLambdaParam: function (name) {
        var p = this.context.lambdaParams;
        for (var i = 0; i < p.length; i++) {
            if (p[i] == name)
                return true;
        }
        return false;
    },
    _isParam: function (name) {
        return this.context.paramContext[name] != undefined;
    },
    _isParamRoot: function (name) {
        return this.context.paramsName == name;
    },
    Build: function (node, expNode) {
        var n;
        switch (node.arity) {
            case "infix":
                if ("(" == node.value)
                    n = this.BuildMethodCall(node, expNode);
                else if ("." == node.value)
                    n = this.BuildMember(node, expNode);
                else if (["===", "==", "!==", "!=", ">", "<", ">=", "<="].indexOf(node.value) >= 0)
                    n = this.BuildEquality(node, expNode);
                else if (["&&", "||"].indexOf(node.value) >= 0)
                    n = this.BuildBinary(node, expNode);
                else if (["+", "-", "*", "/", "%"].indexOf(node.value) >= 0)
                    n = this.BuildBinary(node, expNode);
                else if ("[" == node.value)
                    n = this.BuildArrayAccess(node, expNode);
                else
                    Guard.raise("Value of infix node isn't implemented: " + node.value);
                break;
            case "prefix":
                if (["+", "-", "!"].indexOf(node.value) >= 0)
                    n = this.BuildUnary(node, expNode);
                else if (["++", "--"].indexOf(node.value) >= 0)
                    n = this.BuildIncDec(node, expNode);
                else if ("{" == node.value/* && "object" == node.type*/) //TODO: check the second condition necessity
                    n = this.BuildNewExpression(node, expNode);
                else
                    Guard.raise("Value of prefix node isn't implemented: " + node.value);
                break;
            case "suffix":
                if (["++", "--"].indexOf(node.value) >= 0)
                    n = this.BuildIncDec(node, expNode);
                else
                    Guard.raise("Value of suffix node isn't implemented: " + node.value);
                break;
            case "string":
            case "number":
                n = this.BuildLiteral(node, expNode); //TODO: more arity to literal?
                break;
            case "ternary":
                if (node.value == "?")
                    n = this.BuildDecision(node, expNode);
                else
                    Guard.raise("Value of ternary node isn't implemented: " + node.value);
                break;
            case null:
            case undefined:
                if (node.type == "boolean" && (node.value == "true" || node.value == "false"))
                    n = this.BuildBoolLiteral(node, expNode);
                else
                    n = this.BuildVariable(node, expNode);
                break;
            default:
                Guard.raise("Arity isn't implemented: " + node.arity);
        }
        return n;
    },
    BuildNewExpression: function (node, expNode) {
        var newExpression = $data.Expressions.ExpressionNodeTypes.NewExpressionNode.create(true, []);
        var n = node.first;
        for (var i = 0; i < n.length; i++)
            newExpression.values.push(this.Build(n[i], newExpression));
        return newExpression;
    },
    BuildLiteral: function (node, expNode) {
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, node.arity, node.value);
    },
    BuildBoolLiteral: function (node, expNode) {
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, node.type, node.value == "true" ? true : false);
    },
    BuildVariable: function (node, expNode) {
        if (!node.first) {
            if (expNode.type == MEMBERACCESS) {
                var subType;
                if (this._isLambdaParam(node.value))
                    subType = "LAMBDAPARAM";
                else if (this._isParamRoot(node.value))
                    subType = "PARAMETERROOT";
                else if (this._isParam(node.value))
                    subType = "PARAMETER";
                else
                    subType = "PROPERTY";
            }
            else {
                if (this._isLambdaParam(node.value))
                    subType = "LAMBDAPARAM";
                else if (this._isParamRoot(node.value))
                    subType = "PARAMETERROOT";
                else if (this._isParam(node.value))
                    subType = "PARAMETER";
                else if (window[node.value] != undefined)
                    subType = "GLOBALOBJECT";
                else
					Guard.raise(
						new Exception("Unknown variable in '" + this.context.operation + "' operation. The variable isn't referenced in the parameter context and it's not a global variable: '" + node.value + "'.",
                        "InvalidOperation", { operationName: this.context.operation, missingParameterName: node.value })
						);
            }
            return $data.Expressions.ExpressionNodeTypes.VariableExpressionNode.create(true, node.value, subType);
        }

        var left = $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, "name", node.value);

        var jsonAssign = $data.Expressions.ExpressionNodeTypes.JsonAssignExpressionNode.create(true);
        var right = this.Build(node.first, jsonAssign);
        //left.parent = jsonAssign;
        jsonAssign.left = left;
        jsonAssign.right = right;

        left.JSONASSIGN = true;
        right.JSONASSIGN = true;

        return jsonAssign;
    },
    BuildMember: function (node, expNode) {
        if (node.value != "." || node.arity != "infix") {
            if (node.type == "string") { //TODO: more types?
                return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, node.arity, node.value);
            }
            return $data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode.create(true, null, node.value);
        }
        var result = $data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode.create(true);
        var expression = this.Build(node.first, result);
        var member = this.Build(node.second, result);
        result.expression = expression;
        result.member = member;
        return result;
    },
    BuildUnary: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.UnaryExpressionNode.create(true, node.value);
        result.operand = this.Build(node.first, result);
        return result;
    },
    BuildIncDec: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.IncDecExpressionNode.create(true, node.value, null, node.arity == "suffix");
        result.operand = this.Build(node.first, result);
        return result;
    },
    BuildBinary: function (node, expNode) {
        if (!node.first) Guard.raise("Cannot build binary: node.first is null");
        if (!node.second) Guard.raise("Cannot build binary: node.second is null");
        var result = $data.Expressions.ExpressionNodeTypes.BinaryExpressionNode.create(true, node.value);
        result.left = this.Build(node.first, result);
        result.right = this.Build(node.second, result);
        return result;
    },
    BuildEquality: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.EqualityExpressionNode.create(true, node.value);
        result.left = this.Build(node.first, result);
        result.right = this.Build(node.second, result);
        return result;
    },
    BuildDecision: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode.create(true);
        result.expression = this.Build(node.first, result);
        result.left = this.Build(node.second, result);
        result.right = this.Build(node.third, result);
        return result;
    },
    BuildMethodCall: function (node, expNode) {
        var result = $data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode.create(true);
        if (node.first.type == "function") {
            //-- object's function
            result.object = this.Build(node.first.first, result);
            result.method = node.first.second.value;
        }
        else {
            //-- global function
            if (node.first.type != null)
                Guard.raise("Cannot build MethodCall because type is " + type);
            result.object = null;
            result.method = node.first.value;
        }
        var argNodes = node.second;
        var args = [];
        for (var i = 0; i < argNodes.length; i++) {
            var arg = argNodes[i];
            args[i] = this.Build(arg, result);
        }
        result.args = args;
        return result;
    },
    BuildArrayAccess: function (node, expNode) {
        // { type:ARRAYACCESS, executable:true, array:, index: }
        var result = $data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode.create(true);
        result.array = this.Build(node.first, result);
        result.index = this.Build(node.second, result);
        return result;
    }
}, null);