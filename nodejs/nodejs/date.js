require('jaydata');

$data.Entity.extend('$test.Item', {
    Id: { type: 'string', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' },
    CreatedAt: { type: 'datetime' }
});

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item }
});

$test.context = new $test.Context({ name: 'mongoDB', databaseName: 'test', dbCreation: $data.storageProviders.mongoDB.DbCreationType.DropAllExistingCollections });
$test.context.onReady(function(db){
    db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1, CreatedAt: new Date() }));
    db.saveChanges(function(cnt){
        console.log('saved', cnt);
        db.Items.filter(function(it){ return it.CreatedAt < this.now; }, { now: new Date() }).forEach(function(data){
            console.log(data.initData);
        });
    });
});
