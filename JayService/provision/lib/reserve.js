
var q = require('q')
    , app = module.parent.exports.app
    , ctx = module.parent.exports.ctx;

function getinstance(instanceid, type, cutype) { // TODO ide majd kell optimistic locking
    return ctx.CuInventories
	.filter(function(i){return i.Used==false})
        .orderBy("it.Size") // TODO not good...
        .orderBy("it.Type")
	.toArray()
	.then(function(items) {
console.log(items);
	    if (items.length == 0) throw new Error('no available');
	    var item = items[0];
console.log(item);
	    ctx.attach(item);
    	    item.InstanceId = instanceid;
	    item.Used=true;
	    item.LastModified = new Date();
	    return ctx.saveChanges();
	});
}

function reserve(instanceid, type, cutype) {
    return ctx.CuInventories
	.filter(function(i){return i.InstanceId==this.instanceid;}, {instanceid: instanceid})
	.toArray()
	.then(function(items) {
console.log(items);
	    if (items.length > 1)  throw new Error('instance runs on multiple cus');
	    else if (items.length == 1) return items[0].AWSId;
	    else return getinstance(instanceid, type, cutype);
	})
}

app.post('/allocateappitem', function (req, res){
    reserve(req.body._id, req.body.type, req.body.computeunittype)
      .then(function(x){ res.end(JSON.stringify({"Succeeded": true, "AWSId": x })); })
      .fail(function(x){ res.end(JSON.stringify({"Succeeded": false, "reason": x})); }) 
});

