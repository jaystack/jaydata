$data.Class.define('$data.expressions.ExpTreeVisitor',
    null, null,
    {
        constructor: function () {
            this._deep = 0;
        },
        Visit: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.ExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.ExpressionNode"/>
            this._deep = this._deep + 1;
            var result = null;
            switch (eNode.type) {
                case LITERAL: result = this.VisitLiteral(eNode, context); break;
                case VARIABLE: result = this.VisitVariable(eNode, context); break;
                case MEMBERACCESS: result = this.VisitMember(eNode, context); break;
                case BINARY: result = this.VisitBinary(eNode, context); break;
                case UNARY: result = this.VisitUnary(eNode, context); break;
                case INCDEC: result = this.VisitIncDec(eNode, context); break;
                case EQUALITY: result = this.VisitEquality(eNode, context); break;
                case DECISION: result = this.VisitDecision(eNode, context); break;
                case METHODCALL: result = this.VisitMethodCall(eNode, context); break;
                case NEW: result = this.VisitNew(eNode, context); break;
                case JSONASSIGN: result = this.VisitJsonAssign(eNode, context); break;
                case ARRAYACCESS: result = this.VisitArrayAccess(eNode, context); break;
                default:
                    Guard.raise("Type isn't implemented: " + eNode.type);
            }
            this._deep = this._deep - 1;
            return result;
        },
        VisitLiteral: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.LiteralExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.LiteralExpressionNode"/>
            
            return eNode;
        },
        VisitVariable: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.VariableExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.VariableExpressionNode"/>

            return eNode;
        },
        VisitMember: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.MemberAccessExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.MemberAccessExpressionNode"/>

            var expression = this.Visit(eNode.expression, context);
            var member = this.Visit(eNode.member, context);
            if (expression === eNode.expression && member === eNode.member)
                return eNode;
            return $data.expressions.expressionNodeTypes.MemberAccessExpressionNode.create(eNode.executable, expression, member);
        },
        VisitBinary: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.BinaryExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.BinaryExpressionNode"/>

            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (left === eNode.left && right === eNode.right)
                return eNode;
            return $data.expressions.expressionNodeTypes.BinaryExpressionNode.create(eNode.executable, eNode.operator, left, right);
        },
        VisitUnary: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.UnaryExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.UnaryExpressionNode"/>

            var operand = this.Visit(eNode.operand, context);
            if (operand === eNode.operand)
                return eNode;
            return $data.expressions.expressionNodeTypes.UnaryExpressionNode.create(eNode.executable, eNode.operator, operand);
        },
        VisitIncDec: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.IncDecExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.IncDecExpressionNode"/>

            var operand = this.Visit(eNode.operand, context);
            if (operand === eNode.operand)
                return eNode;
            return $data.expressions.expressionNodeTypes.IncDecExpressionNode.create(eNode.executable, eNode.operator, operand, eNode.suffix);
        },
        VisitEquality: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.EqualityExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.EqualityExpressionNode"/>

            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (left === eNode.left && right === eNode.right)
                return eNode;
            return $data.expressions.expressionNodeTypes.EqualityExpressionNode.create(eNode.executable, eNode.operator, left, right);
        },
        VisitDecision: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.DecisionExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.DecisionExpressionNode"/>

            var expression = this.Visit(eNode.expression, context);
            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (expression === eNode.expression && left === eNode.left && right === eNode.right)
                return eNode;
            return $data.expressions.expressionNodeTypes.DecisionExpressionNode.create(eNode.executable, expression, left, right);
        },
        VisitMethodCall: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.MethodcallExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.MethodcallExpressionNode"/>

            var object = eNode.object ? this.Visit(eNode.object, context) : null;
            var args = this.VisitArray(eNode.args, context);
            if (object === eNode.object && args === eNode.args)
                return eNode;
            return $data.expressions.expressionNodeTypes.MethodcallExpressionNode.create(eNode.executable, object, eNode.method, args);
        },
        VisitNew: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.NewExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.NewExpressionNode"/>

            var values = this.VisitArray(eNode.values, context);
            if (values === eNode.values)
                return eNode;
            return $data.expressions.expressionNodeTypes.NewExpressionNode.create(true, values);
        },
        VisitJsonAssign: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.JsonAssignExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.JsonAssignExpressionNode"/>

            var left = this.Visit(eNode.left, context);
            var right = this.Visit(eNode.right, context);
            if (left === eNode.left && right === eNode.right)
                return eNode;
            left.JSONASSIGN = true;
            right.JSONASSIGN = true;
            return $data.expressions.expressionNodeTypes.JsonAssignExpressionNode.create(true, left, right);
        },
        VisitArrayAccess: function (eNode, context) {
            ///<summary></summary>
            ///<param name="eNode" type="$data.expressions.expressionNodeTypes.ArrayAccessExpressionNode"/>
            ///<param name="context" type="Object"/>
            //<return type="$data.expressions.expressionNodeTypes.ArrayAccessExpressionNode"/>

            var array = this.Visit(eNode.array, context);
            var index = this.Visit(eNode.index, context);
            if (array === eNode.array && index === eNode.index)
                return eNode;
            return $data.expressions.expressionNodeTypes.ArrayAccessExpressionNode.create(true, array, index);
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
        GetMemberChain: function (memberAccess, context) {
            // { type:MEMBERACCESS, executable:true, expression:, member: }
            if (memberAccess.expression.type == MEMBERACCESS) {
                var a = this.GetMemberChain(memberAccess.expression, context);
                a.push(memberAccess.member);
                return a;
            }
            return [memberAccess.expression, memberAccess.member];
        }
    }, {});