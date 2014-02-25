// JayData 1.3.6
// Dual licensed under MIT and GPL v2
// Copyright JayStack Technologies (http://jaydata.org/licensing)
//
// JayData is a standards-based, cross-platform Javascript library and a set of
// practices to access and manipulate data from various online and offline sources.
//
// Credits:
//     Hajnalka Battancs, Dániel József, János Roden, László Horváth, Péter Nochta
//     Péter Zentai, Róbert Bónay, Szabolcs Czinege, Viktor Borza, Viktor Lázár,
//     Zoltán Gyebrovszki, Gábor Dolla
//
// More info: http://jaydata.org

(function ($data, $) {

    var entityValidator = $data.Validation.Entity;
    var dateConverter = function (stringDate) {
        try {
            return new Date(Date.parse(stringDate));
        } catch (e) {
            return new Date(0);
        }
    };

    var validationMapping = {
        required: { key: 'required' },
        minValue: { key: 'min', validateMethod: true, converter: dateConverter },
        maxValue: { key: 'max', validateMethod: true, converter: dateConverter },
        length: { key: 'length' },
        minLength: { key: 'minlength' },
        maxLength: { key: 'maxlength' },
        regex: { key: 'regex', validateMethod: true },
        customValidator: { key: 'customValidator', validateMethod: true }
    };

    var defaultValidationOption = {
        required: { key: 'required' },
        customValidator: { key: 'customValidator', validateMethod: true }
    };

    var numberValidationOption = {
        required: { key: 'required' },
        customValidator: { key: 'customValidator', validateMethod: true },
        minValue: { key: 'min' },
        maxValue: { key: 'max' }
    };

    var supportedValidations = {
        '$data.Number': numberValidationOption,
        '$data.Float': numberValidationOption,
        '$data.Decimal': numberValidationOption,
        '$data.Integer': numberValidationOption,
        '$data.Int16': numberValidationOption,
        '$data.Int32': numberValidationOption,
        '$data.Int64': numberValidationOption,
        '$data.Byte': numberValidationOption,
        '$data.SByte': numberValidationOption,
        '$data.String': {
            required: { key: 'required' },
            customValidator: { key: 'customValidator', validateMethod: true },
            minLength: { key: 'minlength' },
            maxLength: { key: 'maxlength' },
            length: { key: 'length' },
            regex: { key: 'regex', validateMethod: true }
        },
        '$data.Date': {
            required: { key: 'required' },
            customValidator: { key: 'customValidator', validateMethod: true },
            minValue: { key: 'min', validateMethod: true, converter: dateConverter },
            maxValue: { key: 'max', validateMethod: true, converter: dateConverter }
        },
        '$data.DateTimeOffset': {
            required: { key: 'required' },
            customValidator: { key: 'customValidator', validateMethod: true },
            minValue: { key: 'min', validateMethod: true, converter: dateConverter },
            maxValue: { key: 'max', validateMethod: true, converter: dateConverter }
        },
        '$data.Time': {
            required: { key: 'required' },
            customValidator: { key: 'customValidator', validateMethod: true },
            minValue: { key: 'min' },
            maxValue: { key: 'max' }
        },
        '$data.Array': {
            required: { key: 'required' },
            customValidator: { key: 'customValidator', validateMethod: true },
            length: { key: 'length', validateMethod: true }
        },
        '$data.Boolean': defaultValidationOption,
        '$data.Object': defaultValidationOption
    };

    var createValidationItem = function (memDef, rule, typeName, result) {
        if (memDef[rule]) {
            var validation = supportedValidations[typeName][rule];
            var ruleName = validation.key;
            var ruleValue = entityValidator.getValidationValue(memDef, rule);
            if (validation.validateMethod === true) {
                ruleName = memDef.name + '_' + ruleName;
                $.validator.addMethod(ruleName, function (value, element) {
                    if (!value)
                        value = undefined;

                    if (value && validation.converter && typeof validation.converter == "function")
                        value = validation.converter(value);

                    return entityValidator.supportedValidations[typeName][rule](value, ruleValue);
                }, entityValidator.getValidationMessage(memDef, rule, 'Validation Error!'));
                result.rules[memDef.name] = result.rules[memDef.name] || {};
                result.rules[memDef.name][ruleName] = true;
                return;
            }
            else {
                result.rules[memDef.name] = result.rules[memDef.name] || {};
                result.rules[memDef.name][ruleName] = ruleValue;
            }

            var message = entityValidator.getValidationMessage(memDef, rule);
            if (message) {
                result.messages[memDef.name] = result.messages[memDef.name] || {};
                result.messages[memDef.name][ruleName] = message;
            }

        }
    };

    var buildValidationModel = function (type, result) {
        type.memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            var typeName = Container.resolveName(Container.resolveType(memDef.dataType));
            if (supportedValidations[typeName]) {
                var validations = Object.keys(supportedValidations[typeName]);
                validations.forEach(function (validation) {
                    createValidationItem(memDef, validation, typeName, result);
                });
            }
        });
    };


    $data.Entity.prototype.toJQueryValidate = function (callBack) {
        if (typeof $ === 'undefined' || typeof $.validator === 'undefined') {
            Guard.raise(new Exception('jQuery and jQuery validator plugin is required', 'Not Found!'));
        }
        var model = this;

        var validateResult = { rules: {}, messages: {} };
        buildValidationModel(model.getType(), validateResult);

        callBack = $data.typeSystem.createCallbackSetting(callBack, {});
        if (callBack.success) {
            var origCallback = callBack.success;
            callBack.success = function (form, event) {
                if ($.fn.formBinder)
                    $(form).formBinder(model, false);
                origCallback.apply(this, [model, form, event]);
            };
        }
        if (typeof callBack.success == "function")
            validateResult.submitHandler = callBack.success;
        if (typeof callBack.error == "function")
            validateResult.invalidHandler = callBack.error;
        return validateResult;
    };

})($data, jQuery);