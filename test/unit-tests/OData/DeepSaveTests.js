import mock$data from '../../core.js';
import $data from 'jaydata/core';
import oData from '../../../src/Types/StorageProviders/oData'
import atob from 'atob'
import { expect } from 'chai';

var errorHandler = (done) => {
    return (err) => {
        console.log(err);
        expect(false).to.equal(true)
        done()
    }
}


describe('OData include', function() {
    this.timeout(10 * 1000)
    
    var ctx = null;
    before(function(done){
        $data.service('http://localhost:9000/odata', function(factory){
            ctx = factory({ 
                enableDeepSave: true,
                withReferenceMethods: true
            });
            ctx.onReady(function(){
                done();
            });
        });
	})
    
    beforeEach((done) => {
        ctx.Delete(() => done())
    })
    
    afterEach(() => {
        ctx.prepareRequest = () => {}
    })
    
    it('Full deep save', (done) => {
        var cat = new ctx.Categories.elementType({ Title: 'a_cat', Articles: [
            new ctx.Articles.elementType({ Title: 'a1', Lead: 'a1', Body: 'a1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a3' }) }),
            ] }),
            new ctx.Articles.elementType({ Title: 'b1', Lead: 'b1', Body: 'b1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b3' }) }),
            ]  }),
            new ctx.Articles.elementType({ Title: 'c1', Lead: 'c1', Body: 'c1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c3' }) }),
            ]  })
        ] })
        ctx.add(cat)
        
        ctx.prepareRequest = (r) => {
            if(r[0].method == 'POST'){
                expect(r).to.have.not.deep.property('[0].data.__batchRequests')
            }
        }
        
        ctx.saveChanges({
            success: (r) => {
                expect(r).to.equal(22);
                
                ctx.TagConnections.include('Tag').include('Article.Category').toArray({
                    success: (tcs) => {
                        //length
                        expect(tcs.length).to.equal(9);
                        
                        //category
                        var catId = tcs[0].Article.Category.Id;
                        tcs.forEach((tc) => 
                            expect(tc).to.have.deep.property('Article.Category.Id', catId))
                        
                        //tags
                        var ids = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Tag.Id')
                            
                            var duplicateTag = ids.indexOf(tc.Tag.Id) < 0
                            expect(duplicateTag).to.be.true
                            
                            ids.push(tc.Tag.Id);
                            
                            duplicateTag = ids.indexOf(tc.Tag.Id) < 0
                            expect(duplicateTag).to.be.false
                        })
                        expect(ids.length).to.equal(tcs.length);
                        
                        //articles
                        var artIds = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Article.Id')
                            artIds.indexOf(tc.Article.Id) < 0 && artIds.push(tc.Article.Id)
                        })
                        expect(artIds.length).to.equal(3);
                        
                        
                        //original data
                        expect(cat).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(cat).to.have.deep.property('Articles[0].Id').that.is.equal(0)
                        
                        done();
                    },
                    error: errorHandler(done)        
                })
            },
            error: errorHandler(done)
        })
    })
    
    it('Deepable entities', (done) => {
        var cat = new ctx.Categories.elementType({ Title: 'a_cat', Articles: [
            new ctx.Articles.elementType({ Title: 'a1', Lead: 'a1', Body: 'a1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a3' }) }),
            ] }),
            new ctx.Articles.elementType({ Title: 'c1', Lead: 'c1', Body: 'c1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c3' }) }),
            ]  })
        ] })
        
        var a1 = new ctx.Articles.elementType({ Title: 'b1', Lead: 'b1', Body: 'b1', Category: cat, Tags: [
            new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b1' }) }),
            new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b2' }) }),
            new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b3' }) }),
        ]  })
        
        
        ctx.add(cat)
        ctx.add(a1)
        
        ctx.prepareRequest = (r) => {
            if(r[0].method == 'POST'){
                expect(r).to.have.not.deep.property('[0].data.__batchRequests')
            }
        }
        
        ctx.saveChanges({
            success: (r) => {
                expect(r).to.equal(22);
                
                ctx.TagConnections.include('Tag').include('Article.Category').toArray({
                    success: (tcs) => {
                        //length
                        expect(tcs.length).to.equal(9);
                        
                        //category
                        var catId = tcs[0].Article.Category.Id;
                        tcs.forEach((tc) => 
                            expect(tc).to.have.deep.property('Article.Category.Id', catId))
                        
                        //tags
                        var ids = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Tag.Id')
                            
                            var duplicateTag = ids.indexOf(tc.Tag.Id) < 0
                            expect(duplicateTag).to.be.true
                            
                            ids.push(tc.Tag.Id);
                            
                            duplicateTag = ids.indexOf(tc.Tag.Id) < 0
                            expect(duplicateTag).to.be.false
                        })
                        expect(ids.length).to.equal(tcs.length);
                        
                        //articles
                        var artIds = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Article.Id')
                            artIds.indexOf(tc.Article.Id) < 0 && artIds.push(tc.Article.Id)
                        })
                        expect(artIds.length).to.equal(3);
                        
                        
                        //original data
                        expect(cat).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(cat).to.have.deep.property('Articles[0].Id').that.is.equal(0)
                        
                        expect(a1).to.have.property('Id').that.is.an('number').with.equal(0)
                        
                        
                        done();
                    },
                    error: errorHandler(done)        
                })
            },
            error: errorHandler(done)
        })
    })
    
    it('Multiple deep', (done) => {
        var cat = new ctx.Categories.elementType({ Title: 'a_cat', Articles: [
            new ctx.Articles.elementType({ Title: 'a1', Lead: 'a1', Body: 'a1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a3' }) }),
            ] }),
            new ctx.Articles.elementType({ Title: 'c1', Lead: 'c1', Body: 'c1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c3' }) }),
            ]  })
        ] })
        
        var a1 = new ctx.Articles.elementType({ Title: 'b1', Lead: 'b1', Body: 'b1', Category: cat, Tags: [
            new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b1' }) }),
            new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b2' }) }),
            new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'b3' }) }),
        ]  })
        
        
        ctx.add(cat)
        ctx.add(a1)
        
        
        var cat2 = new ctx.Categories.elementType({ Title: 'a_cat', Articles: [
            new ctx.Articles.elementType({ Title: 'a1', Lead: 'a1', Body: 'a1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'a3' }) }),
            ] }),
            new ctx.Articles.elementType({ Title: 'c1', Lead: 'c1', Body: 'c1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c1' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c2' }) }),
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'c3' }) }),
            ]  })
        ] })
        ctx.add(cat2)
        
        ctx.prepareRequest = (r) => {
            if(r[0].method == 'POST'){
                expect(r).to.have.deep.property('[0].data.__batchRequests')
                expect(r).to.have.deep.property('[0].data.__batchRequests.length', 1)
                expect(r).to.have.deep.property('[0].data.__batchRequests[0].__changeRequests.length', 2)
            }
        }
        
        ctx.saveChanges({
            success: (r) => {
                expect(r).to.equal(37);
                
                ctx.TagConnections.include('Tag').include('Article.Category').toArray({
                    success: (tcs) => {
                        //length
                        expect(tcs.length).to.equal(15);
                        
                        //category
                        var catIds = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Article.Category.Id')
                            catIds.indexOf(tc.Article.Category.Id) < 0 && catIds.push(tc.Article.Category.Id)
                        })
                        expect(catIds.length).to.equal(2);
                        
                        //tags
                        var ids = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Tag.Id')
                            
                            var duplicateTag = ids.indexOf(tc.Tag.Id) < 0
                            expect(duplicateTag).to.be.true
                            
                            ids.push(tc.Tag.Id);
                            
                            duplicateTag = ids.indexOf(tc.Tag.Id) < 0
                            expect(duplicateTag).to.be.false
                        })
                        expect(ids.length).to.equal(tcs.length);
                        
                        //articles
                        var artIds = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Article.Id')
                            artIds.indexOf(tc.Article.Id) < 0 && artIds.push(tc.Article.Id)
                        })
                        expect(artIds.length).to.equal(5);
                        
                        
                        //original data
                        expect(cat).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(cat).to.have.deep.property('Articles[0].Id').that.is.equal(0)
                        
                        expect(a1).to.have.property('Id').that.is.an('number').with.equal(0)
                        
                        expect(cat2).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(cat2).to.have.deep.property('Articles[0].Id').that.is.equal(0)
                        
                        done();
                    },
                    error: errorHandler(done)        
                })
            },
            error: errorHandler(done)
        })
    })
    
    it('Not deep saveable', (done) => {
                
        var tag1 = new ctx.Tags.elementType({ Title: 'a1' }); 
        var tag2 = new ctx.Tags.elementType({ Title: 'a2' }); 
        var tag3 = new ctx.Tags.elementType({ Title: 'a3' }); 
        
        var cat = new ctx.Categories.elementType({ Title: 'a_cat', Articles: [
            new ctx.Articles.elementType({ Title: 'a1', Lead: 'a1', Body: 'a1', Tags: [
                new ctx.TagConnections.elementType({ Tag: tag1 }),
                new ctx.TagConnections.elementType({ Tag: tag2 }),
                new ctx.TagConnections.elementType({ Tag: tag3 }),
            ] }),
            new ctx.Articles.elementType({ Title: 'b1', Lead: 'b1', Body: 'b1', Tags: [
                new ctx.TagConnections.elementType({ Tag: tag1 }),
                new ctx.TagConnections.elementType({ Tag: tag2 }),
                new ctx.TagConnections.elementType({ Tag: tag3 }),
            ]  }),
            new ctx.Articles.elementType({ Title: 'c1', Lead: 'c1', Body: 'c1', Tags: [
                new ctx.TagConnections.elementType({ Tag: tag1 }),
                new ctx.TagConnections.elementType({ Tag: tag2 }),
                new ctx.TagConnections.elementType({ Tag: tag3 }),
            ]  })
        ] })
        
        ctx.add(cat)
        
        ctx.prepareRequest = (r) => {
            if(r[0].method == 'POST'){
                expect(r).to.have.deep.property('[0].data.__batchRequests')
                expect(r).to.have.deep.property('[0].data.__batchRequests.length', 1)
                expect(r).to.have.deep.property('[0].data.__batchRequests[0].__changeRequests.length', 37)
            }
        }
        
        ctx.saveChanges({
            success: (r) => {
                expect(r).to.equal(16);
                
                ctx.TagConnections.include('Tag').include('Article.Category').toArray({
                    success: (tcs) => {
                        //length
                        expect(tcs.length).to.equal(9);
                        
                        //category
                        var catId = tcs[0].Article.Category.Id;
                        tcs.forEach((tc) => 
                            expect(tc).to.have.deep.property('Article.Category.Id', catId))
                        
                        //tags
                        var tagIds = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Tag.Id')
                            tagIds.indexOf(tc.Tag.Id) < 0 && tagIds.push(tc.Tag.Id)
                        })
                        expect(tagIds.length).to.equal(3);
                        
                        //articles
                        var artIds = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Article.Id')
                            artIds.indexOf(tc.Article.Id) < 0 && artIds.push(tc.Article.Id)
                        })
                        expect(artIds.length).to.equal(3);
                        
                        
                        //original data
                        expect(cat).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(cat).to.have.deep.property('Articles[0].Id').that.is.an('number').with.not.equal(0)
                        
                        expect(tag1).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(tag2).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(tag3).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        
                        done();
                    },
                    error: errorHandler(done)        
                })
            },
            error: errorHandler(done)
        })
    })
    
    it('Partial deep', (done) => {
    
        var tag1 = new ctx.Tags.elementType({ Title: 'a1' }); 
        
        var cat = new ctx.Categories.elementType({ Title: 'a_cat', Articles: [
            new ctx.Articles.elementType({ Title: 'a1', Lead: 'a1', Body: 'a1', Tags: [
                new ctx.TagConnections.elementType({ Tag: tag1 }),
            ] }),
            new ctx.Articles.elementType({ Title: 'b1', Lead: 'b1', Body: 'b1', Tags: [
                new ctx.TagConnections.elementType({ Tag: tag1 }),
            ]  }),
            new ctx.Articles.elementType({ Title: 'c1', Lead: 'c1', Body: 'c1', Tags: [
                new ctx.TagConnections.elementType({ Tag: new ctx.Tags.elementType({ Title: 'xxxxxx' }) }),
            ]  })
        ] })
        
        ctx.add(cat)
        
        ctx.prepareRequest = (r) => {
            if(r[0].method == 'POST'){
                expect(r).to.have.deep.property('[0].data.__batchRequests')
                expect(r).to.have.deep.property('[0].data.__batchRequests.length', 1)
                expect(r).to.have.deep.property('[0].data.__batchRequests[0].__changeRequests.length', 12)
            }
        }
        
        ctx.saveChanges({
            success: (r) => {
                expect(r).to.equal(9);
                
                ctx.TagConnections.include('Tag').include('Article.Category').toArray({
                    success: (tcs) => {
                        //length
                        expect(tcs.length).to.equal(3);
                        
                        //category
                        var catId = tcs[0].Article.Category.Id;
                        tcs.forEach((tc) => 
                            expect(tc).to.have.deep.property('Article.Category.Id', catId))
                        
                        //tags
                        var tagIds = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Tag.Id')
                            tagIds.indexOf(tc.Tag.Id) < 0 && tagIds.push(tc.Tag.Id)
                        })
                        expect(tagIds.length).to.equal(2);
                        
                        //articles
                        var artIds = []
                        tcs.forEach((tc) => {
                            expect(tc).to.have.deep.property('Article.Id')
                            artIds.indexOf(tc.Article.Id) < 0 && artIds.push(tc.Article.Id)
                        })
                        expect(artIds.length).to.equal(3);
                        
                        
                        //original data
                        expect(cat).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(cat).to.have.deep.property('Articles[2].Id').with.equal(0)
                        expect(cat).to.have.deep.property('Articles[0].Id').that.is.an('number').with.not.equal(0)
                        
                        expect(tag1).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        
                        done();
                    },
                    error: errorHandler(done)        
                })
            },
            error: errorHandler(done)
        })
    })
    
    it('Deep chained', (done) => {
    
        var cat = new ctx.Categories.elementType({ Title: 'a_cat' })
        var a1 = new ctx.Articles.elementType({ Title: 'a1', Lead: 'a1', Body: 'a1', Category: cat }) 
        var a2 = new ctx.Articles.elementType({ Title: 'b1', Lead: 'b1', Body: 'b1', Category: cat })
        
        ctx.add(a1)
        ctx.add(a2)
        
        ctx.prepareRequest = (r) => {
            if(r[0].method == 'POST'){
                expect(r).to.have.not.deep.property('[0].data.__batchRequests')
                expect(r).to.have.deep.property('[0].data.Category.Articles')
            }
        }
        
        ctx.saveChanges({
            success: (r) => {
                expect(r).to.equal(3);
                
                ctx.Categories.include("Articles").toArray({
                    success: (categories) => {
                        expect(categories.length).to.equal(1);
                        expect(categories).to.have.deep.property('[0].Articles.length', 2)
                        
                        //original data
                        expect(cat).to.have.property('Id').with.equal(0)
                        expect(a1).to.have.property('Id').that.is.an('number').with.not.equal(0)
                        expect(a2).to.have.property('Id').with.equal(0)
                        
                        
                        done();
                    },
                    error: errorHandler(done)        
                })
            },
            error: errorHandler(done)
        })
    })
    

    

    
    
    
})