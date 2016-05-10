import mock$data from '../../core.js';
import $data from 'jaydata/core';
import oData from '../../../src/Types/StorageProviders/oData'
import atob from 'atob'
import { expect } from 'chai';


describe('OData include', () => {
    
    var ctx = null;
    before(function(done){
        $data.initService('http://localhost:9000/odata', function(_ctx){
            ctx = _ctx;
			done()
        });
	})
    
    describe('url: single', () => {
        var result = '/Articles?$expand=Category'
        
        it('string property', ()=>{
            let q = ctx.Articles.include('Category')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Articles.include('it.Category')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Articles.include(a => a.Category)
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Articles.include('a => a.Category')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Articles.include(function(a){ return a.Category })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: single.many', () => {
        var result = '/Articles?$expand=Category($expand=Articles)'
        
        it('string property', ()=>{
            let q = ctx.Articles.include('Category.Articles')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Articles.include('it.Category.Articles')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Articles.include(a => a.Category.Articles)
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Articles.include('a => a.Category.Articles')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Articles.include(function(a){ return a.Category.Articles })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: many', () => {
        var result = '/Categories?$expand=Articles'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(a => a.Articles)
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('a => a.Articles')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(a){ return a.Articles })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: deep, many.single', () => {
        var result = '/Categories?$expand=Articles($expand=Reviewer)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.Reviewer')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.Reviewer')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(a => a.Articles.Reviewer)
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('a => a.Articles.Reviewer')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(a){ return a.Articles.Reviewer })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: deep, many.many', () => {
        var result = '/Categories?$expand=Articles($expand=Tags)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.Tags')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.Tags')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(a => a.Articles.Tags)
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('a => a.Articles.Tags')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(a){ return a.Articles.Tags })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: deep, many.many.single', () => {
        var result = '/Categories?$expand=Articles($expand=Tags($expand=Tag))'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.Tags.Tag')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.Tags.Tag')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(a => a.Articles.Tags.Tag)
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('a => a.Articles.Tags.Tag')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(a){ return a.Articles.Tags.Tag })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested filter', () => {
        var result = '/Categories?$expand=Articles($filter=(Id gt 2))'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.filter(a => a.Id > 2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.filter(a => a.Id > 2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.filter(a => a.Id > 2))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.filter(a => a.Id > 2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.filter(a => a.Id > 2) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.filter(q)', { q: ctx.Articles.filter(a => a.Id > 2) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested select', () => {
        var result = '/Categories?$expand=Articles($select=Title,Body,Lead)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}})')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}})')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}})')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.map(q)', { q: ctx.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested order by ascending', () => {
        var result = '/Categories?$expand=Articles($orderby=Title)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.orderBy(a => a.Title)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.orderBy(a => a.Title)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.orderBy(a => a.Title))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.orderBy(a => a.Title)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.orderBy(a => a.Title) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.orderBy(q)', { q: ctx.Articles.orderBy(a => a.Title) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested order by descending', () => {
        var result = '/Categories?$expand=Articles($orderby=Title desc)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.orderByDescending(a => a.Title)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.orderByDescending(a => a.Title)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.orderByDescending(a => a.Title))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.orderByDescending(a => a.Title)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.orderByDescending(a => a.Title) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.orderByDescending(q)', { q: ctx.Articles.orderByDescending(a => a.Title) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested inline count', () => {
        var result = '/Categories?$expand=Articles($count=true)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.withInlineCount()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.withInlineCount()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.withInlineCount())
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.withInlineCount()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.withInlineCount() })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.withInlineCount()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested inline take', () => {
        var result = '/Categories?$expand=Articles($top=1)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.take(1)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.take(1)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.take(1))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.take(1)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.take(1) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.take(1)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested inline skip', () => {
        var result = '/Categories?$expand=Articles($skip=2)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.skip(2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.skip(2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.skip(2))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.skip(2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.skip(2) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.skip(2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested filter chain', () => {
        var result = '/Categories?$expand=Articles($filter=(Id gt 2)),Articles($filter=(Id gt 3))'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.filter(a => a.Id > 2).filter(a => a.Id > 3)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.filter(a => a.Id > 2).filter(a => a.Id > 3)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.filter(a => a.Id > 2).filter(a => a.Id > 3))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.filter(a => a.Id > 2).filter(a => a.Id > 3)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.filter(a => a.Id > 2).filter(a => a.Id > 3) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    
    
    describe('url: nested filter parameters', () => {
        var result = '/Categories?$expand=Articles($filter=(Id gt 2)),Articles($filter=(Id gt 3))'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.filter(a => a.Id > p1).filter(a => a.Id > p2)', { p1: 2, p2: 3})
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.filter(a => a.Id > p1).filter(a => a.Id > p2)', { p1: 2, p2: 3})
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.filter(a => a.Id > p1).filter(a => a.Id > p2), { p1: 2, p2: 3})
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.filter(a => a.Id > p1).filter(a => a.Id > p2)', { p1: 2, p2: 3})
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.filter(a => a.Id > p1).filter(a => a.Id > p2) }, { p1: 2, p2: 3})
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })   
    
    describe('url: nested filter modelbinder config', () => {
        var result = '/Categories?$expand=Articles($filter=(Id gt 2))'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.filter(a => a.Id > 2)')
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal(ctx.Categories.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.filter(a => a.Id > 2)')
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal(ctx.Categories.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.filter(a => a.Id > 2))
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal(ctx.Categories.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.filter(a => a.Id > 2)')
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal(ctx.Categories.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.filter(a => a.Id > 2) })
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal(ctx.Categories.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.filter(q)', { q: ctx.Articles.filter(a => a.Id > 2) })
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal(ctx.Categories.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested select modelbinder config', () => {
        var result = '/Categories?$expand=Articles($expand=Tags),Articles($select=Title,Body,Lead,Tags)'
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead, tags: a.Tags }})')
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$item.tags.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.tags.$item.$type).to.equal(ctx.TagConnections.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead, tags: a.Tags }})')
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$item.tags.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.tags.$item.$type).to.equal(ctx.TagConnections.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead, tags: a.Tags }}))
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$item.tags.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.tags.$item.$type).to.equal(ctx.TagConnections.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead, tags: a.Tags }})')
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$item.tags.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.tags.$item.$type).to.equal(ctx.TagConnections.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c) { return c.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead, tags: a.Tags }}) })
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$item.tags.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.tags.$item.$type).to.equal(ctx.TagConnections.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.include('Articles.map(q)', { q: ctx.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead, tags: a.Tags }}) })
            let mConfig = q.toTraceString().modelBinderConfig
            expect(mConfig.$type).to.equal($data.Array);
            expect(mConfig.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.$type).to.equal($data.Object);
            expect(mConfig.$item.Articles.$item.tags.$type).to.equal($data.Array);
            expect(mConfig.$item.Articles.$item.tags.$item.$type).to.equal(ctx.TagConnections.elementType);
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested operators', () => {
        var result = "/Categories?$expand=Articles($filter=(Id gt 2)),Articles($filter=(Id gt 3)),Articles($select=Title,Body,Lead),Articles($orderby=Title),Articles($orderby=Body desc),Articles($count=true),Articles($top=1),Articles($skip=2)"
        
        it('string property', ()=>{
            let q = ctx.Categories.include('Articles.filter(a => a.Id > 2).filter(a => a.Id > 3).map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}).orderBy(a => a.Title).orderByDescending(a => a.Body).withInlineCount().take(1).skip(2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.include('it.Articles.filter(a => a.Id > 2).filter(a => a.Id > 3).map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}).orderBy(a => a.Title).orderByDescending(a => a.Body).withInlineCount().take(1).skip(2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.include(c => c.Articles.filter(a => a.Id > 2).filter(a => a.Id > 3).map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}).orderBy(a => a.Title).orderByDescending(a => a.Body).withInlineCount().take(1).skip(2))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.include('c => c.Articles.filter(a => a.Id > 2).filter(a => a.Id > 3).map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}).orderBy(a => a.Title).orderByDescending(a => a.Body).withInlineCount().take(1).skip(2)')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.include(function(c){ return c.Articles.filter(a => a.Id > 2).filter(a => a.Id > 3).map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}).orderBy(a => a.Title).orderByDescending(a => a.Body).withInlineCount().take(1).skip(2) })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories
                .include('Articles.filter(f1).filter(f2).map(m).orderBy(oBy).orderByDescending(oByDescending).withInlineCount().take(take).skip(skip)', {
                    f1: ctx.Articles.filter(a => a.Id > 2),
                    f2: ctx.Articles.filter(a => a.Id > 3),
                    m: ctx.Articles.map(a => { return {Title: a.Title, Body: a.Body, Lead: a.Lead}}),
                    oBy: ctx.Articles.orderBy(a => a.Title),
                    oByDescending: ctx.Articles.orderByDescending(a => a.Body),
                    take: 1,
                    skip: 2
                })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('nested paramter resolution', () => {
        var result = "/Categories?$expand=Articles($filter=(Id gt 2)),Articles($filter=(Id gt 3))"
        
        it('missing both parameter', ()=>{
            var oldValue = $data.defaults.parameterResolutionCompatibility;
            $data.defaults.parameterResolutionCompatibility = false;
            
            var hasException = false;
            try{
                var q = ctx.Categories.include('c => c.Articles.filter(a => a.Id > p2).filter(a => a.Id > p3)', {p1: 1, p2: 2, p3: 3}).toTraceString()
            } catch(ex) {
                hasException = true;
            }
            
            expect(hasException).to.be.true;
            
            $data.defaults.parameterResolutionCompatibility = oldValue;
        })
        
        it('missing a parameter', ()=>{
            var oldValue = $data.defaults.parameterResolutionCompatibility;
            $data.defaults.parameterResolutionCompatibility = false;
            
            var hasException = false;
            try{
                ctx.Categories.include('(c, p3) => c.Articles.filter(a => a.Id > p2).filter(a => a.Id > p3)', {p1: 1, p2: 2, p3: 3}).toTraceString()
            } catch(ex) {
                hasException = true;
            }
            
            expect(hasException).to.be.true;
            
            $data.defaults.parameterResolutionCompatibility = oldValue;
        })
        
        it('parameter resolution', ()=>{
            var oldValue = $data.defaults.parameterResolutionCompatibility;
            $data.defaults.parameterResolutionCompatibility = false;
            
            let q = ctx.Categories.include('(c, p2, p3) => c.Articles.filter(a => a.Id > p2).filter(a => a.Id > p3)', {p1: 1, p2: 2, p3: 3})
            expect(q.toTraceString().queryText).to.equal(result);
            
            
            $data.defaults.parameterResolutionCompatibility = oldValue;
        })
    })
    
    
    
    describe('url: nested empty some', () => {
        var result = '/Categories?$filter=Articles/any()'
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.filter('it.Articles.some()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.filter(c => c.Articles.some())
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.filter('c => c.Articles.some()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.filter(function(c) { return c.Articles.some() })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.filter('it.Articles.some()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested some', () => {
        var result = "/Categories?$filter=Articles/any(a: (a/Title eq 'Article'))"
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.filter('it.Articles.some(a => a.Title == "Article")')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.filter(c => c.Articles.some(a => a.Title == "Article"))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.filter('c => c.Articles.some(a => a.Title == "Article")')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.filter(function(c) { return c.Articles.some(a => a.Title == "Article") })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.filter('it.Articles.some(this.query)', { query: ctx.Articles.filter(a => a.Title == "Article") })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested empty every', () => {
        var result = '/Categories?$filter=Articles/all()'
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.filter('it.Articles.every()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.filter(c => c.Articles.every())
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.filter('c => c.Articles.every()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.filter(function(c) { return c.Articles.every() })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.filter('it.Articles.every()')
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
    
    describe('url: nested every', () => {
        var result = "/Categories?$filter=Articles/all(a: (a/Title eq 'Article'))"
        
        it('string property with it prefix', ()=>{
            let q = ctx.Categories.filter('it.Articles.every(a => a.Title == "Article")')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('arrow function', ()=>{
            let q = ctx.Categories.filter(c => c.Articles.every(a => a.Title == "Article"))
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('string arrow function', ()=>{
            let q = ctx.Categories.filter('c => c.Articles.every(a => a.Title == "Article")')
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('function', ()=>{
            let q = ctx.Categories.filter(function(c) { return c.Articles.every(a => a.Title == "Article") })
            expect(q.toTraceString().queryText).to.equal(result);
        })
        
        it('queryable', ()=>{
            let q = ctx.Categories.filter('it.Articles.every(this.query)', { query: ctx.Articles.filter(a => a.Title == "Article") })
            expect(q.toTraceString().queryText).to.equal(result);
        })
    })
})