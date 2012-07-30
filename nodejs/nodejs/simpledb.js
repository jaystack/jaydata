var simpledb = require('simpledb');
var sdb = new simpledb.SimpleDB({
    keyid: 'AKIAIO7MWW5Z3SMVYDUQ',
    secret: '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'
});

sdb.getItem('NewsReader', 'Category', function(error, result){
    console.log(result.Title);
});
