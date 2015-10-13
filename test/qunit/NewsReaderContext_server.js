// generated file
$data.Class.define("$news.Types.Category", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    Title: { type: "string" },
    /*Articles: { type: "Array", elementType: "$news.Types.Article", inverseProperty: "Category" }*/
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
    /*Category: { type: "$news.Types.Category", inverseProperty: "Articles" },
    Tags: { type: "Array", elementType: "$news.Types.TagConnection", inverseProperty: "Article" },
    Author: { type: "$news.Types.User", inverseProperty: "Articles" },
    Reviewer: { type: "$news.Types.User", inverseProperty: "ReviewedArticles" }*/
}, null);
$data.Class.define("$news.Types.TagConnection", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    /*Article: { type: "$news.Types.Article", inverseProperty: "Tags" },
    Tag: { type: "$news.Types.Tag", inverseProperty: "Articles" }*/
}, null);
$data.Class.define("$news.Types.Tag", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    Title: { type: "string" },
    /*Articles: { type: "Array", elementType: "$news.Types.TagConnection", inverseProperty: "Tag" }*/
}, null);
$data.Class.define("$news.Types.User", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    LoginName: { type: "string" },
    Email: { type: "string" },
    /*Articles: { type: "Array", elementType: "$news.Types.Article", inverseProperty: "Author" },
    ReviewedArticles: { type: "Array", elementType: "$news.Types.Article", inverseProperty: "Reviewer" },
    Profile: { type: "$news.Types.UserProfile", inverseProperty: "User" }
    Children: { type: 'Array', elementType: '$news.Types.User', inverseProperty: "Parent" },
    Parent: { type: '$news.Types.User' }*/
}, null);
$data.Class.define("$news.Types.UserProfile", $data.Entity, null, {
    Id: { type: "int", key: true, computed: true },
    FullName: { type: "string" },
    Bio: { type: "string" },
    Avatar: { type: "blob" },
    /*Location: { type: "$news.Types.Location" },*/
    Birthday: { type: "date" },
    /*User: { type: "$news.Types.User", inverseProperty: "Profile", required: true }*/
}, null);
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
    /*Tags: { type: 'Array', elementType: '$news.Types.Tag', inverseProperty: '$$unbound' },
    User: { type: '$news.Types.User', inverseProperty: '$$unbound' }*/
}, null);

$data.Class.defineEx("$news.Types.NewsContext", [$data.EntityContext,$data.ServiceBase], null, {
    Categories: { type: $data.EntitySet, elementType: $news.Types.Category },
    Articles: { type: $data.EntitySet, elementType: $news.Types.Article },
    TagConnections: { type: $data.EntitySet, elementType: $news.Types.TagConnection },
    Tags: { type: $data.EntitySet, elementType: $news.Types.Tag },
    Users: { type: $data.EntitySet, elementType: $news.Types.User },
    UserProfiles: { type: $data.EntitySet, elementType: $news.Types.UserProfile },
    TestTable: { type: $data.EntitySet, elementType: $news.Types.TestItem }

    /*PrefilteredLocation: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredLocation', returnType: $news.Types.Location, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredLocations: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredLocations', returnType: $data.Queryable, elementType: '$news.Types.Location', params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticlesCount: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticlesCount', returnType: $data.Integer, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticlesId: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticlesId', returnType: '$data.Queryable', elementType: $data.Integer, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticles: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticles', returnType: '$data.Queryable', elementType: '$news.Types.Article', params: [{ minId: '$data.Integer' }, { startsWith: '$data.String' }] }),
    PrefilteredArticleList: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticleList', returnType: $data.Queryable, elementType: $news.Types.Article, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    PrefilteredArticle: $data.EntityContext.generateServiceOperation({ serviceName: 'PrefilteredArticle', returnType: $news.Types.Article, params: [{ minId: $data.Integer }, { startsWith: $data.String }] }),
    CreateCategory: $data.EntityContext.generateServiceOperation({ serviceName: 'CreateCategory', returnType: null, params: [{ title: $data.String }, { subTitle: $data.String }] }),
    GetCollection: $data.EntityContext.generateServiceOperation({ serviceName: 'GetCollection', returnType: $data.Queryable, elementType: $data.Integer, params: [] })*/

});
exports = $news.Types.NewsContext;

