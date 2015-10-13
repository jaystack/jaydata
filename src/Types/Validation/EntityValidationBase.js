
$data.Class.define('$data.Validation.ValidationError', null, null, {
    constructor: function (message, propertyDefinition, type) {
        ///<param name="message" type="string" />
        ///<param name="propertyDefinition" type="$data.MemberDefinition" />

        this.Message = message;
        this.PropertyDefinition = propertyDefinition;
        this.Type = type;
    },
    Type: { dataType: 'string' },
    Message: { dataType: "string" },
    PropertyDefinition: { dataType: $data.MemberDefinition }
}, null);

$data.Class.define('$data.Validation.EntityValidationBase', null, null, {

    ValidateEntity: function (entity) {
        ///<param name="entity" type="$data.Entity" />
        return [];
    },

    ValidateEntityField: function (entity, memberDefinition) {
        ///<param name="entity" type="$data.Entity" />
        ///<param name="memberDefinition" type="$data.MemberDefinition" />
        return [];
    },

    getValidationValue: function (memberDefinition, validationName) {
        Guard.raise("Pure class");
    },
    getValidationMessage: function (memberDefinition, validationName, defaultMessage) {
        Guard.raise("Pure class");
    }

}, null);

$data.Validation = $data.Validation || {};
$data.Validation.Entity = new $data.Validation.EntityValidationBase();
