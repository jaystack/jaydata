$data.Class.define('$data.oDataParser.RequestExpressionBuilder', null, null, {
    buildConstant: function (value, type) {
        return new $data.Expressions.ConstantExpression(value, type);
    },
    buildProperty: function (expr, source) {
        return new $data.Expressions.PropertyExpression(expr, source);
    },
    buildParameter: function (name, type, nodeType) {
        expr = new $data.Expressions.ParameterExpression(name, type, nodeType);
        expr.paramIndex = 0;
        return expr;
    },
    buildSimpleBinary: function (left, right, op, type) {
        var operator, nodeType, value;
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

            default: Guard.raise(new Exception("Not implemented operator in $data.oDataParser.RequestExpressionBuilder.buildConstant: " + op)); break;
        }
        return new $data.Expressions.SimpleBinaryExpression(left, right, nodeType, value, type);
    },
    buildGlobalCall: function (type, name, args) {
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
            case "geo.distance": callName = "distance"; break;
            case "geo.intersects": callName = "intersects"; break;
            case "geo.length": callName = "length"; break;
            default: Guard.raise(new Exception("Not implemented globalCall name in $data.oDataParser.RequestExpressionBuilder.buildGlobalCall: " + name)); break;
        }

        var i = 0;
        for (; i < args.length; i++) {
            if (args[i] instanceof $data.Expressions.PropertyExpression)
                break;
        }
        var propertyExp = args.splice(i, 1)[0];

        var memberExp = this.buildConstant(callName, 'string');
        return new $data.Expressions.CallExpression(propertyExp, memberExp, args);
    },
    buildMemberPath: function (chain, it) {
        var expr = this.buildParameter(it || 'it', 'unknown', $data.Expressions.ExpressionType.LambdaParameterReference);
        for (var i = 0; i < chain.length; i++){
            expr = this.buildProperty(expr, this.buildConstant(chain[i], /*'string'*/ typeof chain[i]));
        }
        return expr;
    },
    buildOrderBy: function (items) {
        var newItems = new Array(items.length);
        for (var i = 0; i < items.length; i++) {
            newItems[i] = { expression: items[i].expr, nodeType: items[i].dir === 'asc' ? $data.Expressions.ExpressionType.OrderBy : $data.Expressions.ExpressionType.OrderByDescending };
        }
        return newItems;
    },
    buildUnary: function (operand, op, type) {
        var operator, nodeType, value;
        switch (op) {
            case "not": type = "boolean"; nodeType = "not"; operator = $data.unaryOperators.getOperator("!"); value = "!"; break;
            case "minus": type = "number"; nodeType = "negative"; operator = $data.unaryOperators.getOperator("-"); value = "-"; break;
            case "plus": type = "number"; nodeType = "positive"; operator = $data.unaryOperators.getOperator("+"); value = "+"; break;
            default: Guard.raise(new Exception("Not implemented operator in $data.oDataParser.RequestExpressionBuilder.buildConstant: " + op)); break;
        }
        return new $data.Expressions.UnaryExpression(operand, operator, nodeType, type);
    }
});
