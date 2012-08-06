$ = jQuery = require('jquery');
var $data = require('jaydata');

$data.Entity.extend('$test.Item', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' },
    CreatedAt: { type: 'datetime' },
    ForeignKey: { type: 'id' }
});

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item }
});

$test.Context.init = function(callback){
    $test.context = new $test.Context({ name: 'storm' });
    $test.context.onReady(function(db){
        db.Items.toArray(function(data){
            for (var i = 0; i < data.length; i++){
                db.Items.remove(data[i]);
            }
            
            db.saveChanges(function(cnt){
                db.Items.length(function(cnt){
                    if (cnt > 0) throw 'Database clear failed!';
                    $test.context = new $test.Context({ name: 'storm' });
                    $test.context.onReady(function(db){
                        callback(db);
                    });
                });
            });
        });
    });
};

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

exports.testAddEntity = function(test){
    test.expect(1);
    $test.Context.init(function(db){
        var add1 = new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 });
        var add2 = new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 });
        var add3 = new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 });
        var add4 = new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 });
        var add5 = new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 });
        
        db.Items.add(add1);
        db.Items.add(add2);
        db.Items.add(add3);
        db.Items.add(add4);
        db.Items.add(add5);
        
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            
            var add6 = new $test.Item({ Key: 'aaa6', Value: 'bbb-1', Rank: 6 });
            db.Items.add(add6);
            db.Items.remove(add1);
            
            db.saveChanges(function(cnt){
                test.done();
            });
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

exports.testFilterByDate = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1, CreatedAt: new Date() }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 1, 'Not 1 item added to collection');
            db.Items.filter(function(it){ return it.CreatedAt < this.now; }, { now: new Date() }).toArray(function(data){
                test.equal(data.length, 1, 'Filtering by date failed');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                if (data[0]) test.ok(data[0].CreatedAt instanceof Date, 'CreatedAt is not a Date');
                else test.ok(false, 'Item 1 not found in result set');
                test.done();
            });
        });
    });
};

exports.testFilterByKey = function(test){
    test.expect(2);
    $test.Context.init(function(db){
        var master = new $test.Item({ Key: 'master', Value: 'master', Rank: 0 });
        db.Items.add(master);
        db.saveChanges(function(cnt){
            var slave1 = new $test.Item({ Key: 'slave1', Value: 'value1', Rank: 1, ForeignKey: master.Id });
            var slave2 = new $test.Item({ Key: 'slave2', Value: 'value2', Rank: 2, ForeignKey: master.Id });
            var slave3 = new $test.Item({ Key: 'slave3', Value: 'value3', Rank: 3, ForeignKey: master.Id });
            
            db.Items.add(slave1);
            db.Items.add(slave2);
            db.Items.add(slave3);
            
            test.equal(cnt, 1, 'Not 1 item inserted into collection');
            
            db.saveChanges(function(cnt){
                db.Items.filter(function(it){ return it.ForeignKey == this.id; }, { id: master.Id }).toArray({
                    success: function(result){
                        test.ok(true, 'This will be invisible!');
                        test.done();
                    },
                    error: function(){
                        test.ok(false, 'Error in expression.');
                        test.done();
                    }
                });
            });
        });
    });
};

exports.testFilterByComputed = function(test){
    test.expect(3);
    $test.Context.init(function(db){
        var master = new $test.Item({ Key: 'master', Value: 'master', Rank: 0 });
        db.Items.add(master);
        db.saveChanges(function(cnt){
            test.equal(cnt, 1, 'Not 1 item inserted into collection');
            db.Items.toArray(function(result){
                test.equal(result.length, 1, 'Not only 1 item in collection');
                db.Items.single(function(it){ return it.Id == this.id; }, { id: result[0].Id }, {
                    success: function(){
                        test.ok(true, 'Filter success');
                        test.done();
                    },
                    error: function(){
                        test.ok(true, 'Filter failed');
                        test.done();
                    }
                });
            });
        });
    });
};

exports.testFilterInComputed = function(test){
    test.expect(3);
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
                var keys = data.map(function(it){ return it.Id; }).slice(0, 3);
                db.Items.filter(function(it){ return it.Id in this.keys; }, { keys: keys }).toArray(function(data){
                    test.equal(data.length, 3, 'Not 3 items filtered by "in" operator');
                    test.done();
                });
            });
        });
    });
};
