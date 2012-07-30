require('mongodb');
var $data = require('jaydata');
require('../project/jaydata/Types/Access.js');
require('../project/jaydata/Types/ServiceOperation.js');
require('../project/jaydata/Types/StorageProviders/mongoDB/mongoDBStorageProvider.js');
require('../project/jaydata/Types/Query.js');
require('../project/jaydata/Types/EntitySet.js');
require('../project/jaydata/Types/EntityContext.js');
require('../project/jaydata/Types/ModelBinder.js');
//require('../project/jaydata/JayDataModules/deferred.js');

$data.Entity.extend('$test.Item', {
    Id: { type: 'string', computed: true, key: true },
    Key: { type: 'string' },
    Value: { type: 'string' },
    Rank: { type: 'int' }
});

$data.EntityContext.extend('$test.Context', {
    Items: { type: $data.EntitySet, elementType: $test.Item, roles: { anonymous: $data.Access.Create | $data.Access.Read | $data.Access.Execute }}/*,
        beforeCreate: function(data){
            return function(callback, data){
                console.log('beforeCreate', data, JSON.stringify(data));
                if (typeof callback !== 'undefined') callback();
                //return false;
            };
        },
        beforeRead: function(data){
            return function(callback, data){
                console.log('beforeRead', data.map(function(it){ return it.name; }));
                if (typeof callback !== 'undefined') callback();
                //return false;
            };
        },
        beforeUpdate: function(data){
            console.log('beforeUpdate', data, JSON.stringify(data));
            //return false;
        },
        beforeDelete: function(data){
            console.log('beforeDelete', data, JSON.stringify(data));
            //return false;
        },
        afterCreate: function(data){
            return function(callback, data){
                console.log('afterCreate', data, JSON.stringify(data));
                if (typeof callback !== 'undefined') callback();
            };
        },
        afterRead: function(data){
            return function(callback, data){
                console.log('afterRead', data, JSON.stringify(data));
                if (typeof callback !== 'undefined') callback();
            }
        },
        afterUpdate: function(data){
            console.log('afterUpdate', data, JSON.stringify(data));
        },
        afterDelete: function(data){
            console.log('afterDelete', data, JSON.stringify(data));
        }
    },
    callMe: (function(){}).webGet(),
    callMe: (function(){}).webInvoke(),
    callMe: (function(){}).method('GET'),
    callMe: function(){},
    Hello: (function(){
        return function(a, b, c, callback){
            setTimeout(function(){
                console.log('Hello Avan!', a, b, c);
                callback('ready');
            }, 1000);
        };
    }).returns($data.String)
        .after(function(){
            console.log('after execute', arguments);
        })
        .before(function(){
            return function(){
                var args = arguments;
                var callback = arguments[arguments.length - 1];
                console.log('before wait...');
                setTimeout(function(){
                    console.log('before execute', args);
                    callback();
                }, 1000);
            };
        })
        .after(function(){
            return function(){
                var args = arguments;
                var callback = arguments[arguments.length - 1];
                console.log('after wait...');
                setTimeout(function(){
                    console.log('after async', args);
                    callback();
                }, 2000);
            }
        })
        .authorize({ anonymous: $data.Access.Execute })*/
});

$test.context = new $test.Context({ name: 'mongoDB', databaseName: 'test', dbCreation: $data.storageProviders.mongoDB.DbCreationType.DropAllExistingCollections });
$test.context.onReady(function(){

    /*$test.context.user = { name: 'lazarv', roles: ['anonymous'] };
    $test.context.Hello(2, 3, 4);*/

    /*$data.Access.isAuthorized($data.Access.Execute, { name: 'lazarv', roles: { anonymous: $data.Access.Read }}, $test.context.Items.roles, {
        success: function(){ console.log('Authorized'); },
        error: function(){ console.log('Rejected!'); }
    });*/

    $test.context.Items.add(new $test.Item({ Key: 'aaa1', Value: 'bbb6', Rank: 1 }));
    $test.context.Items.add(new $test.Item({ Key: 'aaa2', Value: 'bbb7', Rank: 2 }));
    $test.context.Items.add(new $test.Item({ Key: 'bbb3', Value: 'bbb8', Rank: 3 }));
    $test.context.Items.add(new $test.Item({ Key: 'aaa4', Value: 'bbb9', Rank: 4 }));
    $test.context.Items.add(new $test.Item({ Key: 'aaa5', Value: 'bbb0', Rank: 5 }));
    $test.context.saveChanges({
        success: function(cnt){
            console.log('inserted items: ', cnt);
            $test.context.Items/*.map(function(it){ return { data: { k: it.Key, v: it.Value, c: 1 }}; })*/.toArray(function(data){
                if (data.length){
                    //console.log('data: ', data);
                    for (var i = 0; i < data.length; i++){
                        console.log(data[i].initData);
                        //$test.context.Items.remove(data[i]);
                    }
                    
                    $test.context.Items.attach(data[data.length - 1]);
                    data[data.length - 1].Value = 'updated';
                    
                    $test.context.Items.attach(data[data.length - 2]);
                    data[data.length - 2].Value = 'updated';
                    
                    //$test.context.Items.add(new $test.Item({ Key: 'ccc1', Value: 'ccc1', Rank: 1 }));
                    
                    $test.context.saveChanges(function(cnt){
                        console.log('saved items: ', cnt);
                        
                        $test.context.Items.forEach(function(data){
                            console.log(data.initData);
                        });
                    });
                    /*$test.context.Items.attach(data[i]);
                    data[i].Key += 'update';
                    data[i].Value += 'update';*/
                }else{
                    console.log('no data');
                }
            })/*.then(function(){
                console.log('deferred then');
            })*/;
        },
        error: function(err){
            console.log('oh, oh!', err.message);
        }
    });

});
