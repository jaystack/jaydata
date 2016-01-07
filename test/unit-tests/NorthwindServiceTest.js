import mock$data from '../core.js';
import $data from 'jaydata/core';
import oData from '../../src/Types/StorageProviders/oData'
import atob from 'atob'
import { expect } from 'chai';

describe('OData protocol tests', function () {
	this.timeout(30 * 1000)
    
    var ctx = null
    before((done) => {
        $data.initService("http://services.odata.org/V4/Northwind/Northwind.svc", {}, {
            success: (_ctx) => { 
                ctx = _ctx
                done()
            },
            error: (x) => {
                console.log(JSON.stringify(x))
                done()
            }
        })
    })
		
    describe('Online northwind context test', () => {
        it('Entity sets', () => {
            expect(ctx.Categories.elementType === $data.Container.resolveType('NorthwindModel.Category')).to.equal(true)
            var cat = new ctx.Categories.elementType()
            expect(cat instanceof $data.Container.resolveType('NorthwindModel.Category')).to.equal(true)
        })
        
        it('items count in entity set', (done) => {
            ctx.Categories.count((c) => {
                expect(typeof c).to.equal("number")
                done()    
            })
        })
        
        
        
        it('read from entity set', (done) => {
            ctx.Categories.take(5).toArray((r) => {
                expect(r.length > 0).to.equal(true)
                expect(r.length <= 5).to.equal(true)
                done()    
            })
        })
        
        it('cannonical url read', (done) => {
            ctx.Customers.getCustomers("ALFKI").getOrders(10643).read((r) => {
                expect(r instanceof $data.Container.resolveType('NorthwindModel.Order')).to.equal(true)
                done()
            })
        })
	})

})