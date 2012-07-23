function BuildError(msg) {
	throw msg;
}
function ODataExpressionBuilder() {
	this.buildConstant = function (value, type) {
		return new $data.Expressions.ConstantExpression(value, type);
    };
	this.buildSimpleBinary = function (left, right, op, type) {
        var operator, nodeType, value
		switch(op) {
			case "or":  type = "boolean"; nodeType="or";  operator="||"; value = "||"; break;
			case "and": type = "boolean"; nodeType="and"; operator="&&"; value = "&&"; break;

			case "eq": type = "boolean"; nodeType="eq"; operator="=="; value = "=="; break;
			case "ne": type = "boolean"; nodeType="ne"; operator="!="; value = "!="; break;
			case "lt": type = "boolean"; nodeType="lt"; operator="<"; value = "<"; break;
			case "gt": type = "boolean"; nodeType="gt"; operator=">"; value = ">"; break;
			case "le": type = "boolean"; nodeType="le"; operator="<="; value = "<="; break;
			case "ge": type = "boolean"; nodeType="ge"; operator=">="; value = ">="; break;

			case "add": type = "number";  nodeType="add"; operator="+";  value = "+";  break;
			case "sub": type = "number";  nodeType="sub"; operator="-";  value = "-";  break;
			case "mul": type = "number";  nodeType="mul"; operator="*";  value = "*";  break;
			case "div": type = "number";  nodeType="div"; operator="/";  value = "/";  break;
			case "mod": type = "number";  nodeType="mod"; operator="%";  value = "%";  break;

			default: BuildError("Not implemented operator in ODataExpressionBuilder.buildConstant: " + op); break;
		}
        return new $data.Expressions.SimpleBinaryExpression(left, right, nodeType, value, type);
    };
	this.buildGlobalCall = function (type, name, args) {
        return new $data.Expressions.CallExpression(null, name, args, type);
	},
	this.buildMemberPath = function (member) {
        return new $data.Expressions.MemberExpresion(member);
	},
	this.buildOrderBy = function (items) {
		var newItems = new Array(items.length);
		for(var i=0; i<items.length; i++)
			newItems[i] = {member:items[i].prop, direction:items[i].dir};
        return new $data.Expressions.OrderByExpression(newItems);
	}
}
var $data = {
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
}
