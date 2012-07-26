$(document).ready(function () {
	module("Current tests");
    test("Select: Name, Age, City", 1, function () {
        var req = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = req;
        req.select = "Name, Age, City";
        p.parseSelectExpr();
        var current = JSON.stringify(p.req.select);
        var expected = JSON.stringify([
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Name")
            ),
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("Age")
            ),
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("City")
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
                p.builder.buildConstant("Name")
            ),
            p.builder.buildSimpleBinary(
                p.builder.buildProperty(
                    p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                    p.builder.buildConstant("Age")
                ),
                p.builder.buildConstant(20),
                "add"
            ),
            p.builder.buildProperty(
                p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                p.builder.buildConstant("City")
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
                p.builder.buildConstant("Title")
            ),
            p.builder.buildGlobalCall("string", "concat", [
                p.builder.buildProperty(
                    p.builder.buildProperty(
                        p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                        p.builder.buildConstant("Author")
                    ),
                    p.builder.buildConstant("FirstName")
                ),
                p.builder.buildProperty(
                    p.builder.buildProperty(
                        p.builder.buildParameter("it", "unknown","lambdaParameterReference"),
                        p.builder.buildConstant("Author")
                    ),
                    p.builder.buildConstant("LastName")
                )]
            )
        ]);
        equal(current, expected);
    });
//TODO: more "select" tests

    /*
        test("Lambda syntax: Products/any()", 1, function () {
            var src = new $data.oDataParser.QueryRequest(); var p = new $data.oDataParser.RequestParser(); p.req = src;
            src.filter = "Products/any()";
            p.parseFilterExpr();
            var current = JSON.stringify(p.req.filter);
            var expected = JSON.stringify({member:["Products","any"]});
            equal(current, expected);
        });
        //test("Lambda syntax: Products/any(p1: p1/Category/Products/any(p: p/Name eq 'Chai'))", 1, function () { });
    */

});
