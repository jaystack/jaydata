$(document).ready(function () {

    $data.NewsReaderContext = new $news.Types.NewsContext({ databaseName: "sqLiteCompilerTestDb", name: "sqLite", dbCreation: $data.storageProviders.sqLite.DbCreationType.DropTableIfChanged });
    $data.NewsReaderContext.onReady(function () {
        module("sqLiteCompilerTests");

        _resultToString = function (r) {
            var x = r.sqlText + " | " + JSON.stringify(r.params);
            return x;
        };

        //==================================================================================================== Accessing array items

        test("ArrayAccess: Vector", 5, function () {
            var x = { xvalue: ["Joe", "Jack", "Jim"] };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName != this.p1.xvalue[0] + this.p1.xvalue[1] + this.p1.xvalue[2] }, { p1: x });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName != ?) | [\"JoeJackJim\"]");

            var expectedObject = { op: "buildType", context: null, logicalType: $news.Types.User, tempObjectName: "User", propertyMapping: null };
            r.actions[0].context = null;
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "User" }, "copy type faild");

            expectedObject = { keys: ['Id'], mapping: { Id: "Id", LoginName: "LoginName", Email: "Email" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("ArrayAccess: Jagged", 1, function () {
            var x = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.Id > this.a[1][2]; }, { a: x });
            var r = q.toTraceString(); 0
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.Id > ?) | [6]");
        });
        test("ArrayAccess: Jagged2", 1, function () {
            //ok(false); return;
            var x = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.Id > this[1][2]; }, x);
            var r = q.toTraceString(); 0
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.Id > ?) | [6]");
        });

        //==================================================================================================== Validation

        test("Validation. Unknown member in 'where' causes exception", 4, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.UnknownMember == "test" }, {});
            var thrown = false;
            try {
                var r = q.toTraceString();
            } catch (e) {
                thrown = true;
                equal(e.name, "MemberNotFound");
                equal(e.message, "Unknown member UnknownMember on type User");
                deepEqual(e.data, undefined);
            }
            ok(thrown, "Exception was not thrown");
        });
        test("Validation. Unknown param in 'where' causes exception", 2, function () {
            var thrown = false;
            try {
                var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName == unknownParam }, { x: "Joe" });
                var r = q.toTraceString();
            } catch (e) {
                equal(e, "Global parameter unknownParam not found. For query parameters use 'this.field' notation", "Exception");
                thrown = true;
                //equal(e.name, "InvalidOperation", "Exception.name");
                //equal(e.message, "Unknown variable in 'where' operation. The variable isn't referenced in the parameter context and not a global variable: 'unknownParam'.", "Exception.message");
                //deepEqual(e.data, { operationName: "where", missingParameterName: "unknownParam" }, "Exception.data");
            }
            equal(thrown, true, "Exception throwing");
        });

        test("Validation: ?????????", 1, function () {
            var x = { value: "Joe" };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName == this.prm1.value; }, { prm1: x }); //one equal sign
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
        });
        //==================================================================================================== Naming

        test("Naming: Lamda name and paramobject name are same in the fn arglist", 5, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName == this.prm; }, { prm: "Joe" });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");

            var expectedObject = { op: "buildType", context: null, logicalType: $news.Types.User, tempObjectName: "User", propertyMapping: null };
            r.actions[0].context = null;
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "User" }, "copy type faild");

            expectedObject = { keys: ['Id'], mapping: { Id: "Id", LoginName: "LoginName", Email: "Email" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });

        //==================================================================================================== Side effect

        test("Naming: Lambda without return", 5, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { m.LoginName == this.prm; }, { prm: "Joe" });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");

            var expectedObject = { op: "buildType", context: null, logicalType: $news.Types.User, tempObjectName: "User", propertyMapping: null };
            r.actions[0].context = null;
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "User" }, "copy type faild");

            expectedObject = { keys: ['Id'], mapping: { Id: "Id", LoginName: "LoginName", Email: "Email" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });

        //==================================================================================================== WhereExp

        test("WhereExp: EntityProp_Eq_Literal", 1, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName == "Joe"; }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
        });
        test("WhereExp: EntityProp_Eq_Literal - string", 1, function () {
            var q = $data.NewsReaderContext.Users.where('function (m) { return m.LoginName == "Joe"; }', {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
        });
        test("WhereExp: EntityProp_Eq_Literal - string 2", 1, function () {
            var q = $data.NewsReaderContext.Users.where('it.LoginName == "Joe"', {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
        });
        test("WhereExp: Literal_Eq_EntityProp", 1, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return "Joe" == m.LoginName; }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (? = T0.LoginName) | [\"Joe\"]");
        });
        test("WhereExp: EntityProp_Eq_Param", 1, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName == this.prm1; }, { prm1: "Joe" });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
        });
        test("WhereExp: EntityProp_Eq_Param - string", 1, function () {
            var q = $data.NewsReaderContext.Users.where('function (m) { return m.LoginName == this.prm1; }', { prm1: "Joe" });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
        });
        test("WhereExp: EntityProp_Eq_Param - string2", 1, function () {
            var q = $data.NewsReaderContext.Users.where('it.LoginName == this.prm1', { prm1: "Joe" });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
        });
        test("WhereExp: EntityProp_Eq_ParamProp", 1, function () {
            var x = { value: "Joe" };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName == this.prm1.value; }, { prm1: x });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
        });

        //==================================================================================================== MethodCall

        test("MethodCall 'Contains' is compiled to 'LIKE'", 1, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.contains("test"); }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"%test%\"]");
        });
        test("MethodCall 'StartsWith' is compiled to 'LIKE'", 1, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.startsWith("test"); }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"test%\"]");
        });
        test("MethodCall 'EndsWith' is compiled to 'LIKE'", 1, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.endsWith("test"); }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"%test\"]");
        });
        test('MethodCall trim, rtrim, ltrim', 6, function () {
            start(6);
            var q = $data.NewsReaderContext.Tags.where(function (m) { return m.Title.trim() == this }, 'test');
            var r = q.toTraceString();
            equal(_resultToString(r), 'SELECT * FROM Tags T0 WHERE (trim(T0.Title) = ?) | ["test"]');
            q = $data.NewsReaderContext.Tags.where(function (m) { return m.Title.trim(this.chars) == this.str }, { str: 'test', chars: '.!? ' });
            r = q.toTraceString();
            equal(_resultToString(r), 'SELECT * FROM Tags T0 WHERE (trim(T0.Title , ?) = ?) | [".!? ","test"]');
            q = $data.NewsReaderContext.Tags.where(function (m) { return m.Title.ltrim() == this }, 'test');
            r = q.toTraceString();
            equal(_resultToString(r), 'SELECT * FROM Tags T0 WHERE (ltrim(T0.Title) = ?) | ["test"]');
            q = $data.NewsReaderContext.Tags.where(function (m) { return m.Title.ltrim(this.chars) == this.str }, { str: 'test', chars: '.!? ' });
            r = q.toTraceString();
            equal(_resultToString(r), 'SELECT * FROM Tags T0 WHERE (ltrim(T0.Title , ?) = ?) | [".!? ","test"]');
            q = $data.NewsReaderContext.Tags.where(function (m) { return m.Title.rtrim() == this }, 'test');
            r = q.toTraceString();
            equal(_resultToString(r), 'SELECT * FROM Tags T0 WHERE (rtrim(T0.Title) = ?) | ["test"]');
            q = $data.NewsReaderContext.Tags.where(function (m) { return m.Title.rtrim(this.chars) == this.str }, { str: 'test', chars: '.!? ' });
            r = q.toTraceString();
            equal(_resultToString(r), 'SELECT * FROM Tags T0 WHERE (rtrim(T0.Title , ?) = ?) | [".!? ","test"]');            
        });
        test("MethodCall: Contains_ParamProp", 1, function () {
            var x = { value: "test" };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.contains(this.prm.value) }, { prm: x });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"%test%\"]");
        });
        test("MethodCall: Contains_ParamMethod", 5, function () {
            var x = { dup: function (s, c) { var x = ''; for (var i = 0; i < c; i++) x = x + s; return x; } };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.contains(this.prm.dup("ab_", 3)) }, { prm: x });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"%ab_ab_ab_%\"]");

            var expectedObject = { op: "buildType", context: null, logicalType: $news.Types.User, tempObjectName: "User", propertyMapping: null };
            r.actions[0].context = null;
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "User" }, "copy type faild");

            expectedObject = { keys: ['Id'], mapping: { Id: "Id", LoginName: "LoginName", Email: "Email" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("MethodCall: StartsWith_ParamProp", 1, function () {
            var x = { value: "test" };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.startsWith(this.prm.value) }, { prm: x });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"test%\"]");
        });
        test("MethodCall: StartsWith_ParamMethod", 1, function () {
            var x = { dup: function (s, c) { var x = ''; for (var i = 0; i < c; i++) x = x + s; return x; } };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.startsWith(this.prm.dup("ab_", 3)) }, { prm: x });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"ab_ab_ab_%\"]");
        });
        test("MethodCall: EndsWith_ParamProp", 1, function () {
            var x = { value: "test" };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.endsWith(this.prm.value) }, { prm: x });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"%test\"]");
        });
        test("MethodCall: EndsWith_ParamMethod", 5, function () {
            var x = { dup: function (s, c) { var x = ''; for (var i = 0; i < c; i++) x = x + s; return x; } };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName.endsWith(this.prm.dup("ab_", 3)) }, { prm: x });
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE like(? , T0.LoginName) | [\"%ab_ab_ab_\"]");

            var expectedObject = { op: "buildType", context: null, logicalType: $news.Types.User, tempObjectName: "User", propertyMapping: null };
            r.actions[0].context = null;
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "User" }, "copy type faild");

            expectedObject = { keys: ['Id'], mapping: { Id: "Id", LoginName: "LoginName", Email: "Email" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });

        //==================================================================================================== Expressions

        test("Expressions: EntityProp_Eq_Binary", 1, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName == "asdf" + "qwer" }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"asdfqwer\"]");
        });
        test("Expressions: EntityProp_Eq_Substr", 1, function () {
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName == "asdfqwer".substr(2, 4) }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"dfqw\"]");
        });

        test("Expressions: Equality operators", 6, function () {
            equal(_resultToString($data.NewsReaderContext.Users.where(function (m) { return m.LoginName == "Joe" }, {}).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) | [\"Joe\"]");
            equal(_resultToString($data.NewsReaderContext.Users.where(function (m) { return m.LoginName != "Joe" }, {}).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName != ?) | [\"Joe\"]");
            equal(_resultToString($data.NewsReaderContext.Users.where(function (m) { return m.LoginName < "Joe" }, {}).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName < ?) | [\"Joe\"]");
            equal(_resultToString($data.NewsReaderContext.Users.where(function (m) { return m.LoginName > "Joe" }, {}).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName > ?) | [\"Joe\"]");
            equal(_resultToString($data.NewsReaderContext.Users.where(function (m) { return m.LoginName <= "Joe" }, {}).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName <= ?) | [\"Joe\"]");
            equal(_resultToString($data.NewsReaderContext.Users.where(function (m) { return m.LoginName >= "Joe" }, {}).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName >= ?) | [\"Joe\"]");
        });

        //==================================================================================================== Boolean expressions

        test("Expressions (bool): EntityProp Eq True", 5, function () {
            var q = $data.NewsReaderContext.TestTable.where(function (m) { return m.b0 == true }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM TestTable T0 WHERE (T0.b0 = ?) | [1]");

            var expectedObject = { op: "buildType", context: null, logicalType: $news.Types.TestItem, tempObjectName: "TestItem", propertyMapping: null };
            r.actions[0].context = null;
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "TestItem" }, "copy type faild");

            expectedObject = { keys: ['Id'], mapping: { Id: "Id", i0: "i0", b0: "b0", s0: "s0", blob: "blob", n0: "n0", d0: "d0" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("Expressions (bool): EntityProp Eq False", 1, function () {
            var q = $data.NewsReaderContext.TestTable.where(function (m) { return m.b0 == false }, {});
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM TestTable T0 WHERE (T0.b0 = ?) | [0]");
        });
        //        test("Expressions (bool): EntityProp is true", 1, function () {
        //            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.b0 }, {}).toTraceString()),
        //                "SELECT * FROM TestTable T0 WHERE T0.b0 = ? | [1]");
        //        });
        //        test("Expressions (bool): EntityProp is false", 1, function () {
        //            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return !m.b0 }, {}).toTraceString()),
        //                "SELECT * FROM TestTable T0 WHERE T0.b0 = ? | [0]");
        //        });

        test("Expressions (int): ExplicitlyPositiveNumber", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == +4 }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [4]");
        });
        test("Expressions (int): NegativeNumber", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == -4 }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [-4]");
        });
        test("Expressions (int): NumberAddNumber", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == 12 + 4 }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [16]");
        });
        test("Expressions (int): NumberMinusNumber", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == 12 - 4 }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [8]");
        });
        test("Expressions (int): NumberAddVar", 1, function () {
            var a = 2;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == 3 + this.x }, { x: a }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [5]");
        });
        test("Expressions (int): NumberMinusVar", 1, function () {
            var b = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == 3 - this.b }, { b: b }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [-2]");
        });
        test("Expressions (int): NegativeNumberMinusVar", 1, function () {
            var b = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == -3 - this.b }, { b: b }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [-8]");
        });
        test("Expressions (int): NegativeNumberMulNumber", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == -3 * 3 }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [-9]");
        });
        test("Expressions (int): NegativeNumberMulNegativeNumber", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == -3 * -3 }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [9]");
        });
        test("Expressions (int): NegativeNumberDivNumber", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == -6 / 3 }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [-2]");
        });
        test("Expressions (int): NegativeNumberDivNegativeNumber", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == -6 / -3 }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [2]");
        });
        test("Expressions (int): ComplexArithmetic1", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == 2 * ((12 + 4) / 8) + 1; }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [5]");
        });
        test("Expressions (int): ComplexArithmetic2", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == 2 * ((12 - 4) / 8) - 1; }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [1]");
        });
        test("Expressions (int): ComplexArithmetic3", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == -2 * ((-12 + 4) / 8) - 1; }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [1]");
        });
        test("Expressions (int): ComplexArithmetic4", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == -2 * ((-12 + 4) / 8) - 1; }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [1]");
        });
        test("Expressions (int): MathArithmetic without p", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == Math.sqrt(2 * ((12 + 4) / 8) + 5); }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [3]");
        });
        test("Expressions (int): MathArithmetic", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == this.Math.sqrt(2 * ((12 + 4) / 8) + 5); }, { Math: Math }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [3]");
        });
        test("Expressions (int): MathConstant", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == this.Math.PI; }, { Math: Math }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [" + Math.PI + "]");
        });
        test("Expressions (int): VarModuloVar", 1, function () {
            var x = 14;
            var m = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == this.x % this.m; }, { x: x, m: m }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [4]");
        });
        test("Expressions (int): IncrementedVariable", 1, function () {
            var x = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == ++this.x; }, { x: x }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [6]");
        });
        test("Expressions (int): DecrementedVariable", 1, function () {
            var x = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == --this.x; }, { x: x }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [4]");
        });
        test("Expressions (int): VariableAndIncrement", 1, function () {
            var x = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == this.x++; }, { x: x }).toTraceString()),
        "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [5]");
            //equal(x, 6); //TODO: doesn't work. Doesn't goal?
        });
        test("Expressions (int): VariableAndDecrement", 1, function () {
            var x = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == this.x--; }, { x: x }).toTraceString()),
        "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [5]");
            //equal(x, 4); //TODO: doesn't work. Doesn't goal?
        });

        test("MethodCall: ChainCall", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == this.math.PI.toString().substr(0, 6); }, { math: Math }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [\"" + Math.PI.toString().substr(0, 6) + "\"]");
        });
        test("MethodCall (global func): parseInt literal", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == parseInt("12"); }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [12]");
        });
        test("MethodCall (global func): parseInt variable", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == parseInt("12"); }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = ?) | [12]");
        });
        //    test("Decision: Eq", 1, function () {
        //        equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == (1 == 2 ? 2 : 3); }).toTraceString()),
        //"SELECT * FROM TestTable T0 WHERE T0.i0 = ? | [3]");
        //    });
        //    test("Decision: Neq", 1, function () {
        //        equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == (1 != 2 ? 2 : 3); }).toTraceString()),
        //"SELECT * FROM TestTable T0 WHERE T0.i0 = ? | [2]");
        //    });

        //==================================================================================================== Logical

        test("Logical: LogicalOrTrue", 1, function () {
            var x = 9;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.b0 == (this.x <= 2 || this.x >= 6); }, { x: x }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.b0 = ?) | [1]");
        });
        test("Logical: LogicalOrFalse", 1, function () {
            var x = 4;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.b0 == (this.x <= 2 || this.x >= 6); }, { x: x }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.b0 = ?) | [0]");
        });
        test("Logical: LogicalAndTrue", 1, function () {
            var x = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.b0 == (this.x >= 2 && this.x <= 6); }, { x: x }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.b0 = ?) | [1]");
        });
        test("Logical: LogicalAndFalse", 1, function () {
            var x = 9;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.b0 == (this.x >= 2 && this.x <= 6); }, { x: x }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.b0 = ?) | [0]");
        });
        test("Logical: LogicalNotTrue", 1, function () {
            var x = 0;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.b0 == (!this.x); }, { x: x }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.b0 = ?) | [1]");
        });
        test("Logical: LogicalNotFalse", 1, function () {
            var x = 5;
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.b0 == (!this.x); }, { x: x }).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.b0 = ?) | [0]");
        });

        //==================================================================================================== Multiproperty

        test("Multiproperty: EntProp_Eq_EntProp", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 == m.Id; }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (T0.i0 = T0.Id) | []");
        });
        test("Multiproperty: 3 property 3 literal", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 > 11 && m.Id < 19 && m.Id != 16; }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (((T0.i0 > ?) AND (T0.Id < ?)) AND (T0.Id != ?)) | [11,19,16]");
        });
        test("Multiproperty: 5 property 5 literal", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return m.i0 > 11 && m.i0 < 30 && m.i0 != 16 && m.Id != 18 && m.Id != 20; }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (((((T0.i0 > ?) AND (T0.i0 < ?)) AND (T0.i0 != ?)) AND (T0.Id != ?)) AND (T0.Id != ?)) | [11,30,16,18,20]");
        });
        test("Multiproperty: 5 property 5 literal", 1, function () {
            equal(_resultToString($data.NewsReaderContext.TestTable.where(function (m) { return (m.i0 == m.Id || m.i0 == 16) && m.i0 > m.Id + 12; }, {}).toTraceString()),
    "SELECT * FROM TestTable T0 WHERE (((T0.i0 = T0.Id) OR (T0.i0 = ?)) AND (T0.i0 > (T0.Id + ?))) | [16,12]");
        });

        //==================================================================================================== Take

        test("Take: literal", 5, function () {
            var x = { value: "Joe" };
            var q = $data.NewsReaderContext.Users.where(function (m) { return m.LoginName != this.prm.value; }, { prm: x }).take(4);
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 WHERE (T0.LoginName != ?) LIMIT ? | [\"Joe\",4]");

            var expectedObject = { op: "buildType", context: null, logicalType: $news.Types.User, tempObjectName: "User", propertyMapping: null };
            r.actions[0].context = null;
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "User" }, "copy type faild");

            expectedObject = { keys: ['Id'], mapping: { Id: "Id", LoginName: "LoginName", Email: "Email" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("Take: parameter", 1, function () {
            var x = { value: "Joe", top: 3 };
            equal(_resultToString($data.NewsReaderContext.Users.where(function (m) { return m.LoginName != this.prm.value; }, { prm: x }).take(x.top).toTraceString()),
                    "SELECT * FROM Users T0 WHERE (T0.LoginName != ?) LIMIT ? | [\"Joe\",3]");
        });
        test("Take: wrong literal value", 1, function () {
            var x = { value: "Joe" };
            try {
                var r = $data.NewsReaderContext.Users
    .where(function (m) { return m.LoginName != this.value; }, { prm: x })
    .take("42").toTraceString();
                console.log(r);
            } catch (e) {
                var thrown = true;
                //equal(e.name, "TypeError", "Exception name");
                //equal(e.message, "Object #<Object> has no method 'undefined'", "Exception message");
            }
            equal(thrown, true);
        });
        test("Take: wrong parameter value", 1, function () {
            var x = { value: "Joe", top: "42" };
            try {
                var r = $data.NewsReaderContext.Users
    .where(function (m) { return m.LoginName != this.value; }, { prm: x })
    .take(x.top).toTraceString();
            } catch (e) {
                var thrown = true;
                //equal(e.name, "TypeError", "Exception name");
                //equal(e.message, "Object #<Object> has no method 'undefined'", "Exception message");
            }
            equal(thrown, true);
        });

        //==================================================================================================== Skip

        test("Skip: literal", 1, function () {
            var x = { value: "Joe" };
            equal(_resultToString($data.NewsReaderContext.Users
    .where(function (m) { return m.LoginName != this.prm.value; }, { prm: x })
    .skip(20).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName != ?) OFFSET ? | [\"Joe\",20]");
        });
        test("Skip: parameter", 1, function () {
            var x = { value: "Joe", skip: 10 };
            equal(_resultToString($data.NewsReaderContext.Users
    .where(function (m) { return m.LoginName != this.prm.value; }, { prm: x })
    .skip(x.skip).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName != ?) OFFSET ? | [\"Joe\",10]");
        });
        test("Skip: wrong literal value", 1, function () {
            var x = { value: "Joe" };
            try {
                var r = $data.NewsReaderContext.Users
                            .where(function (m) { return m.LoginName != this.value; }, { prm: x })
                            .skip("42").toTraceString();
                console.dir(r);
            } catch (e) {
                var thrown = true;
                //equal(e.name, "TypeError", "Exception name");
                //equal(e.message, "Object #<Object> has no method 'undefined'", "Exception message");
            }
            equal(thrown, true);
        });
        test("Skip: wrong parameter value", 1, function () {
            var x = { value: "Joe", top: "42" };
            try {
                var r = $data.NewsReaderContext.Users
    .where(function (m) { return m.LoginName != this.value; }, { prm: x })
    .skip(x.top).toTraceString();
            } catch (e) {
                var thrown = true;
                //equal(e.name, "TypeError", "Exception name");
                //equal(e.message, "Object #<Object> has no method 'undefined'", "Exception message");
            }
            equal(thrown, true);
        });

        //==================================================================================================== where-take-skip

        test("Full query: where-take-skip", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users
    .where(function (m) { return m.LoginName == 'Joe'; }, {})
    .take(10).skip(20).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) LIMIT ? OFFSET ? | [\"Joe\",10,20]");
        });
        test("Full query: where-skip-take", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users
    .where(function (m) { return m.LoginName == 'Joe'; }, {})
    .skip(20).take(10).toTraceString()),
    "SELECT * FROM Users T0 WHERE (T0.LoginName = ?) LIMIT ? OFFSET ? | [\"Joe\",10,20]");
        });

        //==================================================================================================== Ordering

        test("Ordering: one field asc", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users.orderBy(function (m) { return m.LoginName; }).toTraceString()), "SELECT * FROM Users T0 ORDER BY T0.LoginName ASC | []");
        });
        test("Ordering: one field asc - string", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users.orderBy("it.LoginName").toTraceString()), "SELECT * FROM Users T0 ORDER BY T0.LoginName ASC | []");
        });
        test("Ordering: one field asc - string with space", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users.orderBy("it.LoginName").toTraceString()), "SELECT * FROM Users T0 ORDER BY T0.LoginName ASC | []");
        });
        test("Ordering: asc asc", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users
                .orderBy(function (m) { return m.LoginName })
                .orderBy(function (m) { return m.LoginName }).toTraceString()),
                "SELECT * FROM Users T0 ORDER BY T0.LoginName ASC, T0.LoginName ASC | []");
        });
        test("Ordering: asc asc asc", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users
    .orderBy(function (m) { return m.Id })
    .orderBy(function (m) { return m.LoginName })
    .orderBy(function (m) { return m.LoginName }).toTraceString()),
    "SELECT * FROM Users T0 ORDER BY T0.Id ASC, T0.LoginName ASC, T0.LoginName ASC | []");
        });
        test("Ordering: asc desc", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users
    .orderBy(function (m) { return m.LoginName })
    .orderByDescending(function (m) { return m.LoginName }).toTraceString()),
    "SELECT * FROM Users T0 ORDER BY T0.LoginName ASC, T0.LoginName DESC | []");
        });
        test("Ordering: desc desc", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users
    .orderByDescending(function (m) { return m.LoginName })
    .orderByDescending(function (m) { return m.LoginName }).toTraceString()),
    "SELECT * FROM Users T0 ORDER BY T0.LoginName DESC, T0.LoginName DESC | []");
        });
        test("Ordering: desc desc reverse", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Users
    .orderByDescending(function (m) { return m.LoginName })
    .orderByDescending(function (m) { return m.LoginName }).toTraceString()),
    "SELECT * FROM Users T0 ORDER BY T0.LoginName DESC, T0.LoginName DESC | []");
        });

        //==================================================================================================== Projection

        test("Projection: no projection", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.toTraceString()), "SELECT * FROM Articles T0 | []");
        });
        test("Projection: scalar", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.select(function (m) { return m.Id; }).toTraceString()), "SELECT T0.rowid AS rowid$$, T0.Id AS d FROM Articles T0 | []");
        });
        test("Projection: scalar expression", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.select(function (m) { return m.Id * 2 + 5; }).toTraceString()), "SELECT T0.rowid AS rowid$$, ((T0.Id * ?) + ?) AS d FROM Articles T0 | [2,5]");
        });
        test("Projection: scalar deep expression", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.select(function (m) { return m.Id * 2 / 3 + 5 * 3; }).toTraceString()), "SELECT T0.rowid AS rowid$$, (((T0.Id * ?) / ?) + ?) AS d FROM Articles T0 | [2,3,15]");
        });
        test("Projection: where & project scalar expression", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.where(function (m) { return m.Id < 5; }).select(function (q) { return q.Id - 1; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, (T0.Id - ?) AS d FROM Articles T0 WHERE (T0.Id < ?) | [1,5]");
        });
        test("Projection: scalar expression with params", 1, function () {
            var x = { a: 2, b: 5 };
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return m.Id * this.r.a + this.r.b; }, { r: x }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, ((T0.Id * ?) + ?) AS d FROM Articles T0 | [2,5]");
        });
        test("Projection: new object", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return { id: m.Id, title: m.Title }; }, {})
                .toTraceString()),
                "SELECT T0.rowid AS rowid$$, T0.Id AS id, T0.Title AS title FROM Articles T0 | []");
        });
        test("Projection: new object expression", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return { id: m.Id * 2 + 5, title: m.Title }; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, ((T0.Id * ?) + ?) AS id, T0.Title AS title FROM Articles T0 | [2,5]");
        });
        test("Projection: new object deep expression", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return { id: m.Id * 2 / 3 + 5 * 3, title: m.Title }; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, (((T0.Id * ?) / ?) + ?) AS id, T0.Title AS title FROM Articles T0 | [2,3,15]");
        });

        //==================================================================================================== SQL Parameters

        //test("SQLParameter: ParamOrder", 2, function () {
        //    var prm = { x: "Joe", y: 42, z: "asdf" };
        //    var q1 = $data.NewsReaderContext.Users
        //        .where(function (m) { return m.LoginName != this.x }, prm)
        //        .skip(100)
        //        .take(10)
        //        .select(function (m) { return { id: m.Id + this.y, kind: this.z }; }, prm);
        //    var r1 = q1.toTraceString();
        //    equal(_resultToString(r1), "SELECT T0.Id + ? AS id, ? AS kind FROM Users T0 WHERE T0.LoginName != ? LIMIT ? OFFSET ? | [42,\"asdf\",\"Joe\",10,100]");
        //    var q2 = $data.NewsReaderContext.Users
        //        .select(function (m) { return { id: m.Id + this.y, kind: this.z }; }, prm)
        //        .take(10)
        //        .where(function (m) { return m.LoginName != this.x }, prm)
        //        .skip(100);
        //    var r2 = q2.toTraceString();
        //    equal(_resultToString(r2), _resultToString(r1));
        //});

        //==================================================================================================== Where Expression With Navigation
        test("WhereExp: filter one_many navProp", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.where(function (m) { return m.Category.Id == 1; }).toTraceString()),
                "SELECT T0.Id, T0.Title, T0.Lead, T0.Body, T0.CreateDate, T0.Thumbnail_LowRes, T0.Thumbnail_HighRes, T0.Category__Id, T0.Author__Id, T0.Reviewer__Id FROM Articles T0 \n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) WHERE (T1.Id = ?) | [1]");
        });
        test("WhereExp: filter one_many navProp_same_deep", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.where(function (m) { return m.Author.Profile.Bio == "Test" && m.Author.Profile.FullName == "Joe"; }).toTraceString()),
                "SELECT T0.Id, T0.Title, T0.Lead, T0.Body, T0.CreateDate, T0.Thumbnail_LowRes, T0.Thumbnail_HighRes, T0.Category__Id, T0.Author__Id, T0.Reviewer__Id FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) "
                        + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) WHERE ((T2.Bio = ?) AND (T2.FullName = ?)) | [\"Test\",\"Joe\"]");
        });
        test("WhereExp: filter one_many navProp_variant_deep", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.where(function (m) { return m.Author.Profile.Bio == "Test" && m.Reviewer.Profile.FullName == "Joe"; }).toTraceString()),
                "SELECT T0.Id, T0.Title, T0.Lead, T0.Body, T0.CreateDate, T0.Thumbnail_LowRes, T0.Thumbnail_HighRes, T0.Category__Id, T0.Author__Id, T0.Reviewer__Id FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) "
                        + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) "
                        + "\n\tLEFT OUTER JOIN Users T3 ON (T0.Reviewer__Id = T3.Id) "
                        + "\n\tLEFT OUTER JOIN UserProfiles T4 ON (T3.Id = T4.User__Id) WHERE ((T2.Bio = ?) AND (T4.FullName = ?)) | [\"Test\",\"Joe\"]");
        });

        //==================================================================================================== Where Expression With Navigation

        test("Projection: scalar use association", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return m.Category.Title; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, T1.Title AS d FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) | []");
        });
        test("Projection: scalar expression use association", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.select(function (m) { return m.Category.Id * 2 + 5; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, ((T1.Id * ?) + ?) AS d FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) | [2,5]");
        });
        test("Projection: scalar expression use association, function call", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.select(function (m) { return m.Category.Title.toLowerCase(); }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, lower(T1.Title) AS d FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) | []");
        });
        test("Projection: where & project scalar expression use same association", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.where(function (m) { return m.Category.Id < 5; }).select(function (q) { return q.Category.Id - 1; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, (T1.Id - ?) AS d FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) WHERE (T1.Id < ?) | [1,5]");
        });
        test("Projection: where & project scalar expression use association only select", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.where(function (m) { return m.Id > 5; }).select(function (q) { return q.Category.Id - 1; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, (T1.Id - ?) AS d FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) WHERE (T0.Id > ?) | [1,5]");
        });
        test("Projection: where & project scalar expression use different association", 1, function () {
            equal(_resultToString($data.NewsReaderContext.Articles.where(function (m) { return m.Category.Id > 5; }).select(function (q) { return 'Mr. ' + q.Author.LoginName; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, (? + T2.LoginName) AS d FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) "
                        + "\n\tLEFT OUTER JOIN Users T2 ON (T0.Author__Id = T2.Id) WHERE (T1.Id > ?) | [\"Mr. \",5]");
        });
        test("Projection: new object use association (scalarField)", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return { id: m.Id, title: m.Title, category: m.Category.Title }; }, {})
                .toTraceString()),
                "SELECT T0.rowid AS rowid$$, T0.Id AS id, T0.Title AS title, T1.Title AS category FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) | []");
        });
        test("Projection: new object use association (complex field)", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return { id: m.Id, title: m.Title, cat: m.Category }; }, {})
                .toTraceString()),
                "SELECT T0.rowid AS rowid$$, T0.Id AS id, T0.Title AS title, T1.Id AS cat__Id, T1.Title AS cat__Title FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) | []");
        });
        test("Projection: new object use association (2 anonymous and complex field)", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return { id: m.Id, title: m.Title, auth: { name: m.Author.LoginName, prof: m.Author.Profile } }; }, {})
                .toTraceString()),
                "SELECT T0.rowid AS rowid$$, T0.Id AS id, T0.Title AS title, "
                        + "T0.rowid AS auth__rowid$$, T1.LoginName AS auth__name, "
                        + "T2.Id AS auth__prof__Id, T2.FullName AS auth__prof__FullName, T2.Bio AS auth__prof__Bio, T2.Avatar AS auth__prof__Avatar, T2.Birthday AS auth__prof__Birthday, "
                        + "T2.User__Id AS auth__prof__User__Id, "
                        + "T2.Location__Address AS auth__prof__Location__Address, T2.Location__City AS auth__prof__Location__City, T2.Location__Zip AS auth__prof__Location__Zip, T2.Location__Country AS auth__prof__Location__Country FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) "
                        + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) | []");
        });
        test("Projection: complett entity", 1, function () {
            equal(_resultToString(
                $data.NewsReaderContext.Articles.select(function (m) { return m.Category; }).toTraceString()),
                "SELECT T0.rowid AS rowid$$, T1.Id AS Id, T1.Title AS Title FROM Articles T0 "
                        + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) | []");
        });
        //test("Include: full table with include", 1, function () {
        //    equal(_resultToString(
        //        $data.NewsReaderContext.Articles.include("Category").toTraceString()),
        //        "SELECT **** FROM Articles T0 "
        //                + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) | []");
        //});
        //test("Include: full table with include", 1, function () {
        //    equal(_resultToString(
        //        $data.NewsReaderContext.Categories.include("Articles.Author").map(function (c) { return { title: c.Title, article: c.Articles }; }).toTraceString()),
        //        "SELECT **** FROM Articles T0 "
        //                + "\n\tLEFT OUTER JOIN Categories T1 ON (T0.Category__Id = T1.Id) | []");
        //});
        module("sqLiteModelBinder");
        test("get full table without select", 5, function () {
            var q = $data.NewsReaderContext.Users;
            var r = q.toTraceString();
            equal(_resultToString(r), "SELECT * FROM Users T0 | []");

            var expectedObject = { op: "buildType", context: null, logicalType: $news.Types.User, tempObjectName: "User", propertyMapping: null };
            r.actions[0].context = null;
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "User" }, "copy type faild");

            expectedObject = { keys: ['Id'], mapping: { Id: "Id", LoginName: "LoginName", Email: "Email" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("map_scalar_field", 6, function () {
            var q = $data.NewsReaderContext.Users.map(function (item) { return item.Id });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T0.Id AS d FROM Users T0 | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: 'd', type: undefined, includes: null, dataType: 'int' }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = { keys: ['rowid$$'], propertyType: "object", mapping: { d: "d" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("map_deep_scalar_field", 6, function () {
            var q = $data.NewsReaderContext.Articles.map(function (item) { return item.Author.Profile.Bio });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T2.Bio AS d FROM Articles T0 "
	                                        + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) "
	                                        + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: 'd', type: undefined, includes: null, dataType: 'string' }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = { keys: ['rowid$$'], propertyType: "object", mapping: { d: "d" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("map_obejct_scalar_field", 6, function () {
            var q = $data.NewsReaderContext.Articles.map(function (item) { return { t: item.Title, l: item.Lead }; });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T0.Title AS t, T0.Lead AS l FROM Articles T0 | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: 't', to: 't', type: undefined, includes: null, dataType: 'string' }, { from: 'l', to: 'l', type: undefined, includes: null, dataType: 'string' }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = { keys: ['rowid$$'], propertyType: "object", mapping: { t: "t", l: "l" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("map_obejct_deep_scalar_field", 6, function () {
            var q = $data.NewsReaderContext.Articles.map(function (item) { return { t: item.Author.Profile.FullName, l: item.Author.LoginName }; });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T2.FullName AS t, T1.LoginName AS l FROM Articles T0 "
	                                            + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) "
	                                            + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: 't', to: 't', type: undefined, includes: null, dataType: 'string' }, { from: 'l', to: 'l', type: undefined, includes: null, dataType: 'string' }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = { keys: ['rowid$$'], propertyType: "object", mapping: { t: "t", l: "l" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });
        test("map_deep_obejct_deep_scalar_field", 6, function () {
            var q = $data.NewsReaderContext.Articles.map(function (item) { return { t: item.Author.Profile.FullName, a: { b: { c: { d: item.Author.LoginName } } } }; });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T2.FullName AS t, T0.rowid AS a__rowid$$, T0.rowid AS b__rowid$$, T0.rowid AS c__rowid$$, T1.LoginName AS c__d FROM Articles T0 "
	                                            + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) "
	                                            + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: 't', to: 't', type: undefined, includes: null, dataType: 'string' }, { from: 'a.b.c.d', to: 'a.b.c.d', type: undefined, includes: null, dataType: 'string' }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = [{ keys: ['rowid$$'], propertyType: "object", mapping: { t: "t" } }, { keys: ['a__rowid$$'], propertyType: "object", propertyName: "a", mapping: {} }, { keys: ['b__rowid$$'], propertyType: "object", propertyName: "a.b", mapping: {} }, { keys: ['c__rowid$$'], propertyType: "object", propertyName: "a.b.c", mapping: { d: "c__d" } }];
            equal(r.converter.length, 4, "converter row number faild");
            deepEqual(r.converter, expectedObject, "expected converted row faild!");
        });
        test("map_deep_obejct_expression_field", 6, function () {
            var q = $data.NewsReaderContext.Articles.map(function (item) { return { t: item.Author.Profile.FullName, a: { b: { c: { r: item.Author.LoginName + item.Reviewer.Profile.Bio } } } }; });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T2.FullName AS t, T0.rowid AS a__rowid$$, T0.rowid AS b__rowid$$, T0.rowid AS c__rowid$$, (T1.LoginName + T4.Bio) AS c__r FROM Articles T0 "
	                                            + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) "
	                                            + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) "
	                                            + "\n\tLEFT OUTER JOIN Users T3 ON (T0.Reviewer__Id = T3.Id) "
	                                            + "\n\tLEFT OUTER JOIN UserProfiles T4 ON (T3.Id = T4.User__Id) | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: 't', to: 't', type: undefined, includes: null, dataType: 'string' }, { from: 'a.b.c.r', to: 'a.b.c.r', type: undefined, includes: null, dataType: null }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = [{ keys: ['rowid$$'], propertyType: "object", mapping: { t: "t" } }, { keys: ['a__rowid$$'], propertyType: "object", propertyName: "a", mapping: {} }, { keys: ['b__rowid$$'], propertyType: "object", propertyName: "a.b", mapping: {} }, { keys: ['c__rowid$$'], propertyType: "object", propertyName: "a.b.c", mapping: { r: "c__r" } }];
            equal(r.converter.length, 4, "converter row number faild");
            deepEqual(r.converter, expectedObject, "expected converted row faild!");
        });
        test("map_entity", 6, function () {
            var q = $data.NewsReaderContext.Articles.map(function (item) { return item.Reviewer.Profile; });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T2.Id AS Id, T2.FullName AS FullName, T2.Bio AS Bio, T2.Avatar AS Avatar, T2.Birthday AS Birthday, T2.User__Id AS User__Id, T2.Location__Address AS Location__Address, T2.Location__City AS Location__City, T2.Location__Zip AS Location__Zip, T2.Location__Country AS Location__Country FROM Articles T0 "
	                                            + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Reviewer__Id = T1.Id) "
	                                            + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: 'd', type: $news.Types.UserProfile, dataType: null, includes: [{ name: 'Location', type: $news.Types.Location }] }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = [{ keys: ['rowid$$'], propertyType: "object", mapping: { Id: "Id", FullName: "FullName", Bio: "Bio", Avatar: "Avatar", Birthday: "Birthday", User__Id: "User__Id" } },
                              { keys: ['rowid$$'], propertyName: "Location", propertyType: 'object', mapping: { Address: "Location__Address", City: "Location__City", Zip: "Location__Zip", Country: "Location__Country" } }];
            equal(r.converter.length, 2, "converter row number faild");
            deepEqual(r.converter, expectedObject, "expected converted row faild!");
        });
        test("map_scalar_field_from_type_with_complexType", 6, function () {
            var q = $data.NewsReaderContext.Articles.map(function (item) { return item.Reviewer.Profile.FullName; });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T2.FullName AS d FROM Articles T0 "
	                                            + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Reviewer__Id = T1.Id) "
	                                            + "\n\tLEFT OUTER JOIN UserProfiles T2 ON (T1.Id = T2.User__Id) | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: "d", dataType: "string", includes: null, type: undefined }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = { keys: ['rowid$$'], propertyType: "object", mapping: { d: "d" } };
            equal(r.converter.length, 1, "converter row number faild");
            deepEqual(r.converter[0], expectedObject, "expected converted row faild!");
        });

        test("map_scalar_and_entity", 6, function () {
            var q = $data.NewsReaderContext.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author }; });
            var r = q.toTraceString();
            start(1);
            equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T0.Title AS Title, T1.Id AS Auth__Id, T1.LoginName AS Auth__LoginName, T1.Email AS Auth__Email FROM Articles T0 "
	                                            + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) | []");

            console.dir(r);
            //Model binder
            ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
            r.actions[0].context = null;
            var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: "Title", to: "Title", dataType: "string", includes: null, type: undefined }, { from: "Auth", to: "Auth", dataType: null, includes: null, type: $news.Types.User }] };
            deepEqual(r.actions[0], expectedObject, "buildType faild");
            deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

            expectedObject = [{ keys: ['rowid$$'], propertyType: "object", mapping: { Title: "Title" } }, { keys: ['rowid$$'], propertyType: "object", propertyName: "Auth", mapping: { Id: 'Auth__Id', LoginName: 'Auth__LoginName', Email: 'Auth__Email' } }];
            equal(r.converter.length, 2, "converter row number faild");
            deepEqual(r.converter, expectedObject, "expected converted row faild!");
        });
        //test("map_complex_type_field", 6, function () {
        //    var q = $data.NewsReaderContext.Articles.map(function (m) {return {a: m.Author.Profile.FullName, b: m.Author.LoginName, c: m.Author.Profile };});
        //    var r = q.toTraceString();
        //    start(1);
        //    equal(_resultToString(r), "SELECT T0.rowid AS rowid$$, T0.Title AS Title, T1.Id AS Auth__Id, T1.LoginName AS Auth__LoginName, T1.Email AS Auth__Email FROM Articles T0 "
        //                                        + "\n\tLEFT OUTER JOIN Users T1 ON (T0.Author__Id = T1.Id) | []");

        //    console.dir(r);
        //    //Model binder
        //    ok(r.actions[0].context === $data.NewsReaderContext, 'Model binder context error');
        //    r.actions[0].context = null;
        //    var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: [{ from: "Title", to: "Title", dataType: "string", includes: null, type: undefined }, { from: "Auth", to: "Auth", dataType: null, includes: null, type: $news.Types.User }] };
        //    deepEqual(r.actions[0], expectedObject, "buildType faild");
        //    deepEqual(r.actions[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");

        //    expectedObject = [{ keys: ['rowid$$'], mapping: { Title: "Title" } }, { keys: ['rowid$$'], propertyName: "Auth", mapping: { Id: 'Auth__Id', LoginName: 'Auth__LoginName', Email: 'Auth__Email' } }];
        //    equal(r.converter.length, 2, "converter row number faild");
        //    deepEqual(r.converter, expectedObject, "expected converted row faild!");
        //});
    });
});