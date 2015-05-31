$data.Class.define('$data.Expressions.SetExecutableVisitor', $data.Expressions.ExpTreeVisitor, null,
{
    Visit: function (eNode, context) {
        switch (eNode.type) {
            case LITERAL: return this.VisitLiteral(eNode, context);
            case VARIABLE: return this.VisitVariable(eNode, context);
            case MEMBERACCESS: return this.VisitMember(eNode, context);
            case BINARY: return this.VisitBinary(eNode, context);
            case UNARY: return this.VisitUnary(eNode, context);
            case INCDEC: return this.VisitIncDec(eNode, context);
            case EQUALITY: return this.VisitEquality(eNode, context);
            case DECISION: return this.VisitDecision(eNode, context);
            case METHODCALL: return this.VisitMethodCall(eNode, context);
            case NEW: return this.VisitNew(eNode, context);
            case JSONASSIGN: return this.VisitJsonAssign(eNode, context);
            case ARRAYACCESS: return this.VisitArrayAccess(eNode, context);
            default:
                Guard.raise("Type isn't implemented: " + eNode.type);
        }
    },

    VisitBinary: function (eNode, context) {
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left === eNode.left && right === eNode.right && (left.executable && right.executable == eNode.executable))
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.BinaryExpressionNode.create(left.executable && right.executable, eNode.operator, left, right);
    },
    VisitUnary: function (eNode, context) {
        var operand = this.Visit(eNode.operand, context);
        if (operand === eNode.operand)
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.UnaryExpressionNode.create(operand.executable, eNode.operator, operand);
    },
    VisitIncDec: function (eNode, context) {
        var operand = this.Visit(eNode.operand, context);
        if (operand === eNode.operand)
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.IncDecExpressionNode.create(operand.executable, eNode.operator, operand, eNode.suffix);
    },
    VisitEquality: function (eNode, context) {
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left === eNode.left && right === eNode.right && (left.executable && right.executable == eNode.executable))
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.EqualityExpressionNode.create(left.executable && right.executable, eNode.operator, left, right);
    },
    VisitDecision: function (eNode, context) {
        var expression = this.Visit(eNode.expression, context);
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (expression === eNode.expression && left === eNode.left && right === eNode.right && (left.executable && right.executable && expression.executable == eNode.executable))
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode.create(left.executable && right.executable && expression.executable, expression, left, right);
    },
    VisitMethodCall: function (eNode, context) {
        var object = eNode.object ? this.Visit(eNode.object, context) : null;
        var args = this.VisitArray(eNode.args, context);
        if (object === eNode.object && args === eNode.args && ((object == null ? true : object.executable) == eNode.executable))
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode.create(object == null ? true : object.executable, object, eNode.method, args);
    },
    VisitNew: function (eNode, context) {
        // { type:NEW, executable:true, values: [] };
        var values = this.VisitArray(eNode.values, context);
        if (values === eNode.values)
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.NewExpressionNode.create(true, values);
    },
    VisitJsonAssign: function (eNode, context) {
        // { type:JSONASSIGN, executable:true, left: variable, right: right }
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left === eNode.left && right === eNode.right)
            return eNode;
        left.JSONASSIGN = true;
        right.JSONASSIGN = true;
        return $data.Expressions.ExpressionNodeTypes.JsonAssignExpressionNode.create(true, left, right);
    },
    VisitArrayAccess: function (eNode, context) {
        // { type:ARRAYACCESS, executable:true, array:, index: }
        var array = this.Visit(eNode.array, context);
        var index = this.Visit(eNode.index, context);
        if (array === eNode.array && index === eNode.index)
            return eNode;
        return $data.Expressions.ExpressionNodeTypes.ArrayAccessExpressionNode.create(true, array, index);
    },
    VisitArray: function (eNodes, context) {
        var args = [];
        var ok = true;
        for (var i = 0; i < eNodes.length; i++) {
            args[i] = this.Visit(eNodes[i], context);
            ok = ok && args[i] === eNodes[i];
        }
        return ok ? eNodes : args;
    },

    VisitLiteral: function (eNode, context) {
        return { type: eNode.type, executable: true, value: eNode.value, valueType: eNode.valueType };
    },
    VisitVariable: function (eNode, context) {
        if (typeof context.paramContext[eNode.name] == undefined) // isn't param  //TODO: check ParamContext
            Guard.raise("Variable is not defined in the paramContext: " + eNode.name);
        //this._setExecutable(eNode, true);
        return $data.Expressions.ExpressionNodeTypes.VariableExpressionNode.create(true, "Math", "GLOBALOBJECT");
    },
    VisitMember: function (eNode, context) {
        var chain = this.GetMemberChain(eNode);
        var firstMember = chain[0].name;
        var isLambdaParam = context.lambdaParams.indexOf(firstMember) >= 0;
        var isLocalParam = firstMember == context.paramsName; //TODO: check ParamContext // old: typeof context.paramContext[firstMember] != "undefined";
        if (!isLocalParam && !isLambdaParam)
            Guard.raise("Variable is not defined in the paramContext or the lambda parameters: " + firstMember);

        return $data.Expressions.ExpressionNodeTypes.MemberAccessExpressionNode.create(isLocalParam, eNode.expression, eNode.member);
    }
}, null);