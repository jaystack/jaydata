if (typeof $data == 'undefined'){
    require('jaydata');
    exports.seed = require('./mongoProviderTestContext.js');
}
if (!$test.Context) $test.BaseContext.extend('$test.Context', {});
console.log('------------------------------------------------------------------------------------------------------')

$test.Context.init = function(callback){
    $test.context = new $test.Context({ name: 'mongoDB', databaseName: 'test', username: 'admin', password: '***', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables });
    $test.context.onReady(function(db){
        callback(db);
    });
};

exports.testFilterNavById = function(test){
    $test.Context.init(function(db){
        var b = db.NavBs.add({ NavA: {  } });
        db.saveChanges(function(cnt){
            test.equal(cnt, 2, 'Not 2 items added to collection');
            db.NavBs.include('NavA').filter(function(it){ return it.Id == this.id; }, { id: b.Id }).toArray(function(r){
                test.ok(r[0], 'query failed');
                test.done();
            });
        });
    });
};

exports.testUpdateNavigation = function(test){
    test.expect(8);
    $test.Context.init(function(db){
        var newItem = new db.Customers.elementType({ Name: 'Joe1' });
        db.Customers.add(newItem);
        db.saveChanges(function (c) {
            test.equal(c, 1, 'Customer not saved');
            var order = new db.Orders.elementType({ Amount: 14 });
            db.Orders.add(order);
            db.saveChanges(function (c) {
                test.equal(c, 1, 'Order not saved');
                db.Orders.include('Customer').filter('it.Amount == 14').toArray(function (o) {
                    test.equal(o.length, 1, 'Not 1 Order');
                    test.ok(o[0] instanceof db.Orders.elementType, 'Not Order type');
                    test.ok(!o[0].Customer, 'Order has Customer');
                    var order = o[0];
                    db.Orders.attach(order);
                    db.Customers.attach(newItem);
                    order.Customer = newItem;
                    db.saveChanges(function (c) {
                        test.equal(c, 1, 'Not 1 item updated');
                        db.Orders.include('Customer').filter('it.Amount == 14').toArray(function (o) {
                            test.ok(o[0].Customer, 'Order with no Customer');
                            test.equal(o[0].Customer.id, newItem.id, 'Customer id mismatch');
                            test.done();
                        });
                    });
                });
            });
        });
    });
};

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

exports.testInlineCount = function(test){
    test.expect(3);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter('it.Key.startsWith("aaa")').withInlineCount().take(2).toArray(function(r){
                test.equal(r.length, 2, 'Items selected from collection');
                test.equal(r.totalCount, 4, 'Not 5 (total count) items in collection');
                test.done();
            });
        });
    });
};

exports.testAddArrayArray = function (test) {
    test.expect(11);
    $test.Context.init(function (db) {
        db.ArrayArrayItems.add(new $test.ArrayArrayItem({ Key: 'aaa1', Values: [[1, 2], [2, 3], [3, 4]] }));
        db.saveChanges(function (cnt) {
            test.equal(cnt, 1, 'Not 1 item added to collection');
            db.ArrayArrayItems.toArray(function (r) {
                test.equal(r.length, 1, 'Not 1 item selected from collection');
                test.ok(r[0] instanceof $test.ArrayArrayItem, 'Entity is not an ArrayArrayItem');
                test.ok(Array.isArray(r[0].Values), 'Value is not an Array');
                test.equal(r[0].Values.length, 3, 'Value error');
                test.ok(Array.isArray(r[0].Values[0]), 'Value[0] is not an Array');
                test.equal(r[0].Values[0].length, 2, 'Value error');
                test.ok(Array.isArray(r[0].Values[1]), 'Value[0] is not an Array');
                test.equal(r[0].Values[1].length, 2, 'Value error');
                test.ok(Array.isArray(r[0].Values[2]), 'Value[0] is not an Array');
                test.equal(r[0].Values[2].length, 2, 'Value error');
                test.done();
            }).fail(function (err) {
                test.ok(false, err);
                test.done();
            });
        }).fail(function (err) {
            test.ok(false, err);
            test.done();
        });
    });
};

exports.testConverter = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.ConvertItems.add(new $test.ConvertItem({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 1, 'Not 1 item added to collection');
            db.ConvertItems.toArray(function(r){
                test.equal(r.length, 1, 'Not 5 items selected from collection');
                test.ok(r[0] instanceof $test.ConvertItem, 'Entity is not an Item');
                test.equal(r[0].Rank, 'Rank #1', 'Rank not converted');
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

exports.testAddMoreComplex = function(test){
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
};

exports.testAddObject = function(test){
    test.expect(3);
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
                test.equal(r[0].Value.Value, 'bbb6', 'Value in first object is not "bbb6"');
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

exports.testAddArrayComplex = function(test){
    test.expect(7);
    $test.Context.init(function(db){
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa1', Values: [new $test.ComplexValue({ Value: 'complex1', Rank: 1 })], Rank: 1 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa2', Values: [new $test.ComplexValue({ Value: 'complex1', Rank: 1 }), new $test.ComplexValue({ Value: 'complex2', Rank: 2 })], Rank: 2 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'bbb3', Values: [new $test.ComplexValue({ Value: 'complex3', Rank: 4 })], Rank: 3 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa4', Values: [new $test.ComplexValue({ Value: 'complex4', Rank: 8 })], Rank: 4 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa5', Values: [new $test.ComplexValue({ Value: 'complex8', Rank: 16 })], Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ArrayComplexItems.toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items in collection');
                test.ok(data[0] instanceof $test.ArrayComplexItem, 'Entity is not an ArrayComplexItem');
                test.ok(data[0].Values instanceof Array, 'Values is not an array');
                test.equal(data[1].Values.length, 2, 'Second entity has not 2 items in array type');
                test.ok(data[0].Values[0] instanceof $test.ComplexValue, 'Complex type is not typed');
                test.equal(data[1].Values[1].Rank, 2, 'Rank of item is not 2');
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

exports.testMapComplexField = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa1', Value: new $test.ComplexValue({ Value: 'bbb6', Rank: 1 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa2', Value: new $test.ComplexValue({ Value: 'bbb7', Rank: 2 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'bbb3', Value: new $test.ComplexValue({ Value: 'bbb8', Rank: 3 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa4', Value: new $test.ComplexValue({ Value: 'bbb9', Rank: 4 }) }));
        db.ComplexItems.add(new $test.ComplexItem({ Key: 'aaa5', Value: new $test.ComplexValue({ Value: 'bbb0', Rank: 5 }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ComplexItems.map(function(it){ return it.Value.Rank; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.equal(typeof data[0], 'number', 'Item is not a number');
                test.equal(data[0], 1, 'First rank is not 1');
                test.done();
            });
        });
    });
};

exports.testMapMoreComplex = function(test){
    test.expect(8);
    $test.Context.init(function(db){
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa1', Value: new $test.MoreComplexValue({ Value: 'bbb6', Rank: 1, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa2', Value: new $test.MoreComplexValue({ Value: 'bbb7', Rank: 2, Child: new $test.ComplexValue({ Value: 'child2', Rank: 102 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'bbb3', Value: new $test.MoreComplexValue({ Value: 'bbb8', Rank: 3, Child: new $test.ComplexValue({ Value: 'child3', Rank: 103 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa4', Value: new $test.MoreComplexValue({ Value: 'bbb9', Rank: 4, Child: new $test.ComplexValue({ Value: 'child4', Rank: 104 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa5', Value: new $test.MoreComplexValue({ Value: 'bbb0', Rank: 5, Child: new $test.ComplexValue({ Value: 'child5', Rank: 105 }) }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.MoreComplexItems.map(function(it){ return it.Value.Child; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof $test.ComplexValue, 'Entity is not a ComplexValue Object');
                test.deepEqual(data[0].initData, { Value: 'child1', Rank: 101 }, 'Object is not as expected');
                test.deepEqual(data[1].initData, { Value: 'child2', Rank: 102 }, 'Object is not as expected');
                test.deepEqual(data[2].initData, { Value: 'child3', Rank: 103 }, 'Object is not as expected');
                test.deepEqual(data[3].initData, { Value: 'child4', Rank: 104 }, 'Object is not as expected');
                test.deepEqual(data[4].initData, { Value: 'child5', Rank: 105 }, 'Object is not as expected');
                test.done();
            });
        });
    });
};

/*exports.testMapMoreComplexField = function(test){
    test.expect(7);
    $test.Context.init(function(db){
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa1', Value: new $test.MoreComplexValue({ Value: 'bbb6', Rank: 1, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa2', Value: new $test.MoreComplexValue({ Value: 'bbb7', Rank: 2, Child: new $test.ComplexValue({ Value: 'child2', Rank: 102 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'bbb3', Value: new $test.MoreComplexValue({ Value: 'bbb8', Rank: 3, Child: new $test.ComplexValue({ Value: 'child3', Rank: 103 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa4', Value: new $test.MoreComplexValue({ Value: 'bbb9', Rank: 4, Child: new $test.ComplexValue({ Value: 'child4', Rank: 104 }) }) }));
        db.MoreComplexItems.add(new $test.MoreComplexItem({ Key: 'aaa5', Value: new $test.MoreComplexValue({ Value: 'bbb0', Rank: 5, Child: new $test.ComplexValue({ Value: 'child5', Rank: 105 }) }) }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.MoreComplexItems.map(function(it){ return it.Value.Child.Rank; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                for (var i = 0; i < data.length; i++){
                    test.equal(data[i], i + 1, 'Rank is not ' + (i + 1));
                }
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

exports.testMapArrayComplex = function(test){
    test.expect(5);
    $test.Context.init(function(db){
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa1', Values: [new $test.ComplexValue({ Value: 'complex1', Rank: 1 })], Rank: 1 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa2', Values: [new $test.ComplexValue({ Value: 'complex1', Rank: 1 }), new $test.ComplexValue({ Value: 'complex2', Rank: 2 })], Rank: 2 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'bbb3', Values: [new $test.ComplexValue({ Value: 'complex3', Rank: 4 })], Rank: 3 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa4', Values: [new $test.ComplexValue({ Value: 'complex4', Rank: 8 })], Rank: 4 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa5', Values: [new $test.ComplexValue({ Value: 'complex8', Rank: 16 })], Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ArrayComplexItems.map(function(it){ return it.Values; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items in collection');
                test.equal(data[1].length, 2, 'Second entity has not 2 items in array type');
                test.ok(data[0][0] instanceof $test.ComplexValue, 'Complex type is not typed');
                test.equal(data[1][1].Rank, 2, 'Rank of item is not 2');
                test.done();
            });
        });
    });
};

exports.testMapArrayMoreComplex = function(test){
    test.expect(6);
    $test.Context.init(function(db){
        db.ArrayMoreComplexItems.add(new $test.ArrayMoreComplexItem({ Key: 'aaa1', Values: [new $test.MoreComplexValue({ Value: 'complex1', Rank: 1, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) })], Rank: 1 }));
        db.ArrayMoreComplexItems.add(new $test.ArrayMoreComplexItem({ Key: 'aaa2', Values: [new $test.MoreComplexValue({ Value: 'complex1', Rank: 1, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) }), new $test.MoreComplexValue({ Value: 'complex2', Rank: 2, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) })], Rank: 2 }));
        db.ArrayMoreComplexItems.add(new $test.ArrayMoreComplexItem({ Key: 'bbb3', Values: [new $test.MoreComplexValue({ Value: 'complex3', Rank: 4, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) })], Rank: 3 }));
        db.ArrayMoreComplexItems.add(new $test.ArrayMoreComplexItem({ Key: 'aaa4', Values: [new $test.MoreComplexValue({ Value: 'complex4', Rank: 8, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) })], Rank: 4 }));
        db.ArrayMoreComplexItems.add(new $test.ArrayMoreComplexItem({ Key: 'aaa5', Values: [new $test.MoreComplexValue({ Value: 'complex8', Rank: 16, Child: new $test.ComplexValue({ Value: 'child1', Rank: 101 }) })], Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ArrayMoreComplexItems.map(function(it){ return it.Values; }).toArray(function(data){
                for (var i = 0; i < data.length; i++){
                    test.ok(data[i] instanceof Array, 'Data[' + i + '] is not an array');
                } //console.log(data[i], data[i][0].Child);
                test.done();
            });
        });
    });
};

exports.testMapArrayComplexMulti = function(test){
    test.expect(6);
    $test.Context.init(function(db){
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa1', Values: [new $test.ComplexValue({ Value: 'complex1', Rank: 1 })], Rank: 1 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa2', Values: [new $test.ComplexValue({ Value: 'complex1', Rank: 1 }), new $test.ComplexValue({ Value: 'complex2', Rank: 2 })], Rank: 2 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'bbb3', Values: [new $test.ComplexValue({ Value: 'complex3', Rank: 4 })], Rank: 3 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa4', Values: [new $test.ComplexValue({ Value: 'complex4', Rank: 8 })], Rank: 4 }));
        db.ArrayComplexItems.add(new $test.ArrayComplexItem({ Key: 'aaa5', Values: [new $test.ComplexValue({ Value: 'complex8', Rank: 16 })], Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.ArrayComplexItems.map(function(it){ return { k: it.Key, v: it.Values }; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items in collection');
                test.equal(data[0].k, 'aaa1', 'Key of the first entity is not "aaa1"');
                test.equal(data[1].v.length, 2, 'Second entity has not 2 items in array type');
                test.ok(data[0].v[0] instanceof $test.ComplexValue, 'Complex type is not typed');
                test.equal(data[1].v[1].Rank, 2, 'Rank of item is not 2');
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
            }).fail(function(err){
                test.ok(false, err);
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

exports.testFilterByVeryComplex = function(test){
    test.expect(7);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return it.Key == this.key && it.Value == 'bbb6' && ('aaa1' == it.Key || it.Value == 'bbb6') && ((this.name == '') || ((this.name != '') && (it.Rank == this.rank))); }, { key: 'aaa1', name: '', rank: 2 }).toArray(function(data){
                test.equal(data.length, 1, 'Not 1 item selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Key, 'aaa1', 'Key of item is not "aaa1"');
                test.equal(data[0].Value, 'bbb6', 'Key of item is not "bbb6"');
                test.equal(data[0].Rank, 1, 'Rank of item is not 1');
                db.Items.filter(function(it){ return it.Key == this.key && it.Value == 'bbb6' && ('aaa1' == it.Key || it.Value == 'bbb6') && ((this.name == '') || ((this.name != '') && (it.Rank == this.rank))); }, { key: 'aaa1', name: 'alma', rank: 2 }).toArray(function(data){
                    test.equal(data.length, 0, 'Not 0 item selected from collection');
                    test.done();
                });
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

exports.testAddArrayID = function(test){
    test.expect(4);
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
                db.ArrayIDs.add(new $test.ArrayID({ Key: 'ids', Values: [r[0].Id, r[1].Id], Rank: 999 }));
                db.saveChanges(function(cnt){
                    test.equal(cnt, 1, 'Item not added to collection');
                    test.done();
                });
            });
        });
    });
};

exports.testUpdateArrayID = function(test){
    test.expect(8);
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
                db.ArrayIDs.add(new $test.ArrayID({ Key: 'ids', Values: [r[0].Id, r[1].Id], Rank: 999 }));
                db.saveChanges(function(cnt){
                    test.equal(cnt, 1, 'Item not added to collection');
                    db.ArrayIDs.toArray(function(r2){
                        test.equal(r2.length, 1, 'Item not added to collection');
                        db.ArrayIDs.attach(r2[0]);
                        r2[0].Values = [r[2].Id, r[3].Id];
                        db.saveChanges(function(cnt){
                            test.equal(cnt, 1, 'Item not added to collection');
                            db.ArrayIDs.toArray(function(r3){
                                test.equal(cnt, 1, 'Item not added to collection');
                                test.equal(r3[0].Values[0], r[2].Id, 'Id mismatch');
                                test.done();
                            });
                        });
                    });
                });
            });
        });
    });
};

exports.testCappedTable = function(test){
    test.expect(2);
    $test.Context.init(function(db){
        for (var i = 0; i < 20; i++){
            db.CappedItems.add(new $test.CappedItem({ Key: 'aaa1', Value: 'bbb6', Rank: i }));
        }
        db.saveChanges(function(cnt){
            test.equal(cnt, 20, 'Not 20 items added to capped collection');
            db.CappedItems.toArray(function(result){
                test.equal(result.length, 10, 'Not only 10 items in the capped collection');
                test.done();
            });
        });
    });
};

exports.CustomKeyDelete = function (test) {
    test.expect(3);
    $test.Context.init(function (db) {
        for (var i = 0; i < 20; i++) {
            db.CustomKeys.add(new $test.CustomKey({ Id: 'custom'+i.toString(), Key: 'aaa1', Value: 'bbb6', Rank: i }));
        }
        db.saveChanges(function (cnt) {
            db.CustomKeys.toArray(function (result) {
                test.equal(result.length, 20, '20 items in the collection');
                for (var i = 0; i < 10; i++) {
                    db.CustomKeys.remove(new $test.CustomKey({ Id: 'custom' + i.toString() }));
                }
                db.saveChanges(function (cnt) {
                    test.equal(cnt, 10, '10 items removed from collection');
                    db.CustomKeys.toArray(function (result) {
                        test.equal(result.length, 10, '10 items in the collection');

                        test.done();
                    }); 
                });
            });
        });
    });
};

exports.CustomKeyDeleteWithInvalidKeys = function (test) {
    test.expect(2);
    $test.Context.init(function (db) {
        for (var i = 0; i < 20; i++) {
            db.CustomKeys.add(new $test.CustomKey({ Id: 'custom' + i.toString(), Key: 'aaa1', Value: 'bbb6', Rank: i }));
        }
        db.saveChanges(function (cnt) {
            db.CustomKeys.toArray(function (result) {
                test.equal(result.length, 20, '20 items in the collection');
                db.CustomKeys.remove(new $test.CustomKey({ Rank: i }));
                db.CustomKeys.remove(new $test.CustomKey({ Id: '' }));
                //db.CustomKeys.remove(new $test.CustomKey({ Id: null }));
                console.log('ERROR: no callback when Id:null');

                db.saveChanges(function (cnt) {
                    console.log('invalid count result: ' + cnt);
                    db.CustomKeys.toArray(function (result) {
                        test.equal(result.length, 20, '20 items in the collection');
                        test.done();
                    });
                });
            });
        });
    });
};

exports.ArrayModelBinderFix = function (test) {
    test.expect(61);
    $test.Context.init(function (db) {
        for (var i = 0; i < 20; i++) {
            db.ArrayItems.add(new $test.ArrayItem({ Key: 'aaa' + i, Values: ['bbb' + i], Rank: i }));
        }
        db.saveChanges(function (cnt) {
            db.ArrayItems.toArray(function (result) {
                test.equal(result.length, 20, '20 items in the collection');
                for (var i = 0; i < 20; i++){
                    var r = result[i];
                    test.equal(r.Key, 'aaa' + i, 'Key of item ' + i + ' is bad');
                    test.ok(r.Values instanceof Array, 'Values of item ' + i + ' is not an array');
                    test.equal(r.Values[0], 'bbb' + i, 'Values first element of item ' + i + ' is bad');
                }
                test.done();
            });
        });
    });
};

exports.testOrderByIdDescending = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.orderByDescending(function(it){ return it.Id; }).toArray(function(data){
                test.equal(data.length, 5, 'Not 5 items selected from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Value, 'bbb0', 'Value of first item is not "bbb0"');
                test.done();
            });
        });
    });
};

exports.testNotContains = function(test){
    test.expect(4);
    $test.Context.init(function(db){
        db.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
        db.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
        db.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
        db.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
        db.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
        db.saveChanges(function(cnt){
            test.equal(cnt, 5, 'Not 5 items added to collection');
            db.Items.filter(function(it){ return !it.Key.contains('aaa'); }).toArray(function(data){
                test.equal(data.length, 1, 'Not only 1 item from collection');
                test.ok(data[0] instanceof $test.Item, 'Entity is not an Item');
                test.equal(data[0].Key, 'bbb3', 'Key of item is not "bbb3"');
                test.done();
            });
        });
    });
};

providerConfig = { name: 'mongoDB', databaseName: 'T3', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables };

exports.testLengthWithInclude = function (test) {
    test.expect(1);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.filter(function(it){ return it.Category.Id == 1; }).length(function(cnt){
                test.equal(cnt, 5, 'Count of items with Category Id 1 is not 5');
                test.done();
            });
        });
    });
};
exports.Filter_noFilter = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(9);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.Tags;
            q.toArray(function (r) {
                test.ok(r, "faild query");
                test.equal(r.length, 5, 'Number of tags faild');
                for (var i = 0; i < r.length; i++) {
                    test.ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
                }
                test.equal(typeof r[0].Id, 'number', 'Field type error: Id');
                test.equal(typeof r[0].Title, 'string', 'Field type error: Id');
                test.done();
            });

        });
    });
};
exports.Filter_noFilter_orderby = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(13);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.Tags.orderBy(function (t) { return t.Title });
            q.toArray(function (r) {
                test.ok(r, "faild query");
                test.equal(r.length, 5, 'Number of tags faild');
                var preItem = null;
                for (var i = 0; i < r.length; i++) {
                    test.ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
                    if (preItem) {
                        test.ok(preItem < r[i].Title, 'Order error at ' + i + ' position');
                    }
                    preItem = r[i].Title;
                }
                test.equal(typeof r[0].Id, 'number', 'Field type error: Id');
                test.equal(typeof r[0].Title, 'string', 'Field type error: Id');
                test.done();
            });

        });
    });
};
exports.Filter_noFilter_orderbyDesc = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(13);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.Tags.orderByDescending(function (t) { return t.Title });
            q.toArray(function (r) {
                test.ok(r, "faild query");
                test.equal(r.length, 5, 'Number of tags faild');
                var preItem = null;
                for (var i = 0; i < r.length; i++) {
                    test.ok(r[i] instanceof $news.Types.Tag, 'Data type error at ' + i + ' position');
                    if (preItem) {
                        test.ok(preItem > r[i].Title, 'Order error at ' + i + ' position');
                    }
                    preItem = r[i].Title;
                }
                test.equal(typeof r[0].Id, 'number', 'Field type error: Id');
                test.equal(typeof r[0].Title, 'string', 'Field type error: Id');
                test.done();
            });

        });
    });
};
exports.Filter_noFilter_multiple_orderby = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(15);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.UserProfiles.orderByDescending(function (t) { return t.FullName }).orderBy(function (t) { return t.Bio });
            q.toArray(function (r) {
                //start(1); console.dir(r);
                test.ok(r, "faild query");
                test.equal(r.length, 6, 'Number of tags faild');
                var preItem = null;
                for (var i = 0; i < r.length; i++) {
                    test.ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
                    if (preItem) {
                        test.ok((preItem.FullName > r[i].FullName) || ((preItem.FullName == r[i].FullName) && (preItem.Bio < r[i].Bio)), 'Order error at ' + i + ' position');
                    }
                    preItem = r[i];
                }
                test.equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
                test.equal(typeof r[0].Bio, 'string', 'Field type error: Bio');
                test.done();
            });

        });
    });
};
exports.Filter_noFilter_multiple_orderby = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(9);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.UserProfiles.orderBy(function (t) { return t.Bio }).skip(1).take(2);
            q.toArray(function (r) {
                test.ok(r, "faild query");
                test.equal(r.length, 2, 'Number of tags faild');
                var preItem = null;
                for (var i = 0; i < r.length; i++) {
                    test.ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
                    if (preItem) {
                        test.ok(preItem.Bio < r[i].Bio, 'Order error at ' + i + ' position');
                    }
                    preItem = r[i];
                }
                test.equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
                test.equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

                test.equal(r[0].Bio, 'Bio2', 'Data integrity error');
                test.equal(r[1].Bio, 'Bio3', 'Data integrity error');
                test.done();
            });

        });
    });
};
exports.Filter_scalar_field_use_one_one_relation = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(9);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.Users.filter(function (u) { return u.Profile.Bio == "Bio3" });
            q.toArray(function (r) {
                //start(1); console.dir(r);
                test.ok(r, "faild query");
                test.equal(r.length, 1, 'Number of tags faild');
                test.ok(r[0] instanceof $news.Types.User, 'Data type error');
                test.equal(typeof r[0].Id, 'number', 'Field type error: Id');
                test.equal(typeof r[0].LoginName, 'string', 'Field type error: LoginName');
                test.equal(typeof r[0].Email, 'string', 'Field type error: Email');

                test.equal(r[0].Id, '5', 'Data integrity error');
                test.equal(r[0].LoginName, 'Usr3', 'Data integrity error');
                test.equal(r[0].Email, 'usr3@company.com', 'Data integrity error');
                test.done();
            });

        });
    });
};
exports.Filter_noFilter_multiple_orderby = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(9);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.UserProfiles.orderBy(function (t) { return t.Bio }).skip(1).take(2);
            q.toArray(function (r) {
                test.ok(r, "faild query");
                test.equal(r.length, 2, 'Number of tags faild');
                var preItem = null;
                for (var i = 0; i < r.length; i++) {
                    test.ok(r[i] instanceof $news.Types.UserProfile, 'Data type error at ' + i + ' position');
                    if (preItem) {
                        test.ok(preItem.Bio < r[i].Bio, 'Order error at ' + i + ' position');
                    }
                    preItem = r[i];
                }
                test.equal(typeof r[0].FullName, 'string', 'Field type error: FullName');
                test.equal(typeof r[0].Bio, 'string', 'Field type error: Bio');

                test.equal(r[0].Bio, 'Bio2', 'Data integrity error');
                test.equal(r[1].Bio, 'Bio3', 'Data integrity error');
                test.done();
            });

        });
    });
};
exports.Update_Articles_Title = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(5);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 3 }).toArray(function (result) {
                test.ok(result, 'query failed');
                test.equal(result.length, 1, 'not only 1 row in result set');
                var a = result[0];
                db.Articles.attach(a);
                a.Title = 'updatedArticleTitle';
                db.saveChanges(function (cnt) {
                    db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 3 }).toArray(function (result) {
                        test.ok(result, 'query failed');
                        test.equal(result.length, 1, 'not only 1 row in result set');
                        var a = result[0];
                        test.equal(a.Title, 'updatedArticleTitle', 'update failed');
                        test.done();
                    });
                });
            });
        });
    });
};
exports.Batch_Update_Articles = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(29);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.toArray(function (result) {
                test.ok(result, 'query failed');
                for (var i = 0; i < result.length; i++) {
                    var a = result[i];
                    db.Articles.attach(a);
                    a.Title = 'updatedArticleTitle';
                }
                db.saveChanges(function () {
                    db.Articles.toArray(function (result) {
                        test.ok(result, 'query failed');
                        test.equal(result.length, 26, 'not only 1 row in result set');
                        for (var i = 0; i < result.length; i++) {
                            var a = result[i];
                            test.equal(a.Title, 'updatedArticleTitle', 'update failed');
                        }
                        test.done();
                    });
                });
            });
        });
    });
};

exports.Include_Articles_in_Category = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Categories.include('Articles').toArray(function (result) {
                test.ok(result, 'query failed');
                var a = result[0];
                test.equal(a.Articles instanceof Array, true, 'Articles is not an Array');
                test.equal(a.Articles[0] instanceof $news.Types.Article, true, 'First element in articles is not a $news.Types.Article');
                test.equal(typeof a.Articles[0].Title == 'string', true, 'Article.Title is not a string');
                test.done();
            });
        });
    });
};

exports.Include_Category_in_Article = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.include('Category').toArray(function (result) {
                test.ok(result, 'query failed');
                var a = result[0];
                test.equal(a.Category instanceof $news.Types.Category, true, 'Category is not an Category');
                test.equal(typeof a.Category.Title == 'string', true, 'Article.Title is not a string');
                test.done();
            });
        });
    });
};
//test('Delete_with_Include', function () {
//    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
//    expect(1);
//    stop(8);
//    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
//        start(1);
//        $news.Types.NewsContext.generateTestData(db, function () {
//            start(1);

//            db.Categories.map(function (item) { return item.Title; }).toArray(function (result) {
//                start(1);
//                console.log(result);
//                var before = result.length;
//                db.TagConnections.filter(function (item) { return item.Article.Id == 1; }).toArray(function (result) {
//                    start(1);
//                    for (var i = 0; i < result.length; i++) {
//                        db.TagConnections.remove(result[i]);
//                    }
//                    db.saveChanges(function () {
//                        start(1);
//                        db.Articles.include('Category').single(function (item) { return item.Id == 1; }, null, {
//                            success: function (result) {
//                                start(1);
//                                console.log(result);
//                                //db.Articles.attach(result);
//                                db.Articles.remove(result);
//                                db.saveChanges(function () {
//                                    start(1);
//                                    db.Categories.map(function (item) { return item.Title; }).toArray(function (result) {
//                                        start(1);
//                                        console.log(result);
//                                        var after = result.length;
//                                        equals(after, before, 'categories changed');
//                                    });
//                                })
//                            },
//                            error: function (error) {
//                                console.dir(error);
//                            }
//                        });
//                    });
//                });
//            });
//        });
//    });
//});
exports.Update_Articles_and_add_new_TagConnection = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(7);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                test.ok(result, 'query failed');
                test.equal(result.length, 1, 'not only 1 row in result set');
                var a = result[0];
                db.Articles.attach(a);
                a.Title = 'updatedArticleTitle';
                db.saveChanges({
                    success: function () {
                        db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                            test.ok(result, 'query failed');
                            test.equal(result.length, 1, 'not only 1 row in result set');
                            var a = result[0];
                            test.equal(a.Title, 'updatedArticleTitle', 'update failed');
                            db.Articles.attach(a);
                            db.TagConnections.add(new $news.Types.TagConnection({ Article: a, Tag: new $news.Types.Tag({ Title: 'newtag' }) }));
                            db.saveChanges({
                                success: function () {
                                    db.TagConnections.filter(function (item) { return item.Article.Id == 1 && item.Tag.Title == 'newtag'; }).toArray(function (result) {
                                        test.ok(result, 'query failed');
                                        test.equal(result.length, 1, 'not only 1 row in result set');
                                        test.done();
                                    });
                                },
                                error: function (error) {
                                    console.dir(error);
                                    test.ok(false, error);
                                    test.done();
                                }
                            });
                        });
                    },
                    error: function (error) {
                        console.dir(error);
                        test.ok(false, error);
                        test.done();
                    }
                });
            });
        });
    });
};
exports.full_table_length = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(2);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.length({
                success: function (result) {
                    test.ok(result, 'query failed');
                    test.equal(result, 26, 'not only 1 row in result set');
                    test.done();
                    //console.dir(result);
                },
                error: function (error) {
                    console.dir(error);
                    test.ok(false, error);
                    test.done();
                }
            });
        });
    });
};
exports.full_table_single = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(2);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.single(function (a) { return a.Id == 1; }, null, {
                success: function (result) {
                    test.ok(result, 'query failed');
                    test.ok(result instanceof $news.Types.Article, 'Result faild');
                    test.done();
                },
                error: function (error) {
                    console.dir(error);
                    test.ok(false, error);
                    test.done();
                }
            });
        });
    });
};
exports.full_table_single_faild = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(1);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.single(function (a) { return a.Id > 1; }, null, {
                success: function (result) {
                    test.ok(false, 'Single return more than 1 item');
                    test.done();
                },
                error: function (error) {
                    test.ok(true, 'OK');
                    test.done();
                }
            });
        });
    });
};
exports.delete_with_in_operator = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(2);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.TagConnections.map(function (item) { return item.Tag.Id; }).toArray(function (ids) {
                db.Tags.filter(function (item) { return !(item.Id in this.tags); }, { tags: ids }).toArray(function (result) {
                    test.ok(result, 'query error');
                    test.equal(result.length, 2, 'query number faild');
                    test.done();
                });
            });
        });
    });
};
exports.navigation_property_both_side = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(48);
    var c = $data.createContainer();
    
    $data.Class.define("$navProp.Category", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        Title: { dataType: "string" },
        Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
    }, null);
    $data.Class.define("$navProp.Article", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        Title: { dataType: "string" },
        Category: { dataType: "$navProp.Category", inverseProperty: "Articles" },
        Author: { dataType: "$navProp.User", inverseProperty: "Articles" },
    }, null);
    $data.Class.define("$navProp.User", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        LoginName: { dataType: "string" },
        Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Author" },
        Profile: { dataType: "$navProp.UserProfile", inverseProperty: "User" },
    }, null);
    $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        FullName: { dataType: "string" },
        User: { dataType: "$navProp.User", inverseProperty: "Profile", required: true }
    }, null);
    var $navProp = c.$navProp;
    $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
        Categories: { dataType: $data.EntitySet, elementType: $navProp.Category },
        Articles: { dataType: $data.EntitySet, elementType: $navProp.Article },
        Users: { dataType: $data.EntitySet, elementType: $navProp.User },
        UserProfiles: { dataType: $data.EntitySet, elementType: $navProp.UserProfile },
    }, null);
    (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

        var storageModel = db._storageModel.getStorageModel($navProp.Category);
        var assoc = storageModel.Associations['Articles'];
        test.equal(assoc.From, 'Category', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
        test.equal(assoc.To, 'Article', 'To property value error');
        test.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

        //////// Article
        storageModel = db._storageModel.getStorageModel($navProp.Article);
        assoc = storageModel.Associations['Category'];
        test.equal(assoc.From, 'Article', 'From property value error');
        test.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
        test.equal(assoc.To, 'Category', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

        assoc = storageModel.Associations['Author'];
        test.equal(assoc.From, 'Article', 'From property value error');
        test.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
        test.equal(assoc.To, 'User', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


        ///////User
        storageModel = db._storageModel.getStorageModel($navProp.User);
        assoc = storageModel.Associations['Articles'];
        test.equal(assoc.From, 'User', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
        test.equal(assoc.To, 'Article', 'To property value error');
        test.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

        assoc = storageModel.Associations['Profile'];
        test.equal(assoc.From, 'User', 'From property value error');
        test.equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
        test.equal(assoc.To, 'UserProfile', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

        ///////UserProfile
        storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
        assoc = storageModel.Associations['User'];
        test.equal(assoc.From, 'UserProfile', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
        test.equal(assoc.To, 'User', 'To property value error');
        test.equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
        
        test.done();
    });
};
exports.navigation_property_one_side = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(48);
    var c = $data.createContainer();
    
    $data.Class.define("$navProp.Category", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        Title: { dataType: "string" },
        Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Category" }
    }, null);
    $data.Class.define("$navProp.Article", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        Title: { dataType: "string" },
        Category: { dataType: "$navProp.Category" },
        Author: { dataType: "$navProp.User" },
    }, null);
    $data.Class.define("$navProp.User", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        LoginName: { dataType: "string" },
        Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: "Author" },
        Profile: { dataType: "$navProp.UserProfile", inverseProperty: "User" },
    }, null);
    $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        FullName: { dataType: "string" },
        User: { dataType: "$navProp.User", required: true }
    }, null);
    var $navProp = c.$navProp;
    $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
        Categories: { dataType: $data.EntitySet, elementType: $navProp.Category },
        Articles: { dataType: $data.EntitySet, elementType: $navProp.Article },
        Users: { dataType: $data.EntitySet, elementType: $navProp.User },
        UserProfiles: { dataType: $data.EntitySet, elementType: $navProp.UserProfile },
    }, null);
    (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

        var storageModel = db._storageModel.getStorageModel($navProp.Category);
        var assoc = storageModel.Associations['Articles'];
        test.equal(assoc.From, 'Category', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
        test.equal(assoc.To, 'Article', 'To property value error');
        test.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

        //////// Article
        storageModel = db._storageModel.getStorageModel($navProp.Article);
        assoc = storageModel.Associations['Category'];
        test.equal(assoc.From, 'Article', 'From property value error');
        test.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
        test.equal(assoc.To, 'Category', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

        assoc = storageModel.Associations['Author'];
        test.equal(assoc.From, 'Article', 'From property value error');
        test.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
        test.equal(assoc.To, 'User', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


        ///////User
        storageModel = db._storageModel.getStorageModel($navProp.User);
        assoc = storageModel.Associations['Articles'];
        test.equal(assoc.From, 'User', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
        test.equal(assoc.To, 'Article', 'To property value error');
        test.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

        assoc = storageModel.Associations['Profile'];
        test.equal(assoc.From, 'User', 'From property value error');
        test.equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
        test.equal(assoc.To, 'UserProfile', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

        ///////UserProfile
        storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
        assoc = storageModel.Associations['User'];
        test.equal(assoc.From, 'UserProfile', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
        test.equal(assoc.To, 'User', 'To property value error');
        test.equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
        
        test.done();
    });
};
exports.navigation_property_many_side = function (test) {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    test.expect(48);
    var c = $data.createContainer();
    
    $data.Class.define("$navProp.Category", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        Title: { dataType: "string" },
        Articles: { dataType: "Array", elementType: "$navProp.Article", inverseProperty: 'Category' }
    }, null);
    $data.Class.define("$navProp.Article", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        Title: { dataType: "string" },
        Category: { dataType: "$navProp.Category", inverseProperty: "Articles" },
        Author: { dataType: "$navProp.User", inverseProperty: "Articles" },
    }, null);
    $data.Class.define("$navProp.User", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        LoginName: { dataType: "string" },
        Articles: { dataType: "Array", elementType: c.$navProp.Article },
        Profile: { dataType: "$navProp.UserProfile" },
    }, null);
    $data.Class.define("$navProp.UserProfile", $data.Entity, c, {
        Id: { dataType: "int", key: true, computed: true },
        FullName: { dataType: "string" },
        User: { dataType: "$navProp.User", inverseProperty: "Profile", required: true }
    }, null);
    var $navProp = c.$navProp;
    $data.Class.define("$navProp.NewsContext", $data.EntityContext, c, {
        Categories: { dataType: $data.EntitySet, elementType: $navProp.Category },
        Articles: { dataType: $data.EntitySet, elementType: $navProp.Article },
        Users: { dataType: $data.EntitySet, elementType: $navProp.User },
        UserProfiles: { dataType: $data.EntitySet, elementType: $navProp.UserProfile },
    }, null);
    (new $navProp.NewsContext(providerConfig)).onReady(function (db) {

        var storageModel = db._storageModel.getStorageModel($navProp.Category);
        var assoc = storageModel.Associations['Articles'];
        test.equal(assoc.From, 'Category', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Category, 'FromType property value error');
        test.equal(assoc.To, 'Article', 'To property value error');
        test.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Category', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

        //////// Article
        storageModel = db._storageModel.getStorageModel($navProp.Article);
        assoc = storageModel.Associations['Category'];
        test.equal(assoc.From, 'Article', 'From property value error');
        test.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Category', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
        test.equal(assoc.To, 'Category', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Category, 'ToType property value error');

        assoc = storageModel.Associations['Author'];
        test.equal(assoc.From, 'Article', 'From property value error');
        test.equal(assoc.FromMultiplicity, '*', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Author', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.Article, 'FromType property value error');
        test.equal(assoc.To, 'User', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Articles', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');


        ///////User
        storageModel = db._storageModel.getStorageModel($navProp.User);
        assoc = storageModel.Associations['Articles'];
        test.equal(assoc.From, 'User', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Articles', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
        test.equal(assoc.To, 'Article', 'To property value error');
        test.equal(assoc.ToMultiplicity, '*', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Author', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.Article, 'ToType property value error');

        assoc = storageModel.Associations['Profile'];
        test.equal(assoc.From, 'User', 'From property value error');
        test.equal(assoc.FromMultiplicity, '1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'Profile', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.User, 'FromType property value error');
        test.equal(assoc.To, 'UserProfile', 'To property value error');
        test.equal(assoc.ToMultiplicity, '0..1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'User', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.UserProfile, 'ToType property value error');

        ///////UserProfile
        storageModel = db._storageModel.getStorageModel($navProp.UserProfile);
        assoc = storageModel.Associations['User'];
        test.equal(assoc.From, 'UserProfile', 'From property value error');
        test.equal(assoc.FromMultiplicity, '0..1', 'FromMultiplicity property value error');
        test.equal(assoc.FromPropertyName, 'User', 'FromPropertyName property value error');
        test.strictEqual(assoc.FromType, $navProp.UserProfile, 'FromType property value error');
        test.equal(assoc.To, 'User', 'To property value error');
        test.equal(assoc.ToMultiplicity, '1', 'ToMultiplicity property value error');
        test.equal(assoc.ToPropertyName, 'Profile', 'ToPropertyName property value error');
        test.strictEqual(assoc.ToType, $navProp.User, 'ToType property value error');
        
        test.done();
    });
};

exports['Select_with_constant_value'] = function (test) {
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.map(function (a) { return { title: a.Title, c: 5 } }).toArray({
                success: function (result) {
                    //if (providerConfig.name != "sqLite") { test.ok(false, "Not supported fail"); return; }
                    test.expect(3);
                    test.ok(result, 'query failed');
                    var a = result[0];
                    test.equal(a.c, 5, 'result const value failed');
                    test.equal(typeof a.title === 'string', true, 'result field type failed');
                    test.done();
                },
                error: function (e) {
                    //if (providerConfig.name != "oData") { test.ok(true, "Not supported fail"); return; }
                    test.expect(2);
                    test.ok(e, 'query failed');
                    test.equal(e.message, 'Constant value is not supported in Projection.', 'projection constant expression error failed');
                    test.done();
                }
            });
        });
    });
};

/*exports.OrderBy_complex = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(2);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        var q = db.Articles.orderBy(function (a) { return a.Id + 5; }).toTraceString();
        test.equal(q.queryText, "/Articles?$orderby=(Id add 5)", 'complex order by failed');

        q = db.Articles.orderBy(function (a) { return a.Body.concat(a.Lead); }).toTraceString();
        test.equal(q.queryText, "/Articles?$orderby=concat(Body,Lead)", 'complex order by failed');
        test.done();
    });
};*/

/*exports.OData_Function_Import_ComplexType = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredLocation(4, 'Art').then(function (result) {
                test.ok(result);
                test.ok(result instanceof $news.Types.Location, 'Return type faild');
                test.ok(result.Address.length > 0, 'Title faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_ComplexTypes = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredLocations(4, 'Art').toArray(function (result) {
                test.ok(result);
                test.ok(result[0] instanceof $news.Types.Location, 'Return type faild');
                test.ok(result[1].Address.length > 0, 'Title faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_Scalar = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(2);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredArticlesCount(4, 'Art').then(function (result) {
                test.ok(result);
                test.ok(typeof result === 'number', 'Return type faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_ScalarList = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredArticlesId(4, 'Art').toArray(function (result) {
                test.ok(result);
                test.ok(typeof result[0] === 'number', 'Return type faild');
                test.ok(typeof result[1] === 'number', 'Return type faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_ScalarList2 = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredArticlesId(4, 'Art', function (result) {
                test.ok(result);
                test.ok(typeof result[0] === 'number', 'Return type faild');
                test.ok(typeof result[1] === 'number', 'Return type faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_Articles = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredArticles(4, 'Art').toArray(function (result) {
                test.ok(result);
                test.equal(result.length, 22, 'Result number faild');
                test.ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                test.ok(result[1].Title.length > 0, 'Title faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_ArticleList = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredArticleList(4, 'Art').toArray(function (result) {
                test.ok(result);
                test.ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                test.ok(result[1].Title.length > 0, 'Title faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_ArticleObject = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredArticle(4, 'Art').then(function (result) {
                test.ok(result);
                test.ok(result instanceof $news.Types.Article, 'Return type faild');
                test.ok(result.Title.length > 0, 'Title faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_Articles_With_PostFilter = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredArticles(4, 'Art').filter(function (a) { return a.Id < 10;}).toArray(function (result) {
                test.ok(result);
                test.equal(result.length, 5, 'Result number faild');
                test.ok(result[0] instanceof $news.Types.Article, 'Return type faild');
                test.ok(result[1].Title.length > 0, 'Title faild');
                test.done();
            })
        });
    });
};
exports.OData_Function_Import_Articles_With_PostFilter_Map = function () {
    if (providerConfig.name == "sqLite") { test.ok(true, "Not supported"); return; }
    test.expect(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.PrefilteredArticles(4, 'Art').filter(function (a) { return a.Id < 10; }).map(function (a) { return {T:a.Id}}).toArray(function (result) {
                test.ok(result);
                test.equal(result.length, 5, 'Result number faild');
                test.ok(!(result[0] instanceof $news.Types.Article), 'Return type faild');
                test.ok(typeof result[1].T === 'number', 'Filed data type error');
                test.done();
            })
        });
    });
};*/

test = function(n, e, cb){
    if (!cb && typeof e == 'function') cb = e;
    exports[n] = function(test){
        if (typeof expect == 'number') test.expect(e);
        var d = 0;
        expect = function(e){
            test.expect(e);
        };
        stop = function(s){
            if (s) d += s;
            else d++;
        };
        start = function(s){
            if (s) d -= s;
            else d--;
            if (d <= 0){
                test.done();
            }
        };
        equal = test.equal;
        notEqual = test.notEqual;
        deepEqual = test.deepEqual;
        ok = test.ok;
        cb();
        if (d <= 0) test.done();
    }
};

test("OData_Function_sub_frames", function () {
    if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    expect(11);
    stop(7);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var q = db.Categories.filter(function (ctg) { return ctg.Articles.some(); });
            //var c = q.toTraceString();
            //equal(c.queryText, "/Categories?$filter=Articles/any()", "A0: Invalid query string");

            q.toArray({
                success: function (result) {
                    equal(result.length, 5, 'A0: result length failed');
                    equal(result[0].Title, 'Sport', 'A0: result value failed');
                    start();
                },
                error: function (e) {
                    ok(false, 'A0: Category some article, error: ' + e);
                    start();
                }
            });

            var articleFilter = db.Articles.filter(function (art) { return art.Title == 'Article1'; });
            var q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
            //c = q.toTraceString();
            //equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Title eq 'Article1'))", "A1: Invalid query string");

            q.toArray({
                success: function (result) {
                    equal(result.length, 1, 'A1: result length failed');
                    equal(result[0].Title, 'Sport', 'A1: result value failed');
                    start();
                },
                error: function (e) {
                    ok(false, 'A1: Category some article.Title == "Article1", error: ' + e);
                    start();
                }
            });

            q = db.Categories.filter(function (ctg) { return ctg.Articles.every(this.filter); }, { filter: articleFilter });
            //c = q.toTraceString();
            //equal(c.queryText, "/Categories?$filter=Articles/all(art: (art/Title eq 'Article1'))", "A2: Invalid query string");

            q.toArray({
                success: function (result) {
                    equal(result.length, 0, 'A2: result length failed');
                    start();
                },
                error: function (e) {
                    ok(false, 'A2: Category every article.Title == "Article1", error: ' + e);
                    start();
                }
            });

            articleFilter = db.Articles.filter(function (art) { return art.Author.Profile.FullName == 'Full Name2'; });
            q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
            //c = q.toTraceString();
            //equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Author/Profile/FullName eq 'Full Name2'))", "A3: Invalid query string");

            q.toArray({
                success: function (result) {
                    equal(result.length, 5, 'A3: result length failed');
                    equal(result[0].Title, 'Sport', 'A3: result value failed');
                    start();
                },
                error: function (e) {
                    ok(false, 'A3: Category some article Author.Profile.Fullname "Full Name2", error: ' + e);
                    start();
                }
            });

            articleFilter = db.Articles.filter(function (art) { return art.Author.Profile.FullName == 'Starts With Test'; });
            q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter });
            //c = q.toTraceString();
            //equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Author/Profile/FullName eq 'Starts With Test'))", "A4: Invalid query string");

            q.toArray({
                success: function (result) {
                    equal(result.length, 1, 'A4: result length failed');
                    equal(result[0].Title, 'Politics', 'A4: result value failed');
                    start();
                },
                error: function (e) {
                    ok(false, 'A4: Category some article Author.Profile.Fullname "Starts With Test", error: ' + e);
                    start();
                }
            });


            var tagFilter = db.TagConnections.filter(function (tagCon) { return tagCon.Tag.Title == 'Tag1'; });
            articleFilter = db.Articles.filter(function (art) { return art.Tags.some(this.filter); }, { filter: tagFilter });
            q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter })
            //c = q.toTraceString();
            //equal(c.queryText, "/Categories?$filter=Articles/any(art: art/Tags/any(tagCon: (tagCon/Tag/Title eq 'Tag1')))", "A5: Invalid query string");

            q.toArray({
                success: function (result) {
                    equal(result.length, 5, 'A5: result length failed');
                    equal(result[0].Title, 'Sport', 'A5: result value failed');
                    start();
                },
                error: function (e) {
                    ok(false, 'A5: Category some article Articles.Tags.some TagConnections.Tag.Title "Tag1", error: ' + e);
                    start();
                }
            });

            tagFilter = db.TagConnections.filter(function (tagCon) { return tagCon.Tag.Title == 'Tag3'; });
            articleFilter = db.Articles.filter(function (art) { return art.Tags.some(this.filter) && art.Author.LoginName == 'Usr4'; }, { filter: tagFilter });
            q = db.Categories.filter(function (ctg) { return ctg.Articles.some(this.filter); }, { filter: articleFilter })
            //c = q.toTraceString();
            //equal(c.queryText, "/Categories?$filter=Articles/any(art: (art/Tags/any(tagCon: (tagCon/Tag/Title eq 'Tag3')) and (art/Author/LoginName eq 'Usr4')))", "A6: Invalid query string");

            q.toArray({
                success: function (result) {
                    start();
                    equal(result.length, 3, 'A6: result length failed');
                    equal(result[0].Title, 'World', 'A6: result value failed');
                },
                error: function (e) {
                    start();
                    ok(false, 'A6: Category some article Tags some tag connections Tag.Title "Tag3" and article Author.LoginName "Usr4", error: ' + e);
                }
            });
        });
    });
});

test('remove_navgation_property_value', function () {
    expect(4);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.include('Category').filter('it.Id == 1').toArray(function (items) {
                var item = items[0];
                db.Articles.attach(item);
                notEqual(item.Category, null, 'article category is not null');
                equal(item.Category instanceof $news.Types.Category, true, 'article category is Category');

                item.Category = null;
                equal(item.Category, null, 'article category set to null');

                db.saveChanges(function () {

                    db.Articles.include('Category').filter('it.Id == 1').toArray(function (items2) {
                        equal(items2[0].Category, null, 'article has valid category value');

                        start();
                    });
                });
            });
        });
    });
});

test('remove navgation property value without inclue', function () {
    expect(4);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.filter('it.Id == 1').toArray(function (items) {
                var item = items[0];
                db.Articles.attach(item);
                ok(item.Category !== null, 'article category is not null');
                equal(item.Category, undefined, 'article category is undefined');

                item.Category = null;
                equal(item.Category, null, 'article category set to null');

                db.saveChanges(function () {

                    db.Articles.include('Category').filter('it.Id == 1').toArray(function (items2) {
                        equal(items2[0].Category, null, 'article has valid category value');

                        start();
                    });
                });
            });
        });
    });
});

test('load entity without include', function () {
    expect(3);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.add({ Title: 'TitleData', Lead: 'LeadData' });
            db.saveChanges(function () {


                db.Articles.single('it.Title == "TitleData"', null, function (item) {
                    db.Articles.attach(item);
                    ok(item.Category === undefined, 'article category is undefined');
                    equal(item.Title, 'TitleData', 'item title');
                    equal(item.Lead, 'LeadData', 'item lead');

                    start();
                });
            });
        });
    });
});

test('load entity with include', function () {
    expect(3);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            db.Articles.add({ Title: 'TitleData', Lead: 'LeadData' });
            db.saveChanges(function () {


                db.Articles.include('Category').single('it.Title == "TitleData"', null, function (item) {
                    db.Articles.attach(item);
                    ok(item.Category === null, 'article category is null');
                    equal(item.Title, 'TitleData', 'item title');
                    equal(item.Lead, 'LeadData', 'item lead');

                    start();
                });
            });
        });
    });
});

test('date null value', function () {
    expect(2);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var a1 = new db.Articles.elementType({ Title: '123', Lead: 'asd', CreateDate: null });
            db.Articles.add(a1);
            db.saveChanges({
                success: function () {
                    db.Articles.filter('it.Title === "123" || it.Id === 1').toArray(function (res) {
                        if (res[0].CreateDate === null) {
                            equal(res[0].CreateDate, null, 'CreateDate is null')
                            notEqual(res[1].CreateDate, null, 'CreateDate not null')
                        } else {
                            equal(res[1].CreateDate, null, 'CreateDate is null')
                            notEqual(res[0].CreateDate, null, 'CreateDate not null')
                        }

                        start();
                    });
                },
                error: function () {
                    ok(false, 'error called');
                    start();
                }
            });
        });
    });
});
test('batch error handler called', function () {
    if (providerConfig.name == "sqLite" || providerConfig.name == "mongoDB") { ok(true, "Not supported"); return; }
    expect(1);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {

            var a1 = db.Articles.attachOrGet({ Id: 1 });
            a1.Title = 'changed2';

            var a2 = db.Articles.attachOrGet({ Id: 2 });
            a2.Title = 'changed2';

            db.saveChanges({
                success: function () {
                    ok(false, 'save success');
                    start();
                },
                error: function () {
                    ok(true, 'error called');
                    start();
                }
            });
        });
    });
});
test('map as jaydata type', function () {
    expect(6);

    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.orderBy('it.Id').map(function (a) { return { Id: a.Id, Lead: a.Lead, Body: a.Body, Category: a.Category }; }, null, $news.Types.Article).toArray(function (art) {
                equal(art[1] instanceof $news.Types.Article, true, 'result is typed');

                equal(typeof art[1].Id, 'number', 'result Id is typed');
                equal(typeof art[1].Lead, 'string', 'result Lead is typed');
                equal(typeof art[1].Body, 'string', 'result Body is typed');
                equal(typeof art[1].CreateDate, 'undefined', 'result CreateDate is undefined');
                equal(art[1].Category instanceof $news.Types.Category, true, 'art[1].Category is Array');

                start();
            });
        });

    });
});
test('map as default', function () {
    expect(6);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.orderBy('it.Id').map(function (a) { return { Id: a.Id, Lead: a.Lead, Body: a.Body, Category: a.Category }; }, null, 'default').toArray(function (art) {
                equal(art[1] instanceof $news.Types.Article, true, 'result is typed');

                equal(typeof art[1].Id, 'number', 'result Id is typed');
                equal(typeof art[1].Lead, 'string', 'result Lead is typed');
                equal(typeof art[1].Body, 'string', 'result Body is typed');
                equal(typeof art[1].CreateDate, 'undefined', 'result CreateDate is undefined');
                equal(art[1].Category instanceof $news.Types.Category, true, 'art[1].Category is Array');

                start();
            });
        });

    });
});
test('sqLite 0..1 table generation not required', function () {
    if (providerConfig.name == "oData" || providerConfig.name == "mongoDB") { ok(true, "Not supported"); return; }

    expect(1);
    stop(1);

    $data.Class.define('$example.Types.AClass1', $data.Entity, null, {
        Id: { type: 'int', key: true, computed: true },
        Name: { type: 'string' },
        BItem: { type: '$example.Types.BClass1', inverseProperty: 'AItem' },
    });
    $data.Class.define('$example.Types.BClass1', $data.Entity, null, {
        Id: { type: 'int', key: true, computed: true },
        Name: { type: 'string', required: true },
        AItem: { type: 'Array', elementType: '$example.Types.AClass1', inverseProperty: 'BItem' }
    });
    $data.Class.define('$example.Types.ClassContext1', $data.EntityContext, null, {
        AItems: { type: $data.EntitySet, elementType: $example.Types.AClass1 },
        BItems: { type: $data.EntitySet, elementType: $example.Types.BClass1 }
    });

    (new $example.Types.ClassContext1({ name: providerConfig.name, databaseName: 'T1_ClassContext1', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }))
        .onReady(function (db) {
            var a = new $example.Types.AClass1({ Name: 'name1', BItem: null });
            db.AItems.add(a);
            db.saveChanges({
                success: function () {
                    ok('save success', 'save success');
                    start();
                },
                error: function (ex) {
                    ok(false, ex.message);
                    start();
                }
            });
        });
});
test('sqLite 0..1 table generation required', function () {
    if (providerConfig.name == "oData" || providerConfig.name == "mongoDB") { ok(true, "Not supported"); return; }

    expect(1);
    stop(1);

    $data.Class.define('$example.Types.AClass2', $data.Entity, null, {
        Id: { type: 'int', key: true, computed: true },
        Name: { type: 'string' },
        BItem: { type: '$example.Types.BClass2', required: true, inverseProperty: 'AItem' },
    });
    $data.Class.define('$example.Types.BClass2', $data.Entity, null, {
        Id: { type: 'int', key: true, computed: true },
        Name: { type: 'string', required: true },
        AItem: { type: 'Array', elementType: '$example.Types.AClass2', inverseProperty: 'BItem' }
    });
    $data.Class.define('$example.Types.ClassContext2', $data.EntityContext, null, {
        AItems: { type: $data.EntitySet, elementType: $example.Types.AClass2 },
        BItems: { type: $data.EntitySet, elementType: $example.Types.BClass2 }
    });



    (new $example.Types.ClassContext2({ name: providerConfig.name, databaseName: 'T1_ClassContext2', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }))
        .onReady(function (db) {
            var a = new $example.Types.AClass2({ Name: 'name1', BItem: null });
            db.AItems.add(a);
            db.saveChanges({
                success: function () {
                    ok(false, 'required field failed');
                    start();
                },
                error: function (ex) {
                    ok(ex.message.indexOf('constraint failed') >= 0, 'required side is required');
                    start();
                }
            });
        });
});
test('sqLite 0..1 table generation not required guid key', function () {
    if (providerConfig.name == "oData" || providerConfig.name == "mongoDB") { ok(true, "Not supported"); return; }

    expect(1);
    stop(1);

    $data.Class.define('$example.Types.AClass1g', $data.Entity, null, {
        Id: { type: 'guid', key: true, required: true },
        Name: { type: 'string' },
        BItem: { type: '$example.Types.BClass1g', inverseProperty: 'AItem' },
    });
    $data.Class.define('$example.Types.BClass1g', $data.Entity, null, {
        Id: { type: 'guid', key: true, required: true },
        Name: { type: 'string', required: true },
        AItem: { type: 'Array', elementType: '$example.Types.AClass1g', inverseProperty: 'BItem' }
    });
    $data.Class.define('$example.Types.ClassContext1g', $data.EntityContext, null, {
        AItems: { type: $data.EntitySet, elementType: $example.Types.AClass1g },
        BItems: { type: $data.EntitySet, elementType: $example.Types.BClass1g }
    });



    (new $example.Types.ClassContext1g({ name: providerConfig.name, databaseName: 'T1_ClassContext1g', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }))
        .onReady(function (db) {
            var a = new $example.Types.AClass1g({ Id: $data.parseGuid('97e78352-13ef-4068-9ed7-31023bbd8204'), Name: 'name1', BItem: null });
            db.AItems.add(a);
            db.saveChanges({
                success: function () {
                    ok('save success', 'save success');
                    start();
                },
                error: function (ex) {
                    ok(false, ex.message);
                    start();
                }
            });
        });
});
test('sqLite 0..1 table generation required guid key', function () {
    if (providerConfig.name == "oData" || providerConfig.name == "mongoDB") { ok(true, "Not supported"); return; }

    expect(1);
    stop(1);

    $data.Class.define('$example.Types.AClass2g', $data.Entity, null, {
        Id: { type: 'guid', key: true, required: true },
        Name: { type: 'string' },
        BItem: { type: '$example.Types.BClass2g', required: true, inverseProperty: 'AItem' },
    });
    $data.Class.define('$example.Types.BClass2g', $data.Entity, null, {
        Id: { type: 'guid', key: true, required: true },
        Name: { type: 'string', required: true },
        AItem: { type: 'Array', elementType: '$example.Types.AClass2g', inverseProperty: 'BItem' }
    });
    $data.Class.define('$example.Types.ClassContext2g', $data.EntityContext, null, {
        AItems: { type: $data.EntitySet, elementType: $example.Types.AClass2g },
        BItems: { type: $data.EntitySet, elementType: $example.Types.BClass2g }
    });



    (new $example.Types.ClassContext2g({ name: providerConfig.name, databaseName: 'T1_ClassContext2g', dbCreation: $data.storageProviders.DbCreationType.DropAllExistingTables }))
        .onReady(function (db) {
            var a = new $example.Types.AClass2g({ Id: $data.parseGuid('97e78352-13ef-4068-9ed7-31023bbd8204'), Name: 'name1', BItem: null });
            db.AItems.add(a);
            db.saveChanges({
                success: function () {
                    ok(false, 'required field failed');
                    start();
                },
                error: function (ex) {
                    ok(ex.message.indexOf('constraint failed') >= 0, 'required side is required');
                    start();
                }
            });
        });
});
test('navProperty many', function () {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

    expect(5);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.map(function (a) { return { id: a.Id, catArticles: a.Category.Articles }; }).toArray(function (art) {
                //console.log(art);
                equal(art[0].catArticles instanceof Array, true, 'many nav property is array');
                equal(art[1].catArticles instanceof Array, true, 'many nav property is array');

                equal(art[1].catArticles[0] instanceof $news.Types.Article, true, 'item[1].catArticles[0] is $news.Types.Article');
                equal(art[1].catArticles[0].Body, 'Body1', 'item[1].catArticles[0].Body has value');
                equal(art[1].catArticles[0].Lead, 'Lead1', 'item[1].catArticles[0].Lead has value');
                start();
            });
        });

    });
});
test('navProperty single', function () {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

    expect(3);
    stop(1);

    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        $news.Types.NewsContext.generateTestData(db, function () {
            db.Articles.map(function (a) { return { id: a.Id, category: a.Category }; }).toArray(function (art) {
                equal(art[0].category instanceof $news.Types.Category, true, 'many nav property is $news.Types.Category');
                equal(art[1].category instanceof $news.Types.Category, true, 'many nav property is $news.Types.Category');

                equal(art[1].category.Title, 'Sport', 'art[1].category.Title has value');
                start();
            });
        });

    });
});
test('guid key, navProperty', function () {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

    expect(8);
    stop(1);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        var itemGrp = new $news.Types.TestItemGroup({ Id: $data.parseGuid('73304541-7f4f-4133-84a4-16ccc2ce600d'), Name: 'Group1' });
        equal(itemGrp.Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', ' init guid value');
        var item = new $news.Types.TestItemGuid({ Id: $data.parseGuid('bb152892-3a48-4ffa-83cd-5f952e21c6eb'), i0: 0, b0: true, s0: '0', Group: itemGrp });

        //db.TestItemGroups.add(itemGrp);
        db.TestTable2.add(item);

        db.saveChanges(function () {
            db.TestItemGroups.toArray(function (res) {
                equal(res[0].Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', 'res init guid value');
                db.TestTable2.toArray(function (res2) {
                    equal(res2[0].Id, 'bb152892-3a48-4ffa-83cd-5f952e21c6eb', 'res2 init guid value');


                    db.TestItemGroups.attach(itemGrp);
                    var item2 = new $news.Types.TestItemGuid({ Id: $data.parseGuid('03be7d99-5dc1-464b-b890-5b997c86a798'), i0: 1, b0: true, s0: '0', Group: itemGrp });
                    db.TestTable2.add(item2);

                    db.saveChanges(function () {
                        db.TestItemGroups.toArray(function (res) {
                            equal(res.length, 1, 'res length');
                            equal(res[0].Id, '73304541-7f4f-4133-84a4-16ccc2ce600d', 'res init guid value');
                            db.TestTable2.orderBy('it.i0').toArray(function (res2) {
                                equal(res2.length, 2, 'res2 length');
                                equal(res2[0].Id, 'bb152892-3a48-4ffa-83cd-5f952e21c6eb', 'res2 init guid value');
                                equal(res2[1].Id, '03be7d99-5dc1-464b-b890-5b997c86a798', 'res2 init guid value');
                                start();
                            });
                        });
                    });

                })
            })
        });

    });
});
test('concurrency test', function () {
    if (providerConfig.name == "sqLite" || providerConfig.name == 'mongoDB') { ok(true, "Not supported"); return; }

    expect(8);
    stop(1);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            $news.Types.NewsContext.generateTestData(db, function () {
                db.Articles.toArray(function (a) {
                    db.Articles.toArray(function (a2) {
                        var article = a[0];
                        var article2 = a2[0];
                        equal(article.Id, article2.Id, 'test items equal failed');
                        equal(article.RowVersion, article2.RowVersion, 'test items RowVersion equal failed');

                        db.Articles.attach(article);
                        article.Body += 'Changed body';
                        db.saveChanges(function () {
                            equal(article.Id, article2.Id, 'test items equal');
                            notEqual(article.RowVersion, article2.RowVersion, 'test items RowVersion notequal failed');

                            db.Articles.attach(article2);
                            article2.Body += 'Changed later';

                            db.saveChanges({
                                success: function () {
                                    start(1);
                                    ok(false, 'save success on invalid element failed');
                                },
                                error: function () {
                                    article2.RowVersion = '*';
                                    db.saveChanges({
                                        success: function () {

                                            equal(article.Id, article2.Id, 'test items equal');
                                            notEqual(article.RowVersion, article2.RowVersion, 'test items RowVersion notequal failed');

                                            db.Articles.filter(function (art) { return art.Id == this.Id }, { Id: article2.Id }).toArray(function (a3) {
                                                start(1);

                                                equal(a3[0].Id, article2.Id, 'test items equal failed');
                                                equal(a3[0].RowVersion, article2.RowVersion, 'test items RowVersion equal failed');
                                            });
                                        },
                                        error: function () {
                                            start(1);
                                            ok(false, 'save not success on valid element failed');
                                        }
                                    });
                                }
                            })

                        });
                    });
                });
            });


        } catch (ex) {
            start(1);
            ok(false, "Unhandled exception occured");
            console.log("--=== concurrency test: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('OData provider - Filter by GUID field should be supported', function () {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }

    expect(20);
    stop(6);
    $data.Class.define("$news.Types.TestItemExtended", $data.Entity, null, {
        Id: { type: "int", key: true },
        i0: { type: "int" },
        b0: { type: "boolean" },
        s0: { type: "string" },
        blob: { type: "blob" },
        n0: { type: "number" },
        d0: { type: "date" },
        g0: { type: "guid" },
    }, null);

    $data.Class.define("$news.Types.NewsContextPartial", $data.EntityContext, null, {
        TestTable: { type: $data.EntitySet, elementType: $news.Types.TestItemExtended }
    });

    (new $news.Types.NewsContextPartial(providerConfig)).onReady(function (db) {
        var guid = new $data.Guid('ae22ffc7-8d96-488e-84f2-c04753242348');

        var q = db.TestTable.filter(function (t) { return t.g0 == this.guid }, { guid: guid });
        var q2 = db.TestTable.filter(function (t) { return t.g0 == this.guid }, { guid: new $data.Guid('c22f0ecd-8cff-403c-89d7-8d18c457f1ef') });
        var q3 = db.TestTable.filter(function (t) { return t.g0 == this.guid }, { guid: new $data.Guid() });
        var q4 = db.TestTable.filter(function (t) { return t.g0 == this.guid }, { guid: null });

        if (providerConfig.name == "sqLite" || providerConfig.name == 'mongoDB') { ok(true, "Not supported"); ok(true, "Not supported"); ok(true, "Not supported"); ok(true, "Not supported"); }
        else {
            equal(q.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'ae22ffc7-8d96-488e-84f2-c04753242348')", 'param guid failed');
            equal(q2.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'c22f0ecd-8cff-403c-89d7-8d18c457f1ef')", 'inline guid failed');
            equal(q3.toTraceString().queryText, "/TestTable?$filter=(g0 eq guid'00000000-0000-0000-0000-000000000000')", 'empty guid failed');
            equal(q4.toTraceString().queryText, "/TestTable?$filter=(g0 eq null)", 'null guid failed');
        }
        var item1 = new $news.Types.TestItemExtended({ Id: 42, g0: guid });
        var item2 = new $news.Types.TestItemExtended({ Id: 43, g0: new $data.Guid('c22f0ecd-8cff-403c-89d7-8d18c457f1ef') });
        var item3 = new $news.Types.TestItemExtended({ Id: 44, g0: new $data.Guid() });
        var item4 = new $news.Types.TestItemExtended({ Id: 45, g0: null });
        db.TestTable.add(item1);
        db.TestTable.add(item2);
        db.TestTable.add(item3);
        db.TestTable.add(item4);
        db.saveChanges(function () {
            db.TestTable.toArray(function (items) {
                for (var i = 0; i < items.length; i++) {
                    var item = items[i];
                    switch (item.Id) {
                        case 42:
                            equal(item.g0.valueOf(), 'ae22ffc7-8d96-488e-84f2-c04753242348', "Id:42, guid value failed");
                            break;
                        case 43:
                            equal(item.g0.valueOf(), 'c22f0ecd-8cff-403c-89d7-8d18c457f1ef', "Id:43, guid value failed");
                            break;
                        case 44:
                            equal(item.g0.valueOf(), '00000000-0000-0000-0000-000000000000', "Id:44, guid value failed");
                            break;
                        case 45:
                            equal(item.g0, null, "Id:45, guid value failed");
                            break;
                        default:
                    }
                }
                start();
            });

            q.toArray(function (items) {
                equal(items.length, 1, 'result count failed');
                equal(items[0].g0.toString(), 'ae22ffc7-8d96-488e-84f2-c04753242348', "param guid value failed");
                start();
            });
            q2.toArray(function (items) {
                equal(items.length, 1, 'result count failed');
                equal(items[0].g0.toString(), 'c22f0ecd-8cff-403c-89d7-8d18c457f1ef', "param inline value failed");
                start();
            });
            q3.toArray(function (items) {
                equal(items.length, 1, 'result count failed');
                equal(items[0].g0.toString(), '00000000-0000-0000-0000-000000000000', "param empty value failed");
                start();
            });
            q4.toArray(function (items) {
                equal(items.length, 1, 'result count failed');
                equal(items[0].g0, null, "param null value failed");
                start();
            });

            db.TestTable.map(function (t) { return t.g0; }).toArray(function (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i]) {
                        equal($data.parseGuid(items[i]) instanceof $data.Guid, true, 'guid map failed: ' + i);
                    } else {
                        equal(items[i], null, 'guid map failed: ' + i);
                    }
                }
                start();
            });

        });


    });


});
test('EntityField == null or null == EntityField filter', 6, function () {
    stop(6);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Articles.toArray(function (a) {
                    start(1);
                    var article = a[0];
                    db.Articles.attach(article);
                    article.Body = null;
                    db.saveChanges(function () {
                        start(1);
                        db.Articles.filter(function (a) { return a.Body == null; }).toArray(function (a1) {
                            start(1);
                            equal(a1.length, 1, 'result count failed');
                            equal(a1[0] instanceof $news.Types.Article, true, 'result type failed');
                            equal(a1[0].Body, null, 'result type failed');


                        });
                        db.Articles.filter(function (a) { return null == a.Body; }).toArray(function (a1) {
                            start(1);
                            equal(a1.length, 1, 'result count failed');
                            equal(a1[0] instanceof $news.Types.Article, true, 'result type failed');
                            equal(a1[0].Body, null, 'result type failed');


                        });
                    });

                });
            });

        } catch (ex) {
            start(4);
            ok(false, "Unhandled exception occured");
            console.log("--=== EntityField == null or null == EntityField filter filter: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('EntityField != null or null != EntityField filter', 2, function () {
    stop(6);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Articles.toArray(function (a) {
                    start(1);
                    var article = a[0];
                    db.Articles.attach(article);
                    article.Body = null;
                    db.saveChanges(function () {
                        start(1);
                        db.Articles.filter(function (a) { return a.Body != null; }).toArray(function (a1) {
                            start(1);
                            equal(a1.length, a.length - 1, 'result count failed');;
                        });
                        db.Articles.filter(function (a) { return null != a.Body; }).toArray(function (a1) {
                            start(1);
                            equal(a1.length, a.length - 1, 'result count failed');
                        });
                    });

                });
            });

        } catch (ex) {
            start(4);
            ok(false, "Unhandled exception occured");
            console.log("--=== EntityField == null or null == EntityField filter filter: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1003_even if a simple field is projected an Article is returned', 2, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.map(function (a) { return a.Title });
                q.toArray(function (a) {
                    start(1);
                    notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                    equal(typeof a[0], 'string', 'result type failed');
                });
            });

        } catch (ex) {
            start(4);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1003_additional_test1', 4, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q1 = db.Articles.map(function (a) { return { t: a.Title, i: a.Id }; });
                q1.toArray(function (a) {
                    start(1);
                    notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                    equal(a[0] instanceof Object, true, 'result type failed');
                    equal(typeof a[0].t, 'string', 'result type failed');
                    equal(typeof a[0].i, 'number', 'result type failed');
                });
            });

        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1003_additional_test2', 3, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q2 = db.Articles.map(function (a) { return a.Author; });
                //console.dir(q2.toTraceString());
                q2.toArray(function (a) {
                    start(1);
                    //console.dir(a);
                    equal(a[0] instanceof $news.Types.User, true, 'result type failed');
                    equal(typeof a[0].LoginName, 'string', 'result type failed');
                    equal(typeof a[0].Id, 'number', 'result type failed');
                });
            });


        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1003_additional_test3', 6, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q3 = db.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author }; });
                q3.toArray(function (a) {
                    start(1);
                    notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                    notEqual(a[0] instanceof $news.Types.User, true, 'result type failed');
                    equal(typeof a[0].Title, 'string', 'result type failed');
                    equal(a[0].Auth instanceof $news.Types.User, true, 'result type failed');
                    equal(typeof a[0].Auth.LoginName, 'string', 'result type faild');
                    notEqual(a[0].Auth.LoginName.length, 0, 'login name not fill');
                });
            });
        } catch (ex) {
            start(4);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1003_additional_test4', 11, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q3 = db.Articles.map(function (a) { return { Title: a.Title, Auth: a.Author, Prof: a.Author.Profile, Z: a.Author.Profile.Bio, k: a.Author.LoginName }; });

                q3.toArray(function (a) {
                    //console.log(a);
                    start(1);
                    notEqual(a[0] instanceof $news.Types.Article, true, 'result type failed');
                    notEqual(a[0] instanceof $news.Types.User, true, 'result type failed');
                    equal(typeof a[0].Title, 'string', 'result type failed');
                    equal(a[0].Auth instanceof $news.Types.User, true, 'result type failed');
                    equal(typeof a[0].Auth.LoginName, 'string', 'result type faild');
                    notEqual(a[0].Auth.LoginName.length, 0, 'login name not fill');
                    equal(a[0].Prof instanceof $news.Types.UserProfile, true, "result type faild");
                    equal(typeof a[0].Prof.Bio, 'string', 'result type faild');
                    equal(typeof a[0].Z, 'string', 'result type faild');
                    equal(a[0].Z, a[0].Prof.Bio, 'result type faild');
                    equal(typeof a[0].k, "string", "result type faild");
                });
            });
        } catch (ex) {
            start(4);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1003_additional_test5', 3, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q2 = db.Articles.map(function (a) { return a.Author.Profile; });
                q2.toArray(function (a) {
                    start(1);
                    equal(a[0] instanceof $news.Types.UserProfile, true, 'result type failed');
                    equal(typeof a[0].Bio, 'string', 'result type failed');
                    equal(typeof a[0].Id, 'number', 'result type failed');
                });
            });


        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1003_additional_test6', 5, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q2 = db.Articles.filter(function (a) { return a.Category.Id == 1; }, null).map(function (a) { return { Title: a.Title, LoginName: a.Author.LoginName }; });
                q2.toArray(function (a) {
                    start(1);
                    notEqual(a[0] instanceof $news.Types.UserProfile, true, 'result type failed');
                    equal(typeof a[0].Title, 'string', 'Title filed type faild');
                    ok(a[0].Title.length > 0, 'Title field value error');
                    equal(typeof a[0].LoginName, 'string', 'LoginName filed type faild');
                    ok(a[0].LoginName.length > 0, 'LoginName field value error');
                });
            });
        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1002_even if map is used with anon type an Article is returned', 3, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Articles.map(function (a) { return { T: a.Title } }).toArray(function (a) {
                    start(1);
                    equal(a[0] instanceof $news.Types.Article, false, 'result type failed');
                    equal(typeof a[0], 'object', 'result type failed');
                    equal(typeof a[0].T, 'string', 'result type property failed');
                });
            });
        } catch (ex) {
            start(1);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1002_even if map is used with anon type an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1001_Article CreateDate comes bac Invalid date', 2, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                db.Articles.toArray(function (a) {
                    start(1);
                    equal(a[0] instanceof $news.Types.Article, true, 'result type failed');
                    notEqual(a[0].CreateDate.valueOf(), NaN, 'datetime value failed');
                });
            });
        } catch (ex) {
            start(1);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1001_Article CreateDate comes bac Invalid date: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1048_ODATA attach -> saveChanges error', 1, function () {
    stop(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);


                db.Articles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                    start(1);
                    if (result.length) {
                        var save = result[0];
                        db.Articles.attach(save);
                        save.Title = 'alma';
                        save.Lead = 'alma';
                        save.Body = 'alma';
                        //db.Articles.attach(save);
                        db.saveChanges(function (count) {
                            start(1);
                            equal(count, 1, "save error");
                        });
                    }
                });
            });

        } catch (ex) {
            start(4);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1048_ODATA delete -> saveChanges error', 1, function () {
    stop(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);


                db.UserProfiles.filter(function (item) { return item.Id == this.id; }, { id: 1 }).toArray(function (result) {
                    start(1);
                    if (result.length) {
                        var save = result[0];
                        db.UserProfiles.remove(save);
                        db.saveChanges(function (count) {
                            start(1);
                            equal(count, 1, "save error");
                        });
                    }
                });
            });

        } catch (ex) {
            start(4);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1038_Include complex type property', 7, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.where(function (item) { return item.Id == this.id }, { id: 1 })
                       .select(function (item) {
                           return {
                               Title: item.Title,
                               Lead: item.Lead,
                               Body: item.Body,
                               CreateDate: item.CreateDate,
                               Author: {
                                   Profile: item.Author.Profile //Location hiányzik
                               },
                               CmpType: item.Author.Profile
                           };
                       });
                var meta = q.toTraceString();
                //console.dir(meta);
                q.toArray(function (result) {
                    start(1);
                    //console.dir(result);
                    ok(result, 'Query OK');
                    equal(result.length, 1, 'Result nnumber fiaild');

                    notEqual(result[0].Author instanceof $news.Types.UserProfile, true, 'Author type loading faild');
                    equal(result[0].Author.Profile instanceof $news.Types.UserProfile, true, 'Author.Profile type loading faild');

                    equal(result[0].CmpType instanceof $news.Types.UserProfile, true, 'Profile type loading faild');
                    equal(result[0].CmpType.Location instanceof $news.Types.Location, true, 'Profile.Location type loading faild');
                });
                ok(true);

            });

        } catch (ex) {
            start(4);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1038_additional_tests_1', 8, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.where(function (item) { return item.Id == this.id }, { id: 1 })
                       .select(function (item) {
                           return {
                               a: {
                                   b: {
                                       c: {
                                           d: item.Title
                                       }
                                   }
                               },
                           };
                       });
                q.toArray(function (result) {
                    start(1);
                    //console.dir(result);
                    ok(result, 'Query OK');
                    equal(result.length, 1, 'Result nnumber fiaild');

                    equal(typeof result[0], "object", 'object structure build');
                    equal(typeof result[0].a, "object", 'object structure build (a)');
                    equal(typeof result[0].a.b, "object", 'object structure build (a.b)');
                    equal(typeof result[0].a.b.c, "object", 'object structure build (a.b.c)');
                    equal(typeof result[0].a.b.c.d, "string", 'object structure build (a.b.c.d)');
                    ok(result[0].a.b.c.d.length > 0, 'Complex type loading faild');

                });
            });

        } catch (ex) {
            start(3);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('978_create_article_with_inline_category_fails', 3, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var a = new $news.Types.Article({ Title: "asdads", Category: new $news.Types.Category({ Title: "CatX" }) });
                db.Articles.add(a);
                db.saveChanges(function (count) {
                    start(1);
                    equal(count, 2, "Saved entity count faild");
                    equal(a.Id, 27, 'Article Id faild');
                    equal(a.Category.Id, 6, "category Id faild");
                });
            });
        } catch (ex) {
            start(1);
            ok(false, "Unhandled exception occured");
            console.log("--=== 978_create article with inline category fails: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('977_adding new articles with category ends up in error', 3, function () {
    stop(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            db.Categories.filter(function (a) { return a.Id == 1; }).toArray(function (a) {
                start(1);
                var cat = a[0];
                ok(cat instanceof $news.Types.Category, "Return value do not a category instance");
                db.Categories.attach(cat);
                for (var i = 0; i < 100; i++) {
                    var art = new $news.Types.Article({ Title: 'Arti' + i, Category: cat });
                    db.Articles.add(art);
                }
                db.saveChanges({
                    success: function (count) {
                        start(1);
                        equal(count, 100, "Saved item count faild");
                    },
                    error: function (error) {
                        start(1);
                        console.dir(error);
                        ok(false, error);
                    }
                });
            });
        });
    });
});
test('976_updating entity will result in cleared out fields in db', 7, function () {
    stop(5);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            db.Articles.filter(function (a) { return a.Id == 1; }).toArray(function (a) {
                start(1);
                var art = a[0];
                ok(art instanceof $news.Types.Article, "Return value do not an article instance");
                ok(art.Title.length > 0, "Article title faild");

                db.Articles.attach(art);
                art.Title = "zpace";
                var pin_ArticleInitData = JSON.parse(JSON.stringify(art.initData));

                db.saveChanges(function (count) {
                    start(1);
                    equal(count, 1, "Saved item count faild");
                    db.Articles.filter(function (a) { return a.Id == 1; }).toArray(function (uArticles) {
                        start(1);
                        var uArticle = uArticles[0];
                        ok(uArticle instanceof $news.Types.Article, "Return value do not an article instance");

                        if (providerConfig.name[0] === 'sqLite' || providerConfig.name[0] === 'mongoDB')//ETag
                        {
                            ok(true, 'sqLite ETag update not supported yet');
                        } else {
                            notEqual(pin_ArticleInitData.RowVersion, uArticle.RowVersion, 'ETag update faild');
                            pin_ArticleInitData.RowVersion = uArticle.RowVersion;//deepEqual helper
                        }
                        var pin_uArticleInitData = JSON.parse(JSON.stringify(uArticle.initData));
                        deepEqual(pin_uArticleInitData, pin_ArticleInitData, "Article saved faild");
                    });
                });
            });
        });
    });
});
test("974_Projection of Navigational property return a typed entity result but it's init data is empty", 4, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return { T: a.Title, A: a.Author } });
            q.toArray(function (articles) {
                start(1);
                equal(articles.length, 26, "Article count faild");
                ok(articles[0].T.length > 0, "Article1", "1st article title field faild");
                ok(articles[0].A instanceof $news.Types.User, "1st article Author field faild");
            });

        });
    });
});
test("975_Complex type projections - illegal instruction", 4, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return { T: a.Title, A: a.Author.Profile.Location } });
            q.toArray({
                success: function (articles) {
                    start(1);
                    equal(articles.length, 26, "Article count faild");
                    ok(articles[0].T.length > 0, "Article1", "1st article title field faild");
                    ok(articles[0].A instanceof $news.Types.Location, "1st article Author field faild");
                },
                error: function (error) {
                    start(1);
                    console.dir(error);
                    ok(false, 'Query erroro!');
                }
            });

        });
    });
});
test("write_boolean_property", 3, function () {
    stop(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        ok(db, 'Databse generation faild');
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var item = new $news.Types.TestItem();
            item.b0 = true;
            db.TestTable.add(item);
            db.saveChanges(function () {
                start(1);
                db.TestTable.toArray(function (result) {
                    start(1);
                    ok(result, 'query error');
                    ok(result[0].b0, 'boolean result error');
                });
            });
        });
    });
});
//test("XXX_Projection_scalar_with_function_call", 3, function () {
//    stop(3);
//    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
//        start(1);
//        ok(db, 'Databse generation faild');
//        $news.Types.NewsContext.generateTestData(db, function () {
//            start(1);
//            var q = db.Articles.filter(function (a) { return a.Id == 1; }, null).map(function (a) { return a.Title.toLowerCase(); });
//            q.toArray(function (articles) {
//                start(1);
//                console.dir(articles);
//                equal(articles.length, 1, "Article count faild");
//                equal(articles[0], "article1", "1st article title field faild");
//            });

//        });
//    });
//});
//test('973_Complex types filter - illegal instruction exceptions', 3, function () {
//    stop(3);
//    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
//        $news.alma = db;
//        start(1);
//        ok(db, 'Databse generation faild');
//        $news.Types.NewsContext.generateTestData(db, function () {
//            start(1);
//            var q = db.Articles.filter(function (a) { return a.Author.Profile.Location.Zip == 1115 });
//            q.toArray(function (articles) {
//                start(1);
//                ok(articles, 'Query run success');
//                equal(articles.length, 5, 'Faild query');
//            });
//        });
//    });
//});
test('1012_websql_provider_-_Projected_Navigational_properties_are_incorrect.', function () {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    expect(4);
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);

                var q = db.Articles.map(function (a) { return { T: a.Title, AuthorID: a.Author.Id, A: a.Author } });
                q.toArray(function (article) {
                    //console.dir(article);
                    //start(1);
                    equal(article.length, 26, 'Not all articles loaded');
                    equal(typeof article[0].T, 'string', "result type faild");
                    equal(typeof article[0].AuthorID, 'number', "category filed not loaded");
                    ok(article[0].A instanceof $news.Types.User, "category filed not loaded");
                    start(1);
                });
            });
        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1024_ODATA projection of complex type does not get values', 3, function () {
    if (providerConfig.name == "sqLite") { ok(true, "Not supported"); ok(true, "Not supported"); ok(true, "Not supported"); return; }
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include("Author.Profile").map(function (a) { return a.Author.Profile.Location });
                q.toArray(function (article) {
                    start(1);
                    equal(article[0] instanceof $news.Types.Location, true, "result type faild");
                    equal(typeof article[0].Zip, 'number', "result type faild");
                    equal(typeof article[0].City, 'string', "result type faild");
                });
            });

        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1023_OData include does not include', function () {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    expect(4);
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include("Category");
                q.toArray(function (article) {
                    equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                    notEqual(article[0].Category, undefined, "category filed not loaded");
                    equal(typeof article[0].Category.Title, 'string', 'Category title type faild');
                    ok(article[0].Category.Title.length > 0, 'Category title not loaded');
                    start(1);
                });
            });
        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1023_additional_test_1', function () {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    expect(6);
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include("Author.Profile");
                q.toArray(function (article) {
                    equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                    equal(article[0].Category, undefined, "category filed not loaded");

                    ok(article[0].Author !== undefined, "category filed not loaded");
                    ok(article[0].Author.Profile !== undefined, "category filed not loaded");

                    equal(typeof article[0].Author.Profile.Bio, 'string', 'Category title type faild');
                    ok(article[0].Author.Profile.Bio.length > 0, 'Category title type faild');
                    start(1);
                });
            });
        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1023_additional_test_2', function () {
    //if (providerConfig.name == "sqLite") { ok(true, "Not supported"); return; }
    expect(14);
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.include("Author").include("Author.Profile").include("Reviewer.Profile");
                q.toArray(function (article) {
                    equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                    ok(article[0].Category === undefined, "category filed not loaded");

                    equal(article[0].Author instanceof $news.Types.User, true, "result type faild");
                    ok(article[0].Author !== undefined, "category filed not loaded");
                    equal(article[0].Author.Profile instanceof $news.Types.UserProfile, true, "result type faild");
                    ok(article[0].Author.Profile !== undefined, "category filed not loaded");
                    equal(typeof article[0].Author.Profile.Bio, 'string', 'Category title type faild');
                    ok(article[0].Author.Profile.Bio.length > 0, 'Category title type faild');

                    ok(article[0].Reviewer !== undefined, "Reviewer filed not loaded");
                    equal(article[0].Reviewer instanceof $news.Types.User, true, "Reviewer type faild");
                    ok(article[0].Reviewer.Profile !== undefined, "Reviewer.Profile filed not loaded");
                    equal(article[0].Reviewer.Profile instanceof $news.Types.UserProfile, true, "Reviewer.Profile type faild");

                    equal(typeof article[0].Reviewer.Profile.Bio, 'string', 'Category title type faild');
                    ok(article[0].Reviewer.Profile.Bio.length > 0, 'Category title type faild');
                    start(1);
                });
            });

        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== 1003_even if a simple field is projected an Article is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('deep_include_fix', function(){
    expect(18);
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var trace = db.Users.include('Articles.Category').include('Profile').toTraceString();
            var config = trace.modelBinderConfig;
            ok(config.$item, 'no $item');
            ok(config.$item.Articles, 'no Articles');
            ok(config.$item.Articles.$item, 'no Articles.$item');
            ok(config.$item.Articles.$item.Category, 'no Articles.Category');
            ok(config.$item.Profile, 'no Profile');
            
            db.Users.include('Articles.Category').include('Profile').filter(function(it){ return it.LoginName == this.name; }, { name: 'Usr1' }).toArray(function(users){
                ok(users, 'no users');
                ok(Array.isArray(users), 'not an Array');
                ok(users[0], 'empty');
                ok(users[0] instanceof $news.Types.User, 'not a User');
                equal(users[0].Email, 'usr1@company.com', 'bad Email');
                ok(Array.isArray(users[0].Articles), 'not an Array');
                ok(users[0].Articles[0], 'empty');
                ok(users[0].Articles[0] instanceof $news.Types.Article, 'not an Article');
                ok(users[0].Articles[0].Category, 'bad Category');
                ok(users[0].Articles[0].Category instanceof $news.Types.Category, 'not a Category');
                ok(users[0].Profile, 'bad Profile');
                ok(users[0].Profile instanceof $news.Types.UserProfile, 'not a UserProfile');
                equal(users[0].Profile.Bio, 'Bio1', 'bad Profile.Bio');
                start(1);
            });
        });
    });
});
test('1032_ODATA: order by complex type field', 2, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Users.orderBy(function (item) { return item.Profile.FullName; });
                q.toArray(function (article) {
                    start(1);
                    equal(article[0] instanceof $news.Types.User, true, "result type faild");
                    ok(article[0].LoginName.length > 0, "category filed not loaded");
                });
            });
        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1032_additional_test_1', 2, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.orderBy(function (item) { return item.Author.Profile.FullName; });
                q.toArray(function (article) {
                    start(1);
                    equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                    ok(article[0].Title.length > 0, "category filed not loaded");
                });
            });
        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1032_additional_test_2', 2, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        try {
            start(1);
            $news.Types.NewsContext.generateTestData(db, function () {
                start(1);
                var q = db.Articles.orderBy(function (item) { return item.Author.Profile.Location.City; });
                //console.dir(q.toTraceString());
                q.toArray(function (article) {
                    equal(article[0] instanceof $news.Types.Article, true, "result type faild");
                    ok(article[0].Title.length > 0, "category filed not loaded");
                    start(1);
                });
            });
        } catch (ex) {
            start(3);
            ok(false, "Unhandled exception occured");
            console.log("--=== '1032_ODATA: order by complex type field' is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});
test('1067_ID_field_not_write_back', function () {
    //if (providerConfig.name == "mongoDB") { ok(true, "Not supported"); return; }
    //expect(4);
    stop(6);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);

            db.Categories
		    .filter(function (item) { return item.Id == this.id; }, { id: 1 })
		    .toArray(function (result) {
		        start(1);
		        var category = result[0];
		        db.Categories.attach(category);
		        var articleEntity = new $news.Types.Article({
		            Title: 'temp',
		            Lead: 'temp',
		            Body: 'temp',
		            Category: category
		        });

		        db.Articles.add(articleEntity);
		        db.saveChanges({
		            success: function () {
		                start(1);
		                var tags = 'temp'.split(',');
		                db.Tags
				    .filter(function (item) { return item.Title in this.tags; }, { tags: tags })
				    .toArray(function (result) {
				        start(1);

				        var existing = [];
				        for (var i = 0; i < result.length; i++) {
				            existing.push(result[i].Title);
				        }
				        for (var i = 0; i < tags.length; i++) {
				            var t = tags[i];
				            if (existing.indexOf(t) < 0) {
				                db.TagConnections.add(new $news.Types.TagConnection({ Article: articleEntity, Tag: new $news.Types.Tag({ Title: t }) }));
				            } else {
				                db.Tags.attach(result[i]);
				                db.TagConnections.add(new $news.Types.TagConnection({ Article: articleEntity, Tag: result[i] }));
				            }
				        }
				        
				        db.Articles.attach(articleEntity);
				        db.saveChanges({
				            success: function () {
				                start(1);
				                equal(articleEntity.Id, 27, 'Article Id faild');
				                //console.log('Article ID: ' + articleEntity.Id);
				            },
				            error: function (error) {
				                star(1);
				                console.dir(error);
				                ok(false, error);
				            }
				        });
				    });
		            },
		            error: function (error) {
		                start(3);
		                console.dir(error);
		                ok(false, error);
		            }
		        });
		    });
        });
    });
});
test('DANI_CategoryModify', function () {
    //if (providerConfig.name == "mongoDB") { ok(true, "Not supported"); return; }
    expect(1);
    stop(5);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            db.Articles.first(function (a) { return a.Id == 4 }, null, function (article) {
                start(1);
                db.Articles.attach(article);
                article.Title = "Some test data";
                var cat = new $news.Types.Category({ Id: 5 });
                db.Categories.attach(cat);
                article.Category = cat;
                db.saveChanges(function () {
                    start(1);
                    db.Articles.include('Category').first(function (a) { return a.Id == 4 }, null, function (article2) {
                        ok(article2.Category instanceof $news.Types.Category, 'faild');
                        start(1);
                    });
                }).fail(function(err){
                    console.log(err);
                    start(1);
                });
            });
        });
    });
});
test('get_mapped_custom', 23, function () {
    stop(4);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start();
        ok(db, "Db create faild");
        try {
            start();
            $news.Types.NewsContext.generateTestData(db, function () {
                start();
                var q = db.Articles
                    .include('Reviewer.Profile.User') //WARN: oData not supported, but not cause error!!! Simple ignore it!
                    .map(function (m) {
                        return {
                            a: m.Title,
                            Author: m.Title,
                            Tags: { Title: m.Title },
                            Reviewer: m.Reviewer.Profile,
                            b: { a: m.Author.Profile.FullName, b: m.Author.LoginName, c: m.Author.Profile.Location }
                        }
                    });
                //console.dir(q.toTraceString());
                q.toArray({
                    success: function (r) {
                        start();
                        var m = r[0];
                        equal(typeof m.a, 'string', 'a');
                        equal(typeof m.Author, 'string', 'Author');
                        equal(m.Tags instanceof Object, true, 'Tags');
                        equal(typeof m.Tags.Title, 'string', 'Tags.Title');
                        equal(m.Reviewer instanceof $news.Types.UserProfile, true, 'Reviewer');
                        equal(typeof m.Reviewer.Id, 'number', 'Reviewer.Id');
                        equal(typeof m.Reviewer.FullName, 'string', 'Reviewer.FullName');
                        equal(typeof m.Reviewer.Bio, 'string', 'Reviewer.Bio');
                        //equal(m.Reviewer.Avatar instanceof Object, true, 'Reviewer.Avatar');
                        equal(m.Reviewer.Location instanceof $news.Types.Location, true, 'Reviewer.Location');
                        equal(typeof m.Reviewer.Location.Address, 'string', 'Reviewer.Location.Address');
                        equal(typeof m.Reviewer.Location.City, 'string', 'Reviewer.Location.City');
                        equal(typeof m.Reviewer.Location.Zip, 'number', 'Reviewer.Location.Zip');
                        equal(typeof m.Reviewer.Location.Country, 'string', 'Reviewer.Location.Country');
                        equal(m.Reviewer.Birthday instanceof Date, true, 'Reviewer.Birthday');
                        //equal(m.Reviewer.User instanceof $news.Types.User, true, 'Reviewer.User'); //TODO: not supported yet
                        equal(m.b instanceof Object, true, 'b');
                        equal(typeof m.b.a, 'string', 'b.a');
                        equal(typeof m.b.b, 'string', 'b.b');
                        equal(m.b.c instanceof $news.Types.Location, true, 'b.c');
                        equal(typeof m.b.c.Address, 'string', 'b.c.Address');
                        equal(typeof m.b.c.City, 'string', 'b.c.City');
                        equal(typeof m.b.c.Zip, 'number', 'b.c.Zip');
                        equal(typeof m.b.c.Country, 'string', 'b.c.Country');
                    },
                    error: function (error) { console.log("ERROR"); console.log(error); }
                });
            });
        } catch (ex) {
            start(2);
            ok(false, "Unhandled exception occured");
            console.log("--=== get_mapped_custom is returned: ");
            console.dir(ex);
            console.log(" ===--");
        }
    });
});

test('Include: indirect -> map scalar(string)', 53, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return a.Category.Title });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (categoriesTitle) {
                    start(1);
                    equal(categoriesTitle.length, 26, 'Article category error');
                    categoriesTitle.forEach(function (ct, index) {
                        equal(typeof ct, 'string', 'data type error at ' + index + '. position');
                        ok(ct.length >= 4, 'data length error at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> map scalar(int)', 79, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return a.Category.Id });
            q.toArray({
                success: function (categoriesId) {
                    start(1);
                    equal(categoriesId.length, 26, 'Article category error');
                    categoriesId.forEach(function (ci, index) {
                        equal(typeof ci, 'number', 'data type error at ' + index + '. position');
                        ok(ci > 0, 'data min value error at ' + index + '. position');
                        ok(ci < 6, 'data max value error at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> map object include scalar(string)', 79, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return { t: a.Category.Title } });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (categoriesTitle) {
                    start(1);
                    equal(categoriesTitle.length, 26, 'Article category error');
                    categoriesTitle.forEach(function (ct, index) {
                        equal(typeof ct, 'object', 'data type error at ' + index + '. position');
                        equal(typeof ct.t, 'string', 'data type error at ' + index + '. position');
                        ok(ct.t.length >= 4, 'data length error at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> map object include scalar(int)', 105, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return { t: a.Category.Id } });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (categoriesId) {
                    start(1);
                    equal(categoriesId.length, 26, 'Article category error');
                    categoriesId.forEach(function (ci, index) {
                        equal(typeof ci, 'object', 'data type error at ' + index + '. position');
                        equal(typeof ci.t, 'number', 'data type error at ' + index + '. position');
                        ok(ci.t > 0, 'data min value error at ' + index + '. position');
                        ok(ci.t < 6, 'data max value error at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> map Entity_', function () {
    //if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
    expect(105);
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return a.Category; });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    equal(results.length, 26, 'Result number error');
                    results.forEach(function (r, index) {
                        ok(r instanceof $news.Types.Category, 'data type error at ' + index + '. position');
                        ok(r.Id > 0, 'category Id min value error at ' + index + '. position');
                        ok(r.Id < 6, 'category Id max value error at ' + index + '. position');
                        ok(r.Title.length >= 4, 'category title error at ' + index + '. position');
                    });
                    start(1);
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
/*FIX: odata need expand*/
test('Include: indirect -> map EntitySet', 209, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return a.Tags; });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    start(1);
                    equal(results.length, 26, 'Result number error');
                    results.forEach(function (r, index) {
                        ok(r instanceof Array, 'data type error at ' + index + '. position');
                        equal(r.length, 2, "tagconnection number faild");
                        r.forEach(function (tc) {
                            ok(tc instanceof $news.Types.TagConnection, 'data type error at ' + index + '. position');
                            ok(tc.Id > 0, 'TagConnection Id min value error at ' + index + '. position');
                            ok(tc.Id < 53, 'TagConnection Id max value error at ' + index + '. position');
                        });
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> map ComplexType', 19, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.UserProfiles.map(function (up) { return up.Location });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    equal(results.length, 6, 'Result number error');
                    results.forEach(function (r, index) {
                        ok(r instanceof $news.Types.Location, 'data type error at ' + index + '. position');
                        ok(r.Address.length > 7, 'Location address value error at ' + index + '. position');
                        ok(r.City.length > 4, 'Location city value error at ' + index + '. position');
                    });
                    start(1);
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> map object include Entity', 131, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return { r: a.Category }; });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    start(1);
                    equal(results.length, 26, 'Result number error');
                    results.forEach(function (r, index) {
                        equal(typeof r, 'object', 'data type error at ' + index + '. position');
                        ok(r.r instanceof $news.Types.Category, 'data type error at ' + index + '. position');
                        ok(r.r.Id > 0, 'category Id min value error at ' + index + '. position');
                        ok(r.r.Id < 6, 'category Id max value error at ' + index + '. position');
                        ok(r.r.Title.length >= 4, 'category title error at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> map object include EntitySet', 287, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.map(function (a) { return { r: a.Tags }; });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    start(1);
                    equal(results.length, 26, 'Result number error');
                    results.forEach(function (r, index) {
                        equal(typeof r, 'object', 'data type error at ' + index + '. position');
                        ok(r.r instanceof Array, 'data type error at ' + index + '. position');
                        equal(r.r.length, 2, 'TagConnection number error');
                        r.r.forEach(function (tc, index) {
                            ok(tc instanceof $news.Types.TagConnection, 'data type error at ' + index + '. position');
                            ok(tc.Id > 0, 'TagConnection Id min value error at ' + index + '. position');
                            ok(tc.Id < 53, 'TagConnection Id max value error at ' + index + '. position');
                            ok(index < 2, 'TagConnection number error');
                        });
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> map object include ComplexType', 25, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.UserProfiles.map(function (up) { return { r: up.Location } });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    equal(results.length, 6, 'Result number error');
                    results.forEach(function (r, index) {
                        equal(typeof r, 'object', 'data type error at ' + index + '. position');
                        ok(r.r instanceof $news.Types.Location, 'data type error at ' + index + '. position');
                        ok(r.r.Address.length > 7, 'Location address value error at ' + index + '. position');
                        ok(r.r.City.length > 4, 'Location city value error at ' + index + '. position');
                    });
                    start(1);
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> filter scalar(string)', 46, function () {
    var refDate = new Date();
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.filter(function (a) { return a.Category.Title == 'Sport' });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    start(1);
                    equal(results.length, 5, 'Article category error');
                    results.forEach(function (r, index) {
                        ok(r instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                        ok(r.Title.length > 5, 'Title length error at ' + index + '. position');
                        ok(r.Lead.length >= 5, 'Lead length error at ' + index + '. position');
                        ok(r.Body.length >= 5, 'Body length error at ' + index + '. position');
                        ok(r.CreateDate instanceof Date, 'CreateDate data type error at ' + index + '. position');
                        ok(r.CreateDate >= refDate, 'CreateDate value error at ' + index + '. position');
                        ok(r.Category === undefined, 'Category value error  at ' + index + '. position');
                        ok(r.Author === undefined, 'Author value error  at ' + index + '. position');
                        ok(r.Reviewer === undefined, 'Reviewer value error  at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> filter scalar(int)', 91, function () {
    var refDate = new Date();
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.filter(function (a) { return a.Category.Id > 3 });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    start(1);
                    equal(results.length, 10, 'Article category error');
                    results.forEach(function (r, index) {
                        ok(r instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                        ok(r.Title.length > 5, 'Title length error at ' + index + '. position');
                        ok(r.Lead.length > 5, 'Lead length error at ' + index + '. position');
                        ok(r.Body.length > 5, 'Body length error at ' + index + '. position');
                        ok(r.CreateDate instanceof Date, 'CreateDate data type error at ' + index + '. position');
                        ok(r.CreateDate >= refDate, 'CreateDate value error at ' + index + '. position');
                        ok(r.Category === undefined, 'Category value error  at ' + index + '. position');
                        ok(r.Author === undefined, 'Author value error  at ' + index + '. position');
                        ok(r.Reviewer === undefined, 'Reviewer value error  at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> filter ComplexType', 10, function () {
    var refDate = new Date(Date.parse("1976/02/01"));
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.UserProfiles.filter(function (up) { return up.Location.Zip == 1117 });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    start(1);
                    equal(results.length, 1, 'Article category error');
                    results.forEach(function (r, index) {
                        ok(r instanceof $news.Types.UserProfile, 'data type error at ' + index + '. position');
                        equal(r.FullName, 'Full Name', 'Title length error at ' + index + '. position');
                        ok(r.Birthday instanceof Date, 'CreateDate data type error at ' + index + '. position');
                        equal(r.Birthday.valueOf(), refDate.valueOf(), 'CreateDate value error at ' + index + '. position');
                        ok(r.Location instanceof $news.Types.Location, 'Category value error  at ' + index + '. position');
                        equal(r.Location.Zip, 1117, 'Location.Zip value error  at ' + index + '. position');
                        equal(r.Location.City, 'City2', 'Location.City value error  at ' + index + '. position');
                        equal(r.Location.Address, 'Address7', 'Location.Address value error  at ' + index + '. position');
                        equal(r.Location.Country, 'Country2', 'Location.Country value error  at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: indirect -> filter scalar(string) ComplexType', 10, function () {
    var refDate = new Date(Date.parse("1979/05/01"));
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.UserProfiles.filter(function (up) { return up.FullName == 'Full Name2' });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    start(1);
                    equal(results.length, 1, 'Article category error');
                    results.forEach(function (r, index) {
                        ok(r instanceof $news.Types.UserProfile, 'data type error at ' + index + '. position');
                        equal(r.FullName, 'Full Name2', 'FullName value error at ' + index + '. position');
                        ok(r.Birthday instanceof Date, 'Birthday data type error at ' + index + '. position');
                        equal(r.Birthday.valueOf(), refDate.valueOf(), 'Birthday value error at ' + index + '. position');
                        ok(r.Location instanceof $news.Types.Location, 'Location data type at ' + index + '. position');
                        equal(r.Location.Zip, 3451, 'Location.Zip value error  at ' + index + '. position');
                        equal(r.Location.City, 'City5', 'Location.City value error  at ' + index + '. position');
                        equal(r.Location.Address, 'Address0', 'Location.Address value error  at ' + index + '. position');
                        equal(r.Location.Country, 'Country5', 'Location.Country value error  at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: mixed -> filter, map, include', function () {
    if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
    expect(39);
    var refDate = new Date(Date.parse("1979/05/01"));
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.include("Author.Profile").include("Category")
                        .filter(function (item) { return item.Category.Title == 'World' && item.Author.Profile.FullName == 'Full Name2' && item.Reviewer.Profile.Bio == "Bio3" })
                        .map(function (item) {
                            return {
                                name: item.Title,
                                People: {
                                    p1: { name: item.Author.LoginName, prof: item.Author.Profile },
                                    p2: { name: item.Reviewer.LoginName, bio: item.Reviewer.Profile.Bio, tags: item.Tags, adr: item.Reviewer.Profile.Location.Address },
                                    p3: { loc: item.Author.Profile.Location }
                                },
                                Cat: item.Category.Title,
                                Articles: item.Category.Articles
                            }
                        });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    equal(results.length, 1, 'Article category error');
                    results.forEach(function (r, index) {
                        ok(r instanceof Object, 'data type error at ' + index + '. position');
                        equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                        equal(r.name, 'Article25', 'name value error at ' + index + '. position');

                        ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                        //p1 property
                        ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                        equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                        equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                        ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                        equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                        ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                        equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                        //p2 property
                        ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                        equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                        equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position');
                        equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                        equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position');
                        //p2.Tags
                        ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                        equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                        r.People.p2.tags.forEach(function (t) {
                            ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                        });
                        //p2.adr
                        equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                        //p3.loc
                        ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                        ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                        equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                        //r.Cat
                        equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                        equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position');
                        //r.Articles
                        ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                        equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                        r.Articles.forEach(function (a) {
                            ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                            ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                        });
                    });
                    start(1);
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: mixed -> filter, map (without complex type property), include', function () {
    //if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
    expect(38);
    var refDate = new Date(Date.parse("1979/05/01"));
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.include("Author.Profile").include("Category")
                        .filter(function (item) { return item.Category.Title == 'World' && item.Author.Profile.FullName == 'Full Name2' && item.Reviewer.Profile.Bio == "Bio3" })
                        .map(function (item) {
                            return {
                                name: item.Title,
                                People: {
                                    p1: { name: item.Author.LoginName, prof: item.Author.Profile },
                                    p2: { name: item.Reviewer.LoginName, bio: item.Reviewer.Profile.Bio, tags: item.Tags },
                                    p3: { loc: item.Author.Profile.Location }
                                },
                                Cat: item.Category.Title,
                                Articles: item.Category.Articles
                            }
                        });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    equal(results.length, 1, 'Article category error');
                    results.forEach(function (r, index) {
                        ok(r instanceof Object, 'data type error at ' + index + '. position');
                        equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                        equal(r.name, 'Article25', 'name value error at ' + index + '. position');

                        ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                        //p1 property
                        ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                        equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                        equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                        ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                        equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                        ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                        equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                        //p2 property
                        ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                        equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                        equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position');
                        equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                        equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position');
                        //p2.Tags
                        ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                        equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                        r.People.p2.tags.forEach(function (t) {
                            ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                        });
                        //p2.adr
                        //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                        //p3.loc
                        ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                        ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                        equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                        //r.Cat
                        equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                        equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position');
                        //r.Articles
                        ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                        equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                        r.Articles.forEach(function (a) {
                            ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                            ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                        });
                    });
                    start(1);
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: many mixed -> filter, map (without complex type property), include', function () {
    //if (providerConfig.name == "oData") { ok(true, "Not supported"); return; }
    var refDate = new Date(Date.parse("1979/05/01"));
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.include("Author.Profile").include("Category")
                        .filter(function (item) { return (item.Category.Title == 'World' || item.Category.Title == 'Sport') && item.Author.Profile.FullName == 'Full Name2' })
                        .map(function (item) {
                            return {
                                name: item.Title,
                                People: {
                                    p1: { name: item.Author.LoginName, prof: item.Author.Profile },
                                    p2: { name: item.Reviewer.LoginName, bio: item.Reviewer.Profile.Bio, tags: item.Tags },
                                    p3: { loc: item.Author.Profile.Location }
                                },
                                Cat: item.Category.Title,
                                Articles: item.Category.Articles
                            }
                        });
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (results) {
                    expect(75);
                    equal(results.length, 2, 'Article category error');

                    var r = results[0];
                    var index = 0;

                    ok(r instanceof Object, 'data type error at ' + index + '. position');
                    equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                    equal(r.name, 'Article5', 'name value error at ' + index + '. position');

                    ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                    //p1 property
                    ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                    equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                    equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                    ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                    equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                    ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                    equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                    //p2 property
                    ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                    equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                    equal(r.People.p2.name, 'Usr2', 'r.People.p2.name value error at ' + index + '. position');
                    equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                    equal(r.People.p2.bio, 'Bio2', 'r.People.p2.bio value error at ' + index + '. position');
                    //p2.Tags
                    ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                    equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                    r.People.p2.tags.forEach(function (t) {
                        ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                    });
                    //p2.adr
                    //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                    //p3.loc
                    ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                    ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                    equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                    //r.Cat
                    equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                    equal(r.Cat, 'Sport', 'r.Cat value error at ' + index + '. position');
                    //r.Articles
                    ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                    equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                    r.Articles.forEach(function (a) {
                        ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                        ok(['Article1', 'Article2', 'Article5', 'Article3', 'Article4'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                    });

                    r = results[1];
                    index = 1;

                    ok(r instanceof Object, 'data type error at ' + index + '. position');
                    equal(typeof r.name, 'string', 'name data type  error at ' + index + '. position');
                    equal(r.name, 'Article25', 'name value error at ' + index + '. position');

                    ok(r.People instanceof Object, 'r.People data type error at ' + index + '. position');
                    //p1 property
                    ok(r.People.p1 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                    equal(typeof r.People.p1.name, 'string', 'r.People.p1.name data type  error at ' + index + '. position');
                    equal(r.People.p1.name, 'Usr5', 'r.People.p1.name value error at ' + index + '. position');
                    ok(r.People.p1.prof instanceof $news.Types.UserProfile, 'r.People.p1.prof data type  error at ' + index + '. position');
                    equal(r.People.p1.prof.Bio, 'Bio5', 'r.People.p1.bio value error at ' + index + '. position');
                    ok(r.People.p1.prof.Location instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                    equal(r.People.p1.prof.Location.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                    //p2 property
                    ok(r.People.p2 instanceof Object, 'r.People.p2data type error at ' + index + '. position');
                    equal(typeof r.People.p2.name, 'string', 'r.People.p2.name data type  error at ' + index + '. position');
                    equal(r.People.p2.name, 'Usr3', 'r.People.p2.name value error at ' + index + '. position');
                    equal(typeof r.People.p2.bio, 'string', 'r.People.p2.bio data type  error at ' + index + '. position');
                    equal(r.People.p2.bio, 'Bio3', 'r.People.p2.bio value error at ' + index + '. position');
                    //p2.Tags
                    ok(r.People.p2.tags instanceof Array, 'r.People.p2.tags data type error at ' + index + '. position');
                    equal(r.People.p2.tags.length, 2, 'r.People.p2.tags.length value error at ' + index + '. position');
                    r.People.p2.tags.forEach(function (t) {
                        ok(t instanceof $news.Types.TagConnection, 'r.People.p2.tags[i] data type error at ' + index + '. position');
                    });
                    //p2.adr
                    //equal(r.People.p2.adr, 'Address8', 'Location.Address value error  at ' + index + '. position');
                    //p3.loc
                    ok(r.People.p3 instanceof Object, 'r.People.p1 data type error at ' + index + '. position');
                    ok(r.People.p3.loc instanceof $news.Types.Location, 'r.People.p1.prof.Location data type  error at ' + index + '. position');
                    equal(r.People.p3.loc.Address, 'Address0', 'r.People.p1.prof.Location.Address value error at ' + index + '. position');
                    //r.Cat
                    equal(typeof r.Cat, 'string', 'r.Cat data type  error at ' + index + '. position');
                    equal(r.Cat, 'World', 'r.Cat value error at ' + index + '. position');
                    //r.Articles
                    ok(r.Articles instanceof Array, 'r.Articles data type error at ' + index + '. position');
                    equal(r.Articles.length, 5, 'r.Articles.length value error at ' + index + '. position');
                    r.Articles.forEach(function (a) {
                        ok(a instanceof $news.Types.Article, 'r.Articles[i] data type error at ' + index + '. position');
                        ok(['Article21', 'Article22', 'Article23', 'Article24', 'Article25'].indexOf(a.Title) >= 0, 'r.Articles[i].Title value error  at ' + index + '. position');
                    });
                    
                    start(1);
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: direct -> Entity', 105, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.include('Category');
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 26, 'Article category error');
                    result.forEach(function (article, index) {
                        ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                        ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                        ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. position');
                        ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position');
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: direct -> EntitySet', 209, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.include('Tags');
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 26, 'Article category error');
                    result.forEach(function (article, index) {
                        ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                        ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                        ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position');
                        equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position');
                        article.Tags.forEach(function (tag) {
                            ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position');
                            equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position');
                        });

                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: direct -> Entity EntitySet', 261, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.include('Category').include('Tags');
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 26, 'Article category error');
                    result.forEach(function (article, index) {
                        ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                        ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                        ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. position');
                        ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position');
                        ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position');
                        equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position');
                        article.Tags.forEach(function (tag) {
                            ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position');
                            equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position');
                        });

                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: direct -> deep Entity', 209, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.include('Author.Profile');
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 26, 'Article category error');
                    result.forEach(function (article, index) {
                        ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                        ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                        ok(article.Author instanceof $news.Types.User, 'article.Author data type error at ' + index + '. position');
                        ok(article.Author.LoginName.length >= 4, 'article.Author.LoginName length error at ' + index + '. position');
                        ok(article.Author.Profile instanceof $news.Types.UserProfile, 'article.Author.Profile type error at ' + index + '. position');
                        ok(article.Author.Profile.Bio.length > 2, 'article.Author.Profile.Bio length number error at ' + index + '. position');

                        ok(article.Author.Profile.Location instanceof $news.Types.Location, 'article.Author.Profile.Location type error at ' + index + '. position');
                        ok(article.Author.Profile.Location.Address.length > 2, 'article.Author.Profile.Location.Address length number error at ' + index + '. position');


                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});
test('Include: direct -> mixed deep Entity, EntitySet', 417, function () {
    stop(3);
    (new $news.Types.NewsContext(providerConfig)).onReady(function (db) {
        start(1);
        $news.Types.NewsContext.generateTestData(db, function () {
            start(1);
            var q = db.Articles.include('Author.Profile').include('Category').include('Tags');
            //console.log('q: ', q.toTraceString());
            q.toArray({
                success: function (result) {
                    start(1);
                    equal(result.length, 26, 'Article category error');
                    result.forEach(function (article, index) {
                        ok(article instanceof $news.Types.Article, 'data type error at ' + index + '. position');
                        ok(article.Title.length >= 4, 'article.Title length error at ' + index + '. position');
                        ok(article.Author instanceof $news.Types.User, 'article.Author data type error at ' + index + '. position');
                        ok(article.Author.LoginName.length >= 4, 'article.Author.LoginName length error at ' + index + '. position');
                        ok(article.Author.Profile instanceof $news.Types.UserProfile, 'article.Author.Profile type error at ' + index + '. position');
                        ok(article.Author.Profile.Bio.length > 2, 'article.Author.Profile.Bio length number error at ' + index + '. position');

                        ok(article.Author.Profile.Location instanceof $news.Types.Location, 'article.Author.Profile.Location type error at ' + index + '. position');
                        ok(article.Author.Profile.Location.Address.length > 2, 'article.Author.Profile.Location.Address length number error at ' + index + '. position');

                        ok(article.Category instanceof $news.Types.Category, 'article.Category data type error at ' + index + '. position');
                        ok(article.Category.Title.length >= 4, 'article.Category.Title length error at ' + index + '. position');
                        ok(article.Tags instanceof Array, 'article.Tags type error at ' + index + '. position');
                        equal(article.Tags.length, 2, 'article.Tags length number error at ' + index + '. position');
                        article.Tags.forEach(function (tag) {
                            ok(tag instanceof $news.Types.TagConnection, 'article.Tag[i] data type error at ' + index + '. position');
                            equal(typeof tag.Id, 'number', 'article.Tag[i].Id data type error at ' + index + '. position');
                        });
                    });
                },
                error: function (error) {
                    start(1);
                    ok(false, error);
                }
            });
        });
    });
});

require('./T4.js');
ComplexTypeTests(providerConfig, 'mongoDB');

test("orderby with null field Value over navigation field", 5 * 2 + 1, function () {
    stop();
    (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

        for (var i = 0; i < 5; i++) {
            context.Articles.add(new $news.Types.Article({
                Title: 'Article' + (i + 1),
                Category: new $news.Types.Category({
                    Title: i < 3 ? null : 'Title_' + i
                })
            }));
        }

        context.saveChanges(function () {
            context.Articles.include('Category').orderBy('it.Category.Title').toArray(function (res) {
                equal(res.length, 5, 'result count');
                
                for (var i = 0; i < res.length; i++) {
                    ok(res[i] instanceof $news.Types.Article, 'item is Article');
                    ok(res[i].Category instanceof $news.Types.Category, 'item.Category is Category');
                    if (i < 3) {
                        equal(res[i].Category.Title, null, 'item[i].Category.Title is string');
                    } else {
                        equal(res[i].Category.Title, 'Title_' + i, 'item[i].Category.Title is string');
                    }
                }

                start();
            });
        });
    });

});

test("orderby with multiple field Value over navigation field", 1 + 6 * 5, function () {
    stop();
    (new $news.Types.NewsContext(providerConfig)).onReady(function (context) {

        for (var i = 0; i < 6; i++) {
            context.Articles.add(new $news.Types.Article({
                Title: 'Article' + (i + 1),
                Category: new $news.Types.Category({
                    Title: 'Title_' + (i % 2)
                }),
                Author: new $news.Types.User({
                    LoginName: 'User_' + (((6 - i) / 2) | 0)
                })
            }));
        }
        
        var catTitle = [0, 0, 1, 0, 1, 1];

        context.saveChanges(function () {
            context.Articles.include('Category').include('Author').orderByDescending('it.Author.LoginName').orderBy('it.Category.Title').toArray(function (res) {
                equal(res.length, 6, 'result count');
                //console.log(res.map(function(it){ return { t: it.Title, aln: it.Author.LoginName, ct: it.Category.Title }; }));
                
                for (var i = 0; i < res.length; i++) {
                    ok(res[i] instanceof $news.Types.Article, 'item is Article');
                    ok(res[i].Category instanceof $news.Types.Category, 'item.Category is Category');
                    ok(res[i].Author instanceof $news.Types.User, 'item.Author is User');
                    equal(res[i].Category.Title, 'Title_' + catTitle[i], 'item[i].Category.Title is string');
                    equal(res[i].Author.LoginName, 'User_' + (((6 - i) / 2) | 0), 'item[i].Category.Title is string');
                }

                start();
            });
        }).fail($data.debug);
    });

});
