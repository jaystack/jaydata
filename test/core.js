var Module = require('module');
var realResolve = Module._resolveFilename;
Module._resolveFilename = function fakeResolve(request, parent) {
    if (request === 'jaydata/core') {
        return require('path').join(__dirname, '../src/index.js');
    }
    return realResolve(request, parent);
};