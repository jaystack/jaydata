var $data = require('../../dist/odata');
var NewsReader = require('./basetype.context');

/*$data.Entity.extend('BaseType', {
    id: { type: 'int', key: true, computed: true },
    value: { type: 'string' }
});

$data('BaseType').extend('DerivedType1', {
    derivedValue1: { type: 'string' }
});

$data('BaseType').extend('DerivedType2', {
    derivedValue2: { type: 'string' }
});

$data.EntityContext.extend('InheritanceContext', {
    Types: { type: $data.EntitySet, elementType: $data('BaseType') }
});

$data.defaults.OData.disableBatch = true;
var ctx = new ($data('InheritanceContext'))({ name: 'oData', oDataServiceHost: 'almafa', maxDataServiceVersion: '4.0' });
ctx.onReady(function(ctx){
    var t1 = new ($data('DerivedType1'))({
        derivedValue1: 'test'
    });
    var t2 = new ($data('DerivedType2'))({
        derivedValue2: 'test'
    });
    ctx.Types.add(t1);
    ctx.Types.add(t2);
    //console.log(t, ctx.stateManager.trackedEntities);
    ctx.saveChanges();
});*/

NewsReader.factory({ useParameterAlias: true }).onReady(function(ctx){
    var t1 = new ($data('Inheritance.InternalArticle'))({
        InternalTitle: 'internal2',
        InternalBody: 'internal2',
        ValidTill: new Date('2016-12-31')
    });
    var t2 = new ($data('Inheritance.PublicArticle'))({
        Lead: 'lead',
        PublishDate: new Date()
    });
    ctx.GenericArticles.add(t1);
    ctx.GenericArticles.add(t2);
    ctx.saveChanges(function(c){
        console.log(c);
        ctx.GenericArticles.toArray(console.log.bind(console));
    });
});