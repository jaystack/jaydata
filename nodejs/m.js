var m = require('mongodb');

var s = new m.Server('127.0.0.1', 27017, {});
new m.Db('test', s, {}).open(function(e, c){
    if (e) throw e;
    new m.Collection(c, 'Items').find({}, {}).count(function(e, cnt){
        if (e) throw e;
        console.log(cnt);
        c.close();
    });
});
