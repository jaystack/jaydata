import mock$data from '../core.js';
import $data from 'jaydata/core';
import op from '../../src/Types/StorageProviders/oData'
import {Metadata} from '../../src/JaySvcUtil/Metadata'
import {expect} from 'chai'


describe("Metadata", function() {
    var md
    beforeEach(() => md = new Metadata({},{}))

    it("should produce Metadata instances", () => {
        expect(md).to.be.instanceof(Metadata)
    })
})

describe("Metadata.createProperty", function() {
    var md
    beforeEach(() => md = new Metadata({},{}))


    it("should create a property from a propSchema", () => {
        expect(md.createProperty({ name:"P1", type: "Edm.Int"}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int"}})
    })

    it("should handle nullable property field", () => {
        expect(md.createProperty({ name:"P1", type: "Edm.Int", nullable: "false"}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int", nullable: false, required: true}})
    })

    it("should handle maxLength property field", () => {
        expect(md.createProperty({ name:"P1", type: "Edm.Int", maxLength: "12"}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int", maxLength:12}})

        expect(md.createProperty({ name:"P1", type: "Edm.Int", maxLength: "max"}))
              .to.deep.equal({ name:"P1", definition: {type: "Edm.Int", maxLength:Number.MAX_VALUE}})
    })

    var entityType = {
            "name": "Category",
            "namespace": "NorthwindModel",
            "key": [
              {
                "propertyRef": [
                  {
                    "name": "CategoryID"
                  }
                ]
              }
            ],
            "property": [
              {
                "name": "CategoryID",
                "type": "Edm.Int32",
                "nullable": "false"
              },
              {
                "name": "CategoryName",
                "type": "Edm.String",
                "nullable": "false",
                "maxLength": "15"
              },
              {
                "name": "Description",
                "type": "Edm.String",
                "maxLength": "max"
              },
              {
                "name": "Picture",
                "type": "Edm.Binary",
                "maxLength": "max"
              }
            ],
            "navigationProperty": [
              {
                "name": "Products",
                "type": "Collection(NorthwindModel.Product)",
                "partner": "Category"
              }
            ]
    }

    it("should create a key property", () => {
        var p = md.createProperty(entityType, entityType.property[0])
        expect(p).to.have.deep.property("definition.key",true)
        var p2 = md.createProperty(entityType, entityType.property[1])
        expect(p2).to.not.have.deep.property("definition.key")
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
        var t = md.createEntityType(basicProps, "ns1")
        expect(t.baseTypes.some(bt => bt === $data.Entity)).to.be.true
    })
})

describe("Metadata.createContextDefinition", function() {
    var schema = require('../data/schema.json')
    it("should build a contextDefinitions", function() {
        var md = new Metadata({},schema)
        var types = []
        var def = md.createContextDefinition(schema.dataServices.schema[1].entityContainer, "test")
        expect(Object.keys(def)).to.deep.equal([ 'Categories',
                                                'CustomerDemographics',
                                                'Customers',
                                                'Employees',
                                                'Order_Details',
                                                'Orders',
                                                'Products',
                                                'Regions',
                                                'Shippers',
                                                'Suppliers',
                                                'Territories',
                                                'Alphabetical_list_of_products',
                                                'Category_Sales_for_1997',
                                                'Current_Product_Lists',
                                                'Customer_and_Suppliers_by_Cities',
                                                'Invoices',
                                                'Order_Details_Extendeds',
                                                'Order_Subtotals',
                                                'Orders_Qries',
                                                'Product_Sales_for_1997',
                                                'Products_Above_Average_Prices',
                                                'Products_by_Categories',
                                                'Sales_by_Categories',
                                                'Sales_Totals_by_Amounts',
                                                'Summary_of_Sales_by_Quarters',
                                                'Summary_of_Sales_by_Years' ])
    })
})


describe("Metadata.createContextType", function() {
    var schema = require('../data/schema.json')
    it("should build a contextType", function() {
        var md = new Metadata({},schema)
        var types = []
        var type = md.createContextType(schema.dataServices.schema[1].entityContainer, "test")
        expect(type.inheritsFrom).to.be.equal($data.EntityContext)
    })
})

describe("Metadata.processMetadata", function() {
    var schema = require('../data/schema.json')
    this.timeout(10000)
    it("should create a context type field all entity sets", function() {
        var md = new Metadata({},schema)
        var types = []
        md.processMetadata(types)
        expect(types).to.have.length(27)
    })

    it("should create a context type that can read data from nwind online", function(done) {
        var md = new Metadata({},schema)
        var types = []
        md.processMetadata(types)
        var CtxType = types.filter(t => t.inheritsFrom === $data.EntityContext)[0]
        var i = new CtxType("http://services.odata.org/V4/Northwind/Northwind.svc")
        i.Categories.toArray((data) => {
            expect(data[0]).to.be.instanceof(i.Categories.Category)
            done()
        })
    })
})

import metaReader from '../../src/JaySvcUtil/ODataJSReader.js'


describe("ODataJSReader.read", function() {
    this.timeout(10000)
    var nwurl = 'http://services.odata.org/V4/Northwind/Northwind.svc'
    it("should read some metadata", done => {
        var url = `${nwurl}/$metadata`
        metaReader.read({url}, (e, r) => {
          expect(e).to.be.empty
          expect(r).to.be.not.empty
          done()
        })
    })
})

describe("JaySvcUtil", function() {
    this.timeout(10000)
    var nwurl = 'http://services.odata.org/V4/Northwind/Northwind.svc'
    it.only("autoload metadata then provide entitycontext to read 2 category objects", done => {
        $data.service(nwurl, {}, (factory) => {
            expect(factory).to.be.function
            var ctx = factory()
            ctx.onReady(function() {
                ctx.Categories.take(2).toArray( array => {
                    expect(array).to.have.length(2)
                    expect(array[0]).to.be.instanceof(ctx.Categories.Category)
                    done()
                })
            })
        })
    })
})

