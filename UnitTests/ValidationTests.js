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
        stop(3);
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
                            context.Items.filter(function (v) { return v.Id == this.Id }, { Id: e.Id }).single(function (result) {
                                equal(result.Title, e.Title + '_changed', 'changed text failed');
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
});