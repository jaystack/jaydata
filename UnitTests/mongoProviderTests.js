require('jaydata');

$data.Entity.extend('$test.Item', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' },
    CreatedAt: { type: 'datetime' },
    ForeignKey: { type: 'id' }
});

$data.Entity.extend('$test.ComplexValue', {
    Value: { type: 'string' },
    Rank: { type: 'int' }
});

/*$data.Entity.extend('$test.MoreComplexValue', {
    Value: { type: 'string' },
    Rank: { type: 'int' },
    Child: { type: '$test.ComplexValue' }
});*/

$data.Entity.extend('$test.ComplexItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: '$test.ComplexValue' }
});

/*$data.Entity.extend('$test.MoreComplexItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: '$test.MoreComplexValue' },
    ValueChild: { type: '$test.ComplexValue' }
});*/

$data.Entity.extend('$test.ObjectItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'Object' }
});

$data.Entity.extend('$test.ArrayItem', {
    Id: { type: 'id', computed: true, key: true },
    Key: { type: 'string' },
    Values: { type: 'Array', elementType: 'string' },
    Rank: { type: 'int' }
});

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item },
    ComplexItems: { type: $data.EntitySet, elementType: $test.ComplexItem },
    //MoreComplexItems: { type: $data.EntitySet, elementType: $test.MoreComplexItem },
    ObjectItems: { type: $data.EntitySet, elementType: $test.ObjectItem },
    ArrayItems: { type: $data.EntitySet, elementType: $test.ArrayItem }
});

$test.Context.init = function(callback){
    $test.context = new $test.Context({ name: 'mongoDB', databaseName: 'test', username: 'admin', password: '***', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
    $test.context.onReady(function(db){
        callback(db);
    });
}

exports.testAdd = function(test){
    test.expect(3);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.toArray(function(r){
                test.equal(r.length, 5, 'Not 5 items selected from collection');
                test.ok(r[0] instanceof $test.Item, 'Entity is not an Item');
                test.done();
            });
        });
    });
};

exports.testAddEntity = function(test){
    test.expect(7);
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
            db.Items.toArray(function(r){
                test.equal(r.length, 5, 'Not 5 items added to collection');
                test.ok(r[0] instanceof $test.Item, 'Entity is not an Item');
            
                var add6 = new $test.Item({ Key: 'aaa6', Value: 'bbb-1', Rank: 6 });
                db.Items.add(add6);
                db.Items.remove(add1);
                
                db.saveChanges(function(cnt){
                    test.equal(cnt, 2, 'Not 2 items saved to collection');
                    db.Items.toArray(function(r){
                        test.equal(r.length, 5, 'Not 5 items added to collection');
                        test.ok(r[0] instanceof $test.Item, 'Entity is not an Item');
                        test.equal(r[0].Value, 'bbb7', 'First entity value is not "bbb7"');
                        test.done();
                    });
                });
            });
        });
    });
};

exports.testAddComplex = function(test){
    test.expect(2);
    $test.Context.init(function(db){
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa1', Value: new $test.ComplexValue({ Value: 'bbb6', Rank: 1 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa2', Value: new $test.ComplexValue({ Value: 'bbb7', Rank: 2 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'bbb3', Value: new $test.ComplexValue({ Value: 'bbb8', Rank: 3 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa4', Value: new $test.ComplexValue({ Value: 'bbb9', Rank: 4 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa5', Value: new $test.ComplexValue({ Value: 'bbb0', Rank: 5 }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ComplexItems.toArray(function(r){
                test.ok(r[0].Value instanceof $test.ComplexValue, 'Value is not complex');
                test.done();
            });
        });
    });
};

/*exports.testAddMoreComplex = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa1', Value: new $test.MoreComplexValue({ Value: 'bbb6', Rank: 1, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa2', Value: new $test.MoreComplexValue({ Value: 'bbb7', Rank: 2, Child: new $test.ComplexValue({ Value: 'child2', Rank: 102 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'bbb3', Value: new $test.MoreComplexValue({ Value: 'bbb8', Rank: 3, Child: new $test.ComplexValue({ Value: 'child3', Rank: 103 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa4', Value: new $test.MoreComplexValue({ Value: 'bbb9', Rank: 4, Child: new $test.ComplexValue({ Value: 'child4', Rank: 104 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa5', Value: new $test.MoreComplexValue({ Value: 'bbb0', Rank: 5, Child: new $test.ComplexValue({ Value: 'child5', Rank: 105 }) }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.MoreComplexItems.toArray(function(r){
                test.ok(r[0] instanceof $test.MoreComplexItem, 'Item is not MoreComplexItem');
                test.ok(r[0].Value instanceof $test.MoreComplexValue, 'Value is not MoreComplexValue');
                test.ok(r[0].Value.Child instanceof $test.ComplexValue, 'Value.Child is not ComplexValue');
                test.done();
            });
        });
    });
};*/

exports.testAddObject = function(test){
    test.expect(2);
    $test.Context.init(function(db){
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'aaa1', Value: { Value: 'bbb6', Rank: 1 } }));
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'aaa2', Value: { Value: 'bbb7', Rank: 2 } }));
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'bbb3', Value: { Value: 'bbb8', Rank: 3 } }));
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'aaa4', Value: { Value: 'bbb9', Rank: 4 } }));
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'aaa5', Value: { Value: 'bbb0', Rank: 5 } }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ObjectItems.toArray(function(r){
                test.ok(typeof r[0].Value === 'object', 'Value is not object');
                test.done();
            });
        });
    });
};

exports.testAddArray = function(test){
    test.expect(3);
    $test.Context.init(function(db){
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa1', Values: ['bbb6'], Rank: 1 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa2', Values: ['bbb7', 'bbb6'], Rank: 2 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'bbb3', Values: ['bbb8', 'bbb7', 'bbb6'], Rank: 3 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa4', Values: ['bbb9', 'bbb8', 'bbb7', 'bbb6'], Rank: 4 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa5', Values: ['bbb0', 'bbb9', 'bbb8', 'bbb7', 'bbb6'], Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ArrayItems.toArray(function(r){
                test.ok(r[0].Values instanceof Array, 'Values is not array');
                test.equal(r[4].Values.length, 5, 'Values length is not 5');
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
                    data[i].ForeignKey = data[i].Id;
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

exports.testUpdateComplex = function(test){
    test.expect(11);
    $test.Context.init(function(db){
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa1', Value: new $test.ComplexValue({ Value: 'bbb6', Rank: 1 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa2', Value: new $test.ComplexValue({ Value: 'bbb7', Rank: 2 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'bbb3', Value: new $test.ComplexValue({ Value: 'bbb8', Rank: 3 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa4', Value: new $test.ComplexValue({ Value: 'bbb9', Rank: 4 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa5', Value: new $test.ComplexValue({ Value: 'bbb0', Rank: 5 }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ComplexItems.toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                //console.log(data[0].Value);
                test.ok(data[0].Value instanceof $test.ComplexValue, 'Value is not complex');
                for (var i = 0; i < data.length; i++){
                    db.ComplexItems.attach(data[i]);
                    data[i].Value.Value = 'updated';
                    //console.log(data[i].entityState, data[i].Value.changedProperties);
                    data[i].Value = new $test.ComplexValue({ Value: 'updated', Rank: 1 });
                    //console.log('full update =>', data[i].entityState);
                    data[i].ForeignKey = data[i].Id;
                }
                db.saveChanges(function(cnt){
                    test.equal(cnt, 5, 'Not 5 items updated in collection');
                    db.ComplexItems.toArray(function(data2){
                        test.equal(data2.length, 5, 'Not 5 items selected from collection');
                        test.ok(data2[0].Value instanceof $test.ComplexValue, 'Value is not complex');
                        for (var i = 0; i < data2.length; i++){
                            test.equal(data2[i].Value.Value, 'updated', 'Value is not updated');
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

exports.testMapComplex = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa1', Value: new $test.ComplexValue({ Value: 'bbb6', Rank: 1 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa2', Value: new $test.ComplexValue({ Value: 'bbb7', Rank: 2 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'bbb3', Value: new $test.ComplexValue({ Value: 'bbb8', Rank: 3 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa4', Value: new $test.ComplexValue({ Value: 'bbb9', Rank: 4 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa5', Value: new $test.ComplexValue({ Value: 'bbb0', Rank: 5 }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ComplexItems.map(function(it){ return it.Value; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof Object, 'Entity is not an anonymous Object');
                test.deepEqual(data[0].initData, { Value: 'bbb6', Rank: 1 }, 'Object is not as expected');
                test.done();
            });
        });
    });
};

/*exports.testMapMoreComplex = function(test){
    test.expect(2);
    $test.Context.init(function(db){
        console.log(db._storageModel.getStorageModel('$test.MoreComplexItem').ComplexTypes, db._storageModel.getStorageModel('$test.MoreComplexItem').ComplexTypes.length);
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa1', Value: new $test.MoreComplexValue({ Value: 'bbb6', Rank: 1, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa2', Value: new $test.MoreComplexValue({ Value: 'bbb7', Rank: 2, Child: new $test.ComplexValue({ Value: 'child2', Rank: 102 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'bbb3', Value: new $test.MoreComplexValue({ Value: 'bbb8', Rank: 3, Child: new $test.ComplexValue({ Value: 'child3', Rank: 103 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa4', Value: new $test.MoreComplexValue({ Value: 'bbb9', Rank: 4, Child: new $test.ComplexValue({ Value: 'child4', Rank: 104 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa5', Value: new $test.MoreComplexValue({ Value: 'bbb0', Rank: 5, Child: new $test.ComplexValue({ Value: 'child5', Rank: 105 }) }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.MoreComplexItems.map(function(it){ return it.Value.Child.Value; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                console.log(data.map(function(it){ return it.initData; }));
                //test.ok(data[0] instanceof Object, 'Entity is not an anonymous Object');
                //test.deepEqual(data[0].initData, { Value: 'child1', Rank: 101 }, 'Object is not as expected');
                test.done();
            });
        });
    });
};*/

exports.testMapArray = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa1', Values: ['bbb6'], Rank: 1 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa2', Values: ['bbb7'], Rank: 2 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'bbb3', Values: ['bbb8'], Rank: 3 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa4', Values: ['bbb9'], Rank: 4 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa5', Values: ['bbb0'], Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ArrayItems.map(function(it){ return it.Values; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof Array, 'Entity is not an Array');
                test.deepEqual(data[0][0], 'bbb6', 'Array is not as expected');
                test.done();
            });
        });
    });
};

exports.testFilterComplex = function(test){
    test.expect(3);
    $test.Context.init(function(db){
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa1', Value: new $test.ComplexValue({ Value: 'bbb6', Rank: 1 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa2', Value: new $test.ComplexValue({ Value: 'bbb7', Rank: 2 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'bbb3', Value: new $test.ComplexValue({ Value: 'bbb8', Rank: 3 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa4', Value: new $test.ComplexValue({ Value: 'bbb9', Rank: 4 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa5', Value: new $test.ComplexValue({ Value: 'bbb0', Rank: 5 }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ComplexItems.filter(function(it){ return it.Value.Rank < this.maxRank && it.Value.Value == this.value; }, { value: 'bbb6', maxRank: 2 }).toArray(function(data){
                test.equal(data.length, 1, 'Not 5 items selected from collection');
                test.equal(data[0].Value.Rank, 1, 'Rank is not 1');
                test.done();
            });
        });
    });
};

/*exports.testFilterObject = function(test){
    test.expect(2);
    $test.Context.init(function(db){
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'aaa1', Value: { Value: 'bbb6', Rank: 1 } }));
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'aaa2', Value: { Value: 'bbb7', Rank: 2 } }));
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'bbb3', Value: { Value: 'bbb8', Rank: 3 } }));
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'aaa4', Value: { Value: 'bbb9', Rank: 4 } }));
        db.ObjectItems.add(new $test.ObjectItem({ Key: 'aaa5', Value: { Value: 'bbb0', Rank: 5 } }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            try{
                db.ObjectItems.filter(function(it){ return it.Value.Value == this.value; }, { value: 'bbb6' }).map(function(it){ return it.Value; }).toArray(function(r){
                    test.ok(typeof r[0].Value === 'string', 'Value is not string');
                    test.done();
                });
            }catch(err){
                test.ok(false, 'Filter Object unsupported');
                test.done();
            }
        });
    });
};*/

exports.testOrderByDescendingComplex = function(test){
    test.expect(3);
    $test.Context.init(function(db){
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa1', Value: new $test.ComplexValue({ Value: 'bbb6', Rank: 1 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa2', Value: new $test.ComplexValue({ Value: 'bbb7', Rank: 2 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'bbb3', Value: new $test.ComplexValue({ Value: 'bbb8', Rank: 3 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa4', Value: new $test.ComplexValue({ Value: 'bbb9', Rank: 4 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa5', Value: new $test.ComplexValue({ Value: 'bbb0', Rank: 5 }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ComplexItems.orderByDescending(function(it){ return it.Value.Rank; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.equal(data[0].Value.Rank, 5, 'Rank is not 5');
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

exports.testFilterByComplex = function(test){
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

exports.testFilterOrMany = function(test){
    test.expect(5);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return it.Rank == this.minRank || it.Rank == this.maxRank || it.Rank == this.avgRank; }, { avgRank: 1, minRank: 2, maxRank: 4 }).toArray(function(data){
                test.equal(data.length, 3, 'Not 2 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                if (data[0]) test.equal(data[0].Value, 'bbb6', 'Value of first item is not "bbb7"');
                else test.ok(false, 'Item 1 not found in result set');
                if (data[1]) test.equal(data[1].Value, 'bbb7', 'Value of second item is not "bbb9"');
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

exports.testFilterOrAnd = function(test){
    test.expect(5);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return (it.Rank == this.minRank || it.Rank == this.maxRank) && it.Rank < this.rank; }, { rank: 5, minRank: 2, maxRank: 4 }).toArray(function(data){
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
    test.expect(1);
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
                db.Items.filter(function(it){ return it.ForeignKey == this.id; }, { id: master.Id }).toArray(function(result){
                    test.done();
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
                db.Items.single(function(it){ return it.Id == this.id; }, { id: master.Id }, {
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

exports.testFilterInArray = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa1', Values: ['bbb6'], Rank: 1 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa2', Values: ['bbb7', 'bbb6'], Rank: 2 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'bbb3', Values: ['bbb8'], Rank: 3 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa4', Values: ['bbb9'], Rank: 4 }));
        db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa5', Values: ['bbb0'], Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ArrayItems.filter(function(it){ return this.value in it.Values; }, { value: 'bbb6' }).toArray(function(data){
                test.equal(data.length, 2, 'Not only 1 item filtered from collection');
                test.equal(data[0].Values[0], 'bbb6', 'First value of the first entity is not "bbb6"');
                test.equal(data[1].Values[1], 'bbb6', 'Second value of the second entity is not "bbb6"');
                test.done();
            });
        });
    });
};
