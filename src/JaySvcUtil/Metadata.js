import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';


export class Metadata {
    
    constructor(options, metadata) {
        this.options = options
        this.metadata - metadata
    }
    
    _getMaxValue(maxValue) {
        if ("number" === typeof maxValue) return maxValue
        if ("max" === maxValue) return Number.MAX_VALUE
        return parseInt(maxValue)
    }
    containsField(object, field, cb) {
        if (field in object) {
            cb(object[field])
        }
    }
    
    createProperty(propertySchema, entitySchema) {

        var definition = {
            type: propertySchema.type,
        }

        this.containsField(propertySchema, "nullable", v => {
            definition.nullable = v,
            definition.required = v === false
        })

        this.containsField(propertySchema, "maxLength", v => {
            definition.maxLength = this._getMaxValue(v)
        })
        
        return {
            name: propertySchema.name,
            definition
        }
    }

    createEntityTypeDefinition(entitySchema) {
        var props = (entitySchema.property || []).map(this.createProperty.bind(this))
    }
    
    createEntityType(container, entitySchema, namespace) {
        var baseType = this.options.baseType || $data.Entity 
    }
    
    createContextType() {
        var container = $data.createContainer()
        //var contextMembers = {}
        
    }
    
    convertToSourceCode(done) {

    }
}