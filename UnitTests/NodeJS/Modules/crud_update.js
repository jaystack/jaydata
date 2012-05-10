var t = require('../testItem.js');
module.exports = new t.TestItem('CRUD Update', function (onResult) {
    var db = this;

    var p = new $test.Types.Person({
        Name: 'Józsi'
    });
    db.Persons.add(p);
    db.saveChanges({
        success: function (result) {
            db.Persons.toArray(function (result) {
                if (result.length != 1 || result[0].Name !== 'Józsi') {
                    console.log('Nem józsi');
                    onResult(false);
                    return;
                }
                db.Persons.attach(p);
                p.Name = 'Dani';
                db.saveChanges({
                    success: function () {
                        db.Persons.toArray(function (result) {
                            if (result.length != 1 || result[0].Name !== 'Dani') {
                                onResult(false);                                
                                return;
                            }
                            onResult(true);
                        });
                    },
                    error: function () {
                        onResult(false);
                    }
                });
            });
        },
        error: function () {
            onResult(false);
        }
    });
});