//TODO: Finish refactoring ExpressionNode.js

$data.Class.define("$data.Expressions.ExpressionType", null, null, {}, {});


var ExpressionType = $data.Expressions.ExpressionType;

ExpressionType.Constant = "constant"; // { type:LITERAL, executable:true, valueType:, value: }
ExpressionType.Variable = "variable"; // { type:VARIABLE, executable:true, name: }
ExpressionType.MemberAccess = "memberAccess";    // { type:MEMBERACCESS, executable:true, expression:, member: }
ExpressionType.Call = "call";

/* binary operators */
ExpressionType.Equal = "equal";
ExpressionType.NotEqual = "notEqual";
ExpressionType.EqualTyped = "equalTyped";
ExpressionType.NotEqualTyped = "notEqualTyped";
ExpressionType.GreaterThen = "greaterThan";
ExpressionType.LessThen = "lessThan";
ExpressionType.GreaterThenOrEqual = "greaterThanOrEqual";
ExpressionType.LessThenOrEqual = "lessThenOrEqual"; 
ExpressionType.Or = "or";
ExpressionType.OrBitwise = "orBitwise";
ExpressionType.And = "and";
ExpressionType.AndBitwise = "andBitwise";


ExpressionType.In = "in";

ExpressionType.Add = "add";
ExpressionType.Divide = "divide";
ExpressionType.Multiply = "multiply";
ExpressionType.Subtract = "subtract";
ExpressionType.Modulo = "modulo";
ExpressionType.ArrayIndex = "arrayIndex";

/* unary operators */
ExpressionType.New = "new";
ExpressionType.Positive = "positive";
ExpressionType.Negative = "negative";
ExpressionType.Increment = "increment";
ExpressionType.Decrement = "decrement";
ExpressionType.Not = "not";


ExpressionType.This = "this";
ExpressionType.LambdaParameterReference = "lambdaParameterReference";
ExpressionType.LambdaParameter = "lambdaParameter";
ExpressionType.Parameter = "parameter";

ExpressionType.ArrayLiteral = "arrayLiteral";
ExpressionType.ObjectLiteral = "objectLiteral";
ExpressionType.ObjectField = "objectField";
ExpressionType.Function = "Function";
ExpressionType.Unknown = "UNKNOWN";

ExpressionType.EntitySet = "EntitySet";
ExpressionType.ServiceOperation = "ServiceOperation";
ExpressionType.EntityField = "EntityField";
ExpressionType.EntityContext = "EntityContext";
ExpressionType.Entity = "Entity";
ExpressionType.Filter = "Filter";
ExpressionType.First = "First";
ExpressionType.Count = "Count";
ExpressionType.Single = "Single";
ExpressionType.Some = "Some";
ExpressionType.Every = "Every";
ExpressionType.ToArray = "ToArray";
ExpressionType.ForEach = "ForEach";
ExpressionType.Projection = "Projection";
ExpressionType.EntityMember = "EntityMember";
ExpressionType.EntityFieldOperation = "EntityFieldOperation";
ExpressionType.FrameOperation = "FrameOperation";
ExpressionType.EntityBinary = "EntityBinary";
ExpressionType.Code = "Code";
ExpressionType.ParametricQuery = "ParametricQuery";
ExpressionType.MemberInfo = "MemberInfo";
ExpressionType.QueryParameter = "QueryParameter";
ExpressionType.ComplexEntityField = "ComplexEntityField";


ExpressionType.Take = "Take";
ExpressionType.Skip= "Skip";
ExpressionType.OrderBy = "OrderBy";
ExpressionType.OrderByDescending = "OrderByDescending";
ExpressionType.Include = "Include";
ExpressionType.Count = "Count";



$data.Expressions.ExpressionType = ExpressionType;

function BinaryOperator() {
    ///<field name="operator" type="string" />
    ///<field name="expressionType" type="$data.ExpressionType" />
    ///<field name="type" type="string" />
}

var binaryOperators = [
    { operator: "==", expressionType: ExpressionType.Equal, type: "boolean", implementation: function (a, b) { return a == b; } },
    { operator: "===", expressionType: ExpressionType.EqualTyped, type: "boolean", implementation: function (a, b) { return a === b; } },
    { operator: "!=", expressionType: ExpressionType.NotEqual, type: "boolean", implementation: function (a, b) { return a != b; } },
    { operator: "!==", expressionType: ExpressionType.NotEqualTyped, type: "boolean", implementation: function (a, b) { return a !== b; } },
    { operator: ">", expressionType: ExpressionType.GreaterThen, type: "boolean", implementation: function (a, b) { return a > b; } },
    { operator: ">=", expressionType: ExpressionType.GreaterThenOrEqual, type: "boolean", implementation: function (a, b) { return a >= b; } },
    { operator: "<=", expressionType: ExpressionType.LessThenOrEqual, type: "boolean", implementation: function (a, b) { return a <= b; } },
    { operator: "<", expressionType: ExpressionType.LessThen, type: "boolean", implementation: function (a, b) { return a < b; } },
    { operator: "&&", expressionType: ExpressionType.And, type: "boolean", implementation: function (a, b) { return a && b; } },
    { operator: "||", expressionType: ExpressionType.Or, type: "boolean", implementation: function (a, b) { return a || b; } },
    { operator: "&", expressionType: ExpressionType.AndBitwise, type: "number", implementation: function (a, b) { return a & b; } },
    { operator: "|", expressionType: ExpressionType.OrBitwise, type: "number", implementation: function (a, b) { return a | b; } },
    { operator: "+", expressionType: ExpressionType.Add, type: "number", implementation: function (a, b) { return a + b; } },
    { operator: "-", expressionType: ExpressionType.Subtract, type: "number", implementation: function (a, b) { return a - b; } },
    { operator: "/", expressionType: ExpressionType.Divide, type: "number", implementation: function (a, b) { return a / b; } },
    { operator: "%", expressionType: ExpressionType.Modulo, type: "number", implementation: function (a, b) { return a % b; } },
    { operator: "*", expressionType: ExpressionType.Multiply, type: "number", implementation: function (a, b) { return a * b; } },
    { operator: "[", expressionType: ExpressionType.ArrayIndex, type: "number", implementation: function (a, b) { return a[b]; } },
    { operator: "in", expressionType: ExpressionType.In, type: 'boolean', implementation: function (a, b) { return a in b; } }
];


binaryOperators.resolve = function (operator) {
    var result = binaryOperators.filter(function (item) { return item.operator == operator; });
    if (result.length > 0)
        return operator;
    //Guard.raise("Unknown operator: " + operator);
};

binaryOperators.contains = function (operator) {
    return binaryOperators.some(function (item) { return item.operator == operator; });
};

binaryOperators.getOperator = function (operator) {
    ///<returns type="BinaryOperator" />
    var result = binaryOperators.filter(function (item) { return item.operator == operator; });
    if (result.length < 1)
        Guard.raise("Unknown operator: " + operator);
    return result[0];
};


var unaryOperators = [
    { operator: "+", arity:"prefix", expressionType : ExpressionType.Positive, type: "number", implementation: function(operand) { return +operand; } },
    { operator: "-", arity:"prefix", expressionType : ExpressionType.Negative, type: "number", implementation: function(operand) { return -operand; } },
    { operator: "++", arity:"prefix", expressionType : ExpressionType.Increment, type: "number", implementation: function(operand) { return ++operand; } },
    { operator: "--", arity:"prefix", expressionType: ExpressionType.Decrement, type: "number", implementation: function (operand) { return --operand; } },
    { operator: "++", arity: "suffix", expressionType: ExpressionType.Increment, type: "number", implementation: function (operand) { return operand++; } },
    { operator: "!", arity: "prefix", expressionType: ExpressionType.Not, type: "boolean", implementation: function (operand) { return !operand; } },
    { operator: "--", arity:"suffix", expressionType: ExpressionType.Decrement, type: "number", implementation: function (operand) { return operand--; } }
    
    //{ operator: "new", expressionType : ExpressionType.New, type: "object", implementation: function(operand) { return new operand; }
];
unaryOperators.resolve = function (operator) {
    var result = unaryOperators.filter(function (item) { return item.operator == operator ; });
    if (result.length > 0)
        return operator;
    //Guard.raise("Unknown operator: " + operator);
};

unaryOperators.contains = function (operator) {
    return unaryOperators.some(function (item) { return item.operator == operator; });
};

unaryOperators.getOperator = function (operator, arity) {
    ///<returns type="BinaryOperator" />
    var result = unaryOperators.filter(function (item) { return item.operator == operator && (!arity || item.arity == arity); });
    if (result.length < 1)
        Guard.raise("Unknown operator: " + operator);
    return result[0];
};


function timeIt(fn, iterations) {
    iterations = iterations || 1;

    console.time("!");
    for (var i = 0; i < iterations; i++) {
        fn();
    }
    console.timeEnd("!");
}

var UNARY = "UNARY";                  // { type:UNARY, executable:true, operator:, operand: }
var INCDEC = "INCDEC";                // { type:INCDEC, executable:true, operator:, operand:, suffix: }
var DECISION = "DECISION";            // { type:DECISION, executable:true, expression:, left:, right: }
var METHODCALL = "METHODCALL";        // { type:METHODCALL, executable:true, object:, method:, args: }
var NEW = "NEW";                      // { type:NEW, executable:true, values: [] };
var JSONASSIGN = "JSONASSIGN";        // { type:JSONASSIGN, executable:true, left:, right: }
var ARRAYACCESS = "ARRAYACCESS";      // { type:ARRAYACCESS, executable:true, array:, index: }
var UNKNOWN = "UNKNOWN";

var executable = true;

function jsonify(obj) { return JSON.stringify(obj, null, "\t"); }

$C('$data.Expressions.ExpressionNode', $data.Entity, null, {
    constructor: function () {
        ///<summary>Provides a base class for all Expressions.</summary>
        ///<field name="nodeType" type="string">Represents the expression type of the node&#10;
        ///For the list of expression node types refer to $data.Expressions.ExpressionType
        ///</field>
        ///<field name="type" type="Function">The result type of the expression</field>
        ///<field name="executable" type="boolean">True if the expression can be evaluated to yield a result</field>
        ///this.nodeType = ExpressionType.Unknown;
        ///this.type = type;
        ///this.nodeType = ExpressionType.Unknown;
        ///this.executable = (executable === undefined || executable === null) ? true : executable;
        ///TODO
        this.expressionType = this.constructor;
    },

    getJSON: function () { return jsonify(this); },

    //TOBLOG maybe
    expressionType: {
        value: undefined,
        ////OPTIMIZE
        set: function (value) {
            var _expressionType;
            Object.defineProperty(this, "expressionType", {
                set: function (value) {
                    if (typeof value === 'string') {
                        value = Container.resolveType(value);
                    }
                    _expressionType = value;
                },
                get: function (value) {
                    //IE ommits listing JSON.stringify in call chain

                        if (arguments.callee.caller == jsonify || arguments.callee.caller == JSON.stringify) {
                        return Container.resolveName(_expressionType);
                    }
                    return _expressionType;
                },
                enumerable: true
            });

            this.expressionType = value;
        },
        get: function () { return undefined; },
        enumerable: true
    },

    ///toString: function () { },
    nodeType: { value: ExpressionType.Unknown, writable: false },

    type: {},

    toString: function () {
        return this.value;
    }
}, null);


$C('$data.Expressions.UnaryExpression', $data.Expressions.ExpressionNode, null, {
    constructor: function (operand, operator, nodeType, resolution) {
    	/// <summary>
    	/// Represents an operation with only one operand and an operator
    	/// </summary>
    	/// <param name="operand"></param>
    	/// <param name="operator"></param>
    	/// <param name="nodeType"></param>
    	/// <param name="resolution"></param>
        this.operand = operand;
        this.operator = operator;
        this.nodeType = nodeType;
        this.resolution = resolution;
    },

    operator: { value: undefined, writable: true },
    operand: { value: undefined, writable: true },
    nodeType: { value: undefined, writable: true }
});




//$data.Expressions.ExpressionNodeTypes.NewExpressionNode = $C('NewExpressionNode', $data.Expressions.ExpressionNodeTypes.ExpressionNode, null, {
//    values: { value: undefined },
//    constructor: function (type, executable, values) {
//        this.values = values;
//    }
//}, {
//    create: function (executable, values) {
//        return new $data.Expressions.ExpressionNodeTypes.NewExpressionNode(NEW, executable, values);
//    }
//});


//$data.Expressions.ExpressionNodeTypes.IncDecExpressionNode = $C('IncDecExpressionNode', $data.Expressions.ExpressionNodeTypes.ExpressionNode, null, {
//    operator: { value: undefined },
//    operand: { value: undefined },
//    suffix: { value: undefined },
//    constructor: function (type, executable, operator, operand, suffix) {
//        this.operator = operator;
//        this.operand = operand;
//        this.suffix = suffix;
//    }
//}, {
//    create: function (executable, operator, operand, suffix) {
//        return new $data.Expressions.ExpressionNodeTypes.IncDecExpressionNode(INCDEC, executable, operator, operand, suffix);
//    }
//});


//$data.Expressions.ExpressionNodeTypes.DecisionExpressionNode = $C('DecisionExpressionNode', $data.Expressions.ExpressionNodeTypes.ExpressionNode, null, {
//    expression: { value: undefined },
//    left: { value: undefined },
//    right: { value: undefined },
//    constructor: function (type, executable, expression, left, right) {
//        this.expression = expression;
//        this.left = left;
//        this.right = right;
//    }
//}, {
//    create: function (executable, expression, left, right) {
//        return new $data.Expressions.ExpressionNodeTypes.DecisionExpressionNode(DECISION, executable, expression, left, right);
//    }
//});



