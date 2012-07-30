$ = jQuery = require('jquery');
var $data = require('jaydata');

$data.Entity.extend('$test.Item', {
    Id: { type: 'string', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' },
    CreatedAt: { type: 'datetime' }
});

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item },
    GetThat: $data.ServiceOperation.returns($data.Array, $data.Integer).serviceName('GetThat').params([])
});

$test.context = new $test.Context({ name: 'storm' });
$test.context.onReady(function(db){
//    db.GetThat(function(data){
//        console.log(data);
//    });
    db.Items
        //.include('Things')
        .filter(function(it){ return it.Key == 'ccc'; })
        .filter(function(it){ return it.Rank > Math.floor(Math.random() * 100); })
        /*.orderBy('it.Key')
        .orderBy('it.Id')
        .orderByDescending('it.Value')
        .map('it.Rank')*/
        .take(1)
        .toArray(function(data){
            data.forEach(function(it){
                console.log(it.initData);
                db.Items.attach(it);
                it.Value = 'updated';
            });
            
            //db.Items.add(new $test.Item({ Key: 'abc', Value: 'cba', Rank: 199 }));
            
            db.saveChanges(function(cnt){
                console.log('saveChanges', cnt);
            });
        });
});
