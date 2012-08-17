$C('$data.Expressions.EntityContextExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (instance) {
        ///<param name="instance" type="$data.EntityContext" />
        //Object.defineProperty(this, "instance", { value: instance, enumerable: false });
        this.instance = instance;
        //this.storage_type = {};
        //this.typeName = this.type.name;
    },
    instance: { enumerable: false },
    nodeType : { value: $data.Expressions.ExpressionType.EntityContext, enumerable: true }

});
