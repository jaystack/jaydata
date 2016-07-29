global.__jaydataModuleRoot = __dirname;
module.exports = require('./lib/Types/StorageProviders/IndexedDB/index.js');
delete global.__jaydataModuleRoot;