import $data from '../../src'
import {Metadata} from '../../src/JaySvcUtil/Metadata'
import {expect} from 'chai'

describe("Metadata", function() {
    var md
    beforeEach(() => md = new Metadata({},{}))
    it("should produce Metadata instances", () => {
        expect(md).to.be.instanceof(Metadata)
    })
    
    it("should create a property from a propSchema", () => {
        expect(md.createProperty({ name:"P1", type: "Edm.Int"}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int"}})
    })
    
    it("should handle nullable property field", () => {
        expect(md.createProperty({ name:"P1", type: "Edm.Int", nullable: false}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int", nullable: false, required: true}})
    })    
})