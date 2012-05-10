function TestItem(name, testMethod) {
    var $data = require('./JayData.js');
    $data.Class.define("$test.Types.Person", $data.Entity, null, {
        Id: { dataType: "int", key: true, computed: true },
        Name: { dataType: "string" },
        Addresses: { dataType: "Array", elementType: "$test.Types.Address", inverseProperty: "Person" }
    }, null);
    $data.Class.define("$test.Types.Address", $data.Entity, null, {
        Id: { dataType: "int", key: true, computed: true },
        Title: { dataType: "string" },
        Person: { dataType: "$test.Types.Person" }
    }, null);

    $data.Class.define("$test.Types.TestContext", $data.EntityContext, null, {
        Persons: { dataType: $data.EntitySet, elementType: $test.Types.Person },
        Addresses: { dataType: $data.EntitySet, elementType: $test.Types.Address },
    }, null);

    var finished = false;    
    var testItem = this;
    this.name = name;
    this.run = function (onResult) {
        var context = new $test.Types.TestContext({ name: "sqLite", databaseName: name + "_Db", dbCreation: $data.storageProviders.sqLite.DbCreationType.DropAllExistingTables });
        context.onReady(function (db) {
            function onTimeout() {
                if (finished)
                    return;
                finished = true;
                onResult('timeout');
            }
            var timeoutclb = setTimeout(onTimeout, 5000);            
            testMethod.apply(db, [function (result) {
                if (finished)
                    return;
                finished = true;
                clearTimeout(timeoutclb);
                onResult(result);
            }]);
        });
    };
}

exports.TestItem = TestItem;