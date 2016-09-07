var $data = require('../../dist/odata');
var NewsReader = require('./basetype.context');

NewsReader.factory({ useParameterAlias: true }).onReady(function(ctx){
    ctx.GenericArticles.include('CreatedBy').include('PublishedBy').include('PublishedBy.CreatedArticles').toArray({
        success: function(r){
            console.log(r.map(function(it){
                it.initData["@odata.type"] = it.getType().fullName;
                if (it.CreatedBy){
                    it.initData.CreatedBy.initData["@odata.type"] = it.initData.CreatedBy.getType().fullName;
                    it.initData.CreatedBy = it.initData.CreatedBy.initData;
                }
                if (it.PublishedBy){
                    it.initData.PublishedBy.initData["@odata.type"] = it.initData.PublishedBy.getType().fullName;
                    it.initData.PublishedBy = it.initData.PublishedBy.initData;
                }
                if (it.PublishedBy && it.PublishedBy.CreatedArticles.length > 0) it.initData.CreatedArticles = it.PublishedBy.CreatedArticles[0];
                return it.initData;
            }));
        },
        error: function(err){
            console.log(err);
            console.log('*********************', err.data[0].request);
        }
    });
    var t1 = new ($data('Inheritance.InternalArticle'))({
        Id: Math.floor(Math.random() * 1000) + 1000,
        InternalTitle: 'internal2',
        InternalBody: 'internal2',
        ValidTill: new Date('2016-12-31')
    });
    var t2 = new ($data('Inheritance.PublicArticle'))({
        Id: Math.floor(Math.random() * 1000) + 1000,
        Lead: 'lead',
        PublishDate: new Date()
    });
    ctx.GenericArticles.add(t1);
    ctx.GenericArticles.add(t2);
    ctx.saveChanges({
        success: function(c){
            console.log(c);
            ctx.GenericArticles.toArray(console.log.bind(console));
        },
        error: function(err){
            console.log(err);
            console.log('*********************', err.data[0].request);
        }
    });
});