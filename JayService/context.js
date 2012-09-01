(function(){

var contextTypes = {};

$data.Entity.extend("db.Test", {
    id: { type: "id", key: true, computed: true }
});

$data.EntityContext.extend("database.Context", {
    Test: { type: $data.EntitySet, elementType: db.Test }
});

contextTypes["db"] = database.Context;

exports = module.exports = { contextTypes: contextTypes };

})();