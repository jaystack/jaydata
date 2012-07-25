function BuildError(msg) {
    throw msg;
}
function ODataExpressionBuilder() {
    this.buildConstant = function (value, type) {
        return new $data.Expressions.ConstantExpression(value, type);
    };
    this.buildProperty = function (expr, source) {
        return new $data.Expressions.PropertyExpression(expr, source);
    };
    this.buildParameter = function (name, type, nodeType) {
        return new $data.Expressions.ParameterExpression(name, type, nodeType);
    };
    this.buildSimpleBinary = function (left, right, op, type) {
        var operator, nodeType, value
        switch (op) {
            case "or": type = "boolean"; nodeType = "or"; operator = "||"; value = "||"; break;
            case "and": type = "boolean"; nodeType = "and"; operator = "&&"; value = "&&"; break;

            case "eq": type = "boolean"; nodeType = "equal"; operator = "=="; value = "=="; break;
            case "ne": type = "boolean"; nodeType = "notEqual"; operator = "!="; value = "!="; break;
            case "lt": type = "boolean"; nodeType = "lessThan"; operator = "<"; value = "<"; break;
            case "gt": type = "boolean"; nodeType = "greaterThan"; operator = ">"; value = ">"; break;
            case "le": type = "boolean"; nodeType = "lessThenOrEqual"; operator = "<="; value = "<="; break;
            case "ge": type = "boolean"; nodeType = "greaterThanOrEqual"; operator = ">="; value = ">="; break;

            case "add": type = "number"; nodeType = "add"; operator = "+"; value = "+"; break;
            case "sub": type = "number"; nodeType = "subtract"; operator = "-"; value = "-"; break;
            case "mul": type = "number"; nodeType = "multiply"; operator = "*"; value = "*"; break;
            case "div": type = "number"; nodeType = "divide"; operator = "/"; value = "/"; break;
            case "mod": type = "number"; nodeType = "modulo"; operator = "%"; value = "%"; break;

            default: BuildError("Not implemented operator in ODataExpressionBuilder.buildConstant: " + op); break;
        }
        return new $data.Expressions.SimpleBinaryExpression(left, right, nodeType, value, type);
    };
    this.buildGlobalCall = function (type, name, args) {
        var callName;
        switch (name) {
            case "substringof": callName = "contains"; break;
            case "startswith": callName = "startsWith"; break;
            case "endswith": callName = "endsWith"; break;
            case "length": callName = "length"; break;
            case "indexof": callName = "indexOf"; break;
            case "replace": callName = "replace"; break;
            case "substring": callName = "substr"; break;
            case "tolower": callName = "toLowerCase"; break;
            case "toupper": callName = "toUpperCase"; break;
            case "trim": callName = "trim"; break;
            case "concat": callName = "concat"; break;
            case "day": callName = "day"; break;
            case "hour": callName = "hour"; break;
            case "minute": callName = "minute"; break;
            case "month": callName = "month"; break;
            case "second": callName = "second"; break;
            case "year": callName = "year"; break;
            case "round": callName = "round"; break;
            case "floor": callName = "floor"; break;
            case "ceiling": callName = "ceiling"; break;
            default: BuildError("Not implemented globalCall name in ODataExpressionBuilder.buildGlobalCall: " + name); break;
        }

        var i = 0;
        for (; i < args.length; i++) {
            if (args[i] instanceof $data.Expressions.PropertyExpression)
                break;
        }
        var propertyExp = args.splice(i, 1)[0];

        var memberExp = this.buildConstant(callName, 'string');
        return new $data.Expressions.CallExpression(propertyExp, memberExp, args);
    };
    this.buildMemberPath = function (chain) {
        var expr = this.buildParameter('it', 'unknown', $data.Expressions.ExpressionType.LambdaParameterReference);
        expr.paramIndex = 0;
        for (var i = 0; i < chain.length; i++)
            expr = this.buildProperty(expr, this.buildConstant(chain[i], 'string'));
        return expr;
    };
    this.buildOrderBy = function (items) {
        var newItems = new Array(items.length);
        for (var i = 0; i < items.length; i++) {
            var pExp = this.buildParameter('it', 'unknown', $data.Expressions.ExpressionType.LambdaParameterReference);
            pExp.paramIndex = 0;

            var cExp = this.buildConstant(items[i].prop, 'string');

            var propExp = this.buildProperty(pExp, cExp);
            newItems[i] = { expression: propExp, frameType: items[i].dir === 'asc' ? 'orderBy' : 'orderByDescending' };
        }
        return newItems;
    };
    this.buildUnary = function (operand, op, type) {
        var operator, nodeType, value;
        switch (op) {
            case "not": type = "boolean"; nodeType = "not"; operator = "!"; value = "!"; break;
            case "minus": type = "number"; nodeType = "minus"; operator = "-"; value = "-"; break;
            case "plus": type = "number"; nodeType = "plus"; operator = "+"; value = "+"; break;
            default: BuildError("Not implemented operator in ODataExpressionBuilder.buildConstant: " + op); break;
        }
        return new $data.Expressions.UnaryExpression(operand, nodeType, operator, type);
    };
}
/*var $data = {
	Expressions: {
		ConstantExpression: function(value, type) {
			this.nodeType = "constant";
			this.type = type;
			this.value = value;
			this.toString = function (debug) {
				return this.value.toString();
			};
		},
		SimpleBinaryExpression: function(left, right, nodeType, operator, type, resolution) {
			this.left = left;
			this.right = right;
			this.nodeType = nodeType;
			this.operator = operator;
			this.type = type;
			this.resolution = resolution;
		},
		CallExpression: function(expression, member, args, type) {
			this.expression = expression;
			this.member = member;
			this.args = args;
			this.type = type;
		},
		MemberExpresion: function(member) {
			this.member = member;
		},
		OrderByExpression: function(items) {
			this.items = items;
		}
	}
}*/
