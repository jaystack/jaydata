import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

var containsField = (obj, field, cb) => {
    if (field in (obj || {})) {
        cb(obj[field])
    }
}

var parsebool = (b,d) => {
    if ("boolean" === typeof b) {
        return b
    }
    switch(b) {
        case "true": return true
        case "false": return false
        default: return d
    }
}

export class Metadata {

    constructor(options, metadata) {
        this.options = options || {}
        this.metadata = metadata
        this.options.container = this.options.container || $data.createContainer()
    }

    _getMaxValue(maxValue) {
        if ("number" === typeof maxValue) return maxValue
        if ("max" === maxValue) return Number.MAX_VALUE
        return parseInt(maxValue)
    }


    createProperty(entitySchema, propertySchema) {
        if (!propertySchema) {
            propertySchema = entitySchema
            entitySchema = undefined
        }

        var definition = {
            type: propertySchema.type,
        }

        containsField(propertySchema, "nullable", v => {
            definition.nullable = parsebool(v, true),
            definition.required = parsebool(v, true) === false
        })

        containsField(propertySchema, "maxLength", v => {
            definition.maxLength = this._getMaxValue(v)
        })

        containsField(entitySchema, "key", keys => {
            if (keys.some(key =>key.propertyRef.some(pr => pr.name === propertySchema.name))) {
                definition.key = true
            }
        })

        return {
            name: propertySchema.name,
            definition
        }
    }

    createEntityDefinition(entitySchema) {
        var props = (entitySchema.property || []).map(this.createProperty.bind(this, entitySchema))
        var result = props.reduce( (p, c) => {
            p[c.name] = c.definition
            return p
         }, {})
        return result
    }

    createEntityType(entitySchema, namespace) {
        let baseType = this.options.baseType || $data.Entity
        let definition = this.createEntityDefinition(entitySchema)
        let entityFullName = `${namespace}.${entitySchema.name}`
        return baseType.extend(entityFullName, this.options.container, definition)
    }


    createEntitySetProperty(entitySetSchema, contextSchema) {
        var c = this.options.container
        var t = c.classTypes[c.classNames[entitySetSchema.entityType]] // || entitySetSchema.entityType
        var prop = {
            name: entitySetSchema.name,
            definition: {
                type: $data.EntitySet,
                elementType: t
            }
        }
        return prop
    }

    indexBy(fieldName, pick) {
        return [(p, c) => { p[c[fieldName]] = c[pick];  return p }, {}]
    }

    createContextDefinition(contextSchema, namespace) {
        var props = (contextSchema.entitySet || []).map( es => this.createEntitySetProperty(es, contextSchema))

        var result = props.reduce(...this.indexBy("name","definition"))
        return result
    }

    createContextType(contextSchema, namespace) {
        if (Array.isArray(contextSchema)) {
            throw new Error("Array type is not supported here")
        }
        var definition = this.createContextDefinition(contextSchema, namespace)
        var baseType = this.options.contextType || $data.EntityContext
        var typeName = `${namespace}.${contextSchema.name}`
        var type = baseType.extend(typeName, this.options.container, definition)
        return type
    }

    processMetadata(createdTypes) {
        var types = createdTypes || []
        this.metadata.dataServices.schema.forEach(schema => {
            var ns = schema.namespace
            if (schema.entityType) {
                let entityTypes = schema.entityType.map(et => this.createEntityType(et, ns))
                types.push(...entityTypes)
            }

            if (schema.entityContainer) {
                let contextType = this.createContextType(schema.entityContainer, ns)
                types.push(contextType)
            }
        })
        return types;
    }

    convertToSourceCode(done) {

    }
}

$data.Metadata = Metadata
