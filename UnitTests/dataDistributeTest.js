$(document).ready(function () {
	if (!$data.StorageProviderLoader.isSupported('sqLite')) return;

    module("dataDistributeTest");

    test("simpleFieldDataTypeTest", 8, function () {
        var distributor = $data.Class.define('distributor', $data.Notifications.ChangeDistributor, null, {
            distributeData: function (data) {
                ok(true, 'true');
                equal(data.some(function (e) { return e.entityState == $data.EntityState.Added }), true, "exists new element");
                
                if(data.every(function (e) { return e.entityState == $data.EntityState.Added })){
                    equal(data.length, 2, 'changed data count');
                }
                else
                {
                    equal(data.length, 3, 'changed data count');
                }
            }
        }, null);

        var collector = $data.Class.define('collector', $data.Notifications.ChangeCollector, null, {
            Distrbutor: { enumerable: false, dataType: $data.ChangeDistributorBase, storeOnObject: true, value: new distributor() }
        }, null);

        var context = $data.Class.define("ProviderTestContext", $data.EntityContext, null, {
            Table1Items: {
                dataType: $data.EntitySet, elementType: $data.Class.define("TestEntity", $data.Entity, null, {
                    fld1: { dataType: 'integer', key: true, computed: true },
                    fld2: { dataType: 'string' },
                    fld3: { dataType: 'string' },
                    fld4: { dataType: 'string' }
                }, null)
            },
            ChangeCollector: { enumerable: false, dataType: $data.Notifications.ChangeCollectorBase, storeOnObject: true, value: new collector() }
        }, null);

        stop(3);
        var c = new context({ databaseName: "sqLiteDataDistributeTest", name: "sqLite", dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
        c.onReady(function (db) {
            db.Table1Items.add(new db.Table1Items.createNew({ fld2: 'prop2', fld3: 'prop3', fld4: 'prop4' }));
            db.Table1Items.add(new db.Table1Items.createNew({ fld2: 'prop22', fld3: 'prop23' }));

            db.saveChanges(function () {
                var d = db.Table1Items.entityContext.ChangeCollector.Distrbutor.Elements;
                start();

                db.Table1Items.toArray(function (item) {
                    start();
                    equal(item.length, 2, "new items added");

                    item[0].fld3 = "updateFld";
                    db.Table1Items.attach(item[0]);
                    item[0].entityState = $data.EntityState.Modified;
                    item[1].fld4 = "updateFld2";
                    db.Table1Items.attach(item[1]);
                    item[1].entityState = $data.EntityState.Modified;
                    db.Table1Items.add(new db.Table1Items.createNew({ fld2: 'prop32', fld3: 'prop33', fld4: 'prop34' }));

                    db.saveChanges(function () {
                        start();
                        ok(true, "all done");
                    });
                });


            });
        });
    });
});