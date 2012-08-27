(function(){

var contextTypes = {};

$data.Entity.extend("$news.Types.Category", {
    Id: { type: "id", key: true, computed: true, required: true },
    Title: { type: "string" },
    Articles: { type: "Array", elementType: "id" }
});

$data.Entity.extend("$news.Types.Article", {
    Id: { type: "id", key: true, computed: true, required: true },
    Title: { type: "string" },
    Lead: { type: "string" },
    Body: { type: "string" },
    CreateDate: { type: "datetime" },
    Thumbnail_LowRes: { type: "blob" },
    Thumbnail_HighRes: { type: "blob" },
    Category: { type: "id" },
    Tags: { type: "Array", elementType: "string" }
});

$data.EntityContext.extend("$news.Types.Context", {
    Categories: { type: $data.EntitySet, elementType: $news.Types.Category,
        afterCreate: function(data){ console.log("Created categories:", data); },
        afterRead: function(data){ console.log("Read from categories:", data); } },
    Articles: { type: $data.EntitySet, elementType: $news.Types.Article }
});

contextTypes["NewsReader"] = $news.Types.Context;

exports = module.exports = { contextTypes: contextTypes };

})();