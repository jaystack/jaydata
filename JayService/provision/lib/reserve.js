
var q = require('q')
    , model = module.parent.exports.model || require('./model');

function reserve(app, callback) { // TODO ide majd kell optimistic locking
    var instances = [];
    model.InventoryItem.find(function (err, inventoryItems) {
        if (err) return callback(err);
        else {
            var promise = q.resolve(1); // ?
            app.items
                .filter(function(e, i, a) {
                    return (e.type == 'cu');
                })
                .forEach(function(item) {
                    var iitems = inventoryItems
                        .filter(function(e, i, a) {
                            return (e.cuID == item.cuid);
                        });
                    if (iitems.length > 1) { console.log('shit', iitems); } // error, should not happen !!
                    else if (iitems.length == 1) item.instance = iitems[0];
                    else {
                        var emptyInstances = inventoryItems
                            .filter(function(e, i, a) {
                                return (e.used == false);
                            });
                        if (emptyInstances.length == 0) return callback(null, [app, instances]);
                        var rinstance = emptyInstances[0];
                        rinstance.used = true;
                        rinstance.app = item.app;
                        rinstance.cuID = item.cuid;
                        item.instance = rinstance;
                        promise = promise.then(function(x) { return q.ncall(rinstance.save, rinstance); });
                    }
                    instances.push(item.instance);
                });
            q.when(promise)
                .then(function(x) { callback(null, [app, instances]); })
                .fail(function(reason) { callback(reason); });
        }
    });
}

