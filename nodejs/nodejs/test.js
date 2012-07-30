var $data = require('jaydata');

$data.Class.define('$test.Types.Test', $data.Entity, null, {
    Id: { dataType: 'int', key: true, computed: true },
    Key: { dataType: 'string', required: true },
    Value: { dataType: 'string' }
}, null);

$data.Class.define('$test.Types.TestContext', $data.EntityContext, null, {
    Table: { dataType: $data.EntitySet, elementType: $test.Types.Test }
}, null);

var context = new $test.Types.TestContext({
    name: 'sqLite',
    databaseName: 'test',
    dbCreation: $data.storageProviders.sqLite.DbCreationType.Default
});

context.onReady(function(db){
    var pair = new $test.Types.Test({
        Key: 'DateTime',
        Value: new Date().toString()
    });
    
    db.Table.add(pair);
    db.saveChanges(function(){
        db.Table.orderByDescending(function(item){ return item.Id; }).toArray(function(result){
            for (var i = 0; i < result.length; i++){
                var item = result[i];
                console.log(item.Key + ' -> ' + item.Value);
            }
            if (result.length > 3){
                db.Table.remove(result[result.length - 1]);
                db.saveChanges();
            }
        });
    });
});
