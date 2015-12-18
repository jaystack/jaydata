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
