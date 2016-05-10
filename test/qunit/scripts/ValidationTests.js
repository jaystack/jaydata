$(document).ready(function () {
    module("ValidationTests");

    var intValidationClass = $data.Class.define('intValidationClass', $data.Entity, null, {
        prop1: { dataType: 'int', key: true },
        prop2: { dataType: 'int', minValue: 1 },
        prop3: { dataType: 'int', maxValue: 3, errorMessage: 'Error!' },
        prop4: { dataType: 'int', minValue: 1, maxValue: 5 },
        prop5: { dataType: 'int', minValue: { value: 1, message: 'Error!' }, maxValue: 5 }
    }, null);

    test("Entity validation int", 16, function () {
        var ivc = new intValidationClass();
        stop(2);
        ivc.propertyValidationError.attach(function (sender, eventData) {
            start();
            ok(sender == ivc, 'validation error fired');
            equal(eventData.oldValue, undefined, 'old value');
            equal(eventData.newValue, 0, 'new value');
            equal(eventData.cancel, false, 'property set cancel property');
            equal(eventData.errors instanceof Array, true, 'has errors');
            equal(eventData.errors[0] instanceof $data.Validation.ValidationError, true, 'error item type');
            equal(eventData.errors[0].Message, 'Validation error!', "error's error message");

        });
        ivc.prop2 = 0;
        equal(ivc.prop2, 0, 'new value assigned');
        ivc.prop2 = 2; //not trigger
        ivc.prop2 = 1; //not trigger

        ivc = new intValidationClass();
        ivc.propertyValidationError.attach(function (sender, eventData) {
            start();
            ok(sender == ivc, 'validation error fired');
            equal(eventData.oldValue, undefined, 'old value');
            equal(eventData.newValue, 4, 'new value');
            equal(eventData.cancel, false, 'property set cancel property');
            equal(eventData.errors instanceof Array, true, 'has errors');
            equal(eventData.errors[0] instanceof $data.Validation.ValidationError, true, 'error item type');
            equal(eventData.errors[0].Message, 'Error!', "error's error message");

            eventData.cancel = true;
        });
        ivc.prop3 = 4;
        equal(ivc.prop3, undefined, 'new value not assigned');
        ivc.prop3 = 2;
        ivc.prop3 = 3;

    });


    var stringValidationClass = $data.Class.define('stringValidationClass', $data.Entity, null, {
        prop: { dataType: 'int', key: true },
        prop1: { dataType: 'string', length: 5 },
        prop2: { dataType: 'string', minLength: 5 },
        prop3: { dataType: 'string', maxLength: 5 },
        prop4: { dataType: 'string', minLength: 3, maxlength: 5, errorMessage: 'Error!' },
        prop5: { dataType: 'string', regex: 'abc\\d' }
    }, null);

    test("Entity validation string", 32, function () {
        var svc = new stringValidationClass();
        stop(4);
        svc.propertyValidationError.attach(function (sender, eventData) {
            start();
            ok(sender == svc, 'validation error fired');
            equal(eventData.oldValue, undefined, 'old value');
            equal(eventData.newValue, 'hello2', 'new value');
            equal(eventData.cancel, false, 'property set cancel property');
            equal(eventData.errors instanceof Array, true, 'has errors');
            equal(eventData.errors[0] instanceof $data.Validation.ValidationError, true, 'error item type');
            equal(eventData.errors[0].Message, 'Validation error!', "error's error message");

        });
        svc.prop1 = 'hello2';
        equal(svc.prop1, 'hello2', 'new value assigned');
        svc.prop1 = 'hello'; //not trigger

        svc = new stringValidationClass();
        svc.propertyValidationError.attach(function (sender, eventData) {
            start();
            ok(sender == svc, 'validation error fired');
            equal(eventData.oldValue, undefined, 'old value');
            equal(eventData.newValue, 'abc', 'new value');
            equal(eventData.cancel, false, 'property set cancel property');
            equal(eventData.errors instanceof Array, true, 'has errors');
            equal(eventData.errors[0] instanceof $data.Validation.ValidationError, true, 'error item type');
            equal(eventData.errors[0].Message, 'Validation error!', "error's error message");

            eventData.cancel = true;
        });
        svc.prop2 = 'abc';
        equal(svc.prop2, undefined, 'new value not assigned');
        svc.prop2 = 'abcdef';

        svc = new stringValidationClass();
        svc.propertyValidationError.attach(function (sender, eventData) {
            start();
            ok(sender == svc, 'validation error fired');
            equal(eventData.oldValue, undefined, 'old value');
            equal(eventData.newValue, 'abcabc', 'new value');
            equal(eventData.cancel, false, 'property set cancel property');
            equal(eventData.errors instanceof Array, true, 'has errors');
            equal(eventData.errors[0] instanceof $data.Validation.ValidationError, true, 'error item type');
            equal(eventData.errors[0].Message, 'Validation error!', "error's error message");
        });
        svc.prop3 = 'abcabc';
        equal(svc.prop3, 'abcabc', 'new value assigned');
        svc.prop3 = 'abc';

        svc = new stringValidationClass();
        svc.propertyValidationError.attach(function (sender, eventData) {
            start();
            ok(sender == svc, 'validation error fired');
            equal(eventData.oldValue, undefined, 'old value');
            equal(eventData.newValue, 'abc', 'new value');
            equal(eventData.cancel, false, 'property set cancel property');
            equal(eventData.errors instanceof Array, true, 'has errors');
            equal(eventData.errors[0] instanceof $data.Validation.ValidationError, true, 'error item type');
            equal(eventData.errors[0].Message, 'Validation error!', "error's error message");
        });
        svc.prop5 = 'abc';
        equal(svc.prop5, 'abc', 'new value assigned');
        svc.prop5 = 'abc1';
        svc.prop5 = 'abc12';

    });


    var customValidationClass = $data.Class.define('customValidationClass', $data.Entity, null, {
        prop: { dataType: 'int', key: true, required: true },
        prop1: { dataType: 'datetime', minValue: new Date(1334584054544) },
        prop2: { dataType: 'string', customValidator: function (value) { return value == 'abc'; } },
    }, null);

    test("Entity validation custom", 14, function () {
        var ivc = new customValidationClass();
        stop(2);
        ivc.propertyValidationError.attach(function (sender, eventData) {
            start();
            ok(sender == ivc, 'validation error fired');
            equal(eventData.oldValue, undefined, 'old value');
            equal(eventData.newValue.valueOf(), 1334584054543, 'new value');
            equal(eventData.cancel, false, 'property set cancel property');
            equal(eventData.errors instanceof Array, true, 'has errors');
            equal(eventData.errors[0] instanceof $data.Validation.ValidationError, true, 'error item type');
            equal(eventData.errors[0].Message, 'Validation error!', "error's error message");

        });
        ivc.prop1 = new Date(1334584054543);
        ivc.prop1 = new Date(1334584054545); //not trigger

        ivc = new customValidationClass();
        ivc.propertyValidationError.attach(function (sender, eventData) {
            start();
            ok(sender == ivc, 'validation error fired');
            equal(eventData.oldValue, undefined, 'old value');
            equal(eventData.newValue, 'abc1', 'new value');
            equal(eventData.cancel, false, 'property set cancel property');
            equal(eventData.errors instanceof Array, true, 'has errors');
            equal(eventData.errors[0] instanceof $data.Validation.ValidationError, true, 'error item type');
            equal(eventData.errors[0].Message, 'Validation error!', "error's error message");
        });
        ivc.prop2 = 'abc1';
        ivc.prop2 = 'abc';
    });

    test("Entity validation func", 10, function () {
        var ivc = new customValidationClass();

        equal(ivc.isValid(), false, 'entity not valid');
        equal(ivc.ValidationErrors.length, 2, 'validation error length');

        ivc.prop1 = new Date(0);
        equal(ivc.isValid(), false, 'entity not valid');
        equal(ivc.ValidationErrors.length, 3, 'validation error length');

        ivc.prop = 1;
        equal(ivc.isValid(), false, 'entity not valid');
        equal(ivc.ValidationErrors.length, 2, 'validation error length');

        ivc.prop2 = 'abc';
        equal(ivc.isValid(), false, 'entity not valid');
        equal(ivc.ValidationErrors.length, 1, 'validation error length');

        ivc.prop1 = 1334584054550;
        equal(ivc.isValid(), true, 'entity not valid');
        equal(ivc.ValidationErrors.length, 0, 'validation error length');

    });

    if ($data.StorageProviderLoader.isSupported('sqLite')) {
        test("Entity validation - partial update", 4, function () {
            $data.Class.define('vtestEntity', $data.Entity, null, {
                Id: { type: 'int', key: true, computed: true },
                Title: { type: 'string', required: true },
                Lead: { type: 'string', required: true, minLength: 10 },
                Enabled: { type: 'bool', required: true }
            }, null);

            $data.Class.define('vtestContext', $data.EntityContext, null, {
                Items: { type: $data.EntitySet, elementType: vtestEntity }
            });

            stop();
            var context = new vtestContext({ name: 'sqLite', databaseName: 'vtest' });
            context.onReady(function () {
                var entity = new vtestEntity({ Title: 'title1', Lead: 'Long lead text here' });
                context.Items.add(entity);

                context.saveChanges(function () {
                    equal(entity.Enabled, false, 'boolean default value failed');
                    context.Items.toArray(function (result) {
                        var e = result[0];
                        equal(e.Enabled, false, 'boolean default value failed');

                        var e2 = new vtestEntity({ Id: e.Id });
                        context.Items.attach(e2);

                        //Dont want to change other fields, just title.
                        //(Lead and Enabled also has validation failed)
                        e2.Title = e.Title + '_changed';

                        context.saveChanges({
                            success: function () {
                                context.Items.filter(function (v) { return v.Id == this.Id }, { Id: e.Id }).single(undefined, undefined, function (result) {
                                    equal(result.Title, e.Title + '_changed', 'changed text failed');
                                    equal(result.Lead, e.Lead, 'original text failed');
                                    start();
                                })
                            },
                            error: function (ex) {
                                equal(e2.ValidationErrors.length, 0, 'Validation errors exists');
                                ok(false, 'Partial update failed' + JSON.stringify(ex));
                                start();
                            }
                        });

                    });


                });

            });


        });
    }

    var entityFieldConversationClass = $data.Class.define('entityFieldConversationClass', $data.Entity, null, {
        prop1: { dataType: 'int', key: true },
        prop2: { dataType: 'int' },
        prop3: { dataType: 'number' },
        prop4: { dataType: 'guid' },
        prop5: { dataType: 'bool' },
        prop6: { dataType: 'date' },
        prop7: { dataType: 'object' }

    }, null);

    test("Entity field not conversation tests", 7, function () {
        var efc = new entityFieldConversationClass();
        
        efc.prop2 = 5;
        equal(efc.prop2, 5, 'int');

        efc.prop3 = 5.5;
        equal(efc.prop3, 5.5, 'number');

        efc.prop4 = $data.parseGuid('aaaabbbb-1111-2222-3333-ccccddddeeee');
        equal(efc.prop4, 'aaaabbbb-1111-2222-3333-ccccddddeeee', 'guid');

        efc.prop5 = true;
        equal(efc.prop5, true, 'bool');
        efc.prop5 = false;
        equal(efc.prop5, false, 'bool');

        var date = new Date('2000/02/02 01:01:01');
        efc.prop6 = date;
        equal(efc.prop6.valueOf(), date.valueOf(), 'date');

        var obj = { a: 42 };
        efc.prop7 = obj;
        deepEqual(efc.prop7, obj, 'object');

    });
    test("Entity field conversation from string", 9, function () {
        var efc = new entityFieldConversationClass();

        efc.prop2 = '5';
        equal(efc.prop2, 5, 'int');

        efc.prop3 = '5.5';
        equal(efc.prop3, 5.5, 'number');

        efc.prop4 = 'aaaabbbb-1111-2222-3333-ccccddddeeee';
        equal(efc.prop4, 'aaaabbbb-1111-2222-3333-ccccddddeeee', 'guid');

        efc.prop5 = 'true';
        equal(efc.prop5, true, 'bool');
        efc.prop5 = 'false';
        equal(efc.prop5, false, 'bool');

        efc.prop5 = 'True';
        equal(efc.prop5, true, 'bool');
        efc.prop5 = 'False';
        equal(efc.prop5, false, 'bool');

        var date = new Date('2000/02/02 01:01:01');
        efc.prop6 = '2000/02/02 01:01:01';
        equal(efc.prop6.valueOf(), date.valueOf(), 'date');

        var obj = { a: 42 };
        efc.prop7 = '{"a":42}';
        deepEqual(efc.prop7, obj, 'object');

    });

    test("Entity int field conversation from invalid string", 3, function () {
        var efc = new entityFieldConversationClass();

        try {
            efc.prop2 = '5a';
            equal(efc.prop2, 0, 'int conversation failed');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Integer'", '5a is not valid integer');
        }

        try {
            efc.prop2 = 'a5';
            equal(efc.prop2, 0, 'int conversation failed');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Integer'", 'a5 is not valid integer');
        }

        try {
            efc.prop2 = 'ab';
            equal(efc.prop2, 0, 'int conversation failed');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Integer'", 'ab is not valid integer');
        }

    });

    test("Entity number field conversation from invalid string", 4, function () {
        var efc = new entityFieldConversationClass();

        try {
            efc.prop3 = '5.5a';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Number'", '5.5a is not valid number');
        }

        try {
            efc.prop3 = '5,5a';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Number'", '5,5a is not valid number');
        }

        try {
            efc.prop3 = 'a5.5';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Number'", 'a5.5 is not valid number');
        }

        try {
            efc.prop3 = 'ab';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Number'", 'ab is not valid number');
        }

    });

    test("Entity guid field conversation from invalid string", 4, function () {
        var efc = new entityFieldConversationClass();

        efc.prop4 = 'aaaabbbb-1111-2222-3333-ccccddddeeee';
        equal(efc.prop4, 'aaaabbbb-1111-2222-3333-ccccddddeeee', 'guid conversation failed');

        efc.prop4 = 'AAAABBBB-1111-2222-3333-CCCCDDDDEEEE';
        equal(efc.prop4, 'AAAABBBB-1111-2222-3333-CCCCDDDDEEEE', 'guid conversation failed');

        try {
            efc.prop4 = 'aaaabbbb-1111-2222-3333-ccccddddeeeef';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Guid'", 'aaaabbbb-1111-2222-3333-ccccddddeeeef is not valid guid');
        }

        try {
            efc.prop4 = 'aaaabbbb1111-22223333-ccccddddeeeeff';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Guid'", 'aaaabbbb1111-22223333-ccccddddeeeeff is not valid guid');
        }

    });

    /*test("Entity boolean field conversation from invalid string", 3, function () {
        var efc = new entityFieldConversationClass();

        try {
            efc.prop5 = 'truea';
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Boolean'", 'truea is not valid boolean');
        }

        try {
            efc.prop5 = 'Falseb';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Boolean'", 'Falseb is not valid boolean');
        }

        try {
            efc.prop5 = 'world';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Boolean'", 'world is not valid boolean');
        }

    });*/

    test("Entity date field conversation from invalid string", 3, function () {
        var efc = new entityFieldConversationClass();

        try {
            efc.prop6 = '0:01-2:1';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Date'", 'truea is not valid date');
        }

        try {
            efc.prop6 = '4-3*2-42';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Date'", 'Falseb is not valid date');
        }

        try {
            efc.prop6 = 'world';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Date'", 'world is not valid date');
        }

    });

    test("Entity object field conversation from invalid string", 3, function () {
        var efc = new entityFieldConversationClass();

        try {
            efc.prop7 = '{a:42}';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Object'", 'truea is not valid object');
        }

        try {
            efc.prop7 = '[{ba:42}]';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Object'", 'Falseb is not valid object');
        }

        try {
            efc.prop7 = 'world';
            ok(false, 'invalid run');
        } catch (e) {
            equal(e.message, "Value '$data.String' not convertable to '$data.Object'", 'world is not valid object');
        }

    });
});
