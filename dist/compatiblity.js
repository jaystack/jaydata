var Module = require('module');
var realResolve = Module._resolveFilename;
Module._resolveFilename = function fakeResolve(request, parent) {
    if (request === 'jaydata/core') {
        return require('path').join(__dirname, './lib/index.js');
    }
    return realResolve(request, parent);
};

(function(g){
    var $data = require('./lib/index');
    require('./lib/Types/StorageProviders/Facebook/index');
    require('./lib/Types/StorageProviders/IndexedDB/index');
    require('./lib/Types/StorageProviders/InMemory/index');
    require('./lib/Types/StorageProviders/mongoDB/index');    
    require('./lib/Types/StorageProviders/oData/index');
    require('./lib/Types/StorageProviders/SqLite/index');
    require('./lib/Types/StorageProviders/WebApi/index');
    require('./lib/Types/StorageProviders/YQL/index');
    
    $data.setModelContainer(g);
    g.Container = $data.Container;
    g.Guard = $data.Guard;
    g.$C = $data.$C;
    g.Exception = $data.Exception;
    g.MemberDefinition = $data.MemberDefinition;
    
    g.$data = $data;
    module.exports = $data;
})(global || window);