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

var identity = (b) => b


function getConverter(t) {
    switch(true) {
        case t === String: return identity
        case t === Boolean: return parsebool
        default: return identity
    }
}

function map(items, fun, ...args) {
    return (items || []).map(fun.bind(...args))
}

function mapAt(items, index, fun, ...args) {
    return map([(items || [])[index]], fun, ...args)    
}

function pipe(...fns) {
    var fn, v
    while(fn = fns.shift()) {
        v = fn(v)
    }
}

let required = msg => val => {
    if (val == null) {
        throw new Error("missing " + msg)
    }
}

export class SchemaObjectBase {
    constructor(definition, parent) {
        this._parent = parent
        this._definition  = definition
        this._applyDefinition(definition)
        console.log("ctor", Object.getPrototypeOf(this).constructor.name, definition)
    }
}

export class EntityProperty extends SchemaObjectBase {
    
    constructor(definition, parent) {
        let d =  definition
        super(d, parent)
        if (d) {
            pipe(() => d.name, v => this._name = v, required("name"))
            pipe(() => d.type, v => this._type = v, required("type"))
            
            required( () => d.name, v => this._name = v  )
            required( () => d.type, v => this._type = v  )
        })
        
    }
    
    
    static create(parent, definition) {
        return new EntityProperty(definition, parent)
    }
    
    get name() {
        return this._name
    }
    
    set name(v) {
        this._name = v
    }
    
    
}



// export class EntityType extends SchemaObjectBase {
//     constructor(schema, definition) {
//         super(schema, definition)
//         var d = definition || {}
//         this.name = d.name
//         this.baseType = d.baseType
//         //odata4-js incorrectly implements key as array
//         //specs say:
//         //An edm.Key child element MAY be specified if the entity type does not specify a base type that already has a key declared.
//         this.key = mapAt(d.key, 0, EntityKey.create, this)[0]
//         this.properties = map(d.property, EntityProperty.create, this)
//     }
    
//     get properties() {
//         return this._properties
//     }
    
//     set properties(v) {
//         this._properties = v
//     }
// }


// export class PropertyRef extends SchemaObjectBase {
//     constructor(parent, definition) {
//         super(parent, definition)
//         this.name = this._definition.name
//         this.alias = this._definition.alias
//     }
    
//     _processFacets() {

//     }
   
//     static create(entityKey, definition) {
//         return new PropertyRef(entityKey, definition)
//     }
// }


// export class EntityKey extends SchemaObjectBase {
//     constructor(entity, definition) {
//         super(entity, definition)
//         let d = definition || {}
//         this.propertyRefs = map(d.propertyRef, PropertyRef.create, null, this)
//     }
    
//     static create(entity, definition) {
//         return new EntityKey(entity, definition)
//     }
// }





export class MetadataVisitor {
    visit() {
        
    }
    
    
}