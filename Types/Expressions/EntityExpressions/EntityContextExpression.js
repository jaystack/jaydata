$C('$data.Expressions.EntityContextExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (instance) {
        ///<param name="instance" type="$data.EntityContext" />
        this.instance = instance;
        //this.storage_type = {};
        //this.typeName = this.type.name;
    },
    nodeType : { value: $data.Expressions.ExpressionType.EntityContext, enumerable: true }

});
