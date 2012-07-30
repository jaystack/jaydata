var $data = require('jaydata');

$data.Class.define("$news.Types.Category", $data.Entity, null, {
    Id: { dataType: "int", key: true, computed: true },
    Title: { dataType: "string" },
    Articles: { dataType: "Array", elementType: "$news.Types.Article", inverseProperty: "Category" }
}, null);
$data.Class.define("$news.Types.Article", $data.Entity, null, {
    Id: { dataType: "int", key: true, computed: true },
    Title: { dataType: "string" },
    Lead: { dataType: "string" },
    Body: { dataType: "string" },
    CreateDate: { dataType: "datetime" },
    Thumbnail_LowRes: { dataType: "blob" },
    Thumbnail_HighRes: { dataType: "blob" },
    Category: { dataType: "$news.Types.Category", inverseProperty: 'Articles', required: true },
    Tags: { dataType: "Array", elementType: "$news.Types.TagConnection", inverseProperty: "Article" },
    Author: { dataType: "$news.Types.User", inverseProperty: 'Articles' }
}, null);
$data.Class.define("$news.Types.TagConnection", $data.Entity, null, {
    Id: { dataType: "int", key: true, computed: true },
    Article: { dataType: "$news.Types.Article", inverseProperty: 'Tags', required: true },
    Tag: { dataType: "$news.Types.Tag", inverseProperty: 'Articles', required: true }
}, null);
$data.Class.define("$news.Types.Tag", $data.Entity, null, {
    Id: { dataType: "int", key: true, computed: true },
    Title: { dataType: "string" },
    Articles: { dataType: "Array", elementType: "$news.Types.TagConnection", inverseProperty: "Tag" }
}, null);
$data.Class.define("$news.Types.User", $data.Entity, null, {
    Id: { dataType: "int", key: true, computed: true },
    LoginName: { dataType: "string" },
    Email: { dataType: "string" },
    Articles: { dataType: "Array", elementType: "$news.Types.Article", inverseProperty: "Author", required: true },
    Profile: { dataType: "$news.Types.UserProfile", inverseProperty: "User" }
}, null);
$data.Class.define("$news.Types.UserProfile", $data.Entity, null, {
    Id: { dataType: "int", key: true, computed: true },
    FullName: { dataType: "string" },
    Bio: { dataType: "string" },
    Avatar: { dataType: "blob" },
    Location: { dataType: "$news.Types.Location" },
    Birthday: { dataType: "date" },
    User: { dataType: "$news.Types.User", inverseProperty: 'Profile', required: true }
}, null);
$data.Class.define("$news.Types.Location", $data.Entity, null, {
    Address: { dataType: "string" },
    City: { dataType: "string" },
    Zip: { dataType: "int" },
    Country: { dataType: "string" }
}, null);

$data.Class.define("$news.Types.NewsContext", $data.EntityContext, null, {
    Categories: { dataType: $data.EntitySet, elementType: $news.Types.Category },
    Articles: { dataType: $data.EntitySet, elementType: $news.Types.Article },
    TagConnections: { dataType: $data.EntitySet, elementType: $news.Types.TagConnection },
    Tags: { dataType: $data.EntitySet, elementType: $news.Types.Tag },
    Users: { dataType: $data.EntitySet, elementType: $news.Types.User },
    UserProfiles: { dataType: $data.EntitySet, elementType: $news.Types.UserProfile }
}, null);

function rng(max) {
    return Math.floor(Math.random() * max);
}

function t(){
    return new Date().getTime();
}

function addTestData() {
    var targetArticleNr = parseInt(process.argv[2]) || 1000;
    var cycleSize = parseInt(process.argv[3]) || 1000;
    
    console.log('running NewsReader test\ntargetArticleNr=' + targetArticleNr + '\ncycleSize=' + cycleSize + '\n');
    
    var start = t();

    // Users
    var users = [];
    for (var i = 0; i < 100; i++) {
        var cUsr = new $news.Types.User({ LoginName: ("Usr" + i), Email: "usr" + i + "@company.com", Profile: new $news.Types.UserProfile({ FullName: "Full Name", Bio: "Bio" + i, Birthday: new Date(2000, 1, 1 - i), Location: new $news.Types.Location({}) }) });
        users.push(cUsr);
        $news.context.Users.add(cUsr);
    }
    var now = t();
    console.error('Users generated in ' + (now - start) + 'ms');
    start = now;
    
    // Categories
    var cats = [
        new $news.Types.Category({ Title: "Sport" }),
        new $news.Types.Category({ Title: "World" }),
        new $news.Types.Category({ Title: "Politics" }),
        new $news.Types.Category({ Title: "Tech" }),
        new $news.Types.Category({ Title: "Health" })
    ];
    for (var i = 0; i < cats.length; i++) {
        $news.context.Categories.add(cats[i]);
    }
    now = t();
    console.log('Categories generated in ' + (now - start) + 'ms');
    start = now;
    
    // Tags
    var tags = [];
    for (var i = 0; i < 50; i++) {
        var cTag = new $news.Types.Tag({ Title: "Tag" + i });
        tags.push(cTag);
        $news.context.Tags.add(cTag);
    }
    now = t();
    console.log('Tags generated in ' + (now - start) + 'ms');
    start = now;

    var acCount = 0;
    while (acCount * cycleSize <= targetArticleNr){
        if (acCount > 0){
            now = t();
            console.log('Items added (' + acCount * cycleSize + ') at ' + (now - start) + 'ms');
        }
        
        for (var i = 0; i < cycleSize; i++) {
            $news.context.Articles.add(new $news.Types.Article({
                Title: 'Article' + acCount + '_' + i,
                Lead: 'Lead' + acCount + '_' + i,
                Body: 'Body' + acCount + '_' + i,
                CreateDate: Date.now(),
                Category: cats[rng(cats.length)],
                Author: users[rng(users.length)],
                Tags: []
            }));
        }
        
        acCount++;
    }
    
    now = t();
    console.log('Articles generated in ' + (now - start) + 'ms');
    start = now;
    
    $news.context.saveChanges();
    
    now = t();
    console.log('Save completed in ' + (now - start) + 'ms');
}

(function(){
    $news.context = new $news.Types.NewsContext({ name: "sqLite", databaseName: "NewsReader", dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables });
    $news.context.onReady(addTestData);

    console.log('\nstarting...');
})();
