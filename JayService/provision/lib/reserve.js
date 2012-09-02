
var q = require('q')
    , app = module.parent.exports.app;

function getinstance(ctx, AppItemId, type, cutype) { // TODO ide majd kell optimistic locking
    return ctx.CuInventories
	.filter(function(i){return i.Used==false})
        .orderBy("it.Size") // TODO not good...
        .orderBy("it.Type")
	.toArray()
	.then(function (items) {
	    return ctx.AppItems.single(function (appitem) { return appitem.Id == this.Id }, { Id: AppItemId }).then(function (AppItem) {

	        if (items.length == 0) throw new Error('no available');
	        var item = items[0];
	        ctx.attach(item);
	        item.AppItemId = AppItemId;
	        item.AppId = AppItem.AppId;
	        item.Used = true;
	        item.LastModified = new Date();
	        return ctx.saveChanges().then(function (c) { return item; });
	    });
	});
}

function reserve(ctx, AppItemId, type, cutype) {
    return ctx.CuInventories
	.filter(function(i){return i.AppItemId==this.AppItemId;}, {AppItemId: AppItemId})
	.toArray()
	.then(function(items) {
	    if (items.length > 1)  throw new Error('instance runs on multiple cus');
	    else if (items.length == 1) return items[0].AWSId;
	    else return getinstance(ctx, AppItemId, type, cutype);
	})
}

app.post('/allocateappitem', function (req, res){
    reserve(req.ctx, req.body._id, req.body.type, req.body.computeunittype)
      .then(function(x){ res.end(JSON.stringify({"Succeeded": true, "AWSId": x.AWSId })); })
      .fail(function(x){ res.end(JSON.stringify({"Succeeded": false, "reason": x.message})); }) 
});

app.post('/shutdown', function (req, res) {
    //req.body.awsid
    req.ctx.CuInventories.single(function (cui) { return cui.AWSId == this.awsid }, { awsid: req.body.awsid })
        .then(function (cu) {
            req.ctx.CuInventories.attach(cu);
            cu.ExAWSId = cu.AWSId;
            cu.AWSId = "";
            return req.ctx.saveChanges()
                .then(function () { res.end(); });
        });

});

// satisfy
app.post('/satisfy', function (req, res) {
    req.ctx.CuInventories
        .filter(function (cui) { return cui.AWSId == "" })
        .toArray()
    .then(function (stoppedCuInvs) {
        var result = {
            success: [],
            error: []
        }

        return stoppedCuInvs.reduce(function (prom, item) {
            return prom.then(function () {
                return reserve(req.ctx, item.AppItemId, undefined /*???*/, undefined /*???*/)
                    .then(function () { result.success.push({ "Succeeded": true, "item": item }); })
                    .fail(function (ex) { result.error.push({ "Succeeded": false, "reason": ex.message, "item": item }); });
            });
        }, q.resolve()).then(function () {
            for (var i = 0; i < result.success.length; i++) {
                req.ctx.CuInventories.remove(result.success[i].item);
            }
            for (var i = 0; i < result.error.length; i++) {
                var obj = result.error[i];
                if (obj.reason.message === 'instance runs on multiple cus')
                    req.ctx.CuInventories.remove(obj.item);
            }
            return req.ctx.saveChanges().then(function () { res.end(JSON.stringify(result)); });
        });
    })
    
});


