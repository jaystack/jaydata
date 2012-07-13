var $data = require('jaydata');
window.XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

$.support.cors = true;
$.ajaxSettings.xhr = function(){
    return new XMLHttpRequest;
};

require('../project/jaydata/Types/Access.js');
require('../project/jaydata/Types/ServiceOperation.js');
require('../project/jaydata/Types/StorageProviders/mongoDB/mongoDBStorageProvider.js');
require('../project/jaydata/Types/StorageProviders/Storm/StormStorageProvider.js');
require('../project/jaydata/Types/Query.js');
require('../project/jaydata/Types/Queryable.js');
require('../project/jaydata/Types/EntitySet.js');
require('../project/jaydata/Types/EntityContext.js');
require('../project/jaydata_borzav/Types/StorageProviders/InMemory/InMemoryCompiler.js');
require('../project/jaydata_borzav/Types/StorageProviders/InMemory/InMemoryFunctionCompiler.js');

require('./stormcontext.js');

$test.context = new $test.Context({ name: 'storm' });
$test.context.onReady(function(db){
    db.Items
        //.include('Things')
        .filter(function(it){ return it.Key == 'ccc'; })
        .filter(function(it){ return it.Rank > 100; })
        /*.orderBy('it.Key')
        .orderBy('it.Id')
        .orderByDescending('it.Value')
        .map('it.Rank')*/
        .take(1)
        .toArray(function(data){
            data.forEach(function(it){
                console.log(it.initData);
                db.Items.attach(it);
                it.Value = 'updated4';
            });
            
            //db.Items.add(new $test.Item({ Key: 'abc', Value: 'cba', Rank: 199 }));
            
            db.saveChanges(function(cnt){
                console.log('saveChanges', cnt);
            });
        });
});
