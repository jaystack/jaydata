$(document).ready(function () {
    module("ValidationTests");

    
    $data.Class.define("UserModel", $data.Entity, null, {
        Id: { dataType: "int", key: true, computed: true },
        UserName: { dataType: "string", required: true, minLength: 6, maxLength: 15 },
        Bio: { dataType: "string", required: true },
        Avatar: { dataType: "blob" },
        Zip: { dataType: "int", minValue: { value: 1000, message: 'min value 1000' }, maxValue: 9999 },
        Birthday: { dataType: "date", minValue: new Date(Date.parse("March 21, 2012")), errorMessage: "min date message" },
        Regex: { dataType: "string", regex: '\\wb\\w', errorMessage: "regex error" },
        CustomValid: { dataType: "string", required: { value: true, message: 'required' }, customValidator: function (v) { return !v || v.length == 3 }, errorMessage: "custom error" },
    }, null);

    test("Validation plugin teszt", 18, function () {
        var user = new UserModel();
        equal(typeof user.toJQueryValidate, 'function', 'model creator for validate');

        var vModel = user.toJQueryValidate();

        equal(typeof vModel.rules, 'object', 'rule set');
        equal(typeof vModel.messages, 'object', 'message set');

        equal(typeof vModel.rules.UserName, 'object', 'UserName rule set');
        equal(vModel.rules.UserName.required, true, 'UserName is required');
        equal(vModel.messages.UserName, undefined, 'UserName messages');

        equal(vModel.rules.UserName.minlength, 6, 'UserName minlength');

        equal(vModel.rules.UserName.maxlength, 15, 'UserName maxlength');

        equal(vModel.rules.Zip.min, 1000, 'Zip min');
        equal(vModel.messages.Zip.min, 'min value 1000', 'Zip min message');

        equal(vModel.rules.Zip.max, 9999, 'Zip max');
        equal(vModel.messages.Zip.max, undefined, 'Zip max message');

        equal(vModel.rules.Birthday.Birthday_min, true, 'Birthday min');

        equal(vModel.rules.Regex.Regex_regex, true, 'Regex regex');

        equal(vModel.rules.CustomValid.required, true, 'CustomValid required');
        equal(vModel.messages.CustomValid.required, 'required', 'CustomValid required message');

        equal(vModel.rules.CustomValid.CustomValid_customValidator, true, 'CustomValid min');
        equal(vModel.messages.CustomValid.CustomValid_customValidator, undefined, 'CustomValid customValidator message set by validator func');
    });

});