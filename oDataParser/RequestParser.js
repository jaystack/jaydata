(function () {
    var ASCII = $data.oDataParser.ASCII;
    var CharType = $data.oDataParser.CharType;
    var TokenType = $data.oDataParser.TokenType;

    // ODataQueryRequest
    $data.Class.define('$data.oDataParser.QueryRequest', $data.Base, null, {
        constructor: function () {
            this.filter = "";
            this.orderby = "";
            this.skip = "";
            this.top = "";
            this.select = "";
            this.expand = "";
            this.format = "";
            this.inlinecount = "";
        }/*,
        filter: { type: 'string' },
        orderby: { type: 'string' },
        skip: { type: 'string' },
        top: { type: 'string' },
        select: { type: 'string' },
        expand: { type: 'string' },
        format: { type: 'string' },
        inlinecount: { type: 'string' }*/
    });

    // ODataRequestParser
    $data.Class.define('$data.oDataParser.RequestParser', null, null, {
        constructor: function () {
            this.req = null;
            this.lexer = null;
            this.builder = new $data.oDataParser.RequestExpressionBuilder();

            this.reservedNs = ['geo'];
            this.lambdaParameter = [];
        },
        parse: function (req) {
            ///<param name="req" type="$data.oDataParser.QueryRequest" />

            this.req = req;
            if (req.filter.length > 0) this.parseFilterExpr();
            if (req.orderby.length > 0) this.parseOrderByExpr();
            if (req.skip.length > 0) this.parseSkipExpr();
            if (req.top.length > 0) this.parseTopExpr();
            if (req.select.length > 0) this.parseSelectExpr();
            if (req.expand.length > 0) this.parseExpandExpr();
            //if(req.format.length>0)      this.parseFormatExpr();
            //if(req.inlinecount.length>0) this.parseInlineCountExpr();
        },

        parseFilterExpr: function () {
            this.lexer = new $data.oDataParser.RequestLexer(this.req.filter);
            var expr = this.parseExpr();
            var token = this.lexer.token;
            if (token && token.tokenType != TokenType.EOF)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Unexpected " + this.tokenName(token.tokenType) + " in $filter: '" + token.value + "'.", "parseFilterExpr");
            this.req.filter = expr;
        },
        parseOrderByExpr: function () {
            this.lexer = new $data.oDataParser.RequestLexer(this.req.orderby);
            var expr = this.parseOrderBy();
            var token = this.lexer.token;
            if (token && token.tokenType != TokenType.EOF) {
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Unexpected " + this.tokenName(token.tokenType) + " in $orderby: '" + token.value + "'.", "parseOrderByExpr");
            }
            this.req.orderby = expr;
        },
        parseSkipExpr: function () {
            this.lexer = new $data.oDataParser.RequestLexer(this.req.skip);
            var token = this.lexer.token;
            if (this.lexer.token.tokenType != TokenType.DIGITS)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid expression in $skip: '" + token.value + "'.", "parseSkipExpr");
            var expr = this.parseNumberLiteral();
            token = this.lexer.token;
            if (token && token.tokenType != TokenType.EOF)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Unexpected " + this.tokenName(token.tokenType) + " in $skip: '" + token.value + "'.", "parseSkipExpr");
            this.req.skip = expr;
        },
        parseTopExpr: function () {
            this.lexer = new $data.oDataParser.RequestLexer(this.req.top);
            var token = this.lexer.token;
            if (this.lexer.token.tokenType != TokenType.DIGITS)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid expression in $top: '" + token.value + "'.", "parseTopExpr");
            var expr = this.parseNumberLiteral();
            token = this.lexer.token;
            if (token && token.tokenType != TokenType.EOF)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Unexpected " + this.tokenName(token.tokenType) + " in $top: '" + token.value + "'.", "parseTopExpr");
            this.req.top = expr;
        },
        parseSelectExpr: function () {
            this.lexer = new $data.oDataParser.RequestLexer(this.req.select);
            var expressions = [];

            var expr = this.parseExpr();
            expressions.push(expr);
            var token = this.lexer.token;
            while (token && token.value == ASCII.COMMA) {
                this.lexer.nextToken();
                expr = this.parseExpr();
                expressions.push(expr);
                token = this.lexer.token;
            }
            if (token.tokenType != TokenType.EOF)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Unexpected " + this.tokenName(token.tokenType) + " in $filter: '" + token.value + "'.", "parseSelectExpr");

            this.req.select = expressions;
        },
        parseExpandExpr: function () {
            this.lexer = new $data.oDataParser.RequestLexer(this.req.expand);
            this.req.expand = this.parseExpand();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.EOF)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Unexpected " + this.tokenName(token.tokenType) + " in $filter: '" + token.value + "'.", "parseExpandExpr");
        },
        /*
        parseInlineCountExpr: function() {
            //TO DO: parseInlineCountExpr
        },
        parseFormatExpr: function() {
            //TO DO: parseFormatExpr
        },
        */

        tokenName: function (tokenType) {
            var tokenName;
            for (var key in TokenType)
                if (TokenType[tokenName = key] == tokenType)
                    break;
            return tokenName;
        },
        /***************************************************     BNF    *****************************************************/
        functionNames: {
            value: [
                //string
                "substringof", "endswith", "startswith", "length", "indexof", "replace", "substring", "tolower", "toupper", "trim", "concat",
                //Date
                "day", "hour", "minute", "month", "second", "year",
                //Math
                "round", "floor", "ceiling",
                //Type
                "IsOf",
                //Geo
                "geo.distance", "geo.intersects", "geo.length"
            ]
        },
        functionTypes: {
            value: [
                //string
                "boolean", "boolean", "boolean", "int", "int", "string", "string", "string", "string", "string", "string",
                //Date
                "int", "int", "int", "int", "int", "int",
                //Math
                "number", "number", "number",
                //Type
                "boolean",
                //Geo
                "number", "boolean", "number"
            ]
        },
        reservedNs: {},
        parseExpr: function () {
            //bnf: Expr               : OrExpr;
            return this.parseOrExpr();
        },
        parseOrExpr: function () {
            //bnf: OrExpr             : AndExpr | OrExpr "or" AndExpr;
            var expr = this.parseAndExpr();
            if (this.lexer.token.value == "or") {
                this.lexer.nextToken();
                var right = this.parseOrExpr();
                if (!right)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "parseOrExpr");
                expr = this.builder.buildSimpleBinary(expr, right, "or", "or");
            }
            return expr;
        },
        parseAndExpr: function () {
            //bnf: AndExpr            : EqualityExpr | AndExpr "and" EqualityExpr;
            var expr = this.parseEqualityExpr();
            if (this.lexer.token.value == "and") {
                this.lexer.nextToken();
                var right = this.parseAndExpr();
                if (!right)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "parseAndExpr");
                expr = this.builder.buildSimpleBinary(expr, right, "and", "and");
            }
            return expr;
        },
        parseEqualityExpr: function () {
            //bnf: EqualityExpr       : RelationalExpr | EqualityExpr "eq" RelationalExpr | EqualityExpr "ne" RelationalExpr;
            var expr = this.parseRelationalExpr();
            var token = this.lexer.token;
            if (token.value == "eq" || token.value == "ne") {
                this.lexer.nextToken();
                var right = this.parseEqualityExpr();
                if (!right)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "parseEqualityExpr");
                expr = this.builder.buildSimpleBinary(expr, right, token.value, token.value);
            }
            return expr;
        },
        parseRelationalExpr: function () {
            //bnf: RelationalExpr     : AdditiveExpr | RelationalExpr ( "lt" | "gt" | "le" | "ge" ) AdditiveExpr;
            var expr = this.parseAdditiveExpr();
            var token = this.lexer.token;
            if (token.value == "lt" || token.value == "gt" || token.value == "le" || token.value == "ge") {
                this.lexer.nextToken();
                var right = this.parseRelationalExpr();
                if (!right)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "RelationalExpr");
                expr = this.builder.buildSimpleBinary(expr, right, token.value, token.value);
            }
            return expr;
        },
        parseAdditiveExpr: function () {
            //bnf: AdditiveExpr       : MultiplicativeExpr | AdditiveExpr "add" MultiplicativeExpr | AdditiveExpr "sub" MultiplicativeExpr;
            var expr = this.parseMultiplicativeExpr();
            var token = this.lexer.token;
            if (token.value == "add" || token.value == "sub") {
                this.lexer.nextToken();
                var right = this.parseAdditiveExpr();
                if (!right)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "AdditiveExpr");
                expr = this.builder.buildSimpleBinary(expr, right, token.value, token.value);
            }
            return expr;
        },
        parseMultiplicativeExpr: function () {
            //bnf: MultiplicativeExpr : UnaryExpr | MultiplicativeExpr "mul" UnaryExpr | MultiplicativeExpr "div"  UnaryExpr | MultiplicativeExpr "mod" UnaryExpr;
            var expr = this.parseUnaryExpr();
            var token = this.lexer.token;
            if (token.value == "mul" || token.value == "div" || token.value == "mod") {
                this.lexer.nextToken();
                var right = this.parseMultiplicativeExpr();
                if (!right)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "MultiplicativeExpr");
                expr = this.builder.buildSimpleBinary(expr, right, token.value, token.value);
            }
            return expr;
        },
        parseUnaryExpr: function () {
            //bnf: UnaryExpr          : PrimaryExpr | "-" PrimaryExpr | "not" PrimaryExpr;
            var expr = this.parsePrimaryExpr();
            if (expr)
                return expr;
            var token = this.lexer.token;
            if (token.value == ASCII.MINUS) {
                this.lexer.nextToken();
                expr = this.parseUnaryExpr();
                if (!expr)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "parseUnaryExpr");
                return this.builder.buildUnary(expr, "minus")
            }
            if (token.value == ASCII.PLUS) {
                this.lexer.nextToken();
                expr = this.parseUnaryExpr();
                if (!expr)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "parseUnaryExpr");
                return this.builder.buildUnary(expr, "plus")
            }
            if (token.value == "not") {
                this.lexer.nextToken();
                expr = this.parseUnaryExpr();
                if (!expr)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: Expr.", "parseUnaryExpr");
                return this.builder.buildUnary(expr, "not")
            }
        },
        parsePrimaryExpr: function () {
            //bnf: PrimaryExpr        : ParenExpr | LiteralExpr | FunctionCall | MemberPath
            var expr;
            if (expr = this.parseNULLLiteral()) return expr;
            if (expr = this.parseLiteralExpr()) return expr;
            if (expr = this.parseFunctionCall()) return expr;
            if (expr = this.parseMemberPath()) return expr;
            if (expr = this.parseParenExpr()) return expr;
            return null;
        },
        parseNULLLiteral: function () {
            //TODO: validate by gyeby
            var v = this.lexer.token.value;
            if (v == "NULL" || v == "null") {
                this.lexer.nextToken();
                return this.builder.buildConstant(null, typeof null);
            }
            return null;
        },
        parseParenExpr: function () {
            //bnf: ParenExpr          : "(" Expr ")"
            if (this.lexer.token.value != ASCII.LPAREN)
                return null;
            this.lexer.nextToken();
            var expr = this.parseExpr();
            if (this.lexer.token.value != ASCII.RPAREN)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected ')'.", "parseParenExpr");
            this.lexer.nextToken();
            return expr;
        },
        parseLiteralExpr: function () {
            //bnf: LiteralExpr        : DatetimeLiteral | StringLiteral | BoolLiteral | NumberLiteral
            var expr;
            if (expr = this.parseDatetimeLiteral()) return expr;
            if (expr = this.parseDatetimeOffsetLiteral()) return expr;
            if (expr = this.parseTimeLiteral()) return expr;
            if (expr = this.parseStringLiteral()) return expr;
            if (expr = this.parseGuidLiteral()) return expr;
            if (expr = this.parseBoolLiteral()) return expr;
            if (expr = this.parseNumberLiteral()) return expr;
            if (expr = this.parseGeographyLiteral()) return expr;
            if (expr = this.parseGeometryLiteral()) return expr;
            if (expr = this.parseBinaryLiteral()) return expr;
            if (expr = this.parseXLiteral()) return expr;
            return null;
        },
        parseDatetimeLiteral: function () {
            //bnf: DatetimeLiteral    : "datetime" "'" DIGITS "-" DIGITS "-" DIGITS [ "T" DIGITS ":" DIGITS ":" DIGITS [ "." DIGITS ] [ ( SIGN ) DIGITS ":" DIGTS ] [ "Z" ]
            //example: datetime'2010-07-15'
            //         datetime'2010-07-15T16:19:54Z'.
            //         datetime'2011-06-07T13:18:25.0348565-07:00'
            if (this.lexer.token.value != "datetime")
                return null;
            this.lexer.nextToken();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.STRING)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid date format.", "parseDatetimeLiteral");
            var d;
            try {
                d = new Date(token.value);
            } catch (e) {
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid date format.", "parseDatetimeLiteral");
            }
            this.lexer.nextToken();
            return this.builder.buildConstant(d, "datetime");
        },
        parseDatetimeOffsetLiteral: function () {
            //bnf: DatetimeLiteral    : "datetimeoffset" "'" DIGITS "-" DIGITS "-" DIGITS [ "T" DIGITS ":" DIGITS ":" DIGITS [ "." DIGITS ] [ ( SIGN ) DIGITS ":" DIGTS ] [ "Z" ]
            //example: datetimeoffset'2010-07-15'
            //         datetimeoffset'2010-07-15T16:19:54Z'.
            //         datetimeoffset'2011-06-07T13:18:25.0348565-07:00'
            if (this.lexer.token.value != "datetimeoffset")
                return null;
            this.lexer.nextToken();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.STRING)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid date format.", "parseDatetimeLiteral");
            var d;
            try {
                d = new Date(token.value);
            } catch (e) {
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid date format.", "parseDatetimeLiteral");
            }
            this.lexer.nextToken();
            return this.builder.buildConstant(d, "datetime");
        },
        parseTimeLiteral: function () {
            if (this.lexer.token.value != "time")
                return null;
            this.lexer.nextToken();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.STRING)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid date format.", "parseDatetimeLiteral");
            var d = token.value;
            this.lexer.nextToken();
            return this.builder.buildConstant(d, "string");
        },
        parseBinaryLiteral: function () {
            if (this.lexer.token.value != "binary")
                return null;
            this.lexer.nextToken();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.STRING)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid date format.", "parseDatetimeLiteral");
            var d = $data.Blob.createFromHexString(token.value);
            this.lexer.nextToken();
            return this.builder.buildConstant(d, "blob");
        },
        parseXLiteral: function () {
            if (this.lexer.token.value != "X")
                return null;
            this.lexer.nextToken();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.STRING)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid date format.", "parseDatetimeLiteral");
            var d = $data.Blob.createFromHexString(token.value);
            this.lexer.nextToken();
            return this.builder.buildConstant(d, "blob");
        },
        parseGuidLiteral: function () {
            if (this.lexer.token.value != "guid")
                return null;
            this.lexer.nextToken();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.STRING)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid guid format.", "parseGuidLiteral");
            var d;
            try {
                d = $data.parseGuid(token.value);
            } catch (e) {
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid guid format.", "parseGuidLiteral");
            }
            this.lexer.nextToken();
            return this.builder.buildConstant(d, "guid");
        },
        parseStringLiteral: function () {
            //bnf: StringLiteral      : STRING
            if (this.lexer.token.tokenType != TokenType.STRING)
                return null;
            var v = this.lexer.token.value;
            this.lexer.nextToken();
            return this.builder.buildConstant(v, "string");
        },
        parseBoolLiteral: function () {
            //bnf: BoolLiteral        : "true" | "false" | "0" | "1"
            var v = this.lexer.token.value;
            if (v == "true"/*||v=="1"*/) {
                this.lexer.nextToken();
                return this.builder.buildConstant(true, typeof true);
            }
            if (v == "false"/*||v=="0"*/) {
                this.lexer.nextToken();
                return this.builder.buildConstant(false, typeof false);
            }
            return null;
        },
        parseNumberLiteral: function () {
            //bnf: NumberLiteral      : 1*DIGIT [ "." 1*DIGIT ] [ "E" [ Sign ] 1*DIGIT ] [ "M" | "m" ] |  //double
            //bnf:                      1*DIGIT [ "." 1*DIGIT ] [ "f" ]                                |  //single
            //bnf:                      1*DIGIT [ "L" ]                                                   //long
            var sign, digits1, digits2, digits3;
            var v = "";
            var token = this.lexer.token;
            if (token.tokenType != TokenType.DIGITS)
                return null;

            digits1 = token.value;
            v += digits1;
            var isInteger = true;
            this.lexer.nextToken();
            token = this.lexer.token;
            if (token.value == "L") {
                this.lexer.nextToken();
                return this.builder.buildConstant(v, "string"); // long
            }
            if (token.value == ASCII.DOT) {
                isInteger = false;
                this.lexer.nextToken();
                token = this.lexer.token;
                if (token.tokenType != TokenType.DIGITS)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected DIGITS (after '.').", "parseDoubleStrict");
                digits2 = token.value;
                v += "." + digits2;
                this.lexer.nextToken();
                token = this.lexer.token;
            }
            if (token.value == "f") {
                this.lexer.nextToken();
                return this.builder.buildConstant(parseFloat(v), "number"); // single
            }
            if (token.value == "e") {
                isInteger = false;
                this.lexer.nextToken();
                sign = this.parseSign();
                token = this.lexer.token;
                if (token.tokenType != TokenType.DIGITS)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected DIGITS (after Sign).", "parseDoubleStrict");
                digits3 = token.value;
                v += "e" + (sign ? String.fromCharCode(sign) : "") + digits3;
                this.lexer.nextToken();
                token = this.lexer.token;
            }
            if (token.value == "m" || token.value == "M") {
                this.lexer.nextToken();
                return this.builder.buildConstant(v, "string"); // decimal
            }
            var n = isInteger ? parseInt(v) : parseFloat(v);
            return this.builder.buildConstant(n, "number");
        },
        parseGeographyLiteral: function () {
            if (this.lexer.token.value != "geography")
                return null;

            this.lexer.nextToken();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.STRING)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid geography format.", "parseGeographyLiteral");
            var g;
            try {
                g = $data.GeographyBase.parseFromString(token.value);
            } catch (e) {
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid geography format.", "parseGeographyLiteral");
            }

            this.lexer.nextToken();
            var typeName = Container.getTypeName(g);
            return this.builder.buildConstant(g, typeName.substring(typeName.lastIndexOf('.') + 1));
        },
        parseGeometryLiteral: function () {
            if (this.lexer.token.value != "geometry")
                return null;

            this.lexer.nextToken();
            var token = this.lexer.token;
            if (token.tokenType != TokenType.STRING)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid geometry format.", "parseGeometryLiteral");
            var g;
            try {
                g = $data.GeometryBase.parseFromString(token.value);
            } catch (e) {
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Invalid geometry format.", "parseGeometryLiteral");
            }

            this.lexer.nextToken();
            var typeName = Container.getTypeName(g);
            return this.builder.buildConstant(g, typeName.substring(typeName.lastIndexOf('.') + 1));
        },
        parseGeographyArg: function () {
            var exp = this.parseExpr();
            if (!exp)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: expression", "parseGeographyLiteral");
            else {
                if (exp instanceof $data.Expressions.UnaryExpression && exp.operand instanceof $data.Expressions.ConstantExpression && exp.operand.type === 'number') {
                    return this.builder.buildConstant(exp.operator.implementation(exp.operand.value), "number");
                } else if (exp instanceof $data.Expressions.ConstantExpression && exp.type === 'number') {
                    return exp;
                } else {
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected expression number", "parseGeographyLiteral");
                }
            }
        },

        parseSign: function () { // returns "+", "-" or null
            //bnf: Sign          : "+" | "-"
            var token = this.lexer.token;
            if (token.value != ASCII.PLUS && token.value != ASCII.MINUS)
                return null;
            this.lexer.nextToken();
            return token.value;
        },
        parseFunctionCall: function () {
            //bnf: FunctionCall       : FunctionName "(" [ Arguments ] ")";
            var fn = this.parseFunctionName();
            if (fn == null)
                return null;
            var token = this.lexer.token;
            if (token.value != ASCII.LPAREN)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected '('.", "parseFunctionCall");
            this.lexer.nextToken();
            token = this.lexer.token;
            var args;
            if (token.value != ASCII.RPAREN) {
                args = this.parseArguments();
                token = this.lexer.token;
            }
            if (token.value != ASCII.RPAREN)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected ')'.", "parseFunctionCall");
            this.lexer.nextToken();

            return this.builder.buildGlobalCall(fn.type, fn.name, args);
        },
        parseFunctionName: function () { //returns {name:, type:}
            //bnf: FunctionName       : "startswith" | "endswith" | ...;
            var token = this.lexer.token;
            var line = this.lexer.line;
            var column = this.lexer.column;
            var srcIndex = this.lexer.srcIndex;
            if (token.tokenType != TokenType.WORD)
                return;
            var name = token.value;
            for (var i = 0; i < this.reservedNs.length; i++) {
                if (this.reservedNs[i] == name) {

                    this.lexer.nextToken();
                    token = this.lexer.token;
                    if (token.tokenType != TokenType.CHAR)
                        $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected '.'.", "parseFunctionName");

                    this.lexer.nextToken();
                    token = this.lexer.token;
                    if (token.tokenType != TokenType.WORD)
                        return;
                    name = name + '.' + token.value;
                }
            }

            for (var i = 0; i < this.functionNames.length; i++) {
                if (this.functionNames[i] == name) {
                    this.lexer.nextToken();
                    if (this.lexer.token.value != ASCII.LPAREN){
                        this.lexer.token = token;
                        this.lexer.line = line;
                        this.lexer.column = column;
                        this.lexer.srcIndex = srcIndex;
                        return null;
                    }
                    return { name: name, type: this.functionTypes[i] };
                }
            }
            return null;
        },
        parseArguments: function () {
            //bnf: Arguments          : Argument | Arguments "," Argument;
            var args = [];
            while (true) {
                var expr = this.parseArgument();
                if (!expr)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: expression", "parseArguments");
                args.push(expr);
                if (this.lexer.token.value != ASCII.COMMA)
                    break;
                this.lexer.nextToken();
            }
            return args;
        },
        parseArgument: function () {
            //bnf: Argument           : Expr;
            return this.parseExpr();
        },
        parseMemberPath: function () {
            //bnf: MemberPath         : [ Namespace "/" ] *(NavigationProperty "/") Field
            //bnf: Namespace          : NAME *("." NAME)
            //bnf: NavigationProperty : NAME
            //bnf: Field              : NAME
            //short: MemberPath         : [ Name *("." Name) "/" ] *(Name "/") Name
            if (this.lexer.token.value == "not")
                return null;
            var name = this.parseName();
            var token = this.lexer.token;
            if (!name) {
                return null;
                //var msg = "Expected: member";
                //if (token.value == ASCII.DOT)
                //    msg += " or DIGIT";
                //msg += " before dot ('.').";
                //$data.oDataParser.RequestParser.SyntaxError.call(this, msg, "parseMemberPath");
            }
            var member = name;

            var hasDot = false;
            while (token.value == ASCII.DOT) {
                member += ".";
                hasDot = true;
                this.lexer.nextToken();
                name = this.parseName();
                token = this.lexer.token;
                if (!name)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: name after dot ('.').", "parseMemberPath");
                member += name;
            }
            var steps = [];
            if (!this.lambdaParameter.length || this.lambdaParameter[this.lambdaParameter.length - 1] != member) steps.push(member);

            var hasSlash = false;
            while (token.value == ASCII.SLASH) {
                member += "/";
                hasSlash = true;
                this.lexer.nextToken();
                name = this.parseName();
                token = this.lexer.token;
                if (!name)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: name.", "parseMemberPath");
                if (name == 'all' || name == 'any'){
                    var frame = { type: name == 'all' ? $data.Expressions.EveryExpression : $data.Expressions.SomeExpression, entitySet: steps[steps.length - 1] };
                    if (token.value != ASCII.LPAREN)
                        $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: left parenthesis.", "parseMemberPath");
                    token = this.lexer.nextToken();
                    if (token.value != ASCII.RPAREN){
                        frame.lambda = token.value;
                        token = this.lexer.nextToken();
                        if (token.value == ASCII.COLON){
                            this.lambdaParameter.push(frame.lambda);
                            this.lexer.nextToken();
                            frame.expression = this.parseExpr();
                            this.lambdaParameter.pop();
                        }else $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: colon (:) after lamba parameter.", "parseMemberPath");
                    }else token = this.lexer.nextToken();
                    this.lexer.nextToken();
                    steps.push(frame);
                    return this.builder.buildMemberPath(steps);
                }else if (name != '*'){
                    member += name;
                    steps.push(name);
                }
            }

            if (hasDot && !hasSlash)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: / after namespace.", "parseMemberPath");
            if (this.lexer.token.value != ASCII.LPAREN)
                return this.builder.buildMemberPath(steps, this.lambdaParameter[this.lambdaParameter.length - 1]);
            //-- parse instance method
            this.lexer.nextToken();
            if (this.lexer.token.value != ASCII.RPAREN)
                $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: right parenthesis: ')'.", "parseMemberPath");
            this.lexer.nextToken();
            return this.builder.buildMemberPath(steps, this.lambdaParameter[this.lambdaParameter.length - 1]);
        },
        parseName: function () {
            //bnf: Name               : (WORD | UNDERSCORE) *(WORD | UNDERSCORE | DIGIT)
            //HACK: this and getNextNamePart are not a clean parser function
            var token = this.lexer.token;
            if (token.tokenType != TokenType.WORD && token.value != ASCII.UNDERSCORE && token.value != ASCII.ASTERISK)
                return null;
            var name = token.toString() + this.getNextNamePart();
            this.lexer.nextToken();
            return name;
        },
        getNextNamePart: function () {
            var part = "";
            var c = this.lexer.currentChar;
            var ct = this.lexer.currentCharType;
            while (ct == CharType.DIGIT || ct == CharType.ALPHA || c == ASCII.UNDERSCORE) {
                part += String.fromCharCode(c);
                this.lexer.nextChar();
                c = this.lexer.currentChar;
                ct = this.lexer.currentCharType;
            }
            return part;
        },

        //=====================================================================================================================

        parseOrderBy: function () {
            //bnf: OrderByExpr:     Expr [ "asc" | "desc"] *( "," Expr [ "asc" | "desc"] )
            var expr = this.parseExpr();
            if (!expr)
                return null;
            var items = [];  // [{expr:expr, dir:"asc"}]
            var dir = "asc";
            var token = this.lexer.token;
            if (token.value == "asc" || token.value == "desc") {
                dir = token.value;
                this.lexer.nextToken();
                token = this.lexer.token;
            }
            items.push({ expr: expr, dir: dir });

            while (token.value == ASCII.COMMA) {
                this.lexer.nextToken();
                token = this.lexer.token;
                expr = this.parseExpr();
                if (!expr)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: expr", "parseOrderBy");
                dir = "asc";
                token = this.lexer.token;
                if (token.value == "asc" || token.value == "desc") {
                    dir = token.value;
                    this.lexer.nextToken();
                    token = this.lexer.token;
                }
                items.push({ expr: expr, dir: dir });
            }

            return this.builder.buildOrderBy(items);
        },

        //=====================================================================================================================

        parseExpand: function () {
            //bnf: OrderByExpr:     MemberPath *( "," MemberPath)
            var expr = this.parseMemberPath();
            if (!expr)
                return null;
            var items = [];
            var token = this.lexer.token;
            items.push(expr);

            while (token.value == ASCII.COMMA) {
                this.lexer.nextToken();
                token = this.lexer.token;
                expr = this.parseMemberPath();
                if (!expr)
                    $data.oDataParser.RequestParser.SyntaxError.call(this, "Expected: expr", "parseExpand");
                items.push(expr);
                token = this.lexer.token;
            }

            return items;
        }
    }, {
        SyntaxError: function (reason, caller) {
            var src = this.lexer.src;
            var token = this.lexer.token;
            var line = " Source:" + src.substr(0, token.column) + ">>>>" + src.substr(token.column, 1) + "<<<<" + src.substr(token.column + 1);
            var msg = "Syntax error at line " + token.line + ", char " + token.column + ". " + reason + line;
            if (caller)
                msg += ". Caller: " + caller;
            throw { message: msg, reason: reason, source: caller, line: token.line, column: token.column };
        }
    });
})();
