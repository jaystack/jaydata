require('jaydata');
var serviceUrl = 'http://localhost:12345/eventtest'

require('../../JaySvcUtil/JaySvcUtil.js');
  
$data.MetadataLoader.debugMode = true;
$data.MetadataLoader.load(serviceUrl, function (factory, ctxType, text) {
    console.log(text);
    var context = factory();
    context.AAA.add(new $test.A({ Value: 'aaa' }));
    context.AAA.add(new $test.A({ Value: 'bbb' }));

    context.saveChanges(function(cnt){
        console.log('saved', cnt);
    });
});
