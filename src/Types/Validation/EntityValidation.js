$data.Class.define('$data.Validation.Defaults', null, null, null, {
    validators: {
        value: {
            required: function (value, definedValue) { return !Object.isNullOrUndefined(value); },
            customValidator: function (value, definedValue) { return Object.isNullOrUndefined(value) || typeof definedValue == "function" ? definedValue(value) : true; },

            minValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value >= definedValue; },
            maxValue: function (value, definedValue) { return Object.isNullOrUndefined(value) || value <= definedValue; },

            minLength: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length >= definedValue; },
            maxLength: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length <= definedValue; },
            length: function (value, definedValue) { return Object.isNullOrUndefined(value) || value.length == definedValue; },
            regex: function (value, definedValue) {
                return Object.isNullOrUndefined(value) ||
                    value.match(typeof definedValue === 'string'
                        ? new RegExp((definedValue.indexOf('/') === 0 && definedValue.lastIndexOf('/') === (definedValue.length - 1)) ? definedValue.slice(1, -1) : definedValue)
                        : definedValue)
            }
        }
    },

    _getGroupValidations: function (validations) {
        var validators = {};
        if (Array.isArray(validations)) {
            for (var i = 0; i < validations.length; i++) {
                var validator = validations[i];
                if (typeof this.validators[validator] === 'function') {
                    validators[validator] = this.validators[validator];
                }
            }
        }

        return validators;
    }
});

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
        var resolvedType = Container.resolveType(memberDefinition.dataType);
        var typeName = Container.resolveName(resolvedType);
        var value = !valueNotSet ? newValue : entity[memberDefinition.name];

        if (!memberDefinition.inverseProperty && resolvedType && typeof resolvedType.isAssignableTo === 'function' && resolvedType.isAssignableTo($data.Entity)) {
            typeName = $data.Entity.fullName;
        }

        this.fieldValidate(entity, memberDefinition, value, errors, typeName);
        return errors;
    },

    getValidationValue: function (memberDefinition, validationName) {
        var value;
        if (memberDefinition[validationName] && memberDefinition[validationName].value)
            value = memberDefinition[validationName].value;
        else
            value = memberDefinition[validationName];

        if (this.convertableValidation[validationName]) {
            var typeToConvert;
            if (this.convertableValidation[validationName] === true) {
                typeToConvert = memberDefinition.type;
            } else {
                typeToConvert = this.convertableValidation[validationName];
            }

            if (typeToConvert)
                value = Container.convertTo(value, typeToConvert, memberDefinition.elementType);
        }

        return value;
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

    convertableValidation: {
        value: {
            required: '$data.Boolean',
            minValue: true,
            maxValue: true,
            minLength: '$data.Integer',
            maxLength: '$data.Integer',
            length: '$data.Integer'
        }

    },
    supportedValidations: {
        value: {
            //'$data.Entity': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.ObjectID': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.Byte': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.SByte': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Decimal': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Float': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Number': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Int16': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Integer': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Int32': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Int64': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.String': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minLength', 'maxLength', 'length', 'regex']),
            '$data.Date': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.DateTimeOffset': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Time': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minValue', 'maxValue']),
            '$data.Boolean': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.Array': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'length']),
            '$data.Object': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.Guid': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.Blob': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator', 'minLength', 'maxLength', 'length']),
            '$data.GeographyPoint': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeographyLineString': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeographyPolygon': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeographyMultiPoint': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeographyMultiLineString': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeographyMultiPolygon': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeographyCollection': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeometryPoint': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeometryLineString': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeometryPolygon': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeometryMultiPoint': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeometryMultiLineString': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeometryMultiPolygon': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator']),
            '$data.GeometryCollection': $data.Validation.Defaults._getGroupValidations(['required', 'customValidator'])
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

            if (validationTypeName === $data.Entity.fullName && value instanceof $data.Entity && !value.isValid()) {
                errors.push(this.createValidationError(memberDefinition, 'ComplexProperty', 'Validation error!'));
            }
        }
    }

}, null);

$data.Validation.Entity = new $data.Validation.EntityValidation();
