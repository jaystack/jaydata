$C('$data.Expressions.EntityExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source, selector) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.MemberInfoExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.IndexingExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.AccessorExpression" />
        ///</signature>
        Guard.requireValue("source", source);
        Guard.requireValue("selector", selector);
        if (!(source instanceof $data.Expressions.EntitySetExpression) && !(source instanceof $data.Expressions.ServiceOperationExpression)) {
            Guard.raise("Only EntitySetExpressions can be the source for an EntityExpression");
        }

        this.source = source;
        this.selector = selector;

        this.entityType = this.source.elementType;
        this.storageModel = this.source.storageModel;

        Guard.requireValue("entityType", this.entityType);
        Guard.requireValue("storageModel", this.storageModel);

    },

    getMemberDefinition: function (name) {
        var memdef = this.entityType.getMemberDefinition(name);
        if (!(memdef)) {
            Guard.raise(new Exception("Unknown member " + name + " on type "+ this.entityType.name, "MemberNotFound"));
        };
            memdef.storageModel = this.storageModel;
        return memdef;
    },

    nodeType: { value: $data.Expressions.ExpressionType.Entity }
});