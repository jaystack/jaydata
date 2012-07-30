//var dynode = require('dynode');
var dynamo = require('dynamo');
var client = dynamo.createClient({
  accessKeyId: 'AKIAIO7MWW5Z3SMVYDUQ',
  secretAccessKey: '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'
});
var db = client.get('eu-west-1');

var ns = db.get('NewsReader');

/*ns
.put({
    Category: 'Hobby',
    Title: 'Hi Country!'
})
.save(console.log);*/

ns
.put({
    Category: 'all',
    PKs: ['Sport', 'Hobby']
})
.save(console.log);

//ns
//.scan({ Category: { 'startsWith': 'H' } })
//.get({ Category: 'Sport' })

//.query({ Category: 'Sport' })
/*.get('Category', 'Article')
.reverse()*/
//.get(['Category', 'Article'])
//.fetch(console.log);

/*dynode.auth({
    accessKeyId: 'AKIAIO7MWW5Z3SMVYDUQ',
    secretAccessKey: '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'
});*/

/*dynode.putItem('NewsReader', {
    Category: 'Sport',
    Article: 'Coppa Italia',
    Body: 'Lorem Ipsum',
    Lead: 'Lead lorem ipsum',
    CreateDate: new Date(),
    Tags: ['a', 'b', 'c']
}, console.log);*/

//dynode.getItem('NewsReader', { hash: 'Category' }, console.log);

/*dynode.query('NewsReader', 'Sport', {
    RangeKeyCondition: { AttributeValueList: [{ 'S': 'Coppa' }], 'ComparisonOperator': 'BEGINS_WITH' }
}, function(err, result, meta){
    console.log(result.Items[0].Tags);
});*/
