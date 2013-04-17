$(document).ready(function () {
    module("oData_compiler");


    module("oData_compiler_tests");
    test("oData provider default initialize", 2, function () {
        var provider = new $data.storageProviders.oData.oDataProvider();
        notEqual(provider.providerConfiguration, null, "Default provider config object faild");
        equal(provider.providerConfiguration.oDataServiceHost, "/odata.svc", "Default oData service name faild!");
    });
    test("oData provider custom initialize", 2, function () {
        var provider = new $data.storageProviders.oData.oDataProvider({ oDataServiceHost: "/oBlog.svc" });
        notEqual(provider.providerConfiguration, null, "Default provider config object faild");
        equal(provider.providerConfiguration.oDataServiceHost, "/oBlog.svc", "Default oData service name faild!");
    });
    test("get_full_table__", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.toTraceString();
            start(1);
            equal(q.queryText, "/Users", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });

    test("get_full_table_orderby", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.orderBy(function (item) { return item.LoginName; }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$orderby=LoginName", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("get_full_table_multiple_orderby", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.orderBy(function (item) { return item.Email; })
                                .orderBy(function (item) { return item.Id; })
                                .orderBy(function (item) { return item.LoginName; }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$orderby=Email,Id,LoginName", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("get_full_table_multiple_orderby_desc", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.orderByDescending(function (item) { return item.Email; })
                                .orderByDescending(function (item) { return item.Id; })
                                .orderByDescending(function (item) { return item.LoginName; }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$orderby=Email desc,Id desc,LoginName desc", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("get_full_table_multiple_orderby_asc_desc_asc", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.orderBy(function (item) { return item.Email; })
                                .orderByDescending(function (item) { return item.Id; })
                                .orderBy(function (item) { return item.LoginName; }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$orderby=Email,Id desc,LoginName", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("get_full_table_multiple_orderby_desc_asc_desc", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.orderByDescending(function (item) { return item.Email; })
                                .orderBy(function (item) { return item.Id; })
                                .orderByDescending(function (item) { return item.LoginName; }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$orderby=Email desc,Id,LoginName desc", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });

    test("get_full_table_top", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.take(10).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$top=10", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("get_full_table_skip", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.skip(11).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$skip=11", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("get_full_table_skip_take", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.skip(11).take(10).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$skip=11&$top=10", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });

    test("filter_table_1_field_string", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (item, p) { return item.LoginName == "alma" }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=(LoginName eq 'alma')", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_1_field_string_param", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (item) { return item.LoginName == this.ln; }, { ln: "alma" }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=(LoginName eq 'alma')", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_1_field_int", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (item, p) { return item.Id == 15; }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=(Id eq 15)", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_1_field_int_param", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (item, p) { return item.Id == this.Id }, { Id: 15 }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=(Id eq 15)", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: 'LoginName',
                    Email: 'Email'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    //test("filter_table_1_field_datetime", 1, function () {
    //    stop(1);
    //    var dateString = new Date(Date.parse("2010-01-01")).toISOString();
    //    (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
    //        var q = db.Articles.where(function (item) { return item.CreateDate > new Date(Date.parse("2010-01-01")); }, null).toTraceString();
    //        start(1);
    //        equal(q.queryText, "/Articles?$filter=(CreateDate gt datetime'" + dateString + "')", "Invalid query string");
    //    });
    //});
    test("filter_table_1_field_datetime_param", 2, function () {
        stop(1);
        var dateString = new Date(Date.parse("2010/01/01")).toISOString().replace('Z', '');
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.where(function (item) { return item.CreateDate > this.d; }, { d: new Date(Date.parse("2010/01/01")) }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$filter=(CreateDate gt datetime'" + dateString + "')", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Article,
                    $keys: ['Id'],
                    Id: "Id",
                    RowVersion: { $selector: "json:__metadata", $source: "etag" },
                    Title: "Title",
                    Lead: "Lead",
                    Body: "Body",
                    CreateDate: "CreateDate",
                    Thumbnail_LowRes: "Thumbnail_LowRes",
                    Thumbnail_HighRes: "Thumbnail_HighRes"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_1_field_number", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.TestTable.where(function (item) { return item.n0 > 4.5; }, null).toTraceString();
            start(1);
            equal(q.queryText, "/TestTable?$filter=(n0 gt 4.5)", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.TestItem,
                    $keys: ['Id'],
                    Id: "Id",
                    i0: "i0",
                    b0: "b0",
                    s0: "s0",
                    blob: "blob",
                    n0: "n0",
                    d0: "d0"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_1_field_number_param", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.TestTable.where(function (item) { return item.n0 > this.num; }, { num: 4.5 }).toTraceString();
            start(1);
            equal(q.queryText, "/TestTable?$filter=(n0 gt 4.5)", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.TestItem,
                    $keys: ['Id'],
                    Id: 'Id',
                    i0: "i0",
                    b0: "b0",
                    s0: "s0",
                    blob: "blob",
                    n0: "n0",
                    d0: "d0"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_1_field_bool", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.TestTable.where(function (item) { return item.b0 == true; }, null).toTraceString();
            start(1);
            equal(q.queryText, "/TestTable?$filter=(b0 eq true)", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.TestItem,
                    $keys: ['Id'],
                    Id: 'Id',
                    i0: "i0",
                    b0: "b0",
                    s0: "s0",
                    blob: "blob",
                    n0: "n0",
                    d0: "d0"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_1_field_bool_param", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.TestTable.where(function (item) { return item.b0 == this.bool; }, { bool: true }).toTraceString();
            start(1);
            equal(q.queryText, "/TestTable?$filter=(b0 eq true)", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.TestItem,
                    $keys: ['Id'],
                    Id: 'Id',
                    i0: "i0",
                    b0: "b0",
                    s0: "s0",
                    blob: "blob",
                    n0: "n0",
                    d0: "d0"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_many_field_string", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (item) { return item.LoginName == "alma" && item.Email == "email@company.com"; }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=((LoginName eq 'alma') and (Email eq 'email@company.com'))", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: "LoginName",
                    Email: "Email"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_many_field_string_date", 2, function () {
        stop(1);
        var dateString = new Date(Date.parse("2012/01/01")).toISOString().replace('Z', '');
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.where(function (article) { return article.Title == "alma" && article.CreateDate == this.cDate; }, { cDate: new Date(Date.parse("2012/01/01")) }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$filter=((Title eq 'alma') and (CreateDate eq datetime'" + dateString + "'))", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Article,
                    $keys: ['Id'],
                    Id: "Id",
                    RowVersion: { $selector: "json:__metadata", $source: "etag" },
                    Title: "Title",
                    Lead: "Lead",
                    Body: "Body",
                    CreateDate: "CreateDate",
                    Thumbnail_LowRes: "Thumbnail_LowRes",
                    Thumbnail_HighRes: "Thumbnail_HighRes"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_many_field_string_date_orderBy", 2, function () {
        stop(1);
        var dateString = new Date(Date.parse("2012/01/01")).toISOString().replace('Z', '');
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles
                               .where(function (article) { return article.Title == "alma" && article.CreateDate == this.cDate; }, { cDate: new Date(Date.parse("2012/01/01")) })
                               .orderBy(function (article) { return article.Title })
                               .toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$filter=((Title eq 'alma') and (CreateDate eq datetime'" + dateString + "'))&$orderby=Title", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Article,
                    $keys: ['Id'],
                    Id: "Id",
                    RowVersion: { $selector: "json:__metadata", $source: "etag" },
                    Title: "Title",
                    Lead: "Lead",
                    Body: "Body",
                    CreateDate: "CreateDate",
                    Thumbnail_LowRes: "Thumbnail_LowRes",
                    Thumbnail_HighRes: "Thumbnail_HighRes"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });


    test("filter_table_contains", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (item, p) { return item.LoginName.contains('aj') }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=substringof('aj',LoginName)", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: "LoginName",
                    Email: "Email"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_starts_with", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (item, p) { return item.LoginName.startsWith('aj') }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=startswith(LoginName,'aj')", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: "LoginName",
                    Email: "Email"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_ends_with", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (item, p) { return item.LoginName.endsWith('aj') }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=endswith(LoginName,'aj')", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: 'Id',
                    LoginName: "LoginName",
                    Email: "Email"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });

    module('oData_compiler_tests_complex');
    test("get_full_table_include", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.include("Category").toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Category", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Article,
                    $keys: ['Id'],
                    Id: "Id",
                    RowVersion: { $selector: "json:__metadata", $source: "etag" },
                    Title: "Title",
                    Lead: "Lead",
                    Body: "Body",
                    CreateDate: "CreateDate",
                    Thumbnail_LowRes: "Thumbnail_LowRes",
                    Thumbnail_HighRes: "Thumbnail_HighRes",
                    Category: {
                        $selector: ['json:Category.results', 'json:Category'],
                        $type: $news.Types.Category,
                        $keys: ['Id'],
                        Id: 'Id',
                        Title: 'Title'
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("get_full_table_2_include", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.include("Category").include('Author').toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Category,Author", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Article,
                    $keys: ['Id'],
                    Id: "Id",
                    RowVersion: { $selector: "json:__metadata", $source: "etag" },
                    Title: "Title",
                    Lead: "Lead",
                    Body: "Body",
                    CreateDate: "CreateDate",
                    Thumbnail_LowRes: "Thumbnail_LowRes",
                    Thumbnail_HighRes: "Thumbnail_HighRes",
                    Category: {
                        $selector: ['json:Category.results', 'json:Category'],
                        $type: $news.Types.Category,
                        $keys: ['Id'],
                        Id: 'Id',
                        Title: 'Title'
                    },
                    Author: {
                        $selector: ['json:Author.results', 'json:Author'],
                        $type: $news.Types.User,
                        $keys: ["Id"],
                        Id: "Id",
                        LoginName: "LoginName",
                        Email: "Email"
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("get_full_table_2_include_deep", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.include("Category").include('Author.Profile').toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Category,Author/Profile", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Article,
                    $keys: ['Id'],
                    Id: "Id",
                    RowVersion: { $selector: "json:__metadata", $source: "etag" },
                    Title: "Title",
                    Lead: "Lead",
                    Body: "Body",
                    CreateDate: "CreateDate",
                    Thumbnail_LowRes: "Thumbnail_LowRes",
                    Thumbnail_HighRes: "Thumbnail_HighRes",
                    Category: {
                        $selector: ['json:Category.results', 'json:Category'],
                        $type: $news.Types.Category,
                        $keys: ['Id'],
                        Id: 'Id',
                        Title: 'Title'
                    },
                    Author: {
                        $selector: ['json:Author.results', 'json:Author'],
                        $type: $news.Types.User,
                        $keys: ["Id"],
                        Id: "Id",
                        LoginName: "LoginName",
                        Email: "Email",
                        Profile: {
                            $selector: ['json:Profile.results', 'json:Profile'],
                            $type: $news.Types.UserProfile,
                            $keys: ['Id'],
                            Id: "Id",
                            FullName: "FullName",
                            Bio: "Bio",
                            Avatar: "Avatar",
                            Birthday: "Birthday",
                            Location: {
                                $selector: ['json:Location.results', 'json:Location'],
                                $type: $news.Types.Location,
                                Address: "Address",
                                City: "City",
                                Zip: "Zip",
                                Country: "Country"
                            }
                        }
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });

    test("get_full_table_3_include_deep_with_multiplicity", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Categories.include("Articles").include('Articles.Author').toTraceString();
            start(1);
            equal(q.queryText, "/Categories?$expand=Articles,Articles/Author", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Category,
                    $keys: ['Id'],
                    Id: 'Id',
                    Title: 'Title',
                    Articles: {
                        $selector: ['json:Articles.results', 'json:Articles'],
                        $type: $data.Array,
                        $item: {
                            $type: $news.Types.Article,
                            $keys: ['Id'],
                            Id: "Id",
                            RowVersion: { $selector: "json:__metadata", $source: "etag" },
                            Title: "Title",
                            Lead: "Lead",
                            Body: "Body",
                            CreateDate: "CreateDate",
                            Thumbnail_LowRes: "Thumbnail_LowRes",
                            Thumbnail_HighRes: "Thumbnail_HighRes",
                            Author: {
                                $selector: ['json:Author.results', 'json:Author'],
                                $type: $news.Types.User,
                                $keys: ["Id"],
                                Id: "Id",
                                LoginName: "LoginName",
                                Email: "Email"
                            }
                        }
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });

    test("filter_table_many_to_one_field_string", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            window["db"] = db;
            var q = db.Articles.where(function (article) { return article.Category.Title == "Sport" }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$filter=(Category/Title eq 'Sport')", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Article,
                    $keys: ['Id'],
                    RowVersion: { $selector: "json:__metadata", $source: "etag" },
                    Id: "Id",
                    Title: "Title",
                    Lead: "Lead",
                    Body: "Body",
                    CreateDate: "CreateDate",
                    Thumbnail_LowRes: "Thumbnail_LowRes",
                    Thumbnail_HighRes: "Thumbnail_HighRes"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_many_to_one_field_string_deep", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            window["db"] = db;
            var q = db.Articles.where(function (article) { return article.Author.Profile.Bio == "Bio1" }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$filter=(Author/Profile/Bio eq 'Bio1')", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.Article,
                    $keys: ['Id'],
                    RowVersion: { $selector: "json:__metadata", $source: "etag" },
                    Id: "Id",
                    Title: "Title",
                    Lead: "Lead",
                    Body: "Body",
                    CreateDate: "CreateDate",
                    Thumbnail_LowRes: "Thumbnail_LowRes",
                    Thumbnail_HighRes: "Thumbnail_HighRes"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("filter_table_one_to_one_foreign_field_string", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (usr) { return usr.Profile.Bio == "Bio2" }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=(Profile/Bio eq 'Bio2')", "Invalid query string");
            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.User,
                    $keys: ['Id'],
                    Id: "Id",
                    LoginName: "LoginName",
                    Email: "Email"
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    //test("filter_table_one_to_one_field_string", 1, function () {
    //    stop(1);
    //    (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
    //        var q = db.UserProfiles.where(function (usrP) { return usrP.User.LoginName == "Usr1" }, null).toTraceString();
    //        start(1);
    //        equal(q.queryText, "/UserProfiles?$filter=User/LoginName eq 'Usr1'", "Invalid query string");
    //    });
    //});

    module('oData_map');
    test("map_scalar_field", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.map(function (item) { return item.Id }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$select=Id", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Integer,
                    $source: 'Id'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_deep_scalar_field", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return item.Author.Profile.Bio }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Author/Profile&$select=Author/Profile/Bio", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $selector: ['json:Author.Profile.results', 'json:Author.Profile'],
                    $type: $data.String,
                    $source: 'Bio'
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    //NOT SUPPORTED oDATA
    /////////////////////
    //test("map_complexType_deep_scalar_field", 4, function () {
    //    stop(1);
    //    (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
    //        var q = db.Articles.map(function (item) { return item.Author.Profile.Location.City }).toTraceString();
    //        start(1);
    //        equal(q.queryText, "/Articles?$expand=Author/Profile&$select=Author/Profile/Location/City", "Invalid query string");

    //        //Model binder
    //        ok(q._actionPack[0].context === db, 'Model binder context error');
    //        q._actionPack[0].context = null;
    //        var expectedObject = { op: "buildType", context: null, logicalType: null, tempObjectName: "d", propertyMapping: { from: 'Author.Profile.Location.City', dataType: 'string' }, includes: null };
    //        deepEqual(q._actionPack[0], expectedObject, "buildType faild");
    //        deepEqual(q._actionPack[1], { op: "copyToResult", tempObjectName: "d" }, "copy type faild");
    //    });
    //});
    test("map_obejct_scalar_field", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return { t: item.Title, l: item.Lead }; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$select=Title,Lead", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Object,
                    t: { $type: $data.String, $source: 'Title' },
                    l: { $type: $data.String, $source: 'Lead' }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_obejct_deep_scalar_field", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return { t: item.Author.Profile.FullName, l: item.Author.LoginName }; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Author/Profile,Author&$select=Author/Profile/FullName,Author/LoginName", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Object,
                    t: { $type: $data.String, $selector: ['json:Author.Profile.results', 'json:Author.Profile'], $source: 'FullName' },
                    l: { $type: $data.String, $selector: ['json:Author.results', 'json:Author'], $source: 'LoginName' }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_deep_obejct_deep_scalar_field", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return { t: item.Author.Profile.FullName, a: { b: { c: { d: item.Author.LoginName } } } }; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Author/Profile,Author&$select=Author/Profile/FullName,Author/LoginName", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Object,
                    t: { $type:  $data.String, $selector: ['json:Author.Profile.results', 'json:Author.Profile'], $source: 'FullName' },
                    a: {
                        $type: $data.Object,
                        b: {
                            $type: $data.Object,
                            c: {
                                $type: $data.Object,
                                d: { $type: $data.String, $selector: ['json:Author.results', 'json:Author'], $source: 'LoginName' }
                            }
                        }
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_deep_obejct_deep_scalar_field2", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return { t: item.Author.Profile.FullName, a: { b: { c: { d: { f: item.Author.LoginName } }, c2: item.Id } } }; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Author/Profile,Author&$select=Author/Profile/FullName,Author/LoginName,Id", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Object,
                    t: { $type: $data.String, $selector: ['json:Author.Profile.results', 'json:Author.Profile'], $source: 'FullName' },
                    a: {
                        $type: $data.Object,
                        b: {
                            $type: $data.Object,
                            c: {
                                $type: $data.Object,
                                d: {
                                    $type: $data.Object,
                                    f: { $type: $data.String, $selector: ['json:Author.results', 'json:Author'], $source: 'LoginName' }
                                }
                            },
                            c2: { $type: $data.Integer, $source: 'Id' }
                        }
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_deep_obejct_deep_scalar_field3", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return { t: item.Author.Profile.FullName, a: { b: { c: { d: { f: item.Author.LoginName } }, c2: { c2d1: item.Id, c2d2: item.Title } } } }; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Author/Profile,Author&$select=Author/Profile/FullName,Author/LoginName,Id,Title", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Object,
                    t: { $type: $data.String, $selector: ['json:Author.Profile.results', 'json:Author.Profile'], $source: 'FullName' },
                    a: {
                        $type: $data.Object,
                        b: {
                            $type: $data.Object,
                            c: {
                                $type: $data.Object,
                                d: {
                                    $type: $data.Object,
                                    f: { $type: $data.String, $selector: ['json:Author.results', 'json:Author'], $source: 'LoginName' }
                                }
                            },
                            c2: {
                                $type: $data.Object,
                                c2d1: { $type: $data.Integer, $source: 'Id' },
                                c2d2: { $type: $data.String, $source: 'Title' }
                            }
                        }
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_obejct_entity", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return { t: item.Author }; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Author&$select=Author", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Object,
                    t: {
                        $type: $news.Types.User,
                        $selector: ['json:Author.results', 'json:Author'],
                        $keys: ['Id'],
                        Id: 'Id',
                        LoginName: 'LoginName',
                        Email: 'Email'
                    },
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_deep_obejct_entity", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return { t: { a: { b: { c: { d: item.Author } } } } }; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Author&$select=Author", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Object,
                    t: {
                        $type: $data.Object,
                        a: {
                            $type: $data.Object,
                            b: {
                                $type: $data.Object,
                                c: {
                                    $type: $data.Object,
                                    d: {
                                        $selector: ['json:Author.results', 'json:Author'],
                                        $type: $news.Types.User,
                                        $keys: ['Id'],
                                        Id: 'Id',
                                        LoginName: 'LoginName',
                                        Email: 'Email'
                                    }
                                }
                            }
                        }
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_deep_obejct_entity2", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return { t: { a: { b: { c: { d: item.Author.Profile.Location } }, b2: item.Reviewer.Profile } } }; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Author/Profile,Reviewer/Profile&$select=Author/Profile/Location,Reviewer/Profile", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $data.Object,
                    t: {
                        $type: $data.Object,
                        a: {
                            $type: $data.Object,
                            b: {
                                $type: $data.Object,
                                c: {
                                    $type: $data.Object,
                                    d: {
                                        $selector: ['json:Author.Profile.Location.results', 'json:Author.Profile.Location'],
                                        $type: $news.Types.Location,
                                        Address: 'Address',
                                        City: 'City',
                                        Zip: 'Zip',
                                        Country: 'Country'
                                    }
                                }
                            },
                            b2: {
                                $selector: ['json:Reviewer.Profile.results', 'json:Reviewer.Profile'],
                                $type: $news.Types.UserProfile,
                                $keys: ['Id'],
                                Id: 'Id',
                                FullName: "FullName",
                                Bio: "Bio",
                                Avatar: "Avatar",
                                Birthday: "Birthday",
                                Location: {
                                    $type: $news.Types.Location,
                                    $selector: ['json:Location.results', 'json:Location'],
                                    Address: "Address",
                                    City: "City",
                                    Zip: "Zip",
                                    Country: "Country"
                                }
                            }
                        }
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });
    test("map_entity", 2, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Articles.map(function (item) { return item.Reviewer.Profile; }).toTraceString();
            start(1);
            equal(q.queryText, "/Articles?$expand=Reviewer/Profile,Reviewer&$select=Reviewer/Profile", "Invalid query string");

            var expectedObject = {
                $type: $data.Array,
                $selector: ['json:d.results', 'json:d', 'json:results'],
                $item: {
                    $type: $news.Types.UserProfile,
                    $selector: ['json:Reviewer.Profile.results', 'json:Reviewer.Profile'],
                    $keys: ['Id'],
                    Id: 'Id',
                    FullName: "FullName",
                    Bio: "Bio",
                    Avatar: "Avatar",
                    Birthday: "Birthday",
                    Location: {
                        $type: $news.Types.Location,
                        $selector: ['json:Location.results', 'json:Location'],
                        Address: "Address",
                        City: "City",
                        Zip: "Zip",
                        Country: "Country"
                    }
                }
            };
            deepEqual(q.modelBinderConfig, expectedObject, "Model binder error");
        });
    });


    test("get_full_table_select_many_field", 1, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.map(function (item) { return { Id: item.Id, lName: item.LoginName } }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$select=Id,LoginName", "Invalid query string");
        });
    });
    test("get_full_table_select_sub_field", 1, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.map(function (item) { return { Id: item.Id, lName: item.Profile.Bio } }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$expand=Profile&$select=Id,Profile/Bio", "Invalid query string");
        });
    });
    test("get_full_table_select_sub_field_param", 1, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.map(function (item) { return { Id: item.Id, lName: item.Profile['Bio'] } }, null).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$expand=Profile&$select=Id,Profile/Bio", "Invalid query string");
        });
    });
    test("filter_table_select_sub_field", 1, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (usr) { return usr.Id > 0; }).map(function (item) { return { Id: item.Id, lName: item.Profile.Bio } }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=(Id gt 0)&$expand=Profile&$select=Id,Profile/Bio", "Invalid query string");
        });
    });

    module('oData_compiler_tests_innerFilter');
    test("filter_table_select_sub_frames", 8, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var articleFilter = db.Articles.filter(function (art) { return art.Title == 'Article1'; });
            var q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter }).toTraceString();
            equal(q.queryText, "/Categories?$filter=Articles/any(art: (art/Title eq 'Article1'))", "Invalid query string");

            q = db.Categories.filter(function (ctg) { return ctg.Articles.every(this.filter); }, { filter: articleFilter }).toTraceString();
            equal(q.queryText, "/Categories?$filter=Articles/all(art: (art/Title eq 'Article1'))", "Invalid query string");

            /*Tag != Tagconnection ( 1..* *..1 ) */
            tagFilter = db.TagConnections.filter(function (tagCon) { return tagCon.Id > 0; });
            articleFilter = db.Articles.filter(function (art) { return art.Tags.some(this.filter); }, { filter: tagFilter });
            q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter }).toTraceString();
            equal(q.queryText, "/Categories?$filter=Articles/any(art: art/Tags/any(tagCon: (tagCon/Id gt 0)))", "Invalid query string");

            q = db.Categories.filter(function (ctg) { return ctg.Articles.every(this.filter); }, { filter: articleFilter }).toTraceString();
            equal(q.queryText, "/Categories?$filter=Articles/all(art: art/Tags/any(tagCon: (tagCon/Id gt 0)))", "Invalid query string");

            tagFilter = db.TagConnections.filter(function (tagCon) { return tagCon.Article.Title == 'Article1'; });
            articleFilter = db.Articles.filter(function (art) { return art.Tags.some(this.filter); }, { filter: tagFilter });
            q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter }).toTraceString();
            equal(q.queryText, "/Categories?$filter=Articles/any(art: art/Tags/any(tagCon: (tagCon/Article/Title eq 'Article1')))", "Invalid query string, 1..* *..1 ");
            /* ^^ */

            articleFilter = db.Articles.filter(function (art) { return art.Title == 'Article1'; });
            q = db.Categories.filter(function (ctg) { return ctg.Articles.every(this.filter) && ctg.Title == 'Sport'; }, { filter: articleFilter }).toTraceString();
            equal(q.queryText, "/Categories?$filter=(Articles/all(art: (art/Title eq 'Article1')) and (Title eq 'Sport'))", "Invalid query string");

            q = db.Categories.filter(function (ctg) { return ctg.Title == 'Sport' && ctg.Articles.some(this.filter); }, { filter: articleFilter }).toTraceString();
            equal(q.queryText, "/Categories?$filter=((Title eq 'Sport') and Articles/any(art: (art/Title eq 'Article1')))", "Invalid query string");

            q = db.Categories.filter(function (ctg) { return ctg.Title == 'Sport' && ctg.Articles.some(); }).toTraceString();
            equal(q.queryText, "/Categories?$filter=((Title eq 'Sport') and Articles/any())", "Invalid query string");

            start(1);
        });
    });
    test("filter_chain", 1, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData" })).onReady(function (db) {
            var q = db.Users.where(function (usr) { return usr.Id > 0; }).filter(function (usr) { return usr.LoginName.contains('Joe'); }).toTraceString();
            start(1);
            equal(q.queryText, "/Users?$filter=((Id gt 0) and substringof('Joe',LoginName))", "Invalid query string");
        });
    });
});
