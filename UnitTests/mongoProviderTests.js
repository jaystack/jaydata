$ = jQuery = require('jquery');
var $data = require('jaydata');

$data.Entity.extend('$test.Item', {
    Id: { type: 'string', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' }
});

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item }
});

$test.Context.init = function(callback){
    $test.context = new $test.Context({ name: 'mongoDB', databaseName: 'test', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
    $test.context.onReady(function(db){
        callback(db);
    });
}

exports.testAdd = function(test){
    test.expect(1);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            test.done();
        });
    });
};

exports.testRemove = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                for (var i = 0; i < data.length; i++){
                    db.Items.remove(data[i]);
                }
                db.saveChanges(function(cnt){
                    test.equal(cnt, 5, 'Not 5 items removed from collection');
                    test.done();
                })
            });
        });
    });
};

exports.testUpdate = function(test){
    test.expect(11);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                for (var i = 0; i < data.length; i++){
                    db.Items.attach(data[i]);
                    data[i].Value = 'updated';
                }
                db.saveChanges(function(cnt){
                    test.equal(cnt, 5, 'Not 5 items updated in collection');
                    db.Items.toArray(function(data2){
                        test.equal(data2.length, 5, 'Not 5 items selected from collection');
                        test.ok(data2[0] instanceof $test.Item, 'Entity is not an Item');
                        for (var i = 0; i < data2.length; i++){
                            test.equal(data2[i].Value, 'updated', 'Value is not updated');
                        }
                        test.done();
                    });
                });
            });
        });
    });
};

exports.testLength = function(test){
    test.expect(2);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.length(function(cnt){
                test.equal(cnt, 5, 'Not 5 items in the collection');
                test.done();
            });
        });
    });
};

exports.testSkip = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.skip(1).toArray(function(data){
                test.equal(data.length, 4, 'Not 4 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Key, 'aaa2', 'Key of first item is not "aaa2"');
                test.done();
            });
        });
    });
};

exports.testTake = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.take(1).toArray(function(data){
                test.equal(data.length, 1, 'Not 1 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Key, 'aaa1', 'Key of first item is not "aaa1"');
                test.done();
            });
        });
    });
};

exports.testOrderBy = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.orderBy(function(it){ return it.Value; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Value, 'bbb0', 'Value of first item is not "bbb0"');
                test.done();
            });
        });
    });
};

exports.testOrderByDescending = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.orderByDescending(function(it){ return it.Value; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Value, 'bbb9', 'Value of first item is not "bbb9"');
                test.done();
            });
        });
    });
};

exports.testMap = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.map(function(it){ return { data: { k: it.Key, v: it.Value }}; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof Object, 'Entity is not an anonymous Object');
                test.deepEqual(data[0], { data: { k: 'aaa1', v: 'bbb6' }}, 'Object is not as expected');
                test.done();
            });
        });
    });
};

exports.testFilterByKey = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return it.Key == this.key; }, { key: 'aaa1' }).toArray(function(data){
                test.equal(data.length, 1, 'Not 1 item selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Value, 'bbb6', 'Value of first item is not "bbb6"');
                test.done();
            });
        });
    });
};

exports.testFilterByRank = function(test){
    test.expect(5);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return it.Rank < this.rank; }, { rank: 3 }).toArray(function(data){
                test.equal(data.length, 2, 'Not 2 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Value, 'bbb6', 'Value of first item is not "bbb6"');
                test.equal(data[1].Value, 'bbb7', 'Value of second item is not "bbb7"');
                test.done();
            });
        });
    });
};

exports.testFilterComplex = function(test){
    test.expect(6);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return it.Rank >= this.minRank && it.Rank <= this.maxRank; }, { minRank: 2, maxRank: 4 }).toArray(function(data){
                test.equal(data.length, 3, 'Not 3 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Value, 'bbb7', 'Value of first item is not "bbb7"');
                test.equal(data[1].Value, 'bbb8', 'Value of second item is not "bbb8"');
                test.equal(data[2].Value, 'bbb9', 'Value of third item is not "bbb9"');
                test.done();
            });
        });
    });
};

exports.testFilterOr = function(test){
    test.expect(5);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return it.Rank == this.minRank || it.Rank == this.maxRank; }, { minRank: 2, maxRank: 4 }).toArray(function(data){
                test.equal(data.length, 2, 'Not 2 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                if (data[0]) test.equal(data[0].Value, 'bbb7', 'Value of first item is not "bbb7"');
                else test.ok(false, 'Item 1 not found in result set');
                if (data[1]) test.equal(data[1].Value, 'bbb9', 'Value of second item is not "bbb9"');
                else test.ok(false, 'Item 2 not found in result set');
                test.done();
            });
        });
    });
};

exports.testFilterAnd = function(test){
    test.expect(2);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return it.Rank == this.minRank && it.Rank == this.maxRank; }, { minRank: 2, maxRank: 4 }).toArray(function(data){
                test.equal(data.length, 0, 'Not 0 items selected from collection');
                test.done();
            });
        });
    });
};

exports.testFilterAndOr = function(test){
    test.expect(5);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return it.Rank < this.rank && (it.Rank == this.minRank || it.Rank == this.maxRank); }, { rank: 5, minRank: 2, maxRank: 4 }).toArray(function(data){
                test.equal(data.length, 2, 'Not 2 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                if (data[0]) test.equal(data[0].Value, 'bbb7', 'Value of first item is not "bbb7"');
                else test.ok(false, 'Item 1 not found in result set');
                if (data[1]) test.equal(data[1].Value, 'bbb9', 'Value of second item is not "bbb9"');
                else test.ok(false, 'Item 2 not found in result set');
                test.done();
            });
        });
    });
};
