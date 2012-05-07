
$C('$data.Expressions.FilterExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function (source, selector) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.ParametricQueryExpression" />
        ///</signature>
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///<param name="selector" type="$data.Expressions.CodeExpression" />
        ///</signature>

    },
    nodeType: { value: $data.Expressions.ExpressionType.Filter, enumerable: true }
});

$C('$data.Expressions.CountExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Count, enumerable: true }
});

$C('$data.Expressions.SingleExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Single, enumerable: true }
});

$C('$data.Expressions.FirstExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
    },
    nodeType: { value: $data.Expressions.ExpressionType.First, enumerable: true }
});