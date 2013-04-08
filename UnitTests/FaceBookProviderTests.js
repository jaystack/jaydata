$(document).ready(function () {
    module("FaceBook Provider");

    var fbContext = new $data.Facebook.FQLContext({ name: 'Facebook' });
    fbContext.onReady(function (context) {

        test("fbContextTest", 3, function () {
            equal(context.Users instanceof $data.EntitySet, true, 'facebook users set exists');
            equal(context.Friends instanceof $data.EntitySet, true, 'facebook users set exists');
            equal(context.Pages instanceof $data.EntitySet, true, 'facebook pages set exists');
        });

        test("fbContextTest - query", 26, function () {
            try {
                context.Users.toTraceString();
            } catch (e) {
                ok(e, 'filter is required in fb queries');
            }

            var select = 'SELECT uid, username, first_name, middle_name, last_name, name, sex, locale, pic_small_with_logo, pic_big_with_logo, pic_square_with_logo, pic_with_logo FROM user ';
            var q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).toTraceString();
            equal(q.queryText, select + 'WHERE (uid = 111)', 'Simple select int');

            q = context.Users.where(function (u) { return u.username == this.id1; }, { id1: '111' }).toTraceString();
            equal(q.queryText, select + "WHERE (username = '111')", 'Simple select string');

            q = context.Users.where(function (u) { return u.uid == this.id1 || u.uid == this.id2; }, { id1: 111, id2: 2222 }).toTraceString();
            equal(q.queryText, select + 'WHERE ((uid = 111) OR (uid = 2222))', 'OR statement');

            q = context.Users.where(function (u) { return u.uid == this.id1 && u.uid == this.id2; }, { id1: 111, id2: 2222 }).toTraceString();
            equal(q.queryText, select + 'WHERE ((uid = 111) AND (uid = 2222))', 'AND statement');

            q = context.Users.where(function (u) { return u.uid == this.id1 || u.uid == this.id2; }, { id1: 111, id2: 2222 }).orderBy(function (u) { return u.uid; }).toTraceString();
            equal(q.queryText, select + 'WHERE ((uid = 111) OR (uid = 2222)) ORDER BY uid ASC', 'OrderBy statement');

            q = context.Users.where(function (u) { return u.uid == this.id1 || u.uid == this.id2; }, { id1: 111, id2: 2222 }).orderByDescending(function (u) { return u.uid; }).toTraceString();
            equal(q.queryText, select + 'WHERE ((uid = 111) OR (uid = 2222)) ORDER BY uid DESC', 'OrderByDescending statement');

            try {
                context.Users.orderBy(function (u) { return u.uid; }).orderByDescending(function (u) { return u.uid; }).toTraceString();
            } catch (e) {
                ok(e, 'multiple sorting is invalid');
            }

            q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).take(1).toTraceString();
            equal(q.queryText, select + 'WHERE (uid = 111) LIMIT 1', 'TAKE');

            q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).orderBy(function (u) { return u.uid; }).take(1).toTraceString();
            equal(q.queryText, select + 'WHERE (uid = 111) ORDER BY uid ASC LIMIT 1', 'TAKE');

            q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).skip(1).toTraceString();
            equal(q.queryText, select + 'WHERE (uid = 111)', 'SKIP - (no skip without take)');

            q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).skip(1).take(1).toTraceString();
            equal(q.queryText, select + 'WHERE (uid = 111) LIMIT 1 OFFSET 1', 'SKIP TAKE');

            q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).where(function (u2) { return u2.username == 'username' }).toTraceString();
            equal(q.queryText, select + "WHERE ((uid = 111) AND (username = 'username'))", 'Multiple selects');

            q = context.Users.where(function (u) { return u.uid in this.arrayArg; }, { arrayArg: [1, 2, 3, 4] }).toTraceString();
            equal(q.queryText, select + 'WHERE (uid IN (1, 2, 3, 4))', 'array In statement');

            var friendsQuery = context.Friends
            .where(function (f) { return f.uid1 == $data.Facebook.FQLCommands.me; })
            .select(function (f) { return f.uid2; });
            q = context.Users
            .where(function (u) { return u.uid == this.me || u.uid in this.friends; }, { me: $data.Facebook.FQLCommands.me, friends: friendsQuery })
            .toTraceString();
            equal(q.queryText, select + 'WHERE ((uid = me()) OR (uid IN (SELECT uid2 FROM friend WHERE (uid1 = me()))))', 'Queryable In statement');

            try {
                var q = context.Users
                .where(function (u) { return u.uid == this.me || u.uid in this.friends; }, { me: $data.Facebook.FQLCommands.me, friends: 132465 })
                .toTraceString();
                equal(q.queryText, undefined, 'invalid in value not failed');

            } catch (e) {
                ok(e, 'In statement error');
            }

            q = context.Users.where(function (u) { return u.username.contains('hello'); }).toTraceString();
            equal(q.queryText, select + "WHERE (strpos(username, 'hello') >= 0)", 'contains statement');

            q = context.Users.where(function (u) { return u.username.startsWith('hello'); }).toTraceString();
            equal(q.queryText, select + "WHERE (strpos(username, 'hello') = 0)", 'startWith statement');

            q = context.Users.where(function (u) { return u.username.strpos('hello') == 5; }).toTraceString();
            equal(q.queryText, select + "WHERE ((strpos(username, 'hello')) = 5)", 'strpos statement');

            q = context.Users.where(function (u) { return u.username.strlen() == 5; }).toTraceString();
            equal(q.queryText, select + "WHERE ((strlen(username)) = 5)", 'strlen statement');

            q = context.Users.where(function (u) { return u.username.substr(1, 5) == 'hello'; }).toTraceString();
            equal(q.queryText, select + "WHERE ((substr(username, 1, 5)) = 'hello')", 'strlen statement');

            q = context.MyFriends.filter(function (f) { return f.name.contains('Viktor') }).toTraceString();
            equal(q.queryText, select + "WHERE ((uid IN (SELECT uid2 FROM friend WHERE (uid1 = me()))) AND (strpos(name, 'Viktor') >= 0))", 'contains statement');

            q = context.MyFriends.filter(function (f) { return f.name.startsWith('Viktor') }).toTraceString();
            equal(q.queryText, select + "WHERE ((uid IN (SELECT uid2 FROM friend WHERE (uid1 = me()))) AND (strpos(name, 'Viktor') = 0))", 'startsWith statement');

            q = context.MyFriends.filter(function (f) { return f.name.strpos('Viktor') > 0 }).toTraceString();
            equal(q.queryText, select + "WHERE ((uid IN (SELECT uid2 FROM friend WHERE (uid1 = me()))) AND ((strpos(name, 'Viktor')) > 0))", 'strpos statement');

            q = context.MyFriends.filter(function (f) { return f.name.strlen() > 12 }).toTraceString();
            equal(q.queryText, select + "WHERE ((uid IN (SELECT uid2 FROM friend WHERE (uid1 = me()))) AND ((strlen(name)) > 12))", 'strlen statement');

            q = context.MyFriends.filter(function (f) { return f.name.substr(6, 4) == 'Aron' }).toTraceString();
            equal(q.queryText, select + "WHERE ((uid IN (SELECT uid2 FROM friend WHERE (uid1 = me()))) AND ((substr(name, 6, 4)) = 'Aron'))", 'substr statement');


        });

        test("fbContextTest - query - live", 14, function () {
            stop(6);

            context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 123465798 }).toArray(function (Users) {
                start(1);
                equal(Users.length, 0, 'result count');
            });

            context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 100002031282054 }).toArray(function (Users) {
                start(1);
                equal(Users.length, 1, 'result count');
                equal(Users[0] instanceof $data.Facebook.types.FbUser, true, 'result item type');

                equal(typeof Users[0].uid, 'number', 'field type');
                equal(typeof Users[0].name, 'string', 'field type');
                equal(typeof Users[0].about_me, 'undefined', 'field type - Anonymous request');
            });

            context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 100002031282054 })
            .orderBy(function (u) { return u.uid })
            .take(1)
            .skip(0)
            .toArray(function (Users) {
                start(1);
                equal(Users.length, 1, 'result count');
                equal(Users[0] instanceof $data.Facebook.types.FbUser, true, 'result item type');
            });

            context.Users.filter(function (f) { return f.uid in this.ids; }, { ids: [100002031282054, 533879612, 1840706141] })
            .orderBy(function (o) { return o.first_name; }).take(2).skip(2).toArray(function (Users) {
                start(1);
                equal(Users.length, 1, 'result count');
                equal(Users[0].uid, 100002031282054, 'incorrect user id');
            });

            context.Users.filter(function (f) { return f.uid == '100002' + '031282054' || (f.uid == 3 && f.uid == 4); })
            .orderBy(function (o) { return o.uid; }).take(30).skip(0)
            .toArray(function (Users) {
                start(1);
                equal(Users.length, 1, 'result count');
                equal(Users[0].uid, 100002031282054, 'incorrect user id');
            });

            context.Users.filter(function (f) { return f.uid == 100002031282053 + 1 || (f.uid == 3 && f.uid == 4); })
            .orderBy(function (o) { return o.uid; }).take(30).skip(0)
            .toArray(function (Users) {
                start(1);
                equal(Users.length, 1, 'result count');
                equal(Users[0].uid, 100002031282054, 'incorrect user id');
            });


        });

        test("fbContextTest - map", 15, function () {
            var q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).select(function (u) { return u.name; }).toTraceString();
            equal(q.queryText, "SELECT name FROM user WHERE (uid = 111)", 'Simple select string');

            var q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).select(function (u) { return { uid: u.uid, name: u.name }; }).toTraceString();
            equal(q.queryText, "SELECT uid, name FROM user WHERE (uid = 111)", 'Simple select string');

            stop(3);
            context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 100002031282054 }).select(function (u) { return u.name; }).toArray(function (result) {
                start(1);
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
                equal(result[0], 'Viktor Borza', "result item value");
            });

            context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 100002031282054 }).select(function (u) { return { uid: u.uid, name: u.name }; }).toArray(function (result) {
                start(1);
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
                equal(result[0].uid, 100002031282054, "result item value");
                equal(result[0].name, 'Viktor Borza', "result item value");
            });

            context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 100002031282054 })
            .select(function (u) { return { x: { sex: u.sex, name: u.name } }; }).toArray(function (result) {
                start(1);
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].x.sex, "male", "gender value");
                equal(result[0].x.name, 'Viktor Borza', "result item value");
            });
        });

        test("fbContextTest - map - complex", 11, function () {
            var q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).select(function (u) { return { name: u.name }; }).toTraceString();
            equal(q.queryText, "SELECT name FROM user WHERE (uid = 111)", 'Simple select string');

            var q = context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 111 }).select(function (u) { return { uid: u.uid, a: { name: u.name } }; }).toTraceString();
            equal(q.queryText, "SELECT uid, name FROM user WHERE (uid = 111)", 'Simple select string');

            stop(1);
            context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 100002031282054 }).select(function (u) { return { name: u.name }; }).toArray(function (result) {
                start(1);
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
                equal(result[0].name, 'Viktor Borza', "result item value");
            });

            stop(1);
            context.Users.where(function (u) { return u.uid == this.id1; }, { id1: 100002031282054 }).select(function (u) { return { uid: u.uid, a: { name: u.name } }; }).toArray(function (result) {
                start(1);
                equal(result instanceof Array, true, "result is array");
                ok(result.length > 0, "result length");
                equal(result[0].getType, undefined, "Anonymous result");
                equal(result[0].uid, 100002031282054, "result item value");
                equal(result[0].a.name, 'Viktor Borza', "result item value");
            });
        });

        test("fbContextTest - query FB pages", 6, function () {
            try {
                context.Pages.toTraceString();
            } catch (e) {
                ok(e, 'filter is required in fb queries');
            }

            var select = 'SELECT page_id, name, username, description, categories, is_community_page, pic_small, pic_big, pic_square, pic, pic_large, pic_cover, fan_count, type, website, has_added_app, general_info, can_post, checkins, is_published, founded, company_overview, mission, products, location, parking, hours, pharma_safety_info, public_transit, attire, payment_options, culinary_team, general_manager, price_range, restaurant_services, restaurant_specialties, phone, release_date, genre, starring, screenplay_by, directed_by, produced_by, studio, awards, plot_outline, season, network, schedule, written_by, band_members, hometown, current_location, record_label, booking_agent, press_contact, artists_we_like, influences, band_interests, bio, affiliation, birthday, personal_info, personal_interests, built, features, mpg FROM page ';
            var q = context.Pages.where(function (p) { return p.name == this.name; }, { name: "JayData" }).toTraceString();
            equal(q.queryText, select + "WHERE (name = 'JayData')", 'Simple Page selection by name');

            stop(1);

            context.Pages.filter(function (p) { return p.name == 'JayData'; })
            .toArray({
                success: function (Pages) {
                    start(1);
                    equal(Pages.length, 1, 'result count');
                    equal(Pages[0].page_id, 315494325176794, 'page identity');
                    equal(Pages[0].type, "SOFTWARE", "page category length");
                    equal(Pages[0].pic_cover.cover_id, 342871709105722, "pic cover object length");
                },
                error: function (e) {
                    ok(false, 'Error: ' + e);
                    start();
                }
            });

        });
    });
});