$(document).ready(function () {
	module("Current tests");

    test("Number: 42", 1, function () {
        var src = new ODataQueryRequest(); var p = new ODataRequestParser(); p.req = src;
        src.filter = "42";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(42, "number"));
        equal(current, expected);
    });
    test("Number: 142L", 1, function () {
        var src = new ODataQueryRequest(); var p = new ODataRequestParser(); p.req = src;
        src.filter = "142L";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(142, "number"));
        equal(current, expected);
    });
    test("Number: 42.56", 1, function () {
        var src = new ODataQueryRequest(); var p = new ODataRequestParser(); p.req = src;
        src.filter = "42.56";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(42.56, "number"));
        equal(current, expected);
    });
    test("Number: 42.56f", 1, function () {
        var src = new ODataQueryRequest(); var p = new ODataRequestParser(); p.req = src;
        src.filter = "42.56f";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(42.56, "number"));
        equal(current, expected);
    });
    test("Number: 42.56m", 1, function () {
        var src = new ODataQueryRequest(); var p = new ODataRequestParser(); p.req = src;
        src.filter = "42.56m";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(42.56, "number"));
        equal(current, expected);
    });
    test("Number: 0.456789e3m", 1, function () {
        var src = new ODataQueryRequest(); var p = new ODataRequestParser(); p.req = src;
        src.filter = "0.456789e3m";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify(p.builder.buildConstant(456.789, "number"));
        equal(current, expected);
    });

/*
    test("Lambda syntax: Products/any()", 1, function () {
        var src = new ODataQueryRequest(); var p = new ODataRequestParser(); p.req = src;
        src.filter = "Products/any()";
        p.parseFilterExpr();
        var current = JSON.stringify(p.req.filter);
        var expected = JSON.stringify({member:["Products","any"]});
        equal(current, expected);
    });
    //test("Lambda syntax: Products/any(p1: p1/Category/Products/any(p: p/Name eq 'Chai'))", 1, function () { });
*/

});
