$(document).ready(function () {
    var serviceURL = "Services/newsReader.svc";
    module("oData_provider_tests_use_service_full_table");
    test("get_full_table_orderby", 12, function () {
        var expectedValues = ['Health', 'Politics', 'Sport', 'Tech', 'World'];
        stop(2);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            start();
            ok(db, "Db create faild");
            db.Categories.orderBy(function (item) { return item.Title; }).toArray(function (result) {
                start();
                equal(result.length, 5, "user number error");
                for (var i = 0; i < result.length; i++) {
                    ok(result[i] instanceof db.Categories.createNew, "type mismatch error");
                    equal(result[i].Title, expectedValues[i], "value error at " + i + ". position");
                }
            });
        });
    });
    test("get_full_table_multiple_orderby", 32, function () {
        var expectedValues = [{ s0: 'alma', Id: 2 }, { s0: 'alma', Id: 12 },
                              { s0: 'árvíztűrő tükörfúrógép ÁRVÍZTŰRŐ TÜKÖRFÚRÓGÉP', Id: 10 }, { s0: 'árvíztűrő tükörfúrógép ÁRVÍZTŰRŐ TÜKÖRFÚRÓGÉP', Id: 20 },
                              { s0: 'banan', Id: 6 }, { s0: 'banan', Id: 16 },
                              { s0: 'barack', Id: 8 }, { s0: 'barack', Id: 18 },
                              { s0: 'korte', Id: 4 }, { s0: 'korte', Id: 14 }, ];
        stop(2);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            start();
            ok(db, "Db create faild");
            db.TestTable.orderBy(function (item) { return item.s0; }).orderBy(function (item) { return item.Id; }).toArray(function (result) {
                start();
                equal(result.length, 10, "user number error");
                for (var i = 0; i < result.length; i++) {
                    ok(result[i] instanceof db.TestTable.createNew, "type mismatch error");
                    equal(result[i].s0, expectedValues[i].s0, "value error at " + i + ". position");
                    equal(result[i].Id, expectedValues[i].Id, "value error at " + i + ". position");
                }
            });
        });
    });
    //==================================================================================================== Accessing array items
    module("oData_provider_tests_use_service");
    /* test("ArrayAccess_Vector", 3, function () {
        stop(1);
        var x = { xvalue: ["U", "s", "r1"] };
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m) { return m.LoginName != this.p1.xvalue[0] + this.p1.xvalue[1] + this.p1.xvalue[2] }, { p1: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 5, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].Name != "Usr1");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user: JoeJackJim");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("ArrayAccess_Jagged", 3, function () {
        stop(1);
        var x = [[1, 2, 3], [4, 5, 6], [7, 8, 5]];
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m, p) { return m.Id == p.a[2][2]; }, { a: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "Usr5");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'QQQackackackQQQQ'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
   test("ArrayAccess_Jagged2", 3, function () {
        stop(1);
        var x = [[1, 2, 3], [4, 5, 6], [7, 8, 5]];
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m, p) { return m.Id >= p[2][2]; }, x).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 2, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].Loginname == "Usr5");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'nochtap'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });*/

    //==================================================================================================== WhereExp

    test("WhereExp__EntityProp_Eq_Literal", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m) { return m.LoginName == "Usr3"; }, {}).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "Usr3");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'Usr3'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("WhereExp__Literal_Eq_EntityProp", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m) { return "Usr3" == m.LoginName; }, {}).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "Usr3");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'Usr3'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("WhereExp__EntityProp_Eq_Param", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m) { return m.LoginName == this.prm1; }, { prm1: "Usr3" }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "Usr3");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'Usr3'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("WhereExp__EntityProp_Eq_ParamProp", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var x = { value: "Usr2" };
            db.Users.where(function (m) { return m.LoginName == this.prm1.value; }, { prm1: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "Usr2");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'Usr2'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });

    //==================================================================================================== MethodCall

    test("MethodCall_'Contains'_is_compiled_to_'substringof(string,_string)'", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m) { return m.LoginName.contains('r4'); }, null).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "Usr4");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'Usr4'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("MethodCall_'StartsWith'_is_compiled_to_'startswith(string,_string)'", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m) { return m.LoginName.startsWith('Starts'); }, null).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "StartsWithTest");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'Hajni'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("MethodCall_'EndsWith'_is_compiled_to_'endswith(string,_string)'", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            db.Users.where(function (m, p) { return m.LoginName.endsWith('Test'); }, {}).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].Name == "StartsWithTest");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'StartsWithTest'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });

    test("MethodCall_Contains_ParamProp", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var x = { value: "With" };
            db.Users.where(function (m) { return m.LoginName.contains(this.prm.value); }, { prm: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "StartsWithTest");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'JoeJackJim'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("MethodCall_Contains_ParamMethod", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var x = { dup: function (s, c) { var x = ''; for (var i = 0; i < c; i++) x = x + s; return x; } };
            db.Users.where(function (m) { return m.LoginName.contains(this.prm.dup("With", 1)); }, { prm: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "StartsWithTest");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'StartsWithTest'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });

    test("MethodCall_StartsWith_ParamProp", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var x = { value: "Starts" };
            db.Users.where(function (m) { return m.LoginName.startsWith(this.prm.value); }, { prm: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "StartsWithTest");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'StartsWithTest'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("MethodCall_StartsWith_ParamMethod", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var x = { dup: function (s, c) { var x = ''; for (var i = 0; i < c; i++) x = x + s; return x; } };
            db.Users.where(function (m) { return m.LoginName.startsWith(this.prm.dup("Start", 1)); }, { prm: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].LoginName == "StartsWithTest");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'StartsWithTest'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("MethodCall_EndsWith_ParamProp", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var x = { value: "Test" };
            db.Users.where(function (m) { return m.LoginName.endsWith(this.prm.value); }, { prm: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].Name == "StartsWithTest");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'StartsWithTest'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("MethodCall_EndsWith_ParamMethod", 3, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var x = { dup: function (s, c) { var x = ''; for (var i = 0; i < c; i++) x = x + s; return x; } };
            db.Users.where(function (m) { return m.LoginName.endsWith(this.prm.dup("Q", 3)); }, { prm: x }).toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.Users.createNew);
                        nameTest = nameTest && (result[i].Name == "StartsWithTest");
                    }
                    ok(isUser, "Invalid return type");
                    ok(nameTest, "return user is not 'StartsWithTest'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });

    //==================================================================================================== Expressions
    test("Include_Category_Article", 100, function () {
        var expectedValues = ['Sport', 'World', 'Politics', 'Tech', 'Health'];
        stop(2);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            start();
            ok(db, "Database create error");
            db.Categories.include("Articles").toArray(function (result) {
                console.dir(result);
                start();
                equal(result.length, 5, "Categories count faild");
                result.forEach(function (cat, index) {
                    ok(cat instanceof $news.Types.Category, "Type of element at " + index + ". position faild!");
                    equal(cat.Title, expectedValues[index], "Category Title at " + index + ". position faild!");
                    ok(cat.Articles, "Categori at " + index + ". position has't Articles property");
                }, this);
            });
        });
    });
    //==================================================================================================== Add entity-s
    test("AddEntity:_Add_One_Users", 5, function () {
        stop(3);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            start();
            var usr1 = new $news.Types.User({ LoginName: "unitTest1" });
            db.Users.add(usr1);
            db.saveChanges({
                success: function (result) {
                    start();
                    equal(result, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    var validUserId = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.SimpleTableTests.createNew);
                        nameTest = nameTest && (result[i].Name == "unitTest1");
                        validUserId = validUserId && (result[i].UserId != 0);
                    }
                    ok(isUser, "Invalid return type");
                    ok(validUserId, "Invalid UserId");
                    ok(nameTest, "return user is not 'unitTest1'");

                    db.Users.where(function (item, p) { return item.LoginName == "unitTest1"; }, null).toArray(function (queryResult) {
                        start();
                        ok(queryResult, "query result faild");
                    });

                }, error: function (error) {
                    console.dir(error);
                    start(2);
                    ok(false);
                }
            });
        });
    });
    test("AddEntity:_Add_Many_Users", 4, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var usr1 = new db.Users.createNew({ LoginName: "unitTest3", Id: 0 });
            var usr2 = new db.Users.createNew({ LoginName: "unitTest2", Id: 0 });
            var usr3 = new db.Users.createNew({ LoginName: "unitTest1", Id: 0 });
            db.Users.add(usr1);
            db.Users.add(usr2);
            db.Users.add(usr3);
            db.saveChanges({
                success: function (result) {
                    start(1);
                    equal(result, 3, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    var validUserId = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.SimpleTableTests.createNew);
                        nameTest = nameTest && (result[i].LoginName == "unitTest" + (i + 1));
                        validUserId = validUserId && (result[i].Id != 0);
                    }
                    ok(isUser, "Invalid return type");
                    ok(validUserId, "Invalid UserId");
                    ok(nameTest, "return users name are not valid");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    /*test("AddEntity:_Add_One_Users_MultiKey", 4, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var usr1 = new db.ComplexTableTests.createNew({ Name: "unitTest1", UserId: 0, UserName: "mk_unitTest1" });
            db.ComplexTableTests.add(usr1);
            db.saveChanges({
                success: function (result) {
                    start(1);
                    equal(result.length, 1, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    var validUserId = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.ComplexTableTests.createNew);
                        nameTest = nameTest && (result[i].Name == "unitTest1");
                        validUserId = validUserId && (result[i].UserId != 0);
                    }
                    ok(isUser, "Invalid return type");
                    ok(validUserId, "Invalid UserId");
                    ok(nameTest, "return user is not 'unitTest1'");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });
    test("AddEntity:_Add_Many_Users_MultiKey", 4, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            var usr1 = new db.ComplexTableTests.createNew({ Name: "unitTest3", UserId: 0, UserName: "mk_unitTest3" });
            var usr2 = new db.ComplexTableTests.createNew({ Name: "unitTest2", UserId: 0, UserName: "mk_unitTest2" });
            var usr3 = new db.ComplexTableTests.createNew({ Name: "unitTest1", UserId: 0, UserName: "mk_unitTest1" });
            db.ComplexTableTests.add(usr1);
            db.ComplexTableTests.add(usr2);
            db.ComplexTableTests.add(usr3);
            db.saveChanges({
                success: function (result) {
                    start(1);
                    equal(result.length, 3, "Result number faild");
                    var isUser = true;
                    var nameTest = true;
                    var validUserId = true;
                    for (var i = 0; i < result.length; i++) {
                        isUser = isUser && (result[i] instanceof db.ComplexTableTests.createNew);
                        nameTest = nameTest && (result[i].Name == "unitTest" + (i + 1));
                        validUserId = validUserId && (result[i].UserId != 0);
                    }
                    ok(isUser, "Invalid return type");
                    ok(validUserId, "Invalid UserId");
                    ok(nameTest, "return users name are not valid");

                }, error: function (error) {
                    console.dir(error);
                    start(1);
                    ok(false);
                }
            });
        });
    });

    test("UpdateEntity:_Update_One_Users", 7, function () {
        stop(3);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            ///Insert new user
            var usr1 = new db.SimpleTableTests.createNew({ Name: "originalUser", UserId: 0 });
            db.SimpleTableTests.add(usr1);
            db.saveChanges({
                success: function (createResult) {
                    start();
                    equal(createResult.length, 1, "Result number faild");
                    var newUser = createResult[0];
                    ok(newUser instanceof db.SimpleTableTests.createNew, "Invalid return type");
                    equal(newUser.Name, "originalUser", "return user is not 'originalUser'");

                    newUser.Name = "updateUser";
                    db.SimpleTableTests.attach(newUser);
                    newUser.entityState = $data.EntityState.Modified;
                    db.saveChanges({
                        success: function (updateResult) {
                            start();
                            equal(updateResult.length, 0, "Result number faild");

                            db.SimpleTableTests.where(function (item, param) { return item.UserId == param.id }, { id: newUser.UserId }).toArray(
                    {
                        success: function (queryResult) {
                            start();
                            equal(queryResult.length, 1, "Result number faild");
                            var updateUser = queryResult[0];
                            equal(newUser.UserId, updateUser.UserId, "Invalid user id");
                            equal(updateUser.Name, "updateUser", "return user is not 'updateUser'");
                        },
                        error: function (error) {
                            console.dir(error);
                            start();
                            ok(false);
                        }
                    });

                        },
                        error: function (error) {
                            console.dir(error);
                            start();
                            ok(false);
                        }
                    });

                },
                error: function (error) {
                    console.dir(error);
                    start();
                    ok(false);
                }
            });
        });
    });
    test("UpdateEntity:_Update_One_Users_MultiKey", 7, function () {
        stop(3);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            ///Insert new user
            var usr1 = new db.ComplexTableTests.createNew({ Name: "originalUser", UserId: 0, UserName: "originalUser" });
            db.ComplexTableTests.add(usr1);
            db.saveChanges({
                success: function (createResult) {
                    start();
                    equal(createResult.length, 1, "Result number faild");
                    var newUser = createResult[0];
                    ok(newUser instanceof db.ComplexTableTests.createNew, "Invalid return type");
                    equal(newUser.Name, "originalUser", "return user is not 'originalUser'");

                    newUser.Name = "updateUser";
                    db.ComplexTableTests.attach(newUser);
                    newUser.entityState = $data.EntityState.Modified;
                    db.saveChanges({
                        success: function (updateResult) {
                            start();
                            equal(updateResult.length, 0, "Result number faild");

                            db.ComplexTableTests.where(function (item, param) { return item.UserId == param.id }, { id: newUser.UserId }).toArray(
                    {
                        success: function (queryResult) {
                            start();
                            equal(queryResult.length, 1, "Result number faild");
                            var updateUser = queryResult[0];
                            equal(newUser.UserId, updateUser.UserId, "Invalid user id");
                            equal(updateUser.Name, "updateUser", "return user is not 'updateUser'");
                        },
                        error: function (error) {
                            console.dir(error);
                            start();
                            ok(false);
                        }
                    });

                        },
                        error: function (error) {
                            console.dir(error);
                            start();
                            ok(false);
                        }
                    });

                },
                error: function (error) {
                    console.dir(error);
                    start();
                    ok(false);
                }
            });
        });
    });

    test("DeleteEntity:_Delete_One_Users", 5, function () {
        stop(3);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            ///Insert new user
            var usr1 = new db.SimpleTableTests.createNew({ Name: "deletedUser", UserId: 0 });
            db.SimpleTableTests.add(usr1);
            db.saveChanges({
                success: function (createResult) {
                    start();
                    equal(createResult.length, 1, "Result number faild");
                    var newUser = createResult[0];
                    ok(newUser instanceof db.SimpleTableTests.createNew, "Invalid return type");
                    equal(newUser.Name, "deletedUser", "return user is not 'deletedUser'");

                    db.SimpleTableTests.remove(newUser);
                    db.saveChanges({
                        success: function (updateResult) {
                            start();
                            equal(updateResult.length, 0, "Result number faild");

                            db.SimpleTableTests.where(function (item, param) { return item.UserId == param.id }, { id: newUser.UserId }).toArray(
                    {
                        success: function (queryResult) {
                            start();
                            equal(queryResult.length, 0, "Result number faild");
                        },
                        error: function (error) {
                            console.dir(error);
                            start();
                            ok(false);
                        }
                    });

                        },
                        error: function (error) {
                            console.dir(error);
                            start();
                            ok(false);
                        }
                    });

                },
                error: function (error) {
                    console.dir(error);
                    start();
                    ok(false);
                }
            });
        });
    });
    test("DeleteEntity:_Delete_One_Userss_MultiKey", 5, function () {
        stop(3);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: serviceURL })).onReady(function (db) {
            ///Insert new user
            var usr1 = new db.ComplexTableTests.createNew({ Name: "deletedUser", UserId: 0, UserName: "deletedUser" });
            db.ComplexTableTests.add(usr1);
            db.saveChanges({
                success: function (createResult) {
                    start();
                    equal(createResult.length, 1, "Result number faild");
                    var newUser = createResult[0];
                    ok(newUser instanceof db.ComplexTableTests.createNew, "Invalid return type");
                    equal(newUser.Name, "deletedUser", "return user is not 'deletedUser'");

                    db.ComplexTableTests.remove(newUser);
                    db.saveChanges({
                        success: function (updateResult) {
                            start();
                            equal(updateResult.length, 0, "Result number faild");

                            db.ComplexTableTests.where(function (item, param) { return item.UserId == param.id }, { id: newUser.UserId }).toArray(
                    {
                        success: function (queryResult) {
                            start();
                            equal(queryResult.length, 0, "Result number faild");
                        },
                        error: function (error) {
                            console.dir(error);
                            start();
                            ok(false);
                        }
                    });

                        },
                        error: function (error) {
                            console.dir(error);
                            start();
                            ok(false);
                        }
                    });

                },
                error: function (error) {
                    console.dir(error);
                    start();
                    ok(false);
                }
            });
        });
    });*/
});