import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';


export class Metadata {
    
    constructor(options, metadata) {
        this.options = options
        this.metadata = metadata
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

    createEntityDefinition(entitySchema) {
        var props = (entitySchema.property || []).map(this.createProperty.bind(this))

        var result = {}
        props.forEach(p => result[p.name] = p.definition)
        
        return result
    }
    
    createEntityType(container, entitySchema, namespace) {
        var baseType = this.options.baseType || $data.Entity
        return baseType.extend(`${namespace}.${entitySchema.name}`, container, 
                                this.createEntityDefinition(entitySchema))
    }
    
    createContextDefinition() {
        
    }
    
    
    createContextType() {
        var container = $data.createContainer()
        this.metadata.dataServices.schema.forEach(schema => {
            var ns = schema.namespace
            if (schema.entityType) {
                schema.entityType.forEach(et => this.createEntityType(container, et, ns))
            }
        })
        console.log(container)
        
    }
    
    convertToSourceCode(done) {

    }
}

$data.Metadata = Metadata
