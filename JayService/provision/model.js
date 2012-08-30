
$data.Class.define("$provision.Types.AppOwner", $data.Entity, null, {
    Id: { type: "id", key: true, computed: true },
    Name: { type: "string" },
    AppIds: { type: "Array", elementType: "id" }
}, null);
$data.Class.define("$provision.Types.App", $data.Entity, null, {
    Id: { type: "id", key: true, computed: true },
    Name: { type: "string" },
    AppOwnerId: { type: "id" },
    ItemIds: { type: "Array", elementType: "id" },
    InstanceIds: { type: "Array", elementType: "id" }
}, null);
$data.Class.define("$provision.Types.AppItem", $data.Entity, null, {
    Id: { type: "id", key: true, computed: true },
    AppId: { type: "id" },
    Type: { type: "string" },
    Data: { type: "object" }
}, null);
$data.Class.define("$provision.Types.Instance", $data.Entity, null, {
    Id: { type: "id", key: true, computed: true },
    AppId: { type: "id" },
    Username: { type: "string" },
    Password: { type: "string" }
}, null);
$data.Class.define("$provision.Types.CuInventory", $data.Entity, null, {
    Id: { type: "id", key: true, computed: true },
    InstanceId: { type: "id" },
    AppItemId: { type: "id" },
    Size: { type: "string" }, // micro
    Type: { type: "string" }, // reserved, ondemand, spot
    Used: { type: "boolean" },
    LastModified: { type: "datetime" }
}, null);
$data.Class.define("$provision.Types.DbInventory", $data.Entity, null, {
    Id: { type: "id", key: true, computed: true },
    InstanceId: { type: "id" },
    AppItemId: { type: "id" },
    DbName: { type: "string" },
    Data: { type: "object" }
}, null);

$data.Class.defineEx("$provision.Types.ProvisionContext", [$data.EntityContext,$data.ServiceBase], null, {
    AppOwners: { type: $data.EntitySet, elementType: $provision.Types.AppOwner },
    Apps: { type: $data.EntitySet, elementType: $provision.Types.App },
    AppItems: { type: $data.EntitySet, elementType: $provision.Types.AppItem },
    Instances: { type: $data.EntitySet, elementType: $provision.Types.Instance },
    CuInventories: { type: $data.EntitySet, elementType: $provision.Types.CuInventory },
    DbInventories: { type: $data.EntitySet, elementType: $provision.Types.DbInventory },


    findAppOwnerByName: function(appownername) { return this.AppOwners.single(function(a) { return a.Name == this.appownername; }, { appownername: appownername }); },
    findAppOwnerByApp: function(app) { return this.AppOwners.single(function(a) { return a.Id == app.AppOwnerId; }); },
    findAppByName: function(appname) { return this.Apps.single(function(a) { return a.Name == this.appname; }, { appname: appname }); },
    findDbs: function(app) { return this.AppItems.filter(function(item){return item.AppId = app.Id && item.type == 'qdb'; }) },
    checkProvisionId: function(app, provisionid) { return this.AppItems.single(function (i) { return (i.Id in this.items && i.type == 'provisionableapp' && i.Data.provisionId == this.provisionid); }, { items: app.items, provisionId: provisionid }); },
    checkDb: function(app, dbid) { return this.AppItems.single(function (i) { return (i.Id in this.items && i.type == 'qdb' && i.Data.DbId == this.dbid); }, { items: app.items, dbid: dbid }); },
    checkCu: function(app, cuid) { return this.AppItems.single(function (i) { return (i.Id in this.items && i.type == 'cu' && i.Data.CuId == this.cuid); }, { items: app.items, cuid: cuid }); },

    // constructor
    // pre, post
    constructor: function() {
	this.Apps.beforeDelete=function(items) {
		return false;
	};
    },

    // only needed for init
    checkInventory: function(id) { return this.CuInventories.single(function(a) { return a.InstanceId == this.id; }, { id: id }); },

    addapp: function(app, owner, username, password) {
	var self = this;
	this.Apps.add(app);
	return this.saveChanges()
		.then(function(c) {
		    self.AppOwners.attach(owner);
		    owner.AppIds = owner.AppIds.concat(app.Id);
		    return self.saveChanges();
		})
		.then(function(c) {
			// TODO use createinstance but beware of this/self
		    var instance = new $provision.Types.Instance();
		    instance.AppId = app.Id;
		    instance.Username = username;
		    instance.Password = password;
		    self.Instances.add(instance);
		    return self.saveChanges().then(function(c) { return instance; });
		})
		.then(function(instance) {
		    self.Apps.attach(app);
		    app.InstanceIds = app.InstanceIds.concat(instance.Id);
		    return self.saveChanges();
		});
    },

    createinstance: function(app, username, password) {
	var self = this;
	var instance = new $provision.Types.Instance();
	instance.AppId = app.Id;
	instance.Username = username;
	instance.Password = password;
	this.Instances.add(instance);
	return self.saveChanges()
		.then(function(c) {
		    self.Apps.attach(app);
		    app.InstanceIds = app.InstanceIds.concat(instance.Id);
		    return self.saveChanges().then(function(c){return instance;});
		});
    },

    createprovisioneddb: function(instance, db) {
	var self = this;
	var dbinstance = new $provision.Types.DbInventory();
	dbinstance.InstanceId = instance.Id;
	dbinstance.AppItemId = instance.AppId;
	dbinstance.DbName = instance.Id + '_' + db.Data.name;
	dbinstance.Data = db.Data;
	// TODO el kellene tenni forditva is, vagyis az instance tudjon a db-irol
	this.DbInventories.add(dbinstance);
	return this.saveChanges();
    },

    additem: function(item, app) {
	var self = this;
	// TODO move here but it can be an array
	// this.AppItems.add(item);
	return this.saveChanges()
	     .then(function(c) {
		self.Apps.attach(app);
		if (Array.isArray(item))
			app.ItemIds = app.ItemIds.concat(item.map(function(i){ return i.Id;}));
		else
			app.ItemIds = app.ItemIds.concat(item.Id);
	     	return self.saveChanges();
	     });
    }
});

exports = $provision.Types.ProvisionContext;

