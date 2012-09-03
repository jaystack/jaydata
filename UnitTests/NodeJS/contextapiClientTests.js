require('jaydata');
var Q = require('q');

var serviceUrl = 'http://localhost:3001/newsreader.svc'

require('../../JayDataModules/qDeferred.js');
require('../../JaySvcUtil/JaySvcUtil.js');

exports.testService = function(test){
    test.expect(5);
    
    $data.MetadataLoader.debugMode = true;
    $data.MetadataLoader.load(serviceUrl, function (factory, ctxType, text) {
        console.log(text);
        var context = factory();
        
        var cat1 = new $news.Types.Category({ Title: 'World' });
        
        context.Categories.add(cat1);
        context.saveChanges(function(cnt){
            test.equal(cnt, 1, 'Category not created');
            test.ok(cat1.Id, 'Category ID missing');
            
            var art1 = new $news.Types.Article({
                Title: 'Article1',
                Lead: 'Article1 lead...',
                Body: 'Hello Article!',
                CreateDate: new Date(),
                Category: cat1.Id
            });
            context.Articles.add(art1);
            
            context.saveChanges(function(cnt){
                test.equal(cnt, 1, 'Article not created');
                test.ok(art1.Id, 'Article ID missing');
                
                context.Categories.attach(cat1);
                cat1.Articles = [art1.Id];
                
                context.Articles.attach(art1);
                art1.Tags = ['hello', 'fubar'];
                
                context.saveChanges(function(cnt){
                    test.equal(cnt, 2, 'Category and Article not updated');
                    test.done();
                });
            })
        })
    });
};
