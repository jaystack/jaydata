
$data.Class.define('$data.Validation.EntityValidation', $data.Validation.EntityValidationBase, null, {

    ValidateEntity: function (entity) {
        ///<param name="entity" type="$data.Entity" />

        var errors = [];
        entity.getType().memberDefinitions.getPublicMappedProperties().forEach(function (memDef) {
            errors = errors.concat(this.ValidateEntityField(entity, memDef, undefined, true));
        }, this);
        return errors;
    },
    ValidateEntityField: function (entity, memberDefinition, newValue, valueNotSet) {
        ///<param name="entity" type="$data.Entity" />
        ///<param name="memberDefinition" type="$data.MemberDefinition" />
        var errors = [];
        var typeName = Container.resolveName(Container.resolveType(memberDefinition.dataType));
        var value = !valueNotSet ? newValue : entity[memberDefinition.name];
        this.fieldValidate(entity, memberDefinition, value, errors, typeName);
        return errors;
    },

    getValidationValue: function (memberDefinition, validationName) {
        if (memberDefinition[validationName] && memberDefinition[validationName].value)
            return memberDefinition[validationName].value;
        else
            return memberDefinition[validationName];
    },
    getValidationMessage: function (memberDefinition, validationName, defaultMessage) {
        var eMessage = defaultMessage;
        if (typeof memberDefinition[validationName] == "object" && memberDefinition[validationName].message)
            eMessage = memberDefinition[validationName].message;
        else if (memberDefinition.errorMessage)
            eMessage = memberDefinition.errorMessage;

        return eMessage;
    },
    createValidationError: function (memberDefinition, validationName, defaultMessage) {
        return new $data.Validation.ValidationError(this.getValidationMessage(memberDefinition, validationName, defaultMessage), memberDefinition, validationName);
    },

    supportedValidations: {
        value: {
            '$data.Number': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                minValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value >= definedValue; },
                maxValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value <= definedValue; }
            },
            '$data.Integer': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                minValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value >= definedValue; },
                maxValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value <= definedValue; }
            },
            '$data.String': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                minLength: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length >= definedValue; },
                maxLength: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length <= definedValue; },
                length: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length == definedValue; },
                regex: function (value, definedValue) {
                    return Object.isNullOrUndefined(value) ||
                        value.match(typeof definedValue === 'string'
                            ? new RegExp((definedValue.indexOf('/') === 0 && definedValue.lastIndexOf('/') === (definedValue.length - 1)) ? definedValue.slice(1, -1) : definedValue)
                            : definedValue)
                }
            },
            '$data.Date': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                minValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value >= definedValue; },
                maxValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value <= definedValue; }
            },
            '$data.Boolean':{
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; }
            },
            '$data.Array': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },
                length: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length == definedValue; }
            },
            '$data.Object': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; }
            },
            '$data.Guid': {
                required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
                customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; }
            }
        }
    },

    fieldValidate: function (entity, memberDefinition, value, errors, validationTypeName) {
        ///<param name="memberDefinition" type="$data.MemberDefinition" />
        ///<param name="value" type="Object" />
        ///<param name="errors" type="Array" />
        ///<param name="validationTypeName" type="string" />
        if (entity.entityState == $data.EntityState.Modified && entity.changedProperties && entity.changedProperties.indexOf(memberDefinition) < 0)
            return;

        var validatonGroup = this.supportedValidations[validationTypeName];
        if (validatonGroup) {
            var validations = Object.keys(validatonGroup);
            validations.forEach(function (validation) {
                if (memberDefinition[validation] && validatonGroup[validation] && !validatonGroup[validation].call(entity, value, this.getValidationValue(memberDefinition, validation)))
                    errors.push(this.createValidationError(memberDefinition, validation, 'Validation error!'));
            }, this);
        }
    }

}, null);

$data.Validation.Entity = new $data.Validation.EntityValidation();
