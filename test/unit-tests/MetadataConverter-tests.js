import $data from '../../src'
import {Metadata} from '../../src/JaySvcUtil/Metadata'
import {expect} from 'chai'

describe("Metadata", function() {
    var md
    beforeEach(() => md = new Metadata({},{}))
    
    it("should produce Metadata instances", () => {
        expect(md).to.be.instanceof(Metadata)
    })
})

describe("Metadata.properties", function() {
    var md
    beforeEach(() => md = new Metadata({},{}))
    
    
    it("should create a property from a propSchema", () => {
        expect(md.createProperty({ name:"P1", type: "Edm.Int"}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int"}})
    })
    
    it("should handle nullable property field", () => {
        expect(md.createProperty({ name:"P1", type: "Edm.Int", nullable: false}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int", nullable: false, required: true}})
    })    

    it("should handle maxLength property field", () => {
        expect(md.createProperty({ name:"P1", type: "Edm.Int", maxLength: "12"}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int", maxLength:12}})
              
        expect(md.createProperty({ name:"P1", type: "Edm.Int", maxLength: "max"}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int", maxLength:Number.MAX_VALUE}})
    })    

})

describe("Metadata.createEntityType", function() {
    var basicProps = {
            name:"E1",
            property: [
                {
                    name:"p1",
                    type: "string"
                },
                {
                    name:"p2",
                    type:"string"
                }
            ]
     }

    it("should return an entity definition with matching props", function() {
        let md = new Metadata({}, {})
        var ed = md.createEntityDefinition(basicProps)
        expect(ed).to.deep.equal({
            'p1': { type:'string'},
            'p2': { type:'string'}
        })
    })

    it("should return an entity subclass", function() {
        var md = new Metadata({},{})
        var c = $data.createContainer()
        var t = md.createEntityType(c, basicProps, "ns1")
        expect(t.baseTypes.some(bt => bt === $data.Entity)).to.be.true
    })
})

describe("Metadata.createContextType", function() {
    var schema = require('../data/schema.json')
    it("should create a context type field all entity sets", function() {
        var md = new Metadata({},schema)
        md.createContextType()
    })
})