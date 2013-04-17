$C('$data.Expressions.ServiceOperationExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector, params, cfg, boundItem) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntityContextExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///<param name="params" type="$data.Array" />
        ///<param name="cfg" type="$data.Object" />
        ///</signature>
        Guard.requireType("source", source, [$data.Expressions.EntityContextExpression]);
        Guard.requireType("selector", source, [$data.Expressions.MemberInfoExpression]);

        this.source = source;
        this.selector = selector
        this.params = params
        this.cfg = cfg;
        this.boundItem = boundItem;

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
                this.elementType = cfg.elementType ? Container.resolveType(cfg.elementType) : (this.elementType ? Container.resolveType(cfg.returnType) : null);
                this.storageModel = cfg.elementType ? c.instance._storageModel.getStorageModel(Container.resolveType(cfg.elementType)) : null;
                break;
            default:
                Guard.raise("Unknown source type for EntitySetExpression: " + this.source.getType().name);
        }

    },
    nodeType: { value: $data.Expressions.ExpressionType.ServiceOperation, enumerable: true }
});