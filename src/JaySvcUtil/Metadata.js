import $data, { $C, Guard, Container, Exception } from '../TypeSystem/index.js';

var containsField = (obj, field, cb) => {
    // if (field in (obj || {})) {
    //     cb(obj[field])
    // }
    if (obj && field in obj && typeof obj[field] !== "undefined") {
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

var _collectionRegex = /^Collection\((.*)\)$/

export class Metadata {

    constructor(options, metadata) {
        this.options = options || {}
        this.metadata = metadata
        this.options.container = Container //this.options.container || $data.createContainer()
    }

    _getMaxValue(maxValue) {
        if ("number" === typeof maxValue) return maxValue
        if ("max" === maxValue) return Number.MAX_VALUE
        return parseInt(maxValue)
    }
    
    
    createTypeDefinition(propertySchema, definition){
        containsField(propertySchema, "type", v => {
            var match = _collectionRegex.exec(v)
            if(match){
                definition.type = this.options.collectionBaseType || 'Array'
                definition.elementType = match[1]
            } else {
                definition.type = v
            }
        })
    }
    
    createReturnTypeDefinition(propertySchema, definition){
        containsField(propertySchema, "type", v => {
            var match = _collectionRegex.exec(v)
            if(match){
                definition.returnType = $data.Queryable
                definition.elementType = match[1]
            } else {
                definition.returnType = v
            }
        })
    }
    

    createProperty(entitySchema, propertySchema) {
        if (!propertySchema) {
            propertySchema = entitySchema
            entitySchema = undefined
        }

        var definition = {}
        
        this.createTypeDefinition(propertySchema, definition)

        containsField(propertySchema, "nullable", v => {
            definition.nullable = parsebool(v, true),
            definition.required = parsebool(v, true) === false
        })

        containsField(propertySchema, "maxLength", v => {
            definition.maxLength = this._getMaxValue(v)
        })

        containsField(entitySchema, "key", keys => {
            if (keys.propertyRefs.some(pr => pr.name === propertySchema.name)) {
                definition.key = true
            }
        })
        
        containsField(propertySchema, "concurrencyMode", v => {
            definition.concurrencyMode = $data.ConcurrencyMode[v]
        })
        
        return {
            name: propertySchema.name,
            definition
        }
    }
    
    createNavigationProperty(entitySchema, propertySchema) {
        if (!propertySchema) {
            propertySchema = entitySchema
            entitySchema = undefined
        }

        var definition = {}
        
        this.createTypeDefinition(propertySchema, definition)

        containsField(propertySchema, "nullable", v => {
            definition.nullable = parsebool(v, true),
            definition.required = parsebool(v, true) === false
        })

        containsField(propertySchema, "partner", p => {
            definition.inverseProperty = p
        })
        
        if(!definition.inverseProperty) {
            definition.inverseProperty = '$$unbound'
        }

        return {
            name: propertySchema.name,
            definition
        }
    }

    createEntityDefinition(entitySchema) {
        var props = (entitySchema.properties || []).map(this.createProperty.bind(this, entitySchema))
        var navigationProps = (entitySchema.navigationProperties || []).map(this.createNavigationProperty.bind(this, entitySchema))
        props = props.concat(navigationProps)
        var result = props.reduce( (p, c) => {
            p[c.name] = c.definition
            return p
         }, {})
        return result
    }

    createEntityType(entitySchema, namespace) {
        let baseType = (entitySchema.baseType ? entitySchema.baseType : this.options.baseType) || $data.Entity
        let definition = this.createEntityDefinition(entitySchema)
        let entityFullName = `${namespace}.${entitySchema.name}`
        
        let staticDefinition = {}
        
        containsField(entitySchema, "openType", v => {
            if(parsebool(v, false)){
                staticDefinition.openType = { value: true }
            }
        })
        
        return {
            namespace,
            typeName: entityFullName,
            baseType,
            params: [entityFullName, this.options.container, definition, staticDefinition],
            definition,
            type: 'entity'
        }
    }
    
    
    
    createEnumOption(entitySchema, propertySchema, i) {
        if (!propertySchema) {
            propertySchema = entitySchema
            entitySchema = undefined
        }

        var definition = {
            name: propertySchema.name,
            index: i
        }

        containsField(entitySchema, "value", value => {
            var v = +value
            if (!isNaN(v)) {
                definition.value = v
            }
        })

        return definition
    }
    
    createEnumDefinition(enumSchema) {
        var props = (enumSchema.members || []).map(this.createEnumOption.bind(this, enumSchema))
        return props
    }
    
    createEnumType(enumSchema, namespace) {
        let definition = this.createEnumDefinition(enumSchema)
        let enumFullName = `${namespace}.${enumSchema.name}`
        
        return {
            namespace,
            typeName: enumFullName,
            baseType: $data.Enum,
            params: [enumFullName, this.options.container, enumSchema.underlyingType, definition],
            definition,
            type: 'enum'
        }
    }


    createEntitySetProperty(entitySetSchema, contextSchema) {
        //var c = this.options.container
        var t = entitySetSchema.entityType //c.classTypes[c.classNames[entitySetSchema.entityType]] // || entitySetSchema.entityType
        var prop = {
            name: entitySetSchema.name,
            definition: {
                type: this.options.entitySetType || $data.EntitySet,
                elementType: t
            }
        }
        return prop
    }

    indexBy(fieldName, pick) {
        return [(p, c) => { p[c[fieldName]] = c[pick];  return p }, {}]
    }

    createContextDefinition(contextSchema, namespace) {
        var props = (contextSchema.entitySets || []).map( es => this.createEntitySetProperty(es, contextSchema))

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
        var contextImportMethods = []
        contextSchema.actionImports && contextImportMethods.push(...contextSchema.actionImports)
        contextSchema.functionImports && contextImportMethods.push(...contextSchema.functionImports)

        return {
            namespace,
            typeName,
            baseType,
            params: [typeName, this.options.container, definition],
            definition,
            type: 'context',
            contextImportMethods
        }
    }
    
    
    createMethodParameter(parameter, definition) {
        var paramDef = {
            name: parameter.name
        }
        
        this.createTypeDefinition(parameter, paramDef)
        
        definition.params.push(paramDef)
    }
    
    applyBoundMethod(actionInfo, ns, typeDefinitions, type) {
        let definition = {
            type,
            namespace: ns,
            returnType: null,
            params: []
        }
        
        containsField(actionInfo, "returnType", value => {
            this.createReturnTypeDefinition(value, definition)
        })
    
        let parameters = [].concat(actionInfo.parameters)
        parameters.forEach((p) => this.createMethodParameter(p, definition))
        
        if(parsebool(actionInfo.isBound, false)) {
            let bindingParameter = definition.params.shift()
            
            if(bindingParameter.type === (this.options.collectionBaseType || 'Array')){
                let filteredContextDefinitions = typeDefinitions.filter((d) => d.namespace === ns && d.type === 'context')
                filteredContextDefinitions.forEach(ctx => {
                    for(var setName in ctx.definition) {
                        let set = ctx.definition[setName]
                        if(set.elementType === bindingParameter.elementType) {
                            set.actions = set.actions = {}
                            set.actions[actionInfo.name] = definition
                        }
                    }
                })
            } else {
                let filteredTypeDefinitions = typeDefinitions.filter((d) => d.typeName === bindingParameter.type && d.type === 'entity')
                filteredTypeDefinitions.forEach(t => {
                    t.definition[actionInfo.name] = definition
                })
            }
        } else {
            delete definition.namespace
            
            let methodFullName = ns + '.' + actionInfo.name
            let filteredContextDefinitions = typeDefinitions.filter((d) => d.type === 'context')
            filteredContextDefinitions.forEach((ctx) => {
                ctx.contextImportMethods.forEach(methodImportInfo => {
                    if(methodImportInfo.action === methodFullName || methodImportInfo.function === methodFullName){
                        ctx.definition[actionInfo.name] = definition
                    }
                })
            })
            
        }
    }

    processMetadata(createdTypes) {
        var types = createdTypes || []
        var typeDefinitions = []
        var serviceMethods = []
        
        this.metadata.dataServices.schemas.forEach(schema => {
            var ns = schema.namespace
            
            if (schema.enumTypes) {
                let enumTypes = schema.enumTypes.map(ct => this.createEnumType(ct, ns))
                typeDefinitions.push(...enumTypes)
            }
            
            if (schema.complexTypes) {
                let complexTypes = schema.complexTypes.map(ct => this.createEntityType(ct, ns))
                typeDefinitions.push(...complexTypes)
            }
            
            if (schema.entityTypes) {
                let entityTypes = schema.entityTypes.map(et => this.createEntityType(et, ns))
                typeDefinitions.push(...entityTypes)
            }
            
            if(schema.actions){
                serviceMethods.push(...schema.actions.map(m => defs => this.applyBoundMethod(m, ns, defs, $data.ServiceAction)))
            }
            
            if(schema.functions){
                serviceMethods.push(...schema.functions.map(m => defs => this.applyBoundMethod(m, ns, defs, $data.ServiceFunction)))
            }

            if (schema.entityContainer) {
                let contexts = schema.entityContainer.map(ctx => this.createContextType(ctx, ns))
                typeDefinitions.push(...contexts)
            }
        })
        
        serviceMethods.forEach(m => m(typeDefinitions))
        
        types.push(...typeDefinitions.map((d) => {
            
            if(this.options.debug) {
                console.log('---------------')
                console.log('    ' + d.params[0] + " : " + this.options.container.resolveName(d.baseType))
                d.params[2] && Object.keys(d.params[2]).forEach(function(dp){ console.log(dp + ": " + JSON.stringify(d.params[2][dp])) })
                d.params[3] && Object.keys(d.params[3]).forEach(function(dp){ console.log(dp + ": " + JSON.stringify(d.params[3][dp])) })
            }
            
            var baseType = this.options.container.resolveType(d.baseType)
            return baseType.extend.apply(baseType, d.params)
        }))
        
        return types;
    }

    convertToSourceCode(done) {

    }
}

$data.Metadata = Metadata
