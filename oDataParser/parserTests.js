$(document).ready(function () {
    module("ODataRequestParser tests");
    var ASCII = $data.oDataParser.ASCII;
    var CharType = $data.oDataParser.CharType;
    var TokenType = $data.oDataParser.TokenType;

    test("Filter: BoolLiteralExpr", 6, function () {
        var p = new $data.oDataParser.RequestParser();
        var src = new $data.oDataParser.QueryRequest();
        p.req = src;
        var f;
        src.filter = "true"; p.parseFilterExpr();f=p.req.filter;equal(f.nodeType,"constant");equal(f.type, $data.Boolean);equal(f.value,true);
        //src.filter = "1";    p.parseFilterExpr();f=p.req.filter;equal(f.nodeType,"constant");equal(f.type,"boolean");equal(f.value,true);
        src.filter = "false";p.parseFilterExpr();f=p.req.filter;equal(f.nodeType,"constant");equal(f.type,$data.Boolean);equal(f.value,false);
        //src.filter = "0";    p.parseFilterExpr();f=p.req.filter;equal(f.nodeType,"constant");equal(f.type,"boolean");equal(f.value,false);
    });
    test("Filter: 'true or false'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "true or false";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(true, "boolean"), //left
            p.builder.buildConstant(false, "boolean"), //right
            "or",//op
            "boolean"//type
        ));
        equal(current, expected);
    });
    test("Filter: 'true and false'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "true and false";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(true, "boolean"), //left
            p.builder.buildConstant(false, "boolean"), //right
            "and",//op
            "boolean"//type
        ));
        equal(current, expected);
    });
    test("Filter: String: 'Hello World'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "'Hello World'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant('Hello World', "string"));
        equal(current, expected);
    });
    test("Filter: String: ''", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "''";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant('', "string"));
        equal(current, expected);
    });
    test("Filter: String: 'John's stuff'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "'John''s stuff'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant("John's stuff", "string"));
        equal(current, expected);
    });
    test("Filter: String: 'John's stuff and it's complex'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "'John''s stuff and it''s complex'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant("John's stuff and it's complex", "string"));
        equal(current, expected);
    });
    test("Filter: String: John'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "'John'''";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant("John'", "string"));
        equal(current, expected);
    });
    test("Filter: String: 'John'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "'''John'''";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant("'John'", "string"));
        equal(current, expected);
    });
    test("Filter: Number: 42", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "42";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(42, "number"));
        equal(current, expected);
    });
    test("Filter: Number: 142L", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "142L";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant("142", "long"));
        equal(current, expected);
    });
    test("Filter: Number: 42.56", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "42.56";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(42.56, "number"));
        equal(current, expected);
    });
    test("Filter: Number: 42.56f", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "42.56f";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(42.56, "number"));
        equal(current, expected);
    });
    test("Filter: Number: 42.56m", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "42.56m";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(42.56, "decimal"));
        equal(current, expected);
    });
    test("Filter: Number: 0.456789e3", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "0.456789e3";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(456.789, "number"));
        equal(current, expected);
    });
    test("Filter: Number: 456789e-3", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "0456789e-3";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(456.789, "number"));
        equal(current, expected);
    });
    test("Filter: Datetime", 5, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "datetime'2012-07-15'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = p.builder.buildConstant(new Date("2012-07-15T00:00:00.000Z"), 'datetime'); //{nodeType:"constant",type:"datetime",value:"2012-07-15T00:00:00.000Z"};
        equal(current, JSON.stringify(expected));

        src.filter = "datetime'2012-07-15T18:25:45.123'";
        p.parseFilterExpr();
        current = JSON.stringify(p.req.filter);
        //expected.value = "2012-07-15T18:25:45.123Z";
        expected = p.builder.buildConstant(new Date("2012-07-15T18:25:45.123Z"), 'datetime');
        equal(current, JSON.stringify(expected));

        src.filter = "datetime'2012-07-15T18:25:45+02:00'";
        p.parseFilterExpr();
        current = JSON.stringify(p.req.filter);
        //expected.value = "2012-07-15T16:25:45.000Z";
        expected = p.builder.buildConstant(new Date("2012-07-15T16:25:45.000Z"), 'datetime');
        equal(current, JSON.stringify(expected));

        src.filter = "datetime'2012-07-15T18:25:45.123+02:00'";
        p.parseFilterExpr();
        current = JSON.stringify(p.req.filter);
        //expected.value = "2012-07-15T16:25:45.123Z";
        expected = p.builder.buildConstant(new Date("2012-07-15T16:25:45.123Z"), 'datetime');
        equal(current, JSON.stringify(expected));

        src.filter = "datetime'2012-07-15T18:25:45.123456789'";
        p.parseFilterExpr();
        current = JSON.stringify(p.req.filter);
        //expected.value = "2012-07-15T18:25:45.123Z";
        expected = p.builder.buildConstant(new Date("2012-07-15T18:25:45.123456789"), 'datetime');
        equal(current, JSON.stringify(expected));
    });
    test("Filter: Geography", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "geography'POINT(44.001 -33.123)'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = p.builder.buildConstant(new $data.GeographyPoint(44.001, -33.123), 'GeographyPoint');
        equal(current, JSON.stringify(expected));
    });
    test("Filter: Geometry", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "geometry'POINT(44.001 -33.123)'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = p.builder.buildConstant(new $data.GeometryPoint(44.001, -33.123), 'GeometryPoint');
        equal(current, JSON.stringify(expected));
    });
    test("Filter: '1 eq 2'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "1 eq 2";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(1, 'number'), //left
            p.builder.buildConstant(2, 'number'), //right
            "eq" //op
        ));
        equal(current, expected);
    });
    test("Filter: '1 ne 2'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "1 ne 2";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(1, 'number'), //left
            p.builder.buildConstant(2, 'number'), //right
            "ne" //op
        ));
        equal(current, expected);
    });
    test("Filter: '1 lt 2'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "1 lt 2";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(1, 'number'), //left
            p.builder.buildConstant(2, 'number'), //right
            "lt" //op
        ));
        equal(current, expected);
    });
    test("Filter: '1 gt 2'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "1 gt 2";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(1, 'number'), //left
            p.builder.buildConstant(2, 'number'), //right
            "gt" //op
        ));
        equal(current, expected);
    });
    test("Filter: '1 le 2'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "1 le 2";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(1, 'number'), //left
            p.builder.buildConstant(2, 'number'), //right
            "le" //op
        ));
        equal(current, expected);
    });
    test("Filter: '1 ge 2'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "1 ge 2";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(1, 'number'), //left
            p.builder.buildConstant(2, 'number'), //right
            "ge" //op
        ));
        equal(current, expected);
    });
    test("Filter: '1 add 2'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "1 add 2";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(1, 'number'), //left
            p.builder.buildConstant(2, 'number'), //right
            "add" //op
        ));
        equal(current, expected);
    });
    test("Filter: '42 sub 12'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "42 sub 12";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(42, 'number'), //left
            p.builder.buildConstant(12, 'number'), //right
            "sub" //op
        ));
        equal(current, expected);
    });
    test("Filter: '123.5 mul 9e2'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "123.5 mul 9e2";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(123.5, 'number'), //left
            p.builder.buildConstant(9e2, 'number'), //right
            "mul" //op
        ));
        equal(current, expected);
    });

    test("Filter: Unary '-9'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "-9";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildConstant(9, 'number'),
            "minus"));
        equal(current, expected);
    });
    test("Filter: Unary '--9'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "--9";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildUnary(
                p.builder.buildConstant(9, 'number'),
                "minus"),
            "minus"));
        equal(current, expected);
    });
    test("Filter: Unary '-IntVar'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "-IntVar";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("IntVar", 'string')
            ),
            "minus"));
        equal(current, expected);
    });
    test("Filter: Unary '--IntVar'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "--IntVar";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildUnary(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("IntVar", 'string')
                ),
                "minus"),
            "minus"));
        equal(current, expected);
    });
    test("Filter: Unary 'not true'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "not true";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildConstant(true, 'boolean'),
            "not"));
        equal(current, expected);
    });
    test("Filter: Unary 'not not true'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "not true";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildConstant(true, 'boolean'),
            "not"));
        equal(current, expected);
    });
    test("Filter: Unary 'not (true and not false)'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "not (true and not false)";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildSimpleBinary(
                p.builder.buildConstant(true, 'boolean'),
                p.builder.buildUnary(
                    p.builder.buildConstant(false, 'boolean'),
                    "not"
                ),
                "and"
            ),
            "not"));
        equal(current, expected);
    });
    test("Filter: Unary 'not BoolVar'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "not BoolVar";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("BoolVar", 'string')
            ),
            "not"));
        equal(current, expected);
    });
    test("Filter: Unary 'not not BoolVar'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "not not BoolVar";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildUnary(
            p.builder.buildUnary(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("BoolVar", 'string')
                ),
                "not"),
            "not"));
        equal(current, expected);
    });

    test("Filter: '123.4e-5 div -9.0'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "123.4e-5 div -9.0";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(123.4e-5, 'number'),
            p.builder.buildUnary(
                p.builder.buildConstant(9, 'number'),
                "minus"),
            "div"
        ));
        equal(current, expected);
    });
    test("Filter: '-123.456789e-53 mod 6'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "-123.456789e-53 mod 6";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildUnary(
                p.builder.buildConstant(123.456789e-53, 'number'),
                "minus"),
            p.builder.buildConstant(6, 'number'),
            "mod"
        ));
        equal(current, expected);
    });

    test("Filter: Long '12345L div 6'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "12345L div 6";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant("12345", 'long'), //left
            p.builder.buildConstant(6, 'number'), //right
            "div" //op
        ));
        equal(current, expected);
    });
    test("Filter: Single '12345f div 12.34f'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "12345f div 12.34f";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(12345, 'number'), //left
            p.builder.buildConstant(12.34, 'number'), //right
            "div" //op
        ));
        equal(current, expected);
    });
    test("Filter: Double '0.12e-4 div -0.12e-4'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "0.12e-4 div -0.12e-4";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(0.12e-4, 'number'),
            p.builder.buildUnary(
                p.builder.buildConstant(0.12e-4, 'number'),
                "minus"),
            "div"
        ));
        equal(current, expected);
    });
    test("Filter: Invalid Number: Age add 12.", 2, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        //            012345678901
        src.filter = "Age add 12.";
        var thrown = false;
        var col = -1;
        try {
            p.parseFilterExpr();
        }
        catch (e) {
            thrown = true;
            col = e.column;
        }
        equal(thrown, true, "Syntax error was not thrown.");
        equal(col, 11, "Column is "+col+", expected: 11");
    });
    test("Filter: Invalid Number: Age add .12", 2, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        //            012345678901
        src.filter = "Age add .12";
        var thrown = false;
        var col = -1;
        try {
            p.parseFilterExpr();
        }
        catch (e) {
            thrown = true;
            col = e.column;
        }
        equal(thrown, true, "Syntax error was not thrown.");
        equal(col, 8, "Column is "+col+", expected: 8");
    });
    test("Filter: 'aaa' eq 'aaa' and 'bbb' eq 'bbb'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "'aaa' eq 'aaa' and 'bbb' eq 'bbb'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildSimpleBinary(
                p.builder.buildConstant("aaa", 'string'), //left
                p.builder.buildConstant("aaa", 'string'), //right
                "eq"),
            p.builder.buildSimpleBinary(
                p.builder.buildConstant("bbb", 'string'), //left
                p.builder.buildConstant("bbb", 'string'), //right
                "eq"),
            "and"
        ));
        equal(current, expected);
    });
    test("Filter: 'aaa' ne 'aaa' or 'bbb' ne 'bbb'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "'aaa' ne 'aaa' or 'bbb' ne 'bbb'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildSimpleBinary(
                p.builder.buildConstant("aaa", 'string'), //left
                p.builder.buildConstant("aaa", 'string'), //right
                "ne"),
            p.builder.buildSimpleBinary(
                p.builder.buildConstant("bbb", 'string'), //left
                p.builder.buildConstant("bbb", 'string'), //right
                "ne"),
            "or"
        ));
        equal(current, expected);
    });
    test("Filter: Chain: 'aaa' ne 'aaa' or 'bbb' ne 'bbb' or 'ccc' ne 'ccc'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "'aaa' ne 'aaa' or 'bbb' ne 'bbb' or 'ccc' ne 'ccc'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildSimpleBinary(
                p.builder.buildConstant("aaa", 'string'), //left
                p.builder.buildConstant("aaa", 'string'), //right
                "ne"),
            p.builder.buildSimpleBinary(
                p.builder.buildSimpleBinary(
                    p.builder.buildConstant("bbb", 'string'), //left
                    p.builder.buildConstant("bbb", 'string'), //right
                    "ne"),
                p.builder.buildSimpleBinary(
                    p.builder.buildConstant("ccc", 'string'), //left
                    p.builder.buildConstant("ccc", 'string'), //right
                    "ne"),
                "or"),
            "or"
        ));
        equal(current, expected);
    });
    test("Filter: Precedence: true or true or true", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "true or true or true";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(true, 'boolean'),
            p.builder.buildSimpleBinary(
                p.builder.buildConstant(true, 'boolean'),
                p.builder.buildConstant(true, 'boolean'),
                "or"),
            "or"
        ));
        equal(current, expected);
    });
    test("Filter: Precedence: true or true and true", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "true or true and true";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildConstant(true, 'boolean'),
            p.builder.buildSimpleBinary(
                p.builder.buildConstant(true, 'boolean'),
                p.builder.buildConstant(true, 'boolean'),
                "and"),
            "or"
        ));
        equal(current, expected);
    });
    test("Filter: Precedence: true and true or true", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "true and true or true";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildSimpleBinary(
                p.builder.buildConstant(true, 'boolean'),
                p.builder.buildConstant(true, 'boolean'),
                "and"),
            p.builder.buildConstant(true, 'boolean'),
            "or"
        ));
        equal(current, expected);
    });
    test("Filter: Precedence: (true or true) and true", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "(true or true) and true";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildSimpleBinary(
                p.builder.buildConstant(true, 'boolean'),
                p.builder.buildConstant(true, 'boolean'),
                "or"),
            p.builder.buildConstant(true, 'boolean'),
            "and"
        ));
        equal(current, expected);
    });
    test("Filter: Call(a,b): ceiling, floor, round", 3, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "ceiling(12.3)";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = p.builder.buildGlobalCall(null, "ceiling", [
            p.builder.buildConstant(12.3, 'number')
        ]);
        equal(current, JSON.stringify(expected));

        src.filter = "floor(12.3)";p.parseFilterExpr();
        expected = p.builder.buildGlobalCall(null, "floor", [
            p.builder.buildConstant(12.3, 'number')
        ]);
        equal(JSON.stringify(p.req.filter), JSON.stringify(expected));

        src.filter = "round(12.3)";p.parseFilterExpr();
        expected = p.builder.buildGlobalCall(null, "round", [
            p.builder.buildConstant(12.3, 'number')
        ]);
        equal(JSON.stringify(p.req.filter), JSON.stringify(expected));
    });
    test("Filter: Call(a,b): substringof, startswith, endswith, concat, indexof", 5, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "substringof('vadalma', 'ada')";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = p.builder.buildGlobalCall(null, "substringof", [
            p.builder.buildConstant("vadalma", 'string'),
            p.builder.buildConstant("ada", 'string')
        ]);
        equal(current, JSON.stringify(expected));

        src.filter = "startswith('vadalma', 'ada')";p.parseFilterExpr();
        expected = p.builder.buildGlobalCall(null, "startswith", [
            p.builder.buildConstant("vadalma", 'string'),
            p.builder.buildConstant("ada", 'string')
        ]);
        equal(JSON.stringify(p.req.filter), JSON.stringify(expected));

        src.filter = "endswith('vadalma', 'ada')";p.parseFilterExpr();
        expected = p.builder.buildGlobalCall(null, "endswith", [
            p.builder.buildConstant("vadalma", 'string'),
            p.builder.buildConstant("ada", 'string')
        ]);
        equal(JSON.stringify(p.req.filter), JSON.stringify(expected));

        expected.type = "string";
        src.filter = "concat('vadalma', 'ada')";p.parseFilterExpr();
        expected = p.builder.buildGlobalCall(null, "concat", [
            p.builder.buildConstant("vadalma", 'string'),
            p.builder.buildConstant("ada", 'string')
        ]);
        equal(JSON.stringify(p.req.filter), JSON.stringify(expected));

        expected.type = "int";
        src.filter = "indexof('vadalma', 'ada')";p.parseFilterExpr();
        expected = p.builder.buildGlobalCall(null, "indexof", [
            p.builder.buildConstant("vadalma", 'string'),
            p.builder.buildConstant("ada", 'string')
        ]);
        equal(JSON.stringify(p.req.filter), JSON.stringify(expected));
    });

    test("Parser: Parsing names 'aaa'", 6, function () {
        var source = "aaa";
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req; req.filter = source; p.lexer = new $data.oDataParser.RequestLexer(p.req.filter);
        var name = p.parseName();
        equal(name, "aaa");
        equal(p.lexer.token.tokenType, TokenType.EOF);
        equal(p.lexer.token.value, ASCII.NULL);
        equal(p.lexer.currentChar, ASCII.NULL);
        equal(p.lexer.currentCharType, CharType.EOF);
        equal(p.lexer.srcIndex, 3);
    });
    test("Parser: Parsing names 'aaa '", 6, function () {
        var source = "aaa ";
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req; req.filter = source; p.lexer = new $data.oDataParser.RequestLexer(p.req.filter);
        var name = p.parseName();
        equal(name, "aaa");
        equal(p.lexer.token.tokenType, TokenType.EOF);
        equal(p.lexer.token.value, ASCII.NULL);
        equal(p.lexer.currentChar, ASCII.NULL);
        equal(p.lexer.currentCharType, CharType.EOF);
        equal(p.lexer.srcIndex, 4);
    });
    test("Parser: Parsing names 'aaa:'", 6, function () {
        var source = "aaa:";
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req; req.filter = source; p.lexer = new $data.oDataParser.RequestLexer(p.req.filter);
        var name = p.parseName();
        equal(name, "aaa");
        equal(p.lexer.token.tokenType, TokenType.CHAR);
        equal(p.lexer.token.value, ASCII.COLON);
        equal(p.lexer.currentChar, ASCII.NULL);
        equal(p.lexer.currentCharType, CharType.EOF);
        equal(p.lexer.srcIndex, 4);
    });
    test("Parser: Parsing names 'bbb a'", 12, function () {
        var source = "bbb a";
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req; req.filter = source; p.lexer = new $data.oDataParser.RequestLexer(p.req.filter);
        var name = p.parseName();
        equal(name, "bbb");                                    // 1
        equal(p.lexer.token.tokenType, TokenType.WORD); // 2
        equal(p.lexer.token.value, "a");                // 3
        equal(p.lexer.currentChar, ASCII.NULL);                // 4
        equal(p.lexer.currentCharType, CharType.EOF);          // 5
        equal(p.lexer.srcIndex, 5);                            // 6

        name = p.parseName();
        equal(name, "a");                                      // 7
        equal(p.lexer.token.tokenType, TokenType.EOF); // 8
        equal(p.lexer.token.value, ASCII.NULL);         // 9
        equal(p.lexer.currentChar, ASCII.NULL);                //10
        equal(p.lexer.currentCharType, CharType.EOF);          //11
        equal(p.lexer.srcIndex, 5);                            //12
    });
    test("Parser: Parsing names 'bbb a, z '", 18, function () {
        var source = "bbb a, z ";
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req; req.filter = source; p.lexer = new $data.oDataParser.RequestLexer(p.req.filter);
        var name = p.parseName();
        equal(name, "bbb");                                    // 1
        equal(p.lexer.token.tokenType, TokenType.WORD); // 2
        equal(p.lexer.token.value, "a");                // 3
        equal(p.lexer.currentChar, ASCII.COMMA);               // 4
        equal(p.lexer.currentCharType, CharType.CHAR);         // 5
        equal(p.lexer.srcIndex, 6);                            // 6

        name = p.parseName();
        equal(name, "a");                                      // 7
        equal(p.lexer.token.tokenType, TokenType.CHAR); // 8
        equal(p.lexer.token.value, ASCII.COMMA);        // 9
        equal(p.lexer.currentChar, ASCII.SPC);                 //10
        equal(p.lexer.currentCharType, CharType.WSP);          //11
        equal(p.lexer.srcIndex, 7);                            //12

        p.lexer.nextToken();

        name = p.parseName();
        equal(name, "z");                                      //13
        equal(p.lexer.token.tokenType, TokenType.EOF);  //14
        equal(p.lexer.token.value, ASCII.NULL);         //15
        equal(p.lexer.currentChar, ASCII.NULL);                //16
        equal(p.lexer.currentCharType, CharType.EOF);          //17
        equal(p.lexer.srcIndex, 9);                            //18
    });
    test("Parser: Parsing names 'aAa456z a:aa45a4a7'", 1, function () {
        var source = "aAa456z a:aa45a4a7";
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req; req.filter = source; p.lexer = new $data.oDataParser.RequestLexer(p.req.filter);
        var names = p.parseName() + "|";
        names += p.parseName() + "|";
        p.lexer.nextToken();
        names += p.parseName();
        equal(names, "aAa456z|a|aa45a4a7");
    });
    test("Parser: Parsing names 'aA_Aa___456z__ __a:_aa45a4a7_'", 1, function () {
        var source = "aA_Aa___456z__ __a _aa45a4a7_";
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req; req.filter = source; p.lexer = new $data.oDataParser.RequestLexer(p.req.filter);
        var name;
        var names="";
        var count = 0;
        while(name = p.parseName()) {
            names += name + "|";
            if(++count>50)
                break;
        }
        equal(names, "aA_Aa___456z__|__a|_aa45a4a7_|");
    });
    test("Filter: Member: Name eq 'John'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "Name eq 'John'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),
            p.builder.buildConstant("John", 'string'),
            "eq"
        ));
        equal(current, expected);
    });
    test("Filter: Member: Age add 12", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "Age add 12";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Age", 'string')
            ),
            p.builder.buildConstant(12, 'number'),
            "add"
        ));
        equal(current, expected);
    });
    test("Filter: Member: Name2_a34 eq 'John'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "Name2_a34 eq 'John'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name2_a34", 'string')
            ),
            p.builder.buildConstant("John", 'string'),
            "eq"
        ));
        equal(current, expected);
    });

    test("Filter: Member: Author/Name eq 'John'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "Author/Name eq 'John'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildSimpleBinary(
            p.builder.buildProperty(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("Author", 'string')
                ),
                p.builder.buildConstant("Name", 'string')
            ),
            p.builder.buildConstant("John", 'string'),
            "eq"
        ));
        equal(current, expected);
    });
    test("Filter: Invalid Member: Author.Name eq 'John'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "Author.Name eq 'John'";
        var thrown = false;
        try {
            p.parseFilterExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });
   test("Filter: Member: MainNamespace.SubNamespace/Author/Name eq 'John'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "MainNamespace.SubNamespace/Author/Name eq 'John'";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
       var expected = JSON.stringify(p.builder.buildSimpleBinary(
           p.builder.buildProperty(
               p.builder.buildProperty(
                   p.builder.buildProperty(
                       p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                       p.builder.buildConstant("MainNamespace.SubNamespace", 'string')
                   ),
                   p.builder.buildConstant("Author", 'string')
               ),
               p.builder.buildConstant("Name", 'string')
           ),
           p.builder.buildConstant("John", 'string'),
           "eq"
       ));
       equal(current, expected);
    });
    test("Filter: Invalid Member: MainNamespace.SubNamespace/Author.Name eq 'John'", 2, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        //            0         1         2         3         4
        //            012345678901234567890123456789012345678901234567
        src.filter = "MainNamespace.SubNamespace/Author.Name eq 'John'";
        var thrown = false;
        var col = -1;
        try {
            p.parseFilterExpr();
        }
        catch (e) {
            thrown = true;
            col = e.column;
        }
        equal(thrown, true, "Syntax error was not thrown.");
        equal(col, 33, "Column is "+col+", expected: 33");
    });
    test("Filter: Invalid sequence: Author Name eq 'John'", 3, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "Author Name eq 'John'";
        var thrown, err;
        try { p.parseFilterExpr(); } catch (e) { thrown = true; err = e; }
        equal(thrown, true, "Syntax error was not thrown.");
        equal(err.reason, "Unexpected WORD in $filter: 'Name'.", "Reason check");
        equal(err.column, 7, "Column is "+err.column+", expected: 11");
    });
    test("Filter: Invalid operator: Author/Name Eq 'John'", 3, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.filter = "Author/Name Eq 'John'";
        var thrown, err;
        try { p.parseFilterExpr(); } catch (e) { thrown = true; err = e; }
        equal(thrown, true, "Syntax error was not thrown.");
        equal(err.reason, "Unexpected WORD in $filter: 'Eq'.", "Reason check");
        equal(err.column, 12, "Column is "+err.column+", expected: 11");
    });

    //==================================================================================================

    test("Skip: '42'", 1, function () {
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req;
        req.skip = "42";
        p.parseSkipExpr();
        var current = JSON.stringify(p.req.skip);
        var expected = JSON.stringify(
            p.builder.buildConstant(42, 'number')
        );
        equal(current, expected);
    });
    test("Skip (invalid):  '-10'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.skip = "-10";
        var thrown = false;
        try {
            p.parseSkipExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });
    test("Skip (invalid): '10.'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.skip = "10.";
        var thrown = false;
        try {
            p.parseSkipExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });
    test("Skip (invalid): 'ten'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.skip = "ten";
        var thrown = false;
        try {
            p.parseSkipExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });
    test("Skip (invalid): '10 years'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.skip = "10 years";
        var thrown = false;
        try {
            p.parseSkipExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });
    test("Top: '42'", 1, function () {
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req;
        req.top = "42";
        p.parseTopExpr();
        var current = JSON.stringify(p.req.top);
        var expected = JSON.stringify(
            p.builder.buildConstant(42, 'number')
        );
        equal(current, expected);
    });
    test("Top (invalid):  '-10'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.top = "-10";
        var thrown = false;
        try {
            p.parseTopExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });
    test("Top (invalid): '10.'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.top = "10.";
        var thrown = false;
        try {
            p.parseTopExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });
    test("Top (invalid): 'ten'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.top = "ten";
        var thrown = false;
        try {
            p.parseTopExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });
    test("Top (invalid): '10 years'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
        src.top = "10 years";
        var thrown = false;
        try {
            p.parseTopExpr();
        }
        catch (e) {
            thrown = true;
        }
        equal(thrown, true, "Syntax error was not thrown.");
    });

    //==================================================================================================

    test("OrderBy: 'Name'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Name";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([{
            expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),
            nodeType:"OrderBy"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Author/Name'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Author/Name";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([{
            expression:p.builder.buildProperty(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("Author", 'string')
                ),
                p.builder.buildConstant("Name", 'string')
            ),
            nodeType:"OrderBy"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Name asc'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Name asc";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([{
            expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),
            nodeType:"OrderBy"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Author/Name asc'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Author/Name asc";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([{
            expression:p.builder.buildProperty(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("Author", 'string')
                ),
                p.builder.buildConstant("Name", 'string')
            ),
            nodeType:"OrderBy"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Name desc'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Name desc";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([{
            expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),
            nodeType:"OrderByDescending"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Author/Name desc'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Author/Name desc";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([{
            expression:p.builder.buildProperty(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("Author", 'string')
                ),
                p.builder.buildConstant("Name", 'string')
            ),
            nodeType:"OrderByDescending"}
        ]);
        equal(current, expected);
    });




    test("OrderBy: 'Name, Age'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Name, Age";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),nodeType:"OrderBy"},
            {expression:p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("Age", 'string')
            ),nodeType:"OrderBy"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Age, Name'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Age, Name";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Age", 'string')
            ),nodeType:"OrderBy"},
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),nodeType:"OrderBy"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Name, Age desc'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Name, Age desc";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),nodeType:"OrderBy"},
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Age", 'string')
            ),nodeType:"OrderByDescending"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Name desc, Age desc'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Name desc, Age desc";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),nodeType:"OrderByDescending"},
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Age", 'string')
            ),nodeType:"OrderByDescending"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Name desc, Age'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Name desc, Age";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),nodeType:"OrderByDescending"},
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Age", 'string')
            ),nodeType:"OrderBy"}
        ]);
        equal(current, expected);
    });
    test("OrderBy: 'Body, substring(Author/FirstName,1,2)'", 1, function () {
        var src = new $data.oDataParser.QueryRequest(); src.orderby = "Body, substring(Author/FirstName,1,2)";
        var p = new $data.oDataParser.RequestParser(); p.req = src; p.parseOrderByExpr(); var current = JSON.stringify(p.req.orderby);
        var expected = JSON.stringify([
            {expression:p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Body", 'string')
            ),nodeType:"OrderBy"},
            {expression:p.builder.buildGlobalCall("string", "substring", [
                p.builder.buildProperty(
                    p.builder.buildProperty(
                        p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                        p.builder.buildConstant("Author", 'string')
                    ),
                    p.builder.buildConstant("FirstName", 'string')
                ),
                p.builder.buildConstant(1, 'number'),
                p.builder.buildConstant(2, 'number')
            ]),nodeType:"OrderBy"}
        ]);
        equal(current, expected);
    });

    test("Select: Name, Age, City", 1, function () {
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req;
        req.select = "Name, Age, City";
        p.parseSelectExpr();
        var current = JSON.stringify(p.req.select);
        var expected = JSON.stringify([
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Age", 'string')
            ),
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("City", 'string')
            )
        ]);
        equal(current, expected);
    });
    test("Select: Name, Age add 20, City", 1, function () {
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req;
        req.select = "Name, Age add 20, City";
        p.parseSelectExpr();
        var current = JSON.stringify(p.req.select);
        var expected = JSON.stringify([
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name", 'string')
            ),
            p.builder.buildSimpleBinary(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("Age", 'string')
                ),
                p.builder.buildConstant(20, 'number'),
                "add"
            ),
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("City", 'string')
            )
        ]);
        equal(current, expected);
    });
    test("Select: Title, concat(Author/FirstName, Author/LastName)", 1, function () {
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req;
        req.select = "Title, concat(Author/FirstName, Author/LastName)";
        p.parseSelectExpr();
        var current = JSON.stringify(p.req.select);
        var expected = JSON.stringify([
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Title", 'string')
            ),
            p.builder.buildGlobalCall("string", "concat", [
                p.builder.buildProperty(
                    p.builder.buildProperty(
                        p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                        p.builder.buildConstant("Author", 'string')
                    ),
                    p.builder.buildConstant("FirstName", 'string')
                ),
                p.builder.buildProperty(
                    p.builder.buildProperty(
                        p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                        p.builder.buildConstant("Author", 'string')
                    ),
                    p.builder.buildConstant("LastName", 'string')
                )]
            )
        ]);
        equal(current, expected);
    });

    test("Expand: 'Tags,Author/Articles,Reviewer/Articles/Category'", 1, function () {
        var req = new $data.oDataParser.QueryRequest(); req.expand = "Tags,Author/Articles,Reviewer/Articles/Category";
        var p = new $data.oDataParser.RequestParser(); p.req = req; p.parseExpandExpr(); var current = JSON.stringify(p.req.expand);
        var expected = JSON.stringify([
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Tags", 'string')
            ),
            p.builder.buildProperty(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("Author", 'string')
                ),
                p.builder.buildConstant("Articles", 'string')
            ),
            p.builder.buildProperty(
                p.builder.buildProperty(
                    p.builder.buildProperty(
                        p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                        p.builder.buildConstant("Reviewer", 'string')
                    ),
                    p.builder.buildConstant("Articles", 'string')
                ),
                p.builder.buildConstant("Category", 'string')
            )
        ]);
        equal(current, expected);
    });

});

