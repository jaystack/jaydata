
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
        this.resultType = $data.Array;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Filter, enumerable: true }
});

$C('$data.Expressions.InlineCountExpression', $data.Expressions.EntitySetExpression, null, {
    constructor: function (source, selector) {
    },
    nodeType: { value: $data.Expressions.ExpressionType.InlineCount, enumerable: true }
});

$C('$data.Expressions.FrameOperator', $data.Expressions.ExpressionNode, null, {
    constructor: function () {
        this.isTerminated = true;
    }
});

$C('$data.Expressions.CountExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Integer;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Count, enumerable: true }
});

$C('$data.Expressions.SingleExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Single, enumerable: true }
});

$C('$data.Expressions.FindExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source, params) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.params = params;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Find, enumerable: true }
});

$C('$data.Expressions.FirstExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.First, enumerable: true }
});

$C('$data.Expressions.ForEachExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Array;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ForEach, enumerable: true }
});
$C('$data.Expressions.ToArrayExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Array;
    },
    nodeType: { value: $data.Expressions.ExpressionType.ToArray, enumerable: true }
});

$C('$data.Expressions.SomeExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Some, enumerable: true }
});

$C('$data.Expressions.EveryExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Object;
    },
    nodeType: { value: $data.Expressions.ExpressionType.Every, enumerable: true }
});

$C('$data.Expressions.BatchDeleteExpression', $data.Expressions.FrameOperator, null, {
    constructor: function (source) {
        ///<signature>
        ///<param name="source" type="$data.Expressions.EntitySetExpression" />
        ///</signature>
        this.source = source;
        this.resultType = $data.Integer;
    },
    nodeType: { value: $data.Expressions.ExpressionType.BatchDelete, enumerable: true }
});