var uuid = require('node-uuid');

var cache = {};
var start;
function gen(){
    for (var i = 0; i < 10000; i++){
        var n = uuid.v4();
        if (cache[n]) cache[n]++;
        else cache[n] = 1;
    }
    var now = new Date().getTime();
    console.log(Object.getOwnPropertyNames(cache).length + " cache items in memory in " + (now - start) + "ms");
    start = now;
    setTimeout(gen, 1);
}
start = new Date().getTime();
gen();
