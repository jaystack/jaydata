var $data = require('../../dist/odata');
var NewsReader = require('./basetype.context');

NewsReader.factory({ useParameterAlias: true }).onReady(function(ctx){
    ctx.GenericArticles.include('CreatedBy').include('PublishedBy').toArray(function(r){
        console.log(r[0].initData);
    });
    /*var t1 = new ($data('Inheritance.InternalArticle'))({
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
    });*/
});