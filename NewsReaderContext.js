// generated file
$data.Class.define("$news.Types.Category", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    Title: { type: "string" },
    Articles: { type: "Array", elementType: "$news.Types.Article", inverseProperty: "Category" }
}, null);
$data.Class.define("$news.Types.Article", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    RowVersion: { type: $data.Blob, concurrencyMode: $data.ConcurrencyMode.Fixed },
    Title: { type: "string" },
    Lead: { type: "string" },
    Body: { type: "string" },
    CreateDate: { type: "datetime" },
    Thumbnail_LowRes: { type: "blob" },
    Thumbnail_HighRes: { type: "blob" },
    Category: { type: "$news.Types.Category", inverseProperty: "Articles" },
    Tags: { type: "Array", elementType: "$news.Types.TagConnection", inverseProperty: "Article" },
    Author: { type: "$news.Types.User", inverseProperty: "Articles" },
    Reviewer: { type: "$news.Types.User", inverseProperty: "ReviewedArticles" }
}, null);
$data.Class.define("$news.Types.TagConnection", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    Article: { type: "$news.Types.Article", inverseProperty: "Tags" },
    Tag: { type: "$news.Types.Tag", inverseProperty: "Articles" }
}, null);
$data.Class.define("$news.Types.Tag", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    Title: { type: "string" },
    Articles: { type: "Array", elementType: "$news.Types.TagConnection", inverseProperty: "Tag" }
}, null);
$data.Class.define("$news.Types.User", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    LoginName: { type: "string" },
    Email: { type: "string" },
    Articles: { type: "Array", elementType: "$news.Types.Article", inverseProperty: "Author" },
    ReviewedArticles: { type: "Array", elementType: "$news.Types.Article", inverseProperty: "Reviewer" },
    Profile: { type: "$news.Types.UserProfile", inverseProperty: "User" }
    /*Children: { type: 'Array', elementType: '$news.Types.User', inverseProperty: "Parent" },
    Parent: { type: '$news.Types.User' }*/
}, null);
$data.Class.define("$news.Types.UserProfile", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    FullName: { type: "string" },
    Bio: { type: "string" },
    Avatar: { type: "blob" },
    Location: { type: "$news.Types.Location" },
    Birthday: { type: "date" },
    User: { type: "$news.Types.User", inverseProperty: "Profile", required: true }
}, null);
$data.Class.define("$news.Types.Location", $data.Entity, null, {
    Address: { type: "string" },
    City: { type: "string" },
    Zip: { type: "int" },
    Country: { type: "string" }
}, null);
$data.Class.define("$news.Types.TestItem", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    i0: { type: "int" },
    b0: { type: "boolean" },
    s0: { type: "string" },
    blob: { type: "blob" },
    n0: { type: "number" },
    d0: { type: "date" },
    Tags: { type: 'Array', elementType: '$news.Types.Tag', inverseProperty: '$$unbound' },
    User: { type: '$news.Types.User', inverseProperty: '$$unbound' }
}, null);


$data.Class.define("$news.Types.TestItemGuid", $data.Entity, null, {
    Id: { type: "guid", key: true },
    i0: { type: "int" },
    b0: { type: "boolean" },
    s0: { type: "string" },
    Group: { type: '$news.Types.TestItemGroup', inverseProperty: 'Items' }
}, null);
$data.Class.define("$news.Types.TestItemGroup", $data.Entity, null, {
    Id: { type: "guid", key: true },
    Name: { type: "string" },
    Items: { type: 'Array', elementType: '$news.Types.TestItemGuid', inverseProperty: 'Group' }
}, null);


$data.Class.define("$news.Types.NewsContext", $data.EntityContext, null, {
    Categories: { type: $data.EntitySet, elementType: $news.Types.Category, indices: [{ name: 'i1', keys: ['Title'], unique: false }] },
    Articles: { type: $data.EntitySet, elementType: $news.Types.Article },
    TagConnections: { type: $data.EntitySet, elementType: $news.Types.TagConnection },
    Tags: { type: $data.EntitySet, elementType: $news.Types.Tag },
    Users: { type: $data.EntitySet, elementType: $news.Types.User, indices: [{ name: 'i1', keys: ['LoginName'], unique: true }] },
    UserProfiles: { type: $data.EntitySet, elementType: $news.Types.UserProfile, indices: [{ name: 'i1', keys: [{ fieldName: 'FullName', order: 'DESC' }, { fieldName: 'Birthday', order: 'ASC' }], unique: false }, { name: 'i2', keys: [{ fieldName: 'Birthday', order: 'DESC' }], unique: false }] },
    TestTable: { type: $data.EntitySet, elementType: $news.Types.TestItem },

    TestTable2: { type: $data.EntitySet, elementType: $news.Types.TestItemGuid },
    TestItemGroups: { type: $data.EntitySet, elementType: $news.Types.TestItemGroup },

    /*
    PrefilteredLocation: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredLocation', returnType: $news.Types.Location, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredLocations: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredLocations', returnType: $data.Queryable, elementType: '$news.Types.Location', params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticlesCount: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticlesCount', returnType: $data.Integer, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticlesId: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticlesId', returnType: '$data.Queryable', elementType: $data.Integer, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticles: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticles', returnType: '$data.Queryable', elementType: '$news.Types.Article', params: [{ minId: '$data.Integer' }, { startsWith: '$data.String' }] }),
    PrefilteredArticleList: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticleList', returnType: $data.Queryable, elementType: $news.Types.Article, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticle: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticle', returnType: $news.Types.Article, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    CreateCategory: $data.EntityContext.generateServiceOperation({ serviceName: 'CreateCategory', returnType: null, params: [{ title: $data.String }], method: 'POST' }),
    GetCollection: $data.EntityContext.generateServiceOperation({ serviceName: 'GetCollection', returnType: $data.Queryable, elementType: $data.Integer, params: [] })
    */
    PrefilteredLocation: { type: $data.ServiceOperation, returnType: $news.Types.Location, params: [{ name: 'minId', type: $data.Integer }, { name: 'startsWith', type: $data.String }] },
    PrefilteredLocations: { type: $data.ServiceOperation, returnType: $data.Queryable, elementType: '$news.Types.Location', params: [{ name: 'minId', type: $data.Integer }, { name: 'startsWith', type: $data.String }] },
    PrefilteredArticlesCount: { type: $data.ServiceOperation, returnType: $data.Integer, params: [{ name: 'minId', type: $data.Integer }, { name: 'startsWith', type: $data.String }] },
    PrefilteredArticlesId: { type: $data.ServiceOperation, returnType: '$data.Queryable', elementType: $data.Integer, params: [{ name: 'minId', type: $data.Integer }, { name: 'startsWith', type: $data.String }] },
    PrefilteredArticles: { type: $data.ServiceOperation, returnType: '$data.Queryable', elementType: '$news.Types.Article', params: [{ name: 'minId', type: $data.Integer }, { name: 'startsWith', type: $data.String }] },
    PrefilteredArticleList: { type: $data.ServiceOperation, returnType: $data.Queryable, elementType: $news.Types.Article, params: [{ name: 'minId', type: $data.Integer }, { name: 'startsWith', type: $data.String }] },
    PrefilteredArticle: { type: $data.ServiceOperation, returnType: $news.Types.Article, params: [{ name: 'minId', type: $data.Integer }, { name: 'startsWith', type: $data.String }] },
    CreateCategory: { type: $data.ServiceOperation, returnType: null, params: [{ name: 'title', type: $data.String }], method: 'POST' },
    GetCollection: { type: $data.ServiceOperation, returnType: $data.Queryable, elementType: $data.Integer, params: [] }

}, null);



$news.Types.NewsContext.generateTestData = function (context, callBack) {

    var usr1 = new $news.Types.User({ LoginName: "Usr1", Email: "usr1@company.com", Profile: new $news.Types.UserProfile({ FullName: "Full Name", Bio: "Bio1", Birthday: new Date(Date.parse("1975/01/01")), Location: new $news.Types.Location({ Zip: 2840, City: 'City1', Address: 'Address6', Country: 'Country1' }) }) });
    var usr2 = new $news.Types.User({ LoginName: "Usr2", Email: "usr2@company.com", Profile: new $news.Types.UserProfile({ FullName: "Full Name", Bio: "Bio2", Birthday: new Date(Date.parse("1976/02/01")), Location: new $news.Types.Location({ Zip: 1117, City: 'City2', Address: 'Address7', Country: 'Country2' }) }) });
    var usr3 = new $news.Types.User({ LoginName: "Usr3", Email: "usr3@company.com", Profile: new $news.Types.UserProfile({ FullName: "Full Name1", Bio: "Bio3", Birthday: new Date(Date.parse("1977/03/01")), Location: new $news.Types.Location({ Zip: 1115, City: 'City3', Address: 'Address8', Country: 'Country3' }) }) });
    var usr4 = new $news.Types.User({ LoginName: "Usr4", Email: "usr4@company.com", Profile: new $news.Types.UserProfile({ FullName: "Full Name1", Bio: "Bio4", Birthday: new Date(Date.parse("1978/04/01")), Location: new $news.Types.Location({ Zip: 1211, City: 'City4', Address: 'Address9', Country: 'Country4' }) }) });
    var usr5 = new $news.Types.User({ LoginName: "Usr5", Email: "usr5@company.com", Profile: new $news.Types.UserProfile({ FullName: "Full Name2", Bio: "Bio5", Birthday: new Date(Date.parse("1979/05/01")), Location: new $news.Types.Location({ Zip: 3451, City: 'City5', Address: 'Address0', Country: 'Country5' }) }) });
    var usr6 = new $news.Types.User({ LoginName: "StartsWithTest", Email: "swt@company.com", Profile: new $news.Types.UserProfile({ FullName: "Starts With Test", Bio: "Bio6", Birthday: new Date(Date.parse("1980/06/01")), Location: new $news.Types.Location({ Zip: 8475, City: 'City6', Address: 'Address7', Country: 'Country8' }) }) });
    var cat1 = new $news.Types.Category({ Title: "Sport" });
    var cat2 = new $news.Types.Category({ Title: "World" });
    var cat3 = new $news.Types.Category({ Title: "Politics" });
    var cat4 = new $news.Types.Category({ Title: "Tech" });
    var cat5 = new $news.Types.Category({ Title: "Health" });
    var tag1 = new $news.Types.Tag({ Title: "Tag1" });
    var tag2 = new $news.Types.Tag({ Title: "Tag2" });
    var tag3 = new $news.Types.Tag({ Title: "Tag3" });
    var tag4 = new $news.Types.Tag({ Title: "Tag4" });
    var tag5 = new $news.Types.Tag({ Title: "Tag5" });
    context.Tags.add(tag4);
    context.Tags.add(tag5);

    context.Articles.add(new $news.Types.Article({ Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date(), Category: cat1, Author: usr1, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date(), Category: cat1, Author: usr2, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date(), Category: cat1, Author: usr3, Reviewer: usr4, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date(), Category: cat1, Author: usr4, Reviewer: usr3, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date(), Category: cat1, Author: usr5, Reviewer: usr2, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));

    context.Articles.add(new $news.Types.Article({ Title: "Article21", Lead: "Lead21", Body: "Body21", CreateDate: new Date(), Category: cat2, Author: usr1, Reviewer: usr1, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article22", Lead: "Lead22", Body: "Body22", CreateDate: new Date(), Category: cat2, Author: usr2, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article23", Lead: "Lead23", Body: "Body23", CreateDate: new Date(), Category: cat2, Author: usr3, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article24", Lead: "Lead24", Body: "Body24", CreateDate: new Date(), Category: cat2, Author: usr4, Reviewer: usr4, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article25", Lead: "Lead25", Body: "Body25", CreateDate: new Date(), Category: cat2, Author: usr5, Reviewer: usr3, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));

    context.Articles.add(new $news.Types.Article({ Title: "Article31", Lead: "Lead31", Body: "Body31", CreateDate: new Date(), Category: cat3, Author: usr1, Reviewer: usr2, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article32", Lead: "Lead32", Body: "Body32", CreateDate: new Date(), Category: cat3, Author: usr2, Reviewer: usr1, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article33", Lead: "Lead33", Body: "Body33", CreateDate: new Date(), Category: cat3, Author: usr3, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article34", Lead: "Lead34", Body: "Body34", CreateDate: new Date(), Category: cat3, Author: usr4, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article35", Lead: "Lead35", Body: "Body35", CreateDate: new Date(), Category: cat3, Author: usr5, Reviewer: usr4, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));

    context.Articles.add(new $news.Types.Article({ Title: "Article41", Lead: "Lead41", Body: "Body41", CreateDate: new Date(), Category: cat4, Author: usr1, Reviewer: usr3, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article42", Lead: "Lead42", Body: "Body42", CreateDate: new Date(), Category: cat4, Author: usr2, Reviewer: usr2, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article43", Lead: "Lead43", Body: "Body43", CreateDate: new Date(), Category: cat4, Author: usr3, Reviewer: usr1, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article44", Lead: "Lead44", Body: "Body44", CreateDate: new Date(), Category: cat4, Author: usr4, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article45", Lead: "Lead45", Body: "Body45", CreateDate: new Date(), Category: cat4, Author: usr5, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));

    context.Articles.add(new $news.Types.Article({ Title: "Article51", Lead: "Lead51", Body: "Body51", CreateDate: new Date(), Category: cat5, Author: usr1, Reviewer: usr4, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article52", Lead: "Lead52", Body: "Body52", CreateDate: new Date(), Category: cat5, Author: usr2, Reviewer: usr3, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article53", Lead: "Lead53", Body: "Body53", CreateDate: new Date(), Category: cat5, Author: usr3, Reviewer: usr2, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article54", Lead: "Lead54", Body: "Body54", CreateDate: new Date(), Category: cat5, Author: usr4, Reviewer: usr1, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({ Title: "Article55", Lead: "Lead55", Body: "Body55", CreateDate: new Date(), Category: cat5, Author: usr5, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));

    context.Articles.add(new $news.Types.Article({ Title: "Article65", Lead: "Lead65", Body: "Body65", CreateDate: new Date(), Category: cat3, Author: usr6, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag1 })] }));

    //var categoryName = ["Top news", "Sport", "World", "Politics", "Tech", "Health"];
    //for (var i = 0; i < 6; i++) {
    //    var category = new $news.Types.Category({ Title: categoryName[i], Articles: [] });
    //    $news.context.Categories.add(category);
    //    for (j = 0; j < 10; j++) {
    //        var article = new $news.Types.Article({ Title: "Article_" + i + "_" + j, CreateDate: new Date(), Body: 'A Lorem Ipsum részleteinek sok változata elérhetõ, de a legtöbbet megváltoztatták egy kis humorral és véletlenszerûen kiválasztott szavakkal, amik kicsit sem teszik értelmessé. Ha használni készülsz a Lorem Ipsumot, biztosnak kell lenned abban, hogy semmi kínos sincs elrejtve a szöveg közepén. Az összes internetes Lorem Ipsum készítõ igyekszik elõre beállított részleteket ismételni a szükséges mennyiségben, ezzel téve az internet egyetlen igazi Lorem Ipsum generátorává ezt az oldalt. Az oldal körülbelül 200 latin szót használ, egy maroknyi modell-mondatszerkezettel így téve a Lorem Ipsumot elfogadhatóvá. Továbbá az elkészült Lorem Ipsum humortól, ismétlõdéstõl vagy értelmetlen szavaktól mentes.' });
    //        category.Articles.push(article);
    //    }
    //}
    //console.log("Original");
    //console.log(Date());
    context.saveChanges({
        success: function (count) {
            console.log("Success upload testdb for: " + count + " items");
            if (callBack) {
                callBack(count);
            }
            //    console.log(Date());
            //    for (var t = 0; t < 50000; t++) {
            //        $news.context.Users.add(new $news.Types.User({ LoginName: "Usr5", Email: "usr5@company.com", Profile: null }));
            //    }
            //    console.log(t + " users");
            //    console.log("START: " + Date());
            //    $news.context.saveChanges(function () {
            //        console.log("END: " + Date());
            //    });
        },
        error: function () {
            console.log("Generate test data ERROR: ", arguments);
        }
    });
}