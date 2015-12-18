import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

Array.prototype.applyToAll = function(thisArg, args) {
    this.forEach(i => {
        i.apply(thisArg, args)
    })
}

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

export class EntityProperty {
    constructor(entity, definition) {
        this.definition = definition;
        this.entity = entity
        this.builders = []
        for (var key in this.definition) {
            var builder = EntityProperty.processors[key].call(this, this.definition[key])
            if (builder) {
                this.builders.push(builder)
            }
        }
    }

    createPropDef() {
        var pd = {}
        return (this.entity &&
               this.entity.createPropDef &&
               this.entity.createPropDef(this, pd)) || pd
    }

    buildType(container, typeDef) {
        var prop = this.createPropDef()
        this.builders.forEach( b=> {
            b.call(this, container, prop)
        })
        typeDef[this.name] = prop
    }

    static create(entity, definition) {
        return new EntityProperty(entity, definition)
    }
}



export class EntityType {
    constructor(schema, definition) {
        this.schema = schema
        this.definition = definition
        this.properties = this.definition.property.map(EntityProperty.create.bind(this))
    }

    buildType() {
        var typeDef = {}
        this.properties.forEach(pr => {
            pr.buildType()
        })
    }

    get name() {
        return [this.schema.namespace, this.definition.name].filter(i => i).join(".")
    }
}




// EntityType.processors = {
//     name: function(name) {
//         this.name = name
//         this.properties = []
//     },

//     key: function(keyProps) {
//         this.createPropDef = function(property, def) {
//             if (keyProps.some(kp => kp.propertyDef &&
//                                    kp.propertyDef.some(pd => pd.name === property.name))) {
//                 def.key = true
//             }
//         }
//     },

//     property: function(propertyArray) {
//         propertyArray.forEach(p => {
//             var ep = new EntityProperty(this, p)
//             this.properties.push(ep)
//             this.builders.push(function(container, typeDef) {
//                 ep.buildType(container, typeDef)
//             })
//         })
//     }
// }



// export class Schema {
//     constructor(metadata, schemaDefinition) {
//         this.metadata = metadata
//         this.definition = schemaDefinition
//         this.typeCreators = []
//     }

//     buildUp() {
//         for(var key in this.definition) {
//             Schema.processors[key].call(this, this.definition[key])
//         }
//     }


//     createTypes(container) {

//     }
// }

// Schema.processors = {

//     "namespace" : function processNamespace(value) {

//     },

//     "entityType": function(entityTypeArray) {
//         entityTypeArray.forEach(etd => {
//             var et = new EntityType(this, etd)
//             this.typeCreators.push(et.createType.bind(et))
//         })
//     }
// }



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
