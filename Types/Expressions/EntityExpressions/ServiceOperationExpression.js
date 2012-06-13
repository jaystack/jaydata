$C('$data.Expressions.ServiceOperationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector, params, cfg) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntityContextExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///<param name="params" type="$data.Array" />
        ///<param name="cfg" type="$data.Object" />
        ///</signature>
        Guard.requireType("source", source, [$data.Expressions.EntityContextExpression]);
        Guard.requireType("selector", source, [$data.Expressions.MemberInfoExpression]);

        Object.defineProperty(this, "source", { value: source, enumerable: true, writable: true });
        Object.defineProperty(this, "selector", { value: selector, enumerable: true, writable: true });
        Object.defineProperty(this, "params", { value: params, enumerable: true, writable: true });
        Object.defineProperty(this, "cfg", { value: cfg, enumerable: false, writable: true });
        
        function findContext() {
            //TODO: use source from function parameter and return a value at the end of the function
            var r = source;
            while (r) {
                if (r instanceof $data.Expressions.EntityContextExpression) {
                    return r;
                }
                r = r.source;
            }
        }

        var c = findContext();
        switch (true) {
            case this.source instanceof $data.Expressions.EntityContextExpression:
                this.elementType = cfg.elementType ? cfg.elementType : cfg.returnType;
                this.storageModel = cfg.elementType ? c.instance._storageModel.getStorageModel(cfg.elementType) : null;
                break;
            default:
                Guard.raise("Unknown source type for EntitySetExpression: " + this.source.getType().name);
        }

    },
    nodeType: { value: $data.Expressions.ExpressionType.ServiceOperation, enumerable: true }
});