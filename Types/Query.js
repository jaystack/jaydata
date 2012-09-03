$C('$data.Query', null, null,
{
    constructor: function (expression, defaultType, context) {
        ///<param name="context" type="$data.EntityContext" />
        ///<field name="expression" type="$data.Expressions.ExpressionNode" />
        ///<field name="context" type="$data.EntityContext" />

        this.expression = expression;
        this.context = context;

        //TODO: expressions get as JSON string?!
        
        this.expressions = expression;
        this.defaultType = defaultType;
        this.result = [];
        this.rawDataList = [];
        this.modelBinderConfig = {};
        this.context = context;
    },
        
    rawDataList: { dataType: "Array" },
    result: { dataType: "Array" },
    resultType: {},
    buildResultSet: function (ctx) {
        var converter = new $data.ModelBinder(this.context);
        this.result = converter.call(this.rawDataList, this.modelBinderConfig);
        return;
    },
    getEntitySets: function(){
        var ret = [];
        var ctx = this.context;
        
        var fn = function(expression){
            if (expression instanceof $data.Expressions.EntitySetExpression){
                if (ret.indexOf(ctx._entitySetReferences[expression.elementType.name]) < 0)
                    ret.push(ctx._entitySetReferences[expression.elementType.name]);
            }
            if (expression.source) fn(expression.source);
        };
        
        fn(this.expression);
        
        return ret;
    }
}, null);
