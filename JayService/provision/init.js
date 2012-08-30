
var q = require('q')
    , model = require('./model');

module.exports = {

    init: function() {
	var ctx = new $provision.Types.ProvisionContext({name: 'mongoDB', databaseName: 'admin', address:'localhost' });
        return q.ncall(model.findAppOwnerByName, model, 'appowner1')
            .fail(function(reason) {
		var appowner = new $provision.Types.AppOwner({Name: 'appowner1'});
		ctx.AppOwners.add(appowner);
		return ctx.saveChanges().then(function(x) { return appowner; });
            })
            .then(function(appowner) { return q.ncall(model.findAppByName, model, 'app1').then(function(app){return([appowner,app]);})
            .fail(function(x) {
		var app = new $provision.Types.App({AppOwnerId: appowner.Id});
		return ctx.addapp(app, appowner, 'admin', 'admin').then(function(c) { return([appowner, app]); });
            })})
	    .spread(function(appowner, app) {
		var items = [
			new $provision.Types.AppItem({AppId:app.Id, Type: 'cu', Data: {}}),
			new $provision.Types.AppItem({AppId:app.Id, Type: 'cu', Data: {}}),
			new $provision.Types.AppItem({AppId:app.Id, Type: 'qdb', Data: {}}),
			new $provision.Types.AppItem({AppId:app.Id, Type: 'qdb', Data: {}})
		];
		items.forEach(function(item) {
			ctx.AppItems.add(item);
		});
		return ctx.saveChanges().then(function(x){ return ctx.additem(items, app); });
	    })
            .then(function(x) { return('ok'); })
            .fail(function(reason) { console.log(reason); });
    }
}
