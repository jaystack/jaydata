$(document).ready(function () {    
    module("BasicAuth");
    var protectedServiceURL = "Services/Protected/emptyNewsReader.svc";
    test("Auth fail", 1, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: protectedServiceURL, user: "wronguser", password: "wrongpassword" })).onReady(function (db) {
            db.Tags.toArray({
                success: function () {
                    start();
                    ok(false, "Auth error");
                }, error: function (error) {
                    start();
                    ok(true, "Auth error");
                }
            });
        });
    });
    test("Auth ok", 7, function () {
        stop(1);
        (new $news.Types.NewsContext({ name: "oData", oDataServiceHost: protectedServiceURL, user: "user", password: "password" })).onReady(function (db) {
            db.Tags.toArray({
                success: function (result) {                    
                    ok(true, "Auth ok");
                    var count = result.length;
                    var tag = new $news.Types.Tag({ Title: 'AuthTag' })
                    db.Tags.add(tag);
                    db.saveChanges({
                        success: function () {                            
                            ok(true, "Save tag");
                            db.Tags.toArray({
                                success: function (result) {                                    
                                    ok(true, "Tag saved");
                                    equal(result.length, count + 1, "Tag count saved ok");
                                    db.Tags.remove(tag);
                                    db.saveChanges({
                                        success: function () {                                            
                                            ok(true, "Tag remove");
                                            db.Tags.toArray({
                                                success: function (result) {
                                                    start();
                                                    ok(true, "Tag removed");
                                                    equal(result.length, count, "Tag removed count ok");
                                                }, error: function () {
                                                    start();
                                                    ok(false, "Tag removed");
                                                }
                                            });
                                        }, error: function () {
                                            start();
                                            ok(false, "Tag remove");
                                        }
                                    });
                                }, error: function () {
                                    start();
                                    ok(false, "Tag saved");
                                }
                            });
                        }, error: function () {
                            start();
                            ok(false, "Save tag");
                        }});
                }, error: function (error) {
                    start();
                    ok(false, "Auth ok");
                }
            });
        });
    });
});