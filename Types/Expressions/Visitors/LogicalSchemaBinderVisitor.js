//"use strict"; // suspicious code

$C('$data.Expressions.LogicalSchemaBinderVisitor',
    $data.Expressions.ExpressionVisitor, null,
    {
        constructor: function (expression, binder) {
            
        },

        VisitProperty: function (expression, context) {
            ///<param name="expression" type="$data.Expressions.ExpressionNode" />
            var exp = this.Visit(expression.expression, context);
            var mem = this.Visit(expression.member, context);

            var type = exp.type;
            var memberType = context.memberResolver.resolve(type, mem.value);
            mem.type = memberType;
            return Container.createPropertyExpression(exp, mem);
        }

    }, {});