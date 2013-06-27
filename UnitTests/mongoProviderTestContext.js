$data.Entity.extend('$test.Item', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' },
    CreatedAt: { type: 'datetime' },
    ForeignKey: { type: 'id' }
});

$data.Entity.extend('$test.ConvertItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'string', converter: {
            mongoDB: {
                fromDb: function(value, memberDefinition, context, type){
                    return 'Rank #' + value;
                }
            }
        }
    }
});

$data.Entity.extend('$test.ComplexValue', {
    Value: { type: 'string' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.MoreComplexValue', {
    Value: { type: 'string' },
    Rank: { type: 'int' },
    Child: { type: '$test.ComplexValue' }
});

$data.Entity.extend('$test.ComplexItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: '$test.ComplexValue' }
});

$data.Entity.extend('$test.MoreComplexItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: '$test.MoreComplexValue' },
    ValueChild: { type: '$test.ComplexValue' }
});

$data.Entity.extend('$test.ObjectItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'Object' }
});

$data.Entity.extend('$test.ArrayItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Values: { type: 'Array', elementType: 'string' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.ArrayID', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Values: { type: 'Array', elementType: 'id' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.ArrayComplexItem', {
    Id: { type: 'string', computed: true, key: true },
    Key: { type: 'string' },
    Values: { type: 'Array', elementType: '$test.ComplexValue' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.ArrayMoreComplexItem', {
    Id: { type: 'string', computed: true, key: true },
    Key: { type: 'string' },
    Values: { type: 'Array', elementType: '$test.MoreComplexValue' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.ArrayArrayItem', {
    Id: { type: 'string', computed: true, key: true },
    Key: { type: 'string' },
    Values: { type: 'Array', elementType: 'Array' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.CappedItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.CustomKey', {
    Id: { type: 'string', key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' }
});

$data.Entity.extend('$test.NavA', {
    Id: { type: 'id', computed: true, key: true },
    NavB: { type: '$test.NavB', inverseProperty: 'NavA' }
});

$data.Entity.extend('$test.NavB', {
    Id: { type: 'id', computed: true, key: true },
    NavA: { type: '$test.NavA', inverseProperty: 'NavB', required: true }
});

$data.Entity.extend('mydatabase.Order', {
    id: { key: true, nullable: false, computed: true, type: 'id' },
    Customer: { type: 'mydatabase.Customer', inverseProperty: 'Orders', required: true },
    Amount: { nullable: true, type: 'int' }
});

$data.Entity.extend('mydatabase.Customer', {
    id: { key: true, nullable: false, computed: true, type: 'id' },
    Orders: { type: Array, elementType: 'mydatabase.Order', inverseProperty: 'Customer', required: false },
    Name: { maxLength: 200, nullable: true, type: String }
});

$data.EntityContext.extend('$test.BaseContext', {
    Items: { type: $data.EntitySet, elementType: $test.Item },
    ConvertItems: { type: $data.EntitySet, elementType: $test.ConvertItem },
    ComplexItems: { type: $data.EntitySet, elementType: $test.ComplexItem },
    MoreComplexItems: { type: $data.EntitySet, elementType: $test.MoreComplexItem },
    ObjectItems: { type: $data.EntitySet, elementType: $test.ObjectItem },
    ArrayItems: { type: $data.EntitySet, elementType: $test.ArrayItem },
    ArrayIDs: { type: $data.EntitySet, elementType: $test.ArrayID },
    ArrayComplexItems: { type: $data.EntitySet, elementType: $test.ArrayComplexItem },
    ArrayMoreComplexItems: { type: $data.EntitySet, elementType: $test.ArrayMoreComplexItem },
    ArrayArrayItems: { type: $data.EntitySet, elementType: $test.ArrayArrayItem },
    CappedItems: { type: $data.EntitySet, elementType: $test.CappedItem, tableOptions: { capped: true, size: 10 * 1024, max: 10 } },
    CustomKeys: { type: $data.EntitySet, elementType: $test.CustomKey },
    NavAs: { type: $data.EntitySet, elementType: $test.NavA },
    NavBs: { type: $data.EntitySet, elementType: $test.NavB },
    Orders: { type: $data.EntitySet, elementType: mydatabase.Order },
    Customers: { type: $data.EntitySet, elementType: mydatabase.Customer }
});

seed = {
    categorySeed: 0,
    articleSeed: 0,
    tagConnectionSeed: 0,
    tagSeed: 0,
    userSeed: 0,
    userProfileSeed: 0,
    testItemSeed: 0
};

module.exports = exports = seed;

// generated file
$data.Class.define("$news.Types.Category", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    Title: { type: "string" },
    Articles: { type: "Array", elementType: "$news.Types.Article", inverseProperty: "Category" }
}, null);
$news.Types.Category.addEventListener('beforeCreate', function(sender, item){
    item.Id = ++seed.categorySeed;
});
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
$news.Types.Article.addEventListener('beforeCreate', function(sender, item){
    item.Id = ++seed.articleSeed;
});
$data.Class.define("$news.Types.TagConnection", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    Article: { type: "$news.Types.Article", inverseProperty: "Tags" },
    Tag: { type: "$news.Types.Tag", inverseProperty: "Articles" }
}, null);
$news.Types.TagConnection.addEventListener('beforeCreate', function(sender, item){
    item.Id = ++seed.tagConnectionSeed;
});
$data.Class.define("$news.Types.Tag", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    Title: { type: "string" },
    Articles: { type: "Array", elementType: "$news.Types.TagConnection", inverseProperty: "Tag" }
}, null);
$news.Types.Tag.addEventListener('beforeCreate', function(sender, item){
    item.Id = ++seed.tagSeed;
});
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
$news.Types.User.addEventListener('beforeCreate', function(sender, item){
    item.Id = ++seed.userSeed;
});
$data.Class.define("$news.Types.UserProfile", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    FullName: { type: "string" },
    Bio: { type: "string" },
    Avatar: { type: "blob" },
    Location: { type: "$news.Types.Location" },
    Birthday: { type: "date" },
    User: { type: "$news.Types.User", inverseProperty: "Profile", required: true }
}, null);
$news.Types.UserProfile.addEventListener('beforeCreate', function(sender, item){
    item.Id = ++seed.userProfileSeed;
});
$data.Class.define("$news.Types.Location", $data.Entity, null, {
    Address: { type: "string" },
    City: { type: "string" },
    Zip: { type: "int" },
    Country: { type: "string" }
}, null);
$data.Class.define("$news.Types.TestItem", $data.Entity, null, {
    Id: { type: "int", key: true },
    i0: { type: "int" },
    b0: { type: "boolean" },
    s0: { type: "string" },
    blob: { type: "blob" },
    n0: { type: "number" },
    d0: { type: "date" },
    g0: { type: "guid" },
    Tags: { type: 'Array', elementType: '$news.Types.Tag', inverseProperty: '$$unbound' },
    User: { type: '$news.Types.User', inverseProperty: '$$unbound' }
}, null);
$news.Types.TestItem.addEventListener('beforeCreate', function(sender, item){
    //item.Id = ++seed.testItemSeed;
    if (typeof item.Id != 'number') item.Id = 0;
});

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
    Categories: { type: $data.EntitySet, elementType: $news.Types.Category },
    Articles: { type: $data.EntitySet, elementType: $news.Types.Article },
    TagConnections: { type: $data.EntitySet, elementType: $news.Types.TagConnection },
    Tags: { type: $data.EntitySet, elementType: $news.Types.Tag },
    Users: { type: $data.EntitySet, elementType: $news.Types.User },
    UserProfiles: { type: $data.EntitySet, elementType: $news.Types.UserProfile },
    TestTable: { type: $data.EntitySet, elementType: $news.Types.TestItem },

    TestTable2: { type: $data.EntitySet, elementType: $news.Types.TestItemGuid },
    TestItemGroups: { type: $data.EntitySet, elementType: $news.Types.TestItemGroup },
    
    PrefilteredLocation: function(minId, startsWith){
        ///<returns type="$news.Types.Location"/>
        ///<param name="minId" type="int"/>
        ///<param name="startsWith" type="string"/>
        return function(success, error){
            this.Articles
                .map(function(it){ return it.Reviewer.Profile.Location; })
                .first(function(it){ return it.Id > this.minId && it.Title.startsWith(this.startsWith) }, { minId: minId, startsWith: startsWith }, function(location){
                    success(location);
                }).fail(function(err){
                    error(err);
                });
        };
    },
    PrefilteredLocations: function(minId, startsWith){
        ///<returns type="Array" elementType="$news.Types.Location"/>
        ///<param name="minId" type="int"/>
        ///<param name="startsWith" type="string"/>
        return function(success, error){
            this.Articles
                .map(function(it){ return it.Reviewer.Profile.Location; })
                .filter(function(it){ return it.Id > this.minId && it.Title.startsWith(this.startsWith) }, { minId: minId, startsWith: startsWith })
                .toArray(function(locations){
                    success(locations);
                }).fail(function(err){
                    error(err);
                });
        };
    },
    PrefilteredArticlesCount: function(minId, startsWith){
        ///<returns type="int"/>
        ///<param name="minId" type="int"/>
        ///<param name="startsWith" type="string"/>
        return function(success, error){
            this.Articles
                .filter(function(it){ return it.Id > this.minId && it.Title.startsWith(this.startsWith) }, { minId: minId, startsWith: startsWith })
                .length(function(cnt){
                    success(cnt);
                }).fail(function(err){
                    error(err);
                });
        };
    },
    PrefilteredArticlesId: function(minId, startsWith){
        ///<returns type="Array" elementType="int"/>
        ///<param name="minId" type="int"/>
        ///<param name="startsWith" type="string"/>
        return function(success, error){
            this.Articles
                .filter(function(it){ return it.Id > this.minId && it.Title.startsWith(this.startsWith) }, { minId: minId, startsWith: startsWith })
                .map(function(it){ return it.Id; })
                .toArray(function(ids){
                    success(ids);
                }).fail(function(err){
                    error(err);
                });
        };
    },
    PrefilteredArticles: function(minId, startsWith){
        ///<returns type="$data.Queryable" elementType="$news.Types.Article"/>
        ///<param name="minId" type="int"/>
        ///<param name="startsWith" type="string"/>
        //return function(success, error){
        return this.Articles.filter(function(it){ return it.Id > this.minId && it.Title.startsWith(this.startsWith) }, { minId: minId, startsWith: startsWith });
                /*.toArray(function(articles){
                    success(articles);
                }).fail(function(err){
                    error(err);
                });
        };*/
    },
    PrefilteredArticleList: function(minId, startsWith){
        ///<returns type="Array" elementType="$news.Types.Article"/>
        ///<param name="minId" type="int"/>
        ///<param name="startsWith" type="string"/>
        return function(success, error){
            this.Articles
                .filter(function(it){ return it.Id > this.minId && it.Title.startsWith(this.startsWith) }, { minId: minId, startsWith: startsWith })
                .toArray(function(articles){
                    success(articles);
                }).fail(function(err){
                    error(err);
                });
        };
    },
    PrefilteredArticle: function(minId, startsWith){
        ///<returns type="$news.Types.Article"/>
        ///<param name="minId" type="int"/>
        ///<param name="startsWith" type="string"/>
        return function(success, error){
            this.Articles
                .first(function(it){ return it.Id > this.minId && it.Title.startsWith(this.startsWith) }, { minId: minId, startsWith: startsWith }, function(article){
                    success(article);
                }).fail(function(err){
                    error(err);
                });
        };
    }

    /*PrefilteredLocation: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredLocation', returnType: $news.Types.Location, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredLocations: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredLocations', returnType: $data.Queryable, elementType: '$news.Types.Location', params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticlesCount: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticlesCount', returnType: $data.Integer, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticlesId: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticlesId', returnType: '$data.Queryable', elementType: $data.Integer, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticles: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticles', returnType: '$data.Queryable', elementType: '$news.Types.Article', params: [{ minId: '$data.Integer' }, { startsWith: '$data.String' }] }),
    PrefilteredArticleList: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticleList', returnType: $data.Queryable, elementType: $news.Types.Article, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticle: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticle', returnType: $news.Types.Article, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    CreateCategory: $data.EntityContext.generateServiceOperation({ serviceName: 'CreateCategory', returnType: null, params: [{ title: $data.String }, { subTitle: $data.String }] }),
    GetCollection: $data.EntityContext.generateServiceOperation({ serviceName: 'GetCollection', returnType: $data.Queryable, elementType: $data.Integer, params: [] })*/

}, null);

$news.Types.NewsContext.generateTestData = function (context, callBack) {

    seed.categorySeed = 0;
    seed.articleSeed = 0;
    seed.tagConnectionSeed = 0;
    seed.tagSeed = 0;
    seed.userSeed = 0;
    seed.userProfileSeed = 0;
    seed.testItemSeed = 0;

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

    context.Articles.add(new $news.Types.Article({Title: "Article1", Lead: "Lead1", Body: "Body1", CreateDate: new Date(), Category: cat1, Author: usr1, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article2", Lead: "Lead2", Body: "Body2", CreateDate: new Date(), Category: cat1, Author: usr2, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article3", Lead: "Lead3", Body: "Body3", CreateDate: new Date(), Category: cat1, Author: usr3, Reviewer: usr4, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article4", Lead: "Lead4", Body: "Body4", CreateDate: new Date(), Category: cat1, Author: usr4, Reviewer: usr3, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article5", Lead: "Lead5", Body: "Body5", CreateDate: new Date(), Category: cat1, Author: usr5, Reviewer: usr2, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));

    context.Articles.add(new $news.Types.Article({Title: "Article21", Lead: "Lead21", Body: "Body21", CreateDate: new Date(), Category: cat2, Author: usr1, Reviewer: usr1, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article22", Lead: "Lead22", Body: "Body22", CreateDate: new Date(), Category: cat2, Author: usr2, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article23", Lead: "Lead23", Body: "Body23", CreateDate: new Date(), Category: cat2, Author: usr3, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article24", Lead: "Lead24", Body: "Body24", CreateDate: new Date(), Category: cat2, Author: usr4, Reviewer: usr4, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article25", Lead: "Lead25", Body: "Body25", CreateDate: new Date(), Category: cat2, Author: usr5, Reviewer: usr3, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));

    context.Articles.add(new $news.Types.Article({Title: "Article31", Lead: "Lead31", Body: "Body31", CreateDate: new Date(), Category: cat3, Author: usr1, Reviewer: usr2, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article32", Lead: "Lead32", Body: "Body32", CreateDate: new Date(), Category: cat3, Author: usr2, Reviewer: usr1, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article33", Lead: "Lead33", Body: "Body33", CreateDate: new Date(), Category: cat3, Author: usr3, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article34", Lead: "Lead34", Body: "Body34", CreateDate: new Date(), Category: cat3, Author: usr4, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article35", Lead: "Lead35", Body: "Body35", CreateDate: new Date(), Category: cat3, Author: usr5, Reviewer: usr4, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));

    context.Articles.add(new $news.Types.Article({Title: "Article41", Lead: "Lead41", Body: "Body41", CreateDate: new Date(), Category: cat4, Author: usr1, Reviewer: usr3, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article42", Lead: "Lead42", Body: "Body42", CreateDate: new Date(), Category: cat4, Author: usr2, Reviewer: usr2, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article43", Lead: "Lead43", Body: "Body43", CreateDate: new Date(), Category: cat4, Author: usr3, Reviewer: usr1, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article44", Lead: "Lead44", Body: "Body44", CreateDate: new Date(), Category: cat4, Author: usr4, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article45", Lead: "Lead45", Body: "Body45", CreateDate: new Date(), Category: cat4, Author: usr5, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));

    context.Articles.add(new $news.Types.Article({Title: "Article51", Lead: "Lead51", Body: "Body51", CreateDate: new Date(), Category: cat5, Author: usr1, Reviewer: usr4, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article52", Lead: "Lead52", Body: "Body52", CreateDate: new Date(), Category: cat5, Author: usr2, Reviewer: usr3, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article53", Lead: "Lead53", Body: "Body53", CreateDate: new Date(), Category: cat5, Author: usr3, Reviewer: usr2, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag3 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article54", Lead: "Lead54", Body: "Body54", CreateDate: new Date(), Category: cat5, Author: usr4, Reviewer: usr1, Tags: [new $news.Types.TagConnection({ Tag: tag3 }), new $news.Types.TagConnection({ Tag: tag1 })] }));
    context.Articles.add(new $news.Types.Article({Title: "Article55", Lead: "Lead55", Body: "Body55", CreateDate: new Date(), Category: cat5, Author: usr5, Reviewer: usr6, Tags: [new $news.Types.TagConnection({ Tag: tag1 }), new $news.Types.TagConnection({ Tag: tag2 })] }));

    context.Articles.add(new $news.Types.Article({Title: "Article65", Lead: "Lead65", Body: "Body65", CreateDate: new Date(), Category: cat3, Author: usr6, Reviewer: usr5, Tags: [new $news.Types.TagConnection({ Tag: tag2 }), new $news.Types.TagConnection({ Tag: tag1 })] }));

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
    context.saveChanges(function (count) {
        //console.log("Success upload testdb for: " + count + " items");
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
    });
};
