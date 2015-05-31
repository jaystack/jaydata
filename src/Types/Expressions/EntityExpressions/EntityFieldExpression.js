$C('$data.Expressions.EntityFieldExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector) {
        ///<param name="source" type="$data.Entity.EntityExpression" />
        ///<param name="selector" type="$data.Entity.MemberInfoExpression" />
        this.selector = selector;
        this.source = source;


        if (this.selector instanceof $data.Expressions.MemberInfoExpression ||  this.selector.name) {
            this.memberName = this.selector.name; 
        }
    },

    nodeType: { value: $data.Expressions.ExpressionType.EntityField }
});

