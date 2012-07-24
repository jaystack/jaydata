function BuildError(msg) {
	throw msg;
}
function ODataExpressionBuilder(context) {
	this.buildConstant = function (value, type) {
		return new $data.Expressions.ConstantExpression(value, type);
    };
	this.buildSimpleBinary = function (left, right, op, type) {
        var operator, nodeType, value
		switch(op) {
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
        return new $data.Expressions.CallExpression(null, name, args, type);
	},
	this.buildMemberPath = function (member) {
	    var paramExp = new $data.Expressions.ParameterExpression('it', 'unknown', $data.Expressions.ExpressionType.LambdaParameterReference);
	    paramExp.paramIndex = 0;

	    var firstMember = member[0];
	    var constExp = new $data.Expressions.ConstantExpression(firstMember, 'string');

	    var propExp = new $data.Expressions.PropertyExpression(paramExp, constExp);
	    for (var i = 1; i < member.length; i++) {
	        propExp = new $data.Expressions.PropertyExpression(propExp, new $data.Expressions.ConstantExpression(member[i], 'string'));
	    }
	    return propExp;
	},
	this.buildOrderBy = function (items) {
		var newItems = new Array(items.length);
		for(var i=0; i<items.length; i++)
			newItems[i] = {member:items[i].prop, direction:items[i].dir};
        return new $data.Expressions.OrderByExpression(newItems);
	}
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
