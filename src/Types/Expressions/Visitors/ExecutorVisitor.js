$data.Class.define('$data.Expressions.ExecutorVisitor', $data.Expressions.ExpTreeVisitor, null,
{
    //--
    VisitVariable: function (eNode, context) {
        if (!eNode.executable)
            return eNode;
        var value = (eNode.name == context.paramsName) ? context.paramContext : window[eNode.name];
        if (typeof value == 'undefined')
			Guard.raise(
				new Exception("Unknown variable in '" + context.operation + "' operation. The variable isn't referenced in the parameter context and it's not a global variable: '" + eNode.name + "'.",
                "InvalidOperation", { operationName: context.operation, missingParameterName: eNode.name })
				);
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitMember: function (eNode, context) {
        if (!eNode.executable)
            return eNode;
        var chain = this.GetMemberChain(eNode);
        var value;
        for (var i = 0; i < chain.length; i++) {
            if (i == 0)
                value = context.paramContext;
            else
                value = value[chain[i].name];
        }
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);


    },
    VisitUnary: function (eNode, context) {
        var operand = this.Visit(eNode.operand, context);
        if (operand !== eNode.operand)
            eNode = $data.Expressions.ExpressionNodeTypes.UnaryExpressionNode.create(eNode.executable, eNode.operator, operand);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value;
        var src;
        var operandValue = ((operand.valueType == "string") ? ("'" + operand.value + "'") : operand.value);
        src = "value = " + eNode.operator + " " + operandValue;
        eval(src);

        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitIncDec: function (eNode, context) {
        var operand = this.Visit(eNode.operand, context);
        if (operand !== eNode.operand)
            eNode = $data.Expressions.ExpressionNodeTypes.IncDecExpressionNode.create(eNode.executable, eNode.operator, operand, eNode.suffix);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value;
        if (eNode.suffix)
            value = eNode.operator == "++" ? operand.value++ : operand.value--;
        else
            value = eNode.operator == "++" ? ++operand.value : --operand.value;
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitBinary: function (eNode, context) {
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left !== eNode.left || right !== eNode.right)
            eNode = $data.Expressions.ExpressionNodeTypes.BinaryExpressionNode.create(eNode.executable, eNode.operator, left, right);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value;
        var src;
        var leftValue = ((left.valueType == "string") ? ("'" + left.value + "'") : left.value);
        var rightValue = ((right.valueType == "string") ? ("'" + right.value + "'") : right.value);
        src = "value = " + leftValue + " " + eNode.operator + " " + rightValue;
        eval(src);

        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitEquality: function (eNode, context) {
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (left !== eNode.left || right !== eNode.right)
            eNode = $data.Expressions.ExpressionNodeTypes.EqualityExpressionNode.create(eNode.executable, eNode.operator, left, right);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value;
        var src;
        var leftValue = ((left.valueType == "string") ? ("'" + left.value + "'") : left.value);
        var rightValue = ((right.valueType == "string") ? ("'" + right.value + "'") : right.value);
        src = "value = " + leftValue + " " + eNode.operator + " " + rightValue;
        eval(src);
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitDecision: function (eNode, context) {
        var expression = this.Visit(eNode.expression, context);
        var left = this.Visit(eNode.left, context);
        var right = this.Visit(eNode.right, context);
        if (expression !== eNode.expression || left !== eNode.left || right !== eNode.right)
            eNode = $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode.create(eNode.executable, expression, left, right);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var value = expression.value ? left.value : right.value;
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitMethodCall: function (eNode, context) {
        var object = eNode.object ? this.Visit(eNode.object, context) : null;
        var args = this.VisitArray(eNode.args, context);
        if (object !== eNode.object || args != eNode.args)
            eNode = $data.Expressions.ExpressionNodeTypes.MethodcallExpressionNode.create(eNode.executable, object, eNode.method, args);
        if (!eNode.executable)
            return eNode;
        // executing and returning with result as a literal
        var a = [];
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            var t = typeof arg.value;
            a.push((t == "string") ? ("'" + arg.value + "'") : arg.value);
        }
        var value;
        var src = object ?
			"value = object.value[eNode.method](" + a.join(",") + ");"
			:
			"value = " + eNode.method + "(" + a.join(",") + ");";
        eval(src);

        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    },
    VisitArrayAccess: function (eNode, context) {
        // { type:ARRAYACCESS, executable:true, array:, index: }
        var arrayNode = this.Visit(eNode.array, context);
        var indexNode = this.Visit(eNode.index, context);
        var value = arrayNode.value[indexNode.value];
        return $data.Expressions.ExpressionNodeTypes.LiteralExpressionNode.create(true, typeof value, value);
    }
}, null);