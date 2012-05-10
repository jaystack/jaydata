var t = require('../testItem.js');
module.exports = new t.TestItem('CRUD Insert', function (onResult) {
    var db = this;
    db.Persons.toArray(function (result) {
        if (result.length != 0)
            onResult(false);
        else {
            var p = new $test.Types.Person({
                Name: 'Józsi'
            });
            db.Persons.add(p);            
            db.saveChanges({
                success: function (result) {
                    db.Persons.toArray(function (result) {
                        onResult(result.length == 1);                            
                    });
                },
                error: function () {
                    onResult(false);
                }
            });
        }
    });
});